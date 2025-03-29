import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LiveLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Get user's location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLoading(false);
        },
        (error) => {
          setError('Unable to get your location. Please enable location services.');
          console.error('Geolocation error:', error);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current=null;
      }
    };
  }, []);

  // Initialize map when location is available
  useEffect(() => {
    if (location && mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([location.latitude, location.longitude], 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© We safe OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add marker
      markerRef.current = L.marker([location.latitude, location.longitude])
        .addTo(mapInstanceRef.current);
    }

    // Update marker position when location changes
    if (location && markerRef.current) {
      markerRef.current.setLatLng([location.latitude, location.longitude]);
      mapInstanceRef.current?.setView([location.latitude, location.longitude], 13);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  const handleShareLocation = () => {
    if (location) {
      const shareUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      if (navigator.share) {
        navigator.share({
          title: 'My Location',
          text: 'Here is my current location',
          url: shareUrl
        }).catch(console.error);
      } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareUrl)
          .then(() => alert('Location link copied to clipboard!'))
          .catch(err => console.error('Failed to copy:', err));
      }
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
              Live Location Sharing
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Share your location with trusted contacts in case of emergency
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
        <div className="bg-white rounded-lg shadow-lg p-6 relative z-10">
          {error ? (
            <div className="text-center text-red-600 mb-4">
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="h-[400px] w-full rounded-lg mb-6"></div>
              
              {location && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Your current location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                  <button
                    onClick={handleShareLocation}
                    className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    Share Location
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/emergency"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Back to Emergency Services
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveLocation; 