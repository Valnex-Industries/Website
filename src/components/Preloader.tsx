"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock scrolling while preloader is active
    document.body.style.overflow = "hidden";
    
    // Animate from 0 to 100 over 1.8 seconds
    const controls = animate(0, 100, { 
      duration: 1.8, 
      ease: "easeOut",
      onUpdate: (value) => {
        setProgress(Math.round(value));
      }
    });
    
    // Loading duration: 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "";
    }, 2000);

    return () => {
      controls.stop();
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
            transition={{ delay: 0.2 }}
            className="mt-6 font-orbitron text-sm md:text-base font-bold text-[color:var(--brand-blue-bright)] tracking-widest"
          >
            {progress}%
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
