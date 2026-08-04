/**
 * Canonical identity for the site — one place for the facts that appear in
 * metadata, structured data, llms.txt and the footer.
 *
 * Everything here is verified. Nothing on this page may be a placeholder:
 * structured data is consumed verbatim by search engines, answer engines and
 * LLM crawlers, so an invented figure here is republished as fact. Claims the
 * company has not confirmed (founding year, headcount, plant count) are
 * deliberately absent rather than guessed.
 */

/**
 * www is the canonical host: the apex 308-redirects to it at the edge, so a
 * canonical naming the apex would point at a URL that never serves content.
 *
 * www rather than the apex because GoDaddy has no ALIAS/CNAME-flattening
 * record, so the apex is pinned to a hardcoded A record while www stays a
 * CNAME that Vercel can repoint on its own. Cookies set on an apex are also
 * visible to every subdomain, which www avoids.
 *
 * This is the *site* host only — email stays on the apex domain.
 *
 * Do not flip this after launch. Switching canonical host once Google has
 * indexed the site forces a full reprocess and costs rankings in the interim.
 */
export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.valnexindustries.com"
).replace(/\/$/, "");

export function siteUrl(path = "/"): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "Valnex Industries";

export const SITE_TAGLINE = "Precision That Powers Progress";

export const SITE_DESCRIPTION =
  "Valnex Industries engineers advanced chillers, flake cutters, hopper loaders, laser marking machines, volumetric feeders, mould temperature controllers, and dehumidifiers for the world's most demanding production lines.";

/**
 * Facts that tie the website to the Google Business Profile / Maps listing.
 *
 * All optional and all omitted from structured data until filled: a wrong pin
 * or wrong opening hours on a map listing is materially worse than none, since
 * customers act on it. Fill these from the verified profile, not from a guess.
 */
export const BUSINESS = {
  /** Exact pin. Take it from the verified profile, or right-click the pin in
   *  Google Maps → the first menu item is "lat, lng". */
  geo: null as { latitude: number; longitude: number } | null,

  /** Canonical Maps URL of the listing, once verified. */
  mapUrl: null as string | null,

  /** e.g. [{ days: ["Monday", …, "Saturday"], opens: "09:30", closes: "18:30" }] */
  openingHours: [] as {
    days: string[];
    opens: string;
    closes: string;
  }[],

  /** Profiles Google can use to corroborate the same entity: LinkedIn,
   *  IndiaMART, Justdial, the Maps listing itself. */
  sameAs: [] as string[],
} as const;

/**
 * wa.me wants the number as digits only, country code first — it rejects the
 * "+", the spaces and the dashes that CONTACT.phones is formatted with, so the
 * two cannot share a string. This is the same line as CONTACT.phones[0].
 */
export const WHATSAPP = {
  number: "917574848748",
  message:
    "Hello Valnex Industries, I would like to inquire about your equipment.",
} as const;

/** Prefilled chat link. Pass a message to deep-link a specific product. */
export function whatsappHref(message: string = WHATSAPP.message) {
  return `https://wa.me/${WHATSAPP.number}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  email: "info@valnexindustries.com",
  phones: ["+91 7574848748", "+91 94294 81086"],
  address: {
    street: "3, Maruti Industrial Park-2, Dhamatvan Bakrol Road",
    locality: "Dhamatvan, Ahmedabad",
    region: "Gujarat",
    postalCode: "382435",
    country: "IN",
    /** Single-line form, as printed in the footer. */
    full: "3, Maruti Industrial Park-2, Dhamatvan Bakrol Road, Dhamatvan, Ahmedabad-382435, Gujarat, INDIA.",
  },
} as const;
