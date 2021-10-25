import { createSelector } from 'reselect';

export const paramsTableSelector = createSelector(
  state => state.get('paramsTable'),
  params => {
    return params.toJS();
  }
);
