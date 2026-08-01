"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { Marquee } from "@/components/Marquee";

/** Headline that scrolls behind (and inside) the video window. */
const MARQUEE_TEXT = "Precision That Powers Progress";
/** Seconds for one full copy of the marquee to pass. */
const MARQUEE_CYCLE_MS = 22000;

/** Scroll choreography: every value below is a fraction of hero progress.
 *  The video only ever grows: it opens from the centre card to full bleed by
 *  EXPAND[1] and stays there. The short tail after that is the closing
 *  statement, then the pin releases into the sections below. */
const EXPAND = [0.05, 0.78] as const; // video grows from card to full bleed
const COPY_OUT = [0, 0.2] as const; // corner statements fade away
const PAYOFF_IN = [0.8, 0.95] as const; // closing statement fades in

function useViewport() {
  const [size, setSize] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const update = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}

export function HeroScroll() {
  const containerRef = useRef<HTMLElement>(null);
  const { w, h } = useViewport();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* ── The resting video window: a centred portrait card, same proportions as
        the reference design (3:4, ~26vw wide, clamped for small screens). ── */
  const cardW = Math.min(Math.max(w * 0.26, 220), 360);
  const cardH = Math.min(cardW * (4 / 3), h * 0.58);
  const insetX = Math.max((w - cardW) / 2, 0);
  const insetY = Math.max((h - cardH) / 2, 0);

  /* The video layer is always full screen; only its clip changes. That is what
     keeps the outline marquee inside it locked to the filled marquee behind. */
  const clipPath = useTransform(
    scrollYProgress,
    [EXPAND[0], EXPAND[1], 1],
    [`inset(${insetY}px ${insetX}px)`, "inset(0px 0px)", "inset(0px 0px)"],
    { clamp: true }
  );

  /* Premium background shift: brand blue → deep navy → ink. */
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["#0047e1", "#0a2472", "#02102e"],
    { clamp: true }
  );
  /* Settles on 0.07, the value every section below uses, so the grid reads as
     one continuous drawing from the hero all the way to the footer. */
  const gridOpacity = useTransform(scrollYProgress, [0, 1], [0.12, 0.07], { clamp: true });
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [0.25, 0.8], { clamp: true });

  /* No counter-zoom on the footage itself: the frame opens up, the picture
     inside it never scales, so nothing reads as shrinking back. */
  const scrimOpacity = useTransform(
    scrollYProgress,
    [EXPAND[1], 0.95, 1],
    [0, 0.4, 0.4],
    { clamp: true }
  );

  /* Corner copy + scroll cue retreat as the window opens. */
  const copyOpacity = useTransform(scrollYProgress, [...COPY_OUT], [1, 0], { clamp: true });
  const copyLeftX = useTransform(scrollYProgress, [...COPY_OUT], [0, -60], { clamp: true });
  const copyRightX = useTransform(scrollYProgress, [...COPY_OUT], [0, 60], { clamp: true });
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0], { clamp: true });

  /* Closing statement, revealed once the video owns the viewport. */
  const payoffOpacity = useTransform(scrollYProgress, [...PAYOFF_IN], [0, 1], { clamp: true });
  const payoffY = useTransform(scrollYProgress, [...PAYOFF_IN], [40, 0], { clamp: true });

  /* One shared driver keeps both marquee tracks perfectly in phase. */
  const marqueeProgress = useMotionValue(0);
  useAnimationFrame((t) => {
    marqueeProgress.set((t % MARQUEE_CYCLE_MS) / MARQUEE_CYCLE_MS);
  });

  const marqueeType =
    "display-type text-[clamp(72px,16vw,240px)] items-center";

  /* Fade out marquee as video expands. Reaches 0 opacity around 80% of the expansion */
  const marqueeOpacity = useTransform(
    scrollYProgress,
    [0, EXPAND[1] * 0.8, 1],
    [1, 0, 0],
    { clamp: true }
  );

  return (
    <section ref={containerRef} id="top" className="relative h-[200vh] w-full">
      <motion.div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ backgroundColor }}
      >
        {/* Layer 1: blueprint grid */}
        <motion.div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 z-[1]"
          style={{ opacity: gridOpacity }}
        />

        {/* Layer 1b: vignette for depth */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(120% 90% at 50% 45%, transparent 35%, rgba(1,8,28,0.85) 100%)",
          }}
        />

        {/* Layer 2: filled marquee, sits behind the video window */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[3] flex items-center"
          style={{ opacity: marqueeOpacity }}
        >
          <Marquee
            text={MARQUEE_TEXT}
            progress={marqueeProgress}
            className={`${marqueeType} text-white`}
          />
        </motion.div>

        {/* Layer 3: corner statements */}
        <motion.div
          className="pointer-events-none absolute left-[clamp(24px,4vw,64px)] top-[clamp(96px,13vh,150px)] z-[4]"
          style={{ opacity: copyOpacity, x: copyLeftX }}
        >
          <p className="text-[clamp(1.3rem,2.6vw,2.2rem)] font-light italic leading-tight text-white/90">
            Creating new value
          </p>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute bottom-[clamp(72px,11vh,120px)] right-[clamp(24px,4vw,64px)] z-[4] max-w-[clamp(200px,30vw,420px)] text-right"
          style={{ opacity: copyOpacity, x: copyRightX }}
        >
          <p className="text-[clamp(1rem,2vw,1.8rem)] font-light italic leading-tight text-white/90">
            with the
            <br />
            &ldquo;power to respond&rdquo;
          </p>
          <p className="mt-3 text-[clamp(0.55rem,0.78vw,0.72rem)] font-light tracking-[0.06em] text-white/50">
            A dependable response, your engineering solutions partner.
          </p>
        </motion.div>

        {/* Layer 4: the video, clipped from centre card to full bleed */}
        <motion.div
          className="absolute inset-0 z-[6] overflow-hidden"
          style={{ clipPath }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src="/videos/movie.mp4"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Darkening scrim once the video owns the screen */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[#02102e]"
            style={{ opacity: scrimOpacity }}
          />

          {/* Outline marquee, identical geometry to the filled track behind,
              so the letters read as one continuous line through the window. */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center"
            style={{ opacity: marqueeOpacity }}
          >
            <Marquee
              text={MARQUEE_TEXT}
              progress={marqueeProgress}
              outline
              className={marqueeType}
            />
          </motion.div>
        </motion.div>

        {/* Layer 5: closing statement over the full-bleed video */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[7] flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: payoffOpacity, y: payoffY }}
        >
          <span className="eyebrow text-white/60">Valnex Industries</span>
          <h1 className="mt-4 max-w-4xl text-[clamp(2rem,5.4vw,4.5rem)] font-black leading-[0.95] tracking-tight text-white">
            Engineered for the lines
            <br />
            that cannot stop.
          </h1>
          <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-white/70 md:text-base">
            Advanced chillers, flake cutters, hopper loaders, laser marking machines, volumetric feeders, mould temperature controllers, and dehumidifiers engineered for the
            world&apos;s most demanding production lines.
          </p>
        </motion.div>

        {/* Layer 6: opening scroll cue */}
        <motion.div
          className="pointer-events-none absolute bottom-[clamp(24px,4vh,44px)] left-[clamp(24px,4vw,64px)] z-[8] flex items-center gap-3"
          style={{ opacity: cueOpacity }}
        >
          <span className="relative block h-9 w-px overflow-hidden bg-white/25">
            <motion.span
              className="absolute inset-x-0 top-0 block h-3 bg-white"
              animate={{ y: ["-100%", "300%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          <span className="eyebrow text-white/55">Scroll more</span>
        </motion.div>

        {/* Layer 7, the hand-off cue: the pin is about to release */}
        <motion.div
          className="pointer-events-none absolute bottom-[clamp(24px,4vh,44px)] left-1/2 z-[8] flex -translate-x-1/2 flex-col items-center gap-2 whitespace-nowrap"
          style={{ opacity: payoffOpacity }}
        >
          <span className="eyebrow text-white/45">Keep scrolling</span>
          <motion.span
            className="block h-4 w-px bg-white/40"
            animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
