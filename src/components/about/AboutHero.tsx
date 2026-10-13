"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_HERO, ABOUT_PHOTOS } from "@/lib/about";

/**
 * The opening of /about: the team photo sits whole in a window beside the
 * lede; scrolling pins the section, the window opens to full screen and the
 * photo travels to the centre, landing at the largest size that fits.
 *
 * It borrows the homepage hero's idea (a framed window that grows until it
 * owns the screen) so the two pages read as one site.
 *
 * The photograph is never cropped and never upscaled past what fits. The
 * window at rest has the photo's own 3:2 shape, so the whole team fills it
 * edge to edge; the window then opens faster than the photo grows, so the
 * photo seems to pull back into a blurred, slowly zooming copy of itself.
 * That is the zoom-out, done without cutting anyone out of the frame.
 *
 * Geometry is measured, not fixed in CSS: the window has to be 3:2, sit
 * below the headline and beside the lede (or under it on an upright screen),
 * and fit whatever height is left, which no single set of percentages does
 * across phones, tablets and wide desktops.
 */
export function AboutHero() {
  const root = useRef<HTMLElement>(null);
  const photo = ABOUT_PHOTOS.hero;
  const ratio = (photo.width ?? 3) / (photo.height ?? 2);

  /* Lenis drives the scroll; ScrollTrigger has to hear about every frame of
     it, or the pin lags a frame behind the content. */
  useLenis(() => ScrollTrigger.update());

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const heading = section.querySelector<HTMLElement>(".about-copy h1");
      const lede = section.querySelector<HTMLElement>(".about-copy p");
      if (!heading || !lede) return;

      /* Layout position relative to the section. Offsets ignore transforms,
         so this reads the resting layout even mid-scroll. */
      const offset = (el: HTMLElement) => {
        let left = 0;
        let top = 0;
        for (
          let node: HTMLElement | null = el;
          node && node !== section;
          node = node.offsetParent as HTMLElement | null
        ) {
          left += node.offsetLeft;
          top += node.offsetTop;
        }
        return { left, top, right: left + el.offsetWidth, bottom: top + el.offsetHeight };
      };

      /* The resting window, and the transform that fits the full-screen
         photo exactly into it. */
      const rest = () => {
        const vw = section.clientWidth;
        const vh = section.clientHeight;
        let x: number;
        let y: number;
        let w: number;

        if (vw >= 1024) {
          /* Beside the lede, below the headline, inside the page gutter. */
          const gutter = Math.max(vw * 0.04, (vw - 1280) / 2 + 40);
          const left = offset(lede).right + 48;
          y = offset(heading).bottom + 40;
          const maxW = vw - gutter - left;
          const maxH = vh - y - vh * 0.07;
          w = Math.min(maxW, maxH * ratio);
          x = vw - gutter - w;
        } else {
          /* Under the lede, centred. */
          const side = vw >= 768 ? vw * 0.07 : vw * 0.05;
          y = offset(lede).bottom + 28;
          const maxW = vw - side * 2;
          const maxH = vh - y - vh * 0.05;
          w = Math.min(maxW, maxH * ratio);
          x = (vw - w) / 2;
        }
        const h = w / ratio;

        /* The photo at full screen is contained and centred. */
        const fullW = Math.min(vw, vh * ratio);
        return {
          clip: `inset(${y}px ${vw - x - w}px ${vh - y - h}px ${x}px round ${vw >= 768 ? 24 : 18}px)`,
          scale: w / fullW,
          dx: x + w / 2 - vw / 2,
          dy: y + h / 2 - vh / 2,
        };
      };

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            /* 110% of a screen of scroll: long enough that the opening reads
               as deliberate, short enough that nobody wonders if it is stuck. */
            end: "+=110%",
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          ".about-window",
          { clipPath: () => rest().clip },
          { clipPath: "inset(0px 0px 0px 0px round 0px)" },
          0,
        )
          .fromTo(
            ".about-photo",
            {
              x: () => rest().dx,
              y: () => rest().dy,
              scale: () => rest().scale,
            },
            { x: 0, y: 0, scale: 1 },
            0,
          )
          .fromTo(".about-backdrop", { scale: 1.3 }, { scale: 1.05 }, 0)
          .to(".about-copy", { yPercent: -35, autoAlpha: 0 }, 0)
          .to(".about-shade", { autoAlpha: 1 }, 0.35)
          .fromTo(
            ".about-caption",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0 },
            0.6,
          );
      });

      /* Reduced motion: no pin, no scrub, just the finished resting frame,
         kept right through resizes. */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const place = () => {
          const r = rest();
          gsap.set(".about-window", { clipPath: r.clip });
          gsap.set(".about-photo", { x: r.dx, y: r.dy, scale: r.scale });
        };
        place();
        window.addEventListener("resize", place);
        return () => window.removeEventListener("resize", place);
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

      {/* Hidden until GSAP has measured and placed the window (the resting
          clip in CSS keeps it off-screen), so first paint never shows the
          photo at the wrong size. */}
      <div className="about-window absolute inset-0 overflow-hidden">
        {/* Fill for the screen around the photo once the window has opened:
            the same photo, blurred and darkened, zooming out slowly. */}
        <Image
          src={photo.src}
          alt=""
          aria-hidden="true"
          fill
          sizes="50vw"
          className="about-backdrop object-cover opacity-55 blur-2xl brightness-50"
        />
        <div className="about-photo absolute inset-0 will-change-transform">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
        </div>
        <div className="about-shade invisible absolute inset-0 bg-linear-to-t from-[#02102e] via-transparent to-transparent opacity-0" />

        <p className="about-caption invisible absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1280px] px-5 pb-8 text-sm font-light leading-relaxed text-white/90 opacity-0 sm:px-6 md:pb-12 md:text-lg lg:px-10">
          <span className="block max-w-xl">{ABOUT_HERO.caption}</span>
        </p>
      </div>
    </section>
  );
}
