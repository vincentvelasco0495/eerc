import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lmsSwrFetcher } from 'src/services/lms-swr';
import {
  selectAppState,
  selectLmsLoading,
  selectQuizzesState,
  selectIsBootstrapping,
  selectIsAnyLmsMutationPending,
} from 'src/app/store/selectors/lms.selectors';
import {
  simulateQuizRequest,
  uploadModuleRequest,
  submitEnrollmentRequest,
  fetchQuizQuestionSetRequest,
  toggleModuleVisibilityRequest,
  updateEnrollmentStatusRequest,
} from 'src/app/store/modules/lms';

export function useLmsAppState() {
  return useSelector(selectAppState);
}

export function useLmsLoading() {
  return useSelector(selectLmsLoading);
}

export function useIsBootstrapping() {
  return useSelector(selectIsBootstrapping);
}

export function useIsAnyLmsMutationPending() {
  return useSelector(selectIsAnyLmsMutationPending);
}

export function useLmsUser() {
  const { data, isLoading, error } = useSWR('/api/user', lmsSwrFetcher, { dedupingInterval: 5000 });
  return { user: data ?? null, isLoading: Boolean(isLoading && !data), error };
}

export function useLmsMeta() {
  const { data } = useSWR('/api/meta', lmsSwrFetcher, { dedupingInterval: 60_000 });
  return (
    data ?? {
      todayLabel: '',
      leaderboardPeriods: [],
      learningFlowSteps: [],
    }
  );
}

export function useLmsPrograms() {
  const { data, isLoading } = useSWR('/api/programs', lmsSwrFetcher, { dedupingInterval: 10_000 });
  return { programs: data?.data ?? [], isLoading: Boolean(isLoading && !data) };
}

export function useLmsCourses(page = 1, limit = 100) {
  const key = `/api/courses?page=${page}&limit=${limit}`;
  const { data, isLoading, error, mutate } = useSWR(key, lmsSwrFetcher, { dedupingInterval: 10_000 });
  return {
    courses: data?.data ?? [],
    meta: data?.meta,
    isLoading: Boolean(isLoading && !data),
    error,
    mutate,
  };
}

export function useResolvedCourseIdFromLookup(courseLookup) {
  const { courses } = useLmsCourses(1, 500);

  return useMemo(() => {
    if (!courseLookup) {
      return '';
    }
    const byId = courses.find((course) => course.id === courseLookup);
    if (byId) {
      return byId.id;
    }
    const bySlug = courses.find((course) => course.slug === courseLookup);
    return bySlug?.id ?? '';
  }, [courses, courseLookup]);
}

export function useLmsCourse(courseId) {
  const { courses } = useLmsCourses(1, 500);
  return useMemo(() => courses.find((course) => course.id === courseId), [courses, courseId]);
}

export function useLmsModulesByCourse(courseId, swrOptions = {}) {
  const key = courseId ? `/api/modules?courseId=${encodeURIComponent(courseId)}` : null;
  const { data, isLoading, mutate } = useSWR(key, lmsSwrFetcher, {
    dedupingInterval: 10_000,
    ...swrOptions,
  });
  return {
    modules: data?.data ?? [],
    isLoading: Boolean(isLoading && courseId && !data),
    mutate,
  };
}

export function useLmsModule(moduleId) {
  const key = moduleId ? `/api/modules?ids=${encodeURIComponent(moduleId)}` : null;
  const { data, isLoading } = useSWR(key, lmsSwrFetcher);
  const list = data?.data ?? [];
  return { module: list[0] ?? null, isLoading: Boolean(isLoading && moduleId && !data) };
}

export function useLmsQuizzes(moduleId) {
  const key = moduleId
    ? `/api/quizzes?moduleId=${encodeURIComponent(moduleId)}`
    : '/api/quizzes';
  const { data, isLoading, mutate } = useSWR(key, lmsSwrFetcher, { dedupingInterval: 10_000 });
  return {
    quizzes: data?.data ?? [],
    isLoading: Boolean(isLoading && !data),
    mutate,
  };
}

export function useLmsQuiz(quizId) {
  const { quizzes } = useLmsQuizzes();
  return useMemo(() => quizzes.find((quiz) => quiz.id === quizId), [quizzes, quizId]);
}

export function useLmsQuizHistory(quizId) {
  const { data } = useSWR('/api/quiz-results', lmsSwrFetcher, { dedupingInterval: 10_000 });
  return useMemo(() => {
    const results = data?.data ?? [];
    return results.filter((result) => result.quizId === quizId);
  }, [data?.data, quizId]);
}

export function useLmsQuizResults() {
  const { data, isLoading } = useSWR('/api/quiz-results', lmsSwrFetcher, { dedupingInterval: 10_000 });
  return { results: data?.data ?? [], isLoading: Boolean(isLoading && !data) };
}

export function useLmsQuestionSets() {
  return useSelector(selectQuizzesState).questionSets;
}

export function useLmsAnalytics() {
  const { data, isLoading } = useSWR('/api/analytics', lmsSwrFetcher, { dedupingInterval: 15_000 });
  return { analytics: data ?? null, isLoading: Boolean(isLoading && !data) };
}

export function useSuggestedModules() {
  const { analytics } = useLmsAnalytics();
  const ids = analytics?.suggestedModuleIds ?? [];
  const key = ids.length ? `/api/modules?ids=${encodeURIComponent(ids.join(','))}` : null;
  const { data } = useSWR(key, lmsSwrFetcher, { dedupingInterval: 15_000 });
  return data?.data ?? [];
}

export function useLeaderboard(period) {
  const key = `/api/leaderboard?type=${encodeURIComponent(period)}`;
  const { data } = useSWR(key, lmsSwrFetcher, { dedupingInterval: 15_000 });
  return data?.data ?? [];
}

export function useLmsEnrollments() {
  const { data, isLoading } = useSWR('/api/enrollments', lmsSwrFetcher, { dedupingInterval: 10_000 });
  return { enrollments: data?.data ?? [], isLoading: Boolean(isLoading && !data) };
}

export function useAdminData() {
  const { data, isLoading } = useSWR('/api/admin', lmsSwrFetcher, { dedupingInterval: 15_000 });
  return {
    admin: data ?? { users: [], uploads: [] },
    isLoading: Boolean(isLoading && !data),
  };
}

export function useLmsActions() {
  const dispatch = useDispatch();
  const submitEnrollment = useCallback(
    (courseId) => dispatch(submitEnrollmentRequest({ courseId })),
    [dispatch]
  );
  const simulateQuiz = useCallback(
    (quizId) => dispatch(simulateQuizRequest({ quizId })),
    [dispatch]
  );
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

/** @deprecated Use `useLmsEnrollments`. */
export function useEnrollment() {
  const { enrollments } = useLmsEnrollments();
  return enrollments;
}
