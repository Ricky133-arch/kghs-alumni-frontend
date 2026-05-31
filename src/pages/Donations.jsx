import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

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

// ─── Preset amount button ─────────────────────────────────────────────────────
const AmountButton = ({ value, selected, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => onClick(value)}
    style={{
      padding: '10px 0',
      borderRadius: 12,
      border: selected ? '2px solid #ff69b4' : '1.5px solid rgba(255,192,203,0.4)',
      background: selected ? 'rgba(255,192,203,0.18)' : 'transparent',
      color: selected ? 'rgba(180,40,90,0.95)' : 'rgba(80,40,60,0.7)',
      fontWeight: 700,
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.18s',
      width: '100%',
    }}
  >
    ₦{value.toLocaleString()}
  </motion.button>
);

// ─── Main Donations ───────────────────────────────────────────────────────────
const Donations = () => {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showOnlineForm, setShowOnlineForm] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const getFinalAmount = () => {
    if (customAmount && !isNaN(Number(customAmount)) && Number(customAmount) > 0) {
      return Number(customAmount);
    }
    return selectedAmount;
  };

  const handlePaystackDonate = async () => {
    const amount = getFinalAmount();
    if (!amount || amount < 100) {
      setError('Please enter a valid amount (minimum ₦100).');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to donate online.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/donations/create-payment`,
        { amount, currency },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Redirect to Paystack hosted payment page
      window.location.href = res.data.authorization_url;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Could not initialize payment. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes don-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,192,203,0.4)} 50%{box-shadow:0 0 0 12px rgba(255,192,203,0)} }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.85; }
        .amount-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        @media (max-width: 400px) { .amount-grid { grid-template-columns: repeat(2, 1fr); } }
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
                Choose how you'd like to give — pay securely online or make a direct bank transfer.
              </p>

              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,192,203,0.1)', borderRadius: 14, padding: 4 }}>
                {[
                  { key: 'online', label: ' Pay Online' },
                  { key: 'bank', label: ' Bank Transfer' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className="tab-btn"
                    onClick={() => {
                      if (tab.key === 'online') { setShowOnlineForm(true); setShowBankDetails(false); }
                      else { setShowBankDetails(true); setShowOnlineForm(false); }
                      setError('');
                    }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                      fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                      background: (tab.key === 'online' ? showOnlineForm : showBankDetails)
                        ? '#ff69b4' : 'transparent',
                      color: (tab.key === 'online' ? showOnlineForm : showBankDetails)
                        ? '#fff' : 'rgba(180,60,100,0.7)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Online Payment Form ── */}
              <AnimatePresence>
                {showOnlineForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
                    style={{ overflow: 'hidden' }}>

                    {/* Currency toggle */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      {['NGN', 'USD'].map(c => (
                        <button
                          key={c}
                          onClick={() => { setCurrency(c); setSelectedAmount(null); setCustomAmount(''); }}
                          style={{
                            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none',
                            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                            background: currency === c ? 'rgba(255,105,180,0.15)' : 'rgba(255,192,203,0.08)',
                            color: currency === c ? '#ff69b4' : 'rgba(120,60,80,0.6)',
                            border: currency === c ? '1.5px solid rgba(255,105,180,0.4)' : '1.5px solid rgba(255,192,203,0.2)',
                          }}
                        >
                          {c === 'NGN' ? '🇳🇬 Naira (₦)' : '🇺🇸 USD ($)'}
                        </button>
                      ))}
                    </div>

                    {/* Preset amounts (NGN only) */}
                    {currency === 'NGN' && (
                      <div className="amount-grid" style={{ marginBottom: 14 }}>
                        {presetAmounts.map(amt => (
                          <AmountButton
                            key={amt}
                            value={amt}
                            selected={selectedAmount === amt && !customAmount}
                            onClick={(v) => { setSelectedAmount(v); setCustomAmount(''); setError(''); }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Custom amount input */}
                    <div style={{ marginBottom: 16 }}>
                      <input
                        type="number"
                        placeholder={currency === 'NGN' ? 'Or enter custom amount (₦)' : 'Enter amount ($)'}
                        value={customAmount}
                        onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); setError(''); }}
                        style={{
                          width: '100%', padding: '12px 16px', borderRadius: 12, boxSizing: 'border-box',
                          border: '1.5px solid rgba(255,192,203,0.4)', fontSize: '1rem',
                          outline: 'none', color: 'rgba(40,20,30,0.85)', fontWeight: 600,
                          background: 'rgba(255,192,203,0.04)',
                        }}
                        min="1"
                      />
                    </div>

                    {error && (
                      <p style={{ color: '#e53e3e', fontSize: '0.85rem', margin: '0 0 12px', textAlign: 'center' }}>{error}</p>
                    )}

                    {/* Pay button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePaystackDonate}
                      disabled={loading || (!getFinalAmount())}
                      className="bg-primary text-white"
                      style={{
                        width: '100%', padding: '14px 0', borderRadius: 999, border: 'none',
                        fontWeight: 800, fontSize: '1.05rem', cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: (!getFinalAmount() && !loading) ? 0.5 : 1,
                        letterSpacing: '0.02em',
                        animation: getFinalAmount() && !loading ? 'don-pulse 2.4s ease-in-out infinite' : 'none',
                      }}
                    >
                      {loading
                        ? 'Redirecting to Paystack...'
                        : `Donate ${getFinalAmount() ? `${currency === 'NGN' ? '₦' : '$'}${Number(getFinalAmount()).toLocaleString()}` : ''} Securely`}
                    </motion.button>

                    <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: '0.78rem', color: 'rgba(100,60,80,0.5)' }}>
                      🔒 Secured by Paystack. You'll be redirected to complete payment.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Bank Transfer Details ── */}
              <AnimatePresence>
                {showBankDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }}
                    style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

              {/* Default state — no tab selected yet */}
              {!showOnlineForm && !showBankDetails && (
                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(120,60,80,0.5)', marginTop: 8 }}>
                  Select a payment method above to get started.
                </p>
              )}
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
