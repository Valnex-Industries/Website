"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { PRODUCT_LINKS } from "@/lib/nav";
import { useHashNav } from "@/lib/use-hash-nav";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function ProductsMegaMenu({ onClose }: { onClose?: () => void }) {
  const navigate = useHashNav();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute left-0 top-full hidden w-full origin-top border-t border-[color:var(--brand-blue)]/10 bg-white shadow-2xl lg:block"
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
                  <div className="relative w-full overflow-hidden rounded-lg bg-black/5 aspect-video">
                    <Image
                      src={product.image}
                      alt={product.label}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
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
