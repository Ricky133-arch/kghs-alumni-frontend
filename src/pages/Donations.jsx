import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ─── Copy to clipboard helper ─────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleCopy}
      style={{
        padding: '5px 14px', borderRadius: 999,
        border: '1.5px solid rgba(255,192,203,0.5)',
        background: copied ? 'rgba(255,192,203,0.3)' : 'transparent',
        color: copied ? 'rgba(160,40,80,0.9)' : 'rgba(180,60,100,0.7)',
        fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.2s', whiteSpace: 'nowrap', letterSpacing: '0.04em',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </motion.button>
  );
};

// ─── Detail row ───────────────────────────────────────────────────────────────
const DetailRow = ({ label, value, large, copyable }) => (
  <div style={{
    padding: '14px 18px',
    borderRadius: 14,
    background: 'rgba(255,192,203,0.06)',
    border: '1px solid rgba(255,192,203,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
  }}>
    <div>
      <p style={{ margin: '0 0 2px', fontSize: '0.73rem', fontWeight: 700, color: 'rgba(160,60,100,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ margin: 0, fontWeight: large ? 800 : 600, fontSize: large ? '1.35rem' : '0.98rem', color: large ? 'rgba(180,40,90,0.92)' : 'rgba(40,20,30,0.85)', lineHeight: 1.2 }}>
        {value}
      </p>
    </div>
    {copyable && <CopyButton text={value} />}
  </div>
);

// ─── Impact item ──────────────────────────────────────────────────────────────
const ImpactItem = ({ emoji, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ delay, duration: 0.4 }}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px', borderRadius: 14,
      background: 'rgba(255,192,203,0.07)',
      border: '1px solid rgba(255,192,203,0.2)',
    }}
  >
    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{emoji}</span>
    <p style={{ margin: 0, fontSize: '0.92rem', color: 'rgba(50,25,40,0.75)', lineHeight: 1.6, fontWeight: 400 }}>{text}</p>
  </motion.div>
);

// ─── Main Donations ───────────────────────────────────────────────────────────
const Donations = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <style>{`
        @keyframes don-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,192,203,0.4)} 50%{box-shadow:0 0 0 12px rgba(255,192,203,0)} }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/10"
        style={{ padding: 'clamp(36px,5vw,64px) clamp(14px,4vw,24px) 60px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: 'clamp(28px,5vw,44px)' }}>
            <h1 className="text-primary"
              style={{ fontSize: 'clamp(2rem,7vw,3.4rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 12px' }}>
              Support Our Mission 
            </h1>
            <p className="text-textDark/70"
              style={{ fontSize: 'clamp(0.95rem,2.5vw,1.1rem)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>
              Your gift helps empower the next generation of KGHS girls through scholarships, school restoration, mentorship, and community initiatives.
            </p>
          </motion.div>

          {/* Impact grid */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10, marginBottom: 28 }}>
            <ImpactItem emoji="" text="Fund scholarships for brilliant girls who need support." delay={0.1} />
            <ImpactItem emoji="" text="Restore and improve school facilities for future students." delay={0.15} />
            <ImpactItem emoji="" text="Grow mentorship programs across generations of sisters." delay={0.2} />
            <ImpactItem emoji="" text="Strengthen our community wherever alumni are in the world." delay={0.25} />
          </motion.div>

          {/* Main card */}
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
            style={{ background: '#fff', borderRadius: 24, border: '1px solid rgba(255,192,203,0.35)', boxShadow: '0 4px 32px rgba(255,150,180,0.1)', overflow: 'hidden' }}>

            <div style={{ padding: 'clamp(20px,5vw,36px)' }}>
              <p className="text-textDark/70" style={{ textAlign: 'center', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: 1.7 }}>
                We gratefully accept bank transfers from anywhere in the world. Click below to see our account details and make a transfer.
              </p>

              {/* CTA button */}
              <div style={{ textAlign: 'center', marginBottom: showDetails ? 24 : 0 }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowDetails(s => !s)}
                  className="bg-primary text-white"
                  style={{
                    padding: 'clamp(12px,3vw,16px) clamp(28px,6vw,52px)',
                    borderRadius: 999, border: 'none', fontWeight: 800,
                    fontSize: 'clamp(1rem,3vw,1.2rem)',
                    cursor: 'pointer', letterSpacing: '0.02em',
                    animation: !showDetails ? 'don-pulse 2.4s ease-in-out infinite' : 'none',
                  }}
                >
                  {showDetails ? 'Hide Details' : ' View Account Details'}
                </motion.button>
              </div>

              {/* Bank details — slide reveal */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
                    style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                      <DetailRow label="Bank Name" value="Zenith Bank Plc" />
                      <DetailRow label="Account Name" value="KALABARI GIRLS HIGH SCHOOL ALUMNI FOUNDATION" />
                      <DetailRow label="Account Number" value="1017230743" large copyable />
                    </div>
                    <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: '0.85rem', fontStyle: 'italic', color: 'rgba(100,40,60,0.55)', lineHeight: 1.6 }}>
                      Thank you for your love and support. Every gift makes a difference in a KGHS girl's life. 
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer strip */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,192,203,0.2)', background: 'rgba(255,192,203,0.05)', textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: 'rgba(80,40,60,0.6)' }}>
                All donations go directly to supporting KGHS students and programs.
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(120,60,80,0.45)' }}>
                For receipts or enquiries, please contact us.
              </p>
            </div>
          </motion.div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/" className="text-primary" style={{ fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', borderBottom: '1px solid rgba(255,192,203,0.5)', paddingBottom: 2 }}>
              ← Back to Home
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default Donations;
