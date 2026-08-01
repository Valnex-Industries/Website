"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lock scrolling while preloader is active
    document.body.style.overflow = "hidden";
    
    // Loading duration: 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "";
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          exit={{ 
            y: "-100%", 
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[color:var(--brand-ink)] px-6"
        >
          <div className="overflow-hidden mb-12">
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="font-orbitron text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-widest text-center"
            >
              Valnex<br className="md:hidden" /> Industries
            </motion.h1>
          </div>
          
          {/* Sleek loading line */}
          <div className="w-full max-w-[240px] md:max-w-md h-[2px] bg-white/10 relative overflow-hidden rounded-full">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
              className="absolute inset-y-0 left-0 w-1/2 bg-[color:var(--brand-blue-bright)] rounded-full"
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 font-orbitron text-xs md:text-sm font-bold text-[color:var(--brand-blue-bright)] tracking-[0.3em] uppercase"
          >
            System Initializing
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
