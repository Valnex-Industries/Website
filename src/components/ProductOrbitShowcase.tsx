"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Thermometer,
  Zap,
  Plug,
  Cpu,
  Activity,
  Gauge,
  ShieldCheck,
  Box,
  Droplets,
  Wind,
  Scale,
  Scissors,
  Crosshair,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { CdnImage } from "@/components/CdnImage";
import { PRODUCTS, productHref, type Product, type ProductSlug } from "@/lib/products";
import { cn } from "@/utils/cn";

export interface ShowcaseSpec {
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface ShowcaseProduct {
  slug: ProductSlug;
  index: string;
  title: string;
  subtitle: string;
  summary: string;
  image: string;
  specs: ShowcaseSpec[];
  tags: string[];
}

/**
 * Curated specifications and metadata aligned with the client's design proposal.
 * When the client provides the spec HTML file, this structure is prepared for 1:1 injection.
 */
const CURATED_SHOWCASE_DATA: Record<
  string,
  {
    titleOverride?: string;
    subtitle: string;
    specs: ShowcaseSpec[];
  }
> = {
  "mould-temp": {
    titleOverride: "Temperature Control Unit",
    subtitle:
      "Precision temperature control for industrial processes with high efficiency and reliability.",
    specs: [
      {
        icon: Thermometer,
        label: "Temperature Range",
        value: "5 °C – 180 °C",
      },
      {
        icon: Zap,
        label: "Cooling Capacity",
        value: "5 – 120 kW",
      },
      {
        icon: Plug,
        label: "Power Supply",
        value: "3Φ, 415 V, 50 Hz",
      },
      {
        icon: Cpu,
        label: "Control",
        value: "PID with Touch HMI",
      },
    ],
  },
  chillers: {
    titleOverride: "Air & Water Cooled Chillers",
    subtitle:
      "Skidded industrial refrigeration systems engineered for continuous 24/7 duty cycles.",
    specs: [
      {
        icon: Zap,
        label: "Cooling Capacity",
        value: "2 – 59 TR (Air) / 65.5 TR (Water)",
      },
      {
        icon: Activity,
        label: "Process Pump Flow",
        value: "55 – 880 LPM",
      },
      {
        icon: Gauge,
        label: "Operating Pressure",
        value: "2.4 – 5.6 bar",
      },
      {
        icon: ShieldCheck,
        label: "Refrigerant",
        value: "R-22 / R-407C / R-410A",
      },
    ],
  },
  "hopper-loader": {
    titleOverride: "Vacuum Hopper Loader",
    subtitle:
      "Automated plastic granule conveying from 30 to 1200 kg/h with zero material loss.",
    specs: [
      {
        icon: Activity,
        label: "Conveying Throughput",
        value: "30 – 1200 kg/h",
      },
      {
        icon: Box,
        label: "Receiver Volume",
        value: "6 – 85 Litres",
      },
      {
        icon: Zap,
        label: "Vacuum Blower",
        value: "0.9 – 7.5 kW",
      },
      {
        icon: Plug,
        label: "Power Supply",
        value: "230 V (1Φ) / 415 V (3Φ)",
      },
    ],
  },
  dehumidifier: {
    titleOverride: "SS 304 Dehumidifier",
    subtitle:
      "Heavy-duty moisture extraction units extracting up to 500 litres per day in non-AC floors.",
    specs: [
      {
        icon: Droplets,
        label: "Moisture Extraction",
        value: "200 – 500 L / day",
      },
      {
        icon: Wind,
        label: "Air Flow Volume",
        value: "2500 – 5400 m³/h",
      },
      {
        icon: ShieldCheck,
        label: "Cabinet Material",
        value: "SS 304 Stainless Steel",
      },
      {
        icon: Plug,
        label: "Power Supply",
        value: "440 V AC, 50 Hz (3Φ)",
      },
    ],
  },
  "volumetric-feeder": {
    titleOverride: "Volumetric Dosing Feeder",
    subtitle:
      "Ultra-precise masterbatch and additive micro-dosing across five interchangeable screw sizes.",
    specs: [
      {
        icon: Scale,
        label: "Dosing Capacity",
        value: "0.004 – 73 kg/h",
      },
      {
        icon: Box,
        label: "Hopper Volume",
        value: "20 Litres",
      },
      {
        icon: Cpu,
        label: "Control System",
        value: "Microprocessor Touch Panel",
      },
      {
        icon: Plug,
        label: "Supply Voltage",
        value: "230 V AC, 50/60 Hz, 1 A",
      },
    ],
  },
  "hot-air-dryer": {
    titleOverride: "Industrial Hot Air Dryer",
    subtitle:
      "Uniform thermal desiccation designed for optimal moisture elimination in virgin and regrind resins.",
    specs: [
      {
        icon: Box,
        label: "Hopper Capacity",
        value: "12 – 800 kg",
      },
      {
        icon: Thermometer,
        label: "Heating Range",
        value: "Ambient – 160 °C",
      },
      {
        icon: Zap,
        label: "Heating Power",
        value: "2.4 – 32 kW",
      },
      {
        icon: Wind,
        label: "Blower Power",
        value: "120 – 1100 W",
      },
    ],
  },
  "flake-cutter": {
    titleOverride: "Granulator Flake Cutter",
    subtitle:
      "High-output size reduction granulator for inline sprue, runner, and reject regrind.",
    specs: [
      {
        icon: Activity,
        label: "Throughput Capacity",
        value: "100 – 1000 kg/h",
      },
      {
        icon: Zap,
        label: "Drive Motor",
        value: "4 – 57 kW (5 – 75 HP)",
      },
      {
        icon: Scissors,
        label: "Rotary Cutters",
        value: "6 – 30 High-Alloy Blades",
      },
      {
        icon: Gauge,
        label: "Cutting Chamber",
        value: "230×200 – 960×610 mm",
      },
    ],
  },
  "laser-marking": {
    titleOverride: "Fiber Laser Marking Machine",
    subtitle:
      "High-speed pulsed fiber laser for permanent inline component marking and industrial traceability.",
    specs: [
      {
        icon: Zap,
        label: "Laser Source",
        value: "30 W / 50 W Pulsed Fiber",
      },
      {
        icon: Crosshair,
        label: "Marking Area",
        value: "150 × 150 mm High Speed",
      },
      {
        icon: Eye,
        label: "Character Resolution",
        value: "Min 0.1 mm Character Height",
      },
      {
        icon: Plug,
        label: "Power Supply",
        value: "220 V AC, 50–60 Hz, 750 W",
      },
    ],
  },
};

/**
 * Fallback cutout images in `public/catalog/photos/2025/` that are clean white cutouts
 */
const CUTOUT_PHOTOS: Record<string, string> = {
  "mould-temp": "/catalog/photos/2025/mould-temperature-controller.webp",
  chillers: "/catalog/photos/2025/air-cooled-chiller.webp",
  "hopper-loader": "/catalog/photos/2025/hopper-loader.webp",
  dehumidifier: "/catalog/photos/2025/dehumidifier.webp",
  "volumetric-feeder": "/catalog/photos/2025/volumetric-feeder-single.webp",
  "hot-air-dryer": "/catalog/photos/2025/hot-air-dryer.webp",
  "flake-cutter": "/catalog/photos/2025/flake-cutter.webp",
  "laser-marking": "/catalog/photos/2025/laser-marking-machine.webp",
};

interface ProductOrbitShowcaseProps {
  products?: Product[];
}

export function ProductOrbitShowcase({ products = PRODUCTS }: ProductOrbitShowcaseProps) {
  // Build unified showcase dataset
  const items: ShowcaseProduct[] = useMemo(() => {
    return products.map((prod, idx) => {
      const curated = CURATED_SHOWCASE_DATA[prod.slug];
      const cutout = CUTOUT_PHOTOS[prod.slug] || prod.image;
      return {
        slug: prod.slug,
        index: String(idx + 1).padStart(2, "0"),
        title: curated?.titleOverride || prod.title,
        subtitle: curated?.subtitle || prod.summary,
        summary: prod.summary,
        image: cutout,
        specs: curated?.specs || [
          { icon: Zap, label: "Capacity", value: prod.specs[0]?.value || "Industrial Grade" },
          { icon: Activity, label: "Operation", value: prod.specs[1]?.value || "Continuous" },
          { icon: Plug, label: "Power", value: prod.specs[2]?.value || "415 V 3-Phase" },
          { icon: Cpu, label: "Control", value: "PID Automation" },
        ],
        tags: prod.tags,
      };
    });
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeProduct = items[activeIndex] || items[0];

  // GSAP animation references
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitAngleRef = useRef({ angle: 0 });
  const orbitTweenRef = useRef<gsap.core.Tween | null>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isHoveredRef = useRef(false);

  // Geometry configuration
  // The client requested a 30° tilted oval orbit with clockwise rotation
  const tiltDeg = -28; // -28° provides the exact diagonal slope shown in the client's mockup
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const cosTilt = Math.cos(tiltRad);
  const sinTilt = Math.sin(tiltRad);

  // Radii for the ellipse (scaled responsively in updateNodePositions)
  const currentRadiiRef = useRef({ rx: 320, ry: 180 });

  // Update satellite node positions along the 30° tilted oval orbit
  const updateNodePositions = useCallback(
    (baseAngle: number) => {
      const total = items.length;
      if (total === 0) return;

      const { rx, ry } = currentRadiiRef.current;

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;

        // Space nodes evenly around the circumference
        const nodeAngleDeg = baseAngle + (i * 360) / total;
        const phi = (nodeAngleDeg * Math.PI) / 180;

        // Parametric coordinates of untilted ellipse
        const u = rx * Math.cos(phi);
        const v = ry * Math.sin(phi);

        // Rotate coordinates by 30° tilt angle
        const x = u * cosTilt - v * sinTilt;
        const y = u * sinTilt + v * cosTilt;

        // 3D depth perspective: nodes closer to bottom-front appear subtly larger
        // Normalized z-depth based on sin(phi)
        const depth = (Math.sin(phi) + 1) / 2; // 0 (far) to 1 (near)
        const scale = 0.82 + depth * 0.28; // 0.82x to 1.1x
        const zIndex = Math.round(10 + depth * 20);

        // Apply hardware-accelerated transform directly without React re-renders
        node.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
        node.style.zIndex = String(zIndex);
      });
    },
    [items.length, cosTilt, sinTilt]
  );

  // Resize listener to adjust orbit radius dynamically based on stage width
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;

      if (width < 450) {
        currentRadiiRef.current = { rx: 145, ry: 80 };
      } else if (width < 640) {
        currentRadiiRef.current = { rx: 180, ry: 100 };
      } else if (width < 1024) {
        currentRadiiRef.current = { rx: 250, ry: 135 };
      } else if (width < 1280) {
        currentRadiiRef.current = { rx: 290, ry: 165 };
      } else {
        currentRadiiRef.current = { rx: 340, ry: 190 };
      }

      updateNodePositions(orbitAngleRef.current.angle);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateNodePositions]);

  // Main GSAP continuous clockwise orbit animation
  useEffect(() => {
    // 48 seconds per full 360° clockwise cycle (smooth, elegant award-style pacing)
    const tween = gsap.to(orbitAngleRef.current, {
      angle: "+=360",
      duration: 48,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        updateNodePositions(orbitAngleRef.current.angle);
      },
    });

    orbitTweenRef.current = tween;

    return () => {
      tween.kill();
    };
  }, [updateNodePositions]);

  // Navigate to specific product
  const selectProduct = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      const targetIndex = (index + items.length) % items.length;
      setActiveIndex(targetIndex);

      // Smoothly tween orbit angle to align target node prominently
      if (orbitTweenRef.current) {
        const step = 360 / items.length;
        const currentAngle = orbitAngleRef.current.angle;
        // Calculate nearest target angle
        const targetAngle = currentAngle + step;

        gsap.to(orbitAngleRef.current, {
          angle: targetAngle,
          duration: 0.9,
          ease: "power2.out",
          onUpdate: () => {
            updateNodePositions(orbitAngleRef.current.angle);
          },
          onComplete: () => {
            // Resume continuous rotation seamlessly
            if (!isHoveredRef.current && orbitTweenRef.current) {
              orbitTweenRef.current.play();
            }
          },
        });
      }
    },
    [items.length, updateNodePositions]
  );

  const handleNext = () => {
    selectProduct(activeIndex + 1);
  };

  const handlePrev = () => {
    selectProduct(activeIndex - 1);
  };

  // Hover handlers to slow/pause orbit on user interaction
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (orbitTweenRef.current) {
      gsap.to(orbitTweenRef.current, { timeScale: 0.15, duration: 0.5 });
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (orbitTweenRef.current) {
      gsap.to(orbitTweenRef.current, { timeScale: 1, duration: 0.8 });
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  };

  return (
    <section
      id="products"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden bg-white text-slate-900 py-16 sm:py-20 lg:py-28 focus:outline-none"
    >
      {/* Precision Blueprint Grid Overlay */}
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.04] invert"
      />

      {/* Subtle Ambient Radial Lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,rgba(0,71,225,0.03)_50%,transparent_75%)] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-14">
          {/* ── LEFT COLUMN: Specifications & Product Information ── */}
          <div className="flex flex-col justify-between lg:col-span-5 xl:col-span-5">
            <div>
              {/* Eyebrow with Brand Orange Accent Dash */}
              <div className="flex items-center gap-2.5">
                <span className="h-[2px] w-6 bg-[#f97316]" />
                <span className="font-orbitron text-xs font-bold uppercase tracking-[0.22em] text-[#02102e]">
                  Our Products
                </span>
              </div>

              {/* Dynamic Product Heading with AnimatePresence */}
              <div className="relative mt-4 min-h-[72px] sm:min-h-[88px]">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={activeProduct.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="font-orbitron text-[2rem] font-black leading-[1.05] tracking-tight text-[#02102e] sm:text-4xl xl:text-[2.75rem]"
                  >
                    {activeProduct.title}
                  </motion.h2>
                </AnimatePresence>
              </div>

              {/* Subtitle / Executive Summary */}
              <div className="relative mt-2 min-h-[48px] sm:min-h-[54px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeProduct.slug}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-normal leading-relaxed text-slate-600 sm:text-[15px]"
                  >
                    {activeProduct.subtitle}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* KEY SPECIFICATIONS Label */}
              <div className="mt-8">
                <span className="font-orbitron text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Key Specifications
                </span>

                {/* 4 Specification Cards (matching client's 2x2 / 4-card layout) */}
                <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:gap-3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProduct.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, staggerChildren: 0.05 }}
                      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1"
                    >
                      {activeProduct.specs.map((spec, sIdx) => {
                        const Icon = spec.icon;
                        return (
                          <div
                            key={sIdx}
                            className="group flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/60 bg-white text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors group-hover:border-orange-200 group-hover:text-[#f97316]">
                              <Icon size={18} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[11px] font-medium tracking-wide text-slate-500">
                                {spec.label}
                              </span>
                              <span className="font-orbitron block truncate text-xs font-bold text-slate-900 sm:text-[13px]">
                                {spec.value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom Progress, Link & Pagination Controls */}
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Pagination counter & sleek progress bar */}
              <div className="flex items-center gap-3">
                <span className="font-orbitron text-xs font-bold tracking-wider text-slate-800">
                  {activeProduct.index} <span className="text-slate-400 font-normal">/ {String(items.length).padStart(2, "0")}</span>
                </span>
                <div className="relative h-1 w-24 sm:w-28 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-[#f97316] transition-all duration-500 ease-out"
                    style={{
                      width: `${((activeIndex + 1) / items.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Link to Full Technical Catalogue Page */}
              <Link
                href={productHref(activeProduct.slug)}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 transition hover:text-[#f97316]"
              >
                <span>Full Machine Specifications</span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#f97316]"
                />
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: 30° Tilted Orbital Stage ── */}
          <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex h-[480px] w-full items-center justify-center sm:h-[560px] lg:col-span-7 lg:h-[640px] xl:col-span-7 select-none"
          >
            {/* SVG 30° Tilted Orbital Ellipse Track Line */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="-400 -300 800 600"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Subtle gradient for orbital track */}
                <linearGradient id="orbitLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0047e1" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* 30° Tilted Elliptical Ring (Rotated around center 0,0) */}
              <g transform={`rotate(${tiltDeg})`}>
                {/* Secondary faint outer blueprint ring */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="344"
                  ry="194"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="6 6"
                />
                {/* Main orbital track matching client mockup */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="320"
                  ry="180"
                  fill="none"
                  stroke="url(#orbitLineGrad)"
                  strokeWidth="1.75"
                />
              </g>
            </svg>

            {/* Central Large Circular Showcase Card */}
            <div className="relative z-20 flex h-[260px] w-[260px] items-center justify-center rounded-full border border-slate-100 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(2,16,46,0.1),0_0_0_1px_rgba(0,0,0,0.03)] sm:h-[340px] sm:w-[340px] sm:p-8 md:h-[400px] md:w-[400px] md:p-10 transition-shadow duration-500 hover:shadow-[0_25px_70px_-15px_rgba(249,115,22,0.15)]">
              {/* Subtle Ambient Radial Glow inside circle */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.06)_0%,transparent_70%)]"
              />

              {/* Active Product Image Cutout with Smooth Scale/Fade Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.slug}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-full w-full"
                >
                  <CdnImage
                    src={activeProduct.image}
                    alt={`${activeProduct.title} cutout`}
                    fill
                    sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 400px"
                    priority
                    className="object-contain filter drop-shadow-[0_15px_25px_rgba(2,16,46,0.12)] transition-transform duration-500 hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Orbiting Satellite Product Circles along 30° Tilted Oval Path */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {items.map((prod, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={prod.slug}
                    ref={(el) => {
                      nodeRefs.current[idx] = el;
                    }}
                    onClick={() => selectProduct(idx)}
                    type="button"
                    title={`View ${prod.title}`}
                    className={cn(
                      "pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 cursor-pointer items-center justify-center rounded-full border bg-white p-2 sm:p-2.5 transition-all duration-300 will-change-transform focus:outline-none focus:ring-2 focus:ring-[#f97316]",
                      isSelected
                        ? "border-[#f97316] ring-4 ring-orange-500/20 shadow-[0_10px_25px_-5px_rgba(249,115,22,0.3)]"
                        : "border-slate-200/90 shadow-[0_8px_20px_-4px_rgba(2,16,46,0.08)] hover:scale-115 hover:border-[#f97316] hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.25)]"
                    )}
                  >
                    <div className="relative h-full w-full">
                      <CdnImage
                        src={prod.image}
                        alt={prod.title}
                        fill
                        sizes="80px"
                        className="object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom-Right Navigation Arrow Buttons (matching client's proposal) */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-6 z-30 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous product"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next product"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f97316] text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 active:scale-95"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
