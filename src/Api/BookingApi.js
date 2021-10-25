import { fetchApi } from 'Utils';

export const getBookingList = params => {
  return fetchApi('/booking', 'GET', null, params);
};
