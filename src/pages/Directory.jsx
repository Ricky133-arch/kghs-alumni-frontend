import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Directory = () => {
  const [users, setUsers] = useState([]);
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/directory?year=${year}&location=${location}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Luxurious Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-primary mb-6 leading-tight">
            Our Eternal Sisterhood 
          </h1>
          <p className="text-xl md:text-2xl text-textDark/70 max-w-4xl mx-auto leading-relaxed font-light">
            A sacred space to reconnect with the remarkable women of Kalabari Girls’ High School — 
            across generations, continents, and triumphs.
          </p>
        </motion.div>

        {/* Elegant Search Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row justify-center gap-8 mb-16"
        >
          <div className="relative max-w-md w-full">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary text-2xl">🎓</span>
            <input
              type="text"
              placeholder="Filter by Graduation Year (e.g., 2006)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full pl-16 pr-8 py-6 rounded-3xl border-2 border-primary/20 focus:border-primary bg-white/80 backdrop-blur-lg shadow-xl text-lg transition"
            />
          </div>

          <div className="relative max-w-md w-full">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary text-2xl">📍</span>
            <input
              type="text"
              placeholder="Filter by Location (e.g., Lagos)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-16 pr-8 py-6 rounded-3xl border-2 border-primary/20 focus:border-primary bg-white/80 backdrop-blur-lg shadow-xl text-lg transition"
            />
          </div>
        </motion.div>

        {/* Loading & Empty States */}
        {loading && (
          <div className="text-center py-32">
            <p className="text-3xl text-textDark/60 font-light">Gathering our sisters...</p>
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-32">
            <p className="text-3xl text-textDark/60 font-light">No sisters found with current filters.</p>
            <p className="text-xl text-textDark/50 mt-6">Try broadening your search to rediscover more of our family.</p>
          </div>
        )}

        {/* Elegant Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.8 }}
              whileHover={{ y: -16, boxShadow: "0 30px 60px rgba(255,192,203,0.3)" }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-primary/20 transform-gpu"
            >
              <div className="p-10 text-center">
                <div className="relative inline-block mb-8">
                  <img
                    src={user.profilePic || 'https://via.placeholder.com/400/FFC0CB/FFFFFF?text=👩'}
                    alt={user.name}
                    className="w-48 h-48 rounded-full object-cover border-8 border-primary/40 shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent pointer-events-none"></div>
                </div>

                <h3 className="text-2xl font-bold text-textDark mb-2">{user.name}</h3>
                <p className="text-xl text-primary font-semibold mb-4">Class of {user.graduationYear}</p>
                <p className="text-textDark/70 text-lg mb-6">
                  📍 {user.location || 'Around the world'}
                </p>

                {user.bio && (
                  <p className="text-textDark/80 italic text-base leading-relaxed line-clamp-4">
                    "{user.bio}"
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-t from-primary/10 to-transparent px-10 py-6 text-center">
                <p className="text-primary font-bold text-lg">Forever a KGHS Sister</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Directory;