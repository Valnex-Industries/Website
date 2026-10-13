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

/* These all pointed at "/#company", one homepage section, so four labels led
   to the same place and "Leadership" and "Sustainability" promised pages that
   did not exist. Each now lands on a real section of /about. */
export const COMPANY_LINKS: NavChild[] = [
  { label: "About Valnex", href: "/about" },
  { label: "Our story", href: "/about#story" },
  { label: "Founders & crew", href: "/about#team" },
  { label: "Vision", href: "/about#vision" },
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Products", href: "/#products", children: PRODUCT_LINKS },
  { label: "Company Profile", href: "/about", children: COMPANY_LINKS },
  /* Was "/#news", an anchor to a section that never existed, so the link went
     nowhere. It is a real page now. */
  { label: "News", href: "/news" },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Site map", href: "/#top" },
  { label: "Privacy policy", href: "/#top" },
];
