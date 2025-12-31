import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const News = () => {
  const [news, setNews] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [minutesForm, setMinutesForm] = useState({ title: '', file: null });
  const [posting, setPosting] = useState(false);
  const [uploadingMinutes, setUploadingMinutes] = useState(false);
  const role = localStorage.getItem('role');

  useEffect(() => {
    // Fetch News
    axios
      .get('${import.meta.env.VITE_API_URL}/api/news')
      .then((res) => {
        setNews(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch((err) => console.error('News fetch error:', err));

    // Fetch Board Minutes
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/board-minutes`)
      .then((res) => {
        setMinutes(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch((err) => console.error('Minutes fetch error:', err));
  }, []);

  const handleNewsChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setPosting(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/news`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      alert('Failed to post news.');
      setPosting(false);
    }
  };

  const handleMinutesChange = (e) => {
    if (e.target.name === 'file') {
      setMinutesForm({ ...minutesForm, file: e.target.files[0] });
    } else {
      setMinutesForm({ ...minutesForm, [e.target.name]: e.target.value });
    }
  };

  const handleMinutesSubmit = async (e) => {
    e.preventDefault();
    if (!minutesForm.title || !minutesForm.file) return;

    setUploadingMinutes(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', minutesForm.title);
    data.append('file', minutesForm.file);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/board-minutes`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      window.location.reload();
    } catch (err) {
      alert('Failed to upload minutes.');
      setUploadingMinutes(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Elegant Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
            Our Voice & Stories ❤️
          </h1>
          <p className="text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto leading-relaxed font-light">
            Updates, reflections, and official records from the heart of our sisterhood — keeping every KGHS woman connected, informed, and inspired.
          </p>
        </motion.div>

        {/* News Articles */}
        {news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-textDark/60 font-light">
              No news yet... but our story is always unfolding 🌸
            </p>
          </div>
        ) : (
          <div className="space-y-16 mb-32">
            {news.map((item, index) => (
              <motion.article
                key={item._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                whileHover={{ y: -8 }}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-primary/20"
              >
                <div className="bg-gradient-to-r from-primary/20 to-pink-100 p-10 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {new Date(item.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="p-10 md:p-16">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-textDark mb-8">
                    {item.title}
                  </h2>
                  <p className="text-textDark/80 text-xl leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>

                  <div className="mt-12 pt-8 border-t border-primary/20 flex justify-between items-center flex-wrap gap-4">
                    <p className="text-primary font-semibold text-lg">
                      Posted by <span className="font-bold">{item.author?.name || 'Admin'}</span>
                    </p>
                    <p className="text-textDark/60">
                      {new Date(item.date).toLocaleTimeString('en-GB', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 px-10 py-6 text-center">
                  <p className="text-primary font-bold text-lg">From our family to yours</p>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Board Minutes Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 border border-primary/30 mb-32"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary text-center mb-12">
            Board Meeting Minutes 📜
          </h2>
          <p className="text-center text-textDark/70 text-xl mb-16 max-w-3xl mx-auto leading-relaxed">
            Official records of our Foundation's governance — shared with love and transparency for all sisters to stay informed.
          </p>

          {minutes.length === 0 ? (
            <p className="text-center text-2xl text-textDark/60 py-12">
              No minutes available yet. They will be posted after each board meeting.
            </p>
          ) : (
            <div className="space-y-10">
              {minutes.map((minute, index) => (
                <motion.div
                  key={minute._id}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="bg-primary/5 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 border border-primary/20"
                >
                  <div>
                    <h3 className="text-3xl font-bold text-textDark mb-3">{minute.title}</h3>
                    <p className="text-primary font-medium text-lg">
                      {new Date(minute.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <a
                    href={minute.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-12 py-5 rounded-full text-xl font-bold shadow-xl hover:bg-pink-600 transition-all duration-300 flex items-center gap-4"
                  >
                    <span>Download PDF</span>
                    <span className="text-3xl">↓</span>
                  </a>
                </motion.div>
              ))}
            </div>
          )}

          {/* Admin Upload Minutes */}
          {role === 'admin' && (
            <div className="mt-20 pt-16 border-t-4 border-primary/20">
              <h3 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">
                Upload New Board Minutes
              </h3>
              <form onSubmit={handleMinutesSubmit} className="space-y-10 max-w-3xl mx-auto">
                <div>
                  <label className="block text-textDark font-semibold mb-4 text-xl">Meeting Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Q4 2025 Board Meeting"
                    value={minutesForm.title}
                    onChange={handleMinutesChange}
                    name="title"
                    className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-textDark font-semibold mb-4 text-xl">PDF File</label>
                  <input
                    type="file"
                    accept=".pdf"
                    name="file"
                    onChange={handleMinutesChange}
                    className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 bg-white/80 focus:border-primary focus:outline-none transition text-xl file:mr-6 file:py-5 file:px-10 file:rounded-full file:border-0 file:text-xl file:font-medium file:bg-primary file:text-white hover:file:bg-pink-600 cursor-pointer"
                    required
                  />
                </div>

                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={uploadingMinutes}
                    className="bg-primary text-white px-20 py-7 rounded-full text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
                  >
                    {uploadingMinutes ? 'Uploading...' : 'Publish Minutes'}
                  </motion.button>
                </div>
              </form>
            </div>
          )}
        </motion.div>

        {/* Admin Post News Form */}
        {role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 border border-primary/20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-primary text-center mb-12">
              Share a New Story
            </h2>

            <form onSubmit={handleNewsSubmit} className="space-y-10 max-w-4xl mx-auto">
              <div>
                <label className="block text-textDark font-semibold mb-4 text-xl">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleNewsChange}
                  placeholder="e.g., Our 2026 Reunion – A Celebration of Sisterhood"
                  className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-textDark font-semibold mb-4 text-xl">Message</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleNewsChange}
                  rows="12"
                  placeholder="Write from the heart... share updates, reflections, or joyful news with your sisters."
                  className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-xl resize-none"
                  required
                />
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(255,192,203,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={posting}
                  className="bg-primary text-white px-20 py-7 rounded-full text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
                >
                  {posting ? 'Posting...' : 'Publish to Our Sisters ❤️'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default News;