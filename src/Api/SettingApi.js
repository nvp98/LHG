import { fetchApi } from 'Utils';

export const getSpecialist = () => {
  return fetchApi('/specialist');
};

export const getSettingHoliday = (params = {}) => {
  return fetchApi('/setting/holiday', 'GET', null, params);
};

export const getHospital = () => {
  return fetchApi('/hospital', 'GET');
};
