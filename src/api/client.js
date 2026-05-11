import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken'); // Use sessionStorage to match authService
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      sessionStorage.removeItem('authToken'); // Use sessionStorage to match authService
      sessionStorage.removeItem('user');
      
      // Use React Router navigation instead of direct window location
      if (!window.location.pathname.includes('/login')) {
        // This will be handled by the UserContext and App routing
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const preloadCriticalData = async () => {
    // Placeholder function to match existing usage in UserContext
    // In future, this can preload dashboard data
    return Promise.resolve();
};
