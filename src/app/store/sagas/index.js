import { all, put, call, takeLatest } from 'redux-saga/effects';

import { lmsApi } from 'src/app/store/api/lms.api';
import {
  lmsBootstrapFailure,
  lmsBootstrapSuccess,
  simulateQuizSuccess,
  uploadModuleSuccess,
  submitEnrollmentSuccess,
  fetchQuizQuestionSetSuccess,
  toggleModuleVisibilitySuccess,
  updateEnrollmentStatusSuccess,
} from 'src/app/store/actions/lms.actions';
import {
  LMS_BOOTSTRAP_REQUEST,
  QUIZ_SIMULATION_REQUEST,
  ENROLLMENT_SUBMIT_REQUEST,
  QUIZ_QUESTION_SET_REQUEST,
  ADMIN_UPLOAD_MODULE_REQUEST,
  ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST,
  ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
} from 'src/app/store/types/lms.types';

function* bootstrapSaga() {
  try {
    const payload = yield call(lmsApi.bootstrap);
    yield put(lmsBootstrapSuccess(payload));
  } catch (error) {
    yield put(lmsBootstrapFailure(error.message));
  }
}

function* submitEnrollmentSaga(action) {
  const payload = yield call(lmsApi.submitEnrollmentRequest, action.payload.courseId);
  yield put(submitEnrollmentSuccess(payload));
}

function* simulateQuizSaga(action) {
  const payload = yield call(lmsApi.simulateQuizAttempt, action.payload.quizId);
  yield put(simulateQuizSuccess(payload));
}

function* fetchQuestionSetSaga(action) {
  const questions = yield call(lmsApi.fetchQuizQuestionSet, action.payload.quizId);
  yield put(fetchQuizQuestionSetSuccess({ quizId: action.payload.quizId, questions }));
}

function* toggleVisibilitySaga(action) {
  const payload = yield call(lmsApi.toggleModuleVisibility, action.payload.moduleId);
  yield put(toggleModuleVisibilitySuccess(payload));
}

function* uploadModuleSaga(action) {
  const payload = yield call(lmsApi.uploadAdminModule, action.payload);
  yield put(uploadModuleSuccess(payload));
}

function* updateEnrollmentStatusSaga(action) {
  const payload = yield call(lmsApi.updateEnrollmentStatus, action.payload);
  yield put(updateEnrollmentStatusSuccess(payload));
}

export function* rootSaga() {
  yield all([
    takeLatest(LMS_BOOTSTRAP_REQUEST, bootstrapSaga),
    takeLatest(ENROLLMENT_SUBMIT_REQUEST, submitEnrollmentSaga),
    takeLatest(QUIZ_SIMULATION_REQUEST, simulateQuizSaga),
    takeLatest(QUIZ_QUESTION_SET_REQUEST, fetchQuestionSetSaga),
    takeLatest(ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST, toggleVisibilitySaga),
    takeLatest(ADMIN_UPLOAD_MODULE_REQUEST, uploadModuleSaga),
    takeLatest(ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST, updateEnrollmentStatusSaga),
  ]);
}
