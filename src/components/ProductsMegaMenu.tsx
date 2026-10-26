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

          {/* Grid */}
          <div className="col-span-9 grid grid-cols-3 gap-5 xl:grid-cols-4 xl:gap-6">
            {PRODUCT_LINKS.map((product) => (
              <motion.div variants={itemVariants} key={product.label}>
                <Link
                  href={product.href}
                  onClick={(e) => navigate(e, product.href, onClose)}
                  className="group flex flex-col gap-3"
                >
                  {/* Contain, not cover: product images are square studio
                      shots, and a 16:9 cover crop cut the top and feet off
                      every machine. The tile is filled with the renders'
                      own backdrop colour so the side bands read as more
                      studio rather than as letterboxing. */}
                  <div className="relative w-full overflow-hidden rounded-lg bg-[#08131f] aspect-video">
                    <Image
                      src={product.image}
                      alt={product.label}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1280px) 20vw, 16vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                  </div>
                  <h3 className="text-xs font-bold leading-tight tracking-wide text-[color:var(--brand-ink)] transition-colors group-hover:text-[#f97316]">
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
