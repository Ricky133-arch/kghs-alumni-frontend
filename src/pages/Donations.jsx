import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Donations = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-primary mb-6"
          >
            Support Our Mission
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-textDark/80 max-w-2xl mx-auto leading-relaxed"
          >
            Your generous contribution helps empower the next generation of KGHS girls through scholarships, school restoration, mentorship programs, and community initiatives.
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-primary/20"
        >
          <h2 className="text-3xl font-bold text-textDark mb-8 text-center">
            Make a Donation
          </h2>

          <p className="text-center text-textDark/80 text-lg mb-12">
            We gratefully accept bank transfers from anywhere in the world. Click below to view our account details.
          </p>

          {/* Donate Button - Reveals Details */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(255,192,203,0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDetails(!showDetails)}
              className="bg-primary text-white py-6 px-16 rounded-2xl text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300"
            >
              {showDetails ? 'Hide Details' : 'Donate Securely Now'}
            </motion.button>
          </div>

          {/* Bank Details - Slide Down Reveal */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 overflow-hidden"
              >
                <div className="bg-primary/5 rounded-2xl p-10 border-2 border-primary/20 text-center">
                  <h3 className="text-2xl font-bold text-primary mb-8">
                    Bank Transfer Details
                  </h3>

                  <div className="space-y-6 text-lg text-textDark/90">
                    <div>
                      <p className="font-semibold">Bank Name</p>
                      <p className="text-xl mt-1">Zenith Bank Plc</p>
                    </div>
                    <div>
                      <p className="font-semibold">Account Name</p>
                      <p className="text-xl mt-1">KALABARI GIRLS</p>
                    </div>
                    <div>
                      <p className="font-semibold">Account Number</p>
                      <p className="text-2xl font-bold text-primary mt-1">1226557765</p>
                    </div>
                    
                  </div>

                  <p className="text-textDark/70 mt-10 italic">
                    Thank you for your love and support. Every gift makes a difference in a KGHS girl's life.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Message */}
          <div className="mt-12 pt-8 border-t border-primary/20 text-center">
            <p className="text-textDark/70">
              All donations go directly to supporting KGHS students and programs.
            </p>
            <p className="text-sm text-textDark/60 mt-4">
              For receipts or questions, contact us.
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <div className="text-center mt-10">
          <Link to="/" className="text-primary font-medium hover:underline">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Donations;