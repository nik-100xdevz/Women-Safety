import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportService } from '../services/api';
import { authService } from '../services/api';
import socketService, { useSocket } from '../services/socket';

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [comment, setComment] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Initialize socket connection
  const { socket, connected } = useSocket(user?._id);

  useEffect(() => {
    fetchIncident();
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'comment_added' && data.reportId === id) {
        // Add new comment to the list
        setComment(prevComments => [...prevComments, data.comment]);
      } else if (data.type === 'comment_deleted' && data.reportId === id) {
        // Remove deleted comment from the list
        setComment(prevComments => prevComments.filter(c => c._id !== data.comment._id));
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, connected, id]);

  const fetchIncident = async () => {
    try {
      const response = await reportService.getAllReports();
      const foundIncident = response.report.find(inc => inc._id === id);
      const allComment = await reportService.getCommentsOfReport(id)
      if (foundIncident) {
        setComment(allComment.comments)
        setIncident(foundIncident);
      } else {
        setError('Incident not found');
      }
    } catch (err) {
      setError('Failed to fetch incident details');
      console.error('Error fetching incident:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
     await reportService.addComment(id, { comment: newComment });
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await reportService.deleteComment( commentId);
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
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
            onClick={() => navigate('/emergency/report-incident')}
            className="text-pink-600 hover:text-pink-700"
          >
            ← Back to Reports
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              Incident Details
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{incident.title}</h2>
            <p className="text-gray-500 mb-4">
              Location: {incident.location} • Reported on {new Date(incident.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-700 text-lg">{incident.incident}</p>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Comments</h3>
            
            {/* Comments List */}
            <div className="space-y-4 mb-8">
              {comment?.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* <p className="font-medium text-gray-900">{comment.user.username}</p> */}
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {user && user._id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{comment.comment}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Add a Comment</h4>
              <div className="flex gap-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  rows={3}
                  placeholder="Write your comment..."
                />
                <button
                  onClick={handleAddComment}
                  className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/emergency/report-incident')}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Back to Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail; 