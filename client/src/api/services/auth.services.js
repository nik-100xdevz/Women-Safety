import api from "../axios";

export const login = async (credentials) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
  };
  
  export const register = async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  };
  
  export const getProfile = async () => {
    const response = await api.get('/user/me');
    return response.data;
  };
  
  export const updateProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }; 