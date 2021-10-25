import { combineReducers } from 'redux';
import { searchReducer } from './searchReducer';
import { sideBarReducer } from './sideBarReducer';
import { submenuReducer } from './submenuReducer';
import { goBackReducer } from './goBackReducer';

const rootReducer = combineReducers({
  searchReducer,
  sideBarReducer,
  submenuReducer,
  goBackReducer,
});
export default rootReducer;
