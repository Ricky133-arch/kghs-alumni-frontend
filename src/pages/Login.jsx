import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role || 'alumni');
      localStorage.setItem('userName', res.data.user.name || '');

      navigate('/profile');
    } catch (err) {
      setLoading(false);
      if (err.response) {
        const msg = err.response.data.msg || 'Login failed. Please try again.';
        if (err.response.status === 403) {
          setError('Your account is pending approval. You will receive an email when approved.');
        } else if (err.response.status === 400) {
          setError('Invalid email or password.');
        } else {
          setError(msg);
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setForgotError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email: forgotEmail }
      );
      setForgotMessage(res.data.msg || 'Check your email for a password reset link.');
      setTimeout(() => setIsForgotMode(false), 4000); // Auto return to login after success
    } catch (err) {
      setForgotError(
        err.response?.data?.msg || 'Something went wrong. Please try again.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full border border-primary/20"
      >
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-primary mb-2"
          >
            {isForgotMode ? 'Reset Password' : 'Welcome Back'}
          </motion.h2>
          <p className="text-textDark/70">
            {isForgotMode
              ? 'Enter your email to receive a reset link'
              : 'Log in to your KGHS Alumni account'}
          </p>
        </div>

        {/* General Error */}
        {error && !isForgotMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Forgot Password Messages */}
        {forgotMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center"
          >
            {forgotMessage}
          </motion.div>
        )}
        {forgotError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center"
          >
            {forgotError}
          </motion.div>
        )}

        {/* Login Form */}
        {!isForgotMode ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-textDark font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-primary/30 focus:border-primary focus:outline-none transition"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-textDark font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-primary/30 focus:border-primary focus:outline-none transition"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-pink-600 transition disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </motion.button>
          </form>
        ) : (
          /* Forgot Password Form */
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-textDark font-medium mb-2">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border border-primary/30 focus:border-primary focus:outline-none transition"
                placeholder="your@email.com"
                required
                disabled={forgotLoading}
              />
            </div>

            <motion.button
              whileHover={{ scale: forgotLoading ? 1 : 1.05 }}
              whileTap={{ scale: forgotLoading ? 1 : 0.95 }}
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-pink-600 transition disabled:opacity-70"
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
        )}

        {/* Toggle Links */}
        <div className="text-center mt-8 space-y-4">
          {!isForgotMode ? (
            <>
              <p className="text-textDark/70">
                New to KGHS Alumni?{' '}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Sign up here
                </Link>
              </p>
              <button
                onClick={() => setIsForgotMode(true)}
                className="text-primary font-medium hover:text-accent-orchid transition underline decoration-accent-lavender/50"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsForgotMode(false);
                setForgotMessage('');
                setForgotError('');
              }}
              className="text-primary font-medium hover:text-accent-orchid transition underline decoration-accent-lavender/50"
            >
              ← Back to Log In
            </button>
          )}
        </div>

        <p className="text-center mt-6 text-textDark/60 text-sm">
          Only verified alumni can log in. Contact admin if you need assistance.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;