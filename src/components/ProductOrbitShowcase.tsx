"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { CdnImage } from "@/components/CdnImage";
import { PRODUCTS, productHref, type Product, type ProductSlug } from "@/lib/products";
import { cn } from "@/utils/cn";

gsap.registerPlugin(useGSAP, MotionPathPlugin);

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

interface OrbitGeometry {
  width: number;
  height: number;
  rx: number;
  ry: number;
}

interface ProductTransition {
  from: number;
  to: number;
  direction: 1 | -1;
}

interface Point {
  x: number;
  y: number;
}

interface CubicRoute {
  start: Point;
  controlOne: Point;
  controlTwo: Point;
  end: Point;
}

const ORBIT_TILT_DEG = -28;
const ORBIT_TILT_RAD = (ORBIT_TILT_DEG * Math.PI) / 180;
const ORBIT_COS = Math.cos(ORBIT_TILT_RAD);
const ORBIT_SIN = Math.sin(ORBIT_TILT_RAD);
const SHOWCASE_HOLD_SECONDS = 4.4;
const SWAP_DURATION_SECONDS = 1.15;

function makeCubicRoute(
  start: Point,
  end: Point,
  bendDirection: 1 | -1
): CubicRoute {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const bend = Math.min(118, Math.max(52, distance * 0.24)) * bendDirection;

  return {
    start,
    controlOne: {
      x: start.x + dx * 0.3 + normalX * bend,
      y: start.y + dy * 0.3 + normalY * bend,
    },
    controlTwo: {
      x: start.x + dx * 0.72 + normalX * bend,
      y: start.y + dy * 0.72 + normalY * bend,
    },
    end,
  };
}

function routePath(route: CubicRoute, offset = 0) {
  const point = ({ x, y }: Point) => `${x - offset},${y - offset}`;
  return `M${point(route.start)} C${point(route.controlOne)} ${point(route.controlTwo)} ${point(route.end)}`;
}

export function ProductOrbitShowcase({ products = PRODUCTS }: ProductOrbitShowcaseProps) {
  const items: ShowcaseProduct[] = useMemo(() => {
    const catalogue = products.length > 0 ? products : PRODUCTS;

    return catalogue.map((prod, idx) => {
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
  const [transition, setTransition] = useState<ProductTransition | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [geometry, setGeometry] = useState<OrbitGeometry>({
    width: 720,
    height: 680,
    rx: 330,
    ry: 230,
  });
  const activeProduct = items[activeIndex] ?? items[0];

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const incomingPodRef = useRef<HTMLDivElement>(null);
  const outgoingPodRef = useRef<HTMLDivElement>(null);
  const incomingPathRef = useRef<SVGPathElement>(null);
  const outgoingPathRef = useRef<SVGPathElement>(null);
  const orbitAngleRef = useRef({ angle: 0 });
  const orbitTweenRef = useRef<gsap.core.Tween | null>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const geometryRef = useRef(geometry);
  const slotByProductRef = useRef(items.map((_, index) => index));
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const hasAnimatedCopyRef = useRef(false);

  const updateNodePositions = useCallback(
    (baseAngle: number) => {
      const total = items.length;
      if (total === 0) return;

      const { rx, ry } = geometryRef.current;

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;

        const slot = slotByProductRef.current[i] ?? i;
        const nodeAngleDeg = baseAngle + (slot * 360) / total;
        const phi = (nodeAngleDeg * Math.PI) / 180;
        const u = rx * Math.cos(phi);
        const v = ry * Math.sin(phi);
        const x = u * ORBIT_COS - v * ORBIT_SIN;
        const y = u * ORBIT_SIN + v * ORBIT_COS;
        const depth = (Math.sin(phi) + 1) / 2;
        const scale = 0.88 + depth * 0.18;

        node.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
        node.style.zIndex = String(Math.round(12 + depth * 16));
        node.style.setProperty("--orbit-depth", depth.toFixed(3));
      });
    },
    [items.length]
  );

  useEffect(() => {
    const stage = stageRef.current;
    const center = centerRef.current;
    if (!stage || !center) return;

    const measure = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const centerSize = center.offsetWidth;
      const satelliteSize = nodeRefs.current.find(Boolean)?.offsetWidth ?? 48;
      if (!width || !height || !centerSize) return;

      const satelliteRadius = satelliteSize / 2;
      const edgeInset = width < 480 ? 10 : 14;
      const centerClearance = width < 480 ? 12 : 18;
      const minimumRadius = centerSize / 2 + satelliteRadius + centerClearance;
      const availableX = width / 2 - satelliteRadius - edgeInset;
      const availableY = height / 2 - satelliteRadius - edgeInset;

      let ry = Math.min(
        Math.max(minimumRadius, Math.min(height * 0.34, width * 0.33)),
        availableY - 4
      );
      const solveMaxRx = () => {
        const fromX = Math.sqrt(
          Math.max(0, (availableX ** 2 - (ry * ORBIT_SIN) ** 2) / ORBIT_COS ** 2)
        );
        const fromY = Math.sqrt(
          Math.max(0, (availableY ** 2 - (ry * ORBIT_COS) ** 2) / ORBIT_SIN ** 2)
        );
        return Math.min(width * 0.46, fromX, fromY);
      };

      let rx = solveMaxRx();
      if (rx < ry * 1.08) {
        ry = Math.max(minimumRadius, Math.min(ry, rx / 1.08));
        rx = solveMaxRx();
      }

      const nextGeometry = {
        width: Math.round(width),
        height: Math.round(height),
        rx: Math.round(Math.max(rx, ry * 1.06) * 10) / 10,
        ry: Math.round(ry * 10) / 10,
      };

      geometryRef.current = nextGeometry;
      setGeometry((current) => {
        if (
          current.width === nextGeometry.width &&
          current.height === nextGeometry.height &&
          current.rx === nextGeometry.rx &&
          current.ry === nextGeometry.ry
        ) {
          return current;
        }
        return nextGeometry;
      });
      updateNodePositions(orbitAngleRef.current.angle);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(center);
    const frame = requestAnimationFrame(measure);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [updateNodePositions]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reduceMotionRef.current = media.matches;
      setReduceMotion(media.matches);
    };

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.12 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      updateNodePositions(orbitAngleRef.current.angle);
      const tween = gsap.to(orbitAngleRef.current, {
        angle: "+=360",
        duration: 58,
        ease: "none",
        repeat: -1,
        paused: true,
        onUpdate: () => updateNodePositions(orbitAngleRef.current.angle),
      });

      orbitTweenRef.current = tween;
      return () => {
        tween.kill();
        orbitTweenRef.current = null;
      };
    },
    { dependencies: [items.length], scope: stageRef, revertOnUpdate: true }
  );

  useEffect(() => {
    const orbit = orbitTweenRef.current;
    if (!orbit) return;

    if (isInView && !transition && !reduceMotion) orbit.play();
    else orbit.pause();
  }, [isInView, reduceMotion, transition]);

  const requestTransition = useCallback(
    (index: number) => {
      if (items.length === 0 || isTransitioningRef.current) return;
      const targetIndex = (index + items.length) % items.length;
      const currentIndex = activeIndexRef.current;
      if (targetIndex === currentIndex) return;

      orbitTweenRef.current?.pause();

      if (reduceMotionRef.current) {
        const slots = slotByProductRef.current;
        [slots[currentIndex], slots[targetIndex]] = [slots[targetIndex], slots[currentIndex]];
        activeIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);
        requestAnimationFrame(() => updateNodePositions(orbitAngleRef.current.angle));
        return;
      }

      const clockwiseDistance = (targetIndex - currentIndex + items.length) % items.length;
      isTransitioningRef.current = true;
      setTransition({
        from: currentIndex,
        to: targetIndex,
        direction: clockwiseDistance <= items.length / 2 ? 1 : -1,
      });
    },
    [items.length, updateNodePositions]
  );

  useGSAP(
    () => {
      if (!transition) return;

      const stage = stageRef.current;
      const center = centerRef.current;
      const copy = copyRef.current;
      const source = nodeRefs.current[transition.to];
      const incomingPod = incomingPodRef.current;
      const outgoingPod = outgoingPodRef.current;
      const incomingPath = incomingPathRef.current;
      const outgoingPath = outgoingPathRef.current;

      if (
        !stage ||
        !center ||
        !copy ||
        !source ||
        !incomingPod ||
        !outgoingPod ||
        !incomingPath ||
        !outgoingPath
      ) {
        activeIndexRef.current = transition.to;
        setActiveIndex(transition.to);
        setTransition(null);
        isTransitioningRef.current = false;
        return;
      }

      orbitTweenRef.current?.pause();

      const stageRect = stage.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();
      const centerRect = center.getBoundingClientRect();
      const sourcePoint = {
        x: sourceRect.left - stageRect.left + sourceRect.width / 2,
        y: sourceRect.top - stageRect.top + sourceRect.height / 2,
      };
      const centerPoint = {
        x: centerRect.left - stageRect.left + centerRect.width / 2,
        y: centerRect.top - stageRect.top + centerRect.height / 2,
      };
      const podRadius = centerRect.width / 2;
      const satelliteScale = sourceRect.width / centerRect.width;
      const side = sourcePoint.x < centerPoint.x ? 1 : -1;
      const incomingRoute = makeCubicRoute(
        sourcePoint,
        centerPoint,
        (side * transition.direction) as 1 | -1
      );
      const outgoingRoute = makeCubicRoute(
        centerPoint,
        sourcePoint,
        (-side * transition.direction) as 1 | -1
      );

      incomingPath.setAttribute("d", routePath(incomingRoute));
      outgoingPath.setAttribute("d", routePath(outgoingRoute));

      const incomingLength = incomingPath.getTotalLength();
      const outgoingLength = outgoingPath.getTotalLength();
      gsap.set(incomingPath, {
        autoAlpha: 1,
        strokeDasharray: incomingLength,
        strokeDashoffset: incomingLength,
      });
      gsap.set(outgoingPath, {
        autoAlpha: 0.7,
        strokeDasharray: outgoingLength,
        strokeDashoffset: outgoingLength,
      });
      gsap.set(incomingPod, {
        autoAlpha: 1,
        scale: satelliteScale,
        transformOrigin: "50% 50%",
        x: sourcePoint.x - podRadius,
        y: sourcePoint.y - podRadius,
      });
      gsap.set(outgoingPod, {
        autoAlpha: 1,
        scale: 1,
        transformOrigin: "50% 50%",
        x: centerPoint.x - podRadius,
        y: centerPoint.y - podRadius,
      });
      gsap.set([source, center], { autoAlpha: 0 });
      gsap.set(copy, { pointerEvents: "none" });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          const slots = slotByProductRef.current;
          [slots[transition.from], slots[transition.to]] = [
            slots[transition.to],
            slots[transition.from],
          ];
          updateNodePositions(orbitAngleRef.current.angle);
          activeIndexRef.current = transition.to;
          setActiveIndex(transition.to);
          setTransition(null);
          isTransitioningRef.current = false;
        },
      });

      timeline
        .to(copy, { autoAlpha: 0, duration: 0.2, y: -8, ease: "power2.in" }, 0.9)
        .to(
          incomingPath,
          { duration: 0.72, strokeDashoffset: 0, ease: "power2.out" },
          0
        )
        .to(
          outgoingPath,
          { duration: 0.72, strokeDashoffset: 0, ease: "power2.out" },
          0.08
        )
        .to(
          incomingPod,
          {
            duration: SWAP_DURATION_SECONDS,
            ease: "power3.inOut",
            motionPath: { path: routePath(incomingRoute, podRadius) },
            scale: 1,
          },
          0.04
        )
        .to(
          outgoingPod,
          {
            duration: SWAP_DURATION_SECONDS,
            ease: "power3.inOut",
            motionPath: { path: routePath(outgoingRoute, podRadius) },
            scale: satelliteScale,
          },
          0.04
        )
        .to(
          [incomingPath, outgoingPath],
          { autoAlpha: 0, duration: 0.28, ease: "power1.out" },
          0.84
        )
        .to(outgoingPod, { autoAlpha: 0.82, duration: 0.16 }, 1.01);

      return () => timeline.kill();
    },
    {
      dependencies: [transition],
      scope: stageRef,
      revertOnUpdate: true,
    }
  );

  useGSAP(
    () => {
      if (!copyRef.current) return;
      if (!hasAnimatedCopyRef.current) {
        hasAnimatedCopyRef.current = true;
        return;
      }
      if (reduceMotion) return;

      const targets = copyRef.current.querySelectorAll<HTMLElement>("[data-product-copy]");
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          duration: 0.48,
          ease: "power3.out",
          stagger: 0.055,
          y: 0,
        }
      );
    },
    {
      dependencies: [activeIndex, reduceMotion],
      scope: copyRef,
      revertOnUpdate: true,
    }
  );

  useGSAP(
    () => {
      const progress = progressRef.current;
      if (!progress) return;

      gsap.set(progress, { scaleX: 0, transformOrigin: "left center" });
      if (!isInView || isFocusWithin || transition || reduceMotion) return;

      const timer = gsap.to(progress, {
        duration: SHOWCASE_HOLD_SECONDS,
        ease: "none",
        scaleX: 1,
        onComplete: () => requestTransition(activeIndexRef.current + 1),
      });

      return () => timer.kill();
    },
    {
      dependencies: [activeIndex, isFocusWithin, isInView, reduceMotion, transition],
      scope: sectionRef,
      revertOnUpdate: true,
    }
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      requestTransition(activeIndexRef.current + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      requestTransition(activeIndexRef.current - 1);
    }
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusWithin(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="products"
      aria-labelledby="product-showcase-title"
      className="relative overflow-hidden bg-[#fbfcfe] py-16 text-slate-900 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.045] invert"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-0 h-[780px] w-[780px] rounded-full bg-[radial-gradient(circle,rgba(0,71,225,0.065)_0%,rgba(249,115,22,0.035)_42%,transparent_72%)] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-12 xl:gap-12">
          <article className="flex flex-col justify-between xl:col-span-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-0.5 w-7 rounded-full bg-[#f97316]" />
                <span className="font-orbitron text-[11px] font-bold uppercase tracking-[0.24em] text-[#02102e] sm:text-xs">
                  Our Products
                </span>
              </div>

              <div ref={copyRef} aria-live="polite" aria-atomic="true">
                <div className="relative mt-5 min-h-[72px] sm:min-h-[88px]">
                  <h2
                    id="product-showcase-title"
                    data-product-copy
                    className="font-orbitron max-w-[15ch] text-[2rem] font-black leading-[1.04] tracking-[-0.035em] text-[#02102e] sm:text-[2.65rem] xl:text-[2.8rem]"
                  >
                    {activeProduct.title}
                  </h2>
                </div>

                <div className="relative mt-2 min-h-[48px] sm:min-h-[54px]">
                  <p
                    data-product-copy
                    className="max-w-[58ch] text-sm font-normal leading-relaxed text-slate-600 sm:text-[15px]"
                  >
                    {activeProduct.subtitle}
                  </p>
                </div>

                <div data-product-copy className="mt-7">
                  <span className="font-orbitron text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400 sm:text-[11px]">
                    Key Specifications
                  </span>
                  <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                    {activeProduct.specs.map((spec) => {
                      const Icon = spec.icon;
                      return (
                        <div
                          key={spec.label}
                          className="group relative grid min-h-[66px] grid-cols-[42px_1fr] items-center gap-3 overflow-hidden rounded-[0.9rem] border border-slate-200/80 bg-white/75 p-3 transition-colors duration-300 before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:bg-[#f97316] before:opacity-0 before:transition-opacity hover:border-orange-200 hover:bg-white hover:before:opacity-100"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-[0.7rem] border border-slate-200 bg-[#f8fafc] text-[#233557] shadow-[0_2px_5px_rgba(2,16,46,0.06)] transition-colors duration-300 group-hover:border-orange-200 group-hover:text-[#f97316]">
                            <Icon size={19} strokeWidth={2.1} />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-medium tracking-wide text-slate-500 sm:text-[11px]">
                              {spec.label}
                            </span>
                            <span className="font-orbitron block text-[11px] font-bold leading-snug text-slate-900 sm:text-xs">
                              {spec.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="font-orbitron text-xs font-bold tabular-nums tracking-wider text-slate-800">
                  {activeProduct.index}{" "}
                  <span className="font-normal text-slate-400">
                    / {String(items.length).padStart(2, "0")}
                  </span>
                </span>
                <div className="relative h-1 w-24 overflow-hidden rounded-full bg-slate-200 sm:w-32">
                  <span
                    ref={progressRef}
                    className="absolute inset-0 block rounded-full bg-[#f97316]"
                  />
                </div>
              </div>

              <Link
                href={productHref(activeProduct.slug)}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 transition-colors hover:text-[#f97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-4"
              >
                <span>Full Machine Specifications</span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#f97316]"
                />
              </Link>
            </div>
          </article>

          <div
            ref={stageRef}
            role="group"
            tabIndex={0}
            aria-label="Interactive clockwise product orbit. Use left and right arrow keys to change the showcased product."
            onKeyDown={handleKeyDown}
            onFocusCapture={() => setIsFocusWithin(true)}
            onBlurCapture={handleBlurCapture}
            className="relative isolate flex h-[500px] w-full select-none items-center justify-center overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.98)_0%,rgba(246,248,252,0.94)_46%,rgba(238,243,250,0.9)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-4 sm:h-[570px] md:h-[620px] xl:col-span-7 xl:h-[680px]"
          >
            <div
              aria-hidden="true"
              className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.035] invert"
            />
            <div className="pointer-events-none absolute left-4 top-4 z-40 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 backdrop-blur-md sm:left-6 sm:top-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f97316] opacity-40 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#f97316]" />
              </span>
              <span className="font-orbitron text-[8px] font-bold uppercase tracking-[0.18em] text-[#02102e] sm:text-[9px]">
                Clockwise system
              </span>
            </div>
            <div className="pointer-events-none absolute right-4 top-4 z-40 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 font-orbitron text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500 backdrop-blur-md sm:right-6 sm:top-6 sm:text-[9px]">
              {reduceMotion ? "Manual mode" : "4.4s dwell"}
            </div>

            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            >
              <defs>
                <linearGradient id="orbitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.68" />
                  <stop offset="48%" stopColor="#94a3b8" stopOpacity="0.36" />
                  <stop offset="100%" stopColor="#0047e1" stopOpacity="0.56" />
                </linearGradient>
              </defs>

              <g
                transform={`translate(${geometry.width / 2} ${geometry.height / 2}) rotate(${ORBIT_TILT_DEG})`}
              >
                <ellipse
                  cx="0"
                  cy="0"
                  rx={geometry.rx + 15}
                  ry={geometry.ry + 15}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 8"
                  opacity="0.23"
                  vectorEffect="non-scaling-stroke"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx={geometry.rx}
                  ry={geometry.ry}
                  fill="none"
                  stroke="url(#orbitGrad)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx={geometry.rx} cy="0" r="3" fill="#f97316" opacity="0.85" />
                <circle cx={-geometry.rx} cy="0" r="2" fill="#94a3b8" opacity="0.55" />
                <circle cx="0" cy={geometry.ry} r="2" fill="#0047e1" opacity="0.6" />
                <circle cx="0" cy={-geometry.ry} r="2" fill="#94a3b8" opacity="0.5" />
              </g>

              <path
                ref={outgoingPathRef}
                fill="none"
                stroke="#0047e1"
                strokeWidth="1.25"
                strokeLinecap="round"
                opacity="0"
                vectorEffect="non-scaling-stroke"
              />
              <path
                ref={incomingPathRef}
                fill="none"
                stroke="#f97316"
                strokeWidth="1.75"
                strokeLinecap="round"
                opacity="0"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.13)_0%,rgba(0,71,225,0.055)_48%,transparent_72%)] blur-xl sm:h-[280px] sm:w-[280px] md:h-[340px] md:w-[340px] xl:h-[405px] xl:w-[405px]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[204px] w-[204px] rounded-full border border-dashed border-slate-300/55 sm:h-[258px] sm:w-[258px] md:h-[312px] md:w-[312px] xl:h-[382px] xl:w-[382px]"
            />

            <div
              ref={centerRef}
              className="relative z-30 flex h-[180px] w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_26px_70px_-22px_rgba(2,16,46,0.3),0_0_0_6px_rgba(255,255,255,0.72)] sm:h-[230px] sm:w-[230px] md:h-[280px] md:w-[280px] xl:h-[340px] xl:w-[340px] 2xl:h-[365px] 2xl:w-[365px]"
            >
              <span className="pointer-events-none absolute left-[15%] top-[14%] z-20 font-orbitron text-[8px] font-bold tracking-[0.2em] text-slate-400 sm:text-[9px]">
                VX / {activeProduct.index}
              </span>
              <div className="relative h-[86%] w-[86%]">
                <CdnImage
                  src={activeProduct.image}
                  alt={`${activeProduct.title} product view`}
                  fill
                  sizes="(max-width: 640px) 150px, (max-width: 1280px) 240px, 310px"
                  priority
                  className="object-contain drop-shadow-[0_18px_24px_rgba(2,16,46,0.16)]"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {items.map((prod, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={prod.slug}
                    ref={(el) => {
                      nodeRefs.current[idx] = el;
                    }}
                    onClick={(event) => {
                      if (event.detail > 0) event.currentTarget.blur();
                      requestTransition(idx);
                    }}
                    type="button"
                    title={prod.title}
                    aria-label={`Show ${prod.title}`}
                    aria-pressed={isSelected}
                    tabIndex={isSelected ? -1 : 0}
                    className={cn(
                      "group pointer-events-auto absolute left-1/2 top-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border bg-white p-1.5 shadow-[0_8px_20px_-8px_rgba(2,16,46,0.28)] transition-[border-color,box-shadow,opacity] duration-300 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 sm:h-12 sm:w-12 sm:p-2 md:h-14 md:w-14 xl:h-16 xl:w-16 2xl:h-[66px] 2xl:w-[66px]",
                      isSelected
                        ? "pointer-events-none opacity-0"
                        : "border-slate-200/90 opacity-100 hover:border-[#f97316] hover:shadow-[0_10px_24px_-8px_rgba(249,115,22,0.42)]"
                    )}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-110">
                      <CdnImage
                        src={prod.image}
                        alt={prod.title}
                        fill
                        sizes="80px"
                        className="object-contain drop-shadow-[0_2px_4px_rgba(2,16,46,0.1)]"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {transition ? (
              <div className="pointer-events-none absolute inset-0 z-50" aria-hidden="true">
                <div
                  ref={outgoingPodRef}
                  className="invisible absolute left-0 top-0 flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white opacity-0 shadow-[0_26px_70px_-22px_rgba(2,16,46,0.3),0_0_0_6px_rgba(255,255,255,0.72)] will-change-transform sm:h-[230px] sm:w-[230px] md:h-[280px] md:w-[280px] xl:h-[340px] xl:w-[340px] 2xl:h-[365px] 2xl:w-[365px]"
                >
                  <div className="relative h-[86%] w-[86%]">
                    <CdnImage
                      src={items[transition.from].image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 150px, (max-width: 1280px) 240px, 310px"
                      className="object-contain drop-shadow-[0_18px_24px_rgba(2,16,46,0.16)]"
                    />
                  </div>
                </div>
                <div
                  ref={incomingPodRef}
                  className="invisible absolute left-0 top-0 flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full border border-[#f97316] bg-white opacity-0 shadow-[0_26px_70px_-22px_rgba(249,115,22,0.38),0_0_0_5px_rgba(249,115,22,0.12)] will-change-transform sm:h-[230px] sm:w-[230px] md:h-[280px] md:w-[280px] xl:h-[340px] xl:w-[340px] 2xl:h-[365px] 2xl:w-[365px]"
                >
                  <div className="relative h-[86%] w-[86%]">
                    <CdnImage
                      src={items[transition.to].image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain drop-shadow-[0_18px_24px_rgba(2,16,46,0.16)]"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2.5 sm:bottom-6 sm:right-6">
              <button
                type="button"
                onClick={(event) => {
                  if (event.detail > 0) event.currentTarget.blur();
                  requestTransition(activeIndexRef.current - 1);
                }}
                aria-label="Previous product"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-[0_6px_16px_-6px_rgba(2,16,46,0.3)] backdrop-blur transition-[transform,border-color,background-color] hover:border-slate-300 hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] sm:h-11 sm:w-11"
              >
                <ChevronLeft size={19} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  if (event.detail > 0) event.currentTarget.blur();
                  requestTransition(activeIndexRef.current + 1);
                }}
                aria-label="Next product"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] text-white shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] transition-[transform,background-color] hover:bg-orange-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 sm:h-11 sm:w-11"
              >
                <ChevronRight size={19} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
