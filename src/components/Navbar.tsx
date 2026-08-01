"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { ProductsMegaMenu } from "./ProductsMegaMenu";

/** Root-relative so the section anchors also work from /inquiry and friends. */
const NAV_LINKS = [
  { label: "Products", href: "/#products", hasDropdown: true },
  { label: "Company Profile", href: "/#company", hasDropdown: true },
  { label: "Careers", href: "/#careers", hasDropdown: true },
  { label: "News", href: "/#news", hasDropdown: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const hash = href.replace("/", "");
      if (pathname === "/") {
        // If we're already on the home page, just scroll natively and update URL gracefully
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
      } else {
        // If we are on another page, let the router push correctly
        router.push(href);
      }
      setActiveDropdown(null);
      setOpen(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          "mx-auto flex items-center justify-between gap-6 px-6 lg:px-10 transition-all duration-500",
          condensed && !isLightMode ? "h-14" : "h-16 lg:h-[68px]"
        )}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className={cn(
            "whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.22em] transition-colors",
            isLightMode ? "text-[color:var(--brand-ink)]" : "text-white"
          )}
        >
          Valnex Industries
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 lg:flex h-full">
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className="h-full flex items-center"
              onMouseEnter={() =>
                link.hasDropdown
                  ? setActiveDropdown(link.label)
                  : setActiveDropdown(null)
              }
            >
              <Link
                href={link.href}
                onClick={(e) => handleHashClick(e, link.href)}
                className={cn(
                  "group flex items-center gap-1 whitespace-nowrap px-3 py-6 text-xs font-bold tracking-wide transition-colors",
                  isLightMode
                    ? "text-[color:var(--brand-ink)]/70 hover:text-[#f97316]"
                    : "text-white/80 hover:text-white"
                )}
              >
                {link.label}
                {link.hasDropdown && (
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
            onClick={(e) => handleHashClick(e, "/#careers")}
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

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={cn("lg:hidden transition-colors", isLightMode ? "text-black" : "text-white")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={22} strokeWidth={1.6} />
          ) : (
            <Menu size={22} strokeWidth={1.6} />
          )}
        </button>
      </div>

      {/* Mega Menus */}
      <AnimatePresence>
        {activeDropdown === "Products" && (
          <ProductsMegaMenu onClose={() => setActiveDropdown(null)} />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-white/10 bg-[rgba(2,16,46,0.96)] px-6 py-5 backdrop-blur-lg lg:hidden">
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleHashClick(e, link.href)}
                className="border-b border-white/10 py-3 text-sm font-medium text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/inquiry"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Inquiry <ArrowRight size={14} />
            </Link>
            <Link
              href="/#careers"
              onClick={(e) => handleHashClick(e, "/#careers")}
              className="flex items-center justify-between rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[color:var(--brand-blue)]"
            >
              Recruitment entry <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
