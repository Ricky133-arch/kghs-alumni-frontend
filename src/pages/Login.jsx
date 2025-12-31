import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      // Success - store token and user data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role || 'alumni');
      localStorage.setItem('userName', res.data.user.name || '');

      // Redirect to profile
      navigate('/profile');
    } catch (err) {
      setLoading(false);

      // Handle different error cases from backend
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full border border-primary/20"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-textDark/70">Log in to your KGHS Alumni account</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-pink-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </motion.button>
        </form>

        <p className="text-center mt-8 text-textDark/70">
          New to KGHS Alumni?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Sign up here
          </Link>
        </p>

        <p className="text-center mt-4 text-textDark/60 text-sm">
          Only verified alumni can log in. Contact admin if you need assistance.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;