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

/**
 * LMS mutations for Redux sagas. Reads use `src/services/api.js` + SWR.
 */
export const lmsApi = {
  submitEnrollmentRequest: (courseId) =>
    isLmsLiveApi()
      ? postJson(`${apiRoot}/enrollments`, { course_id: courseId })
      : mockSubmitEnrollment(courseId),

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
};
