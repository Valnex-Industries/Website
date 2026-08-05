"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
 * The mechanism is lifted from cki-group.jp's own Strengths section rather than
 * approximated from a screenshot: nothing here is scroll-jacked. Three plain CSS
 * behaviours do all the work —
 *
 *   1. The backdrop is `absolute inset-0` on the whole (tall) section, with a
 *      `sticky` child pinned inside it. Because the absolute box spans the
 *      entire section, the sketches stay pinned for as long as any card is
 *      still on screen, not just the first one.
 *   2. The heading is a *separate* sticky element, one viewport tall. It pins
 *      for exactly one screen and then releases on its own, so the first card
 *      arrives already overlapping it rather than after a hand-timed delay.
 *   3. The cards are normal flow, not pinned individually. On tablet and up,
 *      odd cards get `margin-left: auto` (right) and every card but the first
 *      pulls up over the one before it with a negative top margin — a fixed
 *      diagonal cascade, no per-frame scroll math. Below that, screen width
 *      cannot support two columns, so each card becomes its own `sticky`
 *      element at the same offset instead, which turns the same negative-space
 *      problem into a stacking deck.
 *
 * The one piece of scroll-driven JS is a single boolean: a sentinel at the top
 * of the card list flips a blur scrim on over the backdrop once the cards begin
 * arriving, so the drawings recede instead of competing with card 01. It is a
 * threshold crossing, not a per-frame computation.
 */
export function Strengths() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    /* Fires whenever the sentinel crosses either viewport edge. The sign of
       its own top tells us which edge: negative means it has scrolled past
       the top (cards are arriving — blur on), positive means it is entering
       from below or we have scrolled back above it (blur off). No rootMargin
       trick, because that shrinks the root to a slice and answers a different
       question ("is this crossing a fixed line") than the one asked here
       ("has this been scrolled past at all"). */
    const observer = new IntersectionObserver(
      ([entry]) => setBlurred(entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="strengths" className="relative overflow-clip bg-white">
      {/* Spans the full section (however tall the card stack makes it), so the
          sticky child below stays pinned for the section's entire scroll
          distance rather than releasing after one screen. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* Two treatments, because a corner needs width to read as a corner.
              Below md the sheets are full-bleed bands across the top and bottom;
              from md up they retreat into opposite corners. Four size bands,
              because a tablet is two different shapes: md (768–1023, portrait)
              runs at 2x, lg (1024–1279, landscape) at 1.5x, xl is the desktop
              size — width alone separates them since a landscape tablet is
              never below 1024 and a desktop is rarely below 1280. */}
          <Image
            src="/assets/sketch-hopper-loader.webp"
            alt=""
            width={1536}
            height={1024}
            sizes="(max-width: 767px) 105vw, (max-width: 1023px) 50vw, (max-width: 1279px) 79vw, (max-width: 1440px) 52.5vw, 763px"
            className="absolute top-0 left-1/2 h-auto w-[105vw] max-w-none -translate-x-1/2 -translate-y-[8%] opacity-40 md:left-auto md:right-0 md:w-[50vw] md:translate-x-0 md:translate-y-0 md:opacity-50 lg:w-[79vw] lg:translate-x-[20%] lg:-translate-y-[7%] lg:opacity-55 xl:w-[clamp(271px,52.5vw,763px)]"
          />
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
          {/* The one scroll-triggered effect in the section: a translucent
              white blur that crosses over the backdrop once card 01 starts
              arriving, so the sketches recede rather than compete with it. A
              threshold flip, not a per-frame blur radius. */}
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-white/70 backdrop-blur-[4px] transition-opacity duration-500",
              blurred ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>

      {/* Own sticky region, exactly one screen tall. It pins independently of
          the backdrop above and releases on schedule, so card 01 arrives
          already overlapping it rather than waiting out a hand-tuned delay. */}
      <div className="relative sticky top-0 flex h-svh flex-col items-center justify-center px-5 text-center sm:px-6 lg:px-10">
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

      {/* Normal flow from here down. Nothing is pinned for a fixed number of
          screens — the section is exactly as tall as four cards make it. */}
      <ul className="relative flex flex-col px-5 pb-24 sm:px-6 md:px-12 md:pb-32 lg:px-10">
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

        {CARDS.map((card, i) => {
          const fromRight = i % 2 === 0;
          return (
            <li
              key={card.n}
              className={cn(
                /* mx-auto centres the card below md, where the alternating
                   cascade drops out and every card sits in one column — without
                   it, a phone wider than the 340px cap (anything past ~380px of
                   usable width) left the leftover space stacked entirely on the
                   right, since a flex column's default cross-axis alignment is
                   stretch-then-pin-to-start once a max-width caps the item. */
                "mx-auto w-full max-w-[340px] lg:max-w-[360px]",
                /* Right, left, right, left — a fixed diagonal cascade, not a
                   scroll-linked one. Below md there is no room for two columns,
                   so this drops out entirely in favour of the sticky stack.
                   Both sides are set explicitly (not just the auto side): the
                   base mx-auto above still applies at md+ unless overridden, so
                   leaving the opposite margin unset would centre the card
                   instead of pushing it to the edge the cascade needs. */
                fromRight ? "md:mr-0 md:ml-auto" : "md:ml-0 md:mr-auto",
                /* The two md:mt-* values are mutually exclusive per card
                   (never both present on one element), so there is no cascade
                   order for twMerge to get wrong — the overlap on cards 2-4
                   cannot be silently cancelled by a reset meant only for
                   card 1. */
                i === 0 ? "md:mt-0" : "md:-mt-[220px]",
                /* Mobile only: each card pins at the same offset, so the next
                   one simply covers the last as it scrolls up — the same
                   negative-space problem the desktop cascade solves with
                   overlap, solved here with a stack instead. Cleared past the
                   fixed header, with a little air beneath it. */
                "sticky top-20 mt-6 first:mt-0 md:static md:top-auto"
              )}
            >
              <article className="overflow-hidden rounded-lg bg-[linear-gradient(180deg,#000_0%,#444_60%)] shadow-[0_40px_90px_-30px_rgba(2,16,46,0.6)]">
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

                <div className="relative mx-2.5 mb-2.5 aspect-9/7 overflow-hidden rounded">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 90vw, 360px"
                    className="object-cover"
                  />
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
