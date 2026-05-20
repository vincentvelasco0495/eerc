import { createTodayLabel, getCompletionState } from 'src/utils/lms';

import {
  LMS_PROGRAMS,
  BADGE_VARIANTS,
  ENROLLMENT_STATUSES,
  LEADERBOARD_PERIODS,
  LEARNING_FLOW_STEPS,
} from 'src/constants/lms';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const user = {
  id: 'learner-01',
  displayName: 'Hello Friend',
  email: 'hello.friend@eerc.edu',
  role: 'student',
  isStudent: true,
  status: 'active',
  activeProgram: LMS_PROGRAMS[0],
  joinedAt: '2026-01-12',
  streak: 14,
  badges: [BADGE_VARIANTS.top10, BADGE_VARIANTS.consistency],
  watermarkName: 'Hello Friend',
  sessionWarning: true,
  phoneNumber: '',
  birthday: '',
  schoolHeld: '',
};

const programs = [
  {
    id: 'program-ce',
    code: 'CE',
    title: 'Continuing Education',
    description: 'A guided board review path with coaching checkpoints and timed practice.',
  },
  {
    id: 'program-plumbing',
    code: 'MPL',
    title: 'Master Plumbing',
    description: 'Licensure preparation focused on design, code review, and field scenarios.',
  },
  {
    id: 'program-materials',
    code: 'MSE',
    title: 'Materials Engineering',
    description: 'Core material behavior, manufacturing processes, and exam-ready drills.',
  },
  {
    id: 'program-environmental-sciences',
    code: 'ENV',
    title: 'Environmental Sciences',
    description: 'Environmental systems, stewardship, and applied science coursework.',
  },
];

const instructorsMock = [
  {
    id: 'learner-01',
    name: 'Alex E. Rivera',
    email: 'alex.rivera@eerc.edu',
    role: 'admin',
    status: 'active',
    achievements: '',
    profilePath: '',
  },
  {
    id: 'inst-user-hannah',
    name: 'Hannah Cruz',
    email: 'hannah.cruz@eerc.edu',
    role: 'instructor',
    status: 'active',
    achievements: '<p>Lead CE coordinator.</p>',
    profilePath: '',
  },
  {
    id: 'inst-user-miguel',
    name: 'Miguel Santos',
    email: 'miguel.santos@eerc.edu',
    role: 'instructor',
    status: 'active',
    achievements: '',
    profilePath: '',
  },
  {
    id: 'inst-user-priya',
    name: 'Priya Nandakumar',
    email: 'priya.n@eerc.edu',
    role: 'instructor',
    status: 'active',
    achievements: '',
    profilePath: '',
  },
  {
    id: 'inst-user-jordan',
    name: 'Jordan Lee',
    email: 'jordan.lee@eerc.edu',
    role: 'instructor',
    status: 'inactive',
    achievements: '<p>On sabbatical.</p>',
    profilePath: '',
  },
  {
    id: 'inst-user-sam',
    name: 'Sam Okonkwo',
    email: 'sam.okonkwo@eerc.edu',
    role: 'instructor',
    status: 'active',
    achievements: '',
    profilePath: '',
  },
];

const studentsMock = [
  {
    id: 'eerc-demo-student-user',
    name: 'Mina Santos',
    email: 'mina@demo.edu',
    role: 'student',
    status: 'active',
    notes: '<p>Prefers evening cohort sessions.</p>',
    profilePath: '',
  },
  {
    id: 'learner-01',
    name: 'Alex E. Rivera',
    email: 'alex.rivera@eerc.edu',
    role: 'admin',
    status: 'active',
    notes: '',
    profilePath: '',
  },
  {
    id: 'stud-user-aria',
    name: 'Aria Mendoza',
    email: 'aria.mendoza@eerc.edu',
    role: 'student',
    status: 'active',
    notes: '',
    profilePath: '',
  },
  {
    id: 'stud-user-chen',
    name: 'Wei Chen',
    email: 'wei.chen@eerc.edu',
    role: 'student',
    status: 'active',
    notes: '<p>Scholarship track.</p>',
    profilePath: '',
  },
  {
    id: 'stud-user-sofia',
    name: 'Sofia Reyes',
    email: 'sofia.reyes@eerc.edu',
    role: 'student',
    status: 'inactive',
    notes: '',
    profilePath: '',
  },
];

const courses = [
  {
    id: 'course-ce-review',
    slug: 'ce-board-review',
    title: 'CE Board Review',
    programId: 'program-ce',
    mentor: 'Engr. Hannah Cruz',
    description: 'Structured review sessions covering hydraulics, structures, and environmental systems.',
    level: 'Advanced',
    totalModules: 8,
    completedModules: 5,
    hours: 36,
    learners: 1842,
    nextModuleId: 'module-hydraulics-review',
    tags: ['Streaming only', 'Board exam'],
    subjects: ['Hydraulics', 'Structures', 'Environmental Engineering'],
    marketing: {
      bannerImageUrl: 'https://picsum.photos/seed/eerc-banner-course-ce-review/1200/675',
    },
  },
  {
    id: 'course-ce-structures',
    slug: 'ce-structures-workshop',
    title: 'CE Structures Workshop',
    programId: 'program-ce',
    mentor: 'Engr. Hannah Cruz',
    description: 'Focused structural analysis drills and load-path review for board candidates.',
    level: 'Advanced',
    totalModules: 6,
    completedModules: 2,
    hours: 24,
    learners: 640,
    nextModuleId: 'module-hydraulics-review',
    tags: ['Practice heavy'],
    subjects: ['Structures'],
    marketing: {
      bannerImageUrl: 'https://picsum.photos/seed/eerc-banner-course-ce-structures/1200/675',
    },
  },
  {
    id: 'course-plumbing-mastery',
    slug: 'master-plumbing-fast-track',
    title: 'Master Plumbing Fast Track',
    programId: 'program-plumbing',
    mentor: 'Engr. Miguel Santos',
    description: 'Code interpretation, system sizing, and troubleshooting walkthroughs.',
    level: 'Intermediate',
    totalModules: 7,
    completedModules: 3,
    hours: 29,
    learners: 1297,
    nextModuleId: 'module-pipe-sizing-practice',
    tags: ['Practice heavy', 'Case studies'],
    subjects: ['Plumbing Code', 'Pipe Design', 'Sanitary Systems'],
    marketing: {
      bannerImageUrl: 'https://picsum.photos/seed/eerc-banner-course-plumbing-mastery/1200/675',
    },
  },
  {
    id: 'course-materials-intensive',
    slug: 'materials-engineering-intensive',
    title: 'Materials Engineering Intensive',
    programId: 'program-materials',
    mentor: 'Dr. Reese Navarro',
    description: 'Materials characterization, failures, and thermodynamics for exam prep.',
    level: 'Advanced',
    totalModules: 9,
    completedModules: 4,
    hours: 41,
    learners: 913,
    nextModuleId: 'module-heat-treatment-refresher',
    tags: ['Lab aligned', 'Coaching'],
    subjects: ['Metallurgy', 'Thermodynamics', 'Failure Analysis'],
    marketing: {
      bannerImageUrl: 'https://picsum.photos/seed/eerc-banner-course-materials-intensive/1200/675',
    },
  },
  {
    id: 'course-how-to-design-components',
    slug: 'how-to-design-components-right',
    title: 'How to Design Components Right',
    programId: 'program-environmental-sciences',
    mentor: 'Demo Instructor',
    description:
      'Learn how to compose interfaces with clarity—from layout grids to typography systems—so learners can absorb content faster.',
    level: 'Advanced',
    totalModules: 4,
    completedModules: 4,
    hours: 9,
    learners: 842,
    nextModuleId: 'module-design-02-layout-systems',
    tags: ['Component systems', 'UI craft'],
    subjects: ['UI systems', 'Layout'],
    /** Displayed in “Video” detail row instead of deriving from module resource tags. */
    videoHoursLabel: '5 hours',
    /** First sidebar card mimics learner “course complete” preview in instructor View. */
    previewCompleted: true,
    marketing: {
      bannerImageUrl: 'https://picsum.photos/seed/eerc-banner-course-design-components/1200/675',
    },
  },
];

const modules = [
  {
    id: 'module-hydraulics-review',
    courseId: 'course-ce-review',
    title: 'Hydraulics Review Session',
    subject: 'Hydraulics',
    topic: 'Fluid Flow',
    subtopic: 'Bernoulli and Energy Losses',
    type: LEARNING_FLOW_STEPS[0],
    duration: '42 min',
    lastPosition: '31:10',
    progress: 74,
    visible: true,
    streamingOnly: true,
    resources: ['Video', 'PDF', 'eBook'],
    summary: 'Review losses, pressure heads, and exam shortcuts.',
  },
  {
    id: 'module-hydraulics-practice',
    courseId: 'course-ce-review',
    title: 'Hydraulics Practice Problems',
    subject: 'Hydraulics',
    topic: 'Fluid Flow',
    subtopic: 'Pump and Pipeline Problems',
    type: LEARNING_FLOW_STEPS[1],
    duration: '28 min',
    lastPosition: '00:00',
    progress: 0,
    visible: true,
    streamingOnly: true,
    resources: ['Video', 'PDF'],
    summary: 'Timed practice set with guided solutions.',
  },
  {
    id: 'module-structural-refresher',
    courseId: 'course-ce-review',
    title: 'Structural Refresher',
    subject: 'Structures',
    topic: 'Reinforced Concrete',
    subtopic: 'Shear and Flexure',
    type: LEARNING_FLOW_STEPS[2],
    duration: '25 min',
    lastPosition: '12:44',
    progress: 52,
    visible: false,
    streamingOnly: true,
    resources: ['PDF', 'eBook'],
    summary: 'Formula refresher for high-frequency board questions.',
  },
  {
    id: 'module-pipe-sizing-practice',
    courseId: 'course-plumbing-mastery',
    title: 'Pipe Sizing Practice',
    subject: 'Pipe Design',
    topic: 'Sizing',
    subtopic: 'Fixture Units',
    type: LEARNING_FLOW_STEPS[1],
    duration: '35 min',
    lastPosition: '09:30',
    progress: 33,
    visible: true,
    streamingOnly: true,
    resources: ['Video', 'PDF'],
    summary: 'Practice scenarios for domestic and sanitary systems.',
  },
  {
    id: 'module-code-final-coaching',
    courseId: 'course-plumbing-mastery',
    title: 'Code Review Final Coaching',
    subject: 'Plumbing Code',
    topic: 'Compliance',
    subtopic: 'Inspection and Exceptions',
    type: LEARNING_FLOW_STEPS[3],
    duration: '48 min',
    lastPosition: '00:00',
    progress: 0,
    visible: true,
    streamingOnly: true,
    resources: ['Video', 'eBook'],
    summary: 'Instructor-led final coaching before mock exam day.',
  },
  {
    id: 'module-heat-treatment-refresher',
    courseId: 'course-materials-intensive',
    title: 'Heat Treatment Refresher',
    subject: 'Metallurgy',
    topic: 'Heat Treatment',
    subtopic: 'Phase Transformation',
    type: LEARNING_FLOW_STEPS[2],
    duration: '32 min',
    lastPosition: '16:25',
    progress: 58,
    visible: true,
    streamingOnly: true,
    resources: ['Video', 'PDF', 'eBook'],
    summary: 'Fast review of heat treatment charts and material response.',
  },
  {
    id: 'module-design-01-foundations',
    courseId: 'course-how-to-design-components',
    title: 'Foundations & composition',
    subject: 'UI systems',
    topic: 'Layout',
    subtopic: 'Hierarchy and rhythm',
    type: LEARNING_FLOW_STEPS[0],
    duration: '2h 10m',
    lastPosition: '00:00',
    progress: 100,
    visible: true,
    streamingOnly: false,
    resources: ['Video', 'PDF'],
    summary: 'Contrast, spacing, and grid principles for teachable screens.',
  },
  {
    id: 'module-design-02-layout-systems',
    courseId: 'course-how-to-design-components',
    title: 'Layout systems & modules',
    subject: 'UI systems',
    topic: 'Layout',
    subtopic: 'Modular UI',
    type: LEARNING_FLOW_STEPS[1],
    duration: '2h 25m',
    lastPosition: '00:00',
    progress: 100,
    visible: true,
    streamingOnly: false,
    resources: ['Video', 'PDF', 'eBook'],
    summary: 'Break pages into reusable regions and responsive columns.',
  },
  {
    id: 'module-design-03-typography',
    courseId: 'course-how-to-design-components',
    title: 'Typography & affordance',
    subject: 'UI systems',
    topic: 'Type',
    subtopic: 'Scale and emphasis',
    type: LEARNING_FLOW_STEPS[2],
    duration: '2h 15m',
    lastPosition: '00:00',
    progress: 100,
    visible: true,
    streamingOnly: false,
    resources: ['Video', 'PDF'],
    summary: 'Readable type ramps, links, and states that guide attention.',
  },
  {
    id: 'module-design-04-critique',
    courseId: 'course-how-to-design-components',
    title: 'Critique & handoff',
    subject: 'UI systems',
    topic: 'Process',
    subtopic: 'Review cadence',
    type: LEARNING_FLOW_STEPS[3],
    duration: '2h 10m',
    lastPosition: '00:00',
    progress: 100,
    visible: true,
    streamingOnly: false,
    resources: ['Video', 'PDF'],
    summary: 'Structured feedback loops before implementation.',
  },
];

const quizzes = [
  {
    id: 'quiz-hydraulics-timed',
    courseId: 'course-ce-review',
    moduleId: 'module-hydraulics-review',
    title: 'Hydraulics Timed Quiz',
    durationMinutes: 20,
    attemptsAllowed: 3,
    attemptsUsed: 2,
    questionCount: 20,
    questionPoolCount: 80,
    bestScore: 88,
  },
  {
    id: 'quiz-plumbing-code',
    courseId: 'course-plumbing-mastery',
    moduleId: 'module-code-final-coaching',
    title: 'Plumbing Code Quiz',
    durationMinutes: 15,
    attemptsAllowed: 4,
    attemptsUsed: 1,
    questionCount: 15,
    questionPoolCount: 48,
    bestScore: 76,
  },
  {
    id: 'quiz-design-layout-check',
    courseId: 'course-how-to-design-components',
    moduleId: 'module-design-02-layout-systems',
    title: 'Layout systems check-in',
    durationMinutes: 12,
    attemptsAllowed: 3,
    attemptsUsed: 1,
    questionCount: 10,
    questionPoolCount: 24,
    bestScore: 100,
  },
  {
    id: 'quiz-design-critique',
    courseId: 'course-how-to-design-components',
    moduleId: 'module-design-04-critique',
    title: 'Critique readiness quiz',
    durationMinutes: 10,
    attemptsAllowed: 3,
    attemptsUsed: 1,
    questionCount: 8,
    questionPoolCount: 20,
    bestScore: 100,
  },
];

const questionPool = {
  'quiz-hydraulics-timed': Array.from({ length: 80 }, (_, index) => ({
    id: `hydraulics-q-${index + 1}`,
    prompt: `Hydraulics question ${index + 1}: identify the correct pressure head relation.`,
    choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
  })),
  'quiz-plumbing-code': Array.from({ length: 48 }, (_, index) => ({
    id: `plumbing-code-q-${index + 1}`,
    prompt: `Plumbing code question ${index + 1}: determine the compliant fixture requirement.`,
    choices: ['Option A', 'Option B', 'Option C', 'Option D'],
  })),
  'quiz-design-layout-check': Array.from({ length: 24 }, (_, index) => ({
    id: `design-layout-q-${index + 1}`,
    prompt: `Layout question ${index + 1}: pick the best modular structure for the scenario.`,
    choices: ['Option A', 'Option B', 'Option C', 'Option D'],
  })),
  'quiz-design-critique': Array.from({ length: 20 }, (_, index) => ({
    id: `design-critique-q-${index + 1}`,
    prompt: `Critique question ${index + 1}: identify the strongest review practice.`,
    choices: ['Option A', 'Option B', 'Option C', 'Option D'],
  })),
};

const quizResults = [
  {
    id: 'attempt-001',
    quizId: 'quiz-hydraulics-timed',
    date: '2026-04-20',
    score: 84,
    durationUsed: '16m 10s',
    correctAnswers: 17,
    totalQuestions: 20,
  },
  {
    id: 'attempt-002',
    quizId: 'quiz-hydraulics-timed',
    date: '2026-04-22',
    score: 88,
    durationUsed: '14m 55s',
    correctAnswers: 18,
    totalQuestions: 20,
  },
  {
    id: 'attempt-003',
    quizId: 'quiz-plumbing-code',
    date: '2026-04-19',
    score: 76,
    durationUsed: '11m 37s',
    correctAnswers: 11,
    totalQuestions: 15,
  },
];

const leaderboard = {
  daily: [
    { id: 'rank-1', name: 'Alex E. Rivera', program: 'CE', score: 985, badge: BADGE_VARIANTS.top10 },
    { id: 'rank-2', name: 'Mina Santos', program: 'MPL', score: 960, badge: BADGE_VARIANTS.mostImproved },
    { id: 'rank-3', name: 'Caleb Lim', program: 'MSE', score: 931, badge: BADGE_VARIANTS.consistency },
  ],
  weekly: [
    { id: 'rank-4', name: 'Mina Santos', program: 'MPL', score: 6720, badge: BADGE_VARIANTS.top10 },
    { id: 'rank-5', name: 'Alex E. Rivera', program: 'CE', score: 6550, badge: BADGE_VARIANTS.consistency },
    { id: 'rank-6', name: 'Jiro Tan', program: 'MSE', score: 6430, badge: BADGE_VARIANTS.mostImproved },
  ],
  overall: [
    { id: 'rank-7', name: 'Alex E. Rivera', program: 'CE', score: 31220, badge: BADGE_VARIANTS.top10 },
    { id: 'rank-8', name: 'Diane Uy', program: 'MPL', score: 30110, badge: BADGE_VARIANTS.top10 },
    { id: 'rank-9', name: 'Mina Santos', program: 'MPL', score: 29440, badge: BADGE_VARIANTS.mostImproved },
  ],
};

const enrollments = [
  {
    id: 'enrollment-001',
    programId: 'program-ce',
    programTitle: 'Continuing Education',
    userName: 'Alex E. Rivera',
    userEmail: 'alex@example.com',
    phoneNumber: '+1 (555) 010-2001',
    schoolHeld: 'Metro State University',
    submittedAt: '2026-04-10',
    status: ENROLLMENT_STATUSES[1],
  },
  {
    id: 'enrollment-002',
    programId: 'program-materials',
    programTitle: 'Materials Engineering',
    userName: 'Alex E. Rivera',
    userEmail: 'alex@example.com',
    phoneNumber: '+1 (555) 010-2001',
    schoolHeld: 'Metro State University',
    submittedAt: '2026-04-21',
    status: ENROLLMENT_STATUSES[0],
  },
];

const admin = {
  users: [
    { id: 'user-1', name: 'Alex E. Rivera', role: 'Learner', activeProgram: 'CE', status: 'Active' },
    { id: 'user-2', name: 'Mina Santos', role: 'Learner', activeProgram: 'Master Plumbing', status: 'Active' },
    { id: 'user-3', name: 'Dr. Reese Navarro', role: 'Instructor', activeProgram: 'Materials Engineering', status: 'Active' },
  ],
  uploads: [
    { id: 'upload-1', title: 'Hydraulics Solution Manual', type: 'PDF', status: 'Published' },
  ],
};

function courseWithProgramTitle(course) {
  const p = programs.find((x) => x.id === course.programId);
  return {
    ...course,
    programTitle: p?.title ?? '',
    status: course.status ?? (course.isPublished === false ? 'draft' : 'published'),
    isPublished: course.isPublished ?? true,
    averageRating:
      typeof course.averageRating === 'number' && Number.isFinite(course.averageRating)
        ? course.averageRating
        : null,
    updatedAt: course.updatedAt ?? new Date().toISOString(),
  };
}

function buildProgressSummary() {
  const completedModules = courses.reduce((sum, course) => sum + course.completedModules, 0);
  const totalModules = courses.reduce((sum, course) => sum + course.totalModules, 0);
  const completionRate = getCompletionState(completedModules, totalModules);

  return {
    completedModules,
    totalModules,
    completionRate,
    pendingModules: totalModules - completedModules,
    strengths: ['Hydraulics', 'Code Familiarity', 'Material Selection'],
    weaknesses: ['Open channel flow', 'Sanitary vent layouts', 'Heat treatment cycles'],
    suggestedModuleIds: ['module-hydraulics-practice', 'module-code-final-coaching', 'module-heat-treatment-refresher'],
    instructorSummary: {
      courses: courses.length,
      enrollments: enrollments.length,
      students: studentsMock.length,
    },
  };
}

export async function mockResponseForKey(key) {
  if (typeof key !== 'string') {
    return null;
  }

  await delay(30);
  const [rawPath, qs = ''] = key.split('?');
  const path = rawPath || '';
  const params = new URLSearchParams(qs);

  if (path === '/api/user') {
    return user;
  }

  if (path === '/api/meta') {
    return {
      todayLabel: createTodayLabel(),
      leaderboardPeriods: LEADERBOARD_PERIODS,
      learningFlowSteps: LEARNING_FLOW_STEPS,
    };
  }

  if (path === '/api/programs') {
    if (!params.get('page')) {
      return { data: programs };
    }

    const pageNum = Math.max(1, parseInt(params.get('page') || '1', 10));
    let perPageNum = parseInt(params.get('per_page') || '10', 10);
    if (![5, 10, 20, 50, 100].includes(perPageNum)) {
      perPageNum = 10;
    }
    const searchRaw = (params.get('search') || '').trim().toLowerCase();
    let list = programs.map((p) => ({
      ...p,
      slug: p.slug ?? '',
      status: p.status ?? 'active',
      bannerPath: p.bannerPath ?? '',
    }));
    if (searchRaw) {
      list = list.filter(
        (p) =>
          String(p.title || '')
            .toLowerCase()
            .includes(searchRaw) ||
          String(p.code || '')
            .toLowerCase()
            .includes(searchRaw) ||
          String(p.slug || '')
            .toLowerCase()
            .includes(searchRaw)
      );
    }
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPageNum));
    const currentPage = Math.min(pageNum, lastPage);
    const start = (currentPage - 1) * perPageNum;
    const slice = list.slice(start, start + perPageNum);

    return {
      data: slice,
      meta: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPageNum,
        total,
        from: total === 0 ? 0 : start + 1,
        to: total === 0 ? 0 : Math.min(start + perPageNum, total),
      },
    };
  }

  if (path === '/api/instructors/linkable-users') {
    const assigned = new Set(instructorsMock.map((r) => r.id));
    const pool = [
      {
        publicUid: 'eerc-demo-student-user',
        name: 'Mina Santos',
        email: 'mina@demo.edu',
        role: 'student',
      },
      {
        publicUid: 'eerc-demo-instructor-user',
        name: 'Dr. Reese Navarro',
        email: 'reese@demo.edu',
        role: 'instructor',
      },
    ];
    return { data: pool.filter((u) => !assigned.has(u.publicUid)) };
  }

  if (path === '/api/students/linkable-users') {
    const assigned = new Set(studentsMock.map((r) => r.id));
    const pool = [
      {
        publicUid: 'eerc-demo-instructor-user',
        name: 'Dr. Reese Navarro',
        email: 'reese@demo.edu',
        role: 'instructor',
      },
      {
        publicUid: 'inst-user-hannah',
        name: 'Hannah Cruz',
        email: 'hannah.cruz@eerc.edu',
        role: 'instructor',
      },
    ];
    return { data: pool.filter((u) => !assigned.has(u.publicUid)) };
  }

  if (path === '/api/instructors') {
    if (!params.get('page')) {
      return { data: instructorsMock };
    }

    const pageNum = Math.max(1, parseInt(params.get('page') || '1', 10));
    let perPageNum = parseInt(params.get('per_page') || '10', 10);
    if (![5, 10, 20, 50, 100].includes(perPageNum)) {
      perPageNum = 10;
    }
    const searchRaw = (params.get('search') || '').trim().toLowerCase();
    let list = instructorsMock.map((row) => ({
      ...row,
      status: row.status ?? 'active',
      achievements: row.achievements ?? '',
      profilePath: row.profilePath ?? '',
    }));
    if (searchRaw) {
      list = list.filter((row) => {
        const plain = String(row.achievements || '').replace(/<[^>]+>/g, ' ');
        const hay = `${row.name || ''} ${row.email || ''} ${plain}`.toLowerCase();
        return hay.includes(searchRaw);
      });
    }
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPageNum));
    const currentPage = Math.min(pageNum, lastPage);
    const start = (currentPage - 1) * perPageNum;
    const slice = list.slice(start, start + perPageNum);

    return {
      data: slice,
      meta: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPageNum,
        total,
        from: total === 0 ? 0 : start + 1,
        to: total === 0 ? 0 : Math.min(start + perPageNum, total),
      },
    };
  }

  if (path === '/api/students') {
    if (!params.get('page')) {
      return { data: studentsMock };
    }

    const pageNum = Math.max(1, parseInt(params.get('page') || '1', 10));
    let perPageNum = parseInt(params.get('per_page') || '10', 10);
    if (![5, 10, 20, 50, 100].includes(perPageNum)) {
      perPageNum = 10;
    }
    const searchRaw = (params.get('search') || '').trim().toLowerCase();
    let list = studentsMock.map((row) => ({
      ...row,
      status: row.status ?? 'active',
      notes: row.notes ?? '',
      profilePath: row.profilePath ?? '',
    }));
    if (searchRaw) {
      list = list.filter((row) => {
        const plain = String(row.notes || '').replace(/<[^>]+>/g, ' ');
        const hay = `${row.name || ''} ${row.email || ''} ${plain}`.toLowerCase();
        return hay.includes(searchRaw);
      });
    }
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPageNum));
    const currentPage = Math.min(pageNum, lastPage);
    const start = (currentPage - 1) * perPageNum;
    const slice = list.slice(start, start + perPageNum);

    return {
      data: slice,
      meta: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPageNum,
        total,
        from: total === 0 ? 0 : start + 1,
        to: total === 0 ? 0 : Math.min(start + perPageNum, total),
      },
    };
  }

  if (path === '/api/courses') {
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(params.get('limit') || '100', 10)));
    const programRaw = (params.get('program') || '').trim();
    const programNorm = programRaw.toLowerCase();
    const statusRaw = (params.get('status') || '').trim().toLowerCase();

    let list = courses;
    if (programRaw) {
      list = courses.filter((course) => {
        const programId = String(course.programId ?? '');
        if (programId === programRaw) {
          return true;
        }
        const programRow = programs.find((p) => p.id === programId);
        if (!programRow) {
          return false;
        }
        const code = String(programRow.code ?? '').trim().toLowerCase();
        const title = String(programRow.title ?? '').trim().toLowerCase();
        return (
          programId.toLowerCase() === programNorm ||
          code === programNorm ||
          title === programNorm.replace(/-/g, ' ')
        );
      });
    }

    if (statusRaw === 'published') {
      list = list.filter((course) => course.isPublished !== false && course.status !== 'draft');
    } else if (statusRaw === 'draft') {
      list = list.filter((course) => course.isPublished === false || course.status === 'draft');
    } else if (statusRaw === 'upcoming') {
      list = [];
    }

    const start = (page - 1) * limit;
    const slice = list.slice(start, start + limit).map(courseWithProgramTitle);
    const lastPage = Math.max(1, Math.ceil(list.length / limit));

    return { data: slice, meta: { page, limit, total: list.length, lastPage } };
  }

  if (path === '/api/enrollments') {
    if (!params.get('page')) {
      return { data: enrollments };
    }

    const pageNum = Math.max(1, parseInt(params.get('page') || '1', 10));
    let perPageNum = parseInt(params.get('per_page') || '10', 10);
    if (![5, 10, 20, 50, 100].includes(perPageNum)) {
      perPageNum = 10;
    }
    const searchRaw = (params.get('search') || '').trim().toLowerCase();
    let list = [...enrollments];
    if (searchRaw) {
      list = list.filter((row) => {
        const hay = `${row.id} ${row.programId} ${row.programTitle} ${row.userName} ${row.userEmail} ${row.phoneNumber ?? ''} ${row.schoolHeld ?? ''} ${row.status}`.toLowerCase();
        return hay.includes(searchRaw);
      });
    }
    const total = list.length;
    const lastPage = Math.max(1, Math.ceil(total / perPageNum));
    const currentPage = Math.min(pageNum, lastPage);
    const start = (currentPage - 1) * perPageNum;
    const slice = list.slice(start, start + perPageNum);

    return {
      data: slice,
      meta: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPageNum,
        total,
        from: total === 0 ? 0 : start + 1,
        to: total === 0 ? 0 : Math.min(start + perPageNum, total),
      },
    };
  }

  if (path === '/api/modules') {
    const courseId = params.get('courseId');
    const ids = params.get('ids');
    if (ids) {
      const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
      const order = new Map(idList.map((id, i) => [id, i]));
      return {
        data: [...modules].filter((m) => order.has(m.id)).sort((a, b) => order.get(a.id) - order.get(b.id)),
      };
    }
    if (courseId) {
      return { data: modules.filter((m) => m.courseId === courseId) };
    }
    return { data: [] };
  }

  if (path === '/api/quizzes') {
    const moduleId = params.get('moduleId');
    const list = moduleId ? quizzes.filter((q) => q.moduleId === moduleId) : quizzes;
    return { data: list };
  }

  if (path === '/api/quiz-results') {
    return { data: quizResults };
  }

  if (path === '/api/leaderboard') {
    const type = params.get('type') || 'daily';
    return { data: leaderboard[type] ?? [] };
  }

  if (path === '/api/analytics') {
    return buildProgressSummary();
  }

  if (path === '/api/admin') {
    return admin;
  }

  return null;
}

export async function submitEnrollmentRequest(programId, paymentProofFile) {
  await delay(180);

  if (!paymentProofFile) {
    throw new Error('Upload proof of payment before submitting.');
  }

  const rejected = enrollments.find(
    (row) => row.programId === programId && row.status === ENROLLMENT_STATUSES[2]
  );
  if (rejected) {
    rejected.status = ENROLLMENT_STATUSES[0];
    rejected.submittedAt = new Date().toISOString().slice(0, 10);
    rejected.hasPaymentProof = true;
    rejected.paymentProofFileName = paymentProofFile?.name ?? 'payment-proof.pdf';
    return { ...rejected };
  }

  const hasActive = enrollments.some(
    (row) =>
      row.programId === programId &&
      (row.status === ENROLLMENT_STATUSES[0] || row.status === ENROLLMENT_STATUSES[1])
  );
  if (hasActive) {
    throw new Error('You already have an enrollment application for this program.');
  }

  const created = {
    id: `enrollment-${Date.now()}`,
    programId,
    programTitle: programs.find((p) => p.id === programId)?.title ?? '',
    userName: user.displayName,
    userEmail: user.email,
    phoneNumber: user.phoneNumber ?? '',
    schoolHeld: user.schoolHeld ?? '',
    submittedAt: new Date().toISOString().slice(0, 10),
    status: ENROLLMENT_STATUSES[0],
    hasPaymentProof: true,
    paymentProofFileName: paymentProofFile?.name ?? 'payment-proof.pdf',
  };
  enrollments.unshift(created);

  return created;
}

export async function simulateQuizAttempt(quizId) {
  await delay(180);

  const quiz = quizzes.find((item) => item.id === quizId);
  const correctAnswers = Math.max(8, Math.min(quiz.questionCount, Math.floor(Math.random() * quiz.questionCount)));
  const score = Math.round((correctAnswers / quiz.questionCount) * 100);

  return {
    id: `attempt-${Date.now()}`,
    quizId,
    date: new Date().toISOString().slice(0, 10),
    score,
    durationUsed: `${Math.max(8, quiz.durationMinutes - 3)}m ${Math.floor(Math.random() * 59)}s`,
    correctAnswers,
    totalQuestions: quiz.questionCount,
  };
}

export async function toggleModuleVisibility(moduleId) {
  await delay(150);

  return { moduleId };
}

export async function uploadAdminModule(payload) {
  await delay(220);

  return {
    id: `upload-${Date.now()}`,
    title: payload.title,
    type: payload.assetType,
    status: 'Queued',
  };
}

export async function updateEnrollmentStatus({ enrollmentId, status }) {
  await delay(150);

  return { enrollmentId, status };
}

export async function fetchQuizQuestionSet(quizId) {
  await delay(120);

  return questionPool[quizId] ?? [];
}
