import { useState, useEffect, useCallback } from 'react';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.roomId = null;
    this.locationUpdateInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.pingInterval = null;
  }

  connect(userId) {
    if (!userId) {
      return null;
    }

    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN && this.userId === userId) {
        return this.socket;
      }
      this.disconnect();
    }

    // Using secure WebSocket for production, standard for development
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NODE_ENV === 'production' 
      ? window.location.host
      : 'localhost:5000';
    
    try {
      this.userId = userId;
      this.socket = new WebSocket(`${protocol}//${host}/ws?userId=${userId}`);
      
      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.socket.onclose = () => {
        if (this.reconnectAttempts < 5) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(this.userId);
          }, 1000 * Math.min(this.reconnectAttempts + 1, 5));
        }
      };
      
      return this.socket;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
    
    this.userId = null;
    this.roomId = null;
    this.reconnectAttempts = 0;
  }

  createLocationShareRoom() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket not connected');
    }
    
    // Generate random roomId
    this.roomId = Math.random().toString(36).substring(2, 15);
    
    this.socket.send(JSON.stringify({
      type: 'create_room',
      roomId: this.roomId
    }));
    
    return this.roomId;
  }

  joinLocationShareRoom(roomId) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Socket not connected');
    }
    
    this.roomId = roomId;
    
    this.socket.send(JSON.stringify({
      type: 'join_room',
      roomId: roomId
    }));
  }

  leaveLocationShareRoom() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.roomId) {
      return;
    }
    
    // Send notification that user is leaving
    this.socket.send(JSON.stringify({
      type: 'message',
      message: {
        type: 'location_sharing_stopped',
        userId: this.userId,
        roomId: this.roomId
      }
    }));
    
    // Send leave room message
    this.socket.send(JSON.stringify({
      type: 'leave_room',
      roomId: this.roomId
    }));
    
    this.roomId = null;
    
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  startSharingLocation(getLocationFn) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.roomId) {
      throw new Error('Socket not connected or no active room');
    }
    
    // Clear any existing interval
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
    
    // Send initial location
    this.sendLocationUpdate(getLocationFn());
    
    // Set up interval to send location updates
    this.locationUpdateInterval = setInterval(() => {
      const location = getLocationFn();
      this.sendLocationUpdate(location);
    }, 10000); // Update every 10 seconds
  }

  sendLocationUpdate(location) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.roomId) {
      return;
    }
    
    this.socket.send(JSON.stringify({
      type: 'message',
      roomId: this.roomId,
      message: {
        type: 'location_update',
        userId: this.userId,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString()
      }
    }));
  }

  stopSharingLocation() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  getRoomShareUrl(roomId) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/emergency/shared-location/${roomId || this.roomId}`;
  }
}

// Hook for using the socket in React components
export const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const connect = useCallback(() => {
    if (!userId) {
      setError('User ID is required to connect');
      return;
    }
    
    try {
      const newSocket = socketService.connect(userId);
      
      newSocket.onopen = () => {
        setConnected(true);
        setError(null);
        setSocket(newSocket);
      };
      
      newSocket.onclose = () => {
        setConnected(false);
        setSocket(null);
      };
      
      newSocket.onerror = (e) => {
        setError('WebSocket connection error');
        setConnected(false);
      };
      
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);
  
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setConnected(false);
    setSocket(null);
  }, []);
  
  // Auto-connect when userId changes
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);
  
  return {
    socket,
    connected,
    error,
    connect,
    disconnect
  };
};

const socketService = new SocketService();
export default socketService; 