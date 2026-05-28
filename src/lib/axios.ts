import axios from 'axios';

export const BACKEND_URL = import.meta.env.PROD 
  ? 'https://merge-backend-xwku.onrender.com' 
  : 'http://localhost:5000';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`,
  withCredentials: true,
});

export default instance;
