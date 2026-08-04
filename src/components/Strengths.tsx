"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { PRODUCTS } from "@/lib/products";
import { cn } from "@/utils/cn";

/**
 * Every line here is already published elsewhere on this site — the first two
 * come from the company profile, the last from the inquiry band. Nothing is
 * asserted that was not already vetted, and the product count is derived rather
 * than typed so it cannot go stale. Replace with the real strengths once the
 * company documents land; do not invent a fifth.
 */
const CARDS = [
  {
    n: "01",
    title: "Thermal, materials and automation under one roof",
    body: "Chillers, feeders and the automation around them are engineered by the same people, in the same building.",
    image: "/assets/division_energy.png",
  },
  {
    n: "02",
    title: "Validated before it reaches your line",
    body: "Every system is proven against its duty cycle here, so the first time it runs is not the first time it has run.",
    image: "/assets/division_materials.png",
  },
  {
    n: "03",
    title: `${PRODUCTS.length} lines of production equipment`,
    body: "Chillers, flake cutters, hopper loaders, laser marking, volumetric feeders, mould temperature controllers and dehumidifiers.",
    image: "/assets/division_robotics.png",
  },
  {
    n: "04",
    title: "An engineer reads every inquiry",
    body: "Send a drawing, a duty cycle, or just the problem. It reaches a person who can answer it, not a queue.",
    image: "/assets/hero_bg.png",
  },
] as const;

/**
 * The one white section on a site that is otherwise blue, placed straight after
 * the product grid: the range, then what sits behind it.
 *
 * The backdrop pins while four cards travel over it, blurring and dimming as the
 * first one arrives so the cards never compete with the type behind them. The
 * sketches are deliberately cropped by the section edges — evidence that the
 * equipment is drawn before it is built, not illustrations to be read. Their own
 * backgrounds are white, which is why they dissolve into the section instead of
 * sitting on it as rectangles.
 */
export function Strengths() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Blur and nothing else — no scale, no dimming. It begins the moment the
     section starts moving under the pin and drives the sketches only; the type
     stays crisp throughout. */
  const blurPx = useTransform(scrollYProgress, [0, 0.12], [0, 6]);
  const backdropFilter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <section id="strengths" ref={sectionRef} className="relative bg-white">
      {/* The pinned layer. `filter` is applied to the child rather than to this
          element: a filter on an ancestor creates a containing block, which
          would kill the sticky positioning outright. */}
      <div className="sticky top-0 z-0 h-svh overflow-hidden">
        {/* Only the drawings are blurred. `filter` sits on this layer rather
            than on the sticky element above it: a filter on an ancestor creates
            a containing block, which would kill the sticky positioning. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={reduceMotion ? undefined : { filter: backdropFilter }}
        >
          {/* Two treatments, because a corner needs width to read as a corner.
              Below md the sheets are full-bleed bands across the top and bottom
              with the type in the clear middle; from md up they retreat into
              opposite corners.
              Four size bands, because a tablet is two different shapes. md
              (768–1023) is a tablet held upright and runs the sheets at 2x; lg
              (1024–1279) is the same tablet turned on its side and runs 1.5x; xl
              is the desktop size. Width alone separates them — a landscape
              tablet is never below 1024 and a desktop is rarely below 1280 — so
              this needs no orientation or pointer query, which would also catch
              every desktop monitor.
              Size is `vw`, and the crop is a percentage translate of the image's
              own box rather than the container's, so exactly the same slice of
              the drawing is cut off at 375px as at 1920px. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {/* Landscape sheet: a natural band on a phone, the wide corner above
                it. Bleeding right sacrifices the top view and keeps the main
                drawing. */}
            <Image
              src="/assets/sketch-hopper-loader.webp"
              alt=""
              width={1536}
              height={1024}
              sizes="(max-width: 767px) 105vw, (max-width: 1023px) 50vw, (max-width: 1279px) 79vw, (max-width: 1440px) 52.5vw, 763px"
              className="absolute top-0 left-1/2 h-auto w-[105vw] max-w-none -translate-x-1/2 -translate-y-[8%] opacity-40 md:left-auto md:right-0 md:w-[50vw] md:translate-x-0 md:translate-y-0 md:opacity-50 lg:w-[79vw] lg:translate-x-[20%] lg:-translate-y-[7%] lg:opacity-55 xl:w-[clamp(271px,52.5vw,763px)]"
            />
            {/* Portrait sheet, so it is the one that can hold the tall left
                flank on a wide screen. Its 2:3 ratio is why the tablet band has
                to be a much larger fraction of the viewport to reach anything
                like the same height. */}
            <Image
              src="/assets/sketch-chiller.webp"
              alt=""
              width={1024}
              height={1536}
              sizes="(max-width: 767px) 91vw, (max-width: 1023px) 41vw, (max-width: 1279px) 43vw, (max-width: 1440px) 28.8vw, 593px"
              className="absolute bottom-0 left-1/2 h-auto w-[91vw] max-w-none -translate-x-1/2 translate-y-[54%] opacity-40 md:left-0 md:w-[41vw] md:translate-x-0 md:translate-y-0 md:opacity-50 lg:w-[43vw] lg:-translate-x-[8%] lg:translate-y-[20%] lg:opacity-55 xl:w-[clamp(254px,28.8vw,593px)]"
            />
            {/* Clears the centre without a hard edge, so the drawings fade under
                the type rather than being masked by a visible shape. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(52% 40% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.9) 45%, rgba(255,255,255,0) 80%)",
              }}
            />
          </div>
        </motion.div>

        {/* Outside the blurred layer, and capped to the corridor the cards
            leave open. Above 1280 the container stops growing, so that gap is a
            constant ~480px: 1280 less two 360px cards less the two 40px
            gutters. "Strengths" is the widest line at ~6.4em of Orbitron, which
            is what sets the 4.25rem ceiling. Both clamps also carry a vh term,
            since pinned inside one viewport the vw sizing alone would run five
            lines past the bottom of a short laptop screen. The 1.6 ratio holds
            term by term across all four. */}
        <div className="relative mx-auto flex h-full w-full max-w-[1280px] flex-col items-center justify-center px-5 text-center sm:px-6 lg:px-10">
          <h2 className="font-orbitron text-[clamp(2.88rem,min(12.8vw,14vh),4.25rem)] font-bold leading-[1.05] tracking-tight text-[color:var(--brand-blue)]">
            Our
            <br />
            Strengths
          </h2>

          {/* Same dotted face as the hero corner statements, so the two read as
              one voice. `.font-bitcount` is unlayered CSS and pins the weight at
              300, which beats any Tailwind font-weight utility outright — the
              cascade puts unlayered rules above @layer utilities regardless of
              source order. So there is no weight class here: it would be dead. */}
          <p className="mt-[clamp(1.5rem,4vw,2.75rem)] font-bitcount text-[clamp(1.8rem,min(8vw,8.75vh),2.65625rem)] leading-[1.25] text-[#f97316]">
            <span className="block">Innovate</span>
            <span className="block">Transform</span>
            <span className="block">Impact</span>
          </p>
        </div>
      </div>

      {/* Pulled back over the pinned layer. The negative margin is what makes
          the card track start level with the backdrop instead of one screen
          below it. The lead-in then buys a beat of pinned, sharp, empty
          backdrop before the first card exists — without it the section pins
          and is immediately covered, so it is never actually seen. The tail
          does the same at the other end: sticky releases one viewport before
          the section ends, so without it the backdrop would slide away
          underneath card 04. */}
      <div className="relative z-10 -mt-[100svh]">
        {/* Longer than one screen on purpose. The card is centred in its own
            100svh block, so a 70svh lead-in still left its top edge at ~86svh —
            peeking into the bottom of the very first view. Clearing the fold
            takes 100svh; the rest buys a third of a screen of clean backdrop
            after that before card 01 rises into frame. */}
        <div aria-hidden="true" className="h-[120svh]" />

        {CARDS.map((card, i) => {
          const fromRight = i % 2 === 0;
          return (
            <div
              key={card.n}
              className="flex min-h-svh items-center justify-center px-5 py-16 sm:px-6 md:min-h-[78svh] md:px-12 md:py-10 xl:min-h-svh xl:px-10 xl:py-16"
            >
              <div
                className={cn(
                  "mx-auto flex w-full max-w-[1280px]",
                  /* Right, left, right, left. Below md there is no room to sit
                     a card to one side of anything, so they simply centre. */
                  fromRight ? "md:justify-end" : "md:justify-start",
                  "justify-center"
                )}
              >
                {/* No motion on the cards. They scroll, and that is all — the
                    only animation in this section is the backdrop's blur. */}
                <article className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-[#111318] shadow-[0_40px_90px_-30px_rgba(2,16,46,0.6)] lg:max-w-[360px]">
                  <div className="p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="eyebrow text-white/45">( {card.n} )</span>
                      <span aria-hidden="true" className="h-px w-8 bg-white/25" />
                      <span className="eyebrow text-white/70">Strengths</span>
                    </div>

                    <h3 className="mt-6 text-[clamp(1.3rem,2.1vw,1.75rem)] font-black leading-[1.25] tracking-tight text-white">
                      {card.title}
                    </h3>

                    <p className="mt-4 text-sm font-light leading-relaxed text-white/60">
                      {card.body}
                    </p>
                  </div>

                  <div className="relative aspect-4/3 w-full">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 90vw, 360px"
                      className="object-cover"
                    />
                  </div>
                </article>
              </div>
            </div>
          );
        })}

        <div aria-hidden="true" className="h-[60svh] md:h-[85svh] xl:h-[60svh]" />
      </div>
    </section>
  );
}
