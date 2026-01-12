import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence } from 'framer-motion';  // ← Import this!
import App from './App.jsx';
import './index.css';
import Preloader from './components/Preloader.jsx';

const Root = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const minTimer = setTimeout(() => {
      setShowLoader(false);
    }, 6000); // 6 seconds minimum hold

    const handleLoad = () => {
      setTimeout(() => setShowLoader(false), 1200); // extra buffer
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(minTimer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">  {/* ← Crucial for exit animation */}
      {showLoader && <Preloader key="preloader" />}
      {!showLoader && <App key="app" />}
    </AnimatePresence>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);