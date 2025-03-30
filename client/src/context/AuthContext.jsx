import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

// Create the auth context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage on mount:', token);
        
        const userString = localStorage.getItem('user');
        console.log('User string from localStorage on mount:', userString);
        
        if (token && userString) {
          const user = JSON.parse(userString);
          console.log('Parsed user from localStorage:', user);
          setCurrentUser(user);
        } else {
          console.log('No user found in localStorage or missing token');
          // Clear any partial data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
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
      
      if (data.user) {
        setCurrentUser(data.user);
        console.log('Current user state updated:', data.user);
      } else {
        console.error('No user data in response');
        throw new Error('No user data received from server');
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
    setCurrentUser(null);
    toast.info('You have been logged out');
    
    // Verify token was removed
    const tokenAfterLogout = localStorage.getItem('token');
    console.log('Token after logout:', tokenAfterLogout);
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
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 