import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ==============================|| AXIOS - BACKEND SERVICES ||============================== //

const axiosServices: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8081' });

const refreshClient: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8081' });

const ACCESS_TOKEN_KEY = 'serviceToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; config: InternalAxiosRequestConfig }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.config.headers.set('Authorization', `Bearer ${token}`);
      prom.resolve(axiosServices(prom.config));
    }
  });
  failedQueue = [];
};

export function redirectWithBasePath(path: string) {
  const basePath = import.meta.env.VITE_APP_BASE_NAME || process.env.VITE_APP_BASE_NAME || '';
  window.location.pathname = `${basePath.replace(/\/$/, '')}${path}`;
}

axiosServices.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosServices.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;
    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      return { ...response, data: payload.data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest.headers.get('X-Retry')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest.headers.set('X-Retry', 'true');
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        redirectWithBasePath('/login');
        return Promise.reject(error);
      }

      try {
        const response = await refreshClient.post('/api/v1/auth/refresh', { refreshToken });
        const data = response.data?.data ?? response.data;
        const accessToken = data?.accessToken;

        if (!accessToken) {
          throw new Error('Refresh token response did not contain accessToken');
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
        processQueue(null, accessToken);
        return axiosServices(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        redirectWithBasePath('/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.get(url, { ...config });
  return res.data;
};
