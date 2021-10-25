// import { call, fork, put, take, takeLatest, select, delay } from 'redux-saga/effects';

// function* filterSaga({ payload }) {
// yield delay(300)
// const { keyword } = payload
// const list = yield select(state => state.task.listTask)
// const filteredTasks = list.filter(task => task.title.trim().toLowerCase().includes(keyword.trim().toLowerCase()))
// yield put(filterTaskSuccess(filteredTasks))
// }

function* rootSaga() {
  // yield takeLatest('FILTER_SAGA', filterSaga)
}
export default rootSaga;
