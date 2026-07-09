// client/src/utils/Axios.js
import axios from 'axios';
import SummaryApi, { baseURL } from '../common/SummaryApi';

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Attach access token + storefront hostname to every request
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accesstoken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // The API runs on one shared domain across every country deployment,
    // so req.headers.host on the server is always the API's own host —
    // never the storefront's (i-coffee.tg, i-coffee.bj, etc). Without this,
    // countryDetect middleware can never resolve anything but the default
    // country. Send the actual browser hostname so it can.
    if (typeof window !== 'undefined' && window.location?.hostname) {
      config.headers['X-Storefront-Host'] = window.location.host; // includes :port for local dev
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401: try to refresh the access token using the stored refresh token
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originRequest = error.config;

    if (error.response?.status === 401 && !originRequest._retry) {
      originRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          localStorage.setItem('accesstoken', newAccessToken);
          originRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originRequest);
        }
      }
    }

    return Promise.reject(error);
  }
);

const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await Axios({
      ...SummaryApi.refreshToken,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    // Server returns either data.accessToken or data.accesstoken — handle both
    const token =
      response.data?.data?.accessToken ||
      response.data?.data?.accesstoken;

    if (token) {
      localStorage.setItem('accesstoken', token);
    }
    return token || null;
  } catch (error) {
    console.error('Token refresh failed:', error?.response?.status);
    return null;
  }
};

export default Axios;
