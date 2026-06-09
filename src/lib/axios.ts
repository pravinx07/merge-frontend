import axios from 'axios';

export const BACKEND_URL = import.meta.env.PROD 
  ? 'https://merge-backend-xwku.onrender.com' 
  : 'http://localhost:5000';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const finalBaseUrl = configuredApiUrl 
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : `${BACKEND_URL}/api`;

const instance = axios.create({
  baseURL: finalBaseUrl,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
