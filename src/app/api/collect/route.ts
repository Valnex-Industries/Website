import { NextResponse, type NextRequest } from "next/server";

import { recordEvent, recordVitals } from "@/services/analytics";
import { SITE_ORIGIN } from "@/lib/site";
import {
  clientIp,
  isBot,
  parseUserAgent,
  referrerHost,
  visitorId,
} from "@/lib/visitor";

/**
 * Ingest for the first-party analytics beacon.
 *
 * Everything the client is trusted with is deliberately minimal: the path it is
 * on, the referrer the browser reported, and a session id it generated. The
 * things that decide whether a hit counts -- the visitor identity, the country,
 * the device, whether this is a bot -- are all derived HERE from request
 * headers, because a value the page sends is a value anyone can send.
 *
 * Always returns 204. A beacon that returns an error body invites a retry loop,
 * and there is nothing the page could usefully do with a failure anyway.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CONTENT = new NextResponse(null, { status: 204 });

/* A path longer than this is a tracking-parameter mess, not a page. Truncating
   keeps one bad URL from dominating the top-pages panel. */
const MAX_PATH = 512;

interface Payload {
  type?: string;
  path?: string;
  title?: string;
  referrer?: string;
  sessionId?: string;
  isEntry?: boolean;
  durationMs?: number;
  viewportW?: number;
  props?: Record<string, unknown>;
  vitals?: { metric: string; value: number; rating?: string }[];
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";

  /* Bots are dropped before anything is parsed or written. Googlebot crawling
     forty pages a night would otherwise be the shape of the traffic chart. */
  if (isBot(userAgent)) return NO_CONTENT;

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NO_CONTENT;
  }

  const rawPath = typeof body.path === "string" ? body.path : "/";
  /* Only a same-origin path is accepted. Anything else is either a bug or an
     attempt to write someone else's URL into these reports. */
  if (!rawPath.startsWith("/")) return NO_CONTENT;
  const path = rawPath.slice(0, MAX_PATH);

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.length <= 64
      ? body.sessionId
      : "unknown";

  const ip = clientIp(request.headers);
  const visitor = visitorId(ip, userAgent, new Date());
  const { device, os, browser } = parseUserAgent(userAgent);

  /* Vercel resolves these at the edge from the connecting IP, so they are free
     and more reliable than anything derived from a client-side timezone. */
  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  const city = request.headers.get("x-vercel-ip-city");

  const selfHost = new URL(SITE_ORIGIN).hostname;

  /* Web Vitals arrive on the same endpoint but go to their own table, because
     the useful statistic there is a percentile and that needs one row per
     sample rather than an event with a number attached. */
  if (body.type === "vitals" && Array.isArray(body.vitals)) {
    await recordVitals(
      body.vitals
        .filter(
          (vital) =>
            ["LCP", "CLS", "INP", "FCP", "TTFB"].includes(vital.metric) &&
            Number.isFinite(vital.value),
        )
        .map((vital) => ({
          metric: vital.metric,
          value: vital.value,
          rating: vital.rating ?? null,
          path,
          device,
          session_id: sessionId,
        })),
    );
    return NO_CONTENT;
  }

  const allowed = ["pageview", "pageleave", "inquiry_submitted", "subscribe", "outbound"];
  const event = allowed.includes(body.type ?? "") ? body.type! : "pageview";

  /* UTM values come off the path the client reported rather than being sent as
     separate fields, so they cannot disagree with the URL they claim to be from. */
  const url = new URL(path, SITE_ORIGIN);
  const utm = (key: string) => url.searchParams.get(key)?.slice(0, 120) ?? null;

  await recordEvent({
    event,
    visitor_id: visitor,
    session_id: sessionId,
    /* Stored without the query string: /products/chillers and
       /products/chillers?utm_source=x are the same page, and splitting them
       would scatter one page's pageviews across a dozen rows. */
    path: url.pathname,
    title: typeof body.title === "string" ? body.title.slice(0, 200) : null,
    referrer_host: referrerHost(body.referrer ?? null, selfHost),
    referrer_url:
      typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
    utm_content: utm("utm_content"),
    utm_term: utm("utm_term"),
    country,
    region,
    city,
    device,
    os,
    browser,
    viewport_w:
      typeof body.viewportW === "number" ? Math.round(body.viewportW) : null,
    is_entry: body.isEntry === true,
    duration_ms:
      typeof body.durationMs === "number" && body.durationMs > 0
        ? Math.min(Math.round(body.durationMs), 3_600_000)
        : null,
    props: body.props ?? {},
  });

  return NO_CONTENT;
}
