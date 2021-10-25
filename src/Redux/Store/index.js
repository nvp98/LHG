import { applyMiddleware, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import rootSaga from 'Redux/Sagas';
import rootReducer from '../Reducers';

const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;
const saga = createSagaMiddleware();

const configureStore = () => {
  const middleware = [thunk, saga];
  const enhancers = [applyMiddleware(...middleware)];
  const store = createStore(rootReducer, composeEnhancers(...enhancers));
  saga.run(rootSaga);
  return store;
};

// const store = createStore(rootReducer, defaultState, applyMiddleware(thunk));
// export default store;

export default configureStore;
