import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    graduationYear: '',
    bio: '',
    location: '',
    profilePic: null,
  });
  const [previewPic, setPreviewPic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false); // ← Added for feedback
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          graduationYear: res.data.graduationYear || '',
          bio: res.data.bio || '',
          location: res.data.location || '',
          profilePic: null,
        });
        setPreviewPic(res.data.profilePic);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'profilePic') {
      const file = e.target.files[0];
      setFormData({ ...formData, profilePic: file });
      setPreviewPic(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccess(true);
      setSaving(false);
      // Optional: reload to show fresh data
      window.location.reload();
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Update failed. Please try again.');
      setSaving(false);
    }
  };

  if (!user) return <div className="text-center py-32 text-3xl text-primary">Loading your profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-primary/10 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4">
            Welcome Back, {user.name} ❤️
          </h1>
          <p className="text-xl text-textDark/70">Class of {user.graduationYear}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile Photo & Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center border border-primary/20">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative inline-block"
              >
                <img
                  src={previewPic || 'https://via.placeholder.com/300/FFC0CB/FFFFFF?text=👩'}
                  alt="Your Profile"
                  className="w-64 h-64 rounded-full object-cover border-8 border-primary/30 shadow-xl mx-auto"
                />
              </motion.div>

              <h2 className="text-3xl font-bold text-textDark mt-8">{user.name}</h2>
              <p className="text-2xl text-primary mt-2">Class of {user.graduationYear}</p>
              <p className="text-textDark/70 mt-4 text-lg">{user.location || 'Add your location'}</p>

              <div className="mt-8">
                <label className="block text-primary font-semibold mb-3 cursor-pointer text-lg hover:underline">
                  Change Profile Photo
                  <input
                    type="file"
                    name="profilePic"
                    onChange={handleChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </motion.div>

          {/* Edit Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-primary/20">
              <h3 className="text-3xl font-bold text-primary mb-8">Edit Your Profile</h3>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-center"
                >
                  <p className="text-xl font-bold">Profile updated successfully! ❤️</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-textDark font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-textDark font-semibold mb-2">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
                    min="1950"
                    max="2030"
                    required
                  />
                </div>

                <div>
                  <label className="block text-textDark font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Lagos, Nigeria"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg"
                  />
                </div>

                <div>
                  <label className="block text-textDark font-semibold mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Share your journey, achievements, or a message to your sisters..."
                    className="w-full px-6 py-4 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(255,192,203,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-white py-5 rounded-2xl text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
                >
                  {saving ? 'Saving Changes...' : 'Save Profile'}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;