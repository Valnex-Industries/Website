"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, animate } from "framer-motion";
import LogoAnimation from "@/components/LogoAnimation";

/**
 * The intro runs only on a full load of the home page, once per browser
 * session, and never for reduced-motion visitors.
 *
 * It is a fixed timer, not a measure of loading: the page behind it is ready
 * in about a second. At 4.6s plus a 0.8s exit on every route it was the
 * slowest thing about a first visit, and it stood between a Google visitor
 * and the product page they had clicked on. The timings below keep the full
 * draw-and-fill of the mark at a pace that reads as a brand moment rather
 * than a wait.
 */
const INTRO_PATH = "/";
/** One full draw-and-fill of the mark. */
const LOGO_SECONDS = 1.6;
/** When the overlay starts to lift: the fill finishes at 76% of the logo
 *  cycle (~1.2s) and the settle pulse by 90% (~1.45s). */
const HOLD_MS = 1700;
const SESSION_KEY = "vx-intro";

/* Runs while the HTML is still being parsed, before the first paint, so a
   skipped intro is hidden by CSS (`html[data-intro="skip"] .vx-preloader` in
   globals.css) instead of flashing up until React hydrates. Recording the
   visit here rather than after the intro means a refresh part-way through
   also skips it. */
const SKIP_SCRIPT = `try{var d=document.documentElement;if(sessionStorage.getItem("${SESSION_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="skip"}else{sessionStorage.setItem("${SESSION_KEY}","1")}}catch(e){}`;

export function Preloader() {
  const pathname = usePathname();
  /* Decided once, on the first render: the layout persists across client-side
     navigation, so a later click through to "/" must not replay the intro. */
  const [isLoading, setIsLoading] = useState(() => pathname === INTRO_PATH);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    /* Already hidden by CSS before the first paint; just unmount it. */
    if (document.documentElement.dataset.intro === "skip") {
      const timer = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(timer);
    }

    // Lock scrolling while preloader is active
    document.body.style.overflow = "hidden";

    // Animate 0→100 over the logo duration
    const controls = animate(0, 100, {
      duration: LOGO_SECONDS - 0.1,
      ease: "easeOut",
      onUpdate: (value) => setProgress(Math.round(value)),
    });

    const timer = setTimeout(() => setIsLoading(false), HOLD_MS);

    return () => {
      controls.stop();
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        /* The guide's pattern for an inline script in a Client Component:
           executable in the server HTML, inert text on the client, so React
           neither re-runs it nor warns about rendering a <script>. */
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: SKIP_SCRIPT }}
        />
      )}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            exit={{
              y: "-100%",
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
            }}
            className="vx-preloader fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B32C4] overflow-hidden"
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
                  duration={LOGO_SECONDS}
                  loop={false}
                  showHint={false}
                  size="100%"
                />
              </div>

              {/* Valnex over Industries, stacked */}
              {/* A <p>, not an <h1>: as a heading it gave the page a second H1
                  ahead of its real one. */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
                className="mt-7 font-orbitron text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-[1.25] text-white uppercase tracking-[0.2em] text-center sm:mt-9"
              >
                Valnex
                <br />
                Industries
              </motion.p>

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
    </>
  );
}
