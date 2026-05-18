import axios from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import {
  uploadAdminModule as mockUploadAdminModule,
  simulateQuizAttempt as mockSimulateQuizAttempt,
  submitEnrollmentRequest as mockSubmitEnrollment,
  fetchQuizQuestionSet as mockFetchQuizQuestionSet,
  toggleModuleVisibility as mockToggleModuleVisibility,
  updateEnrollmentStatus as mockUpdateEnrollmentStatus,
} from 'src/services/lms.service';

const apiRoot = '/api';
const isLmsLiveApi = () => Boolean(CONFIG.serverUrl?.trim());

function postJson(url, body) {
  return axios.post(url, body).then((res) => res.data);
}
function patchJson(url, body = {}) {
  return axios.patch(url, body).then((res) => res.data);
}
function getJson(url) {
  return axios.get(url).then((res) => res.data);
}

export function getLmsAxiosErrorMessage(error, fallback = 'Request failed.') {
  const payload = error?.response?.data;
  const msg =
    payload && typeof payload === 'object' && payload.message != null ? payload.message : null;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (typeof payload === 'string' && payload.trim()) return payload.trim();
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();
  return fallback;
}

/** Laravel 422 `errors` bag → first message per field. */
export function getLmsAxiosFieldErrors(error) {
  const bag = error?.response?.data?.errors;
  if (!bag || typeof bag !== 'object') {
    return {};
  }

  return Object.entries(bag).reduce((acc, [key, messages]) => {
    const first = Array.isArray(messages) ? messages[0] : messages;
    if (typeof first === 'string' && first.trim()) {
      acc[key] = first.trim();
    }
    return acc;
  }, {});
}

export async function patchLmsCourse(publicId, payload) {
  const endpoint = `/api/courses/${encodeURIComponent(publicId)}`;
  const body = payload ?? {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    if (!body.has('_method')) body.append('_method', 'PATCH');
    const { data } = await axios.post(endpoint, body);
    return data;
  }
  const { data } = await axios.patch(endpoint, body);
  return data;
}
export async function postLmsProgram(payload = {}) {
  const { data } = await axios.post('/api/programs', payload ?? {});
  return data;
}
export async function patchLmsProgram(publicId, payload = {}) {
  const endpoint = `/api/programs/${encodeURIComponent(publicId)}`;
  const body = payload ?? {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    if (!body.has('_method')) body.append('_method', 'PATCH');
    const { data } = await axios.post(endpoint, body);
    return data;
  }
  const { data } = await axios.patch(endpoint, body);
  return data;
}
export async function deleteLmsProgram(publicId) {
  const { data } = await axios.delete(`/api/programs/${encodeURIComponent(publicId)}`);
  return data;
}
export async function postLmsInstructor(payload = {}) {
  const { data } = await axios.post('/api/instructors', payload ?? {});
  return data;
}
export async function patchLmsInstructor(publicId, payload = {}) {
  const endpoint = `/api/instructors/${encodeURIComponent(publicId)}`;
  const body = payload ?? {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    if (!body.has('_method')) body.append('_method', 'PATCH');
    const { data } = await axios.post(endpoint, body);
    return data;
  }
  const { data } = await axios.patch(endpoint, body);
  return data;
}
export async function deleteLmsInstructor(publicId) {
  const { data } = await axios.delete(`/api/instructors/${encodeURIComponent(publicId)}`);
  return data;
}
export async function postLmsStudent(payload = {}) {
  const { data } = await axios.post('/api/students', payload ?? {});
  return data;
}
export async function patchLmsStudent(publicId, payload = {}) {
  const endpoint = `/api/students/${encodeURIComponent(publicId)}`;
  const body = payload ?? {};
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    if (!body.has('_method')) body.append('_method', 'PATCH');
    const { data } = await axios.post(endpoint, body);
    return data;
  }
  const { data } = await axios.patch(endpoint, body);
  return data;
}
export async function deleteLmsStudent(publicId) {
  const { data } = await axios.delete(`/api/students/${encodeURIComponent(publicId)}`);
  return data;
}
export async function patchLmsUser(payload = {}) {
  const { data } = await axios.patch('/api/user', payload ?? {});
  return data;
}
export async function postLmsCourse(payload = {}) {
  const { data } = await axios.post('/api/courses', payload ?? {});
  return data;
}
export async function patchLmsModule(publicId, payload) {
  const { data } = await axios.patch(`/api/modules/${encodeURIComponent(publicId)}`, payload ?? {});
  return data;
}
export async function postLmsModuleForCourse(coursePublicId, payload) {
  const { data } = await axios.post(
    `/api/courses/${encodeURIComponent(coursePublicId)}/modules`,
    payload ?? {}
  );
  return data;
}
export async function reorderLmsModulesForCourse(coursePublicId, moduleIds = []) {
  const { data } = await axios.patch(
    `/api/courses/${encodeURIComponent(coursePublicId)}/modules/reorder`,
    { moduleIds: Array.isArray(moduleIds) ? moduleIds : [] }
  );
  return data;
}
export async function deleteLmsModule(publicId) {
  const { data } = await axios.delete(`/api/modules/${encodeURIComponent(publicId)}`);
  return data;
}
export async function reorderLmsModuleLessons(modulePublicId, lessonIds = []) {
  const { data } = await axios.patch(
    `/api/modules/${encodeURIComponent(modulePublicId)}/lessons/reorder`,
    { lessonIds: Array.isArray(lessonIds) ? lessonIds : [] }
  );
  return data;
}
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
  const { data } = await axios.delete(`/api/standalone-lessons/${encodeURIComponent(publicId)}`);
  return data;
}
export async function postLmsQuizForModule(modulePublicId, payload) {
  const { data } = await axios.post(
    `/api/modules/${encodeURIComponent(modulePublicId)}/quizzes`,
    payload ?? {}
  );
  return data;
}
export async function getLmsQuizQuestions(publicId) {
  const { data } = await axios.get(`/api/quizzes/${encodeURIComponent(publicId)}/questions`);
  return data;
}
export async function patchLmsQuiz(publicId, payload) {
  const { data } = await axios.patch(`/api/quizzes/${encodeURIComponent(publicId)}`, payload ?? {});
  return data;
}
export async function postLmsQuizAttempt(publicId, payload) {
  const { data } = await axios.post(
    `/api/quizzes/${encodeURIComponent(publicId)}/attempts`,
    payload ?? {}
  );
  return data;
}
export async function postLmsLessonProgress(coursePublicId, lessonKey) {
  const { data } = await axios.post(
    `/api/courses/${encodeURIComponent(coursePublicId)}/lesson-progress`,
    { lessonKey }
  );
  return data;
}
export async function postLessonMaterialForModule(modulePublicId, file, options = {}) {
  const fd = new FormData();
  fd.append('file', file);
  const rid = options.moduleResourcePublicId;
  if (rid != null && String(rid).trim() !== '') fd.append('moduleResourcePublicId', String(rid).trim());
  const { data } = await axios.post(
    `/api/modules/${encodeURIComponent(modulePublicId)}/lesson-materials`,
    fd
  );
  return data;
}
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
  const { data } = await axios.delete(`/api/lesson-materials/${encodeURIComponent(publicId)}`);
  return data;
}
export async function fetchLessonMaterialBlob(publicId, options = {}) {
  const response = await axios.get(`/api/lesson-materials/${encodeURIComponent(publicId)}/file`, {
    responseType: 'blob',
    params: options,
  });
  return response.data;
}

export async function submitEnrollmentWithPaymentProof(programId, paymentProofFile) {
  const fd = new FormData();
  fd.append('program_id', programId);
  fd.append('payment_proof', paymentProofFile);
  const { data } = await axios.post(`${apiRoot}/enrollments`, fd);
  return data;
}

export async function fetchEnrollmentPaymentProofBlob(publicId) {
  const response = await axios.get(
    `${apiRoot}/enrollments/${encodeURIComponent(publicId)}/payment-proof`,
    { responseType: 'blob' }
  );
  return response.data;
}

export const lmsApi = {
  submitEnrollmentRequest: ({ programId, paymentProofFile }) =>
    isLmsLiveApi()
      ? submitEnrollmentWithPaymentProof(programId, paymentProofFile)
      : mockSubmitEnrollment(programId, paymentProofFile),

  simulateQuizAttempt: (quizId) =>
    isLmsLiveApi()
      ? postJson(`${apiRoot}/quizzes/${encodeURIComponent(quizId)}/attempts`, {})
      : mockSimulateQuizAttempt(quizId),

  fetchQuizQuestionSet: (quizId) =>
    isLmsLiveApi()
      ? getJson(`${apiRoot}/quizzes/${encodeURIComponent(quizId)}/questions`)
      : mockFetchQuizQuestionSet(quizId),

  toggleModuleVisibility: (moduleId) =>
    isLmsLiveApi()
      ? patchJson(`${apiRoot}/modules/${encodeURIComponent(moduleId)}/visibility`, {})
      : mockToggleModuleVisibility(moduleId),

  uploadAdminModule: (payload) =>
    isLmsLiveApi()
      ? postJson(`${apiRoot}/admin/uploads`, {
          title: payload.title,
          assetType: payload.assetType,
        })
      : mockUploadAdminModule(payload),

  updateEnrollmentStatus: (payload) =>
    isLmsLiveApi()
      ? patchJson(`${apiRoot}/enrollments/${encodeURIComponent(payload.enrollmentId)}`, {
          status: payload.status,
        })
      : mockUpdateEnrollmentStatus(payload),

  fetchResource: ({ endpoint, params = null }) => {
    if (!endpoint) return Promise.resolve(null);
    const query =
      params && typeof params === 'object'
        ? Object.entries(params)
            .filter(([, value]) => value != null && String(value).trim() !== '')
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&')
        : '';
    const url = query ? `${endpoint}${endpoint.includes('?') ? '&' : '?'}${query}` : endpoint;
    return getJson(url);
  },

  runCommand: async (command, payload = {}) => {
    switch (command) {
      case 'program.create':
        return postLmsProgram(payload);
      case 'program.update':
        return patchLmsProgram(payload.publicId, payload.body ?? {});
      case 'program.delete':
        return deleteLmsProgram(payload.publicId);
      case 'instructor.create':
        return postLmsInstructor(payload);
      case 'instructor.update':
        return patchLmsInstructor(payload.publicId, payload.body ?? {});
      case 'instructor.delete':
        return deleteLmsInstructor(payload.publicId);
      case 'student.create':
        return postLmsStudent(payload);
      case 'student.update':
        return patchLmsStudent(payload.publicId, payload.body ?? {});
      case 'student.delete':
        return deleteLmsStudent(payload.publicId);
      case 'course.create':
        return postLmsCourse(payload.body ?? {});
      case 'course.update':
        return patchLmsCourse(payload.publicId, payload.body ?? {});
      case 'module.create':
        return postLmsModuleForCourse(payload.coursePublicId, payload.body ?? {});
      case 'module.update':
        return patchLmsModule(payload.publicId, payload.body ?? {});
      case 'module.delete':
        return deleteLmsModule(payload.publicId);
      case 'module.reorder':
        return reorderLmsModulesForCourse(payload.coursePublicId, payload.body?.moduleIds ?? []);
      case 'module.lessons.reorder':
        return reorderLmsModuleLessons(payload.modulePublicId, payload.body?.lessonIds ?? []);
      case 'standaloneLesson.create':
        return postLmsStandaloneLesson(payload.modulePublicId, payload.body ?? {});
      case 'standaloneLesson.update':
        return patchLmsStandaloneLesson(payload.publicId, payload.body ?? {});
      case 'standaloneLesson.delete':
        return deleteLmsStandaloneLesson(payload.publicId);
      case 'quiz.create':
        return postLmsQuizForModule(payload.modulePublicId, payload.body ?? {});
      case 'quiz.update':
        return patchLmsQuiz(payload.publicId, payload.body ?? {});
      case 'quiz.questions':
        return getLmsQuizQuestions(payload.publicId);
      case 'quiz.attempt':
        return postLmsQuizAttempt(payload.publicId, payload.body ?? {});
      case 'lessonProgress.complete':
        return postLmsLessonProgress(payload.coursePublicId, payload.lessonKey);
      case 'lessonMaterial.module.upload':
        return postLessonMaterialForModule(
          payload.modulePublicId,
          payload.file,
          payload.options ?? {}
        );
      case 'lessonMaterial.standalone.upload':
        return postLessonMaterialForStandaloneLesson(payload.standalonePublicId, payload.file);
      case 'lessonMaterial.delete':
        return deleteLessonMaterial(payload.publicId);
      default:
        throw new Error(`Unsupported LMS command: ${command}`);
    }
  },
};
