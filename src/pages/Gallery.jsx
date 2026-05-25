import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ─── Cloudinary URL helpers ───────────────────────────────────────────────────
// Inserts Cloudinary transformation params into an existing upload URL.
// e.g. .../image/upload/v123/kghs/photo.jpg
//  →   .../image/upload/w_400,q_auto,f_auto/v123/kghs/photo.jpg
const cloudinaryTransform = (url, params) => {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${params}/`);
};

// Thumbnail: small, auto quality, WebP/AVIF auto format
const thumbUrl = (url) => cloudinaryTransform(url, 'w_600,q_auto:low,f_auto');

// Full lightbox: larger but still optimised
const fullUrl = (url) => cloudinaryTransform(url, 'w_1200,q_auto,f_auto');

// Tiny blurred placeholder (10px wide, very fast)
const placeholderUrl = (url) => cloudinaryTransform(url, 'w_20,q_10,e_blur:800,f_auto');

// ─── Hook: window width ───────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    let raf;
    const handler = () => { clearTimeout(raf); raf = setTimeout(() => setWidth(window.innerWidth), 100); };
    window.addEventListener('resize', handler);
    return () => { window.removeEventListener('resize', handler); clearTimeout(raf); };
  }, []);
  return width;
};

// ─── Progressive image: blurred placeholder → full ───────────────────────────
const ProgressiveImg = ({ src, alt, style, className }) => {
  const [loaded, setLoaded] = useState(false);
  const thumb = thumbUrl(src);
  const placeholder = placeholderUrl(src);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* Blurred tiny placeholder — loads almost instantly */}
      <img
        src={placeholder}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', filter: 'blur(12px)', transform: 'scale(1.05)',
          transition: 'opacity 0.4s',
          opacity: loaded ? 0 : 1,
        }}
      />
      {/* Full thumbnail */}
      <img
        src={thumb}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={className}
        style={{
          display: 'block', width: '100%', objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      />
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ image, onClose, onPrev, onNext, total, current }) => {
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  if (!image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,240,245,0.94)', backdropFilter: 'blur(18px)',
          padding: 16,
        }}
        onClick={onClose}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? onNext() : onPrev();
          setTouchStart(null);
        }}
      >
        <button onClick={onClose} aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(255,192,203,0.4)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.4rem', cursor: 'pointer', color: 'rgba(160,40,80,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ×
        </button>
        <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '0.8rem', letterSpacing: '0.08em', color: 'rgba(180,60,100,0.7)', fontWeight: 600 }}>
          {current + 1} / {total}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous"
          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '2.2rem', background: 'rgba(255,192,203,0.35)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: 'rgba(180,60,100,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ‹
        </button>

        <motion.div
          key={image._id}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
          style={{ width: '100%', maxWidth: 720, position: 'relative' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lightbox shows full-res optimised image */}
          <img
            src={fullUrl(image.url)}
            alt={image.caption || 'KGHS Memory'}
            style={{ width: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: 20, boxShadow: '0 20px 60px rgba(255,130,170,0.2)', display: 'block' }}
          />
          {(image.caption || image.uploader?.name) && (
            <div style={{ marginTop: 14, textAlign: 'center', padding: '0 8px' }}>
              {image.caption && (
                <p style={{ margin: '0 0 4px', fontSize: 'clamp(0.95rem,2.5vw,1.15rem)', fontStyle: 'italic', color: 'rgba(100,30,60,0.85)' }}>
                  "{image.caption}"
                </p>
              )}
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(160,60,90,0.6)', letterSpacing: '0.05em' }}>
                {image.uploader?.name || 'A Sister'} · {new Date(image.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </motion.div>

        <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next"
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '2.2rem', background: 'rgba(255,192,203,0.35)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: 'rgba(180,60,100,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ›
        </button>
        <p style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: 'rgba(180,60,100,0.4)', letterSpacing: '0.06em' }}>
          swipe or tap arrows to navigate
        </p>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Upload Modal ─────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ caption: '', image: null });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFormData(f => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') handleFile(e.target.files[0]);
    else setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return;
    setUploading(true);
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('caption', formData.caption);
    data.append('image', formData.image);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/gallery`,
        data,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      onSuccess();
    } catch {
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(255,220,235,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{ width: '100%', maxWidth: 560, background: '#fff', borderRadius: '28px 28px 0 0', border: '1px solid rgba(255,192,203,0.4)', boxShadow: '0 -20px 60px rgba(255,150,180,0.18)', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,192,203,0.6)' }} />
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,192,203,0.25)' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(200,80,120,0.6)', fontWeight: 600 }}>Add to gallery</p>
            <h2 className="text-primary" style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 700 }}>Share a Memory </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,192,203,0.3)', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: '1.3rem', cursor: 'pointer', color: 'rgba(160,40,80,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById('gal-file').click()}
            style={{ border: `2px dashed ${dragOver ? 'rgba(255,100,150,0.7)' : 'rgba(255,192,203,0.5)'}`, borderRadius: 18, cursor: 'pointer', transition: 'all 0.2s', background: dragOver ? 'rgba(255,192,203,0.08)' : 'rgba(255,192,203,0.04)', textAlign: 'center', padding: preview ? 8 : '32px 16px' }}
          >
            {preview
              ? <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
              : <>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}></div>
                  <p className="text-textDark/60" style={{ margin: 0, fontSize: '0.95rem' }}>Tap to choose a photo</p>
                  <p style={{ color: 'rgba(0,0,0,0.3)', margin: '4px 0 0', fontSize: '0.75rem' }}>JPG, PNG, WEBP</p>
                </>
            }
          </div>
          <input id="gal-file" type="file" name="image" accept="image/*" onChange={handleChange} style={{ display: 'none' }} required />
          <div>
            <label className="block text-textDark font-semibold mb-2" style={{ fontSize: '0.9rem' }}>
              Caption <span className="text-textDark/40 font-normal">(optional)</span>
            </label>
            <input type="text" name="caption" value={formData.caption} onChange={handleChange}
              placeholder="e.g. Reunion 2025 — Sisters Forever"
              className="w-full px-4 py-3 rounded-2xl border-2 border-primary/30 focus:border-primary focus:outline-none transition"
              style={{ fontSize: '1rem' }} />
          </div>
          <motion.button type="submit" disabled={uploading || !formData.image} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-full text-white font-bold shadow-lg transition-all duration-300 disabled:opacity-60"
            style={{ background: formData.image ? 'var(--color-primary,#ff69b4)' : 'rgba(255,192,203,0.4)', cursor: formData.image ? 'pointer' : 'not-allowed', border: 'none', fontSize: '1.1rem' }}>
            {uploading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'kghs-spin 0.8s linear infinite' }} />
                  Uploading…
                </span>
              : 'Share This Memory '}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Gallery Card ─────────────────────────────────────────────────────────────
const GalleryCard = ({ img, onSelect, isMobile }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.05 }}
    transition={{ duration: 0.4, delay: Math.min(img.origIndex * 0.025, 0.25) }}
    whileHover={!isMobile ? { y: -6, boxShadow: '0 20px 40px rgba(255,150,180,0.25)' } : {}}
    onClick={() => onSelect(img.origIndex)}
    className="bg-white/90 border border-primary/20"
    style={{ position: 'relative', cursor: 'pointer', borderRadius: 20, overflow: 'hidden',
      // GPU-composite only — no backdrop-blur on cards (that's a big scroll perf killer)
      transform: 'translateZ(0)',
    }}
  >
    <ProgressiveImg
      src={img.url}
      alt={img.caption || 'KGHS Memory'}
    />

    {isMobile ? (
      <div style={{ padding: '10px 14px 12px' }}>
        {img.caption && (
          <p style={{ margin: '0 0 2px', fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(100,30,60,0.8)', lineHeight: 1.4 }}>
            "{img.caption}"
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(160,60,90,0.55)', letterSpacing: '0.04em' }}>
          {img.uploader?.name || 'A Sister'} · {new Date(img.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </p>
      </div>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,80,140,0.75) 0%, rgba(255,150,180,0.1) 55%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 16 }}
      >
        {img.caption && (
          <p style={{ color: '#fff', margin: '0 0 3px', fontSize: '0.95rem', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            "{img.caption}"
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.88)', margin: 0, fontSize: '0.68rem', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
          {img.uploader?.name || 'A Sister'} · {new Date(img.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </p>
      </motion.div>
    )}
  </motion.div>
);

// ─── Responsive Masonry ───────────────────────────────────────────────────────
const ResponsiveMasonry = ({ images, onSelect }) => {
  const width = useWindowWidth();
  const colCount = width < 480 ? 1 : width < 768 ? 2 : 3;
  const isMobile = width < 768;

  const cols = Array.from({ length: colCount }, () => []);
  images.forEach((img, i) => cols[i % colCount].push({ ...img, origIndex: i }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: isMobile ? 12 : 16 }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
          {col.map((img) => (
            <GalleryCard key={img._id} img={img} onSelect={onSelect} isMobile={isMobile} />
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Main Gallery ─────────────────────────────────────────────────────────────
const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState('all');
  const width = useWindowWidth();
  const isMobile = width < 768;

  const fetchImages = useCallback(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/gallery`)
      .then((res) => {
        setImages(res.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const years = [...new Set(images.map(img => new Date(img.date).getFullYear()))].sort((a, b) => b - a);
  const filtered = filter === 'all' ? images : images.filter(img => new Date(img.date).getFullYear() === Number(filter));
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <>
      <style>{`
        @keyframes kghs-spin { to { transform: rotate(360deg); } }
        @keyframes kghs-shimmer { from { background-position: -500px 0; } to { background-position: 500px 0; } }
        .kghs-year-pill {
          padding: 6px 18px; border-radius: 999px; cursor: pointer;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
          transition: all 0.2s; border: 2px solid rgba(255,192,203,0.55);
          color: rgba(180,60,100,0.75); background: transparent; white-space: nowrap;
        }
        .kghs-year-pill:hover { border-color: var(--color-primary,#ff69b4); color: var(--color-primary,#ff69b4); }
        .kghs-year-pill.active { background: var(--color-primary,#ff69b4); border-color: var(--color-primary,#ff69b4); color: #fff; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ padding: isMobile ? '40px 16px 60px' : '48px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}
          >
            <h1 className="text-primary"
              style={{ fontSize: isMobile ? '2.4rem' : 'clamp(3rem,7vw,5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 14px' }}>
              Our Cherished Memories 
            </h1>
            <p className="text-textDark/70"
              style={{ fontSize: isMobile ? '1rem' : '1.2rem', maxWidth: 600, margin: '0 auto 16px', lineHeight: 1.7, fontWeight: 300 }}>
              A gallery of joy, laughter, and unbreakable bonds — moments captured forever in the heart of KGHS sisterhood.
            </p>
            {!loading && images.length > 0 && (
              <p className="text-primary/60" style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.06em', margin: 0 }}>
                {images.length} {images.length === 1 ? 'memory' : 'memories'} shared
              </p>
            )}
          </motion.div>

          {/* Year filter */}
          {!loading && years.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: isMobile ? 24 : 36 }}
            >
              <button className={`kghs-year-pill${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>All</button>
              {years.map(y => (
                <button key={y} className={`kghs-year-pill${filter === y ? ' active' : ''}`} onClick={() => setFilter(y)}>{y}</button>
              ))}
            </motion.div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? (width < 480 ? 1 : 2) : 3}, 1fr)`, gap: isMobile ? 12 : 16, marginBottom: 40 }}>
              {Array.from({ length: isMobile ? 4 : 9 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 20, height: i % 3 === 0 ? 200 : i % 3 === 1 ? 160 : 240, background: 'linear-gradient(90deg,rgba(255,192,203,0.15) 25%,rgba(255,192,203,0.35) 50%,rgba(255,192,203,0.15) 75%)', backgroundSize: '500px 100%', animation: 'kghs-shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: isMobile ? '48px 0' : '80px 0' }}>
              <p className="text-textDark/60" style={{ fontSize: isMobile ? '1.4rem' : '2rem', fontWeight: 300 }}>
                {filter === 'all' ? 'The gallery is waiting for its first memory ' : `No memories from ${filter} yet.`}
              </p>
              {isLoggedIn && filter === 'all' && (
                <p className="text-textDark/50" style={{ marginTop: 12, fontSize: isMobile ? '1rem' : '1.2rem' }}>
                  Be the first to share a moment from our sisterhood.
                </p>
              )}
            </div>
          )}

          {/* Masonry */}
          {!loading && filtered.length > 0 && (
            <div style={{ marginBottom: isMobile ? 36 : 56 }}>
              <ResponsiveMasonry images={filtered} onSelect={(i) => setLightboxIndex(i)} />
            </div>
          )}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.55 }}
            className="bg-white/90 border border-primary/20"
            style={{ borderRadius: 28, boxShadow: '0 8px 40px rgba(255,150,180,0.12)', padding: isMobile ? '32px 20px' : '56px 48px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}
          >
            <h2 className="text-primary" style={{ fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: 700, margin: '0 0 10px' }}>
              Share a Memory 
            </h2>
            <p className="text-textDark/60" style={{ fontSize: isMobile ? '1rem' : '1.1rem', margin: '0 0 28px', lineHeight: 1.6 }}>
              {isLoggedIn ? 'Add your photo to our cherished collection.' : 'Log in to add your own memories to the gallery.'}
            </p>
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setShowUpload(true)}
                className="bg-primary text-white rounded-full font-bold shadow-xl hover:bg-pink-600 transition-all duration-300"
                style={{ padding: isMobile ? '14px 36px' : '16px 52px', fontSize: isMobile ? '1.1rem' : '1.3rem', border: 'none', cursor: 'pointer' }}>
                Upload a Photo 
              </motion.button>
            ) : (
              <a href="/login" className="inline-block bg-primary text-white rounded-full font-bold shadow-xl hover:bg-pink-600 transition-all duration-300"
                style={{ padding: isMobile ? '14px 36px' : '16px 52px', fontSize: isMobile ? '1.1rem' : '1.3rem', textDecoration: 'none' }}>
                Log In to Share 
              </a>
            )}
          </motion.div>

        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          image={filtered[lightboxIndex]}
          current={lightboxIndex}
          total={filtered.length}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % filtered.length)}
        />
      )}

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => { setShowUpload(false); fetchImages(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Gallery;
