import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Preloader from './components/Preloader.jsx'; // ← Import the preloader

const Root = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Minimum loading time for polish (prevents flash on fast connections)
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1800); // 1.8 seconds – feels luxurious but not too long

    // Also hide when everything is fully loaded (images, etc.)
    const handleLoad = () => {
      setTimeout(() => setShowLoader(false), 400);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <>
      {showLoader && <Preloader />}
      <App />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);