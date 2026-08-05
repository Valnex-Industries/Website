"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS, productHref, type Product } from "@/lib/products";
import { cn } from "@/utils/cn";

/**
 * Card and track geometry, in vw rather than px. A horizontal scroll-jack
 * needs to know how far to translate the track to clear the last card, and a
 * fixed px measurement would need a ResizeObserver to stay correct across
 * screen widths — the kind of JS measurement this codebase has deliberately
 * moved away from (see HeroScroll's clip-path, sized the same way). Because
 * both the cards and the viewport are expressed in the same unit, the ratio
 * between "how wide the track is" and "how wide the screen is" holds at any
 * width without measuring either.
 */
const CARD_VW = 32;
const GAP_VW = 3;
/** Leading gutter before card 1 and trailing gutter after the last card, so
 *  the sequence doesn't start or end flush against the viewport edge. */
const EDGE_VW = 6;
const N = PRODUCTS.length;
const TRACK_VW = EDGE_VW * 2 + N * CARD_VW + (N - 1) * GAP_VW;
/** How far left the track must move for its trailing edge to reach the
 *  viewport's trailing edge. */
const TRAVEL_VW = TRACK_VW - 100;
/** Vertical scroll consumed per card while pinned. Tunable in one place. */
const PIN_VH_PER_CARD = 55;

/**
 * The mechanism is lifted from cki-group.jp's own "Our Business" section:
 * a photo card, numbered top-left, title and one-line summary sat on a
 * gradient at the bottom, tinting from black to the brand colour on hover.
 * No 3D — a flat image, a flat gradient, a flat hover state.
 */
function ProductCard({
  product,
  style,
  className,
}: {
  product: Product;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <Link
      href={productHref(product.slug)}
      style={style}
      className={cn(
        "group relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl",
        className
      )}
    >
      <Image
        src={product.image}
        alt={`${product.title} product`}
        fill
        sizes={`(max-width: 1279px) 90vw, ${CARD_VW}vw`}
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
      />

      <span className="eyebrow absolute left-5 top-5 rounded-full bg-black/40 px-2.5 py-1 text-white/90 backdrop-blur-sm">
        ( {product.index} )
      </span>

      {/* Two stacked gradients, crossfaded on hover rather than swapped —
          swapping a background is a pop, crossfading an opacity is a shift
          in colour, which is the whole point of the hover state. */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[#02102e] via-[rgba(2,16,46,0.75)] to-transparent transition-opacity duration-500 group-hover:opacity-0" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-[color:var(--brand-blue)] via-[rgba(0,71,225,0.7)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
            {product.title}
          </h3>
          <ArrowUpRight
            size={18}
            className="mt-1 shrink-0 text-white/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
          />
        </div>
        <p className="text-sm font-light leading-relaxed text-white/70">
          {product.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function Divisions() {
  const trackSectionRef = useRef<HTMLDivElement>(null);

  /* Reduced motion is handled below entirely in CSS (motion-reduce:xl:hidden
     on the pinned track, motion-reduce:xl:block on the grid fallback), not
     here — that keeps the DOM identical between server and client and lets
     the browser's own media query do the switching, rather than a JS check
     that would need to guess at hydration time.
     Scoped to the pinned track alone, not the whole section — the heading
     above it has no fixed height, and folding it into this measurement would
     throw off what fraction of the scroll maps to "clear the last card". */
  const { scrollYProgress } = useScroll({
    target: trackSectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${TRAVEL_VW}vw`]);

  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[color:var(--brand-ink)]"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 pt-20 sm:px-6 md:pt-28 lg:px-10 lg:pt-32">
        <Reveal>
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between md:pb-10">
            <div>
              <span className="eyebrow text-white/45">Products</span>
              <h2 className="mt-4 max-w-2xl text-[clamp(2rem,4.4vw,3.5rem)] font-black leading-[0.98] tracking-tight text-white">
                Precision equipment,
                <br />
                one engineering standard.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-white/55">
              Every Valnex system runs through the same gate: prove it on the
              bench, prove it on the line, then hold it for the life of the
              asset.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Desktop: pinned horizontal scroll. Its own self-contained scroll
          region — sized in vh so the pin lasts exactly PIN_VH_PER_CARD per
          card, then releases. motion-reduce overrides it back off so a
          reduced-motion visitor gets the plain grid below instead of a
          transform they asked not to see (and the only way to reach cards
          2-7 without it, since the track has no native scroll of its own). */}
      <div
        ref={trackSectionRef}
        className="relative mt-16 hidden xl:block motion-reduce:xl:hidden"
        style={{ height: `${N * PIN_VH_PER_CARD + 100}vh` }}
      >
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          {/* Leading/trailing runway lives here as padding on the flex
              container rather than margin on the end cards, so it can't be
              silently dropped if a card's own className ever changes. */}
          <motion.div
            className="flex items-center"
            style={{
              paddingInline: `${EDGE_VW}vw`,
              gap: `${GAP_VW}vw`,
              x,
            }}
          >
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                style={{ width: `${CARD_VW}vw` }}
                className="shrink-0"
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* The fallback grid below carries the section's bottom padding, but
          it's display:none for the exact viewport (xl, motion-safe) where the
          pinned track above is shown instead — without this, the section
          would end flush against whatever comes next on desktop. Only ever
          visible at xl, so it needs only the one xl height value, matching
          the grid's own lg:pb-32. */}
      <div className="hidden xl:block xl:h-32 motion-reduce:xl:hidden" />

      {/* Below xl, and the motion-reduce fallback at xl: a plain grid, no
          scroll-jack, no JS transform. Same card, same content, just laid
          out normally. */}
      <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-20 sm:px-6 md:pb-28 lg:px-10 lg:pb-32 xl:hidden motion-reduce:xl:block">
        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:mt-14">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
