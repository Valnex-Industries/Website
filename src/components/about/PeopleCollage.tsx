"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_PEOPLE, ABOUT_PHOTOS } from "@/lib/about";
import { cn } from "@/utils/cn";

/**
 * Where the machine shots land, in pop order. They frame the team photo:
 * the first two flank it from behind on wide screens, the last two sit in
 * the band below it on every width. The headline owns the top of the screen,
 * so nothing is ever placed over it or over a face.
 *
 * `tilt` is the resting rotation in degrees; each shot pops in from three
 * times that. Tablets in portrait and phones skip the flanking pair, which
 * would sit almost entirely behind the team photo there.
 */
const MACHINE_SLOTS = [
  {
    className:
      "hidden lg:block lg:left-[4%] lg:top-[36%] lg:w-[17vw] aspect-[4/5]",
    tilt: -5,
    sizes: "17vw",
  },
  {
    className:
      "hidden lg:block lg:right-[4%] lg:top-[32%] lg:w-[17vw] aspect-[4/5]",
    tilt: 4,
    sizes: "17vw",
  },
  {
    className:
      "left-[4%] bottom-[5%] w-[46vw] aspect-[4/3] md:left-[6%] md:bottom-[4%] md:w-[40vw] lg:left-[12%] lg:bottom-[5%] lg:w-[15vw]",
    tilt: 3,
    sizes: "(max-width: 1024px) 46vw, 15vw",
  },
  {
    className:
      "right-[4%] bottom-[11%] w-[42vw] aspect-[4/3] md:right-[6%] md:bottom-[7%] md:w-[36vw] lg:right-[11%] lg:bottom-[4%] lg:w-[15vw]",
    tilt: -3,
    sizes: "(max-width: 1024px) 42vw, 15vw",
  },
] as const;

/** The team photo's resting tilt. Small, so ten faces still read level. */
const GROUP_TILT = -1.5;

export function PeopleCollage() {
  const root = useRef<HTMLElement>(null);
  const machines = ABOUT_PHOTOS.machines.slice(0, MACHINE_SLOTS.length);
  const group = ABOUT_PHOTOS.group;

  useLenis(() => ScrollTrigger.update());

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        /* Only the shots actually displayed at this width; a `hidden` slot
           would otherwise spend a beat of scroll popping nothing. */
        const shots = gsap.utils
          .toArray<HTMLElement>(".machine-card")
          .filter((el) => el.offsetParent !== null);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            /* A third of a screen per machine shot, then a longer beat for
               the team photo, so it lands as the payoff and not as one more
               card. */
            end: () => `+=${shots.length * 30 + 90}%`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          ".people-copy",
          { autoAlpha: 0.25, y: 24 },
          { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.8 },
          0,
        );

        shots.forEach((shot, i) => {
          const tilt = Number(shot.dataset.tilt ?? 0);
          tl.fromTo(
            shot,
            { autoAlpha: 0, scale: 0.35, yPercent: 40, rotation: tilt * 3 },
            {
              autoAlpha: 1,
              scale: 1,
              yPercent: 0,
              rotation: tilt,
              /* The overshoot is the "pop": each print lands slightly past
                 full size and settles, as if slapped onto a board. */
              ease: "back.out(1.7)",
              duration: 1,
            },
            0.3 + i * 0.7,
          );
        });

        /* The team arrives last, from small and turned, with a softer and
           longer overshoot than the machine shots so it reads heavier. */
        tl.fromTo(
          ".group-card",
          { autoAlpha: 0, scale: 0.2, yPercent: 30, rotation: -10 },
          {
            autoAlpha: 1,
            scale: 1,
            yPercent: 0,
            rotation: GROUP_TILT,
            ease: "back.out(1.3)",
            duration: 1.6,
          },
          0.4 + shots.length * 0.7,
        );

        /* Everything on screen for a moment before the pin releases. */
        tl.to({}, { duration: 0.8 });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="team"
      aria-labelledby="people-heading"
      className="relative h-[100dvh] min-h-[640px] overflow-hidden bg-[color:var(--brand-ink)]"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="people-copy relative z-20 mx-auto max-w-[min(40rem,90vw)] px-6 pt-[13vh] text-center md:pt-[12vh]">
        <h2
          id="people-heading"
          className="text-[clamp(1.6rem,4vw,3rem)] font-black leading-[1.05] tracking-tight text-white"
        >
          {ABOUT_PEOPLE.heading}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-white/65 md:text-base">
          {ABOUT_PEOPLE.lede}
        </p>
      </div>

      <ul aria-label="Valnex machines" className="absolute inset-0">
        {machines.map((photo, i) => {
          const slot = MACHINE_SLOTS[i];
          return (
            <li
              key={photo.src}
              data-tilt={slot.tilt}
              /* `transform`, not the `rotate` property: GSAP writes transform,
                 and the two would otherwise stack into a double tilt. This is
                 also the resting state a reduced-motion visitor sees. */
              style={{ transform: `rotate(${slot.tilt}deg)` }}
              className={cn("machine-card absolute", slot.className)}
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_-20px_rgba(0,8,30,0.8)]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={slot.sizes}
                  className="object-cover"
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Centred by the flex wrapper rather than by a translate on the card,
          so GSAP owns the card's whole transform without fighting it. */}
      <div className="pointer-events-none absolute inset-x-0 top-[36%] z-10 flex justify-center px-[4vw] md:top-[30%] lg:top-[33%]">
        <figure
          style={{ transform: `rotate(${GROUP_TILT}deg)` }}
          className="group-card pointer-events-auto w-full max-w-[46rem] md:w-[84vw] lg:w-[46vw]"
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-[0_40px_90px_-24px_rgba(0,8,30,0.95)] md:border-8">
            <Image
              src={group.src}
              alt={group.alt}
              fill
              sizes="(max-width: 768px) 92vw, (max-width: 1024px) 84vw, 46vw"
              className="object-cover"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
