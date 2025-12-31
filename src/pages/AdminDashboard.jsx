import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (role !== 'admin') return navigate('/');

    setLoading(true);
    Promise.all([
      axios.get('${import.meta.env.VITE_API_URL}/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('${import.meta.env.VITE_API_URL}/api/donations', { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(([usersRes, donationsRes]) => {
        setUsers(usersRes.data);
        setDonations(donationsRes.data);
        setLoading(false);
      })
      .catch(() => {
        alert('Failed to load data');
        setLoading(false);
      });
  }, [navigate]);

  const handleApprove = async (id) => {
    const token = localStorage.getItem('token');
    await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, { isApproved: true }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.map(u => u._id === id ? { ...u, isApproved: true } : u));
  };

  const handleToggleRole = async (id, currentRole) => {
    const token = localStorage.getItem('token');
    const newRole = currentRole === 'admin' ? 'alumni' : 'admin';
    await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, { role: newRole }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
  };

  if (loading) {
    return <div className="text-center py-32 text-3xl text-primary">Loading dashboard...</div>;
  }

  const pendingUsers = users.filter(u => !u.isApproved);
  const approvedUsers = users.filter(u => u.isApproved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Elegant Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
            Admin
          </h1>
          <p className="text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto leading-relaxed">
            Guardian of our sisterhood — welcome, approve, and nurture our growing family with care.
          </p>
        </motion.div>

        {/* Pending Approvals Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Pending Membership Requests ({pendingUsers.length})
            </h2>

            {pendingUsers.length === 0 ? (
              <p className="text-center text-textDark/60 text-xl py-12">
                No new sisters awaiting approval. All current requests have been reviewed. 🌸
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pendingUsers.map((user) => (
                  <motion.div
                    key={user._id}
                    whileHover={{ y: -8 }}
                    className="bg-primary/5 rounded-2xl p-8 text-center border border-primary/20"
                  >
                    <img
                      src={user.profilePic || 'https://via.placeholder.com/200/FFC0CB/FFFFFF?text=👩'}
                      alt={user.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary/30 mb-6"
                    />
                    <h3 className="text-2xl font-bold text-textDark mb-2">{user.name || 'New Sister'}</h3>
                    <p className="text-primary text-lg mb-1">Class of {user.graduationYear}</p>
                    <p className="text-textDark/70 mb-6">{user.email}</p>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(user._id)}
                      className="bg-primary text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-pink-600 transition"
                    >
                      Welcome Her In ❤️
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Donations Overview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Generous Hearts ({donations.length} donations)
            </h2>

            {donations.length === 0 ? (
              <p className="text-center text-textDark/60 text-xl py-12">
                No donations yet. When sisters give, their kindness will shine here.
              </p>
            ) : (
              <div className="space-y-6">
                {donations.map((d) => (
                  <motion.div
                    key={d._id}
                    whileHover={{ x: 10 }}
                    className="bg-primary/5 rounded-2xl p-6 flex justify-between items-center border border-primary/10"
                  >
                    <div>
                      <p className="text-2xl font-bold text-textDark">
                        ₦{d.amount?.toLocaleString() || 'Amount not recorded'}
                      </p>
                      <p className="text-textDark/70 mt-1">
                        With gratitude from <strong>{d.donor?.name || 'Anonymous Sister'}</strong>
                      </p>
                    </div>
                    <p className="text-primary font-medium text-lg">
                      {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* All Members Table (Optional - Hidden if too long) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
              Our Approved Sisters ({approvedUsers.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-2 border-primary/20">
                  <tr>
                    <th className="py-4 text-textDark font-semibold">Name</th>
                    <th className="py-4 text-textDark font-semibold">Email</th>
                    <th className="py-4 text-textDark font-semibold">Year</th>
                    <th className="py-4 text-textDark font-semibold">Role</th>
                    <th className="py-4 text-textDark font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      whileHover={{ backgroundColor: 'rgba(255,192,203,0.05)' }}
                      className="border-b border-primary/10"
                    >
                      <td className="py-5">{user.name || '—'}</td>
                      <td className="py-5 text-textDark/70">{user.email}</td>
                      <td className="py-5">{user.graduationYear}</td>
                      <td className="py-5">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-textDark'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleRole(user._id, user.role)}
                          className="text-primary font-medium hover:underline"
                        >
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;