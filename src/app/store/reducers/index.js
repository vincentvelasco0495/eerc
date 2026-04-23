import { combineReducers } from 'redux';

import {
  LMS_BOOTSTRAP_FAILURE,
  LMS_BOOTSTRAP_REQUEST,
  LMS_BOOTSTRAP_SUCCESS,
  QUIZ_SIMULATION_SUCCESS,
  ENROLLMENT_SUBMIT_SUCCESS,
  QUIZ_QUESTION_SET_SUCCESS,
  ADMIN_UPLOAD_MODULE_SUCCESS,
  ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS,
  ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS,
} from 'src/app/store/types/lms.types';

const initialAppState = {
  isBootstrapping: false,
  error: null,
  meta: {
    todayLabel: '',
    leaderboardPeriods: [],
    learningFlowSteps: [],
  },
};

function app(state = initialAppState, action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_REQUEST:
      return { ...state, isBootstrapping: true, error: null };
    case LMS_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        isBootstrapping: false,
        meta: action.payload.meta,
      };
    case LMS_BOOTSTRAP_FAILURE:
      return {
        ...state,
        isBootstrapping: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

function user(state = null, action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.user;
    default:
      return state;
  }
}

function programs(state = [], action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.programs;
    default:
      return state;
  }
}

function courses(state = [], action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.courses;
    default:
      return state;
  }
}

function modules(state = [], action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.modules;
    case ADMIN_TOGGLE_MODULE_VISIBILITY_SUCCESS:
      return state.map((module) =>
        module.id === action.payload.moduleId
          ? { ...module, visible: !module.visible }
          : module
      );
    default:
      return state;
  }
}

const initialQuizState = {
  quizzes: [],
  results: [],
  questionSets: {},
};

function quizzes(state = initialQuizState, action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return {
        ...state,
        quizzes: action.payload.quizzes,
        results: action.payload.quizResults,
      };
    case QUIZ_SIMULATION_SUCCESS:
      return {
        ...state,
        quizzes: state.quizzes.map((quiz) =>
          quiz.id === action.payload.quizId
            ? {
                ...quiz,
                attemptsUsed: quiz.attemptsUsed + 1,
                bestScore: Math.max(quiz.bestScore, action.payload.score),
              }
            : quiz
        ),
        results: [action.payload, ...state.results],
      };
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

function leaderboard(state = {}, action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.leaderboard;
    default:
      return state;
  }
}

function analytics(state = null, action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.analytics;
    default:
      return state;
  }
}

function enrollment(state = [], action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.enrollments;
    case ENROLLMENT_SUBMIT_SUCCESS:
      return [action.payload, ...state];
    case ADMIN_UPDATE_ENROLLMENT_STATUS_SUCCESS:
      return state.map((item) =>
        item.id === action.payload.enrollmentId ? { ...item, status: action.payload.status } : item
      );
    default:
      return state;
  }
}

const initialAdminState = {
  users: [],
  uploads: [],
};

function admin(state = initialAdminState, action) {
  switch (action.type) {
    case LMS_BOOTSTRAP_SUCCESS:
      return action.payload.admin;
    case ADMIN_UPLOAD_MODULE_SUCCESS:
      return {
        ...state,
        uploads: [action.payload, ...state.uploads],
      };
    default:
      return state;
  }
}

export const rootReducer = combineReducers({
  app,
  user,
  programs,
  courses,
  modules,
  quizzes,
  leaderboard,
  analytics,
  enrollment,
  admin,
});
