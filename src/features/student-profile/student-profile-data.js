import { paths } from 'src/routes/paths';

const DEFAULT_STARTED_AT = 'April 24, 2026';

export function getStudentWorkspaceNavGroups(pathname) {
  return [
    {
      title: 'Main',
      items: [
        {
          label: 'Enrolled Courses',
          icon: 'solar:book-bookmark-bold-duotone',
          path: paths.dashboard.studentProfile,
          active: pathname === paths.dashboard.studentProfile,
        },
        {
          label: 'My Assignments',
          icon: 'solar:clipboard-list-bold-duotone',
          path: paths.dashboard.studentAssignments,
          active: pathname === paths.dashboard.studentAssignments,
        },
        {
          label: 'Enrolled Quizzes',
          icon: 'solar:document-text-bold-duotone',
          path: paths.dashboard.quizzes.root,
          active: pathname === paths.dashboard.quizzes.root,
        },
      ],
    },
    {
      title: 'Account and Settings',
      items: [
        {
          label: 'Settings',
          icon: 'solar:settings-bold-duotone',
          path: paths.dashboard.studentSettings,
          active: pathname === paths.dashboard.studentSettings,
        },
        { label: 'Log out', icon: 'solar:logout-3-bold-duotone', action: 'logout' },
      ],
    },
  ];
}

const supplementalCourseTemplates = [
  {
    id: 'supplemental-structural-drill',
    courseId: 'course-ce-review',
    category: 'Continuing Education',
    title: 'Structural Design Drill Pack',
    lessons: 6,
    durationHours: 11,
    rating: 4.3,
    status: 'in-progress',
    startedAt: 'April 18, 2026',
    variant: 'cobalt',
  },
  {
    id: 'supplemental-code-clinic',
    courseId: 'course-plumbing-mastery',
    category: 'Master Plumbing',
    title: 'Code Compliance Clinic',
    lessons: 5,
    durationHours: 8,
    rating: 4.8,
    status: 'completed',
    startedAt: 'April 15, 2026',
    variant: 'linen',
  },
  {
    id: 'supplemental-metallurgy-lab',
    courseId: 'course-materials-intensive',
    category: 'Materials Engineering',
    title: 'Metallurgy Failure Analysis Lab',
    lessons: 6,
    durationHours: 10,
    rating: 3.9,
    status: 'failed',
    startedAt: 'April 12, 2026',
    variant: 'slate',
    badge: 'Needs Review',
  },
  {
    id: 'supplemental-hydraulics-workshop',
    courseId: 'course-ce-review',
    category: 'Continuing Education',
    title: 'Hydraulics Formula Workshop',
    lessons: 4,
    durationHours: 6,
    rating: 4.6,
    status: 'in-progress',
    startedAt: 'April 11, 2026',
    variant: 'studio',
  },
  {
    id: 'supplemental-vent-design',
    courseId: 'course-plumbing-mastery',
    category: 'Master Plumbing',
    title: 'Sanitary Vent Design Sprint',
    lessons: 7,
    durationHours: 12,
    rating: 4.5,
    status: 'in-progress',
    startedAt: 'April 9, 2026',
    variant: 'graphite',
  },
  {
    id: 'supplemental-heat-treatment',
    courseId: 'course-materials-intensive',
    category: 'Materials Engineering',
    title: 'Heat Treatment Intensive',
    lessons: 8,
    durationHours: 14,
    rating: 4.7,
    status: 'in-progress',
    startedAt: 'April 7, 2026',
    variant: 'ember',
    badge: 'New',
  },
];

const derivedCourseConfig = {
  'course-ce-review': {
    rating: 4.7,
    status: 'in-progress',
    startedAt: DEFAULT_STARTED_AT,
    variant: 'stage',
  },
  'course-plumbing-mastery': {
    rating: 4.5,
    status: 'in-progress',
    startedAt: 'April 22, 2026',
    variant: 'linen',
  },
  'course-materials-intensive': {
    rating: 4.9,
    status: 'completed',
    startedAt: 'April 20, 2026',
    variant: 'slate',
  },
};

export function buildStudentProfileCourses(courses, programs) {
  const programMap = new Map(programs.map((program) => [program.id, program.title]));

  const primaryCourses = courses.map((course) => {
    const config = derivedCourseConfig[course.id] ?? {
      rating: 4.5,
      status: 'in-progress',
      startedAt: DEFAULT_STARTED_AT,
      variant: 'cobalt',
    };

    return {
      id: course.id,
      courseId: course.id,
      category: programMap.get(course.programId) ?? course.subjects[0] ?? 'Learning Track',
      title: course.title,
      lessons: course.totalModules,
      durationHours: course.hours,
      rating: config.rating,
      status: config.status,
      startedAt: config.startedAt,
      variant: config.variant,
      badge: course.completedModules === course.totalModules ? 'Completed' : null,
    };
  });

  return [...primaryCourses, ...supplementalCourseTemplates];
}

export const studentAssignments = [
  {
    id: 'assignment-001',
    title: 'Practical homework',
    course: 'CE Board Review',
    teacher: 'Engr. Hannah Cruz',
    updatedAt: '2 years ago',
    status: 'Approved',
    gradeLabel: 'A+',
    scoreLabel: '(5.00/5.00)',
    progressLabel: '100%',
  },
  {
    id: 'assignment-002',
    title: 'Make a presentation about your career',
    course: 'Master Plumbing Fast Track',
    teacher: 'Engr. Miguel Santos',
    updatedAt: '1 year ago',
    status: 'Declined',
    gradeLabel: 'B',
    scoreLabel: '(3.40/5.00)',
    progressLabel: '68%',
  },
  {
    id: 'assignment-003',
    title: 'Practical homework',
    course: 'Materials Engineering Intensive',
    teacher: 'Dr. Reese Navarro',
    updatedAt: '2 years ago',
    status: 'Approved',
    gradeLabel: 'A+',
    scoreLabel: '(5.00/5.00)',
    progressLabel: '100%',
  },
];

export const studentAssignmentStatuses = ['All', 'Approved', 'Declined', 'Pending'];
