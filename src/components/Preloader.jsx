import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Minimum display time for polish (prevents instant flash on fast connections)
    const minTimer = setTimeout(() => {
      setIsReady(true);
    }, 1200); // ← You can keep this or increase it, but main.jsx controls the real minimum

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
      transition={{
        duration: 2.2,              // ← Main premium fade-out duration (2.2 seconds)
        ease: [0.25, 0.1, 0.25, 1], // ← Custom cubic-bezier: very smooth start & end
      }}
      style={{ pointerEvents: isReady ? 'none' : 'auto' }}
      onAnimationComplete={() => {
        if (isReady) {
          document.body.style.overflow = ''; // Clean up if you locked scroll
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="text-center text-white"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-wider drop-shadow-2xl mb-4">
          KGHS
        </h1>
        <p className="text-2xl md:text-3xl font-light opacity-90">
          Alumni Foundation
        </p>

        {/* Elegant pulsing loader */}
        <div className="mt-10 flex justify-center gap-5">
          {[0, 0.25, 0.5].map((delay) => (
            <motion.div
              key={delay}
              className="w-6 h-6 bg-white rounded-full shadow-lg"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay,
                ease: [0.4, 0, 0.6, 1], // softer pulsing
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}