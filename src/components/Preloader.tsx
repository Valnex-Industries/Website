"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import LogoAnimation from "@/components/LogoAnimation";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock scrolling while preloader is active
    document.body.style.overflow = "hidden";

    // Animate 0→100 over the logo duration
    const controls = animate(0, 100, {
      duration: 4.2,
      ease: "easeOut",
      onUpdate: (value) => setProgress(Math.round(value)),
    });

    // Match the logo animation duration (4.4s) + a small buffer
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = "";
    }, 4600);

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
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B32C4] overflow-hidden"
        >
          {/* One column in normal flow: mark, gap, wordmark, counter, bar.
              The logo used to be an inset-0 overlay with a 260px spacer under
              it, which meant the gap was guesswork and the text overlapped the
              mark on short screens. Stacking them makes the spacing real. */}
          <div className="flex flex-col items-center pointer-events-none">
            <div className="w-[min(56vw,240px)] aspect-[1.1/1]">
              <LogoAnimation
                logoColor="#F6F7F9"
                background="#0B32C4"
                duration={4.4}
                loop={false}
                showHint={false}
                size="100%"
              />
            </div>

            {/* Valnex over Industries, stacked */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
              className="mt-7 font-orbitron text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-[1.25] text-white uppercase tracking-[0.2em] text-center sm:mt-9"
            >
              Valnex
              <br />
              Industries
            </motion.h1>

            {/* Progress counter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-5 font-orbitron text-sm md:text-base font-bold text-white/60 tracking-widest"
            >
              {progress}%
            </motion.p>

            {/* Sleek loading line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 w-[min(60vw,240px)] md:w-[280px] h-[2px] bg-white/10 relative overflow-hidden rounded-full"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                className="absolute inset-y-0 left-0 w-1/2 bg-white/50 rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
