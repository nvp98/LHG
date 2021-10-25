import { fetchApi } from 'Utils';

export const getAllBooking = (params = {}) => {
  return fetchApi(`/booking`, 'GET', null, params);
};

export const getBookingById = id => {
  return fetchApi(`/booking/${id}`, 'GET');
};

export const createBooking = body => {
  return fetchApi('/booking', 'POST', body);
};

export const putUpdateStatus = (id, body) => {
  return fetchApi(`/booking/${id}/updateStatus`, 'PUT', body);
};

export const putUpdateBooking = (id, body) => {
  return fetchApi(`/booking/${id}`, 'PUT', body);
};
