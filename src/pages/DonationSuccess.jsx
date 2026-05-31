import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Floating petal component
const Petal = ({ delay, x, size, duration }) => (
  <motion.div
    initial={{ y: -20, x, opacity: 0, rotate: 0, scale: 0 }}
    animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360, scale: [0, 1, 1, 0.5] }}
    transition={{ delay, duration, ease: 'linear', repeat: Infinity, repeatDelay: Math.random() * 4 }}
    style={{
      position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none',
      width: size, height: size, borderRadius: '50% 0 50% 0',
      background: `rgba(255, ${100 + Math.floor(Math.random()*80)}, ${150 + Math.floor(Math.random()*60)}, ${0.15 + Math.random()*0.2})`,
    }}
  />
);

const petals = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  delay: i * 0.4,
  x: `${Math.random() * 100}vw`,
  size: `${8 + Math.random() * 16}px`,
  duration: 6 + Math.random() * 6,
}));

// Stat pill
const StatPill = ({ emoji, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 18px', borderRadius: 999,
      background: 'rgba(255,192,203,0.12)',
      border: '1px solid rgba(255,192,203,0.35)',
      fontSize: '0.82rem', fontWeight: 600,
      color: 'rgba(160,50,90,0.8)',
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{ fontSize: '1rem' }}>{emoji}</span>
    {label}
  </motion.div>
);

const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [status, setStatus] = useState('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!reference) { setStatus('success'); return; }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('You need to be logged in for your donation to be recorded. Your payment may still have gone through — please contact us.');
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/donations/verify/${reference}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setStatus('success');
        else { setStatus('error'); setErrorMsg('Payment could not be verified. Please contact support with your reference: ' + reference); }
      })
      .catch((err) => {
  console.error('Verify error:', err);
  setStatus('error');
  setErrorMsg('We could not verify your payment. If you were charged, please contact us with your reference: ' + reference);
});
  }, [reference]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .don-page * { box-sizing: border-box; }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .shimmer-text {
          background: linear-gradient(90deg, #c0396b, #ff69b4, #ffb6c1, #ff69b4, #c0396b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .heart-float { animation: float 3s ease-in-out infinite; }
        .don-btn {
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; border: none; font-weight: 600;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .don-btn:hover { transform: translateY(-2px); }
        .don-btn:active { transform: translateY(0px) scale(0.97); }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      {/* Floating petals */}
      {petals.map(p => <Petal key={p.id} {...p} />)}

      <div
        className="don-page"
        style={{
          minHeight: '100vh', position: 'relative', zIndex: 1,
          fontFamily: "'DM Sans', sans-serif",
          background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 40%, #fff0f5 70%, #ffeef4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background blobs */}
        <div style={{
          position: 'fixed', top: '-10%', right: '-5%', width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,182,193,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '-5%', left: '-5%', width: 350, height: 350,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,105,180,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <AnimatePresence mode="wait">

          {/* ── VERIFYING ── */}
          {status === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                textAlign: 'center', padding: 'clamp(40px,8vw,80px) clamp(32px,6vw,64px)',
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
                borderRadius: 32, border: '1px solid rgba(255,192,203,0.3)',
                boxShadow: '0 8px 64px rgba(255,105,180,0.12), 0 2px 16px rgba(255,192,203,0.2)',
                maxWidth: 480, width: '100%', position: 'relative', zIndex: 2,
              }}
            >
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '3px solid rgba(255,192,203,0.2)',
                  borderTop: '3px solid #ff69b4',
                }} className="spin" />
                <div style={{
                  position: 'absolute', inset: 8, borderRadius: '50%',
                  border: '2px solid rgba(255,192,203,0.15)',
                  borderBottom: '2px solid rgba(255,105,180,0.5)',
                  animationDirection: 'reverse',
                }} className="spin" />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}></div>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#c0396b', margin: '0 0 10px' }}>
                Verifying your gift...
              </h2>
              <p style={{ color: 'rgba(120,60,80,0.6)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                Please hold on while we confirm your donation.
              </p>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                maxWidth: 620, width: '100%', position: 'relative', zIndex: 2,
              }}
            >
              {/* Main card */}
              <div style={{
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
                borderRadius: 36, border: '1px solid rgba(255,192,203,0.3)',
                boxShadow: '0 20px 80px rgba(255,105,180,0.15), 0 4px 24px rgba(255,192,203,0.25)',
                overflow: 'hidden',
              }}>
                {/* Top banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #ffe0eb 0%, #ffd6e7 50%, #ffcce0 100%)',
                  padding: 'clamp(32px,6vw,52px) clamp(24px,5vw,48px) clamp(24px,4vw,36px)',
                  textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}>
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,105,180,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,182,193,0.15)' }} />

                  {/* Pulse ring + heart */}
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                    <motion.div
                      animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', inset: -16, borderRadius: '50%',
                        border: '2px solid rgba(255,105,180,0.4)',
                      }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.4], opacity: [0.25, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, delay: 0.3, ease: 'easeOut' }}
                      style={{
                        position: 'absolute', inset: -8, borderRadius: '50%',
                        background: 'rgba(255,105,180,0.1)',
                      }}
                    />
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 12 }}
                      className="heart-float"
                      style={{
                        width: 88, height: 88, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff69b4, #ff4d94)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.4rem',
                        boxShadow: '0 8px 32px rgba(255,105,180,0.4)',
                      }}
                    >
                      
                    </motion.div>
                  </div>

                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
                      fontWeight: 800, margin: '0 0 10px', lineHeight: 1.15,
                    }}
                    className="shimmer-text"
                  >
                    Thank You, Sister!
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(160,50,90,0.65)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                  >
                    Your donation was successful
                  </motion.p>
                </div>

                {/* Body */}
                <div style={{ padding: 'clamp(24px,5vw,40px) clamp(24px,5vw,48px)' }}>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    style={{
                      fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)',
                      color: 'rgba(60,30,45,0.72)', lineHeight: 1.8,
                      textAlign: 'center', margin: '0 0 28px', fontWeight: 400,
                    }}
                  >
                    Your generosity brings us one step closer to empowering the next generation of KGHS girls — through scholarships, mentorship, and opportunity. Every gift matters deeply.
                  </motion.p>

                  {/* Impact pills */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85 }}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}
                  >
                    <StatPill emoji="" label="Scholarships funded" delay={0.9} />
                    <StatPill emoji="" label="School restored" delay={0.95} />
                    <StatPill emoji="" label="Girls empowered" delay={1.0} />
                  </motion.div>

                  {/* Reference */}
                  {reference && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      style={{
                        padding: '10px 16px', borderRadius: 12, marginBottom: 28,
                        background: 'rgba(255,192,203,0.08)',
                        border: '1px dashed rgba(255,192,203,0.4)',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(160,60,100,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transaction Reference</span>
                      <p style={{ margin: '3px 0 0', fontFamily: 'monospace', fontSize: '0.82rem', color: 'rgba(120,50,80,0.6)', wordBreak: 'break-all' }}>{reference}</p>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.05 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    <Link to="/" style={{ textDecoration: 'none' }}>
                      <button className="don-btn" style={{
                        width: '100%', padding: '16px 24px', borderRadius: 16,
                        background: 'linear-gradient(135deg, #ff69b4 0%, #e8407a 100%)',
                        color: '#fff', fontSize: '1rem',
                        boxShadow: '0 4px 20px rgba(255,105,180,0.35)',
                      }}>
                        Back to Home
                      </button>
                    </Link>
                    <Link to="/donations" style={{ textDecoration: 'none' }}>
                      <button className="don-btn" style={{
                        width: '100%', padding: '15px 24px', borderRadius: 16,
                        background: 'transparent', color: '#e8407a', fontSize: '1rem',
                        border: '1.5px solid rgba(255,105,180,0.4)',
                      }}>
                        Donate Again 
                      </button>
                    </Link>
                  </motion.div>
                </div>

                {/* Footer strip */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255,192,203,0.2)',
                    background: 'rgba(255,240,246,0.5)',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(160,60,100,0.55)', lineHeight: 1.6 }}>
                     A receipt has been sent to your email &nbsp;·&nbsp; Thank you for being part of the KGHS sisterhood
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                maxWidth: 520, width: '100%', position: 'relative', zIndex: 2,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
                borderRadius: 32, border: '1px solid rgba(255,192,203,0.3)',
                boxShadow: '0 20px 80px rgba(255,105,180,0.1)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #fff5f0, #fff0f0)',
                padding: 'clamp(32px,6vw,48px) clamp(24px,5vw,48px) 28px',
                textAlign: 'center',
              }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 160 }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,100,100,0.08)', border: '2px solid rgba(255,150,150,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', margin: '0 auto 20px',
                  }}
                >
                  
                </motion.div>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                  fontWeight: 700, color: '#c0392b', margin: '0 0 8px',
                }}>
                  Verification Issue
                </h1>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(180,80,80,0.6)', fontWeight: 500 }}>
                  Don't worry — we'll sort this out
                </p>
              </div>

              <div style={{ padding: 'clamp(20px,4vw,36px) clamp(24px,5vw,48px) clamp(24px,4vw,36px)' }}>
                <p style={{
                  fontSize: '0.95rem', color: 'rgba(80,40,40,0.7)', lineHeight: 1.75,
                  textAlign: 'center', margin: '0 0 28px',
                }}>
                  {errorMsg || 'We had trouble verifying your payment. If you were charged, please contact us — we will sort it out quickly.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <button className="don-btn" style={{
                      width: '100%', padding: '15px', borderRadius: 14,
                      background: 'linear-gradient(135deg, #ff69b4, #e8407a)',
                      color: '#fff', fontSize: '0.95rem',
                      boxShadow: '0 4px 16px rgba(255,105,180,0.3)',
                    }}>Back to Home</button>
                  </Link>
                  <Link to="/donations" style={{ textDecoration: 'none' }}>
                    <button className="don-btn" style={{
                      width: '100%', padding: '14px', borderRadius: 14,
                      background: 'transparent', color: '#e8407a', fontSize: '0.95rem',
                      border: '1.5px solid rgba(255,105,180,0.35)',
                    }}>Try Again</button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
};

export default DonationSuccess;
