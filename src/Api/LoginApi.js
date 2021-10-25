import { fetchApi } from 'Utils';

export const postAuthLogin = body => {
  return fetchApi('/auth/login', 'POST', body);
};
export const postAuthRefreshToken = params => {
  return fetchApi('/auth/refreshToken','POST',params)
}