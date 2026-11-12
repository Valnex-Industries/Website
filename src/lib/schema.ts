/**
 * schema.org payloads.
 *
 * Kept apart from the components so every route describes the company the same
 * way, and so the shapes are reviewable in one place. Fields the company has
 * not confirmed (foundingDate, numberOfEmployees, aggregateRating) are omitted
 * on purpose — see the note in `lib/site.ts`.
 */

import {
  BUSINESS,
  CONTACT,
  FOUNDING_DATE,
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
} from "@/lib/site";
import { productHref, type Product } from "@/lib/products";
import { absoluteImageUrl } from "@/lib/imagekit";

/** Stable @id so Product and Breadcrumb nodes can reference the same company. */
const ORGANIZATION_ID = siteUrl("/#organization");

/**
 * One node typed as both Organization and LocalBusiness.
 *
 * Two types rather than two nodes, sharing a single @id, so Product's
 * `manufacturer` and WebSite's `publisher` still resolve to the same entity —
 * emitting a separate LocalBusiness would give Google two companies to
 * reconcile. LocalBusiness is what carries an address, a pin and hours, and so
 * is what a Maps listing is matched against.
 *
 * Structured data does not create a Maps listing. Only a verified Google
 * Business Profile does. This is what lets Google recognise the profile and
 * this site as one business rather than two.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: siteUrl("/"),
    description: SITE_DESCRIPTION,
    slogan: "Precision That Powers Progress",
    foundingDate: FOUNDING_DATE,
    email: CONTACT.email,
    telephone: CONTACT.phones[0],
    /* Google wants an image on a LocalBusiness; the generated OG card is a
       legitimate one and needs no extra asset. */
    image: siteUrl("/opengraph-image"),
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.locality,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    contactPoint: CONTACT.phones.map((phone) => ({
      "@type": "ContactPoint",
      telephone: phone,
      email: CONTACT.email,
      contactType: "sales",
      areaServed: "Worldwide",
      availableLanguage: ["English", "Hindi", "Gujarati"],
    })),
    /* Everything below is emitted only once verified — see BUSINESS in
       lib/site.ts for why a guessed pin or guessed hours is worse than none. */
    ...(BUSINESS.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: BUSINESS.geo.latitude,
            longitude: BUSINESS.geo.longitude,
          },
        }
      : {}),
    ...(BUSINESS.mapUrl ? { hasMap: BUSINESS.mapUrl } : {}),
    ...(BUSINESS.openingHours.length > 0
      ? {
          openingHoursSpecification: BUSINESS.openingHours.map((slot) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: slot.days,
            opens: slot.opens,
            closes: slot.closes,
          })),
        }
      : {}),
    ...(BUSINESS.sameAs.length > 0 ? { sameAs: BUSINESS.sameAs } : {}),
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": siteUrl("/#website"),
    name: SITE_NAME,
    url: siteUrl("/"),
    description: SITE_DESCRIPTION,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * Equipment specification page node (`ItemPage` + `Service` for custom B2B quote
 * manufacturing).
 *
 * Plain `@type: "Product"` triggers a critical error in Google Search Console
 * ("Either 'offers', 'review' or 'aggregateRating' should be specified") on
 * B2B quote-only machinery pages that carry neither online checkout prices nor
 * customer reviews. Using `ItemPage` paired with `Service` preserves image,
 * manufacturer, category and description metadata for crawlers and answer
 * engines without inventing prices or ratings (see `lib/site.ts`).
 */
export function productSchema(product: Product) {
  const pageUrl = siteUrl(productHref(product.slug));
  const imageUrl = absoluteImageUrl(product.image);

  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: product.title,
    description: product.description || product.summary,
    isPartOf: { "@id": siteUrl("/#website") },
    ...(imageUrl
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: imageUrl,
            caption: `${product.title} — ${SITE_NAME}`,
          },
        }
      : {}),
    mainEntity: {
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: product.title,
      serviceType: "Custom Industrial Equipment Manufacturing",
      category: "Industrial Equipment",
      description: product.description || product.summary,
      url: pageUrl,
      ...(imageUrl ? { image: imageUrl } : {}),
      provider: { "@id": ORGANIZATION_ID },
      areaServed: "Worldwide",
    },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: siteUrl(crumb.path),
    })),
  };
}

/** The homepage product grid, so an answer engine can enumerate the range. */
export function productListSchema(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} product range`,
    numberOfItems: products.length,
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: product.title,
      url: siteUrl(productHref(product.slug)),
    })),
  };
}

/** /about, tied to the same company node every other page describes. */
export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": siteUrl("/about#webpage"),
    url: siteUrl("/about"),
    name: `About ${SITE_NAME}`,
    about: { "@id": ORGANIZATION_ID },
    mainEntity: { "@id": ORGANIZATION_ID },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: siteUrl("/assets/about/team-group.webp"),
      width: 1600,
      height: 1062,
      caption: "The Valnex Industries team in Ahmedabad",
    },
  };
}

