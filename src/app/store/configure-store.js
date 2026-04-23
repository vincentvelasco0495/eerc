import createSagaMiddleware from 'redux-saga';
import { compose, createStore, applyMiddleware } from 'redux';

import { rootSaga } from 'src/app/store/sagas';
import { rootReducer } from 'src/app/store/reducers';

export function configureAppStore() {
  const sagaMiddleware = createSagaMiddleware();
  const enhancers = compose(applyMiddleware(sagaMiddleware));
  const store = createStore(rootReducer, enhancers);

  sagaMiddleware.run(rootSaga);

  return store;
}
