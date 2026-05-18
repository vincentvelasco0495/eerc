import { getApprovedProgramIds } from 'src/features/student-profile/student-profile-data';

import { normalizeUserRole } from 'src/auth/utils/role';

// ----------------------------------------------------------------------

/** True when the signed-in learner may open lessons/quizzes for this course's program. */
export function learnerCanAccessCourseLessons({
  authenticated = false,
  role = '',
  programId = '',
  enrollments = [],
  course = null,
} = {}) {
  if (!authenticated) {
    return false;
  }

  const normalizedRole = normalizeUserRole(role);
  if (normalizedRole === 'admin' || normalizedRole === 'instructor') {
    return true;
  }

  if (typeof course?.canAccessLessons === 'boolean') {
    return course.canAccessLessons;
  }

  const resolvedProgramId =
    programId || (typeof course?.programId === 'string' ? course.programId : '');

  if (!resolvedProgramId) {
    return false;
  }

  return getApprovedProgramIds(enrollments, []).has(resolvedProgramId);
}

/** Logged-in learner without program approval — curriculum stays locked. */
export function learnerRequiresEnrollment(args) {
  return Boolean(args?.authenticated) && !learnerCanAccessCourseLessons(args);
}
