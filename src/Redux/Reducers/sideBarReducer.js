import { createReducer } from 'Utils/Helpers';
import { SIDEBAR_COLLAPSE } from '../Constants';

const initialState = {
  collapsed: true,
};

export const actionMap = {
  [SIDEBAR_COLLAPSE]: (state, { collapsed }) => {
    return { ...state, collapsed };
  },
};

export const sideBarReducer = createReducer(initialState, actionMap);
