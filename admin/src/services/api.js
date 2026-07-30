import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://home-service-marketplace.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
