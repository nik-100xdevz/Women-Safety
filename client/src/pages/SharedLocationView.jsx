import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { authService } from '../services/api';
import socketService, { useSocket } from '../services/socket';

const SharedLocationView = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [participantLocations, setParticipantLocations] = useState({});
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [hostStoppedSharing, setHostStoppedSharing] = useState(false);
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  
  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser();
        setUser(response.user);
      } catch (err) {
        setError('Failed to fetch user profile. Please sign in to view shared locations.');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // Initialize Socket connection
  const { socket, connected, error: socketError } = useSocket(user?._id);
  
  // Set up socket message handler
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'room_joined':
            setJoinedRoom(true);
            break;
            
          case 'message':
            if (data.message?.type === 'location_update') {
              const { userId, latitude, longitude } = data.message;
              setParticipantLocations(prev => ({
                ...prev,
                [userId]: { latitude, longitude }
              }));
            } else if (data.message?.type === 'location_sharing_stopped') {
              const { userId } = data.message;
              // Remove the user from participant locations
              setParticipantLocations(prev => {
                const newLocations = { ...prev };
                delete newLocations[userId];
                return newLocations;
              });
              
              // Show notification
              if (Notification.permission === 'granted') {
                new Notification('Location Sharing Stopped', {
                  body: 'The host has stopped sharing their location',
                  icon: '/logo192.png'
                });
              }
              
              // Set host stopped sharing state
              setHostStoppedSharing(true);
              
              // Redirect to main page after a short delay
              setTimeout(() => {
                navigate('/emergency');
              }, 3000);
            }
            break;
            
          case 'error':
            setError(data.message);
            break;
            
          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, navigate]);
  
  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLoading(false);
        },
        (err) => {
          setError('Unable to get your location. Please enable location services to see your position on the map.');
          console.error('Geolocation error:', err);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000
        }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  }, []);
  
  // Join room when connected
  useEffect(() => {
    if (!connected || !roomId || !user || joinedRoom) return;
    
    try {
      socketService.joinLocationShareRoom(roomId);
      setJoinedRoom(true);
    } catch (err) {
      setError(`Failed to join location sharing room: ${err.message}`);
    }
  }, [connected, roomId, user, joinedRoom]);
  
  // Start sharing location after joining room
  useEffect(() => {
    if (!connected || !location || !joinedRoom) return;
    
    try {
      socketService.startSharingLocation(() => location);
    } catch (err) {
      setError(`Failed to start location sharing: ${err.message}`);
    }
    
    return () => {
      socketService.stopSharingLocation();
    };
  }, [connected, location, joinedRoom]);
  
  // Initialize and update map
  useEffect(() => {
    if (!location) return;
    
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([location.latitude, location.longitude], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© We Safe OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
      
      // Add marker for current user
      const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#e11d48;width:20px;height:20px;border-radius:50%;border:2px solid white"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      
      markersRef.current[user?._id] = L.marker([location.latitude, location.longitude], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('You (current location)');
    }
    
    // Update markers for all users (including current user)
    const allLocations = {
      ...participantLocations,
      [user?._id]: location
    };
    
    Object.entries(allLocations).forEach(([userId, userLocation]) => {
      if (!userLocation) return;
      
      const { latitude, longitude } = userLocation;
      
      if (markersRef.current[userId]) {
        markersRef.current[userId].setLatLng([latitude, longitude]);
      } else {
        // Create a new marker for other participants
        const participantIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:#4f46e5;width:20px;height:20px;border-radius:50%;border:2px solid white"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        markersRef.current[userId] = L.marker([latitude, longitude], { icon: participantIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(userId === user?._id ? 'You (current location)' : 'Other participant');
      }
    });
    
    // Fit map to show all markers if there are multiple
    if (Object.keys(allLocations).length > 1) {
      const markers = Object.values(markersRef.current);
      const group = L.featureGroup(markers);
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    } else {
      // Center on current user
      mapInstanceRef.current.setView([location.latitude, location.longitude], 13);
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [location, participantLocations, user]);
  
  // Handle leave location sharing
  const handleLeaveSharing = () => {
    socketService.stopSharingLocation();
    socketService.leaveLocationShareRoom();
    navigate('/emergency');
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
              Shared Location
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              View shared location in real-time
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 relative z-10">
          {error ? (
            <div className="text-center text-red-600 mb-4">
              <p>{error}</p>
              {socketError && <p>{socketError}</p>}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : hostStoppedSharing ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Location Sharing Stopped</h3>
              <p className="text-gray-600 mb-4">The host has stopped sharing their location. You will be redirected to the emergency services page in a few seconds.</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="h-[400px] w-full rounded-lg mb-6"></div>
              
              {location && (
                <div className="mt-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <p className="text-gray-600">
                          Your current location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {Object.keys(participantLocations).length > 0 
                            ? `Viewing location of ${Object.keys(participantLocations).length} other ${Object.keys(participantLocations).length === 1 ? 'person' : 'people'}`
                            : 'No other participants yet'}
                        </p>
                      </div>
                      
                      <button
                        onClick={handleLeaveSharing}
                        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
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

export default SharedLocationView; 