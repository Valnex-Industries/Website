import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Exo_2, Orbitron } from "next/font/google";
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
    <html
      lang="en"
      className={`${exo2.variable} ${orbitron.variable} h-full antialiased`}
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
            Vitals from real visitors — the number to watch is LCP, which the
            two-second preloader inflates by design. */}
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
