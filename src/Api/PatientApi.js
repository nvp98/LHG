import { fetchApi, downloadFile } from 'Utils';
export const getPatient = params => {
  return fetchApi('/patient', 'GET', null, params);
};
export const getPatientID = id => {
  return fetchApi(`/patient/${id}`);
};
export const putLockAccount = (id, body) => {
  return fetchApi(`/patient/lockAccount/${id}`, 'PUT', body, null);
};
export const putResetPatientOTP = id => {
  return fetchApi(`/patient/resetOTP/${id}`, 'PUT');
};
export const putResetRelativeOTP = id => {
  return fetchApi(`/relative/resetOTP/${id}`, 'PUT');
};
export const getRelativeID = id => {
  return fetchApi(`/relative/${id}`);
};
export const getHealthRecord = params => {
  return fetchApi('/healthRecord/connect', 'GET', null, params);
};
export const postHealthRecord = body => {
  return fetchApi('/healthRecord/connect', 'POST', body);
};
export const postConfirmOTP = body => {
  return fetchApi('/healthRecord/confirmOTP', 'POST', body);
};
export const clearOTP = body => {
  return fetchApi('/auth/patient/resetOTP', 'POST', body);
};
export const downloadAttachmentFile = async (
  fileId = '',
  responseType = {}
) => {
  return await downloadFile(`/file/${fileId}`, 'POST', responseType);
};

export const getPatienAccount = (params = {}) => {
  return fetchApi(`patient/lhgAccount`, 'GET', null, params);
};

export const createPatient = body => {
  return fetchApi('/patient', 'POST', body);
};
