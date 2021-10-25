export const createReducer = (initialState, actionsMap) => (
  state = initialState,
  action
) => {
  const reduceFn = actionsMap[action.type];
  if (reduceFn) {
    return reduceFn(state, action);
  }
  return state;
};
