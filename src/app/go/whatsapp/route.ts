import { NextResponse, type NextRequest } from "next/server";

import { recordEvent, recordWhatsAppClick } from "@/services/analytics";
import { SITE_ORIGIN, WHATSAPP } from "@/lib/site";
import {
  clientIp,
  isBot,
  parseUserAgent,
  referrerHost,
  visitorId,
} from "@/lib/visitor";

/**
 * The tracked WhatsApp link.
 *
 * Every "WhatsApp inquiry" button on the site points here instead of straight
 * at wa.me. This handler records that the click happened and then redirects on
 * to WhatsApp, which is the only way the server can ever know about a
 * conversation that otherwise happens entirely inside Meta's app.
 *
 * What this can and cannot tell you is worth being precise about, because the
 * portal presents these as inquiries:
 *
 *   it CAN say    someone on this page, in this country, on this device, chose
 *                 to open a chat, and what message was prefilled for them
 *   it CANNOT say whether they actually pressed send, or what they wrote
 *
 * So it measures intent, not conversation. The portal's inbox says so on the
 * record itself rather than leaving someone to assume a missing reply means a
 * missed customer. Wiring up the Meta Cloud API later would add real messages
 * as a second source; the table already has the columns for it.
 *
 * The redirect is unconditional: if the write fails, the visitor still reaches
 * WhatsApp. Losing an analytics row is a nuisance; losing a customer because a
 * database was slow is not acceptable.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const product = params.get("product");
  const from = params.get("from") ?? "/";
  const custom = params.get("text");

  /* The outgoing message is built here from a slug rather than passed in as
     text, so this route cannot be used to send arbitrary prefilled content to
     the company number from a link someone else composed. */
  const message = custom && product ? custom : messageFor(product);

  const target = `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`;

  const userAgent = request.headers.get("user-agent") ?? "";

  if (!isBot(userAgent)) {
    const ip = clientIp(request.headers);
    const visitor = visitorId(ip, userAgent, new Date());
    const { device, os, browser } = parseUserAgent(userAgent);
    const country = request.headers.get("x-vercel-ip-country");
    const selfHost = new URL(SITE_ORIGIN).hostname;
    const referrer = referrerHost(request.headers.get("referer"), selfHost);

    /* Same path is recorded twice on purpose, to two different tables:
       whatsapp_inquiries is the inbox a person works through, while the event
       is what makes the click appear in the conversion figures next to form
       submissions and signups. Deriving one from the other later would mean a
       join on every dashboard load. */
    const session = params.get("s") ?? "server";

    await Promise.allSettled([
      recordWhatsAppClick({
        page_path: from.startsWith("/") ? from.slice(0, 512) : "/",
        product_slug: product,
        prefilled_message: message,
        referrer_host: referrer,
        country,
        device,
        os,
        browser,
        visitor_id: visitor,
        session_id: session,
      }),
      recordEvent({
        event: "whatsapp_click",
        visitor_id: visitor,
        session_id: session,
        path: from.startsWith("/") ? from.slice(0, 512) : "/",
        referrer_host: referrer,
        country,
        device,
        os,
        browser,
        props: { product },
      }),
    ]);
  }

  /* 307, not 308: this is not a permanent move, and a browser that cached it
     permanently would stop calling the handler and stop recording anything. */
  return NextResponse.redirect(target, 307);
}

function messageFor(product: string | null): string {
  if (!product) return WHATSAPP.message;
  return `Hello Valnex Industries, I would like to inquire about your ${product.replace(/-/g, " ")}.`;
}
