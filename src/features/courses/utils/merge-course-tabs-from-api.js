/** @typedef {{ question?: string; answer?: string }} FaqLike */

/** @typedef {{ body?: string[]; learn?: string[]; audience?: string[]; faqs?: FaqLike[]; notices?: string[]; description?: string }} CopyShape */

/** @returns {string[]} */
function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((x) => String(x).trim()).filter(Boolean);
}

/**
 * Prefer LMS `course.marketing` from API when non-empty; otherwise use static `copy` fallback.
 * @param {object} course LMS course payload (includes optional `marketing` from `/api/courses`)
 * @param {CopyShape} copy from {@link import('../data/course-page-copy.js').getCourseCopy}
 */
export function mergeTabsContentFromCourseApi(course, copy) {
  const m = course?.marketing && typeof course.marketing === 'object' ? course.marketing : {};

  const paragraphs = (() => {
    const api = normalizeStringList(m.paragraphs);
    if (api.length > 0) {
      return api;
    }
    return normalizeStringList(copy?.body);
  })();

  const learningOutcomes = (() => {
    const api = normalizeStringList(m.learningOutcomes);
    return api.length > 0 ? api : normalizeStringList(copy?.learn);
  })();

  const audience = (() => {
    const api = normalizeStringList(m.audience);
    return api.length > 0 ? api : normalizeStringList(copy?.audience);
  })();

  const noticeStrings = (() => {
    const api = normalizeStringList(m.notices);
    return api.length > 0 ? api : normalizeStringList(copy?.notices);
  })();

  const faqPairs = (() => {
    const raw = Array.isArray(m.faq) ? m.faq : [];
    const fromApi = raw
      .filter((row) => row && typeof row === 'object')
      .map((row) => ({
        question: String(row.question ?? '').trim(),
        answer: String(row.answer ?? '').trim(),
      }))
      .filter((row) => row.question || row.answer);
    if (fromApi.length > 0) {
      return fromApi;
    }
    const fromCopy = Array.isArray(copy?.faqs)
      ? copy.faqs.map((row) => ({
          question: String(row?.question ?? '').trim(),
          answer: String(row?.answer ?? '').trim(),
        }))
      : [];
    const merged = fromCopy.filter((row) => row.question || row.answer);
    if (merged.length > 0) {
      return merged;
    }

    return [
      {
        question: `What does ${course.title ?? 'this course'} cover?`,
        answer:
          typeof course.description === 'string' && course.description.trim()
            ? course.description.trim()
            : 'See the curriculum tab for module-by-module learning outcomes.',
      },
    ];
  })();

  const finalNoticeStrings =
    noticeStrings.length > 0
      ? noticeStrings
      : ['Program announcements and pacing updates will appear here.'];

  const noticeHeading =
    typeof m.noticeHeading === 'string' && m.noticeHeading.trim() ? m.noticeHeading.trim() : null;

  return {
    paragraphs,
    learningOutcomes,
    audience,
    faqPairs,
    noticeStrings: finalNoticeStrings,
    noticeHeading,
  };
}
