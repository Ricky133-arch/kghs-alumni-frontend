import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ─── Cloudinary helpers ───────────────────────────────────────────────
const newsThumb = (url) => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/w_900,q_auto,f_auto/');
};
const newsPlaceholder = (url) => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/w_20,q_10,e_blur:800,f_auto/');
};

// ─── Progressive image ────────────────────────────────────────────────
const ProgressiveImg = ({ src, alt, style }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
      <img src={newsPlaceholder(src)} alt="" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px)', transform: 'scale(1.06)', opacity: loaded ? 0 : 1, transition: 'opacity 0.4s' }} />
      <img src={newsThumb(src)} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s', display: 'block' }} />
    </div>
  );
};

// ─── Image gallery (1, 2, or 3 photos) ───────────────────────────────
const NewsGallery = ({ images, title, onLightbox }) => {
  if (!images || images.length === 0) return null;
  const count = images.length;

  if (count === 1) return (
    <div style={{ width: '100%', height: 240, cursor: 'pointer', overflow: 'hidden', display: 'block', flexShrink: 0 }} onClick={() => onLightbox(images, 0)}>
      <ProgressiveImg src={images[0]} alt={title} />
    </div>
  );

  if (count === 2) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 220, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
      {images.map((img, i) => (
        <div key={i} style={{ overflow: 'hidden', height: '100%' }} onClick={() => onLightbox(images, i)}>
          <ProgressiveImg src={img} alt={`${title} ${i + 1}`} />
        </div>
      ))}
    </div>
  );

  // 3 images: big left, two stacked right
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 240, cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ overflow: 'hidden', height: '100%' }} onClick={() => onLightbox(images, 0)}>
        <ProgressiveImg src={images[0]} alt={`${title} 1`} />
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 2, height: '100%' }}>
        {images.slice(1).map((img, i) => (
          <div key={i} style={{ overflow: 'hidden' }} onClick={() => onLightbox(images, i + 1)}>
            <ProgressiveImg src={img} alt={`${title} ${i + 2}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────
const Lightbox = ({ images, startIdx, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(20,8,14,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      {/* Image */}
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'relative', maxWidth: 900, maxHeight: '90vh', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <img src={newsThumb(images[idx])} alt={`Image ${idx + 1}`}
          style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, display: 'block' }} />

        {/* Counter */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <span key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s', display: 'block' }} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            ‹
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            ›
          </button>
        </>
      )}

      {/* Close */}
      <button onClick={onClose}
        style={{ position: 'fixed', top: 16, right: 16, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
        ✕
      </button>
    </motion.div>
  );
};

// ─── Multi-photo picker (up to 3) ─────────────────────────────────────
const MAX_PHOTOS = 3;

const PhotoPicker = ({ previews, onAdd, onRemove }) => {
  const slots = Array.from({ length: MAX_PHOTOS });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {slots.map((_, i) => {
        const preview = previews[i];
        return preview ? (
          <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: '#f9e4ec' }}>
            <img src={preview} alt={`Photo ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <button type="button" onClick={() => onRemove(i)}
              style={{ position: 'absolute', top: 5, right: 5, width: 26, height: 26, borderRadius: '50%', background: 'rgba(200,30,60,0.85)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              ×
            </button>
            {/* Photo number badge */}
            <span style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100, backdropFilter: 'blur(4px)' }}>
              {i + 1}/{MAX_PHOTOS}
            </span>
          </div>
        ) : (
          <label key={i}
            style={{ aspectRatio: '1', borderRadius: 12, border: '2px dashed rgba(255,192,203,0.55)', background: 'rgba(255,192,203,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: previews.length > i ? 'default' : 'pointer', gap: 6, opacity: previews.length < i ? 0.4 : 1, pointerEvents: previews.length < i ? 'none' : 'auto' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="rgba(180,60,100,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: '0.72rem', color: 'rgba(180,60,100,0.5)', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
              {i === 0 ? 'Add photo' : `Photo ${i + 1}`}
            </span>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) onAdd(f, i); e.target.value = ''; }} />
          </label>
        );
      })}
    </div>
  );
};

// ─── Window width hook ────────────────────────────────────────────────
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

// ─── Toast ────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
    style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 24px', borderRadius: 999, background: type === 'error' ? 'rgba(220,50,80,0.92)' : 'rgba(180,60,100,0.92)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
    {msg}
  </motion.div>
);

// ─── Card ─────────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 4px 24px rgba(255,150,180,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>
    {children}
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'news-spin 0.8s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
);

// ─── Main ─────────────────────────────────────────────────────────────
const News = () => {
  const [news, setNews]                         = useState([]);
  const [minutes, setMinutes]                   = useState([]);
  const [formData, setFormData]                 = useState({ title: '', content: '' });
  const [newsImages, setNewsImages]             = useState([]); // File[]
  const [newsImagePreviews, setNewsImagePreviews] = useState([]); // string[]
  const [minutesForm, setMinutesForm]           = useState({ title: '', file: null });
  const [posting, setPosting]                   = useState(false);
  const [uploadingMinutes, setUploadingMinutes] = useState(false);
  const [expanded, setExpanded]                 = useState({});
  const [toast, setToast]                       = useState(null);
  const [tab, setTab]                           = useState('news');
  const [lightbox, setLightbox]                 = useState(null); // { images, idx }

  const role    = localStorage.getItem('role');
  const width   = useWindowWidth();
  const isMobile = width < 768;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/news`)
      .then(r => setNews(r.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .catch(() => {});
    axios.get(`${import.meta.env.VITE_API_URL}/api/board-minutes`)
      .then(r => setMinutes(r.data.sort((a, b) => new Date(b.date) - new Date(a.date))))
      .catch(() => {});
  }, []);

  // Add a photo at a specific slot index
  const handleAddPhoto = (file, slotIndex) => {
    const url = URL.createObjectURL(file);
    setNewsImages(prev => {
      const next = [...prev];
      next[slotIndex] = file;
      return next;
    });
    setNewsImagePreviews(prev => {
      const next = [...prev];
      next[slotIndex] = url;
      return next;
    });
  };

  // Remove a photo at a specific slot index
  const handleRemovePhoto = (slotIndex) => {
    setNewsImages(prev => prev.filter((_, i) => i !== slotIndex));
    setNewsImagePreviews(prev => prev.filter((_, i) => i !== slotIndex));
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    setPosting(true);
    const token = localStorage.getItem('token');
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      // Append up to 3 images — backend should accept field name "images"
      newsImages.forEach(f => { if (f) data.append('images', f); });
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/news`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(prev => [res.data, ...prev]);
      setFormData({ title: '', content: '' });
      setNewsImages([]);
      setNewsImagePreviews([]);
      showToast('Story published successfully! ');
    } catch {
      showToast('Failed to post news.', 'error');
    }
    setPosting(false);
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/board-minutes`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMinutes(prev => [res.data, ...prev]);
      setMinutesForm({ title: '', file: null });
      showToast('Minutes published! 📄');
    } catch {
      showToast('Failed to upload minutes.', 'error');
    }
    setUploadingMinutes(false);
  };

  const toggleExpand = (id) => setExpanded(s => ({ ...s, [id]: !s[id] }));
  const PREVIEW_LEN = 280;

  // Normalise images field — backend may return `image` (string) or `images` (array)
  const getImages = (item) => {
    if (Array.isArray(item.images) && item.images.length > 0) return item.images;
    if (item.image) return [item.image];
    return [];
  };

  return (
    <>
      <style>{`
        @keyframes news-spin { to { transform: rotate(360deg); } }
        .news-tab { padding: 9px 24px; border-radius: 999px; font-size: 0.88rem; font-weight: 600; cursor: pointer; border: 2px solid rgba(255,192,203,0.45); color: rgba(180,60,100,0.7); background: transparent; transition: all 0.2s; white-space: nowrap; }
        .news-tab.active { background: #E8547A; border-color: #E8547A; color: #fff; }
        .news-tab:hover:not(.active) { border-color: #E8547A; color: #E8547A; }
        .news-input { width: 100%; padding: 13px 16px; border-radius: 14px; border: 2px solid rgba(255,192,203,0.35); background: rgba(255,255,255,0.9); font-size: 0.95rem; color: rgba(40,20,30,0.85); outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; font-family: inherit; }
        .news-input:focus { border-color: #E8547A; box-shadow: 0 0 0 3px rgba(232,84,122,0.15); }
        .news-input::placeholder { color: rgba(180,100,130,0.4); }
      `}</style>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox images={lightbox.images} startIdx={lightbox.idx} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ padding: isMobile ? '36px 14px 60px' : '52px 24px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 40 }}>
            <h1 className="text-primary"
              style={{ fontSize: isMobile ? '2.2rem' : 'clamp(2.6rem,6vw,4rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 10px' }}>
              Our Voice & Stories
            </h1>
            <p className="text-textDark/70"
              style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontWeight: 300 }}>
              Updates, reflections, and official records from the heart of our sisterhood.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: isMobile ? 24 : 36, flexWrap: 'wrap' }}>
            <button className={`news-tab${tab === 'news' ? ' active' : ''}`} onClick={() => setTab('news')}>
              📰 News {news.length > 0 && `(${news.length})`}
            </button>
            <button className={`news-tab${tab === 'minutes' ? ' active' : ''}`} onClick={() => setTab('minutes')}>
              📄 Board Minutes {minutes.length > 0 && `(${minutes.length})`}
            </button>
          </motion.div>

          {/* ── NEWS TAB ── */}
          <AnimatePresence mode="wait">
            {tab === 'news' && (
              <motion.div key="news" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                {news.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: isMobile ? '48px 0' : '80px 0' }}>
                    <p className="text-textDark/60" style={{ fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: 300 }}>
                      No news yet… but our story is always unfolding 
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20, marginBottom: 32 }}>
                    {news.map((item, index) => {
                      const images = getImages(item);
                      const isLong = item.content?.length > PREVIEW_LEN;
                      const isExp  = expanded[item._id];
                      return (
                        <motion.article key={item._id}
                          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.08 }}
                          transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
                          style={{ transform: 'translateZ(0)' }}
                        >
                          <Card>
                            {/* Photo gallery + date, or just date banner */}
                            {images.length > 0 ? (
                              <div style={{ flexShrink: 0 }}>
                                <NewsGallery
                                  images={images}
                                  title={item.title}
                                  onLightbox={(imgs, idx) => setLightbox({ images: imgs, idx })}
                                />
                                <div style={{ background: 'linear-gradient(135deg,rgba(255,192,203,0.25),rgba(255,150,180,0.12))', padding: isMobile ? '10px 18px' : '12px 26px' }}>
                                  <p className="text-primary" style={{ margin: 0, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div style={{ background: 'linear-gradient(135deg,rgba(255,192,203,0.25),rgba(255,150,180,0.12))', padding: isMobile ? '14px 18px' : '18px 26px', flexShrink: 0 }}>
                                <p className="text-primary" style={{ margin: 0, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                  {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            )}

                            {/* Body */}
                            <div style={{ padding: isMobile ? '16px 18px 14px' : '22px 26px 18px', flex: 1 }}>
                              <h2 style={{ margin: '0 0 10px', fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: 'rgba(30,15,25,0.9)', lineHeight: 1.25 }}>
                                {item.title}
                              </h2>
                              <p style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '0.97rem', color: 'rgba(60,30,45,0.75)', lineHeight: 1.78, whiteSpace: 'pre-line' }}>
                                {isLong && !isExp ? item.content.slice(0, PREVIEW_LEN) + '…' : item.content}
                              </p>
                              {isLong && (
                                <button onClick={() => toggleExpand(item._id)} className="text-primary"
                                  style={{ marginTop: 8, background: 'none', border: 'none', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer', padding: 0 }}>
                                  {isExp ? 'Show less ↑' : 'Read more ↓'}
                                </button>
                              )}
                            </div>

                            {/* Footer */}
                            <div style={{ padding: isMobile ? '10px 18px 12px' : '11px 26px 13px', borderTop: '1px solid rgba(255,192,203,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, background: 'rgba(255,192,203,0.04)', flexShrink: 0 }}>
                              <p className="text-primary" style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>
                                By {item.author?.name || 'Admin'}
                              </p>
                              <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(100,50,70,0.5)' }}>
                                {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </Card>
                        </motion.article>
                      );
                    })}
                  </div>
                )}

                {/* Admin: post news */}
                {role === 'admin' && (
                  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <Card style={{ marginTop: 8 }}>
                      <div style={{ padding: isMobile ? '18px 18px 0' : '24px 28px 0', borderBottom: '1px solid rgba(255,192,203,0.2)' }}>
                        <h2 className="text-primary" style={{ margin: '0 0 4px', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 700 }}>Share a New Story</h2>
                        <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'rgba(100,50,70,0.55)' }}>Publish an update for all sisters to see.</p>
                      </div>
                      <form onSubmit={handleNewsSubmit} style={{ padding: isMobile ? '18px 18px 22px' : '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</label>
                          <input className="news-input" type="text" value={formData.title}
                            onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Our 2026 Reunion — A Celebration of Sisterhood" required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
                          <textarea className="news-input" value={formData.content}
                            onChange={e => setFormData(f => ({ ...f, content: e.target.value }))}
                            rows={6} placeholder="Write from the heart…" required
                            style={{ resize: 'vertical', minHeight: 120 }} />
                        </div>

                        {/* Multi-photo picker */}
                        <div>
                          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Photos
                            <span style={{ fontWeight: 400, textTransform: 'none', color: 'rgba(100,50,70,0.4)', marginLeft: 6 }}>
                              (up to {MAX_PHOTOS} — {newsImagePreviews.filter(Boolean).length}/{MAX_PHOTOS} added)
                            </span>
                          </label>
                          <PhotoPicker
                            previews={newsImagePreviews}
                            onAdd={handleAddPhoto}
                            onRemove={handleRemovePhoto}
                          />
                          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'rgba(160,80,100,0.45)' }}>
                            Tap an empty slot to add a photo. Tap × to remove one.
                          </p>
                        </div>

                        <motion.button type="submit" disabled={posting} whileTap={{ scale: 0.97 }}
                          className="bg-primary text-white"
                          style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: posting ? 'not-allowed' : 'pointer', opacity: posting ? 0.75 : 1 }}>
                          {posting && <Spinner />}{posting ? 'Publishing…' : 'Publish to Our Sisters'}
                        </motion.button>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── MINUTES TAB ── */}
            {tab === 'minutes' && (
              <motion.div key="minutes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                {minutes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: isMobile ? '48px 0' : '80px 0' }}>
                    <p className="text-textDark/60" style={{ fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: 300 }}>
                      No minutes yet — they'll appear here after each board meeting.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    {minutes.map((minute, index) => (
                      <motion.div key={minute._id}
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}>
                        <Card>
                          <div style={{ padding: isMobile ? '16px 18px' : '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                              <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.1rem', color: 'rgba(30,15,25,0.9)' }}>
                                {minute.title}
                              </h3>
                              <p className="text-primary" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>
                                {new Date(minute.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                            <a href={minute.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="bg-primary text-white"
                              style={{ padding: isMobile ? '9px 20px' : '10px 24px', borderRadius: 999, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                              Download PDF ↓
                            </a>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {role === 'admin' && (
                  <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <Card>
                      <div style={{ padding: isMobile ? '18px 18px 0' : '24px 28px 0', borderBottom: '1px solid rgba(255,192,203,0.2)' }}>
                        <h2 className="text-primary" style={{ margin: '0 0 4px', fontSize: isMobile ? '1.3rem' : '1.6rem', fontWeight: 700 }}>Upload New Minutes</h2>
                        <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: 'rgba(100,50,70,0.55)' }}>Publish the official PDF for members to download.</p>
                      </div>
                      <form onSubmit={handleMinutesSubmit} style={{ padding: isMobile ? '18px 18px 22px' : '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meeting Title</label>
                          <input className="news-input" type="text" value={minutesForm.title}
                            onChange={e => setMinutesForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Q4 2025 Board Meeting" required />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PDF File</label>
                          <div onClick={() => document.getElementById('minutes-pdf-input').click()}
                            style={{ border: '2px dashed rgba(255,192,203,0.5)', borderRadius: 12, padding: '18px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,192,203,0.04)' }}>
                            {minutesForm.file
                              ? <p style={{ margin: 0, fontWeight: 600, color: 'rgba(180,60,100,0.8)', fontSize: '0.9rem' }}>📄 {minutesForm.file.name}</p>
                              : <p className="text-textDark/50" style={{ margin: 0, fontSize: '0.9rem' }}>Click to choose a PDF</p>
                            }
                          </div>
                          <input id="minutes-pdf-input" type="file" accept=".pdf"
                            onChange={e => { const f = e.target.files[0]; if (f) setMinutesForm(p => ({ ...p, file: f })); }}
                            style={{ display: 'none' }} required />
                        </div>
                        <motion.button type="submit" disabled={uploadingMinutes} whileTap={{ scale: 0.97 }}
                          className="bg-primary text-white"
                          style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: uploadingMinutes ? 'not-allowed' : 'pointer', opacity: uploadingMinutes ? 0.75 : 1 }}>
                          {uploadingMinutes && <Spinner />}{uploadingMinutes ? 'Uploading…' : 'Publish Minutes 📄'}
                        </motion.button>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </>
  );
};

export default News;
