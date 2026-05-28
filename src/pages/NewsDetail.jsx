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
      <img src={newsPlaceholder(src)} alt="" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px)', transform: 'scale(1.06)', opacity: loaded ? 0 : 1, transition: 'opacity 0.4s' }} />
      <img src={newsThumb(src)} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s', display: 'block' }} />
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
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'relative', maxWidth: 900, maxHeight: '90vh', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <img src={newsThumb(images[idx])} alt={`Image ${idx + 1}`}
          style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 12, display: 'block' }} />

        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <span key={i} onClick={() => setIdx(i)}
                style={{ width: i === idx ? 20 : 7, height: 7, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s', display: 'block' }} />
            ))}
          </div>
        )}
      </motion.div>

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

      <button onClick={onClose}
        style={{ position: 'fixed', top: 16, right: 16, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
        ✕
      </button>
    </motion.div>
  );
};

// ─── Gallery (1, 2, or 3 photos) ─────────────────────────────────────
const NewsGallery = ({ images, title, onLightbox }) => {
  if (!images || images.length === 0) return null;
  const count = images.length;

  if (count === 1) return (
    <div style={{ width: '100%', height: 420, cursor: 'pointer', overflow: 'hidden', borderRadius: 20, marginBottom: 36, flexShrink: 0 }}
      onClick={() => onLightbox(images, 0)}>
      <ProgressiveImg src={images[0]} alt={title} />
    </div>
  );

  if (count === 2) return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: 360, cursor: 'pointer', overflow: 'hidden', borderRadius: 20, marginBottom: 36, flexShrink: 0 }}>
      {images.map((img, i) => (
        <div key={i} style={{ overflow: 'hidden', height: '100%' }} onClick={() => onLightbox(images, i)}>
          <ProgressiveImg src={img} alt={`${title} ${i + 1}`} />
        </div>
      ))}
    </div>
  );

  // 3 images: big left, two stacked right
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: 400, cursor: 'pointer', overflow: 'hidden', borderRadius: 20, marginBottom: 36, flexShrink: 0 }}>
      <div style={{ overflow: 'hidden', height: '100%' }} onClick={() => onLightbox(images, 0)}>
        <ProgressiveImg src={images[0]} alt={`${title} 1`} />
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4, height: '100%' }}>
        {images.slice(1).map((img, i) => (
          <div key={i} style={{ overflow: 'hidden' }} onClick={() => onLightbox(images, i + 1)}>
            <ProgressiveImg src={img} alt={`${title} ${i + 2}`} />
          </div>
        ))}
      </div>
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
  const [lightbox, setLightbox] = useState(null); // { images, idx }

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
      {/* Lightbox */}
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

        {/* Title & meta above images */}
        <h1 className="text-4xl md:text-5xl font-bold text-textDark mb-4 mt-4">
          {news.title}
        </h1>
        <p className="text-sm text-primary mb-8">
          By {news.author?.name || 'Admin'} • {new Date(news.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Multi-image gallery */}
        {images.length > 0 && (
          <NewsGallery
            images={images}
            title={news.title}
            onLightbox={(imgs, idx) => setLightbox({ images: imgs, idx })}
          />
        )}

        {/* Article body */}
        <div>
          {renderContent(news.content)}
        </div>
      </motion.div>
    </>
  );
};

export default NewsDetail;
