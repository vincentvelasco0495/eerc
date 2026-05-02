import { paths } from 'src/routes/paths';

import { getCourseCopy } from 'src/features/courses/data/course-page-copy';
import { mergeTabsContentFromCourseApi } from 'src/features/courses/utils/merge-course-tabs-from-api';

// ----------------------------------------------------------------------

const THUMB_POOL = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1631543918753-70913d8f897f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517842645767-c167b782060d?auto=format&fit=crop&w=400&q=80',
];

const HERO_POOL = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d1799289902?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80',
];

const BADGE_TONES = ['hot', 'special', 'default'];

function stableHash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i += 1) {
    h = Math.imul(31, h) + String(str).charCodeAt(i);
  }
  return Math.abs(h);
}

function pickImage(seed, pool) {
  const i = stableHash(seed) % pool.length;
  return pool[i];
}

function deriveLessonType(m) {
  if (m.streamingOnly) {
    return 'stream';
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

function courseHref(courseRow) {
  const slug =
    typeof courseRow.slug === 'string' && courseRow.slug.trim() ? courseRow.slug.trim() : courseRow.id;
  return slug ? paths.dashboard.courseDetails(slug) : '#';
}

/**
 * LMS API records → payloads for `{@link CourseDetailLayout}` (styled-components /course-detail UI).
 *
 * @param {object} course
 * @param {object[]} modules
 * @param {object[]} quizzesForCourse  quizzes where `quiz.courseId === course.id`
 * @param {object[]} allCourses         catalog excluding current for related lists
 */
export function mapLmsToStyledCourseDetail(course, modules, quizzesForCourse, allCourses = []) {
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
          const expandable = !!(m.summary && String(m.summary).trim());
          const peekBody =
            expandable && String(m.summary).trim()
              ? String(m.summary).trim()
              : 'More detail for this module will appear here.';

          const lessons = [
            {
              id: `${m.id}-core`,
              order: 1,
              type: mainType,
              title: m.title,
              meta: m.duration ?? '—',
              expandable,
              peekBody,
            },
            ...quizzes.map((q, qi) => ({
              id: q.id,
              order: qi + 2,
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
    badge: typeof copy.badge === 'string' && copy.badge.trim() ? copy.badge : '',
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

  const bannerFromMarketing =
    course?.marketing &&
    typeof course.marketing.bannerImageUrl === 'string' &&
    course.marketing.bannerImageUrl.trim()
      ? course.marketing.bannerImageUrl.trim()
      : '';

  const heroImageUrl =
    bannerFromMarketing || pickImage(course.id ?? course.slug ?? 'hero', HERO_POOL);

  const siblingCourses = Array.isArray(allCourses) ? allCourses.filter((row) => row.id !== course.id) : [];

  const toMiniCard = (row, idx) => {
    const seed = `${row.id ?? idx}`;
    const h = stableHash(seed);
    const badgeTone = BADGE_TONES[h % BADGE_TONES.length];
    const badge = row.tags?.[0] ?? ([0, 2].includes(idx % 5) ? 'NEW' : '');

    return {
      id: row.id ?? `c-${idx}`,
      title: row.title ?? 'Course',
      badge: badge || null,
      badgeTone,
      href: courseHref(row),
      imageUrl: pickImage(seed, THUMB_POOL),
      priceLabel: 'Free',
      instructor: typeof row.mentor === 'string' && row.mentor.trim() ? row.mentor.trim() : 'Instructor',
      rating: Number.isFinite(4 + (h % 10) / 10) ? 4 + (h % 10) / 10 : 4.5,
    };
  };

  const popularCoursesItems = siblingCourses.slice(0, 4).map(toMiniCard);

  const relatedCoursesItems = siblingCourses.slice(0, 3).map((row, idx) => {
    const base = toMiniCard(row, idx + 99);
    return {
      ...base,
      badge: idx === 1 ? 'HOT' : idx === 0 ? 'SPECIAL' : base.badge ?? 'NEW',
      badgeTone: BADGE_TONES[idx % BADGE_TONES.length],
      ...(idx === 0 ? { priceStrike: '$49.99' } : {}),
    };
  });

  /** Notice tab Related strip uses the same LMS sibling courses as Description/Curriculum. */
  const noticeRelatedCoursesItems = relatedCoursesItems;

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

  return {
    data,
    heroImageUrl,
    completion,
    detailRows,
    curriculumModules,
    popularCoursesItems,
    relatedCoursesItems,
    noticeContent,
    noticeRelatedCoursesItems,
    faqItems,
    continueHref,
  };
}
