import { Modal } from 'antd';
import axios from 'axios';
import {
  API_URL,
  LOGIN_URL,
  REFRESH_TOKEN,
  TOKEN_KEY,
  USER_ID,
} from 'GlobalConstants';
import { history } from './';
import { getCookie, setCookie } from './Helpers';
const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

instance.interceptors.request.use(
  config => {
    // Do something before request is sent
    if (!config.headers.Authorization) {
      const token = getCookie(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // config.headers.Cookie = `token= ${token}`;
        // config.headers.withCredentials = true;
        // console.log(config.headers.Cookie);
      }
      // console.log(config);
    }
    return config;
  },
  error => {
    // Do something with request error
    return Promise.reject(error);
  }
);

const modalExpire = () => {
  return Modal.warning({
    title: 'Phiên đăng nhập đã hết hạn',
    content: 'Vui lòng đăng nhập lại',
    keyboard: false,
    onOk: () => {
      history.push(LOGIN_URL);
    },
  });
};

let isShowModalExpiry = false;
// Add a response interceptor
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Do something with response error
    if (error.response) {
      const originalRequest = error.config;
      switch (error.response.status) {
        case 401: {
          if (getCookie(REFRESH_TOKEN)) {
            const refreshToken = getCookie(REFRESH_TOKEN);
            const params = {
              refreshToken,
            };
            axios
              .post(`${API_URL}/auth/refreshToken`, params)
              .then(res => {
                setCookie(TOKEN_KEY, res.data.accessToken);
                setCookie(REFRESH_TOKEN, res.data.refreshToken);
                setCookie(USER_ID, res.data.userId);
                window.location.reload();
                return axios(originalRequest);
              })
              .catch(err => {
                console.log(err, 'error');
              });
          } else {
            modalExpire();
          }
          break;
        }
        case 403: {
          modalExpire();
          break;
        }
        default:
          break;
      }
      return Promise.reject(error.response);
    }
    if (error.request) {
      return Promise.reject(error.request);
    }
    return Promise.reject(error.message);
  }
);

export async function fetchApi(
  endPoint,
  method = 'GET',
  body,
  params = {},
  sourceToken = null
) {
  return instance({
    method: method,
    url: endPoint,
    data: body,
    params: params,
    sourceToken: sourceToken,
  });
}

export async function uploadFile(
  endpoint,
  method = 'POST',
  body,
  params = {},
  sourceToken = null
) {
  return instance({
    method: method,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    url: endpoint,
    data: body,
    params: params,
    cancelToken: sourceToken,
  });
}

export async function downloadFile(
  endpoint,
  method = 'POST',
  body,
  params = {},
  sourceToken = null,
  responseTypeConfig = {}
) {
  return instance({
    method: method,
    url: endpoint,
    data: body,
    params: params,
    cancelToken: sourceToken,
    responseType: 'arraybuffer',
    ...responseTypeConfig,
  });
}

export async function fetchAllApi(requests = []) {
  return axios.all(requests);
}
