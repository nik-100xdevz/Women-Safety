import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportService } from '../services/api';

const MyComments = () => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await reportService.getUserComments();
      console.log(response)
      setComments(response.comment || []);
    } catch (err) {
      setError('Failed to fetch your comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId, reportId) => {
    try {
      await reportService.deleteComment(reportId, commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
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
            onClick={() => navigate('/profile')}
            className="text-pink-600 hover:text-pink-700"
          >
            ← Back to Profile
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
              My Comments
            </motion.h1>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-gray-500 text-lg mb-4">You haven't made any comments yet.</p>
            <button
              onClick={() => navigate('/emergency/report-incident')}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              View Reports →
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {comments.map((comment) => (
             
              <Link to={`/emergency/report-incident/${comment.reportId._id}`}>
              <div
                key={comment._id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      On: {comment.reportId.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment._id, comment.reportId._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mb-4">{comment.text}</p>
                <button
                  onClick={() => navigate(`/emergency/report-incident/${comment.report._id}`)}
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  View Report →
                </button>
              </div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/profile')}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            ← Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyComments; 