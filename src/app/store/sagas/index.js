import { all } from 'redux-saga/effects';

import { lmsSaga } from 'src/app/store/modules/lms';
import { authSaga } from 'src/app/store/modules/auth';

export function* rootSaga() {
  yield all([authSaga(), lmsSaga()]);
}
