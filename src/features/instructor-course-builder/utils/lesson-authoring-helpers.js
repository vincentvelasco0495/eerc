/**
 * LMS lesson workspace ↔ API `{ lesson_meta, duration_* }` helpers.
 */

import dayjs from 'dayjs';

export function toIsoDateString(value) {
  if (value == null || value === '') {
    return null;
  }
  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value.format('YYYY-MM-DD') : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const parsed = new Date(typeof value === 'string' ? value : String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

/** `HH:mm` from API meta → Dayjs suitable for MUI `<TimePicker adapter={AdapterDayjs} />`. */
export function dayjsFromClockString(timeStr) {
  if (typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return null;
  }
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }
  const h = parseInt(match[1], 10);
  const mi = parseInt(match[2], 10);
  if (Number.isNaN(h) || Number.isNaN(mi)) {
    return null;
  }
  return dayjs(new Date(1970, 0, 1, h, mi, 0, 0));
}

/** @deprecated Use `dayjsFromClockString` for pickers whose adapter is Day.js. */
export function timeStringToLegacyDate(timeStr) {
  return dayjsFromClockString(timeStr);
}

export function timeFromLegacyDate(date) {
  if (date == null) {
    return null;
  }
  if (dayjs.isDayjs(date)) {
    return date.isValid() ? date.format('HH:mm') : null;
  }
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Build `lesson_meta` object for PATCH (snake payloads use `lesson_meta` key server-side). */
export function normalizeLessonMetaForApi(meta, extras = {}) {
  const dl =
    typeof meta?.durationLabel === 'string'
      ? meta.durationLabel.trim()
      : typeof extras.durationLabelFallback === 'string'
        ? extras.durationLabelFallback.trim()
        : '';
  const out = {
    lessonPreview: !!meta?.lessonPreview,
    unlockAfterPurchase: !!meta?.unlockAfterPurchase,
    startDate: toIsoDateString(meta?.startDate),
    startTime:
      typeof meta?.startTime === 'string'
        ? meta.startTime
        : timeFromLegacyDate(meta?.startTime),
  };
  if (dl !== '') {
    out.durationLabel = dl;
  }
  return out;
}

/**
 * Video lesson workspace: schedule / toggles + source + optional linked lesson-material public ids.
 */
export function normalizeVideoWorkspaceMeta(bundle, extras = {}) {
  const {
    lessonPreview,
    unlockAfterPurchase,
    startDate,
    startTime,
    durationLabel,
    videoSourceType,
    videoWidthPx,
    videoPosterLessonMaterialPublicId,
    videoLessonMaterialPublicId,
  } = bundle ?? {};

  const base = normalizeLessonMetaForApi(
    { lessonPreview, unlockAfterPurchase, startDate, startTime, durationLabel },
    extras
  );

  const out = { ...base };
  const vst =
    typeof videoSourceType === 'string' && videoSourceType.trim()
      ? videoSourceType.trim()
      : 'html-mp4';
  out.videoSourceType = vst;

  const w =
    typeof videoWidthPx === 'string' ? videoWidthPx.trim() : String(videoWidthPx ?? '').trim();
  if (w !== '') {
    out.videoWidthPx = w;
  }

  if (
    videoPosterLessonMaterialPublicId != null &&
    String(videoPosterLessonMaterialPublicId).trim() !== ''
  ) {
    out.videoPosterLessonMaterialPublicId = String(videoPosterLessonMaterialPublicId).trim();
  } else {
    out.videoPosterLessonMaterialPublicId = null;
  }

  if (videoLessonMaterialPublicId != null && String(videoLessonMaterialPublicId).trim() !== '') {
    out.videoLessonMaterialPublicId = String(videoLessonMaterialPublicId).trim();
  } else {
    out.videoLessonMaterialPublicId = null;
  }

  return out;
}
