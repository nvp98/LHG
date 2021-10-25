import { fetchApi } from 'Utils';

export const getDoctor = (params = {}) => {
  return fetchApi('/doctor', 'GET', null, params);
};

export const getDoctorByID = id => {
  return fetchApi(`/doctor/${id}`);
};

export const getDoctorTimeslotByID = id => {
  return fetchApi(`/doctor/${id}/timeslot`);
};

export const getDoctorVoteByID = id => {
  return fetchApi(`/doctor/${id}/vote`);
};

export const syncDoctor = () => {
  return fetchApi('doctor/sync', 'GET');
};

export const updateDoctorTimeslot = (doctor_id, timeslot_id, body) => {
  return fetchApi(`doctor/${doctor_id}/timeslot/${timeslot_id}`, 'PUT', body);
};

export const getDoctorTimeslot = (params = {}) => {
  return fetchApi('doctor/timeslot', 'GET', null, params);
};
