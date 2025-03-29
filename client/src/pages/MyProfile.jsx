import React, { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import FriendManagement from '../components/FriendManagement';

const MyProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-pink-600 hover:text-pink-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              My Profile
            </motion.h1>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-3xl text-pink-600 font-medium">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className='text-gray-500'>

             Your chat id <span className='text-black font-bold'>{user._id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/profile/reports"
              className="bg-pink-50 p-6 rounded-lg text-center hover:bg-pink-100 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Reports</h3>
              <p className="text-gray-600">View and manage your incident reports</p>
            </Link>

            <Link
              to="/profile/comments"
              className="bg-pink-50 p-6 rounded-lg text-center hover:bg-pink-100 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Comments</h3>
              <p className="text-gray-600">View and manage your comments</p>
            </Link>

            <button
              onClick={() => navigate('/emergency/report-incident')}
              className="bg-pink-50 p-6 rounded-lg text-center hover:bg-pink-100 transition-colors duration-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">New Report</h3>
              <p className="text-gray-600">Create a new incident report</p>
            </button>
          </div>
        </motion.div>

        {/* Friend Management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Friends & Connections</h2>
          <FriendManagement />
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile; 