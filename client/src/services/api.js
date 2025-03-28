import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/user/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/user/me');
    return response.data;
  }
};

// Report services
export const reportService = {
  getAllReports: async () => {
    const response = await api.get('/report');
    return response.data;
  },
  getCommentsOfReport: async (reportId) => {
    console.log(reportId)
    const response = await api.get(`/comment/${reportId}`);
    return response.data;
  },
  
  createReport: async (reportData) => {
    const response = await api.post('/report', reportData);
    return response.data;
  },
  
  deleteReport: async (reportId) => {
    const response = await api.delete(`/report/${reportId}`);
    return response.data;
  },
  deleteComment: async (commentId) => {
  
    const response = await api.delete(`/comment/${commentId}`);
    console.log("we are here",response.data)
    return response.data;
  },

  addComment: async (reportId, commentData) => {
    const response = await api.post(`/comment`, {
      reportId,
      ...commentData
    });
    return response.data;
  },



  getUserReports: async () => {
    const response = await api.get('/user/reports');
    return response.data;
  },

  getUserComments: async () => {
    const response = await api.get('/user/comments');
    return response.data;
  }
};

export default api; 