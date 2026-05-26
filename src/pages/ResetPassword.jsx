import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const Spinner = () => (
  <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rsp-spin 0.8s linear infinite', verticalAlign: 'middle', marginRight: 8 }} />
);

const ResetPassword = () => {
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [message, setMessage]                 = useState('');
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const { token } = useParams();
  const navigate  = useNavigate();

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const mismatch       = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6)          { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.msg);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes rsp-spin { to { transform: rotate(360deg); } }
        @keyframes rsp-countdown { from { width: 100%; } to { width: 0%; } }
        .rsp-input {
          width: 100%; padding: 13px 46px 13px 16px; border-radius: 14px;
          border: 2px solid rgba(255,192,203,0.35);
          background: rgba(255,255,255,0.9); font-size: 0.97rem;
          color: rgba(40,20,30,0.85); outline: none; box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
        }
        .rsp-input:focus { border-color: var(--color-primary,#ff69b4); box-shadow: 0 0 0 3px rgba(255,192,203,0.2); }
        .rsp-input::placeholder { color: rgba(180,100,130,0.4); }
        .rsp-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .rsp-input.match   { border-color: rgba(30,160,80,0.6);  }
        .rsp-input.mismatch{ border-color: rgba(220,50,80,0.5);  }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,48px) 16px' }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <motion.img src="https://i.imgur.com/WwrdAkS.png" alt="KGHS Alumni Foundation"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'contain', border: '3px solid rgba(255,192,203,0.5)', background: '#fff', padding: 4, boxShadow: '0 4px 20px rgba(255,150,180,0.18)', margin: '0 auto 12px', display: 'block' }} />
            <h1 className="text-primary" style={{ fontSize: 'clamp(1.6rem,5vw,2.1rem)', fontWeight: 800, margin: '0 0 5px', lineHeight: 1.1 }}>
              Reset Your Password
            </h1>
            <p className="text-textDark/60" style={{ fontSize: '0.9rem', margin: 0 }}>
              Choose a new password for your account
            </p>
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(255,192,203,0.3)', boxShadow: '0 4px 32px rgba(255,150,180,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: 'clamp(22px,5vw,34px)' }}>

              {/* Success state */}
              <AnimatePresence>
                {message && (
                  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: 'center', padding: '8px 0 12px' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>✅</div>
                    <h2 className="text-primary" style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px' }}>
                      Password Reset!
                    </h2>
                    <p style={{ margin: '0 0 16px', fontSize: '0.92rem', color: 'rgba(50,25,40,0.7)', lineHeight: 1.6 }}>
                      {message}
                    </p>
                    {/* Countdown bar */}
                    <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,192,203,0.2)', overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{ height: '100%', borderRadius: 99, background: 'var(--color-primary,#ff69b4)', animation: 'rsp-countdown 3s linear forwards' }} />
                    </div>
                    <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: 'rgba(160,80,100,0.55)' }}>
                      Redirecting to login in 3 seconds…
                    </p>
                    <Link to="/login"
                      style={{ display: 'inline-block', padding: '10px 28px', borderRadius: 999, background: 'var(--color-primary,#ff69b4)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                      Go to Login Now
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
                    {error.includes('expired') && (
                      <div style={{ marginTop: 8 }}>
                        <Link to="/login" className="text-primary" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                          Request a new link →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              {!message && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* New password */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input className="rsp-input" type={showPw ? 'text' : 'password'}
                        value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                        placeholder="Min. 6 characters" required disabled={loading} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(180,80,120,0.6)', lineHeight: 1 }}>
                        {showPw ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
                        {[1,2,3].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: password.length >= i * 4 ? (i === 3 ? 'rgba(30,160,80,0.7)' : 'var(--color-primary,#ff69b4)') : 'rgba(255,192,203,0.25)', transition: 'background 0.3s' }} />
                        ))}
                        <span style={{ fontSize: '0.68rem', color: 'rgba(160,80,100,0.55)', marginLeft: 4, whiteSpace: 'nowrap' }}>
                          {password.length < 4 ? 'Weak' : password.length < 8 ? 'Fair' : 'Strong'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(100,40,60,0.65)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className={`rsp-input${passwordsMatch ? ' match' : mismatch ? ' mismatch' : ''}`}
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder="Re-enter your password" required disabled={loading} />
                      <button type="button" onClick={() => setShowConfirm(s => !s)}
                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(180,80,120,0.6)', lineHeight: 1 }}>
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {/* Match feedback */}
                    <AnimatePresence>
                      {confirmPassword.length > 0 && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ margin: '5px 0 0', fontSize: '0.75rem', fontWeight: 600, color: passwordsMatch ? 'rgba(30,160,80,0.8)' : 'rgba(220,50,80,0.75)' }}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords don\'t match'}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button type="submit"
                    disabled={loading || mismatch || !password || !confirmPassword}
                    whileTap={{ scale: 0.97 }}
                    className="bg-primary text-white"
                    style={{ padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', marginTop: 4, cursor: (loading || mismatch || !password || !confirmPassword) ? 'not-allowed' : 'pointer', opacity: (loading || mismatch || !password || !confirmPassword) ? 0.6 : 1 }}>
                    {loading && <Spinner />}{loading ? 'Resetting…' : 'Set New Password'}
                  </motion.button>
                </form>
              )}

            </div>

            {/* Footer strip */}
            {!message && (
              <div style={{ padding: '12px 24px 16px', borderTop: '1px solid rgba(255,192,203,0.2)', background: 'rgba(255,192,203,0.04)', textAlign: 'center' }}>
                <Link to="/login" className="text-primary" style={{ fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(255,192,203,0.5)', paddingBottom: 1 }}>
                  ← Back to Login
                </Link>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default ResetPassword;
