import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export const PRODUCTS = [
  {
    title: "Air/Water Cooled Chillers",
    image: "/assets/division_energy.png",
    href: "/#products",
  },
  {
    title: "Flake Cutter",
    image: "/assets/division_materials.png",
    href: "/#products",
  },
  {
    title: "Hopper Loader",
    image: "/assets/division_robotics.png",
    href: "/#products",
  },
  {
    title: "Laser Marking Machine",
    image: "/assets/division_energy.png",
    href: "/#products",
  },
  {
    title: "Volumetric Feeder",
    image: "/assets/division_materials.png",
    href: "/#products",
  },
  {
    title: "Mould Temp Controller",
    image: "/assets/division_energy.png",
    href: "/#products",
  },
  {
    title: "Dehumidifier",
    image: "/assets/division_robotics.png",
    href: "/#products",
  },
];

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

import { usePathname, useRouter } from "next/navigation";

export function ProductsMegaMenu({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const hash = href.replace("/", "");
      if (pathname === "/") {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", hash);
      } else {
        router.push(href);
      }
      if (onClose) onClose();
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute left-0 top-full w-full origin-top border-t border-[color:var(--brand-blue)]/10 bg-white shadow-2xl"
    >
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-10">
        <div className="grid grid-cols-12 gap-10">
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
              onClick={(e) => handleHashClick(e, "/#products")}
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
          <div className="col-span-9 grid grid-cols-4 gap-6">
            {PRODUCTS.map((product) => (
              <motion.div variants={itemVariants} key={product.title}>
                <Link
                  href={product.href}
                  onClick={(e) => handleHashClick(e, product.href)}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative w-full overflow-hidden rounded-lg bg-black/5 aspect-video">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1200px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                  </div>
                  <h3 className="text-xs font-bold leading-tight tracking-wide text-[color:var(--brand-ink)] transition-colors group-hover:text-[#f97316]">
                    {product.title}
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
