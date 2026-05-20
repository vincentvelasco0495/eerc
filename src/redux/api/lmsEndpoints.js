export const lmsEndpoints = {
  user: () => '/api/user',
  meta: () => '/api/meta',
  programs: () => '/api/programs',
  programsPaginated: ({ page = 1, perPage = 10, search = '' } = {}) => {
    const base = `/api/programs?page=${page}&per_page=${perPage}`;
    const q = typeof search === 'string' && search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    return `${base}${q}`;
  },
  instructors: () => '/api/instructors',
  instructorsPaginated: ({ page = 1, perPage = 10, search = '' } = {}) => {
    const base = `/api/instructors?page=${page}&per_page=${perPage}`;
    const q = typeof search === 'string' && search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    return `${base}${q}`;
  },
  instructorsLinkableUsers: () => '/api/instructors/linkable-users',
  students: () => '/api/students',
  studentsPaginated: ({ page = 1, perPage = 10, search = '' } = {}) => {
    const base = `/api/students?page=${page}&per_page=${perPage}`;
    const q = typeof search === 'string' && search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    return `${base}${q}`;
  },
  studentsLinkableUsers: () => '/api/students/linkable-users',
  programStats: (programPublicId) =>
    `/api/programs/${encodeURIComponent(programPublicId)}/stats`,
  courses: ({ page = 1, limit = 100, program = '', status = '' } = {}) => {
    const programQuery =
      typeof program === 'string' && program.trim()
        ? `&program=${encodeURIComponent(program.trim())}`
        : '';
    const statusNorm = typeof status === 'string' ? status.trim().toLowerCase() : '';
    const statusQuery =
      statusNorm && statusNorm !== 'all'
        ? `&status=${encodeURIComponent(statusNorm)}`
        : '';
    return `/api/courses?page=${page}&limit=${limit}${programQuery}${statusQuery}`;
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
  enrollmentsPaginated: ({ page = 1, perPage = 10, search = '' } = {}) => {
    const base = `/api/enrollments?page=${page}&per_page=${perPage}`;
    const q = typeof search === 'string' && search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    return `${base}${q}`;
  },
  admin: () => '/api/admin',
};
