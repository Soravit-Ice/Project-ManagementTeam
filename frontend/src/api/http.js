import axios from 'axios';
import useAuthStore from '../store/auth.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const http = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
const queue = [];

const resolveQueue = (error, token) => {
  queue.splice(0).forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
};

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isAuthRoute = originalRequest.url?.includes('/auth/');

    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return http(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post('/auth/refresh');
        const payload = data?.data || data;
        const newToken = payload?.accessToken;
        const newUser = payload?.user;
        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          if (newUser) {
            useAuthStore.getState().setUser(newUser);
          }
          resolveQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return http(originalRequest);
        }
        throw error;
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && isAuthRoute) {
      useAuthStore.getState().clearSession();
    }

    return Promise.reject(error);
  }
);

export default http;
