import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { resolveCourseHeroImageUrl } from 'src/utils/course-hero-image';

dayjs.extend(relativeTime);

const ICONS = [
  'solar:book-bookmark-bold-duotone',
  'solar:cpu-bolt-bold-duotone',
  'solar:shield-keyhole-bold-duotone',
  'solar:global-bold-duotone',
  'solar:notes-bold-duotone',
  'solar:play-stream-bold-duotone',
  'solar:clapperboard-edit-bold-duotone',
];

const BADGE_COLORS = ['error', 'success', 'info', 'warning', 'default'];

function stableHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(31, h) + str.charCodeAt(i);
  }
  return Math.abs(h);
}

/**
 * Maps `/api/courses` catalog items to the shape expected by `InstructorCourseCard`.
 */
export function mapLmsCatalogCourseToInstructorCard(course) {
  const id = course.id ?? '';
  const seed = stableHash(id || course.slug || course.title || 'x');
  const icon = ICONS[seed % ICONS.length];
  const firstTag = course.tags?.[0];
  const programTitle =
    typeof course.programTitle === 'string' && course.programTitle.trim()
      ? course.programTitle.trim()
      : '';
  const category =
    programTitle || (course.subjects?.[0] ?? firstTag ?? course.level ?? 'Course');

  let updatedAt = '—';
  if (course.updatedAt) {
    const d = dayjs(course.updatedAt);
    if (d.isValid()) {
      updatedAt = d.fromNow();
    }
  }

  const slug = typeof course.slug === 'string' ? course.slug.trim() : '';

  const status =
    typeof course.status === 'string' &&
    (course.status === 'published' || course.status === 'draft')
      ? course.status
      : course.isPublished === false
        ? 'draft'
        : 'published';

  const rating =
    typeof course.averageRating === 'number' && Number.isFinite(course.averageRating)
      ? course.averageRating
      : 0;

  return {
    id,
    /** Same URL as learner course-detail hero (`marketing.bannerImageUrl` or shared fallback). */
    bannerImageUrl: resolveCourseHeroImageUrl(course),
    /** Prefer URL slug from API; `useResolvedCourseIdFromLookup` also accepts `id` when slug is absent. */
    detailSlug: slug || id || '',
    status,
    badge: firstTag ?? null,
    badgeColor: firstTag ? BADGE_COLORS[seed % BADGE_COLORS.length] : 'default',
    category,
    title: course.title ?? 'Untitled',
    lessons: course.totalModules ?? 0,
    durationHours: course.hours ?? 0,
    rating,
    updatedAt,
    icon,
  };
}
