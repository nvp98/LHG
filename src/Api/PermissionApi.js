import { fetchApi, downloadFile } from 'Utils';
export const getPermissionGroup = parmas => {
  return fetchApi('/group', 'GET', null, parmas);
};
export const getPermissionUser = parmas => {
  return fetchApi('/user', 'GET', null, parmas);
};
export const getGroupID = (id, params) => {
  return fetchApi(`/group/${id}`, null, params);
};
export const putGroupID = (id, body) => {
  return fetchApi(`/group/${id}`, 'PUT', body, null);
};
export const getUserID = (id, params) => {
  return fetchApi(`/user/${id}`, null, params);
};
export const putUserID = (id, body) => {
  return fetchApi(`/user/${id}`, 'PUT', body, null);
};
export const getModule = (params = {}) => {
  return fetchApi('/module', 'GET', null, params);
};
export const getFunction = (params = {}) => {
  return fetchApi('/module', 'GET', null, params);
};
export const postUser = body => {
  return fetchApi('/user', 'POST', body);
};
export const postGroup = body => {
  return fetchApi('/group', 'POST', body);
};
export const getAllUserFromLdap = (params = {}) => {
  return fetchApi('/user/getAllUserFromLdap', 'GET', null, params);
};
