import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';

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
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-xl border-b border-primary/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo + Name - Clean, No Circular Border */}
          <Link to="/" className="flex items-center space-x-4">
            <motion.img 
              src="https://i.imgur.com/7ROR0Ka.png" 
              alt="KGHS Alumni Foundation"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain shadow-lg"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
            />
            <div className="text-left">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight block leading-tight">
                KGHS Alumni
              </span>
              <span className="text-base sm:text-lg md:text-xl text-primary/80 font-medium block -mt-1">
                Foundation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {token && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-lg text-textDark font-medium hover:text-primary transition"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center space-x-5">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2 }}
                  className="text-primary hover:text-pink-600 text-2xl"
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
                className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition shadow-lg"
              >
                Logout
              </button>
            ) : (
              <>
                {/* Updated Login Button - Soft Pink Outline */}
                <Link 
                  to="/login" 
                  className="text-lg font-medium text-primary border-2 border-primary px-8 py-3 rounded-full hover:bg-primary hover:text-white transition shadow-md"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-pink-600 transition shadow-lg"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-3xl text-primary"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </motion.nav>

      {/* Full-Screen Mobile Menu - Unchanged (Beautiful as is) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.4 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-white via-primary/5 to-primary/10 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-8 border-b border-primary/20 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://i.imgur.com/7ROR0Ka.png" 
                    alt="KGHS Logo"
                    className="h-16 w-16 object-contain shadow-lg"
                  />
                  <div>
                    <p className="text-2xl font-extrabold text-primary">KGHS Alumni</p>
                
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl text-primary hover:text-pink-600 transition"
                >
                  ✕
                </button>
              </div>

              <nav className="flex-1 px-10 py-12 space-y-8">
                {token ? (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-3xl font-medium text-textDark hover:text-primary transition py-2"
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
                      className="w-full mt-10 bg-primary text-white py-6 rounded-2xl text-2xl font-bold hover:bg-pink-600 transition shadow-2xl"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-3xl font-medium text-textDark hover:text-primary transition py-4"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full bg-primary text-white py-6 rounded-2xl text-2xl font-bold hover:bg-pink-600 transition shadow-2xl text-center"
                    >
                      Join Now
                    </Link>
                  </>
                )}
              </nav>

              <div className="p-10 border-t border-primary/20 text-center">
                <p className="text-lg text-textDark/70 mb-6">Connect with us</p>
                <div className="flex justify-center space-x-10">
                  {socialLinks.map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-pink-600 text-4xl transition"
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
                <p className="text-sm text-textDark/50 mt-8">
                  © {new Date().getFullYear()} KGHS Alumni Foundation
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content padding */}
      <div className="pt-24 lg:pt-28" />
    </>
  );
};

export default Navbar;