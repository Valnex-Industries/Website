"use client";

import { useRef } from "react";
import { CdnImage } from "@/components/CdnImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS, productHref, type Product } from "@/lib/products";
import { cn } from "@/utils/cn";

/**
 * Card and track geometry, in vw rather than px. A horizontal scroll-jack needs
 * to know how far to translate the track to clear the last card, and a fixed px
 * measurement would need a ResizeObserver to stay correct across screen widths
 * — the kind of JS measurement this codebase has deliberately moved away from
 * (see HeroScroll's clip-path, sized the same way). Because both the cards and
 * the viewport are expressed in the same unit, the ratio between "how wide the
 * track is" and "how wide the screen is" holds at any width without measuring
 * either.
 */
const CARD_VW = 32;
const GAP_VW = 3;
/** Leading gutter before card 1 and trailing gutter after the last card, so the
 *  sequence doesn't start or end flush against the viewport edge. */
const EDGE_VW = 6;
/** Vertical scroll consumed per card while pinned. Tunable in one place. */
const PIN_VH_PER_CARD = 55;

/**
 * Derived per render rather than at module load, because the catalogue is a
 * database read now: the count that reaches this component is not the length of
 * the compile-time `PRODUCTS` array, and pinning for seven cards while showing
 * nine would strand the last two off-screen for good.
 */
function trackGeometry(count: number) {
  const trackVw = EDGE_VW * 2 + count * CARD_VW + Math.max(count - 1, 0) * GAP_VW;

  return {
    /* Floored at zero. A short catalogue makes a track narrower than the
       viewport, and a negative travel would translate it *rightwards* — the
       cards would march off the screen instead of into it. */
    travelVw: Math.max(trackVw - 100, 0),
    pinVh: count * PIN_VH_PER_CARD + 100,
  };
}

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
        /* The max-height is a guard, not a look. Height here is 1.25x width,
           so on anything wider than 2.5:1 — an ultrawide, a half-tiled 32:9 —
           a 32vw card is taller than the viewport it is pinned inside, and its
           own title scrolls out of sight with no way to reach it. Past that
           ratio the card simply stops being 4:5; the image is object-cover, so
           it crops rather than distorts. */
        "group relative flex aspect-4/5 max-h-[78svh] flex-col justify-end overflow-hidden rounded-2xl",
        className
      )}
    >
      <CdnImage
        src={product.image}
        alt={`${product.title} product`}
        fill
        sizes={`(max-width: 639px) 90vw, (max-width: 1279px) 45vw, ${CARD_VW}vw`}
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

/**
 * `products` comes from the database via the server page. It defaults to the
 * compile-time catalogue so the grid still renders if this is ever mounted
 * without one -- an empty products section would be a worse failure than a
 * slightly stale one.
 */
export function Divisions({ products = PRODUCTS }: { products?: Product[] }) {
  const trackSectionRef = useRef<HTMLDivElement>(null);

  const { travelVw, pinVh } = trackGeometry(products.length);
  /* Nothing to scroll through means nothing to pin: the track would hold the
     viewport hostage for `pinVh` of dead scroll and then release having moved
     no cards. Below this threshold the grid is the only layout. */
  const pinned = travelVw > 0;

  /* Reduced motion is handled below entirely in CSS (`xl:motion-safe:` on both
     layouts), not here — that keeps the DOM identical between server and
     client and lets the browser's own media query do the switching, rather
     than a JS check that would need to guess at hydration time.
     Scoped to the pinned track alone, not the whole section — the heading
     above it has no fixed height, and folding it into this measurement would
     throw off what fraction of the scroll maps to "clear the last card". */
  const { scrollYProgress } = useScroll({
    target: trackSectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${travelVw}vw`]);

  return (
    <section
      id="products"
      /* `clip`, not `hidden`. They paint identically, but `overflow: hidden`
         makes this section a scroll container, and a sticky element resolves
         against its nearest scroll container — which in that case is a box
         that never scrolls, so the track below would never pin at all. It
         would slide past a viewport-tall hole instead. `overflow: clip`
         creates no scroll container, so the pin still resolves against the
         viewport. Same reason Strengths uses it. */
      className="relative overflow-clip bg-[color:var(--brand-ink)]"
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
          card, then releases.

          Each layout carries exactly one conditional display class, and the
          two conditions are complements (`xl:motion-safe:` on both). Giving
          one element both `xl:block` and `motion-reduce:xl:hidden` would make
          the outcome depend on which variant Tailwind happens to sort last —
          equal specificity, opposite intent. This way neither element has a
          rule to lose to. */}
      {pinned && (
        <>
          <div
            ref={trackSectionRef}
            className="relative mt-16 hidden xl:motion-safe:block"
            style={{ height: `${pinVh}vh` }}
          >
            <div className="sticky top-0 flex h-svh items-center overflow-hidden">
              {/* Leading/trailing runway lives here as padding on the flex
                  container rather than margin on the end cards, so it can't be
                  silently dropped if a card's own className ever changes. */}
              <motion.div
                className="flex items-center will-change-transform"
                style={{
                  paddingInline: `${EDGE_VW}vw`,
                  gap: `${GAP_VW}vw`,
                  x,
                }}
              >
                {products.map((product) => (
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

          {/* The grid below carries the section's bottom padding, but it is
              display:none for the exact viewport (xl, motion-safe) where the
              pinned track is shown instead — without this, the section would
              end flush against whatever comes next on desktop. Only ever
              visible at xl, so it needs only the one xl height value, matching
              the grid's own lg:pb-32. */}
          <div className="hidden h-32 xl:motion-safe:block" />
        </>
      )}

      {/* Below xl, at any width with reduced motion, and whenever the
          catalogue is too short to be worth pinning: a plain grid, no
          scroll-jack, no JS transform. Same card, same content, just laid out
          normally. */}
      <div
        className={cn(
          "relative mx-auto w-full max-w-[1280px] px-5 pb-20 sm:px-6 md:pb-28 lg:px-10 lg:pb-32",
          pinned && "xl:motion-safe:hidden"
        )}
      >
        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 md:mt-14">
          {products.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
