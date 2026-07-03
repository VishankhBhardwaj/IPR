import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

/**
 * Register a new user.
 * Body: { name, email, password, role }
 */
export const register = async ({ name, email, password, role }) => {
  const response = await api.post('/auth/register', { name, email, password, role });
  return response.data;
};

/**
 * Login an existing user.
 * Body: { email, password }
 */
export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
