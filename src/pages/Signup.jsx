import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    graduationYear: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,  // ← Fixed: backticks!
        formData
      );

      // Success — account created, pending approval
      setSuccess(true);
      setLoading(false);

      // Optional: redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setLoading(false);

      if (err.response) {
        const msg = err.response.data.msg || 'Signup failed. Please try again.';

        if (err.response.status === 400) {
          if (msg.includes('exists')) {
            setError('This email is already registered.');
          } else if (msg.includes('year')) {
            setError('Please enter a valid graduation year (1950–2030).');
          } else {
            setError(msg);
          }
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
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-lg w-full border border-primary/20"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-primary mb-2">Join KGHS Alumni</h2>
          <p className="text-textDark/70">Become part of our vibrant sisterhood</p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-center"
          >
            <h3 className="text-2xl font-bold mb-3">Thank You, {formData.name}!</h3>
            <p className="text-lg leading-relaxed">
              Your account has been created and is now <strong>pending approval</strong>.
            </p>
            <p className="mt-3">
              Only verified KGHS graduates are approved. You will receive an email when your account is activated.
            </p>
            <p className="mt-4 text-sm">
              Redirecting to login in 5 seconds...
            </p>
          </motion.div>
        )}

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

        {/* Signup Form - Hidden on success */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-textDark font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl border border-primary/30 focus:border-primary focus:outline-none transition"
                placeholder="Your full name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-textDark font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl border border-primary/30 focus:border-primary focus:outline-none transition"
                placeholder="Create a strong password"
                required
                minLength="6"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-textDark font-medium mb-2">Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-xl border border-primary/30 focus:border-primary focus:outline-none transition"
                placeholder="e.g., 2015"
                min="1950"
                max="2030"
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
              {loading ? 'Submitting...' : 'Request Membership'}
            </motion.button>
          </form>
        )}

        <p className="text-center mt-8 text-textDark/70">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Log in here
          </Link>
        </p>

        <p className="text-center mt-4 text-textDark/60 text-sm">
          Membership is exclusive to verified KGHS graduates. All applications are reviewed by admin.
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;