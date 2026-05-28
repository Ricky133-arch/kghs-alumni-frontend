import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
      <img
        src={newsPlaceholder(src)} alt="" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px)', transform: 'scale(1.06)', opacity: loaded ? 0 : 1, transition: 'opacity 0.4s' }}
      />
      <img
        src={newsThumb(src)} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s', display: 'block' }}
      />
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
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(10,4,8,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        style={{ position: 'relative', maxWidth: 960, maxHeight: '90vh', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={newsThumb(images[idx])} alt={`Image ${idx + 1}`}
          style={{ width: '100%', maxHeight: '82vh', objectFit: 'contain', borderRadius: 14, display: 'block' }}
        />
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <span key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 22 : 7, height: 7, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.2s', display: 'block' }} />
            ))}
          </div>
        )}
      </motion.div>

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>›</button>
        </>
      )}

      <button onClick={onClose}
        style={{ position: 'fixed', top: 16, right: 16, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>✕</button>
    </motion.div>
  );
};

// ─── Hero + Thumbnails Gallery ────────────────────────────────────────
const NewsGallery = ({ images, title, onLightbox }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Hero */}
      <motion.div
        key={activeIdx}
        initial={{ opacity: 0.6, scale: 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => onLightbox(images, activeIdx)}
        style={{
          width: '100%',
          height: 'clamp(260px, 50vw, 500px)',
          borderRadius: 20,
          overflow: 'hidden',
          cursor: 'zoom-in',
          position: 'relative',
          marginBottom: images.length > 1 ? 10 : 0,
          boxShadow: '0 8px 40px rgba(232,84,122,0.13)',
        }}
      >
        <ProgressiveImg src={images[activeIdx]} alt={`${title} — photo ${activeIdx + 1}`} />

        {/* Photo counter badge */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            background: 'rgba(10,4,8,0.55)', backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: '0.78rem', fontWeight: 700,
            padding: '4px 12px', borderRadius: 999,
            letterSpacing: '0.04em',
          }}>
            {activeIdx + 1} / {images.length}
          </div>
        )}

        {/* Expand hint */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14,
          background: 'rgba(10,4,8,0.45)', backdropFilter: 'blur(6px)',
          color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', fontWeight: 600,
          padding: '4px 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
            <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
          </svg>
          View full
        </div>
      </motion.div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          {images.map((img, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveIdx(i)}
              style={{
                flexShrink: 0,
                width: 'clamp(72px, 18vw, 100px)',
                height: 'clamp(72px, 18vw, 100px)',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                border: i === activeIdx
                  ? '3px solid #E8547A'
                  : '3px solid transparent',
                opacity: i === activeIdx ? 1 : 0.62,
                transition: 'opacity 0.2s, border-color 0.2s',
                boxShadow: i === activeIdx ? '0 2px 12px rgba(232,84,122,0.25)' : 'none',
              }}
            >
              <ProgressiveImg src={img} alt={`${title} thumbnail ${i + 1}`} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Content renderer ─────────────────────────────────────────────────
const renderContent = (content) => {
  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith('\u201c') && trimmed.endsWith('\u201d'))
    ) {
      return (
        <blockquote key={index} className="border-l-8 border-black pl-6 my-6 text-textDark font-bold text-xl italic">
          {trimmed}
        </blockquote>
      );
    }
    if (
      trimmed.length > 0 &&
      trimmed.length < 60 &&
      !trimmed.endsWith('.') &&
      !trimmed.endsWith(',') &&
      !trimmed.endsWith('!') &&
      !trimmed.endsWith('?')
    ) {
      return (
        <h2 key={index} className="text-2xl md:text-3xl font-extrabold text-textDark mt-10 mb-4">
          {trimmed}
        </h2>
      );
    }
    if (trimmed === '') {
      return <br key={index} />;
    }
    return (
      <p key={index} className="text-textDark/80 leading-relaxed text-lg mb-2">
        {line}
      </p>
    );
  });
};

// ─── Normalise images field ───────────────────────────────────────────
const getImages = (item) => {
  if (Array.isArray(item.images) && item.images.length > 0) return item.images;
  if (item.image) return [item.image];
  return [];
};

// ─── Main ─────────────────────────────────────────────────────────────
const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/news/${id}`);
        setNews(res.data);
      } catch (err) {
        setError('News article not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-primary">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const images = getImages(news);

  return (
    <>
      <AnimatePresence>
        {lightbox && (
          <Lightbox images={lightbox.images} startIdx={lightbox.idx} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6 py-16"
      >
        <Link to="/" className="text-primary hover:text-pink-600 font-semibold mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-textDark mb-4 mt-4">
          {news.title}
        </h1>
        <p className="text-sm text-primary mb-8">
          By {news.author?.name || 'Admin'} • {new Date(news.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {images.length > 0 && (
          <NewsGallery
            images={images}
            title={news.title}
            onLightbox={(imgs, idx) => setLightbox({ images: imgs, idx })}
          />
        )}

        <div>
          {renderContent(news.content)}
        </div>
      </motion.div>
    </>
  );
};

export default NewsDetail;
