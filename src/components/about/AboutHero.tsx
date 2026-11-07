"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ABOUT_HERO, ABOUT_PHOTOS } from "@/lib/about";

/**
 * The opening of /about: the team photo sits in a window beside the
 * lede (or below it on mobile/tablet); scrolling pins the section, the window
 * opens to full screen and the photo smoothly expands while anchored to the
 * left, right, and bottom borders of the card.
 *
 * Excess negative space above the team is cropped by the card's top edge at rest,
 * and the image stays clipped cleanly under the card throughout the zoom-out.
 */
export function AboutHero() {
  const root = useRef<HTMLElement>(null);
  const photo = ABOUT_PHOTOS.hero;
  const ratio = (photo.width ?? 1600) / (photo.height ?? 1062);

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
        return {
          left,
          top,
          right: left + el.offsetWidth,
          bottom: top + el.offsetHeight,
        };
      };

      /* The resting window, and the transform that aligns the photo with the
         card's left, right, and bottom borders while clipping the top. */
      const rest = () => {
        const vw = section.clientWidth;
        const vh = section.clientHeight;
        let x: number;
        let y: number;
        let w: number;
        let h: number;

        if (vw >= 1024) {
          /* Desktop: Beside the lede, below the headline, inside the page gutter. */
          const gutter = Math.max(vw * 0.04, (vw - 1280) / 2 + 40);
          const left = offset(lede).right + 48;
          y = offset(heading).bottom + 36;
          w = vw - gutter - left;
          const maxH = vh - y - vh * 0.08;
          /* Crop excess negative space at the top (~20% top crop) so the team fills the card */
          h = Math.min(maxH, (w / ratio) * 0.8);
          x = vw - gutter - w;
        } else if (vw >= 768) {
          /* Tablet: Under the lede, centered horizontally. */
          const side = Math.max(28, vw * 0.06);
          w = vw - side * 2;
          y = offset(lede).bottom + 24;
          const maxH = vh - y - vh * 0.06;
          /* Crop excess space at the top (~18% top crop) */
          h = Math.min(maxH, (w / ratio) * 0.82);
          x = (vw - w) / 2;
        } else {
          /* Mobile: Under the lede, centered with phone padding. */
          const side = Math.max(16, vw * 0.05);
          w = vw - side * 2;
          y = offset(lede).bottom + 18;
          const maxH = vh - y - 24;
          /* Fits phone height with subtle top crop (~15% top crop) */
          h = Math.min(maxH, (w / ratio) * 0.85);
          x = (vw - w) / 2;
        }

        const radius = vw >= 768 ? 24 : 18;

        /* Bottom-aligned transform math:
           Base photo is at `left: 0, bottom: 0, width: 100% (vw), height: vw / ratio`.
           Scaled width is `vw * scale = w`, so scale = w / vw.
           With `transformOrigin: "center bottom"`:
             dx moves center from vw / 2 to x + w / 2: dx = (x + w / 2) - vw / 2
             dy moves bottom from vh to y + h: dy = (y + h) - vh
        */
        const scale = w / vw;
        const dx = x + w / 2 - vw / 2;
        const dy = y + h - vh;

        return {
          clip: `inset(${y}px ${vw - x - w}px ${vh - y - h}px ${x}px round ${radius}px)`,
          scale,
          dx,
          dy,
        };
      };

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const isMobile = window.innerWidth < 768;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            /* 100% of a screen of scroll on desktop/tablet, slightly shorter on phone */
            end: isMobile ? "+=80%" : "+=100%",
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
          .fromTo(".about-backdrop", { scale: 1.25 }, { scale: 1.05 }, 0)
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

        {/* The photo container: width 100% of viewport, height derived from aspect ratio,
            anchored at bottom. Scales and translates so it aligns with the card's
            left, right, and bottom borders while the card's top edge clips the excess top space. */}
        <div
          className="about-photo absolute left-0 bottom-0 will-change-transform"
          style={{
            width: "100%",
            height: "calc(100vw / 1.50659)",
            transformOrigin: "center bottom",
          }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-bottom"
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
