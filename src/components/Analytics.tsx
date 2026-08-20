"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

/**
 * The first-party analytics beacon.
 *
 * Sits alongside @vercel/analytics rather than replacing it. Vercel's dashboard
 * stays where it is; this one feeds the Analytics Portal, which Vercel's
 * product has no read API to supply.
 *
 * Three things are reported:
 *   pageview   on every route change, including client-side navigation, which
 *              a plain script tag in <head> would miss entirely in an app like
 *              this one
 *   pageleave  on the way out, carrying how long the page was open -- this is
 *              what makes "average time on site" and bounce rate real numbers
 *              rather than guesses
 *   vitals     LCP, CLS, INP, FCP and TTFB from real visitors
 *
 * Nothing is written to the visitor's device: no cookie, no localStorage. The
 * session id lives in a module variable for the life of the tab, and the
 * visitor identity is derived server-side from a daily-rotating hash.
 */

const ENDPOINT = "/api/collect";

/* One id per tab, per load. Not persisted anywhere, so closing the tab ends the
   session -- which is what a session means. */
const SESSION_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function send(payload: Record<string, unknown>, useBeacon = false): void {
  const body = JSON.stringify({ ...payload, sessionId: SESSION_ID });

  /* sendBeacon survives the page being torn down, which a fetch does not --
     an unload-time fetch is routinely cancelled before it leaves. It is only
     used on the way out, because it gives no way to know whether it worked. */
  if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* Analytics failing must be invisible to the visitor. */
  });
}

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* Refs, not state: these change on every navigation and none of them should
     cause a render.

     enteredAt starts at 0 rather than Date.now() because a render must be pure
     -- reading the clock there gives a different result each time React happens
     to re-render, which is both a lint error and a real source of wrong
     durations. The effect below sets it on the first pageview, which is the
     moment it actually means something. */
  const enteredAt = useRef<number>(0);
  const currentPath = useRef<string>("");
  const isFirst = useRef(true);

  useEffect(() => {
    const query = searchParams.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;

    /* React 18+ can run an effect twice in development Strict Mode. Without
       this guard every local pageview would be counted twice, and the first
       thing anyone would do is distrust the dashboard. */
    if (currentPath.current === fullPath) return;

    /* Close out the previous page before opening the next one, so a session's
       durations add up to the time actually spent. */
    if (currentPath.current && enteredAt.current > 0) {
      send({
        type: "pageleave",
        path: currentPath.current,
        durationMs: Date.now() - enteredAt.current,
      });
    }

    send({
      type: "pageview",
      path: fullPath,
      title: document.title,
      referrer: document.referrer || undefined,
      isEntry: isFirst.current,
      viewportW: window.innerWidth,
    });

    currentPath.current = fullPath;
    enteredAt.current = Date.now();
    isFirst.current = false;
  }, [pathname, searchParams]);

  useEffect(() => {
    /* visibilitychange rather than beforeunload: mobile browsers frequently
       never fire beforeunload when an app is backgrounded or the tab is
       swiped away, so relying on it would lose most phone sessions. */
    function onHidden() {
      if (
        document.visibilityState !== "hidden" ||
        !currentPath.current ||
        enteredAt.current === 0
      ) {
        return;
      }
      send(
        {
          type: "pageleave",
          path: currentPath.current,
          durationMs: Date.now() - enteredAt.current,
        },
        true,
      );
      /* Reset so returning to the tab and leaving again does not double-count
         the time that was already reported. */
      enteredAt.current = Date.now();
    }

    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  return <WebVitals />;
}

function WebVitals() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    if (!["LCP", "CLS", "INP", "FCP", "TTFB"].includes(metric.name)) return;

    send({
      type: "vitals",
      path: pathname,
      vitals: [
        {
          metric: metric.name,
          value: metric.value,
          /* next/web-vitals already classifies against Google's thresholds,
             so the rating is taken rather than recomputed. */
          rating: (metric as { rating?: string }).rating,
        },
      ],
    });
  });

  return null;
}
