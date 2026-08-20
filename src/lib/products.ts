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
  /* Appended rather than slotted next to the other drying machine, so the
     seven products that were already live keep the index they already had. */
  "hot-air-dryer",
] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export interface ProductSpec {
  label: string;
  value: string;
}

/** An image in the ImageKit library, as the website renders it. */
export interface ProductImage {
  file_path: string;
  alt: string;
  width: number | null;
  height: number | null;
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
  /**
   * Either an ImageKit path (`/products/…`) or a legacy `public/` path
   * (`/assets/…`). `CdnImage` tells them apart and picks the right pipeline,
   * so nothing downstream has to know which it got.
   */
  image: string;
  /** From the media library. Empty for a legacy `public/` image. */
  imageAlt?: string;
  /** Intrinsic dimensions, when known. Absent for legacy images, which is why
   *  the render path still uses `fill` rather than width/height. */
  imageWidth?: number | null;
  imageHeight?: number | null;
  /** Additional imagery for the product page. */
  gallery: string[];
  /** The same gallery with alt text and dimensions, when ImageKit-backed. */
  galleryAssets?: ProductImage[];
  tags: string[];
  specs: ProductSpec[];
  applications: string[];
  /**
   * The catalogue page this product's `specs` were read off, as a full-page
   * image in `public/catalog/spec-sheets/`.
   *
   * `specs` can only hold flat label/value pairs, but the printed catalogue
   * specifies each machine as a matrix — fourteen chiller models against six
   * attributes. Reducing that to "2 - 59 TR" is the right thing to show on a
   * product page and the wrong thing to quote from, so the page links the
   * sheet the range came from. Absent for the products the catalogue does not
   * cover; see docs/catalog-source/README.md.
   */
  specSheet?: string;
}

/**
 * Five of these eight are filled from the printed Valnex catalogue; three are
 * not, because the catalogue does not cover them.
 *
 * Every figure below is a range across a model series that the catalogue
 * specifies model by model. The narrowing is deliberate — see `specSheet` — and
 * no figure is rounded, invented or carried over from the parallel
 * `website-2` project, whose spec tables contradict the catalogue. The
 * reasoning and the full transcribed matrices are in docs/catalog-source/.
 *
 * The hopper loader, volumetric feeder and dehumidifier keep empty `specs` and
 * `applications` and keep the abstract division artwork, because there is no
 * catalogue page for them. That renders as an absent block rather than as
 * filler, which is the honest state until the company supplies those pages.
 */
export const PRODUCTS: Product[] = [
  {
    slug: "chillers",
    index: "01",
    title: "Air/Water Cooled Chillers",
    summary:
      "Industrial cooling systems designed for precision temperature control and maximum uptime.",
    description:
      "Fourteen air-cooled models from 2 to 59 TR, each pairing a scroll compressor with an integrated process pump and buffer tank, so the machine arrives as one skid rather than as a chiller plus a pump set to be matched on site. Every model runs on R-22, R-407C or R-410. The figures below describe the air-cooled range; the water-cooled series is built to order and is not specified in the printed catalogue.",
    image: "/catalog/photos/air-cooled-chiller.webp",
    gallery: ["/catalog/photos/air-cooled-chiller-alt.webp"],
    tags: ["Air Cooled", "Water Cooled", "Thermal"],
    specs: [
      { label: "Air-cooled models", value: "VI 02A – VI060A (14)" },
      { label: "Cooling capacity", value: "2 – 59 TR" },
      { label: "Compressor", value: "2.5 – 27.6 kW" },
      { label: "Refrigerant", value: "R-22 / R-407C / R-410" },
      { label: "Process pump", value: "0.46 – 7.5 kW" },
      { label: "Process pump flow", value: "55 – 880 LPM" },
      { label: "Max. pressure", value: "2.4 – 5.6 bar" },
    ],
    applications: [
      "Injection moulding",
      "Blow moulding",
      "Extrusion",
      "General process cooling",
    ],
    specSheet: "/catalog/spec-sheets/air-cooled-chiller.webp",
  },
  {
    slug: "flake-cutter",
    index: "02",
    title: "Flake Cutter",
    summary:
      "High-performance size reduction equipment for consistent, clean flake processing.",
    description:
      "Ten models across two series: seven sized by grinding chamber, from a 230 × 200 mm beside-the-press unit to a 960 × 610 mm central granulator, and three rated by motor. Throughput runs from 100 to 1000 kg/h against a 8 – 12 mm screen, so runners and rejects come back as regrind at a size the machine that made them can take.",
    image: "/catalog/photos/flake-cutter.webp",
    gallery: [],
    tags: ["Size Reduction", "Processing"],
    specs: [
      { label: "Models", value: "VAL-230 – VAL-960, VAL-10/15/20 HP (10)" },
      { label: "Throughput", value: "100 – 1000 kg/h" },
      { label: "Grinding chamber", value: "230×200 – 960×610 mm" },
      { label: "Motor", value: "4 – 57 kW (5 – 75 HP)" },
      { label: "Rotary cutters", value: "6 – 30" },
      { label: "Screen mesh", value: "8 – 12 mm" },
      { label: "Max. cutting thickness", value: "1.5 – 14 mm" },
    ],
    applications: [
      "Beside-the-press regrind",
      "Central granulation",
      "Runner and reject recovery",
    ],
    specSheet: "/catalog/spec-sheets/flake-cutter.webp",
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
    description:
      "A 30 W or 50 W pulsed fibre laser on a floor-standing cabinet, built to mark product moving past it rather than parts placed under it. Air-cooled with no consumables, a touch control system and a centrifugal fume extractor; the two models are identical apart from laser power.",
    image: "/catalog/photos/laser-marking.webp",
    gallery: [],
    tags: ["Marking", "Traceability"],
    specs: [
      { label: "Models", value: "VAL-30 / VAL-50" },
      { label: "Laser type", value: "Pulsed fibre, 1064 nm" },
      { label: "Laser power", value: "30 W / 50 W" },
      { label: "Marking area", value: "150 × 150 mm" },
      { label: "Marking type", value: "On-the-fly" },
      { label: "Materials", value: "LLDP / DRIP / HDPE / PVC" },
      { label: "Min. marking height", value: "0.1 mm" },
      { label: "Supply", value: "220 V AC, 50–60 Hz, 750 W" },
    ],
    applications: [
      "In-line coding on moving product",
      "Batch and traceability codes",
      "Permanent part identification",
    ],
    specSheet: "/catalog/spec-sheets/laser-marking.webp",
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
    description:
      "Two series on one frame: five oil-circulating models reaching 180 °C and four water-circulating models reaching 95 °C. Choice of medium is set by the temperature the process needs rather than by unit size — a water model and an oil model of the same heating capacity share their pump, flow and tank.",
    image: "/catalog/photos/mould-temp-controller.webp",
    gallery: [],
    tags: ["Thermal", "Regulation"],
    specs: [
      { label: "Models", value: "VAL-O-3 – VAL-O-18, VAL-W-3 – VAL-W-18 (9)" },
      { label: "Circulating media", value: "Oil / Water" },
      { label: "Max. temperature", value: "180 °C oil / 95 °C water" },
      { label: "Heating capacity", value: "3 – 18 kW" },
      { label: "Nominal cooling capacity", value: "20 – 28 kW" },
      { label: "Pump motor", value: "0.5 – 2.2 kW at 3.8 – 5 bar" },
      { label: "Flow rate", value: "65 – 150 LPM" },
      { label: "Tank volume", value: "16 – 45 L" },
    ],
    applications: ["Injection moulding", "Die casting", "Extrusion"],
    specSheet: "/catalog/spec-sheets/mould-temp-controller.webp",
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
  {
    slug: "hot-air-dryer",
    index: "08",
    title: "Hot Air Dryer",
    summary:
      "Hopper dryers from 60 to 600 litres for consistent pre-drying ahead of the press.",
    description:
      "Seven insulated hopper dryers, 60 to 600 litres, each with its own heater bank and blower sized to the hopper. They drive surface moisture off granules before processing, which is what keeps splay and voids out of the part. All models run on a 415 V three-phase supply.",
    image: "/catalog/photos/hot-air-dryer.webp",
    gallery: [],
    tags: ["Drying", "Material Preparation"],
    specs: [
      { label: "Models", value: "VAL-50 – VAL-600 (7)" },
      { label: "Hopper capacity", value: "60 – 600 L" },
      { label: "Heater capacity", value: "2.7 – 18 kW" },
      { label: "Blowing power", value: "90 – 750 W" },
      { label: "Height", value: "1040 – 1910 mm" },
      { label: "Supply", value: "415 V, 3-phase" },
    ],
    applications: ["Injection moulding", "Extrusion", "Blow moulding"],
    specSheet: "/catalog/spec-sheets/hot-air-dryer.webp",
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
