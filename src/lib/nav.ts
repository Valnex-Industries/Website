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

/** How far the smooth anchor scroll stops short of a section, so the fixed
 *  header never covers the heading it just jumped to. */
export const HEADER_OFFSET = 72;

export const PRODUCT_LINKS: ProductLink[] = PRODUCTS.map((product) => ({
  label: product.title,
  href: productHref(product.slug),
  image: product.image,
}));

export const COMPANY_LINKS: NavChild[] = [
  { label: "About Valnex", href: "/about" },
  { label: "Our story", href: "/about#story" },
  { label: "Founders & crew", href: "/about#team" },
  { label: "Vision", href: "/about#vision" },
];

export const NAV_ITEMS: NavItem[] = [
  /* The logo already links home, but only as an image with the wordmark
     beside it. A plain "Home" item is the link visitors look for, and gives
     every page a text link to the root. */
  { label: "Home", href: "/" },
  { label: "Products", href: "/#products", children: PRODUCT_LINKS },
  { label: "Industries", href: "/#industries" },
  { label: "About", href: "/about", children: COMPANY_LINKS },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Site map", href: "/#top" },
  { label: "Privacy policy", href: "/#top" },
];
