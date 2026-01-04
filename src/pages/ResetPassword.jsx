import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null); // null = checking, false = invalid, true = valid

  const { token } = useParams();
  const navigate = useNavigate();

  // Validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Send a POST request with empty body to trigger backend validation
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
          {}
        );
        setValidToken(true);
      } catch (err) {
        setValidToken(false);
        setError('This reset link is invalid or has expired. Please request a new one.');
      }
    };

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validToken) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.msg);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center">
          <p className="text-xl text-primary">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 max-w-md w-full border border-primary/20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8">
            Invalid Link
          </h2>
          <p className="text-xl text-red-600 mb-8">
            {error}
          </p>
          <Link to="/forgot-password">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-10 py-5 rounded-full text-xl font-semibold shadow-xl hover:bg-accent-orchid transition"
            >
              Request New Reset Link
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Valid token — show form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 max-w-md w-full border border-primary/20 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8">
          Reset Your Password
        </h2>

        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 text-xl mb-6"
          >
            {message}<br />
            <span className="text-sm">Redirecting to login...</span>
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-xl mb-6"
          >
            {error}
          </motion.p>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-6 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary transition text-lg"
              required
              disabled={loading}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-6 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary transition text-lg"
              required
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-full text-xl font-bold shadow-xl hover:bg-accent-orchid transition disabled:opacity-70"
            >
              {loading ? 'Resetting...' : 'Set New Password'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;