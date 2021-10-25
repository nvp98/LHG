import { fetchApi } from 'Utils';

export const getContents = (params = {}) => {
  return fetchApi('/contents', 'GET', null, params);
};
export const putContents = body => {
  return fetchApi('/contents', 'PUT', body);
};
