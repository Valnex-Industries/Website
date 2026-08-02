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
  SITE_DESCRIPTION,
  SITE_NAME,
  siteUrl,
} from "@/lib/site";
import { productHref, type Product } from "@/lib/products";

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

export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": siteUrl(`${productHref(product.slug)}#product`),
    name: product.title,
    description: product.summary,
    url: siteUrl(productHref(product.slug)),
    image: siteUrl(product.image),
    category: "Industrial Equipment",
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@id": ORGANIZATION_ID },
    /* Only emitted once the catalogue actually carries specs — an empty
       additionalProperty array is worse than none. */
    ...(product.specs.length > 0
      ? {
          additionalProperty: product.specs.map((spec) => ({
            "@type": "PropertyValue",
            name: spec.label,
            value: spec.value,
          })),
        }
      : {}),
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
