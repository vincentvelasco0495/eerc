export const selectAppState = (state) => state.app;
export const selectUser = (state) => state.user;
export const selectPrograms = (state) => state.programs;
export const selectCourses = (state) => state.courses;
export const selectModules = (state) => state.modules;
export const selectQuizzesState = (state) => state.quizzes;
export const selectLeaderboardState = (state) => state.leaderboard;
export const selectAnalytics = (state) => state.analytics;
export const selectEnrollment = (state) => state.enrollment;
export const selectAdmin = (state) => state.admin;

export const selectQuizResults = (state) => state.quizzes.results;

export const selectQuestionSets = (state) => state.quizzes.questionSets;

export const selectCourseById = (courseId) => (state) =>
  state.courses.find((course) => course.id === courseId);

export const selectModulesByCourseId = (courseId) => (state) =>
  state.modules.filter((moduleItem) => moduleItem.courseId === courseId);

export const selectModuleById = (moduleId) => (state) =>
  state.modules.find((moduleItem) => moduleItem.id === moduleId);

export const selectQuizById = (quizId) => (state) =>
  state.quizzes.quizzes.find((quiz) => quiz.id === quizId);

export const selectQuizHistoryByQuizId = (quizId) => (state) =>
  state.quizzes.results.filter((result) => result.quizId === quizId);

export const selectLeaderboardByPeriod = (period) => (state) => state.leaderboard?.[period] ?? [];

export const selectSuggestedModules = (state) =>
  (state.analytics?.suggestedModuleIds ?? [])
    .map((moduleId) => state.modules.find((moduleItem) => moduleItem.id === moduleId))
    .filter(Boolean);
