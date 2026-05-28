import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Spinner = () => (
  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'lgn-spin 0.8s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
);

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [isForgotMode, setIsForgotMode]   = useState(false);
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError]     = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/profile';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token',    res.data.token);
      localStorage.setItem('role',     res.data.user.role || 'alumni');
      localStorage.setItem('userName', res.data.user.name || '');
      navigate(redirectTo);
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 403) {
        setError('Your account is pending approval. You will receive an email when approved.');
      } else if (err.response?.status === 400) {
        setError('Invalid email or password.');
      } else if (!err.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.response.data.msg || 'Login failed. Please try again.');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setForgotError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: forgotEmail });
      setForgotMessage(res.data.msg || 'Check your email for a reset link.');
      setTimeout(() => { setIsForgotMode(false); setForgotMessage(''); }, 4000);
    } catch (err) {
      setForgotError(err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes lgn-spin { to { transform: rotate(360deg); } }
        .lgn-input {
          width: 100%; padding: 13px 16px; border-radius: 14px;
          border: 2px solid rgba(255,192,203,0.35);
          background: rgba(255,255,255,0.9); font-size: 0.97rem;
          color: rgba(40,20,30,0.85); outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
        }
        .lgn-input:focus { border-color: var(--color-primary,#ff69b4); box-shadow: 0 0 0 3px rgba(255,192,203,0.2); }
        .lgn-input::placeholder { color: rgba(180,100,130,0.4); }
        .lgn-input:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,48px) 16px' }}>

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.img
              src="https://i.imgur.com/WwrdAkS.png"
              alt="KGHS Alumni Foundation"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'contain', border: '3px solid rgba(255,192,203,0.5)', background: '#fff', padding: 4, boxShadow: '0 4px 20px rgba(255,150,180,0.18)', margin: '0 auto 14px', display: 'block' }}
            />
            <AnimatePresence mode="wait">
              <motion.div key={isForgotMode ? 'forgot' : 'login'}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}>
                <h1 className="text-primary" style={{ fontSize: 'clamp(1.7rem,5vw,2.2rem)', fontWeight: 800, margin: '0 0 6px', lineHeight: 1.1 }}>
                  {isForgotMode ? 'Reset Password' : 'Welcome Back '}
                </h1>
                <p className="text-textDark/60" style={{ fontSize: '0.9rem', margin: 0 }}>
                  {isForgotMode ? 'Enter your email to receive a reset link' : 'Log in to your KGHS Alumni account'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 4px 32px rgba(255,150,180,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: 'clamp(22px,5vw,36px)' }}>

              {/* Error / success banners */}
              <AnimatePresence>
                {error && !isForgotMode && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(220,50,80,0.07)', border: '1px solid rgba(220,50,80,0.2)', color: 'rgba(180,20,50,0.85)', fontSize: '0.88rem', lineHeight: 1.5, textAlign: 'center' }}>
                    {error}
                  </motion.div>
                )}
                {forgotMessage && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(30,160,80,0.07)', border: '1px solid rgba(30,160,80,0.2)', color: 'rgba(20,120,60,0.85)', fontSize: '0.88rem', lineHeight: 1.5, textAlign: 'center' }}>
                    {forgotMessage}
                  </motion.div>
                )}
                {forgotError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 12, background: 'rgba(220,50,80,0.07)', border: '1px solid rgba(220,50,80,0.2)', color: 'rgba(180,20,50,0.85)', fontSize: '0.88rem', lineHeight: 1.5, textAlign: 'center' }}>
                    {forgotError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Login form ── */}
              <AnimatePresence mode="wait">
                {!isForgotMode ? (
                  <motion.form key="login-form"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleLogin}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                  >
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email</label>
                      <input className="lgn-input" type="email" placeholder="your@email.com"
                        value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input className="lgn-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)} required disabled={loading}
                          style={{ paddingRight: 48 }} />
                        <button type="button" onClick={() => setShowPw(s => !s)}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(180,80,120,0.6)', lineHeight: 1 }}
                          aria-label={showPw ? 'Hide password' : 'Show password'}>
                          {showPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* Forgot password link */}
                    <div style={{ textAlign: 'right', marginTop: -8 }}>
                      <button type="button" onClick={() => { setIsForgotMode(true); setError(''); }}
                        className="text-primary"
                        style={{ background: 'none', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                        Forgot password?
                      </button>
                    </div>

                    <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                      className="bg-primary text-white"
                      style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1, marginTop: 4 }}>
                      {loading && <Spinner />}{loading ? 'Logging in…' : 'Log In'}
                    </motion.button>
                  </motion.form>

                ) : (
                  /* ── Forgot password form ── */
                  <motion.form key="forgot-form"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleForgotPassword}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                  >
                    <div>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Email</label>
                      <input className="lgn-input" type="email" placeholder="your@email.com"
                        value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required disabled={forgotLoading} />
                    </div>

                    <motion.button type="submit" disabled={forgotLoading} whileTap={{ scale: 0.97 }}
                      className="bg-primary text-white"
                      style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: forgotLoading ? 'not-allowed' : 'pointer', opacity: forgotLoading ? 0.75 : 1 }}>
                      {forgotLoading && <Spinner />}{forgotLoading ? 'Sending…' : 'Send Reset Link'}
                    </motion.button>

                    <button type="button"
                      onClick={() => { setIsForgotMode(false); setForgotMessage(''); setForgotError(''); }}
                      className="text-primary"
                      style={{ background: 'none', border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', padding: '4px 0' }}>
                      ← Back to Log In
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>

            {/* Footer strip */}
            {!isForgotMode && (
              <div style={{ padding: '14px 24px 18px', borderTop: '1px solid rgba(255,192,203,0.2)', background: 'rgba(255,192,203,0.04)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.88rem', color: 'rgba(80,40,60,0.6)' }}>
                  New to KGHS Alumni?{' '}
                  <Link to="/signup" className="text-primary" style={{ fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid rgba(255,192,203,0.6)', paddingBottom: 1 }}>
                    Sign up here
                  </Link>
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(120,60,80,0.45)' }}>
                  Only verified alumni can log in. Contact admin if you need help.
                </p>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default Login;
