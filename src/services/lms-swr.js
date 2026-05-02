import { mutate } from 'swr';

import { lmsGet } from './api';

export function lmsSwrFetcher(key) {
  return lmsGet(key);
}

export function revalidateByPrefix(prefix) {
  return mutate((key) => typeof key === 'string' && key.startsWith(prefix));
}

export function revalidateAfterQuizAttempt() {
  return Promise.all([
    revalidateByPrefix('/api/quizzes'),
    revalidateByPrefix('/api/quiz-results'),
    revalidateByPrefix('/api/analytics'),
    revalidateByPrefix('/api/leaderboard'),
  ]);
}

export function revalidateAfterEnrollmentChange() {
  return Promise.all([
    revalidateByPrefix('/api/enrollments'),
    revalidateByPrefix('/api/analytics'),
  ]);
}

export function revalidateAfterModuleVisibility() {
  return Promise.all([
    revalidateByPrefix('/api/modules'),
    revalidateByPrefix('/api/analytics'),
  ]);
}

export function revalidateAfterAdminUpload() {
  return revalidateByPrefix('/api/admin');
}
