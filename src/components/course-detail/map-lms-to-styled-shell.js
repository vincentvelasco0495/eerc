import { paths } from 'src/routes/paths';

import { resolveCourseHeroImageUrl } from 'src/utils/course-hero-image';

import { getCourseCopy } from 'src/features/courses/data/course-page-copy';
import { mergeTabsContentFromCourseApi } from 'src/features/courses/utils/merge-course-tabs-from-api';
import {
  deriveLessonType,
  coreLessonListTitle,
} from 'src/features/instructor-course-builder/utils/map-lms-modules-to-curriculum-builder';

// ----------------------------------------------------------------------

function plainTextFromRichLessonFields(row) {
  if (!row || typeof row !== 'object') {
    return '';
  }
  const ex = row.excerptHtml;
  if (typeof ex === 'string' && ex.trim()) {
    return ex.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const body = row.bodyHtml;
  if (typeof body === 'string' && body.trim()) {
    return body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const sum = row.summary;
  if (typeof sum === 'string' && sum.trim()) {
    return sum.trim();
  }
  return '';
}

function reviewsToRating(copy) {
  const reviews = copy.reviews ?? [];
  if (reviews.length === 0) {
    return {
      value: 4,
      max: 5,
      scoreLabel: '—',
      reviewLine: '',
    };
  }

  const avg = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  const roundedStars = Math.min(5, Math.round(Math.max(0, avg)));

  let scoreLabel = '—';
  if (Number.isFinite(avg)) {
    scoreLabel =
      Math.abs(avg - Math.round(avg)) < 1e-6 ? String(Math.round(avg)) : avg.toFixed(1);
  }

  return {
    value: roundedStars,
    max: 5,
    scoreLabel,
    reviewLine: `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`,
  };
}

/**
 * LMS API records → payloads for `{@link CourseDetailLayout}` (styled-components /course-detail UI).
 *
 * @param {object} course
 * @param {object[]} modules
 * @param {object[]} quizzesForCourse  quizzes where `quiz.courseId === course.id`
 */
export function mapLmsToStyledCourseDetail(course, modules, quizzesForCourse) {
  const copy = getCourseCopy(course);
  const tabs = mergeTabsContentFromCourseApi(course, copy);

  const sortedModules = (Array.isArray(modules) ? [...modules] : []).filter((m) => m && m.visible !== false);

  const visibleIds = new Set(sortedModules.map((m) => m.id));
  const quizzesForCourseVisible = quizzesForCourse.filter(
    (quiz) => !quiz.moduleId || visibleIds.has(quiz.moduleId)
  );

  const quizzesByModule = new Map();
  quizzesForCourseVisible.forEach((quiz) => {
    if (!quiz.moduleId) {
      return;
    }
    const list = quizzesByModule.get(quiz.moduleId) ?? [];
    list.push(quiz);
    quizzesByModule.set(quiz.moduleId, list);
  });

  const curriculumModules =
    sortedModules.length > 0
      ? sortedModules.map((m, mi) => {
          const quizzes = quizzesByModule.get(m.id) ?? [];
          const mainType = deriveLessonType(m);
          const corePeek = plainTextFromRichLessonFields({
            excerptHtml: m.excerptHtml,
            bodyHtml: m.bodyHtml,
            summary: m.summary,
          });
          const expandable = !!corePeek;
          const peekBody = expandable ? corePeek : undefined;

          const standaloneSource = Array.isArray(m.standaloneLessons) ? m.standaloneLessons : [];
          const standaloneRows = standaloneSource.filter(
            (row) => row && typeof row.id === 'string' && row.kind && row.kind !== 'quiz'
          );

          const standaloneLessons = standaloneRows.map((sl, si) => {
            const peekText = plainTextFromRichLessonFields(sl);
            const slExpandable = !!peekText;
            const meta =
              sl.kind === 'document'
                ? 'Text'
                : `${String(sl.kind).replace(/^\w/, (c) => c.toUpperCase())}`;
            return {
              id: sl.id,
              order: 2 + si,
              type: sl.kind,
              title: sl.title ?? 'Lesson',
              meta,
              expandable: slExpandable,
              peekBody: slExpandable ? peekText.slice(0, 620) : undefined,
            };
          });

          const lessons = [
            {
              id: `${m.id}-core`,
              order: 1,
              type: mainType,
              title: coreLessonListTitle(m),
              meta: m.duration ?? '—',
              expandable,
              peekBody,
            },
            ...standaloneLessons,
            ...quizzes.map((q, qi) => ({
              id: q.id,
              order: 2 + standaloneRows.length + qi,
              type: 'quiz',
              title: q.title,
              meta: `${q.questionCount ?? 0} questions`,
              expandable: false,
            })),
          ];

          const titleParts = [];
          if (m.subject && String(m.subject).trim()) {
            titleParts.push(String(m.subject).trim());
          }
          titleParts.push(m.title ?? 'Lesson');

          return {
            id: `mod-wrap-${m.id}`,
            title: titleParts.join(' — '),
            defaultOpen: mi < 8,
            lessons,
          };
        })
      : [
          {
            id: 'mod-empty',
            title: 'Curriculum',
            defaultOpen: true,
            lessons: [
              {
                id: 'empty-lesson',
                order: 1,
                type: 'document',
                title: 'Modules will appear once this course publishes content.',
                meta: '—',
                expandable: false,
              },
            ],
          },
        ];

  const videoLessonsCount = sortedModules.filter(
    (m) => Array.isArray(m.resources) && m.resources.includes('Video')
  ).length;

  const lecturesCount =
    typeof course.totalModules === 'number' && course.totalModules > 0
      ? course.totalModules
      : sortedModules.length;

  const detailRows = [
    { key: 'duration', label: 'Duration', value: `${course.hours ?? 0} hours`, icon: 'clock' },
    { key: 'lectures', label: 'Lectures', value: String(lecturesCount), icon: 'book' },
    {
      key: 'video',
      label: 'Video',
      value:
        course.videoHoursLabel ??
        (videoLessonsCount > 0
          ? `${videoLessonsCount} ${videoLessonsCount === 1 ? 'lesson' : 'lessons'} with video`
          : '—'),
      icon: 'play',
    },
    { key: 'quizzes', label: 'Quizzes', value: String(quizzesForCourseVisible.length), icon: 'check' },
    { key: 'level', label: 'Level', value: course.level ?? '—', icon: 'level' },
  ];

  const totalModsRaw =
    typeof course.totalModules === 'number' && course.totalModules > 0
      ? course.totalModules
      : Math.max(sortedModules.length, 1);
  const safeTotal = Math.max(totalModsRaw, 1);
  const doneMods = typeof course.completedModules === 'number' ? course.completedModules : 0;

  let pct;
  if (typeof course.averageModuleProgressPercent === 'number' && Number.isFinite(course.averageModuleProgressPercent)) {
    pct = Math.min(100, Math.max(0, Math.round(course.averageModuleProgressPercent)));
  } else {
    pct = Math.min(100, Math.round((doneMods / safeTotal) * 100));
  }

  if (course.preview_completed) {
    pct = 100;
  }

  let quizScorePercent = null;
  if (
    typeof course.averageQuizScorePercent === 'number' &&
    Number.isFinite(course.averageQuizScorePercent)
  ) {
    quizScorePercent = Math.min(100, Math.max(0, Math.round(course.averageQuizScorePercent)));
  }

  const completion = {
    label: pct >= 100 ? 'Course complete' : `${pct}% complete`,
    quizScorePercent,
  };

  const nextModuleCandidate =
    course.nextModuleId && sortedModules.some((m) => m.id === course.nextModuleId)
      ? course.nextModuleId
      : sortedModules[0]?.id;

  const continueHref = nextModuleCandidate
    ? paths.dashboard.modules.details(nextModuleCandidate)
    : paths.dashboard.courses.root;

  const mentorName =
    typeof course.mentor === 'string' && course.mentor.trim() ? course.mentor.trim() : 'Instructor';

  const mentorInitials = mentorName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const data = {
    category: copy.category ?? 'Course',
    badge: '',
    title: course.title ?? 'Course',
    instructor: {
      name: mentorName,
      avatarUrl: `https://i.pravatar.cc/120?u=${encodeURIComponent(course.id ?? mentorInitials)}`,
    },
    rating: reviewsToRating(copy),
    shortDescription:
      typeof course.description === 'string' && course.description.trim()
        ? course.description.trim()
        : (tabs.paragraphs[0] ?? copy.description ?? ''),
    paragraphs: tabs.paragraphs,
    learningOutcomes: tabs.learningOutcomes,
    audience: tabs.audience,
  };

  const heroImageUrl = resolveCourseHeroImageUrl(course);

  const fallbackNoticeBodies =
    tabs.noticeStrings.length > 0
      ? tabs.noticeStrings
      : ['Enrollment and pacing details will be posted before the cohort starts.'];

  const noticeContent = {
    heading: tabs.noticeHeading ?? `${data.title} — program notes`,
    /** One paragraph per LMS `marketing.notices` string; no fabricated title prefix (edited in Instructor → Notice). */
    items: fallbackNoticeBodies.map((text, i) => ({
      id: `notice-${course.id}-${i}`,
      titleBold: '',
      linkLabel: '',
      href: '',
      body: typeof text === 'string' ? text : String(text ?? ''),
    })),
  };

  const faqPairs =
    tabs.faqPairs.length > 0
      ? tabs.faqPairs
      : [
          {
            question: `What does ${course.title ?? 'this course'} cover?`,
            answer:
              typeof course.description === 'string' && course.description.trim()
                ? course.description.trim()
                : 'See the curriculum tab for module-by-module learning outcomes.',
          },
        ];

  const faqItems = faqPairs.map((row, i) => ({
    id: `faq-${course.id}-${i}`,
    question: row.question,
    answer: row.answer,
  }));

  const courseLookup =
    typeof course.slug === 'string' && course.slug.trim() ? course.slug.trim() : (course.id ?? '');

  return {
    data,
    heroImageUrl,
    completion,
    detailRows,
    curriculumModules,
    noticeContent,
    faqItems,
    continueHref,
    courseLookup,
  };
}
