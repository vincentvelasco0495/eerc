/** Same hero URL rules as `{@link mapLmsToStyledCourseDetail}` / `CourseDetailLayout` (marketing banner + fallback). */

import { CONFIG } from 'src/global-config';

const HERO_POOL = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d1799289902?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80',
];

function stableHash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i += 1) {
    h = Math.imul(31, h) + String(str).charCodeAt(i);
  }
  return Math.abs(h);
}

function pickHero(seed) {
  const i = stableHash(seed) % HERO_POOL.length;
  return HERO_POOL[i];
}

function resolveServerAssetUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (/^(https?:\/\/|blob:|data:)/i.test(raw)) return raw;

  const configured = String(CONFIG.serverUrl ?? '').trim();
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : '';
  const origin = configured || fallback;
  if (!origin) return raw;

  if (raw.startsWith('/')) {
    return `${origin}${raw}`;
  }
  return `${origin}/storage/${raw.replace(/^\/+/, '')}`;
}

export function resolveCourseHeroImageUrl(course) {
  const bannerFromMarketing =
    course?.marketing &&
    typeof course.marketing.bannerImageUrl === 'string' &&
    course.marketing.bannerImageUrl.trim()
      ? course.marketing.bannerImageUrl.trim()
      : '';

  if (bannerFromMarketing) return resolveServerAssetUrl(bannerFromMarketing);

  return pickHero(course?.id ?? course?.slug ?? 'hero');
}
