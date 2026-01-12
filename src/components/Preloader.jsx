import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Minimum display time for polish (prevents instant flash on fast connections)
    const minTimer = setTimeout(() => {
      setIsReady(true);
    }, 1200); // ~1.2 seconds – adjust as needed

    // Also wait for window fully loaded (images, etc.)
    const handleLoad = () => {
      setTimeout(() => setIsReady(true), 300);
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
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary"
      initial={{ opacity: 1 }}
      animate={{ opacity: isReady ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      style={{ pointerEvents: isReady ? 'none' : 'auto' }}
      onAnimationComplete={() => {
        if (isReady) {
          // Optional: Clean up any overflow hidden if you added it
          document.body.style.overflow = '';
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="text-center text-white"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider drop-shadow-2xl mb-4">
          KGHS
        </h1>
        <p className="text-2xl md:text-3xl font-light opacity-90">
          Alumni Foundation
        </p>

        {/* Simple elegant pulsing loader */}
        <div className="mt-10 flex justify-center gap-4">
          {[0, 0.2, 0.4].map((delay) => (
            <motion.div
              key={delay}
              className="w-5 h-5 bg-white rounded-full"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}