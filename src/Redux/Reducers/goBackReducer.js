import { createReducer } from 'Utils/Helpers';
import { SET_CURRENT_PARAMS, SET_IN_DETAIL_PAGE } from '../Constants';

const initialState = {
  currentParams: {},
};

const actionMap = {
  [SET_CURRENT_PARAMS]: (state, { currentParams }) => {
    return {
      ...state,
      currentParams,
    };
  },
};

export const goBackReducer = createReducer(initialState, actionMap);
