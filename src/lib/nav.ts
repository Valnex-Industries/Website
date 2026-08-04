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
  { label: "Company profile", href: "/#company" },
  { label: "Leadership", href: "/#company" },
  { label: "Plants & facilities", href: "/#company" },
  { label: "Sustainability", href: "/#company" },
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Products", href: "/#products", children: PRODUCT_LINKS },
  { label: "Company Profile", href: "/#company", children: COMPANY_LINKS },
  { label: "News", href: "/#news" },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Site map", href: "/#top" },
  { label: "Privacy policy", href: "/#top" },
];
