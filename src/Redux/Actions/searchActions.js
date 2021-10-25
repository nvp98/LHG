import { SET_PARAMS_TABLE } from '../Constants';

export const setParamsTableAction = (paramsTable = {}) => dispatch => {
  dispatch({
    type: SET_PARAMS_TABLE,
    paramsTable,
  });
};
