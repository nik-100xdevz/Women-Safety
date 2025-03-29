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
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/user/me');
    return response.data;
  },
  getPublictUserInfo: async (userId) => {
    const response = await api.get(`user/public/${userId}`);
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

// Friend Request APIs
export const getAllUsers = async () => {
  const response = await api.get('/user/users');
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get('/user/friends');
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await api.get('/user/friend-requests');
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await api.post('/user/friend-requests', { recipientId: userId });
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.put(`/user/friend-requests/${requestId}/accept`);
  return response.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await api.put(`/user/friend-requests/${requestId}/reject`);
  return response.data;
};

export const cancelFriendRequest = async (requestId) => {
  const response = await api.delete(`/user/friend-requests/${requestId}`);
  return response.data;
};

export const removeFriend = async (friendId) => {
  const response = await api.delete(`/user/friends/${friendId}`);
  return response.data;
};

// Emergency Alert APIs
export const sendEmergencyAlert = async () => {
  const response = await api.post('/user/emergency-alerts/start');
  console.log("response of the send",response.data)
  return response.data;
};

export const stopEmergencyAlert = async () => {
  const response = await api.post('/user/emergency-alerts/stop');
  console.log("Stop emergency alert response:", response.data);
  return response.data;
};

export const acknowledgeAlert = async (alertId) => {
  if (!alertId) {
    console.error('Cannot acknowledge: alertId is required');
    throw new Error('alertId is required to acknowledge an alert');
  }
  
  console.log('Acknowledging alert with ID:', alertId);
  const response = await api.post('/user/emergency-alerts/acknowledge', { alertId });
  return response.data;
};

// Push Notification API
export const savePushSubscription = async (subscription) => {
  const response = await api.post('/user/push-subscription', { subscription });
  return response.data;
};

export default api; 