import { useMemo, useCallback } from 'react';

import { useLmsQuizResults, useLmsLessonProgress } from 'src/hooks/use-lms';

import {
  mapLmsToStyledCourseDetail,
  isLessonLockedInCurriculum,
} from 'src/components/course-detail/map-lms-to-styled-shell';

import { useAuthContext } from 'src/auth/hooks';

/**
 * Full learner course-detail shell (progress-aware) plus `isLessonLocked` when
 * `course.marketing.lockLessonsInOrder` is enabled.
 */
export function useLmsCourseDetailShell(course, modules, quizzesForCourse, courseStats = null) {
  const courseId = course?.id ?? '';
  const { authenticated, loading: authLoading } = useAuthContext();
  const learnerProgressEnabled = Boolean(courseId) && authenticated && !authLoading;

  const { lessonProgressKeys } = useLmsLessonProgress(courseId, learnerProgressEnabled);
  const { results: quizResults } = useLmsQuizResults(learnerProgressEnabled);

  const shell = useMemo(
    () =>
      course
        ? mapLmsToStyledCourseDetail(
            course,
            modules ?? [],
            quizzesForCourse ?? [],
            quizResults,
            lessonProgressKeys,
            courseStats,
            { applyLessonLocks: learnerProgressEnabled }
          )
        : null,
    [course, modules, quizzesForCourse, quizResults, lessonProgressKeys, courseStats, learnerProgressEnabled]
  );

  const isLessonLocked = useCallback(
    (lessonId) => {
      if (!learnerProgressEnabled) {
        return false;
      }
      return Boolean(lessonId && shell && isLessonLockedInCurriculum(shell.curriculumModules, lessonId));
    },
    [shell, learnerProgressEnabled]
  );

  return { shell, lessonProgressKeys, quizResults, isLessonLocked };
}
