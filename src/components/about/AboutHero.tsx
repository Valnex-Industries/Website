"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_HERO, ABOUT_PHOTOS } from "@/lib/about";

/**
 * The opening of /about: the crew photo sits in a rounded window under the
 * headline, then opens to full bleed as the section is scrolled.
 *
 * It borrows the homepage hero's idea (a framed window that grows until it
 * owns the screen) so the two pages read as one site, but the window here is
 * a still photograph and the scroll is pinned, so the reveal is the whole
 * moment rather than a transition into the next section.
 *
 * The resting window shape lives in CSS (`.about-window` in globals.css), not
 * here, so first paint is already the right composition on every width and a
 * reduced-motion visitor simply keeps it. GSAP only animates *from* that
 * computed clip-path *to* full bleed.
 */
export function AboutHero() {
  const root = useRef<HTMLElement>(null);

  /* Lenis drives the scroll; ScrollTrigger has to hear about every frame of
     it, or the pin lags a frame behind the content. */
  useLenis(() => ScrollTrigger.update());

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            /* 110% of a screen of scroll: long enough that the opening reads
               as deliberate, short enough that nobody wonders if it is stuck. */
            end: "+=110%",
            pin: true,
            scrub: 0.6,
          },
        });

        tl.to(".about-window", { clipPath: "inset(0% 0% 0% 0% round 0px)" }, 0)
          .fromTo(".about-photo", { scale: 1.18 }, { scale: 1 }, 0)
          .to(".about-copy", { yPercent: -35, autoAlpha: 0 }, 0)
          .to(".about-shade", { autoAlpha: 1 }, 0.35)
          .fromTo(
            ".about-caption",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0 },
            0.6,
          );
      });
    },
    { scope: root },
  );

  const [lineOne, lineTwo] = ABOUT_HERO.title;

  return (
    <section
      ref={root}
      className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-[color:var(--brand-ink)]"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="about-copy relative mx-auto w-full max-w-[1280px] px-5 pt-28 sm:px-6 md:pt-32 lg:px-10 lg:pt-36">
        <h1 className="text-[clamp(2rem,5.2vw,4.25rem)] font-black leading-[1.02] tracking-tight text-white">
          {lineOne}
          <br />
          <span className="text-[#f97316]">{lineTwo}</span>
        </h1>
        <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-white/65 md:mt-6 md:text-lg">
          {ABOUT_HERO.lede}
        </p>
      </div>

      <div className="about-window absolute inset-0 overflow-hidden">
        <Image
          src={ABOUT_PHOTOS.hero.src}
          alt={ABOUT_PHOTOS.hero.alt}
          fill
          priority
          sizes="100vw"
          className="about-photo object-cover"
        />
        {/* Brand tint, as on the inquiry band, so a phone snapshot sits in the
            same colour world as the rendered machines elsewhere. */}
        <div className="absolute inset-0 bg-[rgba(0,71,225,0.22)] mix-blend-multiply" />
        <div className="about-shade invisible absolute inset-0 bg-linear-to-t from-[#02102e] via-[rgba(2,16,46,0.35)] to-transparent opacity-0" />

        <p className="about-caption invisible absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1280px] px-5 pb-10 text-base font-light leading-relaxed text-white/85 opacity-0 sm:px-6 md:pb-14 md:text-xl lg:px-10">
          <span className="block max-w-xl">{ABOUT_HERO.caption}</span>
        </p>
      </div>
    </section>
  );
}
