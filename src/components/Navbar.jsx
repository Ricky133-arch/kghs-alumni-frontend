import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaEnvelope 
} from 'react-icons/fa';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const navLinks = token ? [
    { to: '/profile', label: 'Profile' },
    { to: '/directory', label: 'Directory' },
    { to: '/events', label: 'Events' },
    { to: '/news', label: 'News' },
    { to: '/forums', label: 'Forums' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/donations', label: 'Donate' },
    ...(role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ] : [];

  const socialLinks = [
    { icon: FaInstagram, href: 'https://www.instagram.com/kghs.alumnae?igsh=OHY1bDEyM2EycHE1', label: 'Instagram' },
  ];

  return (
    <>
      {/* Fixed Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo - Much More Visible on Mobile */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="https://i.imgur.com/7ROR0Ka.png" 
                  alt="KGHS Alumni Foundation Logo"
                  className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-full shadow-2xl border-4 border-primary bg-white p-1 transition-all duration-300"
                />
                {/* Soft pink glow */}
                <div className="absolute inset-0 rounded-full shadow-2xl shadow-primary/30 blur-xl -z-10"></div>
              </motion.div>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-primary">
              KGHS Alumni
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-8">
              {token && navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-textDark font-medium hover:text-primary transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4 border-l border-primary/20 pl-8">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  className="text-primary hover:text-pink-600 transition text-xl"
                  aria-label={social.label}
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>

            {token ? (
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition shadow-md"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-textDark font-medium hover:text-primary transition">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-600 transition shadow-md"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-3xl text-primary focus:outline-none z-60 relative"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </motion.nav>

      {/* NEW: Full-Screen Mobile Menu Overlay - Modern & Beautiful */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col"
            >
              {/* Logo + Close in Header */}
              <div className="p-8 border-b border-primary/10 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://i.imgur.com/7ROR0Ka.png" 
                    alt="KGHS Logo"
                    className="h-14 w-14 rounded-full border-4 border-primary bg-white p-1 shadow-xl"
                  />
                  <span className="text-2xl font-extrabold text-primary">KGHS Alumni</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl text-primary"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-8 py-10 space-y-6">
                {token ? (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-2xl font-medium text-textDark hover:text-primary transition py-3 border-b border-primary/10"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/';
                        setMobileMenuOpen(false);
                      }}
                      className="w-full mt-8 bg-primary text-white py-5 rounded-full text-xl font-bold hover:bg-pink-600 transition shadow-xl"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-2xl font-medium text-textDark hover:text-primary transition py-4"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-primary text-white py-5 rounded-full text-xl font-bold hover:bg-pink-600 transition shadow-xl text-center"
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </div>

              {/* Social Links at Bottom */}
              <div className="p-8 border-t border-primary/10 text-center">
                <p className="text-textDark/70 mb-6 text-lg">Connect with us</p>
                <div className="flex justify-center space-x-8">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-pink-600 transition text-4xl"
                      aria-label={social.label}
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Padding below navbar */}
      <div className="pt-24 md:pt-28" />
    </>
  );
};

export default Navbar;