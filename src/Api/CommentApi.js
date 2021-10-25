import { fetchApi } from 'Utils';

export const getComment = (params = {}) => {
  return fetchApi('/comment', 'GET', null, params);
};
export const putComment = (id, body) => {
  return fetchApi(`/comment/${id}`, 'PUT', body);
};
