import {
  LMS_FLASH_SET,
  LMS_FLASH_CLEAR,
  QUIZ_SIMULATION_REQUEST,
  QUIZ_SIMULATION_SUCCESS,
  QUIZ_SIMULATION_FAILURE,
  ENROLLMENT_SUBMIT_REQUEST,
  ENROLLMENT_SUBMIT_SUCCESS,
  ENROLLMENT_SUBMIT_FAILURE,
  QUIZ_QUESTION_SET_REQUEST,
  QUIZ_QUESTION_SET_SUCCESS,
  QUIZ_QUESTION_SET_FAILURE,
  ADMIN_UPLOAD_MODULE_REQUEST,
  ADMIN_UPLOAD_MODULE_SUCCESS,
  ADMIN_UPLOAD_MODULE_FAILURE,
  ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST,
  ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS,
  ADMIN_TOGGLE_MODULE_VISIBILITY_FAILURE,
  ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
  ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS,
  ADMIN_UPDATE_ENROLLMENT_STATUS_FAILURE,
} from './lms.types';

export const submitEnrollmentRequest = (payload) => ({
  type: ENROLLMENT_SUBMIT_REQUEST,
  payload,
});

export const submitEnrollmentSuccess = (payload) => ({
  type: ENROLLMENT_SUBMIT_SUCCESS,
  payload,
});

export const submitEnrollmentFailure = (payload) => ({
  type: ENROLLMENT_SUBMIT_FAILURE,
  payload,
});

export const simulateQuizRequest = (payload) => ({ type: QUIZ_SIMULATION_REQUEST, payload });

export const simulateQuizSuccess = (payload) => ({ type: QUIZ_SIMULATION_SUCCESS, payload });

export const simulateQuizFailure = (payload) => ({
  type: QUIZ_SIMULATION_FAILURE,
  payload,
});

export const fetchQuizQuestionSetRequest = (payload) => ({
  type: QUIZ_QUESTION_SET_REQUEST,
  payload,
});

export const fetchQuizQuestionSetSuccess = (payload) => ({
  type: QUIZ_QUESTION_SET_SUCCESS,
  payload,
});

export const fetchQuizQuestionSetFailure = (payload) => ({
  type: QUIZ_QUESTION_SET_FAILURE,
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

export const toggleModuleVisibilityFailure = (payload) => ({
  type: ADMIN_TOGGLE_MODULE_VISIBILITY_FAILURE,
  payload,
});

export const uploadModuleRequest = (payload) => ({ type: ADMIN_UPLOAD_MODULE_REQUEST, payload });

export const uploadModuleSuccess = (payload) => ({ type: ADMIN_UPLOAD_MODULE_SUCCESS, payload });

export const uploadModuleFailure = (payload) => ({
  type: ADMIN_UPLOAD_MODULE_FAILURE,
  payload,
});

export const updateEnrollmentStatusRequest = (payload) => ({
  type: ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
  payload,
});

export const updateEnrollmentStatusSuccess = (payload) => ({
  type: ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS,
  payload,
});

export const updateEnrollmentStatusFailure = (payload) => ({
  type: ADMIN_UPDATE_ENROLLMENT_STATUS_FAILURE,
  payload,
});

/** @param {{ severity: 'success' | 'error'; message: string }} payload */
export const lmsFlashSet = (payload) => ({ type: LMS_FLASH_SET, payload });

export const lmsFlashClear = () => ({ type: LMS_FLASH_CLEAR });
