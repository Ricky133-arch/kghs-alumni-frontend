import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Forums = () => {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [replies, setReplies] = useState({});
  const [creating, setCreating] = useState(false);
  const [replying, setReplying] = useState({});

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/forums')
      .then((res) => {
        // Sort newest first
        setThreads(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      })
      .catch((err) => console.error('Forums fetch error:', err));
  }, []);

  const handleNewThreadChange = (e) => {
    setNewThread({ ...newThread, [e.target.name]: e.target.value });
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.content) return;

    setCreating(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/forums', newThread, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (err) {
      alert('Failed to create thread.');
      setCreating(false);
    }
  };

  const handleReplyChange = (threadId, value) => {
    setReplies({ ...replies, [threadId]: value });
  };

  const handleSubmitReply = async (threadId, e) => {
    e.preventDefault();
    const content = replies[threadId];
    if (!content) return;

    setReplying({ ...replying, [threadId]: true });
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:5000/api/forums/${threadId}/reply`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
    } catch (err) {
      alert('Failed to post reply.');
      setReplying({ ...replying, [threadId]: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Sacred Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
            Our Circle of Voices ❤️
          </h1>
          <p className="text-xl md:text-2xl text-textDark/70 max-w-3xl mx-auto leading-relaxed font-light">
            A safe, loving space where KGHS sisters share wisdom, seek support, celebrate joy, and lift one another up — always with kindness and grace.
          </p>
        </motion.div>

        {/* Threads */}
        {threads.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-3xl text-textDark/60 font-light">
              The circle is quiet for now... but ready for your voice 🌸
            </p>
            <p className="text-xl text-textDark/50 mt-6">
              Start a conversation — your sisters are listening.
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            {threads.map((thread, index) => (
              <motion.article
                key={thread._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-primary/20"
              >
                {/* Thread Header */}
                <div className="bg-gradient-to-r from-primary/20 to-pink-100 p-10">
                  <h2 className="text-4xl font-extrabold text-textDark mb-4">{thread.title}</h2>
                  <div className="flex flex-wrap gap-4 text-primary font-medium">
                    <span>By {thread.author?.name || 'A Sister'}</span>
                    <span>•</span>
                    <span>
                      {new Date(thread.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Thread Content */}
                <div className="p-10 md:p-16">
                  <p className="text-textDark/80 text-xl leading-relaxed whitespace-pre-line">
                    {thread.content}
                  </p>
                </div>

                {/* Replies */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="bg-primary/5 px-10 py-8 border-t border-primary/20">
                    <h3 className="text-2xl font-bold text-primary mb-8 text-center">
                      Sisters Respond ({thread.replies.length})
                    </h3>
                    <div className="space-y-8">
                      {thread.replies.map((reply, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -30 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          className="bg-white/70 rounded-2xl p-8 border border-primary/10"
                        >
                          <p className="text-textDark/80 text-lg leading-relaxed mb-4 whitespace-pre-line">
                            {reply.content}
                          </p>
                          <p className="text-primary font-medium">
                            — {reply.author?.name || 'A Sister'},{' '}
                            {new Date(reply.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="p-10 bg-primary/5 border-t-2 border-primary/20">
                  <h4 className="text-2xl font-bold text-primary mb-6 text-center">
                    Share Your Heart
                  </h4>
                  <form onSubmit={(e) => handleSubmitReply(thread._id, e)} className="max-w-3xl mx-auto">
                    <textarea
                      value={replies[thread._id] || ''}
                      onChange={(e) => handleReplyChange(thread._id, e.target.value)}
                      placeholder="Write your reply with love and kindness..."
                      rows="5"
                      className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-lg resize-none"
                      required
                    />
                    <div className="text-center mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={replying[thread._id]}
                        className="bg-primary text-white px-12 py-5 rounded-full text-xl font-bold shadow-xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
                      >
                        {replying[thread._id] ? 'Sending...' : 'Send Reply ❤️'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Create New Thread */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 md:p-16 border border-primary/20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary text-center mb-12">
            Start a New Conversation
          </h2>

          <form onSubmit={handleCreateThread} className="space-y-10 max-w-4xl mx-auto">
            <div>
              <label className="block text-textDark font-semibold mb-4 text-xl">Thread Title</label>
              <input
                type="text"
                name="title"
                value={newThread.title}
                onChange={handleNewThreadChange}
                placeholder="e.g., Reflections on Our 20-Year Reunion"
                className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-xl"
                required
              />
            </div>

            <div>
              <label className="block text-textDark font-semibold mb-4 text-xl">Your Message</label>
              <textarea
                name="content"
                value={newThread.content}
                onChange={handleNewThreadChange}
                rows="10"
                placeholder="Share what’s on your heart... your sisters are here to listen."
                className="w-full px-8 py-6 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition text-xl resize-none"
                required
              />
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(255,192,203,0.3)" }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={creating}
                className="bg-primary text-white px-20 py-7 rounded-full text-2xl font-bold shadow-2xl hover:bg-pink-600 transition-all duration-300 disabled:opacity-70"
              >
                {creating ? 'Opening the Circle...' : 'Begin This Conversation ❤️'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Forums;