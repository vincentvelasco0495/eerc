import { all, put, call, takeLatest } from 'redux-saga/effects';

import {
  revalidateAfterAdminUpload,
  revalidateAfterQuizAttempt,
  revalidateAfterEnrollmentChange,
  revalidateAfterModuleVisibility,
} from 'src/services/lms-swr';

import { lmsApi } from './lms.api';
import {
  QUIZ_SIMULATION_REQUEST,
  ENROLLMENT_SUBMIT_REQUEST,
  QUIZ_QUESTION_SET_REQUEST,
  ADMIN_UPLOAD_MODULE_REQUEST,
  ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST,
  ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
} from './lms.types';
import {
  lmsFlashSet,
  simulateQuizSuccess,
  simulateQuizFailure,
  uploadModuleSuccess,
  uploadModuleFailure,
  submitEnrollmentSuccess,
  submitEnrollmentFailure,
  fetchQuizQuestionSetSuccess,
  fetchQuizQuestionSetFailure,
  toggleModuleVisibilitySuccess,
  toggleModuleVisibilityFailure,
  updateEnrollmentStatusSuccess,
  updateEnrollmentStatusFailure,
} from './lms.actions';

function sagaErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong';
}

function* submitEnrollmentSaga(action) {
  try {
    const payload = yield call(lmsApi.submitEnrollmentRequest, action.payload.courseId);
    yield put(submitEnrollmentSuccess(payload));
    yield call(revalidateAfterEnrollmentChange);
    yield put(
      lmsFlashSet({ severity: 'success', message: 'Enrollment request submitted successfully.' })
    );
  } catch (error) {
    yield put(submitEnrollmentFailure(sagaErrorMessage(error)));
  }
}

function* simulateQuizSaga(action) {
  try {
    const payload = yield call(lmsApi.simulateQuizAttempt, action.payload.quizId);
    yield put(simulateQuizSuccess(payload));
    yield call(revalidateAfterQuizAttempt);
    yield put(
      lmsFlashSet({
        severity: 'success',
        message: `Quiz submitted. Score: ${payload.score}%`,
      })
    );
  } catch (error) {
    yield put(simulateQuizFailure(sagaErrorMessage(error)));
  }
}

function* fetchQuestionSetSaga(action) {
  try {
    const questions = yield call(lmsApi.fetchQuizQuestionSet, action.payload.quizId);
    yield put(fetchQuizQuestionSetSuccess({ quizId: action.payload.quizId, questions }));
    yield put(
      lmsFlashSet({
        severity: 'success',
        message:
          questions?.length > 0
            ? `Loaded ${questions.length} question${questions.length === 1 ? '' : 's'}.`
            : 'No questions available for this quiz.',
      })
    );
  } catch (error) {
    yield put(fetchQuizQuestionSetFailure(sagaErrorMessage(error)));
  }
}

function* toggleVisibilitySaga(action) {
  try {
    const payload = yield call(lmsApi.toggleModuleVisibility, action.payload.moduleId);
    yield put(toggleModuleVisibilitySuccess(payload));
    yield call(revalidateAfterModuleVisibility);
    yield put(
      lmsFlashSet({ severity: 'success', message: 'Module visibility updated successfully.' })
    );
  } catch (error) {
    yield put(toggleModuleVisibilityFailure(sagaErrorMessage(error)));
  }
}

function* uploadModuleSaga(action) {
  try {
    const payload = yield call(lmsApi.uploadAdminModule, action.payload);
    yield put(uploadModuleSuccess(payload));
    yield call(revalidateAfterAdminUpload);
    yield put(
      lmsFlashSet({
        severity: 'success',
        message: `"${payload.title}" was queued for upload.`,
      })
    );
  } catch (error) {
    yield put(uploadModuleFailure(sagaErrorMessage(error)));
  }
}

function* updateEnrollmentStatusSaga(action) {
  try {
    const payload = yield call(lmsApi.updateEnrollmentStatus, action.payload);
    yield put(updateEnrollmentStatusSuccess(payload));
    yield call(revalidateAfterEnrollmentChange);
    yield put(
      lmsFlashSet({
        severity: 'success',
        message: `Enrollment updated to "${payload.status}".`,
      })
    );
  } catch (error) {
    yield put(updateEnrollmentStatusFailure(sagaErrorMessage(error)));
  }
}

export function* lmsSaga() {
  yield all([
    takeLatest(ENROLLMENT_SUBMIT_REQUEST, submitEnrollmentSaga),
    takeLatest(QUIZ_SIMULATION_REQUEST, simulateQuizSaga),
    takeLatest(QUIZ_QUESTION_SET_REQUEST, fetchQuestionSetSaga),
    takeLatest(ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST, toggleVisibilitySaga),
    takeLatest(ADMIN_UPLOAD_MODULE_REQUEST, uploadModuleSaga),
    takeLatest(ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST, updateEnrollmentStatusSaga),
  ]);
}
