"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { HEADER_OFFSET } from "@/lib/nav";

/**
 * Navigation for the root-relative section anchors ("/#products").
 *
 * Lenis owns the scroll position, so `scrollIntoView` fights it and stutters.
 * Going through `lenis.scrollTo` keeps the jump inside the same easing as the
 * rest of the page, and lets us stop short of the fixed header.
 *
 * `before` runs synchronously first: the mobile drawer uses it to release the
 * body scroll lock, which otherwise pins the document and swallows the jump.
 */
export function useHashNav() {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();

  return useCallback(
    (
      e: React.MouseEvent<HTMLAnchorElement>,
      href: string,
      before?: () => void,
    ) => {
      if (!href.startsWith("/#")) {
        // A real page link: let <Link> do its job, just run the side effect.
        before?.();
        return;
      }

      e.preventDefault();
      before?.();

      const hash = href.slice(1);

      if (pathname !== "/") {
        router.push(href);
        return;
      }

      // One frame of slack so any drawer close / scroll unlock has landed.
      requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (!target) return;

        window.history.pushState(null, "", hash);

        if (lenis) {
          lenis.start();
          lenis.scrollTo(target as HTMLElement, {
            offset: -HEADER_OFFSET,
            duration: 1.2,
          });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    },
    [lenis, pathname, router],
  );
}
