import { SIDEBAR_COLLAPSE, SUBMENU_COLLAPSE } from '../Constants';

export const collapseAction = collapsed => dispatch => {
  dispatch({ type: SIDEBAR_COLLAPSE, collapsed });
};
export const collapseActionSubmenu = collapsedSubmenu => dispatch => {
  dispatch({ type: SUBMENU_COLLAPSE, collapsedSubmenu });
};
