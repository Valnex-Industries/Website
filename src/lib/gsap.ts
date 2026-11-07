"use client";

/**
 * GSAP, registered once for every component that imports it from here.
 *
 * GSAP owns the two pinned, scroll-scrubbed sequences on /about; everything
 * else on the site stays on Framer Motion. The two never animate the same
 * element.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** The single media query every GSAP sequence on the site is gated on, so a
 *  reduced-motion visitor gets the finished layout with no pinning at all. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
