import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Box, Button, Typography, Paper, CircularProgress, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText,
  ListItemSecondaryAction, IconButton, Switch, Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { emergencyService } from '../services/api';

// Phone number validation regex for Indian numbers
const PHONE_REGEX = /^\+91[1-9]\d{9}$/;

const EmergencyAlert = () => {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingNumber, setEditingNumber] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLabel, setPhoneLabel] = useState('');

  useEffect(() => {
    // Fetch saved phone numbers on component mount
    const fetchPhoneNumbers = async () => {
      try {
        const response = await emergencyService.getAllPhoneNumbers();
        setPhoneNumbers(response.phoneNumbers || []);
      } catch (error) {
        console.error('Error fetching phone numbers:', error);
        toast.error('Failed to fetch emergency contacts');
      }
    };
    fetchPhoneNumbers();
  }, []);

  const validatePhoneNumber = (number) => {
    if (!number) {
      toast.error('Please enter a phone number');
      return false;
    }
    if (!PHONE_REGEX.test(number)) {
      toast.error('Please enter a valid Indian phone number in format: +91XXXXXXXXXX');
      return false;
    }
    return true;
  };

  const handlePhoneSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setLoading(true);
    try {
      if (editingNumber) {
        const response = await emergencyService.updatePhoneNumber(editingNumber._id, {
          numberId: editingNumber._id,
          number: phoneNumber,
          label: phoneLabel || editingNumber.label
        });
        setPhoneNumbers(response.phoneNumbers);
        toast.success('Phone number updated successfully!');
      } else {
        const response = await emergencyService.addPhoneNumber({
          number: phoneNumber,
          label: phoneLabel || 'Emergency Contact'
        });
        setPhoneNumbers(response.phoneNumbers);
        toast.success('Phone number added successfully!');
      }
      handleCloseDialog();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(editingNumber ? 'Failed to update phone number' : 'Failed to add phone number');
      }
      console.error('Error saving phone number:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNumber = async (numberId) => {
    try {
      const response = await emergencyService.deletePhoneNumber(numberId);
      setPhoneNumbers(response.phoneNumbers);
      toast.success('Phone number deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete phone number');
      console.error('Error deleting phone number:', error);
    }
  };

  const handleToggleActive = async (number) => {
    try {
      const response = await emergencyService.updatePhoneNumber(number._id, {
        numberId: number._id,
        number: number.number,
        label: number.label,
        isActive: !number.isActive
      });
      setPhoneNumbers(response.phoneNumbers);
      toast.success(`Contact ${number.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      toast.error('Failed to update contact status');
      console.error('Error updating phone number:', error);
    }
  };

  const handleEditNumber = (number) => {
    setEditingNumber(number);
    setPhoneNumber(number.number);
    setPhoneLabel(number.label);
    setIsPhoneDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsPhoneDialogOpen(false);
    setEditingNumber(null);
    setPhoneNumber('');
    setPhoneLabel('');
  };

  const handleStartAlert = async () => {
    if (!phoneNumbers.length) {
      setIsPhoneDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      await emergencyService.sendEmergencyAlert();
      setIsAlertActive(true);
      toast.success('Emergency alert sent successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to send emergency alert');
      console.error('Error sending alert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopAlert = async () => {
    setLoading(true);
    try {
      await emergencyService.stopEmergencyAlert();
      setIsAlertActive(false);
      toast.info('Emergency alert stopped', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Failed to stop emergency alert');
      console.error('Error stopping alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
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

          {/* Alert Your Friends Card */}
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
              <p className="text-gray-600 mb-4">Send emergency SMS alerts in case of danger</p>

              {/* Phone Numbers List */}
              {phoneNumbers.length > 0 && (
                <List className="mb-4 bg-gray-50 rounded-lg">
                  {phoneNumbers.map((number) => (
                    <ListItem key={number._id} className="border-b last:border-b-0">
                      <ListItemText
                        primary={number.label}
                        secondary={number.number}
                        className={!number.isActive ? 'text-gray-400' : ''}
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title={number.isActive ? 'Deactivate' : 'Activate'}>
                          <Switch
                            edge="end"
                            checked={number.isActive}
                            onChange={() => handleToggleActive(number)}
                          />
                        </Tooltip>
                        <IconButton edge="end" onClick={() => handleEditNumber(number)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteNumber(number._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsPhoneDialogOpen(true)}
                className="mb-4"
                fullWidth
              >
                Add Emergency Contact
              </Button>

              {!isAlertActive ? (
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  onClick={handleStartAlert}
                  disabled={loading || !phoneNumbers.some(n => n.isActive)}
                  sx={{ py: 1.5 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Emergency Alert'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
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

      {/* Phone Number Dialog */}
      <Dialog open={isPhoneDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingNumber ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            This phone number will receive emergency SMS alerts when you activate the emergency button.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            helperText="Enter number in format: +91XXXXXXXXXX (Example: +919876543210)"
            error={phoneNumber && !PHONE_REGEX.test(phoneNumber)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Label"
            type="text"
            fullWidth
            variant="outlined"
            value={phoneLabel}
            onChange={(e) => setPhoneLabel(e.target.value)}
            placeholder="E.g., Mom, Dad, Sister"
            helperText="Give this contact a memorable name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handlePhoneSubmit} 
            variant="contained" 
            color="primary" 
            disabled={loading || (phoneNumber && !PHONE_REGEX.test(phoneNumber))}
          >
            {loading ? <CircularProgress size={24} /> : (editingNumber ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmergencyAlert; 