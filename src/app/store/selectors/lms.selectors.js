export const selectAppState = (state) => state.app;
export const selectLmsFlash = (state) => state.app?.flash ?? null;

/** Per-mutation flags for LMS writes. */
export const selectLmsLoading = (state) => state.app?.loading ?? null;

/** @deprecated Initial data loads use SWR; this stays false. */
export const selectIsBootstrapping = () => false;

export const selectIsAnyLmsMutationPending = (state) => {
  const loading = state.app?.loading;
  if (!loading) return false;
  return Object.values(loading).some(Boolean);
};

export const selectQuizzesState = (state) => state.quizzes;

export const selectQuestionSets = (state) => state.quizzes.questionSets;
