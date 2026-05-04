import { useNavigate, useSearchParams } from 'react-router';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import {
  useLmsCourse,
  useLmsCourses,
  useLmsQuizzes,
  useLmsModulesByCourse,
  useResolvedCourseIdFromLookup,
} from 'src/hooks/use-lms';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  patchLmsQuiz,
  postLmsCourse,
  patchLmsCourse,
  patchLmsModule,
  deleteLmsModule,
  getLmsQuizQuestions,
  postLmsQuizForModule,
  postLmsModuleForCourse,
  getLmsAxiosErrorMessage,
  postLmsStandaloneLesson,
  patchLmsStandaloneLesson,
  deleteLmsStandaloneLesson,
} from 'src/lib/lms-instructor-api';

import { toast } from 'src/components/snackbar';

import { styles } from './styles';
import { CourseFaqWorkspace } from '../../components/course-faq-workspace';
import { CourseNoticeWorkspace } from '../../components/course-notice-workspace';
import { CourseSettingsWorkspace } from '../../components/course-settings-workspace';
import { CurriculumBuilderTopBar } from '../../components/curriculum-builder-top-bar';
import { CurriculumBuilderSidebar } from '../../components/curriculum-builder-sidebar';
import { CurriculumBuilderWorkspace } from '../../components/curriculum-builder-workspace';
import { paragraphsToHtml, htmlToParagraphTexts } from '../../utils/course-marketing-html';
import { mapLmsModulesToCurriculumBuilder } from '../../utils/map-lms-modules-to-curriculum-builder';
import {
  curriculumBuilderCourse,
  curriculumNewLessonTitleByType,
} from '../../instructor-course-curriculum-data';
import { resolveCoreLessonMaterialResourcePublicId } from '../../utils/resolve-core-lesson-material-resource-public-id';

function addLessonToModuleState(prevModules, moduleId, lessonType) {
  const mod = prevModules.find((m) => m.id === moduleId);
  const existingDraft = mod?.lessons.find((l) => l.draft);

  if (existingDraft) {
    if (existingDraft.type === lessonType) {
      return { modules: prevModules, selectedLessonId: existingDraft.id };
    }
    const title =
      curriculumNewLessonTitleByType[lessonType] ?? curriculumNewLessonTitleByType.document;
    const modulesNext = prevModules.map((m) =>
      m.id !== moduleId
        ? m
        : {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === existingDraft.id ? { ...l, type: lessonType, title } : l
            ),
          }
    );
    return { modules: modulesNext, selectedLessonId: existingDraft.id };
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

/**
 * `courseLookup=null` → offline demo.
 * With API + `?new=1` → live authoring that creates `POST /api/courses` on first save/module.
 * With `?course=slug-or-id` → edit that catalog row.
 */
export function InstructorCourseCurriculumView({ courseLookup = null, isNewCourseIntent = false }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bootstrapCourseId, setBootstrapCourseId] = useState(null);
  const [creatingCourse, setCreatingCourse] = useState(false);

  const attemptedLiveCourse =
    typeof courseLookup === 'string' && courseLookup.trim() !== '';
  const apiEnabled = Boolean(CONFIG.serverUrl?.trim());
  const isLive =
    apiEnabled &&
    (attemptedLiveCourse || isNewCourseIntent || Boolean(bootstrapCourseId));
  const trimmedLookup = attemptedLiveCourse ? courseLookup.trim() : '';

  const resolvedId = useResolvedCourseIdFromLookup(isLive ? trimmedLookup : '');
  const effectiveCourseId = useMemo(
    () => (resolvedId || bootstrapCourseId || '').trim(),
    [resolvedId, bootstrapCourseId]
  );

  const { isLoading: coursesLoading, mutate: mutateCourses } = useLmsCourses(1, 500);
  const course = useLmsCourse(isLive && effectiveCourseId ? effectiveCourseId : '');
  const { modules: lmsModules, mutate: mutateLmsModules } = useLmsModulesByCourse(
    isLive && effectiveCourseId ? effectiveCourseId : null,
    { revalidateOnFocus: false }
  );
  const { quizzes: allQuizzes, mutate: mutateQuizzes } = useLmsQuizzes();

  const quizzesForCourse = useMemo(
    () =>
      isLive && effectiveCourseId
        ? allQuizzes.filter((q) => q.courseId === effectiveCourseId)
        : [],
    [allQuizzes, isLive, effectiveCourseId]
  );

  const ensureCourseCreated = useCallback(
    async (opts) => {
      const fromUrl = (resolvedId || '').trim();
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
        await mutateCourses();
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
    [resolvedId, bootstrapCourseId, mutateCourses, navigate, searchParams]
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
          await mutateQuizzes();
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
    [ensureCourseCreated, mutateQuizzes, mutateLmsModules]
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

  const handleAddDemoModule = useCallback(() => {
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
            title: curriculumNewLessonTitleByType.document,
            type: 'document',
            draft: true,
          },
        ],
      },
    ]);
    setExpandedDemo((prev) => ({ ...prev, [moduleId]: true }));
    setSelectedDemoLessonId(lessonId);
  }, []);

  const handleAddLiveModule = useCallback(async () => {
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
      const json = await postLmsModuleForCourse(courseId, {});
      const newModId = json?.data?.id;
      await mutateLmsModules();
      toast.success('Module added.');
      if (newModId && typeof newModId === 'string') {
        setExpandedLive((prev) => ({ ...prev, [newModId]: true }));
        setSelectedLiveLessonId(`${newModId}-core`);
      }
    } catch (e) {
      toast.error(getLmsAxiosErrorMessage(e, 'Could not add module.'));
    } finally {
      setAddingLiveModule(false);
    }
  }, [effectiveCourseId, ensureCourseCreated, mutateLmsModules]);

  const handleAddModule = useCallback(() => {
    if (isLive) {
      void handleAddLiveModule();
      return;
    }
    handleAddDemoModule();
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
        await patchLmsModule(modulePublicId, {
          title,
          subject: null,
          topic: null,
          lesson_meta: {
            ...prevMeta,
            ...(mergedCoreLabel !== '' ? { coreLessonTitle: mergedCoreLabel } : {}),
          },
        });
        await mutateLmsModules();
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
    [liveBuilderModules, liveLessonTitles, lmsModules, mutateLmsModules]
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
    [mutateLmsModules]
  );

  const handleDeleteLiveModule = useCallback(
    async (modulePublicId) => {
      if (
        !window.confirm(
          'Delete this module from the course? Quizzes attached to this module will be deleted.'
        )
      ) {
        return;
      }
      try {
        await deleteLmsModule(modulePublicId);
        setLiveLessonTitles((prev) => {
          const copy = { ...prev };
          delete copy[`${modulePublicId}-core`];
          return copy;
        });
        await mutateLmsModules();
        toast.success('Module deleted.');
      } catch (e) {
        toast.error(getLmsAxiosErrorMessage(e, 'Could not delete module.'));
      }
    },
    [mutateLmsModules]
  );

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
    const t = selectedLesson?.type;
    if (t !== 'document' && t !== 'video') {
      return null;
    }
    for (const m of lmsModules ?? []) {
      const rows = Array.isArray(m.standaloneLessons) ? m.standaloneLessons : [];
      const row = rows.find((r) => r.id === selectedLessonId && r.kind === t);
      if (row) {
        return { modulePublicId: m.id, row };
      }
    }
    return null;
  }, [isLive, lmsModules, selectedLesson?.type, selectedLessonId]);

  const liveLessonAuthoring = useMemo(() => {
    if (!isLive) {
      return null;
    }
    const t = selectedLesson?.type;
    if (t !== 'document' && t !== 'video') {
      return null;
    }

    if (liveStandaloneLesson) {
      const row = liveStandaloneLesson.row;
      const mod = lmsModules?.find((m) => m.id === liveStandaloneLesson.modulePublicId);
      return {
        authoringKind: t,
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

    const resourceRowIds = new Set(
      (Array.isArray(liveModuleRow.resourceRows) ? liveModuleRow.resourceRows : [])
        .map((r) => r?.id)
        .filter(Boolean)
        .map((id) => String(id).trim())
    );
    const rawResolved = resolveCoreLessonMaterialResourcePublicId(liveModuleRow, t);
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
      authoringKind: t,
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
    selectedLesson?.type,
  ]);

  const mergeReturnedModuleIntoLmsModulesCache = useCallback(
    (incomingModule) => {
      if (!incomingModule?.id || typeof mutateLmsModules !== 'function') {
        return;
      }
      void mutateLmsModules(
        (current) => {
          const envelope =
            current && typeof current === 'object' ? current : { data: [] };
          const list = Array.isArray(envelope.data) ? envelope.data : [];
          const idx = list.findIndex((m) => m.id === incomingModule.id);
          const next =
            idx === -1
              ? [...list, incomingModule]
              : list.map((m, i) => (i === idx ? incomingModule : m));
          return { ...envelope, data: next };
        },
        { revalidate: false }
      );
    },
    [mutateLmsModules]
  );

  const handleSaveLiveRichLesson = useCallback(
    async ({ title, durationLabel, shortDescriptionHtml, lessonContentHtml, lessonMeta }) => {
      const isVideoCore =
        selectedLesson?.type === 'video' && Boolean(liveModulePublicId) && !liveStandaloneLesson;

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
      selectedLesson?.type,
    ]
  );

  const saveLiveRichLesson =
    isLive &&
    (selectedLesson?.type === 'document' || selectedLesson?.type === 'video') &&
    (liveModulePublicId || liveStandaloneLesson)
      ? handleSaveLiveRichLesson
      : undefined;

  const liveQuizLoader =
    isLive && selectedLesson?.type === 'quiz'
      ? async (quizPublicId) => getLmsQuizQuestions(quizPublicId)
      : undefined;

  const saveLiveQuizLesson =
    isLive && selectedLesson?.type === 'quiz'
      ? async ({ quizId, title, questions }) => {
          await patchLmsQuiz(quizId, { title, questions });
          await mutateQuizzes();
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
          await patchLmsQuiz(quizId, { title, ...settings });
          await mutateQuizzes();
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
    await mutateCourses();
  }, [course?.id, ensureCourseCreated, faqItems, mutateCourses]);

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
    await mutateCourses();
  }, [course?.id, ensureCourseCreated, noticeHeading, noticeHtml, mutateCourses]);

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
    !coursesLoading &&
    !resolvedId &&
    !isNewCourseIntent &&
    !bootstrapCourseId
  ) {
    return (
      <DashboardContent maxWidth={false} sx={styles.content}>
        <Typography variant="body2">Course “{trimmedLookup}” was not found in the catalog.</Typography>
      </DashboardContent>
    );
  }

  if (isLive && effectiveCourseId && !course && coursesLoading) {
    return (
      <DashboardContent maxWidth={false} sx={styles.content}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (isLive && effectiveCourseId && !course && !coursesLoading) {
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
              onLessonMaterialsInvalidate={() => mutateLmsModules()}
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
                  onSaved={() => mutateCourses()}
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
    </DashboardContent>
  );
}
