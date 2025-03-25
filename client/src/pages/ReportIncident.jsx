import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ReportIncident = () => {
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: 'Sample Incident',
      description: 'This is a sample incident description.',
      location: 'Sample Location',
      date: '2024-03-20',
      votes: 12,
      comments: [
        { id: 1, user: 'User1', text: 'This is a comment' }
      ]
    }
  ]);
  const [newIncident, setNewIncident] = useState({ title: '', description: '', location: '' });
  const [newComment, setNewComment] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleSubmitIncident = (e) => {
    e.preventDefault();
    if (newIncident.title.trim() && newIncident.description.trim()) {
      const incident = {
        id: Date.now(),
        ...newIncident,
        date: new Date().toISOString().split('T')[0],
        votes: 0,
        comments: []
      };
      setIncidents([incident, ...incidents]);
      setNewIncident({ title: '', description: '', location: '' });
    }
  };

  const handleAddComment = (incidentId) => {
    if (newComment.trim()) {
      setIncidents(incidents.map(incident => {
        if (incident.id === incidentId) {
          return {
            ...incident,
            comments: [
              ...incident.comments,
              { id: Date.now(), user: 'Current User', text: newComment.trim() }
            ]
          };
        }
        return incident;
      }));
      setNewComment('');
    }
  };

  const handleVote = (incidentId, type) => {
    setIncidents(incidents.map(incident => {
      if (incident.id === incidentId) {
        return {
          ...incident,
          votes: type === 'up' ? incident.votes + 1 : incident.votes - 1
        };
      }
      return incident;
    }));
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
              Report Incidents
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
            >
              Report and track safety incidents in your area
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
        {/* Report New Incident Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report New Incident</h2>
          <form onSubmit={handleSubmitIncident} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Incident Title
              </label>
              <input
                type="text"
                id="title"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Brief description of the incident"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={newIncident.location}
                onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Where did this happen?"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Incident Details
              </label>
              <textarea
                id="description"
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Describe the incident in detail"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              Report Incident
            </button>
          </form>
        </div>

        {/* Incidents List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
          {incidents.map((incident) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{incident.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{incident.location} • {incident.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote(incident.id, 'up')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-gray-500">{incident.votes}</span>
                  <button
                    onClick={() => handleVote(incident.id, 'down')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{incident.description}</p>

              {/* Comments Section */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Comments</h4>
                <div className="space-y-3 mb-4">
                  {incident.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">{comment.user}:</span>{' '}
                        <span className="text-gray-600">{comment.text}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Add a comment..."
                  />
                  <button
                    onClick={() => handleAddComment(incident.id)}
                    className="bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
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

export default ReportIncident; 