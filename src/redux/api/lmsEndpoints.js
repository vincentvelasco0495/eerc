export const lmsEndpoints = {
  user: () => '/api/user',
  meta: () => '/api/meta',
  programs: () => '/api/programs',
  programStats: (programPublicId) =>
    `/api/programs/${encodeURIComponent(programPublicId)}/stats`,
  courses: ({ page = 1, limit = 100, program = '' } = {}) => {
    const programQuery =
      typeof program === 'string' && program.trim()
        ? `&program=${encodeURIComponent(program.trim())}`
        : '';
    return `/api/courses?page=${page}&limit=${limit}${programQuery}`;
  },
  courseDetail: (courseLookup) =>
    `/api/courses/${encodeURIComponent(String(courseLookup ?? '').trim())}/detail`,
  courseStats: (courseId) => `/api/courses/${encodeURIComponent(courseId)}/stats`,
  modulesByCourse: (courseId) => `/api/modules?courseId=${encodeURIComponent(courseId)}`,
  moduleById: (moduleId) => `/api/modules?ids=${encodeURIComponent(moduleId)}`,
  quizzes: (moduleId) =>
    moduleId ? `/api/quizzes?moduleId=${encodeURIComponent(moduleId)}` : '/api/quizzes',
  quizResults: () => '/api/quiz-results',
  lessonProgress: (courseId) => `/api/courses/${encodeURIComponent(courseId)}/lesson-progress`,
  analytics: () => '/api/analytics',
  modulesByIds: (ids) => `/api/modules?ids=${encodeURIComponent(ids.join(','))}`,
  leaderboard: (period) => `/api/leaderboard?type=${encodeURIComponent(period)}`,
  enrollments: () => '/api/enrollments',
  admin: () => '/api/admin',
};
