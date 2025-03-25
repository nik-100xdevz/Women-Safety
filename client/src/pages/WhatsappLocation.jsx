import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const WhatsappLocation = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState('');

  const handleAddContact = () => {
    if (newContact.trim()) {
      setContacts([...contacts, { id: Date.now(), number: newContact.trim() }]);
      setNewContact('');
    }
  };

  const handleRemoveContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleShareLocation = () => {
    // Will implement WhatsApp sharing functionality
    console.log('Sharing location to contacts:', contacts);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 bg-green-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              Share Location via WhatsApp
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Share your location with trusted contacts through WhatsApp
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
          {/* Add Contact Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add WhatsApp Contacts</h2>
            <div className="flex gap-4">
              <input
                type="tel"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter WhatsApp number"
              />
              <button
                onClick={handleAddContact}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Add Contact
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Contacts</h3>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-700">{contact.number}</span>
                  <button
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No contacts added yet</p>
              )}
            </div>
          </div>

          {/* Share Location Button */}
          <div className="space-y-4">
            <button
              onClick={handleShareLocation}
              disabled={contacts.length === 0}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                contacts.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              Share Location with All Contacts
            </button>
            <p className="text-sm text-gray-500 text-center">
              This will share your current location with all added contacts via WhatsApp
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              to="/emergency"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Emergency Services
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsappLocation; 