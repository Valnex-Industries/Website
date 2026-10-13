import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bitcount_Prop_Single, Exo_2, Orbitron } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Analytics as PortalAnalytics } from "@/components/Analytics";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, webSiteSchema } from "@/lib/schema";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_TAGLINE,
} from "@/lib/site";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Self-hosted and preloaded by next/font rather than pulled from
   fonts.googleapis.com. Orbitron sets every heading and the hero marquee, so
   it is on the critical path and must not wait on a third-party origin. */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

/* The hero's corner statements. Same reasoning as Orbitron: it used to be a
   render-blocking @import of fonts.googleapis.com in globals.css, worth about
   0.9s of mobile first paint. Only the wght axis is loaded, as before, so the
   extra axes named in `.font-bitcount` keep their defaults. */
const bitcount = Bitcount_Prop_Single({
  variable: "--font-bitcount",
  subsets: ["latin"],
  display: "swap",
  /* next/font has no metrics to size-match a fallback for this face. */
  adjustFontFallback: false,
  fallback: ["system-ui"],
});

export const metadata: Metadata = {
  /* Lets every route below express canonical and image URLs as relative paths
     and still emit absolute ones, which is what crawlers require. */
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    /* Child routes set only their own name and inherit the suffix. */
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: [
    "industrial chillers",
    "air cooled chiller",
    "water cooled chiller",
    "flake cutter",
    "hopper loader",
    "laser marking machine",
    "volumetric feeder",
    "mould temperature controller",
    "industrial dehumidifier",
    "plastic processing equipment",
    "Ahmedabad",
    "Gujarat",
    "India",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  /* Ownership proof for Google Search Console and Bing Webmaster Tools, which
     is what lets the sitemap be submitted and pages be requested for
     indexing. A DNS TXT record (a Search Console "Domain" property) is the
     better route and needs no deploy; these exist for when DNS is not to
     hand. Each tag is emitted only when its variable is set. */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Deliberately not capping maximumScale: pinch zoom is an accessibility
     affordance, and the layout holds up when it is used. */
  colorScheme: "dark",
  themeColor: "#02102e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning: the Preloader's inline script may set
       data-intro on <html> before React hydrates. It covers this element's own
       attributes only, not its children. */
    <html
      lang="en"
      className={`${exo2.variable} ${orbitron.variable} ${bitcount.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Site-wide identity, carried on every route so any page can be the
            one a crawler or answer engine lands on first. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
        {/* Both inject nothing in dev and no-op off Vercel, so they are safe to
            leave mounted everywhere. Speed Insights reports field Core Web
            Vitals from real visitors — the number to watch is LCP. */}
        <Analytics />
        <SpeedInsights />
        {/* The first-party beacon that feeds the Analytics Portal. It does not
            replace the two above: Vercel's dashboards stay where they are, but
            neither product has a read API, so the portal has to measure the
            site itself. Suspense because it reads useSearchParams, which would
            otherwise opt every page into client-side rendering. */}
        <Suspense fallback={null}>
          <PortalAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
