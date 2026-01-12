import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Preloader from './components/Preloader.jsx';

const Root = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Minimum loading time - set to 6 seconds for a more deliberate, luxurious entrance
    const minTimer = setTimeout(() => {
      setShowLoader(false);
    }, 6000); // ← 6 seconds

    // Also hide when page is fully loaded (images, fonts, etc.) - with extra buffer
    const handleLoad = () => {
      setTimeout(() => setShowLoader(false), 1000); // extra 1s after full load
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