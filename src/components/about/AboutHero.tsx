"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_HERO, ABOUT_PHOTOS } from "@/lib/about";

/**
 * The opening of /about: the team photo sits behind a rounded window under
 * the headline, then the window opens to full bleed while the photo zooms
 * out (1.18x to 1x) as the section is scrolled.
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
 *
 * How the photo fills the screen differs by shape. On lg and up it covers,
 * anchored low (the row of people is in the lower three quarters of the
 * frame; the top is trees). On an upright screen covering would keep only
 * the middle three people, so there it is contained, whole, on a blurred
 * copy of itself, and sits low enough that the resting window shows faces.
 */
export function AboutHero() {
  const root = useRef<HTMLElement>(null);
  const photo = ABOUT_PHOTOS.hero;

  /* Lenis drives the scroll; ScrollTrigger has to hear about every frame of
     it, or the pin lags a frame behind the content. */
  useLenis(() => ScrollTrigger.update());

  useGSAP(
    () => {
      /* On lg the photo covers the screen and the window is its lower
         right, which on its own would frame torsos: the faces are a third
         of the way down the photo. So at rest the photo is also lowered
         until the faces sit just inside the window's top edge, and it glides
         up as it zooms out. Measured, not hard-coded, because how much of
         the photo the cover crop keeps depends on the screen's shape. */
      const restingDrop = () => {
        if (window.innerWidth < 1024) return 0;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const ratio = (photo.width ?? 3) / (photo.height ?? 2);
        const imgH = Math.max(vh, vw / ratio);
        const top = -(imgH - vh) * 0.8; /* object-position y: 80% */
        const faces = top + imgH * 0.33;
        const zoomed = vh / 2 + (faces - vh / 2) * 1.18;
        const windowTop = vh * 0.46;
        return Math.max(0, windowTop + vh * 0.07 - zoomed);
      };

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
            invalidateOnRefresh: true,
          },
        });

        tl.to(".about-window", { clipPath: "inset(0% 0% 0% 0% round 0px)" }, 0)
          .fromTo(
            ".about-photo",
            { scale: 1.18, y: () => restingDrop() },
            { scale: 1, y: 0 },
            0,
          )
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
        <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-white/70 md:mt-6 md:text-lg">
          {ABOUT_HERO.lede}
        </p>
      </div>

      <div className="about-window absolute inset-0 overflow-hidden">
        <div className="about-photo absolute inset-0">
          {/* Fill for an upright screen, where the photo is contained: the
              same photo, blurred and darkened, so the bands read as depth.
              Hidden on lg, where the sharp photo covers the screen. */}
          <Image
            src={photo.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="50vw"
            className="scale-110 object-cover opacity-60 blur-2xl brightness-50 lg:hidden"
          />
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            className="object-contain object-[50%_72%] lg:object-cover lg:object-[50%_80%]"
          />
        </div>
        {/* Brand tint, as on the inquiry band, so a daylight photo sits in
            the same colour world as the rest of the site. */}
        <div className="absolute inset-0 bg-[rgba(0,71,225,0.14)] mix-blend-multiply" />
        <div className="about-shade invisible absolute inset-0 bg-linear-to-t from-[#02102e] via-[rgba(2,16,46,0.25)] to-transparent opacity-0" />

        <p className="about-caption invisible absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1280px] px-5 pb-10 text-base font-light leading-relaxed text-white/90 opacity-0 sm:px-6 md:pb-14 md:text-xl lg:px-10">
          <span className="block max-w-xl">{ABOUT_HERO.caption}</span>
        </p>
      </div>
    </section>
  );
}
