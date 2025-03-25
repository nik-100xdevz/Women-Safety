import React from 'react';
import { motion } from 'framer-motion';

const Resources = () => {
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
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 text-center"
          >
            Safety Resources
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-xl text-gray-600 text-center"
          >
            Empowering women with knowledge and tools for safety and protection
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Educational Videos Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Educational Videos
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.youtube.com/embed/VIDEO_ID_1"
                  title="Women's Safety Tips"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Essential Safety Tips</h3>
                <p className="text-gray-600">Learn basic safety measures and precautions for everyday situations.</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.youtube.com/embed/VIDEO_ID_2"
                  title="Self Defense Basics"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Self Defense Basics</h3>
                <p className="text-gray-600">Basic self-defense techniques everyone should know.</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.youtube.com/embed/VIDEO_ID_3"
                  title="Digital Safety"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Safety</h3>
                <p className="text-gray-600">Protecting yourself in the digital world.</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Legal Rights Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Legal Rights & Laws
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Important Laws</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">The Sexual Harassment of Women at Workplace Act, 2013</h4>
                    <p className="text-gray-600">Protection against sexual harassment at workplace</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">The Protection of Women from Domestic Violence Act, 2005</h4>
                    <p className="text-gray-600">Protection against domestic violence</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">The Criminal Law (Amendment) Act, 2013</h4>
                    <p className="text-gray-600">Stricter laws against sexual offenses</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Legal Resources</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                    Download Legal Rights Guide →
                  </a>
                </li>
                <li>
                  <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                    Find a Lawyer →
                  </a>
                </li>
                <li>
                  <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                    Legal Aid Services →
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* Self Defense Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Self Defense Training
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Training Programs</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Basic Self Defense</h4>
                    <p className="text-gray-600">Learn fundamental self-defense techniques</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Advanced Martial Arts</h4>
                    <p className="text-gray-600">Comprehensive martial arts training</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Situational Awareness</h4>
                    <p className="text-gray-600">Learn to identify and avoid dangerous situations</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Safety Tools</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                    Download Safety Apps Guide →
                  </a>
                </li>
                <li>
                  <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                    Emergency Contact List →
                  </a>
                </li>
                <li>
                  <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                    Safety Checklist →
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Resources; 