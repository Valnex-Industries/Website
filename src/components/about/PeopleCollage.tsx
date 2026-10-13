"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_PEOPLE, ABOUT_PHOTOS } from "@/lib/about";
import { cn } from "@/utils/cn";

/**
 * Where each photo lands, in order. The first two are the largest and sit
 * highest, which is why the founders go first in `ABOUT_PHOTOS.people`.
 *
 * Every slot is placed against the edges so the headline keeps the middle of
 * the screen on every width, and the top row starts below the fixed header
 * (about 12% of a short landscape screen). Phones show four photos (top pair, bottom pair)
 * with the headline in the band between them; the fifth slot is md and up.
 * `tilt` is the resting rotation in degrees; photos pop in from twice that.
 */
const SLOTS = [
  {
    className:
      "left-[4%] top-[13%] w-[40vw] aspect-[4/5] md:left-[5%] md:top-[14%] md:w-[30vw] lg:w-[20vw]",
    tilt: -4,
    sizes: "(max-width: 768px) 40vw, 30vw",
  },
  {
    className:
      "right-[4%] top-[16%] w-[40vw] aspect-[4/5] md:right-[5%] md:top-[12%] md:w-[30vw] lg:w-[20vw]",
    tilt: 3,
    sizes: "(max-width: 768px) 40vw, 30vw",
  },
  {
    className:
      "left-[6%] bottom-[7%] w-[44vw] aspect-[4/3] md:left-[12%] md:bottom-[6%] md:w-[26vw] lg:left-[20%] lg:w-[16vw]",
    tilt: 2,
    sizes: "(max-width: 768px) 44vw, 26vw",
  },
  {
    className:
      "right-[5%] bottom-[12%] w-[38vw] aspect-[4/3] md:right-[10%] md:bottom-[9%] md:w-[26vw] lg:right-[19%] lg:w-[17vw]",
    tilt: -3,
    sizes: "(max-width: 768px) 38vw, 26vw",
  },
  {
    className:
      "hidden md:block md:left-[42%] md:top-[12%] md:w-[15vw] lg:w-[13vw] aspect-square",
    tilt: 1.5,
    sizes: "15vw",
  },
] as const;

export function PeopleCollage() {
  const root = useRef<HTMLElement>(null);
  const photos = ABOUT_PHOTOS.people.slice(0, SLOTS.length);

  useLenis(() => ScrollTrigger.update());

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".people-card");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            /* About a third of a screen of scroll per photo, so each one
               lands on its own beat instead of all five arriving at once. */
            end: () => `+=${Math.max(cards.length, 3) * 34}%`,
            pin: true,
            scrub: 0.5,
          },
        });

        tl.fromTo(
          ".people-copy",
          { autoAlpha: 0.25, scale: 0.94 },
          { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.8 },
          0,
        );

        cards.forEach((card, i) => {
          const tilt = Number(card.dataset.tilt ?? 0);
          tl.fromTo(
            card,
            {
              autoAlpha: 0,
              scale: 0.35,
              yPercent: 40,
              rotation: tilt * 3,
            },
            {
              autoAlpha: 1,
              scale: 1,
              yPercent: 0,
              rotation: tilt,
              /* The overshoot is the "pop": each photo lands slightly past
                 full size and settles, like a print slapped onto a board. */
              ease: "back.out(1.7)",
              duration: 1,
            },
            0.3 + i * 0.75,
          );
        });

        /* A short hold with everything on screen before the pin releases. */
        tl.to({}, { duration: 0.6 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="team"
      aria-labelledby="people-heading"
      className="relative h-[100dvh] min-h-[620px] overflow-hidden bg-[color:var(--brand-ink)]"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <ul className="absolute inset-0">
        {photos.map((photo, i) => {
          const slot = SLOTS[i];
          return (
            <li
              key={photo.src}
              data-tilt={slot.tilt}
              /* `transform`, not the `rotate` property: GSAP writes transform,
                 and the two would otherwise stack into a double tilt. This is
                 also the resting state a reduced-motion visitor sees. */
              style={{ transform: `rotate(${slot.tilt}deg)` }}
              className={cn("people-card absolute", slot.className)}
            >
              <figure className="flex h-full flex-col">
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_-20px_rgba(0,8,30,0.8)]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={slot.sizes}
                    className="object-cover"
                  />
                </div>
                {photo.name && (
                  <figcaption className="mt-2 text-xs leading-snug text-white/75 md:text-sm">
                    <span className="font-semibold text-white">
                      {photo.name}
                    </span>
                    {photo.role && (
                      <span className="block text-white/55">{photo.role}</span>
                    )}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>

      {/* Above the photos, so a photo can never sit over the words. */}
      <div className="people-copy pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
        <div className="max-w-[min(34rem,90vw)] text-center">
          <h2
            id="people-heading"
            className="text-[clamp(1.6rem,4.2vw,3.25rem)] font-black leading-[1.05] tracking-tight text-white [text-shadow:0_2px_24px_rgba(2,16,46,0.9)]"
          >
            {ABOUT_PEOPLE.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-sm font-light leading-relaxed text-white/70 [text-shadow:0_1px_12px_rgba(2,16,46,0.9)] md:text-base">
            {ABOUT_PEOPLE.lede}
          </p>
        </div>
      </div>
    </section>
  );
}
