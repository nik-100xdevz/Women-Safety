import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LiveLocation = () => {
  const [recipient, setRecipient] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState(null);

  const handleStartSharing = () => {
    if (recipient.trim()) {
      setIsSharing(true);
      // Will implement live location sharing functionality
      console.log('Starting live location sharing with:', recipient);
    }
  };

  const handleStopSharing = () => {
    setIsSharing(false);
    // Will implement stop sharing functionality
    console.log('Stopping live location sharing');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 bg-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              Live Location Sharing
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Share your real-time location with trusted contacts
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
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Location Sharing Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Live Location</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                  Recipient's Phone Number
                </label>
                <input
                  type="tel"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  disabled={isSharing}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Enter recipient's number"
                />
              </div>
              {!isSharing ? (
                <button
                  onClick={handleStartSharing}
                  disabled={!recipient.trim()}
                  className={`w-full py-3 px-4 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    !recipient.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  Start Sharing Location
                </button>
              ) : (
                <button
                  onClick={handleStopSharing}
                  className="w-full py-3 px-4 rounded-md text-white font-semibold bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Stop Sharing Location
                </button>
              )}
            </div>
          </div>

          {/* Current Location Display */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Location</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              {location ? (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Latitude:</span> {location.latitude}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Longitude:</span> {location.longitude}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Address:</span> {location.address}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {isSharing ? 'Fetching location...' : 'Location will be displayed when sharing starts'}
                </p>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-blue-50 p-4 rounded-md mb-8">
            <h4 className="text-lg font-medium text-blue-900 mb-2">How it works</h4>
            <ul className="list-disc list-inside space-y-2 text-blue-700">
              <li>Enter the recipient's phone number</li>
              <li>Click "Start Sharing Location" to begin</li>
              <li>Your location will be updated in real-time</li>
              <li>Recipient will receive a link to track your location</li>
              <li>Click "Stop Sharing Location" to end tracking</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <Link
              to="/emergency"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Emergency Services
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveLocation; 