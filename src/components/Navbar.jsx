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
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          {/* Logo - Enhanced Visibility & Clarity */}
          <Link to="/" className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <img 
                src="https://i.imgur.com/7ROR0Ka.png" 
                alt="KGHS Alumni Foundation Logo"
                className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 object-contain rounded-full bg-white p-3 shadow-2xl border-4 border-primary/40 transition-all duration-300"
              />
              {/* Subtle pink glow on hover */}
              <div className="absolute inset-0 rounded-full shadow-2xl shadow-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </motion.div>
            <span className="text-2xl md:text-3xl font-extrabold text-primary hover:text-pink-600 transition">
              KGHS Alumni
            </span>
          </Link>

          {/* Desktop Menu + Social Icons */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              {token ? (
                navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-textDark font-medium hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                ))
              ) : null}
            </div>

            {/* Social Icons - Subtle & Integrated */}
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

            {/* Auth Buttons */}
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
            className="md:hidden text-3xl text-primary focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="md:hidden bg-white/95 backdrop-blur-lg shadow-2xl border-t border-primary/20"
            >
              <div className="px-6 py-8 space-y-6 text-center">
                {token ? (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-xl text-textDark font-medium hover:text-primary transition py-3"
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
                      className="w-full bg-primary text-white py-4 rounded-full text-xl font-semibold hover:bg-pink-600 transition shadow-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xl text-textDark font-medium hover:text-primary transition py-3"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-primary text-white py-4 rounded-full text-xl font-semibold hover:bg-pink-600 transition shadow-lg"
                    >
                      Join Now
                    </Link>
                  </>
                )}

                {/* Social Icons in Mobile Menu */}
                <div className="pt-8 border-t border-primary/20">
                  <p className="text-textDark/60 mb-4">Connect with us</p>
                  <div className="flex justify-center space-x-6">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-pink-600 transition text-3xl"
                        aria-label={social.label}
                      >
                        <social.icon />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Padding below navbar */}
      <div className="pt-20 md:pt-24" />
    </>
  );
};

export default Navbar;