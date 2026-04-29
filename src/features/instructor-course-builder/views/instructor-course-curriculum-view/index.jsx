import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { styles } from './styles';
import { CurriculumBuilderTopBar } from '../../components/curriculum-builder-top-bar';
import { CurriculumBuilderSidebar } from '../../components/curriculum-builder-sidebar';
import { CurriculumBuilderWorkspace } from '../../components/curriculum-builder-workspace';
import {
  curriculumBuilderCourse,
  curriculumBuilderModules,
  curriculumNewLessonTitleByType,
} from '../../instructor-course-curriculum-data';

function cloneModules(mods) {
  return mods.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => ({ ...lesson })),
  }));
}

function addLessonToModuleState(prevModules, moduleId, lessonType) {
  const mod = prevModules.find((m) => m.id === moduleId);
  const existingDraft = mod?.lessons.find((l) => l.draft);

  if (existingDraft) {
    if (existingDraft.type === lessonType) {
      return { modules: prevModules, selectedLessonId: existingDraft.id };
    }
    const title =
      curriculumNewLessonTitleByType[lessonType] ?? curriculumNewLessonTitleByType.document;
    const modules = prevModules.map((m) =>
      m.id !== moduleId
        ? m
        : {
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === existingDraft.id ? { ...l, type: lessonType, title } : l
            ),
          }
    );
    return { modules, selectedLessonId: existingDraft.id };
  }

  const newLesson = {
    id: `lesson-${Date.now()}`,
    title: 'Untitled',
    type: lessonType,
    draft: true,
  };
  const modules = prevModules.map((m) =>
    m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
  );
  return { modules, selectedLessonId: newLesson.id };
}

export function InstructorCourseCurriculumView() {
  const theme = useTheme();
  const [courseTab, setCourseTab] = useState('curriculum');
  const [publishAnchor, setPublishAnchor] = useState(null);
  const [modules, setModules] = useState(() => cloneModules(curriculumBuilderModules));
  const [expandedModules, setExpandedModules] = useState(() =>
    Object.fromEntries(curriculumBuilderModules.map((m) => [m.id, true]))
  );
  const [selectedLessonId, setSelectedLessonId] = useState('lesson-mid-quiz');

  const handleClosePublish = () => setPublishAnchor(null);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const selectedLesson = useMemo(() => {
    for (const mod of modules) {
      const found = mod.lessons.find((l) => l.id === selectedLessonId);
      if (found) {
        return found;
      }
    }
    return null;
  }, [modules, selectedLessonId]);

  const handleLessonTitleChange = useCallback((lessonId, title) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, title } : l)),
      }))
    );
  }, []);

  const handleAddLesson = useCallback((moduleId, lessonType) => {
    let nextSelectedId;
    setModules((prev) => {
      const { modules: next, selectedLessonId: sid } = addLessonToModuleState(
        prev,
        moduleId,
        lessonType
      );
      nextSelectedId = sid;
      return next;
    });
    setSelectedLessonId(nextSelectedId);
    setExpandedModules((prev) => ({ ...prev, [moduleId]: true }));
  }, []);

  const handleLessonSave = useCallback((lessonId) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((l) => (l.id === lessonId ? { ...l, draft: false } : l)),
      }))
    );
  }, []);

  return (
    <DashboardContent maxWidth={false} sx={styles.content}>
      <Box sx={styles.shell(theme)}>
        <CurriculumBuilderTopBar
          backHref={paths.dashboard.instructorProfile}
          courseTitle={curriculumBuilderCourse.title}
          courseTab={courseTab}
          onCourseTabChange={setCourseTab}
          publishAnchor={publishAnchor}
          onOpenPublishMenu={(e) => setPublishAnchor(e.currentTarget)}
          onClosePublishMenu={handleClosePublish}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} sx={styles.body}>
          <CurriculumBuilderSidebar
            modules={modules}
            expandedByModuleId={expandedModules}
            onToggleModule={toggleModule}
            selectedLessonId={selectedLessonId}
            onSelectLesson={setSelectedLessonId}
            onAddLesson={handleAddLesson}
          />

          <CurriculumBuilderWorkspace
            lesson={selectedLesson}
            onLessonTitleChange={handleLessonTitleChange}
            onLessonSave={handleLessonSave}
          />
        </Stack>
      </Box>
    </DashboardContent>
  );
}
