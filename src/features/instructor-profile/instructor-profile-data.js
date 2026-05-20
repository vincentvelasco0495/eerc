import { paths } from 'src/routes/paths';

import { getRoleHomePath, canAccessPageHref } from 'src/auth/utils/page-permissions';

// Sidebar navigation groups
const sidebarGroups = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        icon: 'solar:widget-5-bold-duotone',
        pathKey: 'home',
      },
      {
        label: 'Add Courses',
        icon: 'solar:add-circle-bold-duotone',
        path: paths.dashboard.newCourseCurriculum,
      },
    ],
  },
  {
    title: 'Enrollment',
    items: [
      {
        label: 'Enrollment',
        icon: 'solar:user-plus-bold-duotone',
        path: paths.dashboard.enrollment,
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Announcement',
        icon: 'solar:speaker-bold-duotone',
        path: paths.dashboard.announcement,
      },
      {
        label: 'Feedback',
        icon: 'solar:chat-round-dots-bold-duotone',
        path: paths.dashboard.feedback,
      },
    ],
  },
  {
    title: 'Progress',
    items: [
      {
        label: 'Gradebook',
        icon: 'solar:clipboard-check-bold-duotone',
        path: paths.dashboard.gradebook,
      },
      {
        label: 'Assignments',
        icon: 'solar:clipboard-list-bold-duotone',
        path: paths.dashboard.assignment,
        badge: '18',
      },
    ],
  },
  {
    title: 'Content Management',
    items: [
      {
        label: 'Homepage',
        icon: 'solar:home-2-bold-duotone',
        path: paths.dashboard.contentManagementHomepageV2,
      },
      {
        label: 'About Us',
        icon: 'solar:info-circle-bold-duotone',
        path: paths.dashboard.contentManagementAboutUs,
      },
      {
        label: 'Contact Us',
        icon: 'solar:mailbox-bold-duotone',
        path: paths.dashboard.contentManagementContactUs,
      },
    ],
  },
  {
    title: 'System Setting',
    items: [
      {
        label: 'Profile',
        icon: 'solar:settings-bold-duotone',
        path: paths.dashboard.settingProfile,
      },
      {
        label: 'Programs',
        icon: 'solar:layers-bold-duotone',
        path: paths.dashboard.settingProgram,
      },
      {
        label: 'Instructors',
        icon: 'solar:users-group-rounded-bold-duotone',
        path: paths.dashboard.settingInstructor,
      },
      {
        label: 'Students',
        icon: 'solar:user-rounded-bold-duotone',
        path: paths.dashboard.settingStudent,
      },
      { label: 'Log out', icon: 'solar:logout-3-bold-duotone', action: 'logout' },
    ],
  },
];

export function getInstructorWorkspaceNavGroups(pathname, role, user) {
  const homePath = getRoleHomePath(role);

  return sidebarGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          if (item.pathKey === 'home') {
            return { ...item, path: homePath };
          }
          return item;
        })
        .filter((item) => !item.path || canAccessPageHref(user ?? { role, pagePermissions: [] }, item.path))
        .map((item) => ({
          ...item,
          active: item.path
            ? pathname === item.path || pathname === `${item.path}/`
            : false,
        })),
    }))
    .filter((group) => group.items.length > 0);
}

/** First letter of the first two name parts, e.g. "Alex E. Rivera" -> "AE" (same as menu avatar). */
export function getInstructorNameInitials(displayName = '') {
  const initials = displayName
    .split(' ')
    .filter((part) => part.length)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'DI';
}

// Instructor identity defaults
export function buildInstructorProfileIdentity(user) {
  const displayName = user?.displayName || 'Demo Instructor';

  return {
    name: displayName,
    subtitle: null,
    initials: getInstructorNameInitials(displayName),
  };
}

const INSTRUCTOR_ANALYTICS_STAT_TEMPLATES = [
  { id: 'courses', label: 'Courses', icon: 'solar:book-bookmark-bold-duotone' },
  {
    id: 'enrollments',
    label: 'Enrollments',
    icon: 'solar:users-group-rounded-bold-duotone',
  },
  { id: 'students', label: 'Students', icon: 'solar:user-circle-bold-duotone' },
];

function formatInstructorStatValue(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return '—';
  }

  return new Intl.NumberFormat('en-US').format(n);
}

/** Map `GET /api/analytics` → instructor summary stat cards. */
export function buildInstructorAnalyticsStats(instructorSummary) {
  const summary = instructorSummary ?? {};

  return INSTRUCTOR_ANALYTICS_STAT_TEMPLATES.map((item) => ({
    ...item,
    value: formatInstructorStatValue(summary[item.id]),
  }));
}

/** @deprecated Use `buildInstructorAnalyticsStats` with API data. */
export const instructorAnalyticsStats = buildInstructorAnalyticsStats({
  courses: 0,
  enrollments: 0,
  students: 0,
});

export const instructorCourseFilters = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'In Draft' },
  { value: 'upcoming', label: 'Upcoming' },
];

/** Course grid data comes from `GET /api/courses` (see `InstructorProfileView`). */
