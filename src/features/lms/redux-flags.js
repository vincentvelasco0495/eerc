export const LMS_REDUX_FLAGS = {
  readByRedux: true,
  writeByRedux: true,
  endpointReads: {
    '/api/user': true,
    '/api/meta': true,
    '/api/programs': true,
    '/api/programs/*/stats': true,
    '/api/instructors': true,
    '/api/instructors/linkable-users': true,
    '/api/students': true,
    '/api/students/linkable-users': true,
    '/api/courses': true,
    '/api/courses/*/detail': true,
    '/api/courses/*/stats': true,
    '/api/modules': true,
    '/api/quizzes': true,
    '/api/quiz-results': true,
    '/api/courses/*/lesson-progress': true,
    '/api/analytics': true,
    '/api/leaderboard': true,
    '/api/enrollments': true,
    '/api/admin': true,
  },
};

export function shouldUseReduxRead(endpoint) {
  if (!LMS_REDUX_FLAGS.readByRedux) return false;
  if (!endpoint) return false;
  const normalized = String(endpoint).trim();
  if (!normalized) return false;
  const map = LMS_REDUX_FLAGS.endpointReads;
  if (map[normalized]) return true;
  if (/^\/api\/programs(\?.*)?$/.test(normalized)) {
    return Boolean(map['/api/programs']);
  }
  if (/^\/api\/instructors(\?.*)?$/.test(normalized)) {
    return Boolean(map['/api/instructors']);
  }
  if (/^\/api\/students(\?.*)?$/.test(normalized)) {
    return Boolean(map['/api/students']);
  }
  if (/^\/api\/enrollments(\?.*)?$/.test(normalized)) {
    return Boolean(map['/api/enrollments']);
  }
  if (normalized.startsWith('/api/programs/') && normalized.endsWith('/stats')) {
    return Boolean(map['/api/programs/*/stats']);
  }
  if (normalized.startsWith('/api/courses/') && normalized.endsWith('/stats')) {
    return Boolean(map['/api/courses/*/stats']);
  }
  if (normalized.startsWith('/api/courses/') && normalized.endsWith('/detail')) {
    return Boolean(map['/api/courses/*/detail']);
  }
  if (normalized.startsWith('/api/courses/') && normalized.endsWith('/lesson-progress')) {
    return Boolean(map['/api/courses/*/lesson-progress']);
  }
  if (normalized.startsWith('/api/leaderboard')) return Boolean(map['/api/leaderboard']);
  if (normalized.startsWith('/api/courses')) return Boolean(map['/api/courses']);
  if (normalized.startsWith('/api/modules')) return Boolean(map['/api/modules']);
  if (normalized.startsWith('/api/quizzes')) return Boolean(map['/api/quizzes']);
  return false;
}
