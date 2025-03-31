import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import socketService from '../services/socket';

// Create the auth context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize WebSocket connection
  const initializeWebSocket = (user) => {
    if (user?._id) {
      console.log('Initializing WebSocket connection for user:', user._id);
      const socket = socketService.connect(user._id);
      if (socket) {
        console.log('WebSocket connection initialized successfully');
      } else {
        console.error('Failed to initialize WebSocket connection');
      }
    }
  };

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage on mount:', token);
        
        if (token) {
          // Get fresh user data from the server
          const response = await authService.getCurrentUser();
          const user = response.user;
          console.log('Fetched current user from server:', user);
          
          if (user) {
            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            // Initialize WebSocket connection for existing user
            initializeWebSocket(user);
          } else {
            console.log('No user data received from server');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
          }
        } else {
          console.log('No token found in localStorage');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Add effect to handle token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      localStorage.removeItem('user');
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      console.log('Login response:', data);
      
      if (data.user && data.token) {
        // Store token
        localStorage.setItem('token', data.token);
        
        // Get fresh user data
        const userResponse = await authService.getCurrentUser();
        const user = userResponse.user;
        console.log('Fetched user after login:', user);
        
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          // Initialize WebSocket connection after successful login
          initializeWebSocket(user);
        } else {
          throw new Error('No user data received from server');
        }
      } else {
        throw new Error('Invalid login response');
      }
      
      toast.success('Successfully signed in!');
      return data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      toast.success('Account created successfully!');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Failed to create account';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out, removing tokens');
    authService.logout();
    // Disconnect WebSocket before clearing user data
    socketService.disconnect();
    setCurrentUser(null);
    toast.info('You have been logged out');
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      // Implement the update profile API call when available 
      console.log("userdata",userData)
      const data = await authService.updateProfile(userData);
      setCurrentUser(data.user);
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    console.log('isAuthenticated check - token:', token, 'currentUser:', currentUser);
    
    // If we have a token but no user in state, try to load the user from localStorage
    if (token && !currentUser) {
      try {
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          console.log('Loading user from localStorage in isAuthenticated:', user);
          // Instead of setting state directly, return true if we have valid data
          return true;
        }
      } catch (error) {
        console.error('Error parsing user in isAuthenticated:', error);
      }
    }
    
    // Return true if we have both token and user
    return !!token && !!currentUser;
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 