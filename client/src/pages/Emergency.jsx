import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Alert, CircularProgress } from '@mui/material';
import { getFriends, sendEmergencyAlert, stopEmergencyAlert, acknowledgeAlert } from '../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Emergency = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
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
    
    // Set up polling for friends status if alert is active
    let interval;
    if (isAlertActive) {
      interval = setInterval(fetchFriends, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAlertActive]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await getFriends();
      setFriends(response.friends);
      setAcknowledgments(response.acknowledgments || []);
      setCurrentUserId(response.currentUserId);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAlert = async () => {
    try {
      const response = await sendEmergencyAlert();
      setIsAlertActive(true);
      
      // Show notification for the sender
      toast.success('Emergency alert sent to all friends!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // If there's notification data in the response, show it
      if (response.notification) {
        toast.info(response.notification.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error('Error starting alert:', err);
      toast.error('Failed to send emergency alert', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleStopAlert = async () => {
    try {
      await stopEmergencyAlert();
      setIsAlertActive(false);
      toast.info('Emergency alert stopped', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error stopping alert:', err);
      toast.error('Failed to stop emergency alert', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleAcknowledge = async (friendId) => {
    try {
      const response = await acknowledgeAlert(friendId);
      setAcknowledgments(prev => [...prev, friendId]);
      
      // Show notification for acknowledgment
      toast.success('Alert acknowledged', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // If there's notification data in the response, show it
      if (response.notification) {
        toast.info(response.notification.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      toast.error('Failed to acknowledge alert', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: '20px' }}
    >
      <ToastContainer />
      <Typography variant="h4" gutterBottom>
        Emergency Alert
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!isAlertActive ? (
        <Button
          variant="contained"
          color="error"
          onClick={handleStartAlert}
          disabled={loading || friends.length === 0}
          sx={{ mb: 3 }}
        >
          Send Emergency Alert
        </Button>
      ) : (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleStopAlert}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          Stop Emergency Alert
        </Button>
      )}
      
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {friends.map((friend) => (
            <ListItem key={friend._id}>
              <ListItemText
                primary={friend.username}
                secondary={friend.email}
              />
              <ListItemSecondaryAction>
                {acknowledgments.includes(friend._id) ? (
                  <Alert severity="success" sx={{ width: '200px' }}>
                    Acknowledged
                  </Alert>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleAcknowledge(friend._id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </motion.div>
  

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {/* Emergency Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.157 2 5.34 2 5.528v8.944c0 .188.056.37.166.528C3.937 16.735 6.817 18 10 18s6.063-1.265 7.834-3.028c.11-.158.166-.34.166-.528V5.528c0-.188-.056-.37-.166-.528A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Emergency Support</h3>
              <p className="text-gray-600 mb-4">Send an immediate emergency alert to your trusted contacts with your location.</p>
              <Link
                to="/emergency/alert"
                className="inline-block bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors duration-200"
              >
                Send Support
              </Link>
            </div>
          </motion.div>

          {/* Live Location Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Location</h3>
              <p className="text-gray-600 mb-4">Share your real-time location with trusted contacts for your safety.</p>
              <Link
                to="/emergency/live-location"
                className="inline-block bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition-colors duration-200"
              >
                Share Location
              </Link>
            </div>
          </motion.div>

          {/* Share Live Location Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Share Live Location</h3>
              <p className="text-gray-600 mb-4">Generate a shareable link that allows others to track your location in real time.</p>
              <Link
                to="/emergency/share-location"
                className="inline-block bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors duration-200"
              >
                Create Shareable Link
              </Link>
            </div>
          </motion.div>

          {/* Report an Incident */}
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
      </>

  );
};

export default Emergency; 