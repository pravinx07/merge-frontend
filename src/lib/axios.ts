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

export default instance;
