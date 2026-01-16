import api from '../api/client';

export const AuthService = {
  login: async (username, password) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};
