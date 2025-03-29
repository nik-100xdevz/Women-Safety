import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Box, Button, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, Alert, CircularProgress } from '@mui/material';
import { getFriends, sendEmergencyAlert, stopEmergencyAlert, acknowledgeAlert } from '../services/api';
import { registerServiceWorker, requestNotificationPermission, subscribeToPushNotifications } from '../services/serviceWorkerUtils';

const EmergencyAlert = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission === 'granted');
  const [alertId, setAlertId] = useState(null);

  useEffect(() => {
    fetchFriends();
    setupNotifications();
    
    // Check if there's an active alert when the component mounts
    checkActiveAlert();
  }, []);
  
  // Function to check for active emergency alert
  const checkActiveAlert = async () => {
    try {
      const response = await getFriends();
      
      // If there's an active alert in the response
      if (response.activeAlert && response.alertId) {
        setIsAlertActive(true);
        setAlertId(response.alertId);
        
        // Set acknowledgments if any
        if (response.acknowledgments && response.acknowledgments.length > 0) {
          setAcknowledgments(response.acknowledgments);
        }
        
        // Start periodic refresh for active alert
        const refreshInterval = setInterval(fetchFriends, 10000);
        window.emergencyRefreshInterval = refreshInterval;
      }
    } catch (err) {
      console.error('Error checking active alert:', err);
    }
  };

  const setupNotifications = async () => {
    try {
      // Register service worker
      await registerServiceWorker();
      
      // Check current notification permission
      if (Notification.permission === 'granted') {
        setNotificationPermission(true);
        // Subscribe to push notifications if permission is already granted
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const permissionGranted = await requestNotificationPermission();
      setNotificationPermission(permissionGranted);
      
      if (permissionGranted) {
        // If permission is granted, subscribe to push notifications
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response.friends || []);
      
      // Update acknowledgments if any
      if (response.acknowledgments && response.acknowledgments.length > 0) {
        setAcknowledgments(response.acknowledgments);
      }
      
      // Update active alert status
      if (response.activeAlert && response.alertId) {
        setIsAlertActive(true);
        setAlertId(response.alertId);
      } else {
        setIsAlertActive(false);
        setAlertId(null);
      }
    } catch (err) {
      setError('Failed to fetch friends');
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAlert = async () => {
    try {
      setLoading(true);
      
      // Ensure push subscription is registered before starting alert
      if (Notification.permission === 'granted') {
        try {
          await subscribeToPushNotifications();
        } catch (subError) {
          console.warn('Push subscription registration issue:', subError);
          // Continue anyway, as the alert can still work without push
        }
      }
      
      const response = await sendEmergencyAlert();
      console.log("Emergency alert response:", response);
      
      setIsAlertActive(true);
      setError(null);
      
      // Save the alertId for future operations
      if (response.alertId) {
        setAlertId(response.alertId);
      }
      
      // If there are friends in the response, update the state
      if (response.friends) {
        setFriends(response.friends);
      }
      
      // Reset acknowledgments when starting a new alert
      setAcknowledgments([]);
      
      // Begin periodic refresh of friend statuses
      const refreshInterval = setInterval(fetchFriends, 10000); // Refresh every 10 seconds
      
      // Store the interval ID for cleanup
      window.emergencyRefreshInterval = refreshInterval;
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
      
      // Only try to stop the alert if we have an alertId or the alert is active
      if (isAlertActive) {
        const response = await stopEmergencyAlert();
        console.log("Stop alert response:", response);
      }
      
      setIsAlertActive(false);
      setAlertId(null);
      setError(null);
      
      // Clear the refresh interval
      if (window.emergencyRefreshInterval) {
        clearInterval(window.emergencyRefreshInterval);
        window.emergencyRefreshInterval = null;
      }
    } catch (err) {
      setError('Failed to stop emergency alert: ' + (err.message || 'Unknown error'));
      console.error('Error stopping alert:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (friendId) => {
    try {
      // Only proceed if we have an alertId
      if (!alertId) {
        console.error('Cannot acknowledge: No active alert ID');
        return;
      }
      
      const response = await acknowledgeAlert(alertId);
      console.log("Acknowledge response:", response);
      
      // Add to acknowledgments list if not already there
      if (!acknowledgments.includes(friendId)) {
        setAcknowledgments(prev => [...prev, friendId]);
      }
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
              Emergency Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Quick access to emergency services and safety features
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
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Incident Card */}
          <Link to="/emergency/report-incident">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Incident</h3>
                <p className="text-gray-600">Report a safety incident or emergency situation</p>
              </div>
            </motion.div>
          </Link>

          {/* Alert Your Friends Card - Replacing Live Location */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency Alert</h3>
              <p className="text-gray-600 mb-4">Send alerts to your friends in case of emergency</p>
              
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

          {/* Chat with Friends Card */}
          <Link to="/emergency/chat">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat with Friends</h3>
                <p className="text-gray-600">Connect and chat with trusted contacts</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Police</h3>
                <p className="text-gray-600">Emergency: 100</p>
              </div>
              <a href="tel:100" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                Call Now
              </a>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Women Helpline</h3>
                <p className="text-gray-600">24/7: 1091</p>
              </div>
              <a href="tel:1091" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                Call Now
              </a>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Ambulance</h3>
                <p className="text-gray-600">Emergency: 108</p>
              </div>
              <a href="tel:108" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">
                Call Now
              </a>
            </div>
          </div>
        </div>

        {/* Friend Alert Status */}
        {(isAlertActive || acknowledgments.length > 0) && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Alert Status</h2>
            {loading && !friends.length ? (
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
                
                {isAlertActive && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Emergency alert is active. Your trusted contacts are being notified.
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

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyAlert; 