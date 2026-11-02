"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { HEADER_OFFSET } from "@/lib/nav";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Ensures smooth scroll state stays in sync across Next.js App Router navigations.
 *
 * Lenis maintains virtual scroll position in a continuous requestAnimationFrame loop.
 * During client-side route transitions, Next.js swaps out the page components, but
 * Lenis remains mounted in the root layout. Without this listener:
 *   1. Navigating from a scrolled homepage to a product page leaves the product page
 *      scrolled midway down at the previous page's offset.
 *   2. Clicking cross-links near the bottom of a product page (e.g. from flake cutter
 *      down to chillers) opens the destination page at that same 3500px offset,
 *      landing directly in the footer.
 *
 * This component:
 *   - Snaps virtual and native scroll to (0, 0) immediately before paint on route changes.
 *   - Recalculates page dimensions with `lenis.resize()`.
 *   - Unsticks any stopped scroll state with `lenis.start()`.
 *   - Preserves back/forward history scroll restoration via popstate detection.
 *   - Handles in-page and cross-page anchor scrolling (e.g. /#products) with header offset.
 */
function ScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  const isPopStateRef = useRef(false);
  const initialMountRef = useRef(true);

  // Track browser back/forward history navigation so we don't clobber restored positions
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
      setTimeout(() => {
        if (lenis) {
          lenis.start();
          lenis.scrollTo(window.scrollY, { immediate: true });
          lenis.resize();
        }
        isPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [lenis]);

  // Handle in-page hash changes (e.g. clicking /#contact while already on /)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const target = document.querySelector(hash);
      if (target && lenis) {
        lenis.start();
        lenis.scrollTo(target as HTMLElement, {
          offset: -HEADER_OFFSET,
          duration: 1.2,
        });
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [lenis]);

  // Handle route / pathname transitions
  useIsomorphicLayoutEffect(() => {
    // On the very first mount, skip unless there is an anchor hash to jump to
    if (initialMountRef.current) {
      initialMountRef.current = false;
      if (!window.location.hash) return;
    }

    // If navigation was triggered by browser Back/Forward, let popstate handler deal with it
    if (isPopStateRef.current) return;

    const hash = window.location.hash;

    if (hash) {
      let attempts = 0;
      const maxAttempts = 15;

      const scrollToTarget = () => {
        const target = document.querySelector(hash);
        if (target) {
          if (lenis) {
            lenis.start();
            lenis.scrollTo(target as HTMLElement, {
              offset: -HEADER_OFFSET,
              immediate: true,
            });
            lenis.resize();
          } else {
            target.scrollIntoView();
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          requestAnimationFrame(scrollToTarget);
        }
      };

      requestAnimationFrame(scrollToTarget);
    } else {
      // Normal route transition without hash: immediately reset scroll to top before paint
      if (lenis) {
        lenis.start();
        lenis.scrollTo(0, { immediate: true });
        requestAnimationFrame(() => {
          lenis.resize();
        });
      }
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
