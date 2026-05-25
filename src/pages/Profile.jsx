import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Cloudinary helper (mirrors Directory.jsx) ────────────────────────
const cloudinaryThumb = (url, size = 300) => {
  if (!url) return null;
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${size},h_${size},c_fill,g_face,dpr_auto/`
  );
};

// ─── Initials avatar ──────────────────────────────────────────────────
const Initials = ({ name, size = 112 }) => {
  const letters = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      className="prof-initials"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {letters}
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onDismiss }) => (
  <motion.div
    className={`prof-toast prof-toast-${type}`}
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 12, scale: 0.96 }}
    role="alert"
  >
    <span className="prof-toast-icon">{type === 'success' ? '✓' : '!'}</span>
    {message}
    <button className="prof-toast-close" onClick={onDismiss} aria-label="Dismiss">×</button>
  </motion.div>
);

// ─── Field component ──────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div className="prof-field">
    <div className="prof-field-header">
      <label className="prof-label">{label}</label>
      {hint && <span className="prof-hint">{hint}</span>}
    </div>
    {children}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────
const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', graduationYear: '', bio: '', location: '', profilePic: null });
  const [previewPic, setPreviewPic] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const [isDirty, setIsDirty] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data);
        setFormData({ name: res.data.name || '', graduationYear: res.data.graduationYear || '', bio: res.data.bio || '', location: res.data.location || '', profilePic: null });
        setPreviewPic(cloudinaryThumb(res.data.profilePic, 300));
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'profilePic') {
      const file = e.target.files[0];
      if (!file) return;
      setFormData((f) => ({ ...f, profilePic: file }));
      setPreviewPic(URL.createObjectURL(file));
      setImgError(false);
    } else {
      setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    }
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.keys(formData).forEach((key) => { if (formData[key] !== null) data.append(key, formData[key]); });
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data);
      setPreviewPic(cloudinaryThumb(res.data.profilePic, 300));
      setIsDirty(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      console.error('Profile update error:', err);
      setToast({ message: 'Update failed — please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (!user) return (
    <div className="prof-page">
      <style>{styles}</style>
      <div className="prof-loading" aria-label="Loading profile">
        {[120, 80, 55, 40].map((w, i) => (
          <div key={i} className="prof-skel" style={{ width: w, height: i === 0 ? 120 : 16, borderRadius: i === 0 ? '50%' : 8, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );

  const thumbSrc = previewPic && !imgError ? previewPic : null;

  return (
    <>
      <style>{styles}</style>
      <div className="prof-page">

        {/* ── Toast ── */}
        <div className="prof-toast-tray" aria-live="polite">
          <AnimatePresence>
            {toast && (
              <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
            )}
          </AnimatePresence>
        </div>

        {/* ── Page header ── */}
        <motion.header
          className="prof-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="prof-hero-bg" aria-hidden="true" />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="prof-eyebrow">Your Profile</span>
            <h1 className="prof-title">
              Welcome back,<br />
              <em>{user.name.split(' ')[0]}</em>
            </h1>
            {user.graduationYear && (
              <p className="prof-subtitle">Class of {user.graduationYear}</p>
            )}
          </motion.div>
        </motion.header>

        {/* ── Main layout ── */}
        <div className="prof-body">
          <div className="prof-layout">

            {/* ── Left: avatar card ── */}
            <motion.aside
              className="prof-sidebar"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="prof-avatar-card">
                {/* Avatar */}
                <div
                  className="prof-avatar-wrap"
                  role="button"
                  tabIndex={0}
                  aria-label="Change profile photo"
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                >
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt={user.name}
                      className="prof-avatar-img"
                      onError={() => setImgError(true)}
                      width={112}
                      height={112}
                    />
                  ) : (
                    <Initials name={formData.name || user.name} size={112} />
                  )}
                  <div className="prof-avatar-overlay" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    name="profilePic"
                    accept="image/*"
                    className="prof-file-input"
                    onChange={handleChange}
                    aria-label="Upload profile photo"
                  />
                </div>

                <div className="prof-avatar-info">
                  <h2 className="prof-card-name">{formData.name || user.name}</h2>
                  {formData.graduationYear && (
                    <span className="prof-card-badge">Class of {formData.graduationYear}</span>
                  )}
                  {formData.location && (
                    <p className="prof-card-loc">
                      <svg width="10" height="12" viewBox="0 0 10 13" fill="none" aria-hidden="true">
                        <path d="M5 0C2.794 0 1 1.794 1 4c0 3 4 9 4 9s4-6 4-9c0-2.206-1.794-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
                      </svg>
                      {formData.location}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="prof-photo-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Change Photo
                </button>

                <p className="prof-photo-hint">Tap photo or button to upload. JPEG, PNG, WebP — max 5 MB.</p>
              </div>

              {/* Decorative sisterhood card */}
              <div className="prof-sisterhood-card" aria-hidden="true">
                <span className="prof-sisterhood-label">Forever a KGHS Sister</span>
                <div className="prof-sisterhood-dots">
                  {['#E8547A','#F9C6D3','#E8547A'].map((c, i) => (
                    <span key={i} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </motion.aside>

            {/* ── Right: form ── */}
            <motion.div
              className="prof-form-card"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="prof-form-header">
                <h3 className="prof-form-title">Edit Profile</h3>
                {isDirty && <span className="prof-unsaved-dot" aria-label="Unsaved changes" title="Unsaved changes" />}
              </div>

              <form onSubmit={handleSubmit} className="prof-form" noValidate>
                <div className="prof-form-row">
                  <Field label="Full Name">
                    <input
                      className="prof-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                    />
                  </Field>

                  <Field label="Graduation Year">
                    <input
                      className="prof-input"
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="e.g. 2006"
                      min="1950"
                      max="2030"
                      required
                    />
                  </Field>
                </div>

                <Field label="Location" hint="City, Country">
                  <input
                    className="prof-input"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Lagos, Nigeria"
                    autoComplete="address-level2"
                  />
                </Field>

                <Field label="Bio" hint={`${formData.bio.length}/400`}>
                  <textarea
                    className="prof-input prof-textarea"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    maxLength={400}
                    placeholder="Share your journey, achievements, or a message to your sisters…"
                  />
                </Field>

                <motion.button
                  className="prof-save-btn"
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.015 }}
                  whileTap={{ scale: saving ? 1 : 0.975 }}
                >
                  {saving ? (
                    <>
                      <span className="prof-spinner" aria-hidden="true" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        <polyline points="17 21 17 13 7 13 7 21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        <polyline points="7 3 7 8 15 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      </svg>
                      Save Profile
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --rose:       #E8547A;
    --rose-light: #F9C6D3;
    --rose-pale:  #FDF1F4;
    --rose-mid:   #F4D0DA;
    --cream:      #FFFAF9;
    --ink:        #2A1A22;
    --ink-mid:    #6B4558;
    --ink-soft:   #A07090;
    --white:      #FFFFFF;
    --success:    #1C7C54;
    --success-bg: #EDFAF3;
    --error:      #B91C1C;
    --error-bg:   #FEF2F2;
    --radius:     18px;
    --shadow:     0 2px 20px rgba(232,84,122,0.10), 0 1px 4px rgba(42,26,34,0.06);
    --shadow-lg:  0 12px 48px rgba(232,84,122,0.16), 0 4px 16px rgba(42,26,34,0.07);
  }

  .prof-page {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    padding-bottom: 80px;
  }

  /* Hero */
  .prof-hero {
    position: relative;
    overflow: hidden;
    padding: 56px 24px 48px;
    text-align: center;
    background: linear-gradient(160deg, var(--rose-pale) 0%, var(--white) 60%, var(--rose-pale) 100%);
  }
  .prof-hero-bg {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 55% 50% at 10% 0%, var(--rose-light) 0%, transparent 70%),
      radial-gradient(ellipse 45% 40% at 90% 100%, var(--rose-mid) 0%, transparent 65%);
  }
  .prof-eyebrow {
    display: inline-block;
    font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--rose); background: var(--white); border: 1px solid var(--rose-light);
    border-radius: 100px; padding: 5px 16px; margin-bottom: 16px;
  }
  .prof-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5.5vw, 3.8rem);
    font-weight: 800; line-height: 1.15; margin: 0 0 10px; color: var(--ink);
  }
  .prof-title em { font-style: italic; color: var(--rose); }
  .prof-subtitle { font-size: 1rem; color: var(--ink-soft); font-weight: 300; margin: 0; }

  /* Body wrapper */
  .prof-body { max-width: 1100px; margin: -20px auto 0; padding: 0 16px; position: relative; z-index: 2; }
  .prof-layout { display: grid; grid-template-columns: 1fr; gap: 20px; }
  @media (min-width: 900px) { .prof-layout { grid-template-columns: 300px 1fr; gap: 28px; } }

  /* Sidebar */
  .prof-sidebar { display: flex; flex-direction: column; gap: 16px; }

  /* Avatar card */
  .prof-avatar-card {
    background: var(--white); border: 1.5px solid var(--rose-light);
    border-radius: var(--radius); box-shadow: var(--shadow);
    padding: 32px 24px 24px; text-align: center;
  }
  .prof-avatar-wrap {
    position: relative; width: 112px; height: 112px;
    margin: 0 auto 20px; cursor: pointer; border-radius: 50%;
    outline: none;
  }
  .prof-avatar-wrap:focus-visible { box-shadow: 0 0 0 3px var(--rose-light); }
  .prof-avatar-img {
    width: 112px; height: 112px; border-radius: 50%;
    object-fit: cover; display: block;
    border: 3px solid var(--rose-light);
    background: var(--rose-pale);
  }
  .prof-initials {
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--rose-light), var(--rose));
    color: var(--white); font-family: 'Playfair Display', serif; font-weight: 600;
    letter-spacing: 0.04em; user-select: none;
  }
  .prof-avatar-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(42,26,34,0.45); display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .prof-avatar-wrap:hover .prof-avatar-overlay,
  .prof-avatar-wrap:focus-visible .prof-avatar-overlay { opacity: 1; }
  .prof-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

  .prof-card-name {
    font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 600;
    color: var(--ink); margin: 0 0 10px; line-height: 1.3;
  }
  .prof-card-badge {
    display: inline-block; font-size: 0.72rem; font-weight: 500;
    background: var(--rose-pale); color: var(--rose); border: 1px solid var(--rose-light);
    border-radius: 100px; padding: 4px 12px; letter-spacing: 0.03em;
  }
  .prof-card-loc {
    display: flex; align-items: center; justify-content: center; gap: 5px;
    font-size: 0.8rem; color: var(--ink-soft); margin: 10px 0 0;
  }
  .prof-photo-btn {
    display: inline-flex; align-items: center; gap: 7px; margin-top: 18px;
    background: transparent; border: 1.5px solid var(--rose); color: var(--rose);
    border-radius: 100px; padding: 8px 18px; font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: background 0.2s, color 0.2s;
  }
  .prof-photo-btn:hover { background: var(--rose); color: var(--white); }
  .prof-photo-hint { font-size: 0.72rem; color: var(--ink-soft); margin: 10px 0 0; line-height: 1.5; }

  /* Sisterhood decorative */
  .prof-sisterhood-card {
    background: linear-gradient(120deg, var(--rose-pale), var(--rose-mid));
    border-radius: var(--radius); padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    border: 1px solid var(--rose-light);
  }
  .prof-sisterhood-label { font-size: 0.78rem; font-weight: 500; color: var(--rose); letter-spacing: 0.04em; }
  .prof-sisterhood-dots { display: flex; gap: 5px; }
  .prof-sisterhood-dots span { width: 7px; height: 7px; border-radius: 50%; display: block; }

  /* Form card */
  .prof-form-card {
    background: var(--white); border: 1.5px solid var(--rose-light);
    border-radius: var(--radius); box-shadow: var(--shadow); padding: 32px 28px;
  }
  .prof-form-header { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
  .prof-form-title {
    font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; color: var(--ink); margin: 0;
  }
  .prof-unsaved-dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--rose); flex-shrink: 0;
    animation: pulse 1.8s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  .prof-form { display: flex; flex-direction: column; gap: 22px; }
  .prof-form-row { display: grid; grid-template-columns: 1fr; gap: 22px; }
  @media (min-width: 560px) { .prof-form-row { grid-template-columns: 1fr 1fr; } }

  .prof-field { display: flex; flex-direction: column; gap: 7px; }
  .prof-field-header { display: flex; align-items: baseline; justify-content: space-between; }
  .prof-label { font-size: 0.82rem; font-weight: 500; color: var(--ink-mid); letter-spacing: 0.02em; }
  .prof-hint { font-size: 0.72rem; color: var(--ink-soft); }

  .prof-input {
    width: 100%; box-sizing: border-box;
    padding: 12px 16px; border-radius: 12px;
    border: 1.5px solid var(--rose-light);
    background: var(--rose-pale); color: var(--ink);
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .prof-input:focus {
    border-color: var(--rose); background: var(--white);
    box-shadow: 0 0 0 3px rgba(232,84,122,0.12);
  }
  .prof-input::placeholder { color: var(--ink-soft); }
  .prof-textarea { resize: none; line-height: 1.6; }

  /* Save button */
  .prof-save-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    background: var(--rose); color: var(--white);
    border: none; border-radius: 14px; padding: 15px 28px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500;
    cursor: pointer; width: 100%; letter-spacing: 0.02em;
    box-shadow: 0 4px 20px rgba(232,84,122,0.35);
    transition: background 0.2s, box-shadow 0.2s;
    margin-top: 6px;
  }
  .prof-save-btn:hover:not(:disabled) { background: #d43f6a; box-shadow: 0 6px 28px rgba(232,84,122,0.45); }
  .prof-save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  /* Spinner */
  .prof-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toast */
  .prof-toast-tray {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 1000; width: calc(100% - 48px); max-width: 400px; pointer-events: none;
  }
  .prof-toast {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; border-radius: 14px;
    font-size: 0.88rem; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    pointer-events: all;
  }
  .prof-toast-success { background: var(--success-bg); color: var(--success); border: 1px solid #A7F3D0; }
  .prof-toast-error   { background: var(--error-bg);   color: var(--error);   border: 1px solid #FECACA; }
  .prof-toast-icon {
    width: 22px; height: 22px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center;
    background: currentColor; color: var(--white); font-size: 0.75rem;
    flex-shrink: 0;
  }
  .prof-toast-close {
    margin-left: auto; background: none; border: none; cursor: pointer;
    font-size: 1.2rem; color: currentColor; opacity: 0.6; padding: 0 2px; line-height: 1;
  }
  .prof-toast-close:hover { opacity: 1; }

  /* Loading skeleton */
  .prof-loading {
    display: flex; flex-direction: column; align-items: center;
    gap: 16px; padding: 100px 24px; max-width: 300px; margin: 0 auto;
  }
  .prof-skel {
    background: linear-gradient(90deg, var(--rose-pale) 25%, var(--rose-mid) 50%, var(--rose-pale) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
`;

export default Profile;
