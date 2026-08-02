/**
 * The product catalogue — the single source of truth for what Valnex makes.
 *
 * The nav links, the homepage grid, the mega menu, the mobile drawer, the
 * footer, the product pages and the inquiry form's product chips are all
 * derived from this array. Adding a product means adding one entry here.
 *
 * `summary`, `description`, `specs` and `applications` are the slots the
 * company product documents fill. Anything still empty renders as nothing
 * rather than as filler: a product page simply omits a block it has no data
 * for, so an unfinished entry looks unfinished instead of looking wrong.
 */

/** Declared as a literal tuple so `ProductSlug` stays a union rather than
 *  widening to `string`. The inquiry form's `InquiryProduct` builds on it. */
export const PRODUCT_SLUGS = [
  "chillers",
  "flake-cutter",
  "hopper-loader",
  "laser-marking",
  "volumetric-feeder",
  "mould-temp",
  "dehumidifier",
] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  /** URL token. Doubles as the inquiry form's product value. */
  slug: ProductSlug;
  /** Zero-padded position, shown on the homepage cards. */
  index: string;
  title: string;
  /** One line. Used on cards and as the page meta description. */
  summary: string;
  /** Body copy for the product page. Empty until the documents land. */
  description: string;
  image: string;
  /** Additional imagery for the product page. */
  gallery: string[];
  tags: string[];
  specs: ProductSpec[];
  applications: string[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "chillers",
    index: "01",
    title: "Air/Water Cooled Chillers",
    summary:
      "Industrial cooling systems designed for precision temperature control and maximum uptime.",
    description: "",
    image: "/assets/division_energy.png",
    gallery: [],
    tags: ["Air Cooled", "Water Cooled", "Thermal"],
    specs: [],
    applications: [],
  },
  {
    slug: "flake-cutter",
    index: "02",
    title: "Flake Cutter",
    summary:
      "High-performance size reduction equipment for consistent, clean flake processing.",
    description: "",
    image: "/assets/division_materials.png",
    gallery: [],
    tags: ["Size Reduction", "Processing"],
    specs: [],
    applications: [],
  },
  {
    slug: "hopper-loader",
    index: "03",
    title: "Hopper Loader",
    summary:
      "Automated material handling solutions for seamless production line integration.",
    description: "",
    image: "/assets/division_robotics.png",
    gallery: [],
    tags: ["Material Handling", "Automation"],
    specs: [],
    applications: [],
  },
  {
    slug: "laser-marking",
    index: "04",
    title: "Laser Marking Machine",
    summary:
      "High-speed, precision marking systems for permanent part identification and traceability.",
    description: "",
    image: "/assets/division_energy.png",
    gallery: [],
    tags: ["Marking", "Traceability"],
    specs: [],
    applications: [],
  },
  {
    slug: "volumetric-feeder",
    index: "05",
    title: "Volumetric Feeder",
    summary:
      "Accurate dosing and feeding technology for strict quality and recipe control.",
    description: "",
    image: "/assets/division_materials.png",
    gallery: [],
    tags: ["Dosing", "Feeding"],
    specs: [],
    applications: [],
  },
  {
    slug: "mould-temp",
    index: "06",
    title: "Mould Temp Controller",
    summary:
      "Critical thermal regulation units to maintain precise mould conditions.",
    description: "",
    image: "/assets/division_energy.png",
    gallery: [],
    tags: ["Thermal", "Regulation"],
    specs: [],
    applications: [],
  },
  {
    slug: "dehumidifier",
    index: "07",
    title: "Dehumidifier",
    summary:
      "Advanced moisture removal systems to protect sensitive materials and processes.",
    description: "",
    image: "/assets/division_robotics.png",
    gallery: [],
    tags: ["Moisture Control", "Drying"],
    specs: [],
    applications: [],
  },
];

export function productHref(slug: ProductSlug): string {
  return `/products/${slug}`;
}

/** Takes a raw route param, so it has to accept any string. */
export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** Prefilled inquiry for a specific product, used by the product page CTA. */
export function inquiryHref(slug: ProductSlug): string {
  return `/inquiry?product=${slug}`;
}
