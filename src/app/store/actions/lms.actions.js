import {
  LMS_BOOTSTRAP_FAILURE,
  LMS_BOOTSTRAP_REQUEST,
  LMS_BOOTSTRAP_SUCCESS,
  QUIZ_SIMULATION_REQUEST,
  QUIZ_SIMULATION_SUCCESS,
  ENROLLMENT_SUBMIT_REQUEST,
  ENROLLMENT_SUBMIT_SUCCESS,
  QUIZ_QUESTION_SET_REQUEST,
  QUIZ_QUESTION_SET_SUCCESS,
  ADMIN_UPLOAD_MODULE_REQUEST,
  ADMIN_UPLOAD_MODULE_SUCCESS,
  ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST,
  ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS,
  ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
  ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS,
} from 'src/app/store/types/lms.types';

export const lmsBootstrapRequest = () => ({ type: LMS_BOOTSTRAP_REQUEST });

export const lmsBootstrapSuccess = (payload) => ({ type: LMS_BOOTSTRAP_SUCCESS, payload });

export const lmsBootstrapFailure = (payload) => ({ type: LMS_BOOTSTRAP_FAILURE, payload });

export const submitEnrollmentRequest = (payload) => ({
  type: ENROLLMENT_SUBMIT_REQUEST,
  payload,
});

export const submitEnrollmentSuccess = (payload) => ({
  type: ENROLLMENT_SUBMIT_SUCCESS,
  payload,
});

export const simulateQuizRequest = (payload) => ({ type: QUIZ_SIMULATION_REQUEST, payload });

export const simulateQuizSuccess = (payload) => ({ type: QUIZ_SIMULATION_SUCCESS, payload });

export const fetchQuizQuestionSetRequest = (payload) => ({
  type: QUIZ_QUESTION_SET_REQUEST,
  payload,
});

export const fetchQuizQuestionSetSuccess = (payload) => ({
  type: QUIZ_QUESTION_SET_SUCCESS,
  payload,
});

export const toggleModuleVisibilityRequest = (payload) => ({
  type: ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST,
  payload,
});

export const toggleModuleVisibilitySuccess = (payload) => ({
  type: ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS,
  payload,
});

export const uploadModuleRequest = (payload) => ({ type: ADMIN_UPLOAD_MODULE_REQUEST, payload });

export const uploadModuleSuccess = (payload) => ({ type: ADMIN_UPLOAD_MODULE_SUCCESS, payload });

export const updateEnrollmentStatusRequest = (payload) => ({
  type: ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
  payload,
});

export const updateEnrollmentStatusSuccess = (payload) => ({
  type: ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS,
  payload,
});
