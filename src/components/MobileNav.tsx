"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, ChevronRight, Minus, Plus } from "lucide-react";
import { useLenis } from "lenis/react";
import { NAV_ITEMS, UTILITY_LINKS, type NavItem } from "@/lib/nav";
import { useHashNav } from "@/lib/use-hash-nav";
import { cn } from "@/utils/cn";

/** Same curve the preloader uses, so the site has one "panel" motion. */
const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  /** The site header's toggle. It sits above the panel and doubles as the
   *  drawer's close button, so focus and the tab cycle both route through it. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function MobileNav({ open, onClose, triggerRef }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const navigate = useHashNav();
  const reduceMotion = useReducedMotion();

  /** Hand the page its scroll back. Safe to call twice. */
  const releaseScroll = useCallback(() => {
    document.body.style.overflow = "";
    lenis?.start();
  }, [lenis]);

  /* Freeze the page behind the drawer. Lenis has to be stopped explicitly:
     it drives scroll off its own rAF loop and ignores `overflow: hidden`. */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return releaseScroll;
  }, [open, lenis, releaseScroll]);

  /* The drawer is `lg:hidden`. Rotating a tablet into desktop width would
     otherwise hide it while `open` stayed true, leaving the page scroll-locked
     with nothing on screen to close. */
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (query.matches) onClose();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open, onClose]);

  /* Escape to close, Tab kept inside the panel. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      /* The toggle lives in the site header, outside the panel, but it is the
         drawer's close button — so it has to be inside the cycle. */
      const items = [
        triggerRef.current,
        ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)),
      ].filter((el): el is HTMLElement => el !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, triggerRef]);

  /* Focus the toggle when the drawer opens — it is the close button now, and
     it is where a keyboard user already is. The ref guard matters: without it
     the very first render would put a focus ring on the burger before anyone
     had touched the page. */
  const hasOpened = useRef(false);
  useEffect(() => {
    if (open) {
      hasOpened.current = true;
      triggerRef.current?.focus();
    } else if (hasOpened.current) {
      hasOpened.current = false;
      triggerRef.current?.focus();
    }
  }, [open, triggerRef]);

  const handleLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    navigate(e, href, () => {
      onClose();
      releaseScroll();
    });
  };

  const listVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.05,
        delayChildren: reduceMotion ? 0 : 0.18,
      },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.45, ease: PANEL_EASE },
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim: mostly seen during the slide, and on tablets beside the sheet. */}
          <motion.div
            key="mobile-nav-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-[105] bg-[color:var(--brand-ink)]/70 backdrop-blur-sm lg:hidden"
          />

          <motion.div
            key="mobile-nav-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: PANEL_EASE }}
            className={cn(
              "fixed inset-y-0 right-0 z-[110] flex w-full flex-col bg-white shadow-[0_0_60px_rgba(2,16,46,0.35)] lg:hidden",
              "sm:max-w-[440px]",
            )}
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Drawer header. No close button: the site header's toggle is
                stacked above this panel and does that job, which keeps one
                control in one place instead of two X marks on top of another. */}
            <div className="flex h-16 shrink-0 items-center px-5 sm:px-6">
              <Link
                href="/"
                onClick={(e) => handleLink(e, "/")}
                className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.18em] text-[color:var(--brand-ink)] sm:text-sm sm:tracking-[0.22em]"
              >
                Valnex Industries
              </Link>
            </div>

            {/* Scrollable body: long product lists must not trap the drawer */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-5 pb-10 sm:px-6"
            >
              <DrawerAccordion
                rowVariants={rowVariants}
                onLink={handleLink}
                reduceMotion={Boolean(reduceMotion)}
              />

              <motion.div variants={rowVariants} className="mt-8 flex flex-col gap-3">
                <Link
                  href="/inquiry"
                  onClick={(e) => handleLink(e, "/inquiry")}
                  className="group flex items-center justify-between gap-4 rounded-xl bg-[color:var(--brand-ink)] px-6 py-5 text-sm font-bold text-white"
                >
                  Inquiry
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight
                      size={14}
                      strokeWidth={2.5}
                      className="text-[color:var(--brand-ink)]"
                    />
                  </span>
                </Link>

                <Link
                  href="/#careers"
                  onClick={(e) => handleLink(e, "/#careers")}
                  className="group flex items-center justify-between gap-4 rounded-xl bg-[color:var(--brand-blue)] px-6 py-5 text-sm font-bold text-white"
                >
                  Recruitment entry
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white transition-transform duration-300 group-hover:translate-x-0.5">
                    <ArrowRight
                      size={14}
                      strokeWidth={2.5}
                      className="text-[color:var(--brand-blue)]"
                    />
                  </span>
                </Link>
              </motion.div>

              <motion.div
                variants={rowVariants}
                className="mt-8 flex items-center justify-center gap-8"
              >
                {UTILITY_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLink(e, link.href)}
                    className="text-xs font-semibold text-[color:var(--brand-ink)]/60 transition-colors hover:text-[#f97316]"
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Owns which section is open. It mounts and unmounts with the panel, so the
 *  accordion is always collapsed again the next time the drawer opens. */
function DrawerAccordion({
  rowVariants,
  onLink,
  reduceMotion,
}: {
  rowVariants: Variants;
  onLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  reduceMotion: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <nav className="mt-4">
      {NAV_ITEMS.map((item) => (
        <motion.div key={item.label} variants={rowVariants}>
          <DrawerRow
            item={item}
            isOpen={expanded === item.label}
            onToggle={() =>
              setExpanded((current) =>
                current === item.label ? null : item.label,
              )
            }
            onLink={onLink}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      ))}
    </nav>
  );
}

function DrawerRow({
  item,
  isOpen,
  onToggle,
  onLink,
  reduceMotion,
}: {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  onLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  reduceMotion: boolean;
}) {
  const panelId = `drawer-${item.label.replace(/\s+/g, "-").toLowerCase()}`;

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={(e) => onLink(e, item.href)}
        className="flex min-h-[64px] items-center justify-between gap-4 border-b border-[color:var(--brand-ink)]/12 py-5 text-base font-bold tracking-wide text-[color:var(--brand-ink)]"
      >
        {item.label}
        <ChevronRight
          size={20}
          strokeWidth={1.6}
          className="shrink-0 text-[color:var(--brand-ink)]/50"
        />
      </Link>
    );
  }

  const hasThumbnails = item.children.some((child) => child.image);

  return (
    <div className="border-b border-[color:var(--brand-ink)]/12">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-[64px] w-full items-center justify-between gap-4 py-5 text-left text-base font-bold tracking-wide text-[color:var(--brand-ink)]"
      >
        {item.label}
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-[color:var(--brand-ink)]/70">
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="minus"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <Minus size={20} strokeWidth={1.6} />
              </motion.span>
            ) : (
              <motion.span
                key="plus"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              >
                <Plus size={20} strokeWidth={1.6} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: reduceMotion ? 0 : 0.4, ease: PANEL_EASE },
              opacity: { duration: reduceMotion ? 0 : 0.25 },
            }}
            className="overflow-hidden"
          >
            <ul
              className={cn(
                "pb-5",
                hasThumbnails
                  ? "grid gap-2 sm:grid-cols-2"
                  : "flex flex-col gap-1",
              )}
            >
              {item.children.map((child) => (
                <li key={child.label}>
                  <Link
                    href={child.href}
                    onClick={(e) => onLink(e, child.href)}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg py-2 transition-colors",
                      "text-sm font-semibold text-[color:var(--brand-ink)]/80 hover:text-[#f97316]",
                      !hasThumbnails && "min-h-[44px] justify-between",
                    )}
                  >
                    {child.image ? (
                      <>
                        <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-[color:var(--brand-ink)]/5">
                          <Image
                            src={child.image}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </span>
                        <span className="leading-snug">{child.label}</span>
                      </>
                    ) : (
                      <>
                        <span className="leading-snug">{child.label}</span>
                        <ChevronRight
                          size={16}
                          strokeWidth={1.8}
                          className="shrink-0 text-[color:var(--brand-ink)]/35"
                        />
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
