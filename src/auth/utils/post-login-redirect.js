import { safeReturnUrl } from 'minimal-shared/utils';

import { paths } from 'src/routes/paths';

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
  if (typeof role === 'string' && role.trim().toLowerCase() === 'student') {
    return paths.dashboard.studentProfile;
  }
  return paths.dashboard.instructorProfile;
}

/**
 * Applies `returnTo` only when it matches the signed-in role's allowed surface.
 * Avoids sending instructors to `/student-profile` (or students to `/instructor-profile`)
 * because AuthGuard previously stored the wrong `returnTo` in the query string.
 */
export function resolvePostLoginUrl(role, returnToParam) {
  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
  const isStudent = normalizedRole === 'student';
  const roleHome = getPostLoginRedirectPath(role);

  const candidate = safeReturnUrl(returnToParam, roleHome);
  const path = pathnameOnly(candidate);

  const studentRoot = pathnameOnly(paths.dashboard.studentProfile);
  const instructorRoot = pathnameOnly(paths.dashboard.instructorProfile);

  const underStudent =
    path === studentRoot || (studentRoot && path.startsWith(`${studentRoot}/`));
  const underInstructor =
    path === instructorRoot || (instructorRoot && path.startsWith(`${instructorRoot}/`));

  if (!isStudent && underStudent) {
    return roleHome;
  }
  if (isStudent && underInstructor) {
    return roleHome;
  }

  return candidate;
}
