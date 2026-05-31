import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!reference) {
      // No reference param — user navigated here directly, treat as success display
      setStatus('success');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('You need to be logged in for your donation to be recorded. Your payment may still have gone through — please contact us.');
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/donations/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg('Payment could not be verified. Please contact support with your reference: ' + reference);
        }
      })
      .catch((err) => {
        // Even if verify fails, the webhook may have already recorded it
        console.error('Verify error:', err);
        setStatus('success'); // Show success UI — webhook is the real safety net
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 text-center border border-primary/20"
      >
        {/* Verifying state */}
        {status === 'verifying' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '4px solid rgba(255,192,203,0.3)',
                borderTop: '4px solid #ff69b4',
                margin: '0 auto 32px',
              }}
            />
            <h2 className="text-2xl font-bold text-primary mb-4">Verifying your donation...</h2>
            <p className="text-textDark/60">Please wait a moment.</p>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <span className="text-5xl"></span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold text-primary mb-6"
            >
              Thank You for Your Generous Donation!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-textDark/80 mb-10 leading-relaxed max-w-xl mx-auto"
            >
              Your support brings us one step closer to empowering the next generation of KGHS girls through education, mentorship, and opportunity.
              From the bottom of our hearts — thank you for believing in our mission.
            </motion.p>

            {reference && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                style={{
                  fontSize: '0.82rem', color: 'rgba(120,60,80,0.5)',
                  margin: '-20px 0 32px', fontFamily: 'monospace',
                }}
              >
                Reference: {reference}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-4"
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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-textDark/60 mt-12 text-lg"
            >
              A receipt has been sent to your email. Thank you for being part of the KGHS sisterhood 
            </motion.p>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-8 bg-red-50 rounded-full flex items-center justify-center"
            >
              <span className="text-5xl"></span>
            </motion.div>

            <h1 className="text-3xl font-extrabold text-red-500 mb-4">Payment Verification Issue</h1>
            <p className="text-textDark/70 mb-8 leading-relaxed max-w-lg mx-auto">
              {errorMsg || 'We had trouble verifying your payment. If you were charged, please contact us — we will sort it out quickly.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <button className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-600 transition">
                  Back to Home
                </button>
              </Link>
              <Link to="/donations">
                <button className="border-2 border-primary text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary hover:text-white transition">
                  Try Again
                </button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DonationSuccess;
