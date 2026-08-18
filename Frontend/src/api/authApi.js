import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Register a new user.
 * Body: { name, email, password, role, department }
 */
export const register = async ({ name, email, password, role, department  , designation}) => {
  console.log("Registering user with data:", { name, email, role, department , designation });
  const response = await api.post('/api/auth/register', { name, email, password, role, department , designation });
  return response.data;
};

/**
 * Login an existing user.
 * Body: { email, password }
 */
export const login = async ({ email, password }) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};
