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
import { useGSAP } from "@gsap/react";
import { CdnImage } from "@/components/CdnImage";
import { PRODUCTS, productHref, type Product, type ProductSlug } from "@/lib/products";
import { cn } from "@/utils/cn";

gsap.registerPlugin(useGSAP);

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
 * Prepared for 1:1 replacement when the incoming HTML file is supplied.
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
  const items: ShowcaseProduct[] = useMemo(() => {
    return products.map((prod, idx) => {
      const curated = CURATED_SHOWCASE_DATA[prod.slug];
      const cutout = CUTOUT_PHOTOS[prod.slug] || prod.image;
      return {
        slug: prod.slug as ProductSlug,
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

  // Exact 30° tilted elliptical geometry (-28° diagonal slope as in reference drawing)
  const tiltDeg = -28;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const cosTilt = Math.cos(tiltRad);
  const sinTilt = Math.sin(tiltRad);

  // Dynamic responsive orbital radii
  const currentRadiiRef = useRef({ rx: 380, ry: 240 });

  // Update satellite node positions along the 30° tilted oval orbit
  const updateNodePositions = useCallback(
    (baseAngle: number) => {
      const total = items.length;
      if (total === 0) return;

      const { rx, ry } = currentRadiiRef.current;

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;

        // Equal angular distribution along perimeter
        const nodeAngleDeg = baseAngle + (i * 360) / total;
        const phi = (nodeAngleDeg * Math.PI) / 180;

        // Parametric coordinates of untilted ellipse
        const u = rx * Math.cos(phi);
        const v = ry * Math.sin(phi);

        // Rotate coordinates by 30° tilt angle
        const x = u * cosTilt - v * sinTilt;
        const y = u * sinTilt + v * cosTilt;

        // Depth perspective
        const depth = (Math.sin(phi) + 1) / 2; // 0 (far) to 1 (near)
        const scale = 0.88 + depth * 0.22; // 0.88x to 1.1x
        const zIndex = Math.round(15 + depth * 20);

        // Hardware-accelerated 3D transform directly on DOM (0 React re-renders)
        node.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
        node.style.zIndex = String(zIndex);
      });
    },
    [items.length, cosTilt, sinTilt]
  );

  // Responsive radii calculator based on container width
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;

      if (width < 450) {
        currentRadiiRef.current = { rx: 155, ry: 105 };
      } else if (width < 640) {
        currentRadiiRef.current = { rx: 200, ry: 130 };
      } else if (width < 1024) {
        currentRadiiRef.current = { rx: 280, ry: 175 };
      } else if (width < 1360) {
        currentRadiiRef.current = { rx: 340, ry: 215 };
      } else {
        currentRadiiRef.current = { rx: 395, ry: 245 };
      }

      updateNodePositions(orbitAngleRef.current.angle);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateNodePositions]);

  // Main GSAP continuous clockwise orbit animation using official useGSAP hook
  useGSAP(
    () => {
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
    },
    { scope: containerRef }
  );

  // Smoothly select product and align orbit
  const selectProduct = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      const targetIndex = (index + items.length) % items.length;
      setActiveIndex(targetIndex);

      if (orbitTweenRef.current) {
        const step = 360 / items.length;
        const currentAngle = orbitAngleRef.current.angle;
        const targetAngle = currentAngle + step;

        gsap.to(orbitAngleRef.current, {
          angle: targetAngle,
          duration: 0.85,
          ease: "power2.out",
          onUpdate: () => {
            updateNodePositions(orbitAngleRef.current.angle);
          },
          onComplete: () => {
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

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (orbitTweenRef.current) {
      gsap.to(orbitTweenRef.current, { timeScale: 0.15, duration: 0.4 });
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (orbitTweenRef.current) {
      gsap.to(orbitTweenRef.current, { timeScale: 1, duration: 0.6 });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
  };

  return (
    <section
      id="products"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden bg-white text-slate-900 py-16 sm:py-20 lg:py-24 focus:outline-none"
    >
      {/* Precision Blueprint Grid Overlay */}
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.04] invert"
      />

      {/* Ambient Radial Brand Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08)_0%,rgba(0,71,225,0.04)_50%,transparent_75%)] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          
          {/* ── LEFT COLUMN: Specifications & Product Information ── */}
          <div className="flex flex-col justify-between lg:col-span-5 xl:col-span-5">
            <div>
              {/* Eyebrow with Brand Orange Accent Dash */}
              <div className="flex items-center gap-2.5">
                <span className="h-[2.5px] w-7 bg-[#f97316] rounded-full" />
                <span className="font-orbitron text-xs font-bold uppercase tracking-[0.24em] text-[#02102e]">
                  Our Products
                </span>
              </div>

              {/* Dynamic Product Heading */}
              <div className="relative mt-4 min-h-[72px] sm:min-h-[88px]">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={activeProduct.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="font-orbitron text-[2.1rem] font-black leading-[1.04] tracking-tight text-[#02102e] sm:text-4xl xl:text-[2.85rem]"
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

              {/* KEY SPECIFICATIONS */}
              <div className="mt-8">
                <span className="font-orbitron text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Key Specifications
                </span>

                {/* 4 Specification Cards */}
                <div className="mt-3.5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeProduct.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, staggerChildren: 0.05 }}
                      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:gap-3"
                    >
                      {activeProduct.specs.map((spec, sIdx) => {
                        const Icon = spec.icon;
                        return (
                          <div
                            key={sIdx}
                            className="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all duration-300 hover:border-orange-300 hover:bg-white hover:shadow-md"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-700 shadow-sm transition-all duration-300 group-hover:border-orange-300 group-hover:bg-orange-50 group-hover:text-[#f97316]">
                              <Icon size={19} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-[11px] font-medium tracking-wide text-slate-500">
                                {spec.label}
                              </span>
                              <span className="font-orbitron block truncate text-xs font-bold text-slate-900 sm:text-sm">
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
                  {activeProduct.index}{" "}
                  <span className="text-slate-400 font-normal">
                    / {String(items.length).padStart(2, "0")}
                  </span>
                </span>
                <div className="relative h-1.5 w-24 sm:w-32 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-[#f97316] transition-all duration-500 ease-out rounded-full"
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

          {/* ── RIGHT COLUMN: Enlarged 30° Tilted Orbital Stage with Perfect Circular Mask Clipping ── */}
          <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative flex h-[520px] w-full items-center justify-center sm:h-[600px] lg:col-span-7 lg:h-[680px] xl:col-span-7 select-none overflow-visible"
          >
            {/* SVG 30° Tilted Orbital Ellipse Track with CAD Precision */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="-500 -380 1000 760"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0047e1" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* 30° Tilted Elliptical Ring */}
              <g transform={`rotate(${tiltDeg})`}>
                {/* Secondary outer dashed CAD guide */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="418"
                  ry="268"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="1.2"
                  strokeDasharray="6 6"
                />
                {/* Main orbital track */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx="395"
                  ry="245"
                  fill="none"
                  stroke="url(#orbitGrad)"
                  strokeWidth="2"
                />
                {/* Cardinal tick marks */}
                <circle cx="395" cy="0" r="3" fill="#f97316" opacity="0.6" />
                <circle cx="-395" cy="0" r="3" fill="#cbd5e1" opacity="0.6" />
                <circle cx="0" cy="245" r="3" fill="#0047e1" opacity="0.6" />
                <circle cx="0" cy="-245" r="3" fill="#cbd5e1" opacity="0.6" />
              </g>
            </svg>

            {/* Glowing Ambient Halo Behind the Central Stage */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] lg:h-[500px] lg:w-[500px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,rgba(0,71,225,0.06)_50%,transparent_72%)] blur-2xl"
            />

            {/* ── Central Large Circular Showcase Card (PERFECTLY CLIPPED) ── */}
            <div
              style={{
                clipPath: "circle(50% at 50% 50%)",
                WebkitClipPath: "circle(50% at 50% 50%)",
              }}
              className="relative z-20 flex h-[290px] w-[290px] sm:h-[380px] sm:w-[380px] md:h-[450px] md:w-[450px] lg:h-[490px] lg:w-[490px] xl:h-[520px] xl:w-[520px] shrink-0 items-center justify-center rounded-full border-2 border-slate-200/80 bg-white shadow-[0_30px_80px_-15px_rgba(2,16,46,0.12),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_35px_90px_-15px_rgba(249,115,22,0.2)]"
            >
              {/* Subtle inner radial vignette */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.04)_0%,rgba(2,16,46,0.02)_60%,rgba(0,0,0,0.04)_100%)] z-10"
              />

              {/* Active Product Image (Enlarged, Heroic, and strictly clipped by circular viewport) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.slug}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[115%] w-[115%] flex items-center justify-center p-3 sm:p-5"
                >
                  <CdnImage
                    src={activeProduct.image}
                    alt={`${activeProduct.title} showcase`}
                    fill
                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 420px, 540px"
                    priority
                    className="object-contain filter drop-shadow-[0_20px_35px_rgba(2,16,46,0.14)] transition-transform duration-700 hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Orbiting Satellite Product Circles along 30° Tilted Path (PERFECTLY CLIPPED) ── */}
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
                    title={prod.title}
                    style={{
                      clipPath: "circle(50% at 50% 50%)",
                      WebkitClipPath: "circle(50% at 50% 50%)",
                    }}
                    className={cn(
                      "group pointer-events-auto absolute left-1/2 top-1/2 flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-26 lg:w-26 cursor-pointer items-center justify-center rounded-full border-2 bg-white p-2.5 sm:p-3 overflow-hidden transition-all duration-300 will-change-transform focus:outline-none focus:ring-4 focus:ring-orange-500/25",
                      isSelected
                        ? "border-[#f97316] ring-4 ring-orange-500/25 shadow-[0_14px_30px_rgba(249,115,22,0.35)] scale-110"
                        : "border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(2,16,46,0.1)] hover:scale-120 hover:border-[#f97316] hover:shadow-[0_14px_32px_rgba(249,115,22,0.28)]"
                    )}
                  >
                    <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-full">
                      <CdnImage
                        src={prod.image}
                        alt={prod.title}
                        fill
                        sizes="100px"
                        className="object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom-Right Navigation Arrow Controls */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-6 z-40 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous product"
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next product"
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#f97316] text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 active:scale-95"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
