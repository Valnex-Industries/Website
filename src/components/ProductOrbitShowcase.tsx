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

interface OrbitLengthLookup {
  cumulative: Float64Array;
  steps: number;
  total: number;
}

interface OrbitPlacement extends Point {
  depth: number;
  scale: number;
  tangent: Point;
}

interface RouteTangents {
  end?: Point;
  start?: Point;
}

const ORBIT_TILT_DEG = -28;
const ORBIT_TILT_RAD = (ORBIT_TILT_DEG * Math.PI) / 180;
const ORBIT_COS = Math.cos(ORBIT_TILT_RAD);
const ORBIT_SIN = Math.sin(ORBIT_TILT_RAD);
const SHOWCASE_HOLD_SECONDS = 4.4;
const SWAP_DURATION_SECONDS = 1.15;
const SWAP_MOTION_DELAY_SECONDS = 0.04;
const ORBIT_REVOLUTION_SECONDS = 58;
const ORBIT_LENGTH_STEPS = 360;

function buildOrbitLengthLookup(rx: number, ry: number): OrbitLengthLookup {
  const cumulative = new Float64Array(ORBIT_LENGTH_STEPS + 1);
  let previousX = rx;
  let previousY = 0;

  for (let index = 1; index <= ORBIT_LENGTH_STEPS; index += 1) {
    const angle = (index / ORBIT_LENGTH_STEPS) * Math.PI * 2;
    const x = rx * Math.cos(angle);
    const y = ry * Math.sin(angle);
    cumulative[index] = cumulative[index - 1] + Math.hypot(x - previousX, y - previousY);
    previousX = x;
    previousY = y;
  }

  return {
    cumulative,
    steps: ORBIT_LENGTH_STEPS,
    total: cumulative[ORBIT_LENGTH_STEPS],
  };
}

function orbitAngleAtProgress(progress: number, lookup: OrbitLengthLookup) {
  const normalized = ((progress % 1) + 1) % 1;
  const targetLength = normalized * lookup.total;
  let low = 1;
  let high = lookup.steps;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (lookup.cumulative[middle] < targetLength) low = middle + 1;
    else high = middle;
  }

  const previousLength = lookup.cumulative[low - 1];
  const segmentLength = lookup.cumulative[low] - previousLength;
  const segmentProgress = segmentLength ? (targetLength - previousLength) / segmentLength : 0;
  return ((low - 1 + segmentProgress) / lookup.steps) * Math.PI * 2;
}

function orbitPlacementAtProgress(
  progress: number,
  geometry: Pick<OrbitGeometry, "rx" | "ry">,
  lookup: OrbitLengthLookup
): OrbitPlacement {
  const phi = orbitAngleAtProgress(progress, lookup);
  const u = geometry.rx * Math.cos(phi);
  const v = geometry.ry * Math.sin(phi);
  const derivativeU = -geometry.rx * Math.sin(phi);
  const derivativeV = geometry.ry * Math.cos(phi);
  const tangentX = derivativeU * ORBIT_COS - derivativeV * ORBIT_SIN;
  const tangentY = derivativeU * ORBIT_SIN + derivativeV * ORBIT_COS;
  const tangentLength = Math.max(Math.hypot(tangentX, tangentY), 1);
  const depth = (Math.sin(phi) + 1) / 2;

  return {
    x: u * ORBIT_COS - v * ORBIT_SIN,
    y: u * ORBIT_SIN + v * ORBIT_COS,
    depth,
    scale: 0.88 + depth * 0.18,
    tangent: {
      x: tangentX / tangentLength,
      y: tangentY / tangentLength,
    },
  };
}

function makeCubicRoute(
  start: Point,
  end: Point,
  bendDirection: 1 | -1,
  tangents: RouteTangents = {}
): CubicRoute {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const normalX = -dy / distance;
  const normalY = dx / distance;
  const bend = Math.min(118, Math.max(52, distance * 0.24)) * bendDirection;
  const tangentHandle = Math.min(104, Math.max(48, distance * 0.28));

  return {
    start,
    controlOne: tangents.start
      ? {
          x: start.x + tangents.start.x * tangentHandle,
          y: start.y + tangents.start.y * tangentHandle,
        }
      : {
          x: start.x + dx * 0.3 + normalX * bend,
          y: start.y + dy * 0.3 + normalY * bend,
        },
    controlTwo: tangents.end
      ? {
          x: end.x - tangents.end.x * tangentHandle,
          y: end.y - tangents.end.y * tangentHandle,
        }
      : {
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
  const orbitAngleRef = useRef({ angle: 0 });
  const orbitTweenRef = useRef<gsap.core.Tween | null>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const geometryRef = useRef(geometry);
  const orbitLengthRef = useRef(buildOrbitLengthLookup(geometry.rx, geometry.ry));
  const slotByProductRef = useRef(items.map((_, index) => (index === 0 ? 0 : index - 1)));
  const activeIndexRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const hasAnimatedCopyRef = useRef(false);

  const updateNodePositions = useCallback(
    (baseAngle: number) => {
      const total = items.length;
      if (total === 0) return;
      const visibleSlots = Math.max(total - 1, 1);

      const { rx, ry } = geometryRef.current;

      nodeRefs.current.forEach((node, i) => {
        if (!node) return;

        const slot = slotByProductRef.current[i] ?? i;
        const progress = baseAngle / 360 + slot / visibleSlots;
        const placement = orbitPlacementAtProgress(progress, { rx, ry }, orbitLengthRef.current);

        node.style.transform = `translate3d(calc(-50% + ${placement.x.toFixed(1)}px), calc(-50% + ${placement.y.toFixed(1)}px), 0) scale(${placement.scale.toFixed(3)})`;
        node.style.zIndex = String(Math.round(12 + placement.depth * 16));
        node.style.setProperty("--orbit-depth", placement.depth.toFixed(3));
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

      const section = sectionRef.current;
      if (section) {
        const sectionRect = section.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        stage.style.setProperty("--product-grid-x", `${sectionRect.left - stageRect.left}px`);
        stage.style.setProperty("--product-grid-y", `${sectionRect.top - stageRect.top}px`);
      }

      const satelliteRadius = satelliteSize / 2;
      const edgeInset = width < 480 ? 8 : 14;
      const centerClearance = width < 480 ? 8 : 18;
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
      orbitLengthRef.current = buildOrbitLengthLookup(nextGeometry.rx, nextGeometry.ry);
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
        duration: ORBIT_REVOLUTION_SECONDS,
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

    if (isInView && !reduceMotion) orbit.play();
    else orbit.pause();
  }, [isInView, reduceMotion]);

  const requestTransition = useCallback(
    (index: number) => {
      if (items.length === 0 || isTransitioningRef.current) return;
      const targetIndex = (index + items.length) % items.length;
      const currentIndex = activeIndexRef.current;
      if (targetIndex === currentIndex) return;

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

      if (
        !stage ||
        !center ||
        !copy ||
        !source ||
        !incomingPod ||
        !outgoingPod
      ) {
        activeIndexRef.current = transition.to;
        setActiveIndex(transition.to);
        setTransition(null);
        isTransitioningRef.current = false;
        return;
      }

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
      const visibleSlots = Math.max(items.length - 1, 1);
      const targetSlot = slotByProductRef.current[transition.to] ?? 0;
      const startingAngle = orbitAngleRef.current.angle;
      const arrivalAngle =
        startingAngle +
        ((SWAP_DURATION_SECONDS + SWAP_MOTION_DELAY_SECONDS) /
          ORBIT_REVOLUTION_SECONDS) *
          360;
      const startingPlacement = orbitPlacementAtProgress(
        startingAngle / 360 + targetSlot / visibleSlots,
        geometryRef.current,
        orbitLengthRef.current
      );
      const arrivalPlacement = orbitPlacementAtProgress(
        arrivalAngle / 360 + targetSlot / visibleSlots,
        geometryRef.current,
        orbitLengthRef.current
      );
      const targetEndPoint = {
        x: centerPoint.x + arrivalPlacement.x,
        y: centerPoint.y + arrivalPlacement.y,
      };
      const endingSatelliteScale =
        (source.offsetWidth * arrivalPlacement.scale) / centerRect.width;
      const side = sourcePoint.x < centerPoint.x ? 1 : -1;
      const incomingRoute = makeCubicRoute(
        sourcePoint,
        centerPoint,
        (side * transition.direction) as 1 | -1,
        { start: startingPlacement.tangent }
      );
      const outgoingRoute = makeCubicRoute(
        centerPoint,
        targetEndPoint,
        (-side * transition.direction) as 1 | -1,
        { end: arrivalPlacement.tangent }
      );
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
          incomingPod,
          {
            duration: SWAP_DURATION_SECONDS,
            ease: "power3.inOut",
            motionPath: { path: routePath(incomingRoute, podRadius) },
            scale: 1,
          },
          SWAP_MOTION_DELAY_SECONDS
        )
        .to(
          outgoingPod,
          {
            duration: SWAP_DURATION_SECONDS,
            ease: "power3.inOut",
            motionPath: { path: routePath(outgoingRoute, podRadius) },
            scale: endingSatelliteScale,
          },
          SWAP_MOTION_DELAY_SECONDS
        );

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
      gsap.set(copyRef.current, { autoAlpha: 1, y: 0, pointerEvents: "auto" });
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
      className="relative overflow-hidden bg-[#fbfcfe] text-slate-900 scroll-mt-0 pt-16 pb-8 sm:pt-20 sm:pb-12 lg:pt-20 lg:pb-6 xl:pt-20 xl:pb-8 lg:min-h-screen flex flex-col justify-center"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid product-orbit-grid pointer-events-none absolute inset-0 opacity-[0.045] invert"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-0 h-[780px] w-[780px] rounded-full bg-[radial-gradient(circle,rgba(0,71,225,0.065)_0%,rgba(249,115,22,0.035)_42%,transparent_72%)] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 items-center gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <article className="flex flex-col justify-between lg:col-span-5">
            <div>
              {/* Eyebrow Tag: visible on both mobile and desktop */}
              <div className="flex items-center gap-2.5">
                <span className="h-0.5 w-6 rounded-full bg-[#f97316] sm:w-7" />
                <span className="font-orbitron text-[10px] font-bold uppercase tracking-[0.24em] text-[#02102e] sm:text-xs">
                  Our Products
                </span>
              </div>

              <div ref={copyRef} aria-live="polite" aria-atomic="true">
                {/* Product Title: visible on both mobile and desktop */}
                <div className="relative mt-2 min-h-[38px] xs:min-h-[44px] sm:min-h-[54px] lg:mt-3 lg:min-h-[58px] xl:mt-4 xl:min-h-[72px]">
                  <h2
                    id="product-showcase-title"
                    data-product-copy
                    className="font-orbitron max-w-[15ch] text-[1.65rem] xs:text-[1.85rem] sm:text-[2.2rem] lg:text-[2.1rem] xl:text-[2.5rem] 2xl:text-[2.8rem] font-black leading-[1.06] tracking-[-0.035em] text-[#02102e]"
                  >
                    {activeProduct.title}
                  </h2>
                </div>

                {/* One-Liner Subtitle: visible on both mobile and desktop */}
                <div className="relative mt-1 min-h-[32px] sm:min-h-[38px] lg:mt-2 lg:min-h-[42px] xl:min-h-[48px]">
                  <p
                    data-product-copy
                    className="max-w-[58ch] text-[11.5px] xs:text-xs sm:text-sm font-normal leading-relaxed text-slate-600 line-clamp-2 sm:line-clamp-none lg:text-[13px] xl:text-[14.5px]"
                  >
                    {activeProduct.subtitle}
                  </p>
                </div>

                <div className="hidden lg:block mt-3 lg:mt-4 xl:mt-5">
                  <span className="font-orbitron text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400 sm:text-[11px]">
                    Key Specifications
                  </span>
                </div>

                {/* The Four Technical Characteristics (TCs) */}
                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:mt-3 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-1 lg:mt-2.5 lg:gap-2 xl:mt-3.5 xl:gap-2.5">
                  {activeProduct.specs.map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div
                        key={spec.label}
                        data-product-copy
                        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/75 bg-white/95 px-3 py-2 shadow-[0_2px_8px_rgba(2,16,46,0.05)] backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:bg-white hover:shadow-md sm:px-3.5 sm:py-2.5 lg:grid lg:grid-cols-[38px_1fr] lg:p-2 xl:p-2.5 xl:grid-cols-[42px_1fr] 2xl:p-3 xl:min-h-[58px] 2xl:min-h-[64px]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-[#f8fafc] text-[#233557] shadow-sm transition-colors duration-300 group-hover:border-orange-200 group-hover:text-[#f97316] sm:h-10 sm:w-10 lg:h-9 lg:w-9 xl:h-10 xl:w-10 xl:rounded-[0.7rem] xl:border-slate-200">
                          <Icon size={18} strokeWidth={2.1} className="sm:h-[19px] sm:w-[19px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-medium tracking-wide text-slate-500 sm:text-[11px] lg:text-[10px] xl:text-[11px]">
                            {spec.label}
                          </span>
                          <span className="font-orbitron block text-[11px] font-bold leading-snug text-slate-900 sm:text-xs lg:text-xs xl:text-xs 2xl:text-sm">
                            {spec.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Counter and Specifications Link */}
            <div className="mt-2.5 flex flex-col gap-1 sm:mt-3 sm:gap-1.5 lg:mt-3 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-slate-200/80 lg:pt-3 xl:mt-5 xl:pt-4 2xl:mt-7 2xl:pt-5">
              <div className="flex items-center gap-3">
                <span className="font-orbitron text-xs font-bold tabular-nums tracking-wider text-slate-800">
                  {activeProduct.index}{" "}
                  <span className="font-normal text-slate-400">
                    / {String(items.length).padStart(2, "0")}
                  </span>
                </span>
                <div className="relative h-1 w-20 overflow-hidden rounded-full bg-slate-200 sm:w-28 xl:w-32">
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
            data-orbit-stage
            role="group"
            tabIndex={0}
            aria-label="Interactive clockwise product orbit. Use left and right arrow keys to change the showcased product."
            onKeyDown={handleKeyDown}
            onFocusCapture={() => setIsFocusWithin(true)}
            onBlurCapture={handleBlurCapture}
            className="relative isolate flex h-[350px] xs:h-[380px] sm:h-[440px] md:h-[480px] lg:col-span-7 lg:h-[min(500px,60vh)] xl:h-[min(580px,68vh)] 2xl:h-[660px] w-full select-none items-center justify-center overflow-hidden rounded-[1.75rem] sm:rounded-3xl border border-slate-200/80 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,0.98)_0%,rgba(246,248,252,0.94)_46%,rgba(238,243,250,0.9)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-4"
          >
            <div
              aria-hidden="true"
              className="blueprint-grid product-orbit-grid-stage pointer-events-none absolute inset-0 opacity-[0.035] invert"
            />

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
                  rx={geometry.rx}
                  ry={geometry.ry}
                  fill="none"
                  stroke="url(#orbitGrad)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            </svg>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[170px] w-[170px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.13)_0%,rgba(0,71,225,0.055)_48%,transparent_72%)] blur-xl sm:h-[230px] sm:w-[230px] lg:h-[260px] lg:w-[260px] xl:h-[320px] xl:w-[320px] 2xl:h-[380px] 2xl:w-[380px]"
            />

            <div
              ref={centerRef}
              data-orbit-center
              className="relative z-30 flex h-[140px] w-[140px] xs:h-[155px] xs:w-[155px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_26px_70px_-22px_rgba(2,16,46,0.3),0_0_0_5px_rgba(255,255,255,0.72)] sm:h-[190px] sm:w-[190px] sm:shadow-[0_26px_70px_-22px_rgba(2,16,46,0.3),0_0_0_6px_rgba(255,255,255,0.72)] md:h-[230px] md:w-[230px] lg:h-[240px] lg:w-[240px] xl:h-[290px] xl:w-[290px] 2xl:h-[340px] 2xl:w-[340px]"
            >
              <div className="relative h-full w-full">
                <CdnImage
                  src={activeProduct.image}
                  alt={`${activeProduct.title} product view`}
                  fill
                  sizes="(max-width: 640px) 150px, (max-width: 1280px) 240px, 310px"
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {items.map((prod, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={prod.slug}
                    data-orbit-node
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
                      "group pointer-events-auto absolute left-1/2 top-1/2 flex h-10 w-10 xs:h-11 xs:w-11 cursor-pointer items-center justify-center rounded-full border bg-white p-1.5 shadow-[0_6px_16px_-6px_rgba(2,16,46,0.25)] transition-[border-color,box-shadow,opacity] duration-300 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 sm:h-12 sm:w-12 sm:p-2 lg:h-11 lg:w-11 xl:h-13 xl:w-13 2xl:h-15 2xl:w-15",
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
                  className="invisible absolute left-0 top-0 flex h-[140px] w-[140px] xs:h-[155px] xs:w-[155px] items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white opacity-0 shadow-[0_26px_70px_-22px_rgba(2,16,46,0.3),0_0_0_5px_rgba(255,255,255,0.72)] will-change-transform sm:h-[190px] sm:w-[190px] sm:shadow-[0_26px_70px_-22px_rgba(2,16,46,0.3),0_0_0_6px_rgba(255,255,255,0.72)] md:h-[230px] md:w-[230px] lg:h-[240px] lg:w-[240px] xl:h-[290px] xl:w-[290px] 2xl:h-[340px] 2xl:w-[340px]"
                >
                  <div className="relative h-full w-full">
                    <CdnImage
                      src={items[transition.from].image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 150px, (max-width: 1280px) 240px, 310px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div
                  ref={incomingPodRef}
                  className="invisible absolute left-0 top-0 flex h-[140px] w-[140px] xs:h-[155px] xs:w-[155px] items-center justify-center overflow-hidden rounded-full border border-[#f97316] bg-white opacity-0 shadow-[0_26px_70px_-22px_rgba(249,115,22,0.38),0_0_0_5px_rgba(249,115,22,0.12)] will-change-transform sm:h-[190px] sm:w-[190px] md:h-[230px] md:w-[230px] lg:h-[240px] lg:w-[240px] xl:h-[290px] xl:w-[290px] 2xl:h-[340px] 2xl:w-[340px]"
                >
                  <div className="relative h-full w-full">
                    <CdnImage
                      src={items[transition.to].image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 150px, (max-width: 1280px) 240px, 310px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="absolute bottom-3 right-3 z-40 flex items-center gap-2 sm:bottom-4 sm:right-4 sm:gap-2.5 xl:bottom-6 xl:right-6">
              <button
                type="button"
                onClick={(event) => {
                  if (event.detail > 0) event.currentTarget.blur();
                  requestTransition(activeIndexRef.current - 1);
                }}
                aria-label="Previous product"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-[0_4px_14px_-4px_rgba(2,16,46,0.25)] backdrop-blur transition-[transform,border-color,background-color] hover:border-slate-300 hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] sm:h-10 sm:w-10 xl:h-11 xl:w-11"
              >
                <ChevronLeft size={18} strokeWidth={2.4} className="sm:h-[19px] sm:w-[19px]" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  if (event.detail > 0) event.currentTarget.blur();
                  requestTransition(activeIndexRef.current + 1);
                }}
                aria-label="Next product"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f97316] text-white shadow-[0_6px_18px_-4px_rgba(249,115,22,0.55)] transition-[transform,background-color] hover:bg-orange-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 sm:h-10 sm:w-10 xl:h-11 xl:w-11"
              >
                <ChevronRight size={18} strokeWidth={2.4} className="sm:h-[19px] sm:w-[19px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
