import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useEffect, useCallback } from 'react';

import {
  lmsBootstrapRequest,
  simulateQuizRequest,
  uploadModuleRequest,
  submitEnrollmentRequest,
  fetchQuizQuestionSetRequest,
  toggleModuleVisibilityRequest,
  updateEnrollmentStatusRequest,
} from 'src/app/store/actions/lms.actions';
import {
  selectUser,
  selectAdmin,
  selectCourses,
  selectAppState,
  selectPrograms,
  selectQuizById,
  selectAnalytics,
  selectCourseById,
  selectEnrollment,
  selectModuleById,
  selectQuizResults,
  selectQuestionSets,
  selectQuizzesState,
  selectSuggestedModules,
  selectModulesByCourseId,
  selectLeaderboardByPeriod,
  selectQuizHistoryByQuizId,
} from 'src/app/store/selectors/lms.selectors';

export function useBootstrapLms() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(lmsBootstrapRequest());
  }, [dispatch]);
}

export function useLmsAppState() {
  return useSelector(selectAppState);
}

export function useLmsUser() {
  return useSelector(selectUser);
}

export function useLmsPrograms() {
  return useSelector(selectPrograms);
}

export function useLmsCourses() {
  return useSelector(selectCourses);
}

export function useLmsCourse(courseId) {
  return useSelector(selectCourseById(courseId));
}

export function useLmsModulesByCourse(courseId) {
  return useSelector(selectModulesByCourseId(courseId));
}

export function useLmsModule(moduleId) {
  return useSelector(selectModuleById(moduleId));
}

export function useLmsQuizzes() {
  const quizzesState = useSelector(selectQuizzesState);

  return quizzesState.quizzes;
}

export function useLmsQuiz(quizId) {
  return useSelector(selectQuizById(quizId));
}

export function useLmsQuizHistory(quizId) {
  return useSelector(selectQuizHistoryByQuizId(quizId));
}

export function useLmsQuizResults() {
  return useSelector(selectQuizResults);
}

export function useLmsQuestionSets() {
  return useSelector(selectQuestionSets);
}

export function useLmsAnalytics() {
  return useSelector(selectAnalytics);
}

export function useSuggestedModules() {
  return useSelector(selectSuggestedModules);
}

export function useLeaderboard(period) {
  return useSelector(selectLeaderboardByPeriod(period));
}

export function useEnrollment() {
  return useSelector(selectEnrollment);
}

export function useAdminData() {
  return useSelector(selectAdmin);
}

export function useLmsActions() {
  const dispatch = useDispatch();
  const submitEnrollment = useCallback(
    (courseId) => dispatch(submitEnrollmentRequest({ courseId })),
    [dispatch]
  );
  const simulateQuiz = useCallback((quizId) => dispatch(simulateQuizRequest({ quizId })), [dispatch]);
  const fetchQuestionSet = useCallback(
    (quizId) => dispatch(fetchQuizQuestionSetRequest({ quizId })),
    [dispatch]
  );
  const toggleModuleVisibility = useCallback(
    (moduleId) => dispatch(toggleModuleVisibilityRequest({ moduleId })),
    [dispatch]
  );
  const uploadModule = useCallback((payload) => dispatch(uploadModuleRequest(payload)), [dispatch]);
  const updateEnrollmentStatus = useCallback(
    (enrollmentId, status) => dispatch(updateEnrollmentStatusRequest({ enrollmentId, status })),
    [dispatch]
  );

  return useMemo(
    () => ({
      submitEnrollment,
      simulateQuiz,
      fetchQuestionSet,
      toggleModuleVisibility,
      uploadModule,
      updateEnrollmentStatus,
    }),
    [
      fetchQuestionSet,
      simulateQuiz,
      submitEnrollment,
      toggleModuleVisibility,
      updateEnrollmentStatus,
      uploadModule,
    ]
  );
}
