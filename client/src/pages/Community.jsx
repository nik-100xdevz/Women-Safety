import React from 'react';
import { motion } from 'framer-motion';

// Animation variants for minimalistic animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Community = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-32 pb-16 bg-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 text-center"
          >
            Community Support
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4 text-xl text-gray-600 text-center"
          >
            Connect with organizations and communities dedicated to women's safety and empowerment
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* NGOs Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Non-Governmental Organizations
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Akshara Centre</h3>
              <p className="text-gray-600 mb-4">
                Working towards gender equality and women's rights through education and advocacy.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Location: Mumbai, Maharashtra</p>
                <p className="text-sm text-gray-500">Contact: +91 123 456 7890</p>
                <a href="#" className="text-pink-600 hover:text-pink-700 font-medium inline-block">
                  Learn More →
                </a>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Aarti for Girls</h3>
              <p className="text-gray-600 mb-4">
                Empowering girls through education and skill development programs.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Location: Delhi</p>
                <p className="text-sm text-gray-500">Contact: +91 987 654 3210</p>
                <a href="#" className="text-pink-600 hover:text-pink-700 font-medium inline-block">
                  Learn More →
                </a>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sakshi</h3>
              <p className="text-gray-600 mb-4">
                Providing support and rehabilitation for survivors of violence.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Location: Bangalore</p>
                <p className="text-sm text-gray-500">Contact: +91 456 789 1230</p>
                <a href="#" className="text-pink-600 hover:text-pink-700 font-medium inline-block">
                  Learn More →
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Online Forums Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Online Support Forums
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Discussion Groups</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Women's Safety Forum</h4>
                    <p className="text-gray-600">Share experiences and learn from others</p>
                    <a href="#" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Join Forum →
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Legal Support Group</h4>
                    <p className="text-gray-600">Get legal advice and support</p>
                    <a href="#" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Join Group →
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Self Defense Community</h4>
                    <p className="text-gray-600">Share tips and techniques</p>
                    <a href="#" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Join Community →
                    </a>
                  </div>
                </li>
              </ul>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Support Groups</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Survivors Support Group</h4>
                    <p className="text-gray-600">Connect with others who understand</p>
                    <a href="#" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Join Support Group →
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Career Support Network</h4>
                    <p className="text-gray-600">Professional development and mentorship</p>
                    <a href="#" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Join Network →
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Mental Health Support</h4>
                    <p className="text-gray-600">Emotional support and counseling</p>
                    <a href="#" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                      Join Support Group →
                    </a>
                  </div>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Government Organizations Section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-8"
          >
            Government Organizations
          </motion.h2>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">National Commission for Women</h3>
              <p className="text-gray-600 mb-4">
                Statutory body for women's rights and safety in India.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Helpline: 1091</p>
                <p className="text-sm text-gray-500">Website: www.ncw.nic.in</p>
                <a href="#" className="text-pink-600 hover:text-pink-700 font-medium inline-block">
                  Visit Website →
                </a>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Women and Child Development Department</h3>
              <p className="text-gray-600 mb-4">
                Government department focused on women's welfare and child development.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Helpline: 1098</p>
                <p className="text-sm text-gray-500">Website: www.wcd.nic.in</p>
                <a href="#" className="text-pink-600 hover:text-pink-700 font-medium inline-block">
                  Visit Website →
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Join Community Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-pink-50 rounded-lg p-8 text-center"
        >
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Join Our Community
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 mb-8"
          >
            Connect with others, share experiences, and make a difference
          </motion.p>
          {/* <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-pink-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Sign Up Now
          </motion.button> */}
        </motion.section>
      </div>
    </div>
  );
};

export default Community; 