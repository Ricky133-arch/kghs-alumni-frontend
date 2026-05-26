import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  // Detect scroll for navbar shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Sync auth state (handles logout from other tabs / same session)
  useEffect(() => {
    const sync = () => { setToken(localStorage.getItem('token')); setRole(localStorage.getItem('role')); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    window.location.href = '/';
  };

  const navLinks = token ? [
    { to: '/profile',   label: 'Profile'    },
    { to: '/directory', label: 'Directory'  },
    { to: '/events',    label: 'Events'     },
    { to: '/news',      label: 'News'       },
    { to: '/forums',    label: 'Forums'     },
    { to: '/gallery',   label: 'Gallery'    },
    { to: '/donations', label: 'Donate'     },
    ...(role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ] : [];

  const socialLinks = [
    { icon: FaInstagram, href: 'https://www.instagram.com/kghs.alumnae?igsh=OHY1bDEyM2EycHE1', label: 'Instagram' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <style>{`
        .nav-link { position: relative; font-weight: 500; font-size: 0.88rem; color: rgba(40,20,30,0.75); text-decoration: none; transition: color 0.2s; white-space: nowrap; padding: 4px 0; }
        .nav-link:hover { color: var(--color-primary, #ff69b4); }
        .nav-link.active { color: var(--color-primary, #ff69b4); font-weight: 700; }
        .nav-link.active::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; border-radius:2px; background:var(--color-primary,#ff69b4); }
        .mob-link { display:block; padding: 13px 0; font-size: 1.05rem; font-weight: 600; color: rgba(40,20,30,0.8); text-decoration: none; border-bottom: 1px solid rgba(255,192,203,0.2); transition: color 0.2s; }
        .mob-link:hover, .mob-link.active { color: var(--color-primary,#ff69b4); }
        .mob-link:last-of-type { border-bottom: none; }
      `}</style>

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(14px)',
          borderBottom: scrolled ? '1px solid rgba(255,192,203,0.3)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(255,150,180,0.1)' : 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(14px,3vw,24px)', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <motion.img
              src="https://i.imgur.com/WwrdAkS.png"
              alt="KGHS Alumni Foundation Logo"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.2 }}
              style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'contain', border: '3px solid rgba(255,192,203,0.5)', background: '#fff', padding: 2, boxShadow: '0 2px 12px rgba(255,150,180,0.15)' }}
            />
            <span className="text-primary" style={{ fontWeight: 800, fontSize: 'clamp(1rem,2.5vw,1.25rem)', letterSpacing: '-0.01em' }}>
              KGHS Alumni
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 'clamp(14px,2vw,28px)', flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`nav-link${isActive(link.to) ? ' active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: social + auth */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {socialLinks.map((s, i) => (
              <motion.a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                whileHover={{ scale: 1.15 }} transition={{ duration: 0.18 }}
                className="text-primary" style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center' }}>
                <s.icon />
              </motion.a>
            ))}

            {token ? (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
                className="bg-primary text-white"
                style={{ padding: '8px 20px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.02em' }}>
                Logout
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Link to="/login" className="nav-link" style={{ fontSize: '0.88rem' }}>Login</Link>
                <Link to="/signup"
                  style={{ padding: '8px 20px', borderRadius: 999, background: 'var(--color-primary,#ff69b4)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', letterSpacing: '0.02em' }}>
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{ display: 'flex', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexShrink: 0 }}
            className="md:hidden"
          >
            {[0, 1, 2].map(i => (
              <motion.span key={i}
                animate={mobileMenuOpen
                  ? i === 0 ? { rotate: 45, y: 7 }
                  : i === 1 ? { opacity: 0, scaleX: 0 }
                  : { rotate: -45, y: -7 }
                  : { rotate: 0, y: 0, opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.22 }}
                style={{ display: 'block', width: 24, height: 2.5, borderRadius: 99, background: 'var(--color-primary,#ff69b4)', transformOrigin: 'center' }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu — full-screen overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', top: 68, right: 0, bottom: 0, width: 'min(320px, 88vw)',
              zIndex: 999, background: '#fff',
              borderLeft: '1px solid rgba(255,192,203,0.3)',
              boxShadow: '-8px 0 40px rgba(255,150,180,0.12)',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: '20px 24px', flex: 1 }}>
              {token ? (
                <>
                  {navLinks.map(link => (
                    <Link key={link.to} to={link.to} className={`mob-link${isActive(link.to) ? ' active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                  <div style={{ marginTop: 24 }}>
                    <button onClick={handleLogout}
                      className="bg-primary text-white"
                      style={{ width: '100%', padding: '13px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className="mob-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <div style={{ marginTop: 16 }}>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}
                      style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 999, background: 'var(--color-primary,#ff69b4)', color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
                      Join Now
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Social row */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,192,203,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(160,80,100,0.55)', fontWeight: 500 }}>Follow us</p>
              {socialLinks.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="text-primary" style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
                  <s.icon />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop tap-to-close */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(30,10,20,0.25)', backdropFilter: 'blur(2px)', top: 68 }} />
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ height: 68 }} />
    </>
  );
};

export default Navbar;
