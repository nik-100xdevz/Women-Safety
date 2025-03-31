import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token in API service interceptor:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Setting Authorization header:', config.headers.Authorization);
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error Response:', error);
    
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized request detected, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to sign in page if not already there
      if (!window.location.pathname.includes('/signin')) {
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    try {
      console.log('Calling login API with:', credentials);
      const response = await api.post('/user/login', credentials);
      console.log('Login API response:', response);
      
      if (response.data && response.data.token) {
        console.log('Saving token to localStorage:', response.data.token);
        localStorage.setItem('token', response.data.token);
        
        if (response.data.user) {
          console.log('Saving user to localStorage:', response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Store token in IndexedDB for service worker
          try {
            const request = indexedDB.open('auth', 1);
            request.onerror = (event) => {
              console.error('Error opening IndexedDB:', event.target.error);
            };
            request.onsuccess = (event) => {
              const db = event.target.result;
              const transaction = db.transaction(['token'], 'readwrite');
              const store = transaction.objectStore('token');
              store.put(response.data.token, 'token');
            };
            request.onupgradeneeded = (event) => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains('token')) {
                db.createObjectStore('token');
              }
            };
          } catch (error) {
            console.error('Error storing token in IndexedDB:', error);
          }
        } else {
          console.error('No user data in response');
        }
      } else {
        console.error('No token in response:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/user/me');
    console.log("This is the current user response",response.data)
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/user/profile', userData);
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

export const acknowledgeAlert = async (alertId, userId) => {
  if (!alertId) {
    console.error('Cannot acknowledge: alertId is required');
    throw new Error('alertId is required to acknowledge an alert');
  }
  
  console.log('Acknowledging alert with ID:', alertId, userId ? `for user: ${userId}` : '');
  
  // Create request body with alertId and optional userId
  const requestBody = { alertId };
  if (userId) {
    requestBody.userId = userId;
  }
  
  try {
    const response = await api.post('/user/emergency-alerts/acknowledge', requestBody);
    console.log('Acknowledge response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in acknowledgeAlert:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Push Notification API
export const savePushSubscription = async (subscription) => {
  const response = await api.post('/user/push-subscription', { subscription });
  return response.data;
};

// Emergency services
export const emergencyService = {
  getAllPhoneNumbers: async () => {
    const response = await api.get('/emergency/phone-numbers');
    return response.data;
  },

  addPhoneNumber: async (phoneData) => {
    const response = await api.post('/emergency/phone-numbers', phoneData);
    return response.data;
  },

  updatePhoneNumber: async (numberId, phoneData) => {
    const response = await api.put(`/emergency/phone-numbers/${numberId}`, phoneData);
    return response.data;
  },

  deletePhoneNumber: async (numberId) => {
    const response = await api.delete(`/emergency/phone-numbers/${numberId}`);
    return response.data;
  },

  sendEmergencyAlert: async () => {
    const response = await api.post('/emergency/alert');
    return response.data;
  },

  stopEmergencyAlert: async () => {
    const response = await api.post('/emergency/stop-alert');
    return response.data;
  }
};

export default api; 