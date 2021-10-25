import { createReducer } from 'Utils/Helpers';
import { fromJS } from 'immutable';
import { SET_PARAMS_TABLE } from '../Constants';

const initialState = fromJS({
  paramsTable: {},
});

const actionMap = {
  [SET_PARAMS_TABLE]: (state, { paramsTable }) => {
    return fromJS({
      ...state,
      paramsTable,
    });
  },
};

export const searchReducer = createReducer(initialState, actionMap);
