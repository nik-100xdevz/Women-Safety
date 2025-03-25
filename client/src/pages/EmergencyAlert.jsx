import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmergencyAlert = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState('');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [location, setLocation] = useState(null);

  const handleAddContact = () => {
    if (newContact.trim()) {
      setContacts([...contacts, { id: Date.now(), number: newContact.trim() }]);
      setNewContact('');
    }
  };

  const handleRemoveContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleStartAlert = () => {
    if (contacts.length > 0) {
      setIsAlertActive(true);
      // Will implement emergency alert functionality
      console.log('Starting emergency alert with contacts:', contacts);
    }
  };

  const handleStopAlert = () => {
    setIsAlertActive(false);
    // Will implement stop alert functionality
    console.log('Stopping emergency alert');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 bg-red-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              Emergency Alert System
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Send emergency alerts with your location to trusted contacts
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
          {/* Emergency Contacts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="tel"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                disabled={isAlertActive}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                placeholder="Enter emergency contact number"
              />
              <button
                onClick={handleAddContact}
                disabled={isAlertActive}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                Add Contact
              </button>
            </div>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-700">{contact.number}</span>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    disabled={isAlertActive}
                    className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No emergency contacts added yet</p>
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
                  {isAlertActive ? 'Tracking location...' : 'Location will be displayed when alert is active'}
                </p>
              )}
            </div>
          </div>

          {/* Emergency Alert Button */}
          <div className="space-y-4">
            {!isAlertActive ? (
              <button
                onClick={handleStartAlert}
                disabled={contacts.length === 0}
                className={`w-full py-4 px-6 rounded-md text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  contacts.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                ACTIVATE EMERGENCY ALERT
              </button>
            ) : (
              <button
                onClick={handleStopAlert}
                className="w-full py-4 px-6 rounded-md text-white font-bold text-lg bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                DEACTIVATE EMERGENCY ALERT
              </button>
            )}
            <p className="text-sm text-gray-500 text-center">
              {isAlertActive
                ? 'Your location is being sent to emergency contacts every 2 seconds'
                : 'This will send your location to all emergency contacts every 2 seconds'}
            </p>
          </div>

          {/* Important Information */}
          <div className="mt-8 bg-red-50 p-4 rounded-md">
            <h4 className="text-lg font-medium text-red-900 mb-2">Important Information</h4>
            <ul className="list-disc list-inside space-y-2 text-red-700">
              <li>Add at least one emergency contact before activating the alert</li>
              <li>Your location will be updated every 2 seconds</li>
              <li>Emergency contacts will receive SMS notifications</li>
              <li>Keep your phone's location services enabled</li>
              <li>Contact emergency services if needed</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              to="/emergency"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              ← Back to Emergency Services
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyAlert; 