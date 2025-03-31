import React, { createContext, useContext, useEffect } from 'react';
import { useSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

// Create WebSocket context
export const WebSocketContext = createContext(null);

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Get user ID from the complete user object
  const userId = currentUser?._id;

  // Log the current state
  useEffect(() => {
    console.log('WebSocketProvider - Auth State:', {
      currentUser,
      userId,
      isAuthenticated: isAuthenticated()
    });
  }, [currentUser, userId, isAuthenticated]);

  const { socket, connected, error } = useSocket(userId);

  // Log connection status
  useEffect(() => {
    if (connected) {
      console.log('Global WebSocket connected for user:', userId);
    }
    if (error) {
      console.error('Global WebSocket error:', error);
    }
  }, [connected, error, userId]);

  return (
    <WebSocketContext.Provider value={{ socket, connected, error }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 