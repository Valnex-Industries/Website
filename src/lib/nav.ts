/** One source of truth for the header, the mega menu, the mobile drawer and the
 *  footer, so a link only ever has to be corrected in one place. */

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

export const PRODUCT_LINKS: ProductLink[] = [
  {
    label: "Air/Water Cooled Chillers",
    href: "/#products",
    image: "/assets/division_energy.png",
  },
  {
    label: "Flake Cutter",
    href: "/#products",
    image: "/assets/division_materials.png",
  },
  {
    label: "Hopper Loader",
    href: "/#products",
    image: "/assets/division_robotics.png",
  },
  {
    label: "Laser Marking Machine",
    href: "/#products",
    image: "/assets/division_energy.png",
  },
  {
    label: "Volumetric Feeder",
    href: "/#products",
    image: "/assets/division_materials.png",
  },
  {
    label: "Mould Temp Controller",
    href: "/#products",
    image: "/assets/division_energy.png",
  },
  {
    label: "Dehumidifier",
    href: "/#products",
    image: "/assets/division_robotics.png",
  },
];

export const COMPANY_LINKS: NavChild[] = [
  { label: "Company profile", href: "/#company" },
  { label: "Leadership", href: "/#company" },
  { label: "Plants & facilities", href: "/#company" },
  { label: "Sustainability", href: "/#company" },
];

export const CAREER_LINKS: NavChild[] = [
  { label: "Open roles", href: "/#careers" },
  { label: "Graduate program", href: "/#careers" },
  { label: "Life at Valnex", href: "/#careers" },
  { label: "Recruitment entry", href: "/#careers" },
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Products", href: "/#products", children: PRODUCT_LINKS },
  { label: "Company Profile", href: "/#company", children: COMPANY_LINKS },
  { label: "Careers", href: "/#careers", children: CAREER_LINKS },
  { label: "News", href: "/#news" },
];

export const UTILITY_LINKS: NavChild[] = [
  { label: "Site map", href: "/#top" },
  { label: "Privacy policy", href: "/#top" },
];
