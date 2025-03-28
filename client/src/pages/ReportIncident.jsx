import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [newIncident, setNewIncident] = useState({ title: '', incident: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();
      console.log(response,response.report)
      if (response && response.report) {
        setIncidents(response.report);
      } else {
        // setError('No incidents found');
      }
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!newIncident.title.trim() || !newIncident.incident.trim() || !newIncident.location.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await reportService.createReport(newIncident);
      if (response && response.report) {
        setIncidents([response.report, ...incidents]);
        setNewIncident({ title: '', incident: '', location: '' });
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to report incident');
    } finally {
      setLoading(false);
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
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
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
              <label htmlFor="incident" className="block text-sm font-medium text-gray-700">
                Incident Details
              </label>
              <textarea
                id="incident"
                value={newIncident.incident}
                onChange={(e) => setNewIncident({ ...newIncident, incident: e.target.value })}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Describe the incident in detail"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Reporting...' : 'Report Incident'}
            </button>
          </form>
        </div>

        {/* Incidents List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No incidents reported yet. Be the first to report an incident.</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <Link
                key={incident._id}
                to={`/emergency/report-incident/${incident._id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {incident.location} • Reported on {new Date(incident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {incident.comments?.length || 0} comments
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-3">{incident.incident}</p>
                </motion.div>
              </Link>
            ))
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

export default ReportIncident; 