import "server-only";

import { createHash } from "node:crypto";

/**
 * Deriving a visitor identity without tracking anyone.
 *
 * The problem: counting *visitors* rather than *pageviews* needs some way to
 * recognise two requests as the same person. The usual answer is a cookie,
 * which means a consent banner and a durable identifier that follows someone
 * around.
 *
 * What this does instead is hash the IP, the user-agent, a server-side secret,
 * and **the date**. Because the date is in the hash, the identifier changes at
 * midnight and cannot link a person's Monday to their Tuesday. It is not
 * reversible to an IP without the secret, the raw IP is never written to the
 * database, and nothing is stored on the visitor's device.
 *
 * The cost is honest and worth stating: daily-unique counts are slightly
 * inflated over a multi-day range (one person visiting on three days counts as
 * three), and people behind the same corporate NAT with the same browser
 * version collapse into one. This is the same trade Plausible and Vercel's own
 * cookieless mode make.
 */

/** Salt rotates only if you change it; the date in the hash does the rotating. */
function salt(): string {
  return (
    process.env.ANALYTICS_SALT ??
    /* A missing salt weakens the hash rather than breaking the site, so the
       fallback is a constant and the log line says what to fix. */
    "valnex-unsalted-set-ANALYTICS_SALT"
  );
}

export function visitorId(
  ip: string,
  userAgent: string,
  now = new Date(),
): string {
  /* Bucketed by date in the reporting timezone, so the identifier rolls over
     at Indian midnight rather than in the middle of the Indian evening. */
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return createHash("sha256")
    .update(`${salt()}|${day}|${ip}|${userAgent}`)
    .digest("hex")
    .slice(0, 32);
}

/** Same construction, for consent evidence on a newsletter signup. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${salt()}|ip|${ip}`).digest("hex").slice(0, 32);
}

/**
 * Client IP behind Vercel's proxy. `x-forwarded-for` is a comma-separated
 * chain and the first entry is the original client; the rest are proxies.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * Device class from the user-agent.
 *
 * Deliberately crude. A full UA-parsing library is a large dependency and a
 * monthly update treadmill to answer a question this dashboard only needs three
 * buckets for. "iPad" before "Mobile" because iPadOS reports both.
 */
export function parseUserAgent(ua: string): {
  device: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
} {
  const device = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)
    ? "tablet"
    : /Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)
      ? "mobile"
      : "desktop";

  const os = /Windows NT/i.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/i.test(ua)
      ? "macOS"
      : /Android/i.test(ua)
        ? "Android"
        : /iPhone|iPad|iPod/i.test(ua)
          ? "iOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Other";

  /* Order matters: Edge's UA contains "Chrome", Chrome's contains "Safari".
     Checking the most specific first is what keeps them apart. */
  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\//i.test(ua)
      ? "Opera"
      : /SamsungBrowser/i.test(ua)
        ? "Samsung Internet"
        : /Firefox\//i.test(ua)
          ? "Firefox"
          : /Chrome\//i.test(ua)
            ? "Chrome"
            : /Safari\//i.test(ua)
              ? "Safari"
              : "Other";

  return { device, os, browser };
}

/**
 * Obvious bots, kept out of the numbers.
 *
 * Not exhaustive and not meant to be -- an arms race against every crawler
 * would be lost. It removes the high-volume ones that would otherwise make the
 * traffic chart a picture of Googlebot's crawl schedule.
 */
const BOT_RE =
  /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|headless|lighthouse|pingdom|gtmetrix|semrush|ahrefs|dataprovider|python-requests|curl|wget|axios|node-fetch|monitoring/i;

export function isBot(ua: string): boolean {
  return !ua || BOT_RE.test(ua);
}

/** Hostname of a referrer, or null when it is missing or same-origin. */
export function referrerHost(
  referrer: string | null,
  selfHost: string,
): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    /* Internal navigation is not a referral. Counting it would put the site's
       own hostname at the top of its own referrers panel. */
    return host === selfHost.replace(/^www\./, "") ? null : host;
  } catch {
    return null;
  }
}
