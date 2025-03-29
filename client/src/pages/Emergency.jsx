import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Alert, CircularProgress } from '@mui/material';
import { getFriends, sendEmergencyAlert, stopEmergencyAlert, acknowledgeAlert } from '../services/api';
import { registerServiceWorker, requestNotificationPermission, subscribeToPushNotifications, startEmergencyAlert, stopEmergencyAlert as stopServiceWorkerAlert, storeAuthToken } from '../services/serviceWorkerUtils';

const Emergency = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [alertSetupComplete, setAlertSetupComplete] = useState(false);

  useEffect(() => {
    setupServiceWorker();
    fetchFriends();
    
    // Check if alert is already active (in case of page refresh)
    const checkAlertStatus = async () => {
      try {
        const response = await getFriends();
        const activeAlert = response.activeAlert || false;
        setIsAlertActive(activeAlert);
      } catch (err) {
        console.error('Error checking alert status:', err);
      }
    };
    
    checkAlertStatus();
    
    // Add event listener for messages from service worker
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'alert_acknowledged') {
        console.log('Received acknowledgment from service worker:', event.data);
        // Add the acknowledged alert to our state
        setAcknowledgments(prev => [...prev, event.data.alertId]);
        // Refresh friends list to get updated acknowledgment status
        fetchFriends();
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    // Set up a refresh interval when alert is active
    let refreshInterval = null;
    if (isAlertActive) {
      refreshInterval = setInterval(() => {
        fetchFriends();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [isAlertActive]);

  const setupServiceWorker = async () => {
    try {
      setAlertSetupComplete(false);
      
      // Register service worker
      let registration;
      try {
        registration = await registerServiceWorker();
        console.log('Service worker registration successful', registration);
      } catch (regError) {
        console.error('Service worker registration failed:', regError);
        // We'll continue even without service worker for basic functionality
      }
      
      // Check permission status
      if ('Notification' in window) {
        const permission = Notification.permission;
        setNotificationPermission(permission === 'granted');
        
        // Request permission and subscribe if granted
        if (permission === 'granted') {
          try {
            await subscribeToPushNotifications();
          } catch (subError) {
            console.warn('Push subscription failed, but we can continue with basic notifications:', subError);
          }
        }
      }
      
      // Store token in IndexedDB for service worker
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await storeAuthToken(token);
        } catch (tokenError) {
          console.warn('Failed to store auth token:', tokenError);
        }
      }
      
      // Get current user ID from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUserId(user._id);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // Mark setup as complete, even if some parts failed
      setAlertSetupComplete(true);
    } catch (error) {
      console.error('Error setting up service worker:', error);
      setError('Failed to set up notifications. Basic features will still work.');
      // Mark as complete anyway so user can use basic features
      setAlertSetupComplete(true);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted);
      
      if (granted) {
        // Re-register service worker after permission is granted
        await registerServiceWorker();
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setError('Failed to request notification permission');
    }
  };

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriends();
      setFriends(response.friends || []);
      console.log('Friends loaded:', response.friends);
      
      // Check for active alerts from the response
      if (response.activeAlert) {
        setIsAlertActive(true);
        
        // Update acknowledgments state if available
        if (response.acknowledgments && Array.isArray(response.acknowledgments)) {
          setAcknowledgments(response.acknowledgments);
        }
      }
    } catch (err) {
      setError('Failed to fetch friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAlert = async () => {
    if (!notificationPermission) {
      alert('Please allow notifications to use this feature');
      await handleRequestPermission();
      if (!notificationPermission) return;
    }

    if (!alertSetupComplete) {
      alert('Still setting up notifications. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Send alert to server
      const response = await sendEmergencyAlert();
      console.log('Alert started successfully:', response);
      
      if (response.friends) {
        setFriends(response.friends);
      }
      
      // Start local notifications through service worker
      if (currentUserId) {
        const alertId = response.alertId || currentUserId;
        try {
          const success = await startEmergencyAlert(alertId);
          console.log('Service worker alert started:', success);
          
          if (!success) {
            console.warn('Service worker alerts may not be working - falling back to basic notification');
            // Show a fallback notification
            if (Notification.permission === 'granted') {
              new Notification('Emergency Alert Active', {
                body: 'Your emergency alert is active. Your friends will be notified.',
                icon: '/logo192.png'
              });
            }
          }
        } catch (swError) {
          console.error('Error with service worker alerts:', swError);
          // Show a fallback notification
          if (Notification.permission === 'granted') {
            new Notification('Emergency Alert Active', {
              body: 'Your emergency alert is active, but there may be issues with notifications.',
              icon: '/logo192.png'
            });
          }
        }
      }
      
      setIsAlertActive(true);
      setAcknowledgments([]);
      
      // Begin periodic refresh of friend statuses
      fetchFriends();
    } catch (err) {
      setError('Failed to start emergency alert: ' + (err.message || 'Unknown error'));
      console.error('Error starting alert:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopAlert = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Stop alert on server
      const response = await stopEmergencyAlert();
      console.log('Alert stopped successfully:', response);
      
      // Stop local notifications
      const success = await stopServiceWorkerAlert();
      console.log('Service worker alert stopped:', success);
      
      setIsAlertActive(false);
      
      // Keep acknowledgments visible for a while after stopping
      setTimeout(() => {
        if (!isAlertActive) {
          setAcknowledgments([]);
        }
      }, 10000); // Clear acknowledgments after 10 seconds
      
    } catch (err) {
      setError('Failed to stop emergency alert: ' + (err.message || 'Unknown error'));
      console.error('Error stopping alert:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (friendId) => {
    try {
      await acknowledgeAlert(friendId);
      setAcknowledgments(prev => [...prev, friendId]);
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 bg-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              Emergency Help
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Choose a safety feature to get started
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Alert Your Friends - Replacing WhatsApp Location */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Your Friends</h2>
              <p className="text-gray-600 mb-4">Send emergency alerts to your trusted contacts</p>
              
              {!notificationPermission && (
                <div className="mb-4">
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Notification permission is required for this feature to work properly.
                  </Alert>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={handleRequestPermission}
                    sx={{ mb: 2 }}
                    fullWidth
                  >
                    Allow Notifications
                  </Button>
                </div>
              )}
              
              {!isAlertActive ? (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  onClick={handleStartAlert}
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Emergency Alert'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={handleStopAlert}
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Stop Emergency Alert'}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Live Location Sharing */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <Link to="/emergency/live-location" className="block">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Location Sharing</h2>
                <p className="text-gray-600">Share your real-time location with trusted contacts</p>
              </div>
            </Link>
          </motion.div>

          {/* Emergency Alert */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <Link to="/emergency/alert" className="block">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Alert</h2>
                <p className="text-gray-600">Send emergency alerts with your location to trusted contacts</p>
              </div>
            </Link>
          </motion.div>

          {/* Incident Reporting */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <Link to="/emergency/report-incident" className="block">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Incidents</h2>
                <p className="text-gray-600">Report and track safety incidents in your area</p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Friend Alert Status */}
        {(isAlertActive || acknowledgments.length > 0) && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alert Status</h2>
            {loading ? (
              <div className="flex justify-center py-4">
                <CircularProgress />
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {friends.length === 0 ? (
                  <Alert severity="info">
                    You don't have any friends to alert. Add friends to use this feature.
                  </Alert>
                ) : (
                  <List>
                    {friends.map((friend) => (
                      <ListItem key={friend._id} className="mb-2 bg-gray-50 rounded-lg">
                        <ListItemText
                          primary={friend.username}
                          secondary={friend.email}
                        />
                        {isAlertActive && !acknowledgments.includes(friend._id) ? (
                          <ListItemSecondaryAction>
                            <Typography color="warning.main" sx={{ mr: 2, display: 'inline-block' }}>
                              Waiting...
                            </Typography>
                          </ListItemSecondaryAction>
                        ) : acknowledgments.includes(friend._id) && (
                          <ListItemSecondaryAction>
                            <Typography color="success.main">
                              Alert Acknowledged
                            </Typography>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Emergency; 