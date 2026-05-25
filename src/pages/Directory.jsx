import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Cloudinary helper ───────────────────────────────────────────────
// Transforms any Cloudinary URL into an optimised, face-aware thumbnail.
// Falls back gracefully for non-Cloudinary URLs or missing pics.
const cloudinaryThumb = (url, size = 200) => {
  if (!url) return null;
  if (!url.includes('res.cloudinary.com')) return url;
  // Insert transformation before /upload/
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${size},h_${size},c_fill,g_face,dpr_auto/`
  );
};

// ─── Skeleton card ───────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
    className="kghs-card skeleton-card"
  >
    <div className="skeleton-avatar" />
    <div className="skeleton-line wide" />
    <div className="skeleton-line medium" />
    <div className="skeleton-line narrow" />
  </motion.div>
);

// ─── Single alumni card ───────────────────────────────────────────────
const AlumniCard = React.memo(({ user, index }) => {
  const [imgError, setImgError] = useState(false);
  const thumb = cloudinaryThumb(user.profilePic, 200);
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: Math.min(index * 0.06, 0.4), duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6 }}
      className="kghs-card alumni-card"
    >
      {/* Avatar */}
      <div className="avatar-wrap">
        {thumb && !imgError ? (
          <img
            src={thumb}
            alt={user.name}
            className="avatar-img"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            width={96}
            height={96}
          />
        ) : (
          <div className="avatar-fallback" aria-hidden="true">
            {initials}
          </div>
        )}
        <div className="avatar-ring" aria-hidden="true" />
      </div>

      {/* Info */}
      <div className="card-body">
        <h3 className="card-name">{user.name}</h3>

        <div className="card-meta">
          <span className="badge badge-year">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1L7.545 4.13 11 4.635 8.5 7.07 9.09 10.51 6 8.885 2.91 10.51 3.5 7.07 1 4.635 4.455 4.13Z" fill="currentColor"/>
            </svg>
            {user.graduationYear ? `Class of ${user.graduationYear}` : 'Alumni'}
          </span>

          {user.location && (
            <span className="badge badge-location">
              <svg width="9" height="11" viewBox="0 0 10 13" fill="none" aria-hidden="true">
                <path d="M5 0C2.794 0 1 1.794 1 4c0 3 4 9 4 9s4-6 4-9c0-2.206-1.794-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
              </svg>
              {user.location}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="card-bio">"{user.bio}"</p>
        )}
      </div>

      {/* Footer strip */}
      <div className="card-footer" aria-hidden="true">
        <span>Forever a KGHS Sister</span>
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.article>
  );
});

// ─── Main page ────────────────────────────────────────────────────────
const Directory = () => {
  const [users, setUsers] = useState([]);
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/directory?year=${year}&location=${location}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => { setUsers(res.data); setLoading(false); })
      .catch((err) => { console.error('Directory fetch error:', err); setLoading(false); });
  }, [year, location, navigate]);

  useEffect(() => {
    const id = setTimeout(fetchUsers, 350); // debounce
    return () => clearTimeout(id);
  }, [fetchUsers]);

  const hasFilters = year.trim() || location.trim();

  return (
    <>
      {/* ── Injected styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --rose:        #E8547A;
          --rose-light:  #F9C6D3;
          --rose-pale:   #FDF1F4;
          --rose-mid:    #F4D0DA;
          --cream:       #FFFAF9;
          --ink:         #2A1A22;
          --ink-mid:     #6B4558;
          --ink-soft:    #A07090;
          --white:       #FFFFFF;
          --card-shadow: 0 2px 16px rgba(232,84,122,0.10), 0 1px 4px rgba(42,26,34,0.06);
          --card-hover:  0 12px 40px rgba(232,84,122,0.18), 0 4px 12px rgba(42,26,34,0.08);
          --radius-card: 20px;
          --radius-badge: 100px;
        }

        /* ── Page shell ── */
        .dir-page {
          min-height: 100vh;
          background: var(--cream);
          padding: 0 0 80px;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
        }

        /* ── Hero band ── */
        .dir-hero {
          position: relative;
          overflow: hidden;
          padding: 64px 24px 56px;
          text-align: center;
          background: linear-gradient(160deg, var(--rose-pale) 0%, var(--white) 60%, var(--rose-pale) 100%);
        }
        .dir-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 55% at 15% 0%, var(--rose-light) 0%, transparent 70%),
            radial-gradient(ellipse 50% 45% at 85% 100%, var(--rose-mid) 0%, transparent 65%);
          pointer-events: none;
        }
        .dir-hero-eyebrow {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--rose);
          background: var(--white);
          border: 1px solid var(--rose-light);
          border-radius: var(--radius-badge);
          padding: 5px 16px;
          margin-bottom: 20px;
        }
        .dir-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 6vw, 4.4rem);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
          margin: 0 auto 20px;
          max-width: 700px;
          letter-spacing: -0.01em;
        }
        .dir-hero h1 em {
          font-style: italic;
          color: var(--rose);
        }
        .dir-hero p {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          font-weight: 300;
          color: var(--ink-mid);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Search bar ── */
        .dir-search-wrap {
          max-width: 680px;
          margin: -28px auto 40px;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }
        .dir-search-box {
          background: var(--white);
          border: 1.5px solid var(--rose-light);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(232,84,122,0.12);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dir-search-box.active {
          border-color: var(--rose);
          box-shadow: 0 8px 40px rgba(232,84,122,0.2);
        }
        @media (min-width: 560px) {
          .dir-search-box { flex-direction: row; gap: 0; }
        }
        .dir-input-wrap {
          position: relative;
          flex: 1;
        }
        .dir-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--rose);
          pointer-events: none;
          font-size: 15px;
        }
        .dir-input {
          width: 100%;
          padding: 13px 14px 13px 40px;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--ink);
          outline: none;
          box-sizing: border-box;
        }
        .dir-input::placeholder { color: var(--ink-soft); }
        .dir-divider {
          display: none;
          width: 1px;
          background: var(--rose-light);
          margin: 10px 0;
          align-self: stretch;
        }
        @media (min-width: 560px) { .dir-divider { display: block; } }
        .dir-search-btn {
          background: var(--rose);
          color: var(--white);
          border: none;
          border-radius: 10px;
          padding: 11px 22px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
        }
        .dir-search-btn:hover { background: #d43f6a; transform: translateY(-1px); }
        .dir-search-btn:active { transform: translateY(0); }

        /* ── Count pill ── */
        .dir-count {
          text-align: center;
          margin-bottom: 32px;
          font-size: 0.82rem;
          color: var(--ink-soft);
          letter-spacing: 0.04em;
        }
        .dir-count strong { color: var(--rose); font-weight: 600; }

        /* ── Grid ── */
        .dir-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (min-width: 640px)  { .dir-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
        @media (min-width: 900px)  { .dir-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px) { .dir-grid { grid-template-columns: repeat(4, 1fr); } }

        /* ── Card ── */
        .kghs-card {
          border-radius: var(--radius-card);
          background: var(--white);
          box-shadow: var(--card-shadow);
          overflow: hidden;
          transition: box-shadow 0.3s, transform 0.3s;
          will-change: transform;
          display: flex;
          flex-direction: column;
        }
        .alumni-card:hover { box-shadow: var(--card-hover); }

        /* ── Avatar ── */
        .avatar-wrap {
          position: relative;
          width: 88px;
          height: 88px;
          margin: 28px auto 0;
          flex-shrink: 0;
        }
        .avatar-img {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          background: var(--rose-pale);
        }
        .avatar-fallback {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--rose-light), var(--rose));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--white);
          letter-spacing: 0.04em;
        }
        .avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--rose-light);
          pointer-events: none;
        }
        .alumni-card:hover .avatar-ring { border-color: var(--rose); }

        /* ── Card body ── */
        .card-body {
          padding: 16px 20px 12px;
          text-align: center;
          flex: 1;
        }
        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--ink);
          margin: 0 0 10px;
          line-height: 1.3;
        }
        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-bottom: 12px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: var(--radius-badge);
          font-size: 0.72rem;
          font-weight: 500;
          padding: 4px 10px;
          letter-spacing: 0.02em;
        }
        .badge-year {
          background: var(--rose-pale);
          color: var(--rose);
          border: 1px solid var(--rose-light);
        }
        .badge-location {
          background: #FFF5F0;
          color: var(--ink-mid);
          border: 1px solid #F2CABB;
        }
        .card-bio {
          font-size: 0.8rem;
          color: var(--ink-soft);
          font-style: italic;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        /* ── Card footer ── */
        .card-footer {
          margin-top: auto;
          padding: 10px 20px;
          background: linear-gradient(90deg, var(--rose-pale) 0%, var(--rose-mid) 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--rose);
          letter-spacing: 0.04em;
        }

        /* ── Skeleton ── */
        .skeleton-card { padding: 28px 20px 20px; align-items: center; gap: 12px; }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton-avatar {
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(90deg, var(--rose-pale) 25%, var(--rose-mid) 50%, var(--rose-pale) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          flex-shrink: 0;
        }
        .skeleton-line {
          height: 12px; border-radius: 6px;
          background: linear-gradient(90deg, var(--rose-pale) 25%, var(--rose-mid) 50%, var(--rose-pale) 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
        }
        .skeleton-line.wide   { width: 70%; }
        .skeleton-line.medium { width: 50%; animation-delay: 0.1s; }
        .skeleton-line.narrow { width: 35%; animation-delay: 0.2s; }

        /* ── Empty state ── */
        .dir-empty {
          text-align: center;
          padding: 80px 24px;
          max-width: 400px;
          margin: 0 auto;
        }
        .dir-empty-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          display: block;
        }
        .dir-empty h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: var(--ink);
          margin: 0 0 10px;
        }
        .dir-empty p {
          font-size: 0.9rem;
          color: var(--ink-soft);
          line-height: 1.7;
          margin: 0;
        }
      `}</style>

      <div className="dir-page">
        {/* ── Hero ── */}
        <motion.section
          className="dir-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="dir-hero-eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Kalabari Girls' High School
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            Our <em>Eternal</em> Sisterhood
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Reconnect with remarkable women across generations, continents, and triumphs.
          </motion.p>
        </motion.section>

        {/* ── Search ── */}
        <motion.div
          className="dir-search-wrap"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <div className={`dir-search-box${activeFilter ? ' active' : ''}`}>
            <div className="dir-input-wrap">
              <span className="dir-input-icon"></span>
              <input
                className="dir-input"
                type="text"
                placeholder="Graduation year, e.g. 2006"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onFocus={() => setActiveFilter(true)}
                onBlur={() => setActiveFilter(false)}
                aria-label="Filter by graduation year"
              />
            </div>
            <div className="dir-divider" />
            <div className="dir-input-wrap">
              <span className="dir-input-icon">📍</span>
              <input
                className="dir-input"
                type="text"
                placeholder="Location, e.g. Lagos"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setActiveFilter(true)}
                onBlur={() => setActiveFilter(false)}
                aria-label="Filter by location"
              />
            </div>
            {hasFilters && (
              <button
                className="dir-search-btn"
                onClick={() => { setYear(''); setLocation(''); }}
                type="button"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* ── Count ── */}
        {!loading && users.length > 0 && (
          <motion.p
            className="dir-count"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Showing <strong>{users.length}</strong> {users.length === 1 ? 'sister' : 'sisters'}
            {hasFilters ? ' matching your search' : ''}
          </motion.p>
        )}

        {/* ── Loading skeletons ── */}
        {loading && (
          <div className="dir-grid" aria-busy="true" aria-label="Loading alumni">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        <AnimatePresence>
          {!loading && users.length === 0 && (
            <motion.div
              className="dir-empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="dir-empty-icon"></span>
              <h2>No sisters found</h2>
              <p>
                {hasFilters
                  ? 'Try broadening your search — your sisters are out there.'
                  : 'The directory is currently empty. Check back soon.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Alumni grid ── */}
        {!loading && users.length > 0 && (
          <section className="dir-grid" aria-label="Alumni directory">
            {users.map((user, index) => (
              <AlumniCard key={user._id} user={user} index={index} />
            ))}
          </section>
        )}
      </div>
    </>
  );
};

export default Directory;
