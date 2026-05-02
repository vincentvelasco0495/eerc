function deriveLessonType(m) {
  if (m.streamingOnly) {
    return 'video';
  }
  const hasVideo = Array.isArray(m.resources) && m.resources.includes('Video');
  if (hasVideo) {
    return 'video';
  }
  const step = typeof m.type === 'string' ? m.type.toLowerCase() : '';
  if (step.includes('practice') || step.includes('coach') || step.includes('final')) {
    return 'quiz';
  }
  return 'document';
}

/**
 * Mirrors learner curriculum mapping → curriculum builder sidebar/module shape.
 *
 * @param {object[]} modules `/api/modules?courseId=…`
 * @param {object[]} quizzesForCourse quizzes with `courseId` / `moduleId`
 */
export function mapLmsModulesToCurriculumBuilder(modules, quizzesForCourse = []) {
  const sorted = [...(modules ?? [])].filter((m) => m && m.visible !== false);

  const quizzesByModule = new Map();
  (Array.isArray(quizzesForCourse) ? quizzesForCourse : []).forEach((q) => {
    if (!q?.moduleId) {
      return;
    }
    const list = quizzesByModule.get(q.moduleId) ?? [];
    list.push(q);
    quizzesByModule.set(q.moduleId, list);
  });

  return sorted.map((m, mi) => {
    const quizzes = quizzesByModule.get(m.id) ?? [];
    const mainType = deriveLessonType(m);
    const standalone = Array.isArray(m.standaloneLessons)
      ? m.standaloneLessons.slice()
      : [];
    const standaloneRows = standalone
      .filter((row) => row && typeof row.id === 'string' && row.kind && row.kind !== 'quiz')
      .map((sl) => ({
        id: sl.id,
        draft: false,
        type: sl.kind,
        title: sl.title ?? 'Lesson',
        meta: sl.kind === 'document' ? 'Text' : `${String(sl.kind).replace(/^\w/, (c) => c.toUpperCase())}`,
      }));
    const lessons = [
      {
        id: `${m.id}-core`,
        draft: false,
        type: mainType,
        title: m.title ?? 'Lesson',
        meta: m.duration ?? '—',
      },
      ...standaloneRows,
      ...quizzes.map((q) => ({
        id: q.id,
        draft: false,
        type: 'quiz',
        title: q.title ?? 'Quiz',
        meta: `${q.questionCount ?? 0} questions`,
      })),
    ];

    const titleParts = [];
    if (m.subject && String(m.subject).trim()) {
      titleParts.push(String(m.subject).trim());
    }
    titleParts.push(m.title ?? 'Lesson');

    return {
      id: m.id,
      title: titleParts.join(' — '),
      defaultOpen: mi < 8,
      lessons,
    };
  });
}
