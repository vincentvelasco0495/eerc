import { combineReducers } from 'redux';

import { authReducer } from 'src/app/store/modules/auth';
import { lmsReducerMap } from 'src/app/store/modules/lms';

export const rootReducer = combineReducers({
  auth: authReducer,
  ...lmsReducerMap,
});
