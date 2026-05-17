import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState, useEffect, useCallback } from 'react';

import axios from 'src/lib/axios';
import { lmsEndpoints } from 'src/redux/api/lmsEndpoints';
import { LMS_REDUX_FLAGS, shouldUseReduxRead } from 'src/features/lms/redux-flags';
import { getApprovedProgramIds } from 'src/features/student-profile/student-profile-data';
import {
  selectAppState,
  selectLmsLoading,
  selectQuizzesState,
  selectIsBootstrapping,
  selectLmsResourceByKey,
  selectIsAnyLmsMutationPending,
} from 'src/app/store/selectors/lms.selectors';
import {
  lmsCommandRequest,
  simulateQuizRequest,
  uploadModuleRequest,
  lmsResourceFetchRequest,
  submitEnrollmentRequest,
  fetchQuizQuestionSetRequest,
  toggleModuleVisibilityRequest,
  updateEnrollmentStatusRequest,
} from 'src/app/store/modules/lms';

const inFlightReduxResourceRequests = new Set();

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

function useReduxLmsResource(endpoint, enabled = true, options = {}) {
  const dispatch = useDispatch();
  const useRedux = Boolean(enabled && shouldUseReduxRead(endpoint));
  const resource = useSelector((state) => selectLmsResourceByKey(state, endpoint));
  const ttlMs = Number(options.ttlMs ?? 10_000);
  const canRefetch = Boolean(options.refetchOnMount ?? true);
  const retryOnError = Boolean(options.retryOnError ?? false);

  useEffect(() => {
    if (!useRedux || !canRefetch) return;
    if (!endpoint) return;
    if (resource?.isLoading) return;
    if (inFlightReduxResourceRequests.has(endpoint)) return;
    const fresh = resource?.updatedAt && Date.now() - Number(resource.updatedAt) < ttlMs;
    if (fresh) return;
    // Avoid a tight request loop after an error; allow manual mutate() or explicit retryOnError.
    if (resource?.error && !retryOnError) return;
    inFlightReduxResourceRequests.add(endpoint);
    dispatch(lmsResourceFetchRequest({ key: endpoint, endpoint }));
  }, [
    canRefetch,
    dispatch,
    endpoint,
    resource?.error,
    resource?.isLoading,
    resource?.updatedAt,
    retryOnError,
    ttlMs,
    useRedux,
  ]);

  useEffect(() => {
    if (!useRedux || !endpoint) return;
    if (resource && !resource.isLoading) {
      inFlightReduxResourceRequests.delete(endpoint);
    }
  }, [endpoint, resource, resource?.isLoading, useRedux]);

  const mutate = useCallback(() => {
    if (!useRedux) return Promise.resolve();
    return new Promise((resolve, reject) => {
      inFlightReduxResourceRequests.add(endpoint);
      dispatch(
        lmsResourceFetchRequest({
          key: endpoint,
          endpoint,
          resolve,
          reject,
        })
      );
    });
  }, [dispatch, endpoint, useRedux]);

  return {
    useRedux,
    data: resource?.data,
    error: resource?.error ?? null,
    isLoading: Boolean(useRedux && (resource?.isLoading || !resource)),
    mutate,
  };
}

export function useLmsUser(enabled = true) {
  const key = enabled ? lmsEndpoints.user() : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 5000 });
  return {
    user: redux.data ?? null,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useLmsMeta() {
  const redux = useReduxLmsResource(lmsEndpoints.meta(), true, { ttlMs: 60_000 });
  const source = redux.data;
  return (
    source ?? {
      todayLabel: '',
      leaderboardPeriods: [],
      learningFlowSteps: [],
    }
  );
}

export function useLmsPrograms() {
  const redux = useReduxLmsResource(lmsEndpoints.programs(), true, { ttlMs: 10_000 });
  return {
    programs: redux.data?.data ?? [],
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useLmsProgramsPaginated(page = 1, perPage = 10, search = '') {
  const endpoint = useMemo(
    () =>
      lmsEndpoints.programsPaginated({
        page,
        perPage,
        search: typeof search === 'string' ? search : '',
      }),
    [page, perPage, search]
  );
  const redux = useReduxLmsResource(endpoint, true, { ttlMs: 10_000 });
  const payload = redux.data ?? {};
  const meta = payload?.meta ?? null;
  return {
    programs: payload?.data ?? [],
    meta,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useRefreshLmsProgramsCatalog() {
  const dispatch = useDispatch();
  return useCallback(() => {
    const endpoint = lmsEndpoints.programs();
    if (!shouldUseReduxRead(endpoint)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      dispatch(lmsResourceFetchRequest({ key: endpoint, endpoint, resolve, reject }));
    });
  }, [dispatch]);
}

/** Full instructor roster (`GET /api/instructors` without pagination). */
export function useLmsInstructors() {
  const redux = useReduxLmsResource(lmsEndpoints.instructors(), true, { ttlMs: 10_000 });
  return {
    instructors: redux.data?.data ?? [],
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useLmsInstructorsPaginated(page = 1, perPage = 10, search = '') {
  const endpoint = useMemo(
    () =>
      lmsEndpoints.instructorsPaginated({
        page,
        perPage,
        search: typeof search === 'string' ? search : '',
      }),
    [page, perPage, search]
  );
  const redux = useReduxLmsResource(endpoint, true, { ttlMs: 10_000 });
  const payload = redux.data ?? {};
  const meta = payload?.meta ?? null;
  return {
    instructors: payload?.data ?? [],
    meta,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useRefreshInstructorsCatalog() {
  const dispatch = useDispatch();
  return useCallback(() => {
    const endpoint = lmsEndpoints.instructors();
    if (!shouldUseReduxRead(endpoint)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      dispatch(lmsResourceFetchRequest({ key: endpoint, endpoint, resolve, reject }));
    });
  }, [dispatch]);
}

export function useLmsInstructorLinkableUsers() {
  const endpoint = lmsEndpoints.instructorsLinkableUsers();
  const redux = useReduxLmsResource(endpoint, true, { ttlMs: 10_000 });
  return {
    linkableUsers: redux.data?.data ?? [],
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useLmsStudentsPaginated(page = 1, perPage = 10, search = '') {
  const endpoint = useMemo(
    () =>
      lmsEndpoints.studentsPaginated({
        page,
        perPage,
        search: typeof search === 'string' ? search : '',
      }),
    [page, perPage, search]
  );
  const redux = useReduxLmsResource(endpoint, true, { ttlMs: 10_000 });
  const payload = redux.data ?? {};
  const meta = payload?.meta ?? null;
  return {
    students: payload?.data ?? [],
    meta,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useRefreshStudentsCatalog() {
  const dispatch = useDispatch();
  return useCallback(() => {
    const endpoint = lmsEndpoints.students();
    if (!shouldUseReduxRead(endpoint)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      dispatch(lmsResourceFetchRequest({ key: endpoint, endpoint, resolve, reject }));
    });
  }, [dispatch]);
}

export function useLmsStudentLinkableUsers() {
  const endpoint = lmsEndpoints.studentsLinkableUsers();
  const redux = useReduxLmsResource(endpoint, true, { ttlMs: 10_000 });
  return {
    linkableUsers: redux.data?.data ?? [],
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useLmsProgramStats(programPublicId) {
  const key = programPublicId ? lmsEndpoints.programStats(programPublicId) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  return {
    stats: redux.data?.data ?? null,
    isLoading: redux.isLoading,
    error: redux.error,
  };
}

export function useLmsCourses(page = 1, limit = 100, program = '') {
  const key = lmsEndpoints.courses({ page, limit, program });
  const redux = useReduxLmsResource(key, true, { ttlMs: 10_000 });
  const payload = redux.data ?? {};
  return {
    courses: payload?.data ?? [],
    meta: payload?.meta,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

/** Published catalog courses for programs the learner is approved on (per-program fetch). */
export function useLmsEnrolledProgramCourses(enrollments = []) {
  const approvedProgramIds = useMemo(
    () => [...getApprovedProgramIds(enrollments, [])],
    [enrollments]
  );
  const programKey = approvedProgramIds.join('|');

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(programKey));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!programKey) {
      setCourses([]);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const responses = await Promise.all(
          approvedProgramIds.map((programId) =>
            axios
              .get(lmsEndpoints.courses({ page: 1, limit: 500, program: programId }))
              .then((res) => res.data)
          )
        );

        if (cancelled) {
          return;
        }

        const byId = new Map();
        responses.forEach((payload) => {
          (Array.isArray(payload?.data) ? payload.data : []).forEach((course) => {
            if (course?.id) {
              byId.set(course.id, course);
            }
          });
        });

        setCourses([...byId.values()]);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setCourses([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [approvedProgramIds, programKey]);

  return { courses, isLoading, error };
}

export function useLmsCourseByLookup(courseLookup) {
  const normalized = String(courseLookup ?? '').trim();
  const key = normalized ? lmsEndpoints.courseDetail(normalized) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  return {
    course: redux.data?.data ?? null,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function resolveCourseIdFromCatalog(courses, courseLookup) {
  if (!courseLookup) {
    return '';
  }
  const normalizedLookup = decodeURIComponent(String(courseLookup).trim()).toLowerCase();
  if (!normalizedLookup) {
    return '';
  }

  const byId = (Array.isArray(courses) ? courses : []).find(
    (course) => String(course.id ?? '').trim() === String(courseLookup).trim()
  );
  if (byId) {
    return byId.id;
  }

  const byExactSlug = (Array.isArray(courses) ? courses : []).find(
    (course) => String(course.slug ?? '').trim().toLowerCase() === normalizedLookup
  );
  if (byExactSlug) {
    return byExactSlug.id;
  }

  // Fallback for stale links when a slug was later de-duplicated to `${slug}-2`, `${slug}-3`, etc.
  const prefixed = (Array.isArray(courses) ? courses : [])
    .filter((course) => {
      const slug = String(course.slug ?? '').trim().toLowerCase();
      return slug.startsWith(`${normalizedLookup}-`);
    })
    .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')));

  return prefixed[0]?.id ?? '';
}

export function useResolvedCourseIdFromLookup(courseLookup) {
  const { courses } = useLmsCourses(1, 500);

  return useMemo(() => resolveCourseIdFromCatalog(courses, courseLookup), [courses, courseLookup]);
}

export function useLmsCourse(courseId) {
  const { courses } = useLmsCourses(1, 500);
  return useMemo(() => courses.find((course) => course.id === courseId), [courses, courseId]);
}

export function useLmsCourseStats(courseId) {
  const key = courseId ? lmsEndpoints.courseStats(courseId) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  return {
    stats: redux.data?.data ?? null,
    isLoading: redux.isLoading,
    error: redux.error,
  };
}

export function useLmsModulesByCourse(courseId, swrOptions = {}) {
  const key = courseId ? lmsEndpoints.modulesByCourse(courseId) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  void swrOptions;
  return {
    modules: redux.data?.data ?? [],
    isLoading: redux.isLoading,
    mutate: redux.mutate,
  };
}

export function useLmsModule(moduleId) {
  const key = moduleId ? lmsEndpoints.moduleById(moduleId) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  const list = redux.data?.data ?? [];
  return { module: list[0] ?? null, isLoading: redux.isLoading };
}

export function useLmsQuizzes(moduleId) {
  const key = lmsEndpoints.quizzes(moduleId);
  const redux = useReduxLmsResource(key, true, { ttlMs: 10_000 });
  return {
    quizzes: redux.data?.data ?? [],
    isLoading: redux.isLoading,
    mutate: redux.mutate,
  };
}

export function extractQuizzesFromModules(modules) {
  return (Array.isArray(modules) ? modules : []).flatMap((moduleItem) =>
    Array.isArray(moduleItem?.quizzes) ? moduleItem.quizzes : []
  );
}

export function useLmsCourseQuizzes(courseId) {
  const { modules, isLoading, mutate } = useLmsModulesByCourse(courseId);
  const quizzes = useMemo(() => extractQuizzesFromModules(modules), [modules]);
  return { quizzes, isLoading, mutateModules: mutate };
}

export function useLmsQuiz(quizId) {
  const { quizzes } = useLmsQuizzes();
  return useMemo(() => quizzes.find((quiz) => quiz.id === quizId), [quizzes, quizId]);
}

export function useLmsQuizHistory(quizId) {
  const redux = useReduxLmsResource(lmsEndpoints.quizResults(), true, { ttlMs: 10_000 });
  const source = redux.data;
  return useMemo(() => {
    const results = source?.data ?? [];
    return results.filter((result) => result.quizId === quizId);
  }, [source?.data, quizId]);
}

export function useLmsQuizResults(enabled = true) {
  const key = enabled ? lmsEndpoints.quizResults() : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  return { results: redux.data?.data ?? [], isLoading: redux.isLoading, mutate: redux.mutate };
}

export function useLmsLessonProgress(courseId, enabled = true) {
  const key = enabled && courseId ? lmsEndpoints.lessonProgress(courseId) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 10_000 });
  return {
    lessonProgressKeys: Array.isArray(redux.data?.data) ? redux.data.data : [],
    isLoading: redux.isLoading,
    mutate: redux.mutate,
  };
}

export function useLmsQuestionSets() {
  return useSelector(selectQuizzesState).questionSets;
}

export function useLmsAnalytics() {
  const redux = useReduxLmsResource(lmsEndpoints.analytics(), true, { ttlMs: 15_000 });
  return { analytics: redux.data ?? null, isLoading: redux.isLoading };
}

export function useSuggestedModules() {
  const { analytics } = useLmsAnalytics();
  const ids = analytics?.suggestedModuleIds ?? [];
  const key = ids.length ? lmsEndpoints.modulesByIds(ids) : null;
  const redux = useReduxLmsResource(key, Boolean(key), { ttlMs: 15_000 });
  return redux.data?.data ?? [];
}

export function useLeaderboard(period) {
  const key = lmsEndpoints.leaderboard(period);
  const redux = useReduxLmsResource(key, true, { ttlMs: 15_000 });
  return redux.data?.data ?? [];
}

export function useLmsEnrollments(enabled = true) {
  const redux = useReduxLmsResource(lmsEndpoints.enrollments(), enabled, { ttlMs: 10_000 });
  return { enrollments: redux.data?.data ?? [], isLoading: redux.isLoading, mutate: redux.mutate };
}

export function useLmsEnrollmentsPaginated(page = 1, perPage = 10, search = '') {
  const endpoint = useMemo(
    () =>
      lmsEndpoints.enrollmentsPaginated({
        page,
        perPage,
        search: typeof search === 'string' ? search : '',
      }),
    [page, perPage, search]
  );
  const redux = useReduxLmsResource(endpoint, true, { ttlMs: 10_000 });
  const payload = redux.data ?? {};
  return {
    enrollments: payload?.data ?? [],
    meta: payload?.meta ?? null,
    isLoading: redux.isLoading,
    error: redux.error,
    mutate: redux.mutate,
  };
}

export function useRefreshEnrollmentsCatalog() {
  const dispatch = useDispatch();
  return useCallback(() => {
    const endpoint = lmsEndpoints.enrollments();
    if (!shouldUseReduxRead(endpoint)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      dispatch(lmsResourceFetchRequest({ key: endpoint, endpoint, resolve, reject }));
    });
  }, [dispatch]);
}

export function useAdminData() {
  const redux = useReduxLmsResource(lmsEndpoints.admin(), true, { ttlMs: 15_000 });
  return {
    admin: redux.data ?? { users: [], uploads: [] },
    isLoading: redux.isLoading,
  };
}

export function useLmsActions() {
  const dispatch = useDispatch();
  const submitEnrollment = useCallback(
    (programId) => dispatch(submitEnrollmentRequest({ programId })),
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
  const runCommand = useCallback(
    (command, args = {}) =>
      new Promise((resolve, reject) => {
        if (!LMS_REDUX_FLAGS.writeByRedux) {
          reject(new Error('Redux write pipeline is disabled.'));
          return;
        }
        dispatch(
          lmsCommandRequest({
            command,
            args,
            resolve,
            reject,
          })
        );
      }),
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
      runCommand,
    }),
    [
      fetchQuestionSet,
      runCommand,
      simulateQuiz,
      submitEnrollment,
      toggleModuleVisibility,
      updateEnrollmentStatus,
      uploadModule,
    ]
  );
}

/** @deprecated Use `useLmsEnrollments`. */
export function useEnrollment(enabled = true) {
  const { enrollments } = useLmsEnrollments(enabled);
  return enrollments;
}
