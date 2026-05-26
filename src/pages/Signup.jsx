import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Spinner = () => (
  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'sgn-spin 0.8s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
);

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', graduationYear: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) => { setFormData(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData);
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.msg || '';
      if (!err.response) setError('Network error. Please check your connection.');
      else if (msg.includes('exists')) setError('This email is already registered.');
      else if (msg.includes('year'))   setError('Please enter a valid graduation year (1950–2030).');
      else setError(msg || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sgn-spin { to { transform: rotate(360deg); } }
        .sgn-input {
          width: 100%; padding: 13px 16px; border-radius: 14px;
          border: 2px solid rgba(255,192,203,0.35);
          background: rgba(255,255,255,0.9); font-size: 0.97rem;
          color: rgba(40,20,30,0.85); outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
        }
        .sgn-input:focus { border-color: var(--color-primary,#ff69b4); box-shadow: 0 0 0 3px rgba(255,192,203,0.2); }
        .sgn-input::placeholder { color: rgba(180,100,130,0.4); }
        .sgn-input:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,48px) 16px' }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <motion.img src="https://i.imgur.com/WwrdAkS.png" alt="KGHS Alumni Foundation"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'contain', border: '3px solid rgba(255,192,203,0.5)', background: '#fff', padding: 4, boxShadow: '0 4px 20px rgba(255,150,180,0.18)', margin: '0 auto 12px', display: 'block' }} />
            <h1 className="text-primary" style={{ fontSize: 'clamp(1.6rem,5vw,2.1rem)', fontWeight: 800, margin: '0 0 5px', lineHeight: 1.1 }}>
              Join KGHS Alumni 
            </h1>
            <p className="text-textDark/60" style={{ fontSize: '0.9rem', margin: 0 }}>
              Become part of our vibrant sisterhood
            </p>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 4px 32px rgba(255,150,180,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: 'clamp(22px,5vw,34px)' }}>

              {/* Success state */}
              <AnimatePresence>
                {success && (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                    style={{ textAlign: 'center', padding: '8px 0 12px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}></div>
                    <h2 className="text-primary" style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px' }}>
                      Thank you, {formData.name}!
                    </h2>
                    <p style={{ margin: '0 0 10px', fontSize: '0.95rem', color: 'rgba(50,25,40,0.75)', lineHeight: 1.7 }}>
                      Your account is now <strong>pending approval</strong>. We'll review your application shortly and send you a welcome email once approved.
                    </p>
                    <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,192,203,0.1)', border: '1px solid rgba(255,192,203,0.3)' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(160,60,100,0.7)', fontWeight: 500 }}>
                        Keep an eye on <strong>{formData.email}</strong> for your approval email.
                      </p>
                    </div>
                    <Link to="/login"
                      style={{ display: 'inline-block', marginTop: 20, padding: '11px 32px', borderRadius: 999, background: 'var(--color-primary,#ff69b4)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                      Back to Login
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(220,50,80,0.07)', border: '1px solid rgba(220,50,80,0.2)', color: 'rgba(180,20,50,0.85)', fontSize: '0.88rem', lineHeight: 1.5, textAlign: 'center' }}>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              {!success && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {[
                    { label: 'Full Name',        name: 'name',           type: 'text',   placeholder: 'Your full name' },
                    { label: 'Email',            name: 'email',          type: 'email',  placeholder: 'your@email.com' },
                  ].map(field => (
                    <div key={field.name}>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{field.label}</label>
                      <input className="sgn-input" type={field.type} name={field.name}
                        value={formData[field.name]} onChange={handleChange}
                        placeholder={field.placeholder} required disabled={loading} />
                    </div>
                  ))}

                  {/* Password with show/hide */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input className="sgn-input" type={showPw ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Min. 6 characters" required minLength={6} disabled={loading}
                        style={{ paddingRight: 48 }} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(180,80,120,0.6)', lineHeight: 1 }}
                        aria-label={showPw ? 'Hide password' : 'Show password'}>
                        {showPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {/* Password strength hint */}
                    {formData.password.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                        {[1,2,3].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: formData.password.length >= i * 4 ? (i === 3 ? 'rgba(30,160,80,0.7)' : 'var(--color-primary,#ff69b4)') : 'rgba(255,192,203,0.25)', transition: 'background 0.3s' }} />
                        ))}
                        <span style={{ fontSize: '0.68rem', color: 'rgba(160,80,100,0.55)', marginLeft: 4, whiteSpace: 'nowrap' }}>
                          {formData.password.length < 4 ? 'Weak' : formData.password.length < 8 ? 'Fair' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Graduation year */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Graduation Year</label>
                    <input className="sgn-input" type="number" name="graduationYear"
                      value={formData.graduationYear} onChange={handleChange}
                      placeholder="e.g. 2015" min="1950" max="2030" required disabled={loading}
                      inputMode="numeric" />
                  </div>

                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                    className="bg-primary text-white"
                    style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1, marginTop: 4 }}>
                    {loading && <Spinner />}{loading ? 'Submitting…' : 'Request Membership'}
                  </motion.button>
                </form>
              )}

            </div>

            {/* Footer strip */}
            {!success && (
              <div style={{ padding: '14px 24px 18px', borderTop: '1px solid rgba(255,192,203,0.2)', background: 'rgba(255,192,203,0.04)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 5px', fontSize: '0.88rem', color: 'rgba(80,40,60,0.6)' }}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary" style={{ fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(255,192,203,0.6)', paddingBottom: 1 }}>
                    Log in here
                  </Link>
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(120,60,80,0.45)' }}>
                  Exclusive to verified KGHS graduates. All applications are reviewed by admin.
                </p>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default Signup;
