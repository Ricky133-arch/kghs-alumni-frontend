import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to verify your donation.');
        return;
      }

      axios
        .get(`http://localhost:5000/api/donations/verify/${reference}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            // Success already shown via design below
          } else {
            alert('Payment could not be verified. Please contact support.');
          }
        })
        .catch(() => {
          alert('Error verifying payment. Please contact us if you were charged.');
        });
    }
  }, [reference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 text-center border border-primary/20"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <span className="text-5xl">❤️</span>
        </motion.div>

        {/* Main Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold text-primary mb-6"
        >
          Thank You for Your Generous Donation!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-xl md:text-2xl text-textDark/80 mb-10 leading-relaxed max-w-2xl mx-auto"
        >
          Your support brings us one step closer to empowering the next generation of KGHS girls through education, mentorship, and opportunity. 
          From the bottom of our hearts — thank you for believing in our mission.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12"
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-10 py-5 rounded-full text-xl font-semibold shadow-xl hover:bg-pink-600 transition duration-300"
            >
              Back to Home
            </motion.button>
          </Link>

          <Link to="/donations">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-primary text-primary bg-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-primary hover:text-white transition duration-300"
            >
              Donate Again
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-textDark/60 mt-12 text-lg"
        >
          A receipt has been sent to your email. Thank you for being part of the KGHS sisterhood ❤️
        </motion.p>
      </motion.div>
    </div>
  );
};

export default DonationSuccess;