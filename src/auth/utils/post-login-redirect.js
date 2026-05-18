import { safeReturnUrl } from 'minimal-shared/utils';

import { paths, LEGACY_INSTRUCTOR_PROFILE_PATH } from 'src/routes/paths';

import { canAccessPageHref, getRoleHomePath } from './page-permissions';

// ----------------------------------------------------------------------

function pathnameOnly(hrefOrPath) {
  if (!hrefOrPath || typeof hrefOrPath !== 'string') {
    return '';
  }
  try {
    if (hrefOrPath.startsWith('http')) {
      return new URL(hrefOrPath).pathname;
    }
  } catch {
    // fall through
  }
  const raw = hrefOrPath.split('?')[0].split('#')[0];
  return raw.startsWith('/') ? raw : `/${raw}`;
}

/**
 * Default route after JWT sign-in / guest redirect when no `returnTo` is provided.
 */
export function getPostLoginRedirectPath(role) {
  return getRoleHomePath(role);
}

/**
 * Applies `returnTo` only when it matches the signed-in role's allowed surface.
 * Avoids sending instructors to `/enrolled-courses` (or students to `/dashboard`)
 * because AuthGuard previously stored the wrong `returnTo` in the query string.
 */
export function resolvePostLoginUrl(role, returnToParam, user) {
  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
  const isStudent = normalizedRole === 'student';
  const roleHome = getPostLoginRedirectPath(role);

  const candidate = safeReturnUrl(returnToParam, roleHome);
  const path = pathnameOnly(candidate);

  const studentRoot = pathnameOnly(paths.dashboard.enrolledCourses);
  const instructorRoot = pathnameOnly(paths.dashboard.home);
  const instructorHomeRoot = pathnameOnly(paths.dashboard.instructorHome);
  const legacyInstructorRoot = pathnameOnly(LEGACY_INSTRUCTOR_PROFILE_PATH);

  const underStudent =
    path === studentRoot || (studentRoot && path.startsWith(`${studentRoot}/`));
  const underInstructor =
    path === instructorRoot ||
    (instructorRoot && path.startsWith(`${instructorRoot}/`)) ||
    path === instructorHomeRoot ||
    (instructorHomeRoot && path.startsWith(`${instructorHomeRoot}/`)) ||
    path === legacyInstructorRoot ||
    (legacyInstructorRoot && path.startsWith(`${legacyInstructorRoot}/`));

  if (!isStudent && underStudent) {
    return roleHome;
  }
  if (isStudent && underInstructor) {
    return roleHome;
  }

  if (user && !canAccessPageHref(user, candidate)) {
    return roleHome;
  }

  return candidate;
}
