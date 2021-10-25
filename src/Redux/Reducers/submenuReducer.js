import { createReducer } from 'Utils/Helpers';
import { SUBMENU_COLLAPSE } from '../Constants';

const initialState = {
  collapsedSubmenu: [],
};

export const actionMap = {
  [SUBMENU_COLLAPSE]: (state, { collapsedSubmenu }) => {
    return { ...state, collapsedSubmenu };
  },
};

export const submenuReducer = createReducer(initialState, actionMap);
