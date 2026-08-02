"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
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
/* The corner statements do not animate at all. They stay pinned where they are
   and the opening video window (z-6, above their z-4) simply grows over them. */
const PAYOFF_IN = [0.8, 0.95] as const; // closing statement fades in

export function HeroScroll() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* 1 = resting window, 0 = full bleed. The resting shape itself lives in CSS
     (`.hero-window` in globals.css) as a pair of inset custom properties, so it
     is never derived from a measured viewport: measuring it in JS meant one bad
     reading clipped the video away entirely. Scrolling only scales those insets
     towards zero, which on phones reads as the band growing in height. */
  const openness = useTransform(
    scrollYProgress,
    [EXPAND[0], EXPAND[1]],
    [1, 0],
    { clamp: true }
  );

  /* The video layer is always full screen; only its clip changes. That is what
     keeps the outline marquee inside it locked to the filled marquee behind. */
  const clipPath = useMotionTemplate`inset(calc(var(--hero-inset-y) * ${openness}) calc(var(--hero-inset-x) * ${openness}))`;

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
  const cueOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0], { clamp: true });

  /* Closing statement, revealed once the video owns the viewport. */
  const payoffOpacity = useTransform(scrollYProgress, [...PAYOFF_IN], [0, 1], { clamp: true });
  const payoffY = useTransform(scrollYProgress, [...PAYOFF_IN], [40, 0], { clamp: true });

  /* One shared driver keeps both marquee tracks perfectly in phase. */
  const marqueeProgress = useMotionValue(0);
  useAnimationFrame((t) => {
    marqueeProgress.set((t % MARQUEE_CYCLE_MS) / MARQUEE_CYCLE_MS);
  });

  /* Stepped rather than one clamp. Phones need roughly 24vw to read as the
     wall of type the design is built on — a desktop-tuned rule merely clamped
     down leaves the headline floating in empty blue. */
  const marqueeType =
    "display-type items-center text-[clamp(3rem,24vw,9rem)] sm:text-[clamp(6rem,18vw,11rem)] lg:text-[clamp(8rem,16vw,15rem)]";

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

        {/* Layer 3: corner statements. Static — the video window swallows them
            as it opens, which is the whole point of it being the layer above. */}
        <div className="pointer-events-none absolute left-[clamp(20px,4vw,64px)] top-[clamp(72px,10vh,150px)] z-[4] max-w-[86vw] sm:max-w-[70vw]">
          <p className="text-[clamp(1.9rem,12vw,2.75rem)] font-light italic leading-[1.05] text-white/90 sm:text-[clamp(1.75rem,4.4vw,2.2rem)] sm:leading-tight">
            Creating new value
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-[clamp(56px,9vh,120px)] right-[clamp(20px,4vw,64px)] z-[4] max-w-[88vw] text-right sm:max-w-[min(60vw,420px)]">
          <p className="text-[clamp(1.75rem,11vw,2.5rem)] font-light italic leading-[1.05] text-white/90 sm:text-[clamp(1.4rem,3.4vw,1.8rem)] sm:leading-tight">
            with the
            <br />
            &ldquo;power to respond&rdquo;
          </p>
          <p className="mt-3 text-[clamp(0.72rem,3.4vw,0.9rem)] font-light leading-relaxed tracking-[0.06em] text-white/50 sm:text-[clamp(0.6rem,1.7vw,0.72rem)]">
            A dependable response, your engineering solutions partner.
          </p>
        </div>

        {/* Layer 4: the video, clipped from centre card to full bleed */}
        <motion.div
          className="hero-window absolute inset-0 z-[6] overflow-hidden"
          style={{ clipPath }}
        >
          {/* Brave's shields, iOS Low Power Mode and data-saver modes all
              refuse autoplay. Without a poster the window opens onto a blank
              rectangle in those cases. */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/hero_bg.png"
            src="/videos/movie.mp4"
            aria-hidden="true"
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
          <h1 className="mt-4 max-w-4xl text-[clamp(1.65rem,5.4vw,4.5rem)] font-black leading-[1.02] tracking-tight text-white sm:leading-[0.95]">
            Engineered for the lines
            <br className="hidden sm:block" />{" "}
            that cannot stop.
          </h1>
          <p className="mt-5 max-w-xl text-[13px] font-light leading-relaxed text-white/70 sm:mt-6 sm:text-sm md:text-base">
            Advanced chillers, flake cutters, hopper loaders, laser marking machines, volumetric feeders, mould temperature controllers, and dehumidifiers engineered for the
            world&apos;s most demanding production lines.
          </p>
        </motion.div>

        {/* Layer 6: opening scroll cue */}
        <motion.div
          className="pointer-events-none absolute bottom-[clamp(20px,4vh,44px)] left-[clamp(20px,4vw,64px)] z-[8] flex items-center gap-3"
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
          className="pointer-events-none absolute bottom-[clamp(20px,4vh,44px)] left-1/2 z-[8] flex -translate-x-1/2 flex-col items-center gap-2 whitespace-nowrap"
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
