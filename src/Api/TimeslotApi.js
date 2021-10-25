import { fetchApi } from 'Utils';

export const getTimeslot = (params = {}) => {
  return fetchApi('/timeslot', 'GET', null, params);
};

export const createTimeslot = body => {
  return fetchApi('/timeslot', 'POST', body);
};

export const deleteTimeslotByID = (params = {}) => {
  return fetchApi(`/timeslot`, 'DELETE', null, params);
};

export const deleteAllTimeslot = body => {
  return fetchApi(`/timeslot/deleteAll`, 'DELETE', body);
};

export const updateTimeslot = body => {
  return fetchApi(`/timeslot`, 'PUT', body);
};
