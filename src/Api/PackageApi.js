import { fetchApi, uploadFile } from 'Utils';

export const getPackage = (params = {}) => {
  return fetchApi('/promotions', 'GET', null, params);
};

export const createPackage = body => {
  return fetchApi('/promotions', 'POST', body);
};

export const uploadAttachmentFile = body => {
  return uploadFile(`/file`, 'POST', body);
};

export const getPackageDetail = id => {
  return fetchApi(`/promotions/${id}`);
};

export const updatePackage = (id, body) => {
  return fetchApi(`promotions/${id}`, 'PUT', body);
};
