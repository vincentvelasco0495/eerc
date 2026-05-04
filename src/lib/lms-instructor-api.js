import axios from 'src/lib/axios';

/**
 * Laravel LMS authoring endpoints (`PATCH /api/courses`, `PATCH /api/modules`).
 * Requires `Authorization: Bearer` via `axios` interceptor.
 */

export function getLmsAxiosErrorMessage(error, fallback = 'Request failed.') {
  const payload = error?.response?.data;
  const msg =
    payload && typeof payload === 'object' && payload.message != null ? payload.message : null;
  if (typeof msg === 'string' && msg.trim()) {
    return msg.trim();
  }
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
}

export async function patchLmsCourse(publicId, payload) {
  const { data } = await axios.patch(
    `/api/courses/${encodeURIComponent(publicId)}`,
    payload ?? {}
  );
  return data;
}

/**
 * @param {{ title?: string, programId?: string|null }} [payload]
 */
export async function postLmsCourse(payload = {}) {
  const { data } = await axios.post(`/api/courses`, payload ?? {});
  return data;
}

export async function patchLmsModule(publicId, payload) {
  const { data } = await axios.patch(
    `/api/modules/${encodeURIComponent(publicId)}`,
    payload ?? {}
  );
  return data;
}

/** Append a module to the course curriculum (`POST /api/courses/{courseId}/modules`). */
export async function postLmsModuleForCourse(coursePublicId, payload) {
  const { data } = await axios.post(
    `/api/courses/${encodeURIComponent(coursePublicId)}/modules`,
    payload ?? {}
  );
  return data;
}

export async function deleteLmsModule(publicId) {
  const { data } = await axios.delete(`/api/modules/${encodeURIComponent(publicId)}`);
  return data;
}

/** Add lesson inside an existing LMS module (`POST /api/modules/{moduleId}/standalone-lessons`). */
export async function postLmsStandaloneLesson(modulePublicId, payload) {
  const { data } = await axios.post(
    `/api/modules/${encodeURIComponent(modulePublicId)}/standalone-lessons`,
    payload ?? {}
  );
  return data;
}

export async function patchLmsStandaloneLesson(publicId, payload) {
  const { data } = await axios.patch(
    `/api/standalone-lessons/${encodeURIComponent(publicId)}`,
    payload ?? {}
  );
  return data;
}

export async function deleteLmsStandaloneLesson(publicId) {
  const { data } = await axios.delete(
    `/api/standalone-lessons/${encodeURIComponent(publicId)}`
  );
  return data;
}

/** Create a quiz lesson under this module (`POST /api/modules/{moduleId}/quizzes`). */
export async function postLmsQuizForModule(modulePublicId, payload) {
  const { data } = await axios.post(
    `/api/modules/${encodeURIComponent(modulePublicId)}/quizzes`,
    payload ?? {}
  );
  return data;
}

/** Fetch editable questions/options for one quiz (`GET /api/quizzes/{id}/questions`). */
export async function getLmsQuizQuestions(publicId) {
  const { data } = await axios.get(
    `/api/quizzes/${encodeURIComponent(publicId)}/questions`
  );
  return data;
}

/** Persist quiz title + full question list (`PATCH /api/quizzes/{id}`). */
export async function patchLmsQuiz(publicId, payload) {
  const { data } = await axios.patch(
    `/api/quizzes/${encodeURIComponent(publicId)}`,
    payload ?? {}
  );
  return data;
}

/**
 * @param {File} file
 * @param {{ moduleResourcePublicId?: string|null }} [options]
 */
export async function postLessonMaterialForModule(modulePublicId, file, options = {}) {
  const fd = new FormData();
  fd.append('file', file);
  const rid = options.moduleResourcePublicId;
  if (rid != null && String(rid).trim() !== '') {
    fd.append('moduleResourcePublicId', String(rid).trim());
  }
  const { data } = await axios.post(
    `/api/modules/${encodeURIComponent(modulePublicId)}/lesson-materials`,
    fd
  );
  return data;
}

/** @param {File} file */
export async function postLessonMaterialForStandaloneLesson(standalonePublicId, file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await axios.post(
    `/api/standalone-lessons/${encodeURIComponent(standalonePublicId)}/lesson-materials`,
    fd
  );
  return data;
}

export async function deleteLessonMaterial(publicId) {
  const { data } = await axios.delete(
    `/api/lesson-materials/${encodeURIComponent(publicId)}`
  );
  return data;
}

/** @returns {Promise<Blob>} */
export async function fetchLessonMaterialBlob(publicId) {
  const response = await axios.get(
    `/api/lesson-materials/${encodeURIComponent(publicId)}/file`,
    { responseType: 'blob' }
  );
  return response.data;
}

