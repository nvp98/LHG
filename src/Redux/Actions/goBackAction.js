import { SET_CURRENT_PARAMS, SET_IN_DETAIL_PAGE } from 'Redux/Constants';

export const setCurrentParamsAction = (currentParams = {}) => ({
  type: SET_CURRENT_PARAMS,
  currentParams,
});
