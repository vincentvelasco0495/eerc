import { paths } from 'src/routes/paths';

import { normalizeUserRole } from './role';

// ----------------------------------------------------------------------

/** Fallback when API has not returned `pagePermissions` (demo / offline). */
const FALLBACK_RULES = {
  admin: [
    { path: '/dashboard', matchType: 'exact', query: null },
    { path: '/course-curriculum', matchType: 'exact', query: { new: '1' } },
    { path: '/course-curriculum/*/edit', matchType: 'path_pattern', query: null },
    { path: '/course-curriculum', matchType: 'exact', query: null },
    { path: '/setting-program', matchType: 'prefix', query: null },
    { path: '/setting-instructor', matchType: 'prefix', query: null },
    { path: '/setting-student', matchType: 'prefix', query: null },
    { path: '/setting-profile', matchType: 'exact', query: null },
    { path: '/enrollment', matchType: 'prefix', query: null },
    { path: '/announcement', matchType: 'exact', query: null },
    { path: '/gradebook', matchType: 'exact', query: null },
    { path: '/assignment', matchType: 'exact', query: null },
    { path: '/admin', matchType: 'prefix', query: null },
    { path: '/quizzes/history', matchType: 'prefix', query: null },
    { path: '/quizzes', matchType: 'prefix', query: null },
  ],
  instructor: [
    { path: '/instructor-home', matchType: 'exact', query: null },
    { path: '/course-curriculum/*/edit', matchType: 'path_pattern', query: null },
    { path: '/setting-profile', matchType: 'exact', query: null },
    { path: '/enrollment', matchType: 'prefix', query: null },
    { path: '/announcement', matchType: 'exact', query: null },
    { path: '/gradebook', matchType: 'exact', query: null },
    { path: '/assignment', matchType: 'exact', query: null },
    { path: '/courses', matchType: 'prefix', query: null },
    { path: '/quizzes/history', matchType: 'prefix', query: null },
    { path: '/quizzes', matchType: 'prefix', query: null },
  ],
  student: [
    { path: '/enrolled-courses', matchType: 'exact', query: null },
    { path: '/available-programs', matchType: 'exact', query: null },
    { path: '/assignments', matchType: 'exact', query: null },
    { path: '/quizzes', matchType: 'prefix', query: null },
    { path: '/quizzes/history', matchType: 'prefix', query: null },
    { path: '/settings', matchType: 'exact', query: null },
    { path: '/course-details', matchType: 'prefix', query: null },
    { path: '/courses', matchType: 'prefix', query: null },
  ],
};

// ----------------------------------------------------------------------

function normalizePath(pathname) {
  const path = (pathname ?? '').trim();

  if (!path) {
    return '/';
  }

  const withSlash = path.startsWith('/') ? path : `/${path}`;

  return withSlash.replace(/\/$/, '') || '/';
}

function queryMatches(ruleQuery, queryParams) {
  if (!ruleQuery || Object.keys(ruleQuery).length === 0) {
    return true;
  }

  return Object.entries(ruleQuery).every(([key, expected]) => {
    const actual = queryParams?.[key];
    return String(actual ?? '') === String(expected);
  });
}

function patternToRegex(pattern) {
  const normalized = normalizePath(pattern);
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexBody = escaped.replace(/\\\*/g, '[^/]+');

  return new RegExp(`^${regexBody}$`);
}

function ruleMatches(rule, pathname, queryParams) {
  const path = normalizePath(pathname);
  const rulePath = normalizePath(rule.path);

  if (!queryMatches(rule.query, queryParams)) {
    return false;
  }

  const matchType = rule.matchType ?? 'exact';

  if (matchType === 'prefix') {
    return path === rulePath || path.startsWith(`${rulePath}/`);
  }

  if (matchType === 'path_pattern') {
    return patternToRegex(rulePath).test(path);
  }

  return path === rulePath;
}

export function getPagePermissionRules(user) {
  const fromApi = user?.pagePermissions;

  if (Array.isArray(fromApi) && fromApi.length > 0) {
    return fromApi;
  }

  return FALLBACK_RULES[normalizeUserRole(user?.role)] ?? [];
}

export function canAccessPage(user, pathname, queryParams = {}) {
  const rules = getPagePermissionRules(user);

  if (!rules.length) {
    return false;
  }

  return rules.some((rule) => ruleMatches(rule, pathname, queryParams));
}

export function canAccessPageHref(user, hrefOrPath) {
  if (!hrefOrPath || typeof hrefOrPath !== 'string') {
    return false;
  }

  try {
    const url = hrefOrPath.startsWith('http')
      ? new URL(hrefOrPath)
      : new URL(hrefOrPath, 'http://local');

    const query = Object.fromEntries(url.searchParams.entries());

    return canAccessPage(user, url.pathname, query);
  } catch {
    return canAccessPage(user, hrefOrPath, {});
  }
}

/** Default landing route per role (aligned with backend `PagePermissionService`). */
export function getRoleHomePath(role) {
  const normalized = normalizeUserRole(role);

  if (normalized === 'student') {
    return paths.dashboard.enrolledCourses;
  }

  if (normalized === 'admin') {
    return paths.dashboard.home;
  }

  if (normalized === 'instructor') {
    return paths.dashboard.instructorHome;
  }

  return paths.dashboard.enrolledCourses;
}

export function searchParamsToQuery(searchParams) {
  if (!searchParams) {
    return {};
  }

  if (typeof searchParams.entries === 'function') {
    return Object.fromEntries(searchParams.entries());
  }

  return { ...searchParams };
}
