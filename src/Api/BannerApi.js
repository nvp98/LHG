import { fetchApi } from 'Utils';

export const getBanner = () => {
  return fetchApi('/file', 'GET');
};
export const deleteBanner = id => {
  return fetchApi(`/file/${id}`, 'DELETE');
};
export const updateBanner = (id, body) => {
  return fetchApi(`/file/${id}`, 'PUT', body);
};
