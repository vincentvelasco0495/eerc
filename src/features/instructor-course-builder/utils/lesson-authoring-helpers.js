/**
 * LMS lesson workspace ↔ API `{ lesson_meta, duration_* }` helpers.
 */

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
    startDate: null,
    startTime: null,
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
  const { lessonPreview, durationLabel, videoSourceType, videoLessonMaterialPublicId } = bundle ?? {};

  const base = normalizeLessonMetaForApi(
    { lessonPreview, unlockAfterPurchase: false, durationLabel },
    extras
  );

  const out = { ...base };
  const vst =
    typeof videoSourceType === 'string' && videoSourceType.trim()
      ? videoSourceType.trim()
      : 'html-mp4';
  out.videoSourceType = vst;

  if (videoLessonMaterialPublicId != null && String(videoLessonMaterialPublicId).trim() !== '') {
    out.videoLessonMaterialPublicId = String(videoLessonMaterialPublicId).trim();
  } else {
    out.videoLessonMaterialPublicId = null;
  }

  return out;
}
