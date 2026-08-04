"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { NAV_ITEMS } from "@/lib/nav";
import { useHashNav } from "@/lib/use-hash-nav";
import { ProductsMegaMenu } from "./ProductsMegaMenu";
import { MobileNav } from "./MobileNav";
import { whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  /** Hover menus are a mouse affordance. On touch they latch open and swallow
   *  the first tap, so they are only wired up for real pointers. */
  const [canHover, setCanHover] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useHashNav();

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const isLightMode = activeDropdown !== null;

  return (
    <header
      onMouseLeave={() => setActiveDropdown(null)}
      className={cn(
        /* Colours only. `transition-all` here would also animate the height and
           the z-index swap, which is what made state changes feel like the bar
           was resizing. */
        "fixed inset-x-0 top-0 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
        /* Above the drawer (110) and its scrim (105) while open, so the bar
           reads as one continuous header rather than the panel covering it.
           That is also why the panel carries no wordmark of its own. */
        open ? "z-[120]" : "z-[100]",
        open
          ? "bg-transparent border-b border-transparent shadow-none"
          : isLightMode
            ? "bg-white"
            : condensed
              ? "bg-[rgba(2,16,46,0.5)] backdrop-blur-md border-b border-white/10"
              : "bg-transparent border-b border-transparent"
      )}
    >
      <div
        className={cn(
          /* The drawer renders inside this header, so once the header becomes
             a stacking context the panel (z-110) would paint over the bar's own
             contents. This lifts the wordmark and toggle back above it. */
          /* Fixed height, always. Nothing -- scroll, hover, or the drawer --
             may resize this bar: a header that changes height mid-scroll drags
             the whole page with it. `condensed` still drives the background,
             which is the part that should react to scrolling. */
          "relative z-[130] mx-auto flex h-16 md:h-20 items-center justify-between gap-4 px-5 sm:px-6 lg:h-[65px] lg:gap-6 lg:px-10"
        )}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className={cn(
            "group relative flex items-center gap-2.5 sm:gap-3",
            /* Orbitron is a wide display face, so the tracking comes down a
               notch from the body-font original to keep the wordmark clear of
               the burger on small screens. */
            "font-orbitron whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.14em] transition-colors sm:text-sm md:text-base lg:text-sm sm:tracking-[0.2em]",
            open
              ? "text-[color:var(--brand-blue)] sm:text-white duration-150 delay-[350ms] sm:delay-0 sm:duration-500"
              : isLightMode
                ? "text-[color:var(--brand-ink)] duration-500 delay-0"
                : "text-white duration-500 delay-0"
          )}
        >
          {/* White logo: visible unless we're open on mobile, or in desktop light mode */}
          <Image
            src="/assets/white-valnex-logo.webp"
            alt=""
            width={128}
            height={128}
            priority
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-10 lg:w-10 transition-opacity",
              open
                ? "opacity-0 sm:opacity-100 duration-150 delay-[350ms] sm:delay-0 sm:duration-500"
                : isLightMode
                  ? "opacity-0 duration-500 delay-0"
                  : "opacity-100 duration-500 delay-0"
            )}
          />
          {/* Blue logo: visible when open on mobile, or in desktop light mode */}
          <Image
            src="/assets/blue-valnex-logo.webp"
            alt=""
            width={128}
            height={128}
            priority
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-10 lg:w-10 transition-opacity",
              open
                ? "opacity-100 sm:opacity-0 duration-150 delay-[350ms] sm:delay-0 sm:duration-500"
                : isLightMode
                  ? "opacity-100 duration-500 delay-0"
                  : "opacity-0 duration-500 delay-0"
            )}
          />
          {/* Spacer to reserve layout space for the absolute images */}
          <div className="h-9 w-9 shrink-0 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-10 lg:w-10" />
          Valnex Industries
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 xl:flex h-full">
          {NAV_ITEMS.map((link) => (
            <div
              key={link.label}
              className="h-full flex items-center"
              onMouseEnter={() => {
                if (!canHover) return;
                setActiveDropdown(link.children ? link.label : null);
              }}
            >
              <Link
                href={link.href}
                onClick={(e) =>
                  navigate(e, link.href, () => setActiveDropdown(null))
                }
                className={cn(
                  "group flex items-center gap-1 whitespace-nowrap px-3 py-6 text-xs font-bold tracking-wide transition-colors",
                  isLightMode
                    ? "text-[color:var(--brand-ink)]/70 hover:text-[#f97316]"
                    : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
                {link.children && (
                  <ChevronDown
                    size={12}
                    strokeWidth={2.2}
                    className="opacity-60 transition-transform group-hover:translate-y-0.5"
                  />
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 xl:flex">
          <Link
            href="/inquiry"
            className={cn(
              "group flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              isLightMode
                ? "border-[color:var(--brand-ink)]/20 text-[color:var(--brand-ink)] hover:bg-black/5"
                : "border-white/35 text-white hover:bg-white/10"
            )}
          >
            Inquiry
            <ArrowRight
              size={12}
              strokeWidth={2.5}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
          {/* Leaves the site, so a plain anchor rather than next/link, and
              noreferrer alongside the new tab. */}
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5",
              /* Inverted in light mode: the bar turns white behind a mega
                 menu, so a white pill would vanish into it. */
              isLightMode
                ? "bg-[#25D366] text-white"
                : "bg-white text-[#25D366]"
            )}
          >
            WhatsApp inquiry
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full",
                isLightMode ? "bg-white" : "bg-[#25D366]"
              )}
            >
              <WhatsAppIcon
                size={10}
                className={isLightMode ? "text-[#25D366]" : "text-white"}
              />
            </span>
          </a>
        </div>

        {/* Mobile / tablet toggle — 44px target, sits flush with the padding.
            Stacked above the drawer (z-110) so it stays the one control that
            opens and closes the menu; the panel therefore carries no X of its
            own, and the icon flips to ink once the white panel is behind it. */}
        <button
          ref={triggerRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={cn(
            "relative z-[10] -mr-2 flex h-11 w-11 md:h-14 md:w-14 md:scale-125 items-center justify-center transition-all duration-500 xl:hidden",
            /* A brighter red than the #c81e1e used for form errors. That one is
               tuned to stay readable as small body text; this is a 2px icon
               stroke on white, where high chroma reads as intent rather than
               as a warning. */
            open
              ? "text-[#fb2c36]"
              : isLightMode
                ? "text-[color:var(--brand-ink)]"
                : "text-white"
          )}
          onClick={() => setOpen((v) => !v)}
        >
          <BurgerIcon open={open} />
        </button>
      </div>

      {/* Desktop mega menu */}
      <AnimatePresence>
        {activeDropdown === "Products" && (
          <ProductsMegaMenu onClose={() => setActiveDropdown(null)} />
        )}
      </AnimatePresence>

      <MobileNav
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
      />
    </header>
  );
}

/**
 * Three bars that morph into an ✕ with a two-phase, butter-smooth animation.
 *
 * Phase 1 (hamburger → X): bars slide to centre, then rotate into the cross.
 * Phase 2 (X → hamburger): bars un-rotate, then slide back to their slots.
 *
 * Uses Framer Motion's `animate` prop so the sequence is GPU-composited and
 * each bar gets its own staggered keyframes.
 */
function BurgerIcon({ open }: { open: boolean }) {
  const shared = {
    position: "absolute" as const,
    left: 0,
    height: 2,
    width: "100%",
    borderRadius: 9999,
    backgroundColor: "currentColor",
  };

  return (
    <span aria-hidden="true" className="relative block h-[14px] w-[22px]">
      {/* Top bar */}
      <motion.span
        style={{ ...shared, top: 0 }}
        animate={
          open
            ? { y: 6, rotate: 45 }
            : { y: 0, rotate: 0 }
        }
        transition={{
          y: { duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: open ? 0 : 0.12 },
          rotate: { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: open ? 0.12 : 0 },
        }}
      />

      {/* Middle bar */}
      <motion.span
        style={{ ...shared, top: 6 }}
        animate={
          open
            ? { opacity: 0, scaleX: 0.3 }
            : { opacity: 1, scaleX: 1 }
        }
        transition={{
          duration: 0.2,
          ease: "easeInOut",
          delay: open ? 0.05 : 0.18,
        }}
      />

      {/* Bottom bar */}
      <motion.span
        style={{ ...shared, top: 12 }}
        animate={
          open
            ? { y: -6, rotate: -45 }
            : { y: 0, rotate: 0 }
        }
        transition={{
          y: { duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: open ? 0 : 0.12 },
          rotate: { duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: open ? 0.12 : 0 },
        }}
      />
    </span>
  );
}
