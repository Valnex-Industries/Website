"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { NAV_ITEMS } from "@/lib/nav";
import { useHashNav } from "@/lib/use-hash-nav";
import { ProductsMegaMenu } from "./ProductsMegaMenu";
import { MobileNav } from "./MobileNav";

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
        "fixed inset-x-0 top-0 z-[100] transition-all duration-500",
        isLightMode
          ? "bg-white"
          : condensed
            ? "bg-[rgba(2,16,46,0.5)] backdrop-blur-md border-b border-white/10"
            : "bg-transparent border-b border-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 px-5 sm:px-6 lg:gap-6 lg:px-10 transition-all duration-500",
          /* Never condensed while the drawer is open, or the toggle would sit
             8px above the wordmark in the panel's own header row. */
          condensed && !isLightMode && !open ? "h-14" : "h-16 lg:h-[68px]"
        )}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className={cn(
            "whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.18em] transition-colors sm:text-sm sm:tracking-[0.22em]",
            isLightMode ? "text-[color:var(--brand-ink)]" : "text-white"
          )}
        >
          Valnex Industries
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 lg:flex h-full">
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
        <div className="hidden items-center gap-2 lg:flex">
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
          <Link
            href="/#careers"
            onClick={(e) => navigate(e, "/#careers")}
            className={cn(
              "group flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-transform hover:-translate-y-0.5",
              isLightMode
                ? "bg-[color:var(--brand-blue)] text-white"
                : "bg-white text-[color:var(--brand-blue)]"
            )}
          >
            Recruitment entry
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full",
                isLightMode ? "bg-white" : "bg-[color:var(--brand-blue)]"
              )}
            >
              <ArrowRight
                size={10}
                strokeWidth={3}
                className={
                  isLightMode ? "text-[color:var(--brand-blue)]" : "text-white"
                }
              />
            </span>
          </Link>
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
            "relative z-[120] -mr-2 flex h-11 w-11 items-center justify-center transition-colors lg:hidden",
            open || isLightMode ? "text-[color:var(--brand-ink)]" : "text-white"
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

/** Three rules that fold into a cross. */
function BurgerIcon({ open }: { open: boolean }) {
  const bar = "absolute left-0 h-[2px] w-full rounded-full bg-current";
  const transition = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <span aria-hidden="true" className="relative block h-[14px] w-[22px]">
      <motion.span
        className={cn(bar, "top-0")}
        animate={{ y: open ? 6 : 0, rotate: open ? 45 : 0 }}
        transition={transition}
      />
      <motion.span
        className={cn(bar, "top-[6px]")}
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.4 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className={cn(bar, "top-[12px]")}
        animate={{ y: open ? -6 : 0, rotate: open ? -45 : 0 }}
        transition={transition}
      />
    </span>
  );
}
