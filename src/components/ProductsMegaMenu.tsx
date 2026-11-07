"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { PRODUCT_LINKS } from "@/lib/nav";
import { useHashNav } from "@/lib/use-hash-nav";
import { MENU_IN, MENU_OUT } from "@/lib/motion";
import { cn } from "@/utils/cn";

/* The header's white layer runs on the same MENU_IN / MENU_OUT, so the bar
   and this panel arrive and leave as one sheet. */
const containerVariants: Variants = {
  hidden: { opacity: 0, y: -8, transition: MENU_OUT },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...MENU_IN, staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  /* Reset only once the panel has faded, so the tiles never blink out ahead
     of the sheet they sit on and leave it empty for a frame. */
  hidden: { opacity: 0, y: 15, transition: { duration: 0, delay: MENU_OUT.duration } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * Stays mounted once the Navbar has rendered it, and is shown and hidden
 * through `open` rather than mounted on hover. Mounting on hover meant the
 * eight thumbnails only started downloading when the menu was already on
 * screen, so it opened onto empty tiles that filled in late.
 */
export function ProductsMegaMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose?: () => void;
}) {
  const navigate = useHashNav();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={open ? "visible" : "hidden"}
      inert={!open}
      aria-hidden={!open}
      className={cn(
        "absolute left-0 top-full hidden w-full origin-top border-t border-[color:var(--brand-blue)]/10 bg-white shadow-2xl xl:block",
        !open && "pointer-events-none",
      )}
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-10">
        <div className="grid grid-cols-12 gap-8 xl:gap-10">
          {/* Sidebar */}
          <motion.div variants={itemVariants} className="col-span-3 border-r border-black/5 pr-8">
            <h2 className="text-2xl font-black tracking-tight text-[color:var(--brand-ink)]">
              Products
            </h2>
            <p className="mt-2 text-sm font-medium text-[color:var(--brand-ink)]/50">
              Our Business
            </p>
            <Link
              href="/#products"
              onClick={(e) => navigate(e, "/#products", onClose)}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f97316]"
            >
              View all products
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          {/* Compact square thumbnails keep the full machine visible while the
              surrounding link remains the larger click target. */}
          <div className="col-span-9 grid grid-cols-4 gap-x-4 gap-y-3">
            {PRODUCT_LINKS.map((product) => (
              <motion.div variants={itemVariants} key={product.label}>
                <Link
                  href={product.href}
                  onClick={(e) => navigate(e, product.href, onClose)}
                  className="group flex min-h-20 items-center gap-3 rounded-xl p-2 transition-colors duration-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-[#08131f]">
                    <Image
                      src={product.image}
                      alt={product.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="64px"
                    />
                  </div>
                  <h3 className="text-xs font-bold leading-snug tracking-wide text-[color:var(--brand-ink)] transition-colors group-hover:text-[#f97316]">
                    {product.label}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
