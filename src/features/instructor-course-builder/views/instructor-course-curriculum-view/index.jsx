import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import {
  useLmsActions,
  useLmsCourseByLookup,
  useLmsModulesByCourse,
  extractQuizzesFromModules,
} from 'src/hooks/use-lms';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import { lmsEndpoints } from 'src/redux/api/lmsEndpoints';
import { lmsResourceFetchSuccess } from 'src/app/store/modules/lms';
import { getLmsAxiosErrorMessage } from 'src/lib/lms-instructor-api';

import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { styles } from './styles';
import { CourseFaqWorkspace } from '../../components/course-faq-workspace';
import { CourseNoticeWorkspace } from '../../components/course-notice-workspace';
import { CourseSettingsWorkspace } from '../../components/course-settings-workspace';
import { CurriculumBuilderTopBar } from '../../components/curriculum-builder-top-bar';
import { CurriculumBuilderSidebar } from '../../components/curriculum-builder-sidebar';
import { patchLessonMaterialsInModulesList } from '../../utils/lesson-materials-cache';
import { CurriculumBuilderWorkspace } from '../../components/curriculum-builder-workspace';
import { paragraphsToHtml, htmlToParagraphTexts } from '../../utils/course-marketing-html';
import {
  curriculumBuilderCourse,
  curriculumNewLessonTitleByType,
} from '../../instructor-course-curriculum-data';
import { resolveCoreLessonMaterialResourcePublicId } from '../../utils/resolve-core-lesson-material-resource-public-id';
import {
  deriveLessonType,
  mapLmsModulesToCurriculumBuilder,
} from '../../utils/map-lms-modules-to-curriculum-builder';

function addLessonToModuleState(prevModules, moduleId, lessonType) {
  const mod = prevModules.find((m) => m.id === moduleId);
  const existingDraft = mod?.lessons.find((l) => l.draft);

  if (existingDraft) {
    if (existingDraft.type === lessonType) {
      return { modules: prevModules, selectedLessonId: existingDraft.id };
    }
    // Keep the in-progress draft as-is; add a separate row for the new lesson type.
  }

  const newLesson = {
    id: `lesson-${Date.now()}`,
    title: 'Untitled',
    type: lessonType,
    draft: true,
  };
  const modulesNext = prevModules.map((m) =>
    m.id !== moduleId ? m : { ...m, lessons: [...m.lessons, newLesson] }
  );
  return { modules: modulesNext, selectedLessonId: newLesson.id };
}

function lessonExistsInModules(lessonId, mods) {
  if (!lessonId || !mods?.length) {
    return false;
  }
  return mods.some((m) => m.lessons.some((l) => l.id === lessonId));
}

function reorderModuleList(modules, fromId, toId, edge = 'bottom') {
  const list = Array.isArray(modules) ? [...modules] : [];
  const fromIndex = list.findIndex((m) => m.id === fromId);
  const toIndex = list.findIndex((m) => m.id === toId);
  if (fromIndex === -1 || toIndex === -1) {
    return list;
  }
  const [moved] = list.splice(fromIndex, 1);
  const insertAtBase = list.findIndex((m) => m.id === toId);
  const insertAt = edge === 'top' ? insertAtBase : insertAtBase + 1;
  list.splice(Math.max(0, insertAt), 0, moved);
  return list;
}

/**
 * `courseLookup=null` → offline demo.
 * With API + `?new=1` → live authoring that creates `POST /api/courses` on first save/module.
 * With `?course=slug-or-id` → edit that catalog row.
 */
export function InstructorCourseCurriculumView({ courseLookup = null, isNewCourseIntent = false }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [bootstrapCourseId, setBootstrapCourseId] = useState(null);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const { runCommand } = useLmsActions();

  const attemptedLiveCourse =
    typeof courseLookup === 'string' && courseLookup.trim() !== '';
  const apiEnabled = Boolean(CONFIG.serverUrl?.trim());
  const isLive =
    apiEnabled &&
    (attemptedLiveCourse || isNewCourseIntent || Boolean(bootstrapCourseId));
  const trimmedLookup = attemptedLiveCourse ? courseLookup.trim() : '';
  const effectiveLookup = (trimmedLookup || bootstrapCourseId || '').trim();

  const {
    course,
    isLoading: courseLoading,
    mutate: mutateCourse,
  } = useLmsCourseByLookup(isLive ? effectiveLookup : '');
  const effectiveCourseId = useMemo(
    () => (course?.id || bootstrapCourseId || '').trim(),
    [bootstrapCourseId, course?.id]
  );
  const modulesCacheKey = useMemo(
    () => (effectiveCourseId ? lmsEndpoints.modulesByCourse(effectiveCourseId) : null),
    [effectiveCourseId]
  );
  const { modules: lmsModules, mutate: mutateLmsModules } = useLmsModulesByCourse(
    isLive && effectiveCourseId ? effectiveCourseId : null,
    { revalidateOnFocus: false }
  );

  const mergeReturnedModuleIntoLmsModulesCache = useCallback(
    (incomingModule) => {
      if (!incomingModule?.id || !modulesCacheKey) {
        return;
      }
      const list = Array.isArray(lmsModules) ? lmsModules : [];
      const idx = list.findIndex((m) => m.id === incomingModule.id);
      const next =
        idx === -1 ? [...list, incomingModule] : list.map((m, i) => (i === idx ? incomingModule : m));
      dispatch(
        lmsResourceFetchSuccess({
          key: modulesCacheKey,
          data: { data: next },
        })
      );
    },
    [dispatch, modulesCacheKey, lmsModules]
  );

  const patchLessonMaterialsInCache = useCallback(
    (patch) => {
      if (!modulesCacheKey || !patch?.modulePublicId) {
        return;
      }
      const list = Array.isArray(lmsModules) ? lmsModules : [];
      const next = patchLessonMaterialsInModulesList(list, patch);
      dispatch(
        lmsResourceFetchSuccess({
          key: modulesCacheKey,
          data: { data: next },
        })
      );
    },
    [dispatch, lmsModules, modulesCacheKey]
  );

  const handleLessonMaterialsChange = useCallback(
    (patch) => {
      if (!patch?.modulePublicId) {
        return;
      }
      patchLessonMaterialsInCache(patch);
    },
    [patchLessonMaterialsInCache]
  );

  const mergeReturnedQuizIntoLmsModulesCache = useCallback(
    (incomingQuiz) => {
      if (!incomingQuiz?.id || !incomingQuiz?.moduleId || !modulesCacheKey) {
        return;
      }
      const list = Array.isArray(lmsModules) ? lmsModules : [];
      const next = list.map((m) => {
        if (m.id !== incomingQuiz.moduleId) {
          return m;
        }
        const quizzes = Array.isArray(m.quizzes) ? m.quizzes : [];
        const qi = quizzes.findIndex((q) => q.id === incomingQuiz.id);
        const nextQuizzes =
          qi === -1
            ? [...quizzes, incomingQuiz]
            : quizzes.map((q, i) => (i === qi ? incomingQuiz : q));
        return { ...m, quizzes: nextQuizzes };
      });
      dispatch(
        lmsResourceFetchSuccess({
          key: modulesCacheKey,
          data: { data: next },
        })
      );
    },
    [dispatch, modulesCacheKey, lmsModules]
  );

  const quizzesForCourse = useMemo(
    () => (isLive && effectiveCourseId ? extractQuizzesFromModules(lmsModules) : []),
    [lmsModules, isLive, effectiveCourseId]
  );

  const postLmsCourse = useCallback(
    (payload) => runCommand('course.create', { body: payload }),
    [runCommand]
  );
  const patchLmsCourse = useCallback(
    (publicId, body) => runCommand('course.update', { publicId, body }),
    [runCommand]
  );
  const patchLmsModule = useCallback(
    (publicId, body) => runCommand('module.update', { publicId, body }),
    [runCommand]
  );
  const reorderLmsModules = useCallback(
    (coursePublicId, moduleIds) =>
      runCommand('module.reorder', { coursePublicId, body: { moduleIds } }),
    [runCommand]
  );
  const reorderLmsModuleLessons = useCallback(
    (modulePublicId, lessonIds) =>
      runCommand('module.lessons.reorder', { modulePublicId, body: { lessonIds } }),
    [runCommand]
  );
  const deleteLmsModule = useCallback(
    (publicId) => runCommand('module.delete', { publicId }),
    [runCommand]
  );
  const postLmsQuizForModule = useCallback(
    (modulePublicId, body) => runCommand('quiz.create', { modulePublicId, body }),
    [runCommand]
  );
  const postLmsModuleForCourse = useCallback(
    (coursePublicId, body) => runCommand('module.create', { coursePublicId, body }),
    [runCommand]
  );
  const postLmsStandaloneLesson = useCallback(
    (modulePublicId, body) => runCommand('standaloneLesson.create', { modulePublicId, body }),
    [runCommand]
  );
  const patchLmsStandaloneLesson = useCallback(
    (publicId, body) => runCommand('standaloneLesson.update', { publicId, body }),
    [runCommand]
  );
  const deleteLmsStandaloneLesson = useCallback(
    (publicId) => runCommand('standaloneLesson.delete', { publicId }),
    [runCommand]
  );
  const patchLmsQuiz = useCallback(
    (publicId, body) => runCommand('quiz.update', { publicId, body }),
    [runCommand]
  );
  const getLmsQuizQuestions = useCallback(
    (publicId) => runCommand('quiz.questions', { publicId }),
    [runCommand]
  );

  const ensureCourseCreated = useCallback(
    async (opts) => {
      const fromUrl = (course?.id || '').trim();
      if (fromUrl) {
        return fromUrl;
      }
      const fromState = (bootstrapCourseId || '').trim();
      if (fromState) {
        return fromState;
      }
      setCreatingCourse(true);
      try {
        const titleRaw = opts && typeof opts.title === 'string' ? opts.title.trim() : '';
        const programRaw = opts && typeof opts.programId === 'string' ? opts.programId.trim() : '';
        const json = await postLmsCourse({
          ...(titleRaw !== '' ? { title: titleRaw } : {}),
          ...(programRaw !== '' ? { programId: programRaw } : {}),
        });
        const newId = json?.data?.id;
        if (!newId || typeof newId !== 'string') {
          throw new Error('Invalid create response');
        }
        setBootstrapCourseId(newId);
        const next = new URLSearchParams(searchParams);
        next.delete('new');
        next.set('course', newId);
        navigate({ search: next.toString() }, { replace: true });
        return newId;
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Could not create course.'));
        throw e;
      } finally {
        setCreatingCourse(false);
      }
    },
    [course?.id, bootstrapCourseId, navigate, postLmsCourse, searchParams]
  );

  const liveBuilderModules = useMemo(
    () => mapLmsModulesToCurriculumBuilder(lmsModules, quizzesForCourse),
    [lmsModules, quizzesForCourse]
  );

  const [courseTab, setCourseTab] = useState('curriculum');
  const [publishAnchor, setPublishAnchor] = useState(null);

  const [faqItems, setFaqItems] = useState([]);
  const [noticeHeading, setNoticeHeading] = useState('');
  const [noticeHtml, setNoticeHtml] = useState('');

  /** Live LMS sidebar lesson title overlays (tracks header typing before save). */
  const [liveLessonTitles, setLiveLessonTitles] = useState({});
  /** Demo-local curriculum — start empty until the author adds modules (matches a fresh LMS course). */
  const [demoModules, setDemoModules] = useState(() => []);
  const [expandedDemo, setExpandedDemo] = useState(() => ({}));
  const [selectedDemoLessonId, setSelectedDemoLessonId] = useState(null);

  /** Live LMS curriculum ------------------------------------------------------------------- */
  const [expandedLive, setExpandedLive] = useState({});
  const [selectedLiveLessonId, setSelectedLiveLessonId] = useState(null);
  const [addingLiveModule, setAddingLiveModule] = useState(false);
  const [pendingDeleteModuleId, setPendingDeleteModuleId] = useState(null);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    if (!liveBuilderModules.length) {
      setSelectedLiveLessonId(null);
      return;
    }

    setExpandedLive((prev) => {
      const next = { ...prev };
      let changed = false;
      liveBuilderModules.forEach((m) => {
        if (!(m.id in next)) {
          next[m.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    setSelectedLiveLessonId((prev) => {
      if (lessonExistsInModules(prev, liveBuilderModules)) {
        return prev;
      }
      const firstLesson = liveBuilderModules[0]?.lessons?.[0];
      return firstLesson?.id ?? null;
    });
  }, [isLive, liveBuilderModules]);

  useEffect(() => {
    if (!isLive || !course) {
      return;
    }

    const rows = (course.marketing?.faq ?? []).map((row, i) => ({
      id: `faq-${course.id}-${i}`,
      question: row.question ?? '',
      answer: row.answer ?? '',
      expanded: i === 0,
    }));

    setFaqItems(
      rows.length ? rows : [{ id: `faq-new-${course.id}`, question: '', answer: '', expanded: true }]
    );
    setNoticeHeading(
      typeof course.marketing?.noticeHeading === 'string' ? course.marketing.noticeHeading : ''
    );
    setNoticeHtml(paragraphsToHtml(course.marketing?.notices ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate when course id resolves; avoids churn from catalog refetches updating `course` reference while editing.
  }, [course?.id, isLive]);

  const handleClosePublish = () => setPublishAnchor(null);

  const toggleModule = useCallback(
    (moduleId) => {
      if (isLive) {
        setExpandedLive((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
      } else {
        setExpandedDemo((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
      }
    },
    [isLive]
  );

  const baseDisplayModules = isLive ? liveBuilderModules : demoModules;

  const curatedDisplayModules = useMemo(() => {
    if (!isLive) {
      return baseDisplayModules;
    }
    return baseDisplayModules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((l) => {
        const overlay = liveLessonTitles[l.id];
        return overlay === undefined ? l : { ...l, title: overlay };
      }),
    }));
  }, [baseDisplayModules, isLive, liveLessonTitles]);

  const expandedByModuleId = isLive ? expandedLive : expandedDemo;

  const selectedLessonId = isLive ? selectedLiveLessonId : selectedDemoLessonId;
  const onSelectLesson = useCallback((id) => {
    if (isLive) {
      setSelectedLiveLessonId(id);
      return;
    }
    setSelectedDemoLessonId(id);
  }, [isLive]);

  const selectedLesson = useMemo(() => {
    for (const mod of curatedDisplayModules) {
      const found = mod.lessons.find((l) => l.id === selectedLessonId);
      if (found) {
        return found;
      }
    }
    return null;
  }, [curatedDisplayModules, selectedLessonId]);

  const handleLessonTitleChange = useCallback(
    (lessonId, title) => {
      if (isLive) {
        setLiveLessonTitles((prev) => ({
          ...prev,
          [lessonId]: title,
        }));
        return;
      }
      setDemoModules((prev) =>
        prev.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, title } : l)),
        }))
      );
    },
    [isLive]
  );

  const handleDemoAddLesson = useCallback((moduleId, lessonType) => {
    let nextSelectedId;
    setDemoModules((prev) => {
      const { modules: next, selectedLessonId: sid } = addLessonToModuleState(
        prev,
        moduleId,
        lessonType
      );
      nextSelectedId = sid;
      return next;
    });
    setSelectedDemoLessonId(nextSelectedId);
    setExpandedDemo((prev) => ({ ...prev, [moduleId]: true }));
  }, []);

  const handleLiveAddLesson = useCallback(
    async (modulePublicId, lessonType) => {
      try {
        await ensureCourseCreated();
      } catch {
        return;
      }

      if (lessonType === 'quiz') {
        try {
          const quizTitle =
            curriculumNewLessonTitleByType.quiz ?? curriculumNewLessonTitleByType.document;
          const json = await postLmsQuizForModule(modulePublicId, { title: quizTitle });
          const newQuizId = json?.data?.id;
          await mutateLmsModules();
          toast.success('Quiz lesson added.');
          if (newQuizId && typeof newQuizId === 'string') {
            setSelectedLiveLessonId(newQuizId);
            setExpandedLive((prev) => ({ ...prev, [modulePublicId]: true }));
          }
        } catch (e) {
          toast.error(getLmsAxiosErrorMessage(e, 'Could not add quiz.'));
        }
        return;
      }

      if (lessonType === 'assignment') {
        toast.warning('Assignments are not saved through the LMS API yet.');
        return;
      }

      const title =
        curriculumNewLessonTitleByType[lessonType] ??
        curriculumNewLessonTitleByType.document;

      try {
        const json = await postLmsStandaloneLesson(modulePublicId, {
          title,
          lesson_kind: lessonType,
        });
        const newLessonId = json?.data?.id;
        await mutateLmsModules();
        toast.success('Lesson added.');
        if (newLessonId && typeof newLessonId === 'string') {
          setExpandedLive((prev) => ({ ...prev, [modulePublicId]: true }));
          setSelectedLiveLessonId(newLessonId);
        }
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Could not add lesson.'));
      }
    },
    [ensureCourseCreated, mutateLmsModules, postLmsQuizForModule, postLmsStandaloneLesson]
  );

  const handleAddLesson = useCallback(
    (moduleId, lessonType) => {
      if (isLive) {
        void handleLiveAddLesson(moduleId, lessonType);
      } else {
        handleDemoAddLesson(moduleId, lessonType);
      }
    },
    [handleDemoAddLesson, handleLiveAddLesson, isLive]
  );

  const handleAddDemoModule = useCallback((moduleKind = 'document') => {
    const defaultType = moduleKind === 'video' ? 'video' : 'document';
    const ts = Date.now();
    const moduleId = `module-${ts}`;
    const lessonId = `lesson-${ts}`;
    setDemoModules((prev) => [
      ...prev,
      {
        id: moduleId,
        title: 'Untitled module',
        lessons: [
          {
            id: lessonId,
            title: curriculumNewLessonTitleByType[defaultType] ?? curriculumNewLessonTitleByType.document,
            type: defaultType,
            draft: true,
          },
        ],
      },
    ]);
    setExpandedDemo((prev) => ({ ...prev, [moduleId]: true }));
    setSelectedDemoLessonId(lessonId);
  }, []);

  const handleAddLiveModule = useCallback(async (moduleKind = 'document') => {
    const asVideoModule = moduleKind === 'video';
    let courseId = effectiveCourseId;
    if (!courseId) {
      try {
        courseId = await ensureCourseCreated();
      } catch {
        return;
      }
    }
    setAddingLiveModule(true);
    try {
      const json = await postLmsModuleForCourse(courseId, {
        streaming_only: asVideoModule,
      });
      const incoming = json?.data ?? null;
      const newModId = incoming?.id;
      if (incoming?.id) {
        mergeReturnedModuleIntoLmsModulesCache(incoming);
      } else {
        await mutateLmsModules();
      }
      toast.success(asVideoModule ? 'Video module added.' : 'Text module added.');
      if (newModId && typeof newModId === 'string') {
        setExpandedLive((prev) => ({ ...prev, [newModId]: true }));
        setSelectedLiveLessonId(`${newModId}-core`);
      }
    } catch (e) {
      toast.error(getLmsAxiosErrorMessage(e, 'Could not add module.'));
    } finally {
      setAddingLiveModule(false);
    }
  }, [
    effectiveCourseId,
    ensureCourseCreated,
    mergeReturnedModuleIntoLmsModulesCache,
    mutateLmsModules,
    postLmsModuleForCourse,
  ]);

  const handleAddModule = useCallback((moduleKind = 'document') => {
    if (isLive) {
      void handleAddLiveModule(moduleKind);
      return;
    }
    handleAddDemoModule(moduleKind);
  }, [handleAddDemoModule, handleAddLiveModule, isLive]);

  const handleRenameDemoModule = useCallback((moduleId, nextTitle) => {
    const title = String(nextTitle ?? '').trim() || 'Untitled module';
    setDemoModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, title } : m))
    );
  }, []);

  const handleRenameLiveModule = useCallback(
    async (modulePublicId, nextTitle) => {
      const title = String(nextTitle ?? '').trim() || 'Untitled module';
      const coreKey = `${modulePublicId}-core`;
      const modBefore = liveBuilderModules.find((m) => m.id === modulePublicId);
      const coreBefore = modBefore?.lessons?.find((l) => l.id === coreKey);
      const overlayBefore = liveLessonTitles[coreKey];
      const coreTitleToPreserve =
        overlayBefore !== undefined && overlayBefore !== null
          ? String(overlayBefore)
          : String(coreBefore?.title ?? '');

      const modApi = lmsModules.find((m) => m.id === modulePublicId);
      const prevMeta =
        modApi?.lessonMeta && typeof modApi.lessonMeta === 'object'
          ? { ...modApi.lessonMeta }
          : {};

      const mergedCoreLabel =
        coreTitleToPreserve.trim() ||
        (typeof prevMeta.coreLessonTitle === 'string' ? prevMeta.coreLessonTitle.trim() : '') ||
        String(coreBefore?.title ?? '').trim();

      try {
        const envelope = await patchLmsModule(modulePublicId, {
          title,
          subject: null,
          topic: null,
          lesson_meta: {
            ...prevMeta,
            ...(mergedCoreLabel !== '' ? { coreLessonTitle: mergedCoreLabel } : {}),
          },
        });
        const incoming = envelope?.data ?? null;
        if (incoming?.id) {
          mergeReturnedModuleIntoLmsModulesCache(incoming);
        } else {
          await mutateLmsModules();
        }
        setLiveLessonTitles((prev) => {
          const next = { ...prev };
          delete next[coreKey];
          return next;
        });
        toast.success('Module renamed.');
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Could not rename module.'));
      }
    },
    [
      liveBuilderModules,
      liveLessonTitles,
      lmsModules,
      mergeReturnedModuleIntoLmsModulesCache,
      mutateLmsModules,
      patchLmsModule,
    ]
  );

  const handleRenameModule = useCallback(
    (moduleId, nextTitle) => {
      if (isLive) {
        void handleRenameLiveModule(moduleId, nextTitle);
      } else {
        handleRenameDemoModule(moduleId, nextTitle);
      }
    },
    [handleRenameDemoModule, handleRenameLiveModule, isLive]
  );

  const handleReorderLiveModules = useCallback(
    async (fromModuleId, toModuleId, edge = 'bottom') => {
      if (!modulesCacheKey) {
        return;
      }
      const current = Array.isArray(lmsModules) ? lmsModules : [];
      const next = reorderModuleList(current, fromModuleId, toModuleId, edge);
      if (next.length === 0 || next.every((m, i) => m.id === current[i]?.id)) {
        return;
      }

      dispatch(
        lmsResourceFetchSuccess({
          key: modulesCacheKey,
          data: { data: next },
        })
      );

      try {
        const courseId = effectiveCourseId || course?.id;
        if (!courseId) {
          throw new Error('Missing course id for reorder');
        }
        const moduleIds = next.map((m) => m.id).filter(Boolean);
        const envelope = await reorderLmsModules(courseId, moduleIds);
        const rows = Array.isArray(envelope?.data) ? envelope.data : null;
        if (rows) {
          dispatch(
            lmsResourceFetchSuccess({
              key: modulesCacheKey,
              data: { data: rows },
            })
          );
        }
      } catch (e) {
        dispatch(
          lmsResourceFetchSuccess({
            key: modulesCacheKey,
            data: { data: current },
          })
        );
        toast.error(getLmsAxiosErrorMessage(e, 'Could not reorder modules.'));
      }
    },
    [course?.id, dispatch, effectiveCourseId, lmsModules, modulesCacheKey, reorderLmsModules]
  );

  const handleReorderLessons = useCallback(
    async (moduleId, orderedLessonIds) => {
      if (!moduleId || !Array.isArray(orderedLessonIds) || orderedLessonIds.length === 0) {
        return;
      }

      if (!isLive) {
        setDemoModules((prev) =>
          prev.map((m) => {
            if (m.id !== moduleId) return m;
            const byId = new Map(m.lessons.map((l) => [l.id, l]));
            const ordered = orderedLessonIds.map((id) => byId.get(id)).filter(Boolean);
            return { ...m, lessons: ordered.length > 0 ? ordered : m.lessons };
          })
        );
        return;
      }

      if (!modulesCacheKey) {
        return;
      }

      const current = Array.isArray(lmsModules) ? lmsModules : [];
      const moduleRow = current.find((m) => m.id === moduleId);
      if (!moduleRow) {
        return;
      }

      const lessonIds = orderedLessonIds.filter((id) => typeof id === 'string' && !id.endsWith('-core'));
      const rank = new Map(lessonIds.map((id, index) => [id, index + 1]));
      const big = 1_000_000;

      const nextModules = current.map((m) => {
        if (m.id !== moduleId) return m;
        const standalone = Array.isArray(m.standaloneLessons) ? [...m.standaloneLessons] : [];
        const quizzes = Array.isArray(m.quizzes) ? [...m.quizzes] : [];
        standalone.sort((a, b) => (rank.get(a.id) ?? big) - (rank.get(b.id) ?? big));
        quizzes.sort((a, b) => (rank.get(a.id) ?? big) - (rank.get(b.id) ?? big));
        return {
          ...m,
          standaloneLessons: standalone.map((row) => ({
            ...row,
            sortOrder: rank.get(row.id) ?? row.sortOrder ?? 0,
          })),
          quizzes: quizzes.map((q) => ({
            ...q,
            sortOrder: rank.get(q.id) ?? q.sortOrder ?? 0,
          })),
        };
      });

      dispatch(
        lmsResourceFetchSuccess({
          key: modulesCacheKey,
          data: { data: nextModules },
        })
      );

      try {
        const envelope = await reorderLmsModuleLessons(moduleId, lessonIds);
        const incoming = envelope?.data ?? null;
        if (incoming?.id) {
          const merged = nextModules.map((m) => (m.id === incoming.id ? incoming : m));
          dispatch(
            lmsResourceFetchSuccess({
              key: modulesCacheKey,
              data: { data: merged },
            })
          );
        }
      } catch (e) {
        dispatch(
          lmsResourceFetchSuccess({
            key: modulesCacheKey,
            data: { data: current },
          })
        );
        toast.error(getLmsAxiosErrorMessage(e, 'Could not reorder lessons.'));
      }
    },
    [
      dispatch,
      isLive,
      lmsModules,
      modulesCacheKey,
      reorderLmsModuleLessons,
    ]
  );

  const handleDeleteDemoModule = useCallback((moduleId) => {
    if (!window.confirm('Delete this module and all lessons inside it?')) {
      return;
    }

    setDemoModules((prev) => {
      const next = prev.filter((m) => m.id !== moduleId);
      setSelectedDemoLessonId((sid) => {
        if (lessonExistsInModules(sid, next)) {
          return sid;
        }
        return next[0]?.lessons?.[0]?.id ?? null;
      });
      return next;
    });
    setExpandedDemo((prev) => {
      const copy = { ...prev };
      delete copy[moduleId];
      return copy;
    });
  }, []);

  const handleDemoDeleteLessonByModule = useCallback((moduleId, lesson) => {
    if (!lesson?.id) {
      return;
    }
    if (!window.confirm('Remove this lesson from the module?')) {
      return;
    }

    setDemoModules((prev) => {
      const next = prev
        .map((m) =>
          m.id !== moduleId ? m : { ...m, lessons: m.lessons.filter((l) => l.id !== lesson.id) }
        )
        .filter((m) => m.lessons.length > 0);
      setSelectedDemoLessonId((sid) => {
        if (lessonExistsInModules(sid, next)) {
          return sid;
        }
        return next[0]?.lessons?.[0]?.id ?? null;
      });
      return next;
    });
  }, []);

  const handleDeleteStandaloneLesson = useCallback(
    async (modulePublicId, lessonPublicId) => {
      if (!lessonPublicId || typeof lessonPublicId !== 'string') {
        return;
      }
      if (!window.confirm('Remove this lesson from the module?')) {
        return;
      }
      try {
        await deleteLmsStandaloneLesson(lessonPublicId);
        setLiveLessonTitles((prev) => {
          const next = { ...prev };
          delete next[lessonPublicId];
          return next;
        });
        await mutateLmsModules();
        setSelectedLiveLessonId((sid) =>
          sid === lessonPublicId ? `${modulePublicId}-core` : sid
        );
        toast.success('Lesson removed.');
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Could not remove lesson.'));
      }
    },
    [deleteLmsStandaloneLesson, mutateLmsModules]
  );

  const handleDeleteLiveModule = useCallback(
    async (modulePublicId) => {
      if (!modulePublicId || typeof modulePublicId !== 'string') {
        return;
      }
      setPendingDeleteModuleId(modulePublicId);
    },
    []
  );

  const handleConfirmDeleteLiveModule = useCallback(async () => {
    const modulePublicId = pendingDeleteModuleId;
    if (!modulePublicId || typeof modulePublicId !== 'string') {
      setPendingDeleteModuleId(null);
      return;
    }
    try {
      await deleteLmsModule(modulePublicId);
      setLiveLessonTitles((prev) => {
        const copy = { ...prev };
        delete copy[`${modulePublicId}-core`];
        return copy;
      });
      if (modulesCacheKey) {
        const current = Array.isArray(lmsModules) ? lmsModules : [];
        const next = current.filter((m) => m.id !== modulePublicId);
        dispatch(
          lmsResourceFetchSuccess({
            key: modulesCacheKey,
            data: { data: next },
          })
        );
        setExpandedLive((prev) => {
          const copy = { ...prev };
          delete copy[modulePublicId];
          return copy;
        });
        setSelectedLiveLessonId((sid) => {
          if (!sid || !sid.startsWith(`${modulePublicId}`)) {
            return sid;
          }
          return next[0]?.id ? `${next[0].id}-core` : null;
        });
      } else {
        await mutateLmsModules();
      }
      toast.success('Module deleted.');
      setPendingDeleteModuleId(null);
    } catch (e) {
      toast.error(getLmsAxiosErrorMessage(e, 'Could not delete module.'));
    }
  }, [deleteLmsModule, dispatch, lmsModules, modulesCacheKey, mutateLmsModules, pendingDeleteModuleId]);

  const handleDeleteLessonOrModuleLesson = useCallback(
    (moduleId, lesson) => {
      if (isLive) {
        const lid = lesson?.id;
        if (!lid || typeof lid !== 'string') {
          return;
        }
        if (lid.endsWith('-core')) {
          void handleDeleteLiveModule(moduleId);
          return;
        }
        if (lesson.type === 'quiz') {
          return;
        }
        void handleDeleteStandaloneLesson(moduleId, lid);
        return;
      }
      handleDemoDeleteLessonByModule(moduleId, lesson);
    },
    [
      handleDeleteLiveModule,
      handleDeleteStandaloneLesson,
      handleDemoDeleteLessonByModule,
      isLive,
    ]
  );

  const handleLessonSave = useCallback((lessonId) => {
    setDemoModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, draft: false } : l)),
      }))
    );
  }, []);

  const liveModulePublicId =
    isLive &&
    typeof selectedLessonId === 'string' &&
    selectedLessonId.endsWith('-core')
      ? selectedLessonId.replace(/-core$/, '')
      : null;

  const liveModuleRow = useMemo(
    () => (liveModulePublicId ? lmsModules.find((m) => m.id === liveModulePublicId) : null),
    [lmsModules, liveModulePublicId]
  );

  const liveStandaloneLesson = useMemo(() => {
    if (
      !isLive ||
      typeof selectedLessonId !== 'string' ||
      selectedLessonId.endsWith('-core')
    ) {
      return null;
    }
    for (const m of lmsModules ?? []) {
      const rows = Array.isArray(m.standaloneLessons) ? m.standaloneLessons : [];
      const row = rows.find((r) => r.id === selectedLessonId);
      if (row && (row.kind === 'document' || row.kind === 'video')) {
        return { modulePublicId: m.id, row };
      }
    }
    return null;
  }, [isLive, lmsModules, selectedLessonId]);

  const liveLessonAuthoring = useMemo(() => {
    if (!isLive) {
      return null;
    }

    if (liveStandaloneLesson) {
      const row = liveStandaloneLesson.row;
      const mod = lmsModules?.find((m) => m.id === liveStandaloneLesson.modulePublicId);
      const standaloneKind = row.kind === 'video' ? 'video' : 'document';
      return {
        authoringKind: standaloneKind,
        updatedAt: row.updatedAt ?? '',
        excerptHtml: row.excerptHtml ?? '',
        bodyHtml: row.bodyHtml ?? row.summary ?? '',
        duration: mod?.duration ?? '',
        lessonMeta: row.lessonMeta && typeof row.lessonMeta === 'object' ? row.lessonMeta : {},
        lessonMaterials: Array.isArray(row.lessonMaterials) ? row.lessonMaterials : [],
        modulePublicId: liveStandaloneLesson.modulePublicId,
        standaloneLessonPublicId: row.id,
        isCoreLesson: false,
        streamingOnly: false,
      };
    }

    if (!liveModuleRow) {
      return null;
    }

    const coreDerived = deriveLessonType(liveModuleRow);
    const coreKind = coreDerived === 'video' ? 'video' : 'document';

    const resourceRowIds = new Set(
      (Array.isArray(liveModuleRow.resourceRows) ? liveModuleRow.resourceRows : [])
        .map((r) => r?.id)
        .filter(Boolean)
        .map((id) => String(id).trim())
    );
    const rawResolved = resolveCoreLessonMaterialResourcePublicId(liveModuleRow, coreKind);
    const trimmedResolved =
      rawResolved != null && String(rawResolved).trim() !== '' ? String(rawResolved).trim() : '';
    const moduleLessonResourcePublicId =
      trimmedResolved !== '' && resourceRowIds.has(trimmedResolved) ? trimmedResolved : null;
    const rawModuleMaterials = Array.isArray(liveModuleRow.lessonMaterials)
      ? liveModuleRow.lessonMaterials
      : [];
    const lessonMaterials =
      moduleLessonResourcePublicId != null && String(moduleLessonResourcePublicId).trim() !== ''
        ? rawModuleMaterials.filter(
            (m) =>
              !m?.moduleResourceId ||
              String(m.moduleResourceId) === String(moduleLessonResourcePublicId)
          )
        : rawModuleMaterials;

    return {
      authoringKind: coreKind,
      updatedAt: liveModuleRow.updatedAt ?? '',
      excerptHtml: liveModuleRow.excerptHtml ?? '',
      bodyHtml: liveModuleRow.bodyHtml ?? liveModuleRow.summary ?? '',
      duration: typeof liveModuleRow.duration === 'string' ? liveModuleRow.duration : '',
      lessonMeta:
        liveModuleRow.lessonMeta && typeof liveModuleRow.lessonMeta === 'object'
          ? liveModuleRow.lessonMeta
          : {},
      lessonMaterials,
      modulePublicId: liveModulePublicId,
      moduleLessonResourcePublicId,
      standaloneLessonPublicId: null,
      isCoreLesson: true,
      streamingOnly: Boolean(liveModuleRow.streamingOnly),
    };
  }, [
    isLive,
    liveModulePublicId,
    liveModuleRow,
    liveStandaloneLesson,
    lmsModules,
  ]);

  const handleSaveLiveRichLesson = useCallback(
    async ({ title, durationLabel, shortDescriptionHtml, lessonContentHtml, lessonMeta }) => {
      const isVideoCore =
        Boolean(liveLessonAuthoring?.isCoreLesson) &&
        liveLessonAuthoring?.authoringKind === 'video' &&
        Boolean(liveModulePublicId) &&
        !liveStandaloneLesson;

      let patchEnvelope = null;
      if (liveStandaloneLesson) {
        const standaloneId = liveStandaloneLesson.row.id;
        patchEnvelope = await patchLmsStandaloneLesson(standaloneId, {
          title: title.trim(),
          excerpt_html: shortDescriptionHtml ?? '',
          body_html: lessonContentHtml ?? '',
          lesson_meta: lessonMeta ?? null,
        });
      } else if (liveModulePublicId) {
        const modRow = lmsModules?.find((m) => m.id === liveModulePublicId);
        const baseMeta =
          modRow?.lessonMeta && typeof modRow.lessonMeta === 'object' ? { ...modRow.lessonMeta } : {};
        const mergedMeta = {
          ...baseMeta,
          ...(lessonMeta && typeof lessonMeta === 'object' ? lessonMeta : {}),
          coreLessonTitle: title.trim(),
        };
        const dl = typeof durationLabel === 'string' ? durationLabel.trim() : '';
        patchEnvelope = await patchLmsModule(liveModulePublicId, {
          duration_label: dl === '' ? null : dl,
          excerpt_html: shortDescriptionHtml ?? '',
          body_html: lessonContentHtml ?? '',
          lesson_meta: mergedMeta,
          ...(isVideoCore ? { streaming_only: true } : {}),
        });
      } else {
        return;
      }

      const incoming = patchEnvelope?.data ?? null;
      if (incoming?.id) {
        mergeReturnedModuleIntoLmsModulesCache(incoming);
      }

      setLiveLessonTitles((prev) => {
        const next = { ...prev };
        if (liveStandaloneLesson) {
          delete next[liveStandaloneLesson.row.id];
        } else if (liveModulePublicId) {
          delete next[`${liveModulePublicId}-core`];
        }
        return next;
      });
    },
    [
      liveModulePublicId,
      liveStandaloneLesson,
      lmsModules,
      mergeReturnedModuleIntoLmsModulesCache,
      patchLmsModule,
      liveLessonAuthoring?.authoringKind,
      liveLessonAuthoring?.isCoreLesson,
      patchLmsStandaloneLesson,
    ]
  );

  const saveLiveRichLesson =
    isLive &&
    (selectedLesson?.type === 'document' || selectedLesson?.type === 'video') &&
    (liveModulePublicId || liveStandaloneLesson)
      ? handleSaveLiveRichLesson
      : undefined;

  // Stable reference — inline async broke CurriculumQuizLessonWorkspace `useEffect` deps and refetched
  // GET /quizzes/:id/questions on every parent re-render (e.g. after save merges Redux modules).
  const liveQuizLoader = useMemo(() => {
    if (!isLive || selectedLesson?.type !== 'quiz') {
      return undefined;
    }
    return async (quizPublicId) => getLmsQuizQuestions(quizPublicId);
  }, [isLive, selectedLesson?.type, getLmsQuizQuestions]);

  const saveLiveQuizLesson =
    isLive && selectedLesson?.type === 'quiz'
      ? async ({ quizId, title, questions }) => {
          const envelope = await patchLmsQuiz(quizId, { title, questions });
          const incoming = envelope?.data ?? null;
          if (incoming?.id && incoming?.moduleId) {
            mergeReturnedQuizIntoLmsModulesCache(incoming);
          } else {
            await mutateLmsModules();
          }
        }
      : undefined;

  const liveQuizAuthoring = useMemo(() => {
    if (!isLive || selectedLesson?.type !== 'quiz') {
      return null;
    }
    return quizzesForCourse.find((q) => q.id === selectedLesson.id) ?? null;
  }, [isLive, selectedLesson?.type, selectedLesson?.id, quizzesForCourse]);

  const saveLiveQuizSettings =
    isLive && selectedLesson?.type === 'quiz'
      ? async ({ quizId, title, ...settings }) => {
          const envelope = await patchLmsQuiz(quizId, { title, ...settings });
          const incoming = envelope?.data ?? null;
          if (incoming?.id && incoming?.moduleId) {
            mergeReturnedQuizIntoLmsModulesCache(incoming);
          } else {
            await mutateLmsModules();
          }
        }
      : undefined;

  const persistFaq = useCallback(async () => {
    let courseId = course?.id;
    if (!courseId) {
      try {
        courseId = await ensureCourseCreated();
      } catch {
        return;
      }
    }
    await patchLmsCourse(courseId, {
      marketing: {
        faq: faqItems.map((row) => ({
          question: String(row.question ?? '').trim(),
          answer: String(row.answer ?? '').trim(),
        })),
      },
    });
    toast.success('FAQ saved.');
    await mutateCourse();
  }, [course?.id, ensureCourseCreated, faqItems, mutateCourse, patchLmsCourse]);

  const persistNotice = useCallback(async () => {
    let courseId = course?.id;
    if (!courseId) {
      try {
        courseId = await ensureCourseCreated();
      } catch {
        return;
      }
    }
    await patchLmsCourse(courseId, {
      marketing: {
        notices: htmlToParagraphTexts(noticeHtml),
        noticeHeading: noticeHeading.trim(),
      },
    });
    toast.success('Notice saved.');
    await mutateCourse();
  }, [course?.id, ensureCourseCreated, noticeHeading, noticeHtml, mutateCourse, patchLmsCourse]);

  const previewHref =
    isLive && course?.slug ? paths.dashboard.courseDetails(course.slug) : paths.courseDetailDemo;

  if (attemptedLiveCourse && !apiEnabled) {
    return (
      <DashboardContent maxWidth={false} sx={styles.content}>
        <Typography variant="body2">
          Course editing requires the Laravel LMS API. Set <code>VITE_SERVER_URL</code> in your
          frontend env and restart the dev server so this page can load and save real course data.
        </Typography>
      </DashboardContent>
    );
  }

  if (
    isLive &&
    trimmedLookup &&
    !courseLoading &&
    !course?.id &&
    !isNewCourseIntent &&
    !bootstrapCourseId
  ) {
    return (
      <DashboardContent maxWidth={false} sx={styles.content}>
        <Typography variant="body2">Course “{trimmedLookup}” was not found in the catalog.</Typography>
      </DashboardContent>
    );
  }

  if (isLive && effectiveCourseId && !course && courseLoading) {
    return (
      <DashboardContent maxWidth={false} sx={styles.content}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (isLive && effectiveCourseId && !course && !courseLoading) {
    return (
      <DashboardContent maxWidth={false} sx={styles.content}>
        <Typography variant="body2">Unable to load this course.</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={styles.content}>
      <Box sx={styles.shell(theme)}>
        <CurriculumBuilderTopBar
          backHref={paths.dashboard.instructorProfile}
          courseTitle={isLive && course?.title ? course.title : curriculumBuilderCourse.title}
          courseTab={courseTab}
          onCourseTabChange={setCourseTab}
          publishAnchor={publishAnchor}
          onOpenPublishMenu={(e) => setPublishAnchor(e.currentTarget)}
          onClosePublishMenu={handleClosePublish}
          viewHref={previewHref}
        />

        {courseTab === 'curriculum' ? (
          <Stack direction={{ xs: 'column', md: 'row' }} sx={styles.body}>
            <CurriculumBuilderSidebar
              modules={curatedDisplayModules}
              expandedByModuleId={expandedByModuleId}
              onToggleModule={toggleModule}
              selectedLessonId={selectedLessonId}
              onSelectLesson={onSelectLesson}
              onAddLesson={handleAddLesson}
              onReorderModules={isLive ? handleReorderLiveModules : undefined}
              onReorderLessons={handleReorderLessons}
              onAddModule={handleAddModule}
              disableAddModule={Boolean(
                isLive && (addingLiveModule || creatingCourse)
              )}
              onDeleteModule={isLive ? handleDeleteLiveModule : handleDeleteDemoModule}
              onRenameModule={handleRenameModule}
              onDeleteLesson={handleDeleteLessonOrModuleLesson}
              liveMode={isLive}
            />

            <CurriculumBuilderWorkspace
              lesson={selectedLesson}
              onLessonTitleChange={handleLessonTitleChange}
              onLessonSave={handleLessonSave}
              saveLiveRichLesson={saveLiveRichLesson}
              liveLessonAuthoring={liveLessonAuthoring}
              liveQuizLoader={liveQuizLoader}
              saveLiveQuizLesson={saveLiveQuizLesson}
              liveQuizAuthoring={liveQuizAuthoring}
              saveLiveQuizSettings={saveLiveQuizSettings}
              onLessonMaterialsChange={handleLessonMaterialsChange}
            />
          </Stack>
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'grey.50',
            }}
          >
            {courseTab === 'settings' ? (
              isLive ? (
                <CourseSettingsWorkspace
                  tiedCourse={course ?? null}
                  onEnsureCourse={!course?.id ? ensureCourseCreated : undefined}
                  onSaved={() => mutateCourse()}
                />
              ) : (
                <CourseSettingsWorkspace />
              )
            ) : courseTab === 'faq' ? (
              isLive ? (
                <CourseFaqWorkspace
                  items={faqItems}
                  onItemsChange={setFaqItems}
                  onPersist={persistFaq}
                />
              ) : (
                <CourseFaqWorkspace />
              )
            ) : courseTab === 'notice' ? (
              isLive ? (
                <CourseNoticeWorkspace
                  persisted
                  noticeHeading={noticeHeading}
                  onNoticeHeadingChange={setNoticeHeading}
                  noticeHtml={noticeHtml}
                  onNoticeHtmlChange={setNoticeHtml}
                  onPersist={persistNotice}
                />
              ) : (
                <CourseNoticeWorkspace />
              )
            ) : null}
          </Box>
        )}
      </Box>
      <ConfirmDialog
        open={Boolean(pendingDeleteModuleId)}
        onClose={() => setPendingDeleteModuleId(null)}
        title="Delete module?"
        content="Delete this module from the course? Quizzes attached to this module will be deleted."
        action={
          <Button color="error" variant="contained" onClick={handleConfirmDeleteLiveModule}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
