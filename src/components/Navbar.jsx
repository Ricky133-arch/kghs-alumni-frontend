import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';

// ─── Nav links config ─────────────────────────────────────────────────
const getNavLinks = (role) => [
  { to: '/profile',   label: 'Profile' },
  { to: '/directory', label: 'Directory' },
  { to: '/events',    label: 'Events' },
  { to: '/news',      label: 'News' },
  { to: '/forums',    label: 'Forums' },
  { to: '/gallery',   label: 'Gallery' },
  { to: '/donations', label: 'Donate' },
  ...(role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
];

const socialLinks = [
  { icon: FaInstagram, href: 'https://www.instagram.com/kghs.alumnae?igsh=OHY1bDEyM2EycHE1', label: 'Instagram' },
];

// ─── Active link dot ──────────────────────────────────────────────────
const NavLink = ({ to, label, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link${active ? ' nav-link-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
      {active && (
        <motion.span
          className="nav-link-dot"
          layoutId="nav-dot"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
    </Link>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  const navLinks = getNavLinks(role);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    localStorage.clear();
    setOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      <style>{styles}</style>

      <header ref={menuRef} className={`nav-header${scrolled ? ' nav-header-scrolled' : ''}`} role="banner">
        <nav className="nav-inner" aria-label="Main navigation">

          {/* ── Logo ── */}
          <Link to="/" className="nav-logo" aria-label="KGHS Alumni Home">
            <motion.div className="nav-logo-img-wrap" whileHover={{ scale: 1.06 }} transition={{ duration: 0.18 }}>
              <img
                src="https://i.imgur.com/WwrdAkS.png"
                alt="KGHS Alumni Foundation"
                className="nav-logo-img"
                width={52}
                height={52}
                loading="eager"
              />
            </motion.div>
            <div className="nav-logo-text">
              <span className="nav-logo-name">KGHS Alumni</span>
              <span className="nav-logo-sub">Foundation</span>
            </div>
          </Link>

          {/* ── Desktop links ── */}
          {token && (
            <div className="nav-links" role="list">
              {navLinks.map((link) => (
                <div key={link.to} role="listitem">
                  <NavLink to={link.to} label={link.label} />
                </div>
              ))}
            </div>
          )}

          {/* ── Desktop right cluster ── */}
          <div className="nav-right">
            {/* Social */}
            <div className="nav-socials">
              {socialLinks.map((s) => (
                <motion.a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-social-icon"
                  aria-label={s.label}
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 0.16 }}
                >
                  <s.icon aria-hidden="true" />
                </motion.a>
              ))}
            </div>

            {/* Auth */}
            {token ? (
              <button className="nav-btn nav-btn-outline" onClick={handleLogout} type="button">
                Log out
              </button>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="nav-link">Log in</Link>
                <Link to="/signup" className="nav-btn nav-btn-filled">Join Now</Link>
              </div>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className={`nav-hamburger${open ? ' nav-hamburger-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              type="button"
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {open && (
            <>
              {/* Scrim */}
              <motion.div
                className="nav-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer panel */}
              <motion.div
                id="mobile-menu"
                className="nav-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 36 }}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
              >
                {/* Drawer header */}
                <div className="nav-drawer-head">
                  <span className="nav-drawer-logo-text">KGHS Alumni</span>
                  <button
                    className="nav-drawer-close"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Drawer links */}
                <div className="nav-drawer-body">
                  {token ? (
                    <>
                      <nav aria-label="Mobile navigation">
                        {navLinks.map((link, i) => (
                          <motion.div
                            key={link.to}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 + 0.08 }}
                          >
                            <NavLink to={link.to} label={link.label} onClick={() => setOpen(false)} />
                          </motion.div>
                        ))}
                      </nav>
                      <div className="nav-drawer-footer">
                        <button className="nav-btn nav-btn-filled nav-btn-full" onClick={handleLogout} type="button">
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="nav-drawer-auth">
                      <Link to="/login"  className="nav-btn nav-btn-outline nav-btn-full" onClick={() => setOpen(false)}>Log in</Link>
                      <Link to="/signup" className="nav-btn nav-btn-filled nav-btn-full" onClick={() => setOpen(false)}>Join Now</Link>
                    </div>
                  )}

                  {/* Social */}
                  <div className="nav-drawer-social">
                    <p className="nav-drawer-social-label">Connect with us</p>
                    <div className="nav-drawer-social-icons">
                      {socialLinks.map((s) => (
                        <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                           className="nav-social-icon nav-social-icon-lg" aria-label={s.label}>
                          <s.icon aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="nav-spacer" aria-hidden="true" />
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --rose:        #E8547A;
    --rose-light:  #F9C6D3;
    --rose-pale:   #FDF1F4;
    --ink:         #2A1A22;
    --ink-mid:     #6B4558;
    --ink-soft:    #A07090;
    --white:       #FFFFFF;
    --nav-h:       68px;
  }

  /* ── Header shell ── */
  .nav-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(255,250,249,0.92);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    border-bottom: 1px solid transparent;
    transition: border-color 0.25s, box-shadow 0.25s;
  }
  .nav-header-scrolled {
    border-color: var(--rose-light);
    box-shadow: 0 2px 20px rgba(232,84,122,0.10);
  }

  /* ── Inner row ── */
  .nav-inner {
    max-width: 1280px; margin: 0 auto;
    height: var(--nav-h);
    padding: 0 20px;
    display: flex; align-items: center; gap: 0;
  }

  /* ── Logo ── */
  .nav-logo {
    display: flex; align-items: center; gap: 11px;
    text-decoration: none; flex-shrink: 0; margin-right: 32px;
  }
  .nav-logo-img-wrap {
    width: 44px; height: 44px; border-radius: 50%;
    border: 2px solid var(--rose-light);
    box-shadow: 0 2px 12px rgba(232,84,122,0.18);
    overflow: hidden; flex-shrink: 0;
    background: var(--white);
  }
  .nav-logo-img { width: 44px; height: 44px; object-fit: contain; display: block; }
  .nav-logo-text { display: flex; flex-direction: column; line-height: 1.15; }
  .nav-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem; font-weight: 600; color: var(--rose);
    white-space: nowrap;
  }
  .nav-logo-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.65rem; font-weight: 400; color: var(--ink-soft);
    letter-spacing: 0.09em; text-transform: uppercase;
  }

  /* ── Desktop nav links ── */
  .nav-links {
    display: none; align-items: center; gap: 4px; flex: 1;
  }
  @media (min-width: 900px) { .nav-links { display: flex; } }

  .nav-link {
    position: relative;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem; font-weight: 500; color: var(--ink-mid);
    text-decoration: none; padding: 6px 10px; border-radius: 8px;
    transition: color 0.18s, background 0.18s;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
  }
  .nav-link:hover { color: var(--rose); background: var(--rose-pale); }
  .nav-link-active { color: var(--rose); }
  .nav-link-dot {
    position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px; border-radius: 50%; background: var(--rose);
  }

  /* Mobile nav-link (drawer) */
  .nav-drawer .nav-link {
    display: flex; flex-direction: row; align-items: center; justify-content: space-between;
    font-size: 1.05rem; padding: 14px 0; border-radius: 0;
    border-bottom: 1px solid var(--rose-pale); color: var(--ink);
  }
  .nav-drawer .nav-link:hover { background: transparent; color: var(--rose); }
  .nav-drawer .nav-link-active { color: var(--rose); }
  .nav-drawer .nav-link-dot {
    position: static; transform: none; flex-shrink: 0;
    width: 6px; height: 6px;
  }

  /* ── Right cluster ── */
  .nav-right {
    display: flex; align-items: center; gap: 16px; margin-left: auto;
  }
  .nav-socials { display: none; align-items: center; gap: 12px; }
  @media (min-width: 900px) { .nav-socials { display: flex; } }
  .nav-social-icon {
    color: var(--rose); font-size: 1.1rem; text-decoration: none;
    display: flex; align-items: center; transition: color 0.18s;
  }
  .nav-social-icon:hover { color: #c03060; }
  .nav-social-icon-lg { font-size: 1.5rem; }

  .nav-auth { display: none; align-items: center; gap: 12px; }
  @media (min-width: 900px) { .nav-auth { display: flex; } }

  /* Buttons */
  .nav-btn {
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
    border-radius: 100px; padding: 9px 20px; cursor: pointer;
    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s; border: none; white-space: nowrap;
  }
  .nav-btn-filled {
    background: var(--rose); color: var(--white);
    box-shadow: 0 2px 12px rgba(232,84,122,0.30);
  }
  .nav-btn-filled:hover { background: #d43f6a; box-shadow: 0 4px 20px rgba(232,84,122,0.40); }
  .nav-btn-outline {
    background: transparent; color: var(--rose);
    border: 1.5px solid var(--rose-light);
    box-sizing: border-box;
  }
  .nav-btn-outline:hover { background: var(--rose-pale); }
  .nav-btn-full { width: 100%; }

  /* Logout — desktop only */
  .nav-header > nav .nav-btn-outline { display: none; }
  @media (min-width: 900px) { .nav-header > nav .nav-btn-outline { display: inline-flex; } }

  /* ── Hamburger ── */
  .nav-hamburger {
    display: flex; flex-direction: column; justify-content: center;
    gap: 5px; width: 36px; height: 36px; padding: 6px;
    background: none; border: none; cursor: pointer; border-radius: 8px;
    transition: background 0.15s;
  }
  @media (min-width: 900px) { .nav-hamburger { display: none; } }
  .nav-hamburger:hover { background: var(--rose-pale); }
  .nav-hamburger span {
    display: block; height: 2px; background: var(--rose);
    border-radius: 2px; transform-origin: center;
    transition: transform 0.22s, opacity 0.22s, width 0.22s;
  }
  .nav-hamburger span:nth-child(1) { width: 22px; }
  .nav-hamburger span:nth-child(2) { width: 16px; }
  .nav-hamburger span:nth-child(3) { width: 22px; }
  .nav-hamburger-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); width: 22px; }
  .nav-hamburger-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-hamburger-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); width: 22px; }

  /* ── Scrim ── */
  .nav-scrim {
    position: fixed; inset: 0; z-index: 150;
    background: rgba(42,26,34,0.35);
    backdrop-filter: blur(2px);
  }

  /* ── Drawer ── */
  .nav-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 160;
    width: min(88vw, 340px);
    background: var(--white);
    display: flex; flex-direction: column;
    box-shadow: -8px 0 48px rgba(42,26,34,0.18);
  }
  .nav-drawer-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--rose-pale);
    flex-shrink: 0;
  }
  .nav-drawer-logo-text {
    font-family: 'Playfair Display', serif; font-size: 1.1rem;
    font-weight: 600; color: var(--rose);
  }
  .nav-drawer-close {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--rose-pale); border: none; cursor: pointer;
    color: var(--rose); display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .nav-drawer-close:hover { background: var(--rose-light); }

  .nav-drawer-body {
    flex: 1; overflow-y: auto;
    padding: 8px 24px 32px;
    display: flex; flex-direction: column;
  }
  .nav-drawer-footer { margin-top: 24px; }
  .nav-drawer-auth { display: flex; flex-direction: column; gap: 12px; padding-top: 24px; }
  .nav-drawer-social { margin-top: auto; padding-top: 32px; text-align: center; }
  .nav-drawer-social-label { font-size: 0.75rem; color: var(--ink-soft); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
  .nav-drawer-social-icons { display: flex; justify-content: center; gap: 16px; }

  /* ── Spacer ── */
  .nav-spacer { height: var(--nav-h); }
`;

export default Navbar;
