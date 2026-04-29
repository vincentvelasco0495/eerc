import { paths } from 'src/routes/paths';

// Sidebar navigation groups
const sidebarGroups = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        icon: 'solar:widget-5-bold-duotone',
        path: paths.dashboard.instructorProfile,
      },
      {
        label: 'Add Courses',
        icon: 'solar:add-circle-bold-duotone',
        path: paths.dashboard.instructorCourseCurriculum,
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        label: 'Announcement',
        icon: 'solar:speaker-bold-duotone',
        path: paths.dashboard.instructorAnnouncement,
      },
    ],
  },
  {
    title: 'Progress',
    items: [
      {
        label: 'Gradebook',
        icon: 'solar:clipboard-check-bold-duotone',
        path: paths.dashboard.instructorGradebook,
      },
      {
        label: 'Assignments',
        icon: 'solar:clipboard-list-bold-duotone',
        path: paths.dashboard.instructorAssignments,
        badge: '18',
      },
    ],
  },
  {
    title: 'Account and Settings',
    items: [
      {
        label: 'Settings',
        icon: 'solar:settings-bold-duotone',
        path: paths.dashboard.instructorSettings,
      },
      { label: 'Log out', icon: 'solar:logout-3-bold-duotone', action: 'logout' },
    ],
  },
];

export function getInstructorWorkspaceNavGroups(pathname) {
  return sidebarGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: item.path ? pathname === item.path : false,
    })),
  }));
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

// Summary metrics
export const instructorAnalyticsStats = [
  { id: 'revenue', label: 'Revenue', value: '$3,937.56', icon: 'solar:wallet-money-bold-duotone' },
  { id: 'orders', label: 'Orders', value: '30', icon: 'solar:cart-large-4-bold-duotone' },
  { id: 'courses', label: 'Courses', value: '14', icon: 'solar:book-bookmark-bold-duotone' },
  {
    id: 'enrollments',
    label: 'Enrollments',
    value: '189,240',
    icon: 'solar:users-group-rounded-bold-duotone',
  },
  { id: 'students', label: 'Students', value: '19,258', icon: 'solar:user-circle-bold-duotone' },
  { id: 'reviews', label: 'Reviews', value: '34', icon: 'solar:star-bold-duotone' },
  {
    id: 'certificates',
    label: 'Certificates created',
    value: '3',
    icon: 'solar:diploma-verified-bold-duotone',
  },
  { id: 'bundles', label: 'Bundles', value: '5', icon: 'solar:layers-bold-duotone' },
];

export const instructorReportingPeriods = ['All time', 'This month', 'This quarter', 'This year'];

export const instructorCourseFilters = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'In Draft' },
  { value: 'upcoming', label: 'Upcoming' },
];

// Managed courses
export const instructorCourses = [
  {
    id: 'course-ai-engineering',
    status: 'published',
    badge: 'Hot',
    badgeColor: 'error',
    category: 'Analysis of Algorithms',
    title: 'AI Engineering Essentials',
    lessons: 6,
    durationHours: 10,
    rating: 4.7,
    updatedAt: '2 months ago',
    tone: 'cobalt',
    icon: 'solar:cpu-bolt-bold-duotone',
  },
  {
    id: 'course-cyber-security',
    status: 'published',
    badge: 'Special',
    badgeColor: 'success',
    category: 'Software Development',
    title: 'Cyber Security Fundamentals',
    lessons: 3,
    durationHours: 20,
    rating: 4.5,
    updatedAt: '2 months ago',
    tone: 'stone',
    icon: 'solar:shield-keyhole-bold-duotone',
  },
  {
    id: 'course-seo',
    status: 'published',
    badge: 'New',
    badgeColor: 'success',
    category: 'Communication',
    title: 'SEO Fundamentals for Beginners',
    lessons: 4,
    durationHours: 20,
    rating: 4.0,
    updatedAt: '2 months ago',
    tone: 'sky',
    icon: 'solar:global-bold-duotone',
  },
  {
    id: 'course-content-strategy',
    status: 'draft',
    badge: 'Draft',
    badgeColor: 'warning',
    category: 'Marketing Systems',
    title: 'Content Strategy Workshop',
    lessons: 5,
    durationHours: 8,
    rating: 4.6,
    updatedAt: '1 month ago',
    tone: 'amber',
    icon: 'solar:notes-bold-duotone',
  },
  {
    id: 'course-live-cohort',
    status: 'upcoming',
    badge: 'Soon',
    badgeColor: 'info',
    category: 'Live Cohort',
    title: 'Instructor Cohort Launch Kit',
    lessons: 7,
    durationHours: 12,
    rating: 4.8,
    updatedAt: '6 days ago',
    tone: 'violet',
    icon: 'solar:play-stream-bold-duotone',
  },
  {
    id: 'course-course-design',
    status: 'published',
    badge: null,
    badgeColor: 'default',
    category: 'Course Production',
    title: 'Course Design Blueprint',
    lessons: 9,
    durationHours: 14,
    rating: 4.9,
    updatedAt: '3 weeks ago',
    tone: 'forest',
    icon: 'solar:clapperboard-edit-bold-duotone',
  },
];
