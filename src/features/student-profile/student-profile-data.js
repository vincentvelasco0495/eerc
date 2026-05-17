import { paths } from 'src/routes/paths';

const DEFAULT_STARTED_AT = 'April 24, 2026';

export function getStudentWorkspaceNavGroups(pathname) {
  return [
    {
      title: 'Main',
      items: [
        {
          label: 'Available Programs',
          icon: 'solar:layers-minimalistic-bold-duotone',
          path: paths.dashboard.availablePrograms,
          active: pathname === paths.dashboard.availablePrograms,
        },
        {
          label: 'Enrolled Courses',
          icon: 'solar:book-bookmark-bold-duotone',
          path: paths.dashboard.enrolledCourses,
          active: pathname === paths.dashboard.enrolledCourses,
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
      title: 'System Setting',
      items: [
        {
          label: 'Profile',
          icon: 'solar:settings-bold-duotone',
          path: paths.dashboard.studentSettings,
          active: pathname === paths.dashboard.studentSettings,
        },
        {
          label: 'Programs',
          icon: 'solar:layers-bold-duotone',
          path: paths.dashboard.programs,
          active: pathname === paths.dashboard.programs,
        },
        { label: 'Log out', icon: 'solar:logout-3-bold-duotone', action: 'logout' },
      ],
    },
  ];
}

const derivedCourseConfig = {
  'course-ce-review': {
    rating: 4.7,
    status: 'in-progress',
    startedAt: DEFAULT_STARTED_AT,
    variant: 'stage',
  },
  'course-ce-structures': {
    rating: 4.6,
    status: 'in-progress',
    startedAt: 'April 20, 2026',
    variant: 'cobalt',
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

/** Program ids with an approved enrollment for the signed-in learner. */
export function getApprovedProgramIds(enrollments = [], courses = []) {
  const approved = new Set();

  for (const item of enrollments) {
    if (item?.status !== 'approved') {
      continue;
    }

    if (item.programId) {
      approved.add(item.programId);
    }

    if (item.courseId && courses.length > 0) {
      const legacyCourse = courses.find((course) => course.id === item.courseId);
      if (legacyCourse?.programId) {
        approved.add(legacyCourse.programId);
      }
    }
  }

  return approved;
}

export function buildStudentProfileCourses(courses, programs, enrollments = []) {
  const programMap = new Map((programs ?? []).map((program) => [program.id, program.title]));
  const approvedProgramIds = getApprovedProgramIds(enrollments, courses);

  if (approvedProgramIds.size === 0) {
    return [];
  }

  return (courses ?? [])
    .filter(
      (course) =>
        isPublishedCatalogCourse(course) && approvedProgramIds.has(course.programId)
    )
    .map((course) => {
      const config = derivedCourseConfig[course.id] ?? {
        rating: 4.5,
        status: 'in-progress',
        startedAt: DEFAULT_STARTED_AT,
        variant: 'cobalt',
      };

      const isCompleted =
        Number(course.totalModules) > 0 &&
        Number(course.completedModules) >= Number(course.totalModules);

      return {
        id: course.id,
        courseId: course.id,
        courseSlug: course.slug,
        category: programMap.get(course.programId) ?? course.subjects?.[0] ?? 'Learning Track',
        title: course.title,
        lessons: course.totalModules,
        durationHours: course.hours,
        rating: config.rating,
        status: isCompleted ? 'completed' : config.status,
        startedAt: config.startedAt,
        variant: config.variant,
        badge: isCompleted ? 'Completed' : null,
      };
    });
}

function isPublishedCatalogCourse(course) {
  if (course?.isPublished === false) {
    return false;
  }
  if (typeof course?.status === 'string' && course.status.toLowerCase() === 'draft') {
    return false;
  }
  return true;
}

/** Active `programs` rows for the Available programs grid (`title` + `description` from DB). */
export function buildAvailableProgramCards(programs, courses) {
  const publishedCourses = (courses ?? []).filter(isPublishedCatalogCourse);

  return (programs ?? [])
    .filter((program) => String(program?.status ?? 'active').toLowerCase() === 'active')
    .map((program) => {
      const programCourses = publishedCourses.filter((course) => course.programId === program.id);
      const totalLectures = programCourses.reduce(
        (sum, course) => sum + (Number(course.totalModules) || 0),
        0
      );
      const totalHours = programCourses.reduce((sum, course) => sum + (Number(course.hours) || 0), 0);
      const programSlug =
        String(program?.slug ?? '').trim() ||
        String(program?.code ?? '')
          .trim()
          .toLowerCase();

      return {
        id: program.id,
        category: String(program?.code ?? '').trim() || 'Program',
        title: String(program?.title ?? '').trim() || 'Program',
        description: String(program?.description ?? '').trim(),
        lessons: programCourses.length,
        lessonsMetaLabel: 'Courses',
        durationHours: totalHours,
        lectureCount: totalLectures,
        rating: null,
        status: 'in-progress',
        startedAt: null,
        bannerPath: program?.bannerPath ?? '',
        programSlug,
        actionLabel: 'Browse program',
        badge: null,
      };
    });
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
