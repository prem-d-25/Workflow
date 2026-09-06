import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Configure base URL from environment or default to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 & Refresh Token Logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // TODO: Call actual refresh token endpoint when backend is ready
        // const response = await axios.post(`${BASE_URL}/api/auth/refresh`, { ... });
        // const newToken = response.data.access_token;
        
        // useAuthStore.getState().setAccessToken(newToken);
        // originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // return apiClient(originalRequest);
        
        // Temporarily, just log out the user on 401
        useAuthStore.getState().clearAuth();
      } catch (refreshError) {
        // If refresh fails, log out
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
