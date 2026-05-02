import {
  LMS_FLASH_SET,
  LMS_FLASH_CLEAR,
  QUIZ_SIMULATION_FAILURE,
  QUIZ_SIMULATION_REQUEST,
  QUIZ_SIMULATION_SUCCESS,
  ENROLLMENT_SUBMIT_SUCCESS,
  ENROLLMENT_SUBMIT_FAILURE,
  ENROLLMENT_SUBMIT_REQUEST,
  QUIZ_QUESTION_SET_REQUEST,
  QUIZ_QUESTION_SET_SUCCESS,
  QUIZ_QUESTION_SET_FAILURE,
  ADMIN_UPLOAD_MODULE_SUCCESS,
  ADMIN_UPLOAD_MODULE_FAILURE,
  ADMIN_UPLOAD_MODULE_REQUEST,
  ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS,
  ADMIN_TOGGLE_MODULE_VISIBILITY_FAILURE,
  ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST,
  ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS,
  ADMIN_UPDATE_ENROLLMENT_STATUS_FAILURE,
  ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST,
} from './lms.types';

/** Async LMS mutations — use with `selectLmsLoading` / `useLmsLoading`. */
export const initialLmsLoading = {
  enrollmentSubmit: false,
  quizAttempt: false,
  quizQuestions: false,
  moduleVisibility: false,
  adminUpload: false,
  enrollmentStatus: false,
};

const initialAppState = {
  error: null,
  flash: null,
  loading: { ...initialLmsLoading },
};

function app(state = initialAppState, action) {
  switch (action.type) {
    case ENROLLMENT_SUBMIT_REQUEST:
      return {
        ...state,
        ...(state.flash ? { flash: null } : {}),
        loading: { ...state.loading, enrollmentSubmit: true },
      };
    case ENROLLMENT_SUBMIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, enrollmentSubmit: false },
      };
    case ENROLLMENT_SUBMIT_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, enrollmentSubmit: false },
        flash: { severity: 'error', message: action.payload },
      };
    case QUIZ_SIMULATION_REQUEST:
      return {
        ...state,
        ...(state.flash ? { flash: null } : {}),
        loading: { ...state.loading, quizAttempt: true },
      };
    case QUIZ_SIMULATION_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, quizAttempt: false },
      };
    case QUIZ_SIMULATION_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, quizAttempt: false },
        flash: { severity: 'error', message: action.payload },
      };
    case QUIZ_QUESTION_SET_REQUEST:
      return {
        ...state,
        ...(state.flash ? { flash: null } : {}),
        loading: { ...state.loading, quizQuestions: true },
      };
    case QUIZ_QUESTION_SET_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, quizQuestions: false },
      };
    case QUIZ_QUESTION_SET_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, quizQuestions: false },
        flash: { severity: 'error', message: action.payload },
      };
    case ADMIN_TOGGLE_MODULE_VISIBILITY_REQUEST:
      return {
        ...state,
        ...(state.flash ? { flash: null } : {}),
        loading: { ...state.loading, moduleVisibility: true },
      };
    case ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, moduleVisibility: false },
      };
    case ADMIN_TOGGLE_MODULE_VISIBILITY_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, moduleVisibility: false },
        flash: { severity: 'error', message: action.payload },
      };
    case ADMIN_UPLOAD_MODULE_REQUEST:
      return {
        ...state,
        ...(state.flash ? { flash: null } : {}),
        loading: { ...state.loading, adminUpload: true },
      };
    case ADMIN_UPLOAD_MODULE_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, adminUpload: false },
      };
    case ADMIN_UPLOAD_MODULE_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, adminUpload: false },
        flash: { severity: 'error', message: action.payload },
      };
    case ADMIN_UPDATE_ENROLLMENT_STATUS_REQUEST:
      return {
        ...state,
        ...(state.flash ? { flash: null } : {}),
        loading: { ...state.loading, enrollmentStatus: true },
      };
    case ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, enrollmentStatus: false },
      };
    case ADMIN_UPDATE_ENROLLMENT_STATUS_FAILURE:
      return {
        ...state,
        loading: { ...state.loading, enrollmentStatus: false },
        flash: { severity: 'error', message: action.payload },
      };
    case LMS_FLASH_SET:
      return { ...state, flash: action.payload };
    case LMS_FLASH_CLEAR:
      return { ...state, flash: null };
    default:
      return state;
  }
}

const initialQuizState = {
  questionSets: {},
};

function quizzes(state = initialQuizState, action) {
  switch (action.type) {
    case QUIZ_QUESTION_SET_SUCCESS:
      return {
        ...state,
        questionSets: {
          ...state.questionSets,
          [action.payload.quizId]: action.payload.questions,
        },
      };
    default:
      return state;
  }
}

/** Passed into root `combineReducers` — LMS entity reads use SWR + `/api/*`. */
export const lmsReducerMap = {
  app,
  quizzes,
};
