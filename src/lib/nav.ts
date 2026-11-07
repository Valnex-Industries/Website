/** One source of truth for the header, the mega menu, the mobile drawer and the
 *  footer, so a link only ever has to be corrected in one place. The product
 *  links are derived from the catalogue in `lib/products.ts`. */

import { PRODUCTS, productHref } from "@/lib/products";

export type NavChild = {
  label: string;
  href: string;
  /** Thumbnail, used by the products lists in the mega menu and the drawer. */
  image?: string;
};

/** A child that is always rendered with artwork. */
export type ProductLink = NavChild & { image: string };

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

/** Smooth anchor scroll aligns section top flush with the window top,
 *  with the fixed navbar resting over the section's top padding. */
export const HEADER_OFFSET = 0;

export const PRODUCT_LINKS: ProductLink[] = PRODUCTS.map((product) => ({
  label: product.title,
  href: productHref(product.slug),
  image: product.image,
}));

export const COMPANY_LINKS: NavChild[] = [
  { label: "Company profile", href: "/#company" },
  { label: "About Valnex", href: "/about" },
  { label: "Our story", href: "/about#story" },
  { label: "Processes & applications", href: "/about#processes" },
  { label: "Vision", href: "/about#vision" },
];

export const NAV_ITEMS: NavItem[] = [
  /* The logo already links home, but only as an image with the wordmark
     beside it. A plain "Home" item is the link visitors look for, and gives
     every page a text link to the root. */
  { label: "Home", href: "/" },
  { label: "Products", href: "/#products", children: PRODUCT_LINKS },
  { label: "Industries", href: "/#industries" },
  { label: "Company Profile", href: "/#company" },
  { label: "About", href: "/about" },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Site map", href: "/#top" },
  { label: "Privacy policy", href: "/#top" },
];
