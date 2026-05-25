import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ─── Hook: window width ───────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    let t;
    const h = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 100); };
    window.addEventListener('resize', h);
    return () => { window.removeEventListener('resize', h); clearTimeout(t); };
  }, []);
  return w;
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
    style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 24px', borderRadius: 999, background: type === 'error' ? 'rgba(220,50,80,0.92)' : 'rgba(180,60,100,0.92)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
    {msg}
  </motion.div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'frm-spin 0.8s linear infinite', verticalAlign: 'middle', marginRight: 7 }} />
);

// ─── Initials bubble ─────────────────────────────────────────────────────────
const InitialsBubble = ({ name, size = 36 }) => {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,rgba(255,192,203,0.5),rgba(255,150,180,0.35))', border: '2px solid rgba(255,192,203,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: 'rgba(180,60,100,0.85)' }}>
      {initials}
    </div>
  );
};

// ─── Thread card ──────────────────────────────────────────────────────────────
const ThreadCard = ({ thread, isMobile, onReplySuccess, showToast }) => {
  const [open, setOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [localReplies, setLocalReplies] = useState(thread.replies || []);
  const textareaRef = useRef(null);

  const PREVIEW = 200;
  const isLong = thread.content?.length > PREVIEW;
  const [expanded, setExpanded] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    const content = replyText.trim();
    if (!content) return;
    const token = localStorage.getItem('token');
    if (!token) { showToast('Please log in to reply.', 'error'); return; }
    setReplying(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/forums/${thread._id}/reply`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // server returns the updated thread
      const updated = res.data;
      setLocalReplies(updated.replies || [...localReplies, { content, author: { name: 'You' }, date: new Date() }]);
      setReplyText('');
      setOpen(true); // keep replies open to see the new one
      showToast('Reply posted! 💕');
    } catch {
      showToast('Failed to post reply.', 'error');
    }
    setReplying(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 4px 24px rgba(255,150,180,0.07)', overflow: 'hidden', transform: 'translateZ(0)' }}>

      {/* Thread header */}
      <div style={{ padding: isMobile ? '16px 16px 12px' : '20px 24px 14px', background: 'linear-gradient(135deg,rgba(255,192,203,0.18),rgba(255,150,180,0.07))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <InitialsBubble name={thread.author?.name} size={isMobile ? 36 : 42} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: isMobile ? '1.05rem' : '1.2rem', fontWeight: 800, color: 'rgba(30,15,25,0.9)', lineHeight: 1.2 }}>
              {thread.title}
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(160,60,100,0.65)', fontWeight: 500 }}>
              {thread.author?.name || 'A Sister'} · {new Date(thread.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {/* Reply count badge */}
          {localReplies.length > 0 && (
            <button onClick={() => setOpen(o => !o)}
              style={{ flexShrink: 0, background: open ? 'rgba(255,192,203,0.4)' : 'rgba(255,192,203,0.2)', border: '1.5px solid rgba(255,192,203,0.5)', borderRadius: 999, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(180,60,100,0.8)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {localReplies.length} {localReplies.length === 1 ? 'reply' : 'replies'} {open ? '↑' : '↓'}
            </button>
          )}
        </div>
      </div>

      {/* Thread body */}
      <div style={{ padding: isMobile ? '12px 16px 14px' : '14px 24px 18px' }}>
        <p style={{ margin: 0, fontSize: isMobile ? '0.92rem' : '0.98rem', color: 'rgba(50,25,40,0.75)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
          {isLong && !expanded ? thread.content.slice(0, PREVIEW) + '…' : thread.content}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-primary"
            style={{ marginTop: 6, background: 'none', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}>
            {expanded ? 'Show less ↑' : 'Read more ↓'}
          </button>
        )}
      </div>

      {/* Replies section */}
      <AnimatePresence>
        {open && localReplies.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,192,203,0.2)', background: 'rgba(255,192,203,0.04)' }}>
            <div style={{ padding: isMobile ? '12px 16px' : '14px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {localReplies.map((reply, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '10px 12px' : '12px 16px', border: '1px solid rgba(255,192,203,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <InitialsBubble name={reply.author?.name} size={28} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.88rem', color: 'rgba(50,25,40,0.78)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                      {reply.content}
                    </p>
                    <p className="text-primary" style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600 }}>
                      {reply.author?.name || 'A Sister'} · {new Date(reply.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply form */}
      <div style={{ padding: isMobile ? '10px 16px 14px' : '12px 24px 18px', borderTop: '1px solid rgba(255,192,203,0.2)', background: 'rgba(255,245,248,0.5)' }}>
        {localReplies.length === 0 && (
          <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: 'rgba(160,60,100,0.5)', fontWeight: 500 }}>
            No replies yet — be the first to respond 💬
          </p>
        )}
        <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(e); }}
            placeholder="Reply with love…"
            rows={2}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 14, border: '2px solid rgba(255,192,203,0.35)', background: '#fff', fontSize: '0.9rem', color: 'rgba(40,20,30,0.85)', outline: 'none', resize: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary,#ff69b4)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,192,203,0.2)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,192,203,0.35)'; e.target.style.boxShadow = 'none'; }}
          />
          <motion.button type="submit" disabled={replying || !replyText.trim()} whileTap={{ scale: 0.95 }}
            className="bg-primary text-white"
            style={{ padding: '10px 18px', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: replying || !replyText.trim() ? 'not-allowed' : 'pointer', opacity: replying || !replyText.trim() ? 0.55 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            {replying ? <Spinner /> : null}
            {isMobile ? '↑' : 'Reply'}
          </motion.button>
        </form>
        <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: 'rgba(160,80,100,0.4)' }}>
          {isMobile ? 'Tap Reply to send' : '⌘ + Enter to send'}
        </p>
      </div>
    </div>
  );
};

// ─── Main Forums ──────────────────────────────────────────────────────────────
const Forums = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const width = useWindowWidth();
  const isMobile = width < 768;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/forums`)
      .then(res => { setThreads(res.data.sort((a, b) => new Date(b.date) - new Date(a.date))); setLoading(false); })
      .catch(err => { console.error('Forums fetch error:', err); setLoading(false); });
  }, []);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) { showToast('Please add a title and message.', 'error'); return; }
    const token = localStorage.getItem('token');
    if (!token) { showToast('Please log in to start a conversation.', 'error'); return; }
    setCreating(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/forums`, newThread, { headers: { Authorization: `Bearer ${token}` } });
      setThreads(prev => [res.data, ...prev]);
      setNewThread({ title: '', content: '' });
      setShowForm(false);
      showToast('Conversation started! 🌸');
    } catch {
      showToast('Failed to create thread. Please try again.', 'error');
    }
    setCreating(false);
  };

  const filtered = threads.filter(t =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.content?.toLowerCase().includes(search.toLowerCase()) || t.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes frm-spin { to { transform: rotate(360deg); } }
        @keyframes frm-shimmer { from { background-position: -500px 0; } to { background-position: 500px 0; } }
        .frm-search { width: 100%; padding: 11px 14px 11px 40px; border-radius: 14px; border: 2px solid rgba(255,192,203,0.35); background: rgba(255,255,255,0.9); font-size: 0.9rem; color: rgba(40,20,30,0.85); outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; font-family: inherit; }
        .frm-search:focus { border-color: var(--color-primary,#ff69b4); box-shadow: 0 0 0 3px rgba(255,192,203,0.2); }
        .frm-search::placeholder { color: rgba(180,100,130,0.4); }
        .frm-input { width: 100%; padding: 12px 16px; border-radius: 14px; border: 2px solid rgba(255,192,203,0.35); background: rgba(255,255,255,0.9); font-size: 0.95rem; color: rgba(40,20,30,0.85); outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; font-family: inherit; }
        .frm-input:focus { border-color: var(--color-primary,#ff69b4); box-shadow: 0 0 0 3px rgba(255,192,203,0.2); }
        .frm-input::placeholder { color: rgba(180,100,130,0.4); }
      `}</style>

      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ padding: isMobile ? '36px 14px 60px' : '52px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 36 }}>
            <h1 className="text-primary"
              style={{ fontSize: isMobile ? '2.2rem' : 'clamp(2.6rem,6vw,4rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px' }}>
              Our Circle of Voices 💬
            </h1>
            <p className="text-textDark/70"
              style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
              A safe, loving space to share wisdom, seek support, celebrate joy, and lift one another up.
            </p>
          </motion.div>

          {/* Top bar: search + new thread button */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: isMobile ? 20 : 28, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
              <input type="text" className="frm-search" placeholder="Search threads…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowForm(s => !s)}
              className="bg-primary text-white"
              style={{ padding: isMobile ? '11px 20px' : '11px 24px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {showForm ? '✕ Cancel' : '+ New Thread'}
            </motion.button>
          </motion.div>

          {/* New thread form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden', marginBottom: isMobile ? 20 : 28 }}
              >
                <div style={{ background: '#fff', borderRadius: 22, border: '1px solid rgba(255,192,203,0.35)', boxShadow: '0 4px 24px rgba(255,150,180,0.1)' }}>
                  <div style={{ padding: isMobile ? '16px 16px 0' : '20px 24px 0', borderBottom: '1px solid rgba(255,192,203,0.2)' }}>
                    <h2 className="text-primary" style={{ margin: '0 0 4px', fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 700 }}>Start a New Conversation</h2>
                    <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: 'rgba(100,50,70,0.5)' }}>Your sisters are here to listen 🌸</p>
                  </div>
                  <form onSubmit={handleCreateThread} style={{ padding: isMobile ? '16px 16px 20px' : '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
                      <input type="text" name="title" value={newThread.title} onChange={e => setNewThread(t => ({ ...t, title: e.target.value }))}
                        placeholder="e.g. Reflections on our 20-year reunion"
                        className="frm-input" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Message</label>
                      <textarea name="content" value={newThread.content} onChange={e => setNewThread(t => ({ ...t, content: e.target.value }))}
                        rows={5} placeholder="Share what's on your heart…" className="frm-input"
                        style={{ resize: 'vertical', minHeight: 100 }} required />
                    </div>
                    <motion.button type="submit" disabled={creating} whileTap={{ scale: 0.97 }}
                      className="bg-primary text-white"
                      style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.75 : 1 }}>
                      {creating && <Spinner />}{creating ? 'Opening the circle…' : 'Begin This Conversation 💬'}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[220, 160, 200].map((h, i) => (
                <div key={i} style={{ height: h, borderRadius: 22, background: 'linear-gradient(90deg,rgba(255,192,203,0.15) 25%,rgba(255,192,203,0.3) 50%,rgba(255,192,203,0.15) 75%)', backgroundSize: '500px 100%', animation: 'frm-shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '48px 0' : '80px 0' }}>
              <p className="text-textDark/60" style={{ fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: 300, margin: '0 0 10px' }}>
                {search ? `No threads matching "${search}"` : 'The circle is quiet… but ready for your voice 🌸'}
              </p>
              {!search && (
                <button onClick={() => setShowForm(true)}
                  className="text-primary"
                  style={{ marginTop: 12, background: 'none', border: '2px solid rgba(255,192,203,0.5)', borderRadius: 999, padding: '9px 24px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Start the first conversation →
                </button>
              )}
            </div>
          )}

          {/* Thread list */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 16 }}>
              {filtered.map((thread, index) => (
                <motion.div key={thread._id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.25) }}>
                  <ThreadCard thread={thread} isMobile={isMobile} showToast={showToast} />
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Forums;
