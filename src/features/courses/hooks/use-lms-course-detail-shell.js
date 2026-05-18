import { useMemo, useCallback } from 'react';

import { useEnrollment, useLmsQuizResults, useLmsLessonProgress } from 'src/hooks/use-lms';

import {
  learnerRequiresEnrollment,
  learnerCanAccessCourseLessons,
} from 'src/features/courses/utils/learner-course-access';

import {
  mapLmsToStyledCourseDetail,
  isLessonLockedInCurriculum,
} from 'src/components/course-detail/map-lms-to-styled-shell';

import { useAuthContext } from 'src/auth/hooks';

/**
 * Full learner course-detail shell (progress-aware) plus `isLessonLocked` when
 * `course.marketing.lockLessonsInOrder` is enabled or program enrollment is required.
 */
export function useLmsCourseDetailShell(course, modules, quizzesForCourse, courseStats = null) {
  const courseId = course?.id ?? '';
  const { authenticated, loading: authLoading, user } = useAuthContext();
  const enrollment = useEnrollment(authenticated && !authLoading);
  const learnerProgressEnabled = Boolean(courseId) && authenticated && !authLoading;

  const canAccessLessons = useMemo(
    () =>
      learnerCanAccessCourseLessons({
        authenticated,
        role: user?.role,
        programId: course?.programId,
        enrollments: enrollment,
        course,
      }),
    [authenticated, user?.role, course, enrollment]
  );

  const requiresEnrollment = useMemo(
    () =>
      learnerRequiresEnrollment({
        authenticated,
        role: user?.role,
        programId: course?.programId,
        enrollments: enrollment,
        course,
      }),
    [authenticated, user?.role, course, enrollment]
  );

  const { lessonProgressKeys } = useLmsLessonProgress(courseId, learnerProgressEnabled && canAccessLessons);
  const { results: quizResults } = useLmsQuizResults(learnerProgressEnabled && canAccessLessons);

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
            {
              applyLessonLocks: learnerProgressEnabled,
              requiresEnrollment,
            }
          )
        : null,
    [
      course,
      modules,
      quizzesForCourse,
      quizResults,
      lessonProgressKeys,
      courseStats,
      learnerProgressEnabled,
      requiresEnrollment,
    ]
  );

  const isLessonLocked = useCallback(
    (lessonId) => {
      if (requiresEnrollment) {
        return true;
      }
      if (!learnerProgressEnabled) {
        return false;
      }
      return Boolean(lessonId && shell && isLessonLockedInCurriculum(shell.curriculumModules, lessonId));
    },
    [shell, learnerProgressEnabled, requiresEnrollment]
  );

  return { shell, lessonProgressKeys, quizResults, isLessonLocked, requiresEnrollment, canAccessLessons };
}
