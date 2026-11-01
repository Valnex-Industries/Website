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
   * sheet the range came from. Absent for the products whose catalogue page
   * was never scanned — their per-model tables are transcribed in
   * docs/catalog-source/specifications.md instead.
   */
  specSheet?: string;
  /**
   * When the portal last saved this product's row (ISO 8601). Absent for the
   * compile-time catalogue, which has no honest edit date — the sitemap omits
   * `lastmod` rather than claiming one.
   */
  updatedAt?: string;
}

/**
 * All eight are filled from Valnex catalogue data: the five scanned spreads,
 * and the New Catalogue 2025, which also covers the water-cooled chiller, the
 * hopper loader, the volumetric feeder and the dehumidifier, and completes the
 * rows the scans cut off (the hot air dryer's VAL-800, for one).
 *
 * Every figure below is a range across a model series that the catalogue
 * specifies model by model. The narrowing is deliberate — see `specSheet` — and
 * no figure is rounded, invented or carried over from the parallel
 * `website-2` project, whose spec tables contradict the catalogue. The
 * reasoning and the full transcribed matrices are in docs/catalog-source/.
 *
 * Photographs are the catalogue cutouts in `public/catalog/photos/2025/`,
 * centred on a square white canvas so neither the 4:5 cards nor the 4:3
 * product frame crops the machine. They are stand-ins until studio renders
 * replace them; swapping one is a path change here and nowhere else.
 */
export const PRODUCTS: Product[] = [
  {
    slug: "chillers",
    index: "01",
    title: "Air/Water Cooled Chillers",
    summary:
      "Industrial cooling systems designed for precision temperature control and maximum uptime.",
    description:
      "Two fourteen-model series on one integral skidded design: air-cooled from 2 to 59 TR and water-cooled from 2.7 to 65.5 TR. Every unit pairs its compressor with an integrated process pump and water tank, so the machine arrives as one skid rather than as a chiller plus a pump set to be matched on site. Both series run on R-22, R-407C or R-410; the water-cooled models reject heat to a cooling tower of 5 to 85 TR.",
    /* Studio render of the catalogue unit for the grid; the photos of the
       real machines stay in the gallery so the product page still shows what
       actually ships — the orange unit is air-cooled, the blue one
       water-cooled. */
    image: "/assets/product-chillers.webp",
    gallery: [
      "/catalog/photos/2025/air-cooled-chiller.webp",
      "/catalog/photos/2025/water-cooled-chiller.webp",
    ],
    tags: ["Air Cooled", "Water Cooled", "Thermal"],
    specs: [
      { label: "Air-cooled models", value: "VI 02A – VI060A (14)" },
      { label: "Water-cooled models", value: "VI02W – VI060W (14)" },
      { label: "Cooling capacity", value: "2 – 59 TR air / 2.7 – 65.5 TR water" },
      { label: "Refrigerant", value: "R-22 / R-407C / R-410" },
      { label: "Process pump", value: "0.46 – 7.5 kW" },
      { label: "Process pump flow", value: "55 – 880 LPM" },
      { label: "Max. pressure", value: "2.4 – 5.6 bar" },
      { label: "Water tank", value: "40 – 1000 L" },
      { label: "Condenser cooling tower", value: "5 – 85 TR (water-cooled)" },
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
    image: "/assets/product-flake-cutter.webp",
    gallery: ["/catalog/photos/2025/flake-cutter.webp"],
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
      "Vacuum hopper loaders from 30 to 1200 kg/h for conveying granules straight to the machine.",
    description:
      "Six vacuum loaders, from a 6-litre single-phase unit conveying 30 kg/h to an 85-litre receiver conveying 1200 kg/h. The VAL-02 runs on 230 V single phase; every other model runs on 415 V three phase, with the vacuum blower sized from 0.9 to 7.5 kW. Automatic filter cleaning, a ratio valve, positive discharge, a common line valve, a photo-electric material sensor and an intermediate hopper are available as options.",
    image: "/catalog/photos/2025/hopper-loader.webp",
    gallery: [],
    tags: ["Material Handling", "Automation"],
    specs: [
      { label: "Models", value: "VAL-02 – VAL-32 (6)" },
      { label: "Nominal throughput", value: "30 – 1200 kg/h" },
      { label: "Receiver volume", value: "6 – 85 L" },
      { label: "Vacuum blower", value: "0.9 – 7.5 kW" },
      { label: "Material / vacuum line", value: "1.5\" – 4\"" },
      { label: "Supply", value: "230 V 1-phase (VAL-02) / 415 V 3-phase" },
      { label: "Compressed air", value: "28.3 L/min at 5.51 bar" },
    ],
    applications: [
      "Conveying granules to the machine hopper",
      "Feeding injection moulding and extrusion machines",
      "Proportional loading of virgin and regrind (ratio valve)",
    ],
  },
  {
    slug: "laser-marking",
    index: "04",
    title: "Laser Marking Machine",
    summary:
      "High-speed, precision marking systems for permanent part identification and traceability.",
    description:
      "A 30 W or 50 W pulsed fibre laser on a floor-standing cabinet, built to mark product moving past it rather than parts placed under it. Air-cooled with no consumables, a touch control system and a centrifugal fume extractor; the two models are identical apart from laser power.",
    image: "/catalog/photos/2025/laser-marking-machine.webp",
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
      "Volumetric masterbatch dosing from 0.004 to 73 kg/h, in five screw sizes.",
    description:
      "A screw-driven volumetric doser for masterbatch and additives. Five screw sizes cover 0.004 to 73 kg/h, from a 3/8 × 1/4 screw for the lightest additions to a 1 × 1 screw at the top of the range, all fed from a 20-litre hopper. The feeder weighs 19 kg, and its separate control panel runs on 230 V AC at 1 A.",
    /* The single feeder is what the specification describes; the twin-hopper
       unit follows it in the gallery. */
    image: "/catalog/photos/2025/volumetric-feeder-single.webp",
    gallery: ["/catalog/photos/2025/volumetric-feeder.webp"],
    tags: ["Dosing", "Feeding"],
    specs: [
      { label: "Models", value: "VAL 1 – VAL 5 (5)" },
      { label: "Dosing capacity", value: "0.004 – 73 kg/h" },
      { label: "Screw size", value: "3/8 × 1/4 – 1 × 1" },
      { label: "Hopper capacity", value: "20 L" },
      { label: "Feeder weight", value: "19 kg" },
      { label: "Control panel (H × W × D)", value: "300 × 230 × 160 mm" },
      { label: "Supply", value: "230 V AC, 50/60 Hz, 1 A" },
    ],
    applications: ["Masterbatch dosing", "Additive dosing"],
  },
  {
    slug: "mould-temp",
    index: "06",
    title: "Mould Temp Controller",
    summary:
      "Critical thermal regulation units to maintain precise mould conditions.",
    description:
      "Two series on one frame: five oil-circulating models reaching 180 °C and four water-circulating models reaching 95 °C. Choice of medium is set by the temperature the process needs rather than by unit size — a water model and an oil model of the same heating capacity share their pump, flow and tank.",
    image: "/catalog/photos/2025/mould-temperature-controller.webp",
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
      { label: "Supply", value: "415 V, 50 Hz, 3-phase" },
    ],
    applications: ["Injection moulding", "Die casting", "Extrusion"],
    specSheet: "/catalog/spec-sheets/mould-temp-controller.webp",
  },
  {
    slug: "dehumidifier",
    index: "07",
    title: "Dehumidifier",
    summary:
      "SS 304 industrial dehumidifiers extracting 200 to 500 litres of moisture a day.",
    description:
      "Three floor-standing models on an SS 304 structure, rated at 200, 300 and 500 litres a day at 30 °C and 80 % RH, and sized for 1600 to 3000 sq ft of non-air-conditioned floor. Each runs a reciprocating three-phase compressor on R22 or R407, moves 2500 to 5400 m³/h of air through a 20-micron filter, and collects condensate in its own stainless tank with a drain connection.",
    image: "/catalog/photos/2025/dehumidifier.webp",
    gallery: ["/catalog/photos/2025/dehumidifier-front.webp"],
    tags: ["Moisture Control", "Drying"],
    specs: [
      { label: "Models", value: "VI 2DH / VI 3DH / VI 5DH" },
      { label: "Moisture extraction", value: "200 – 500 L/day at 30 °C, 80 % RH" },
      { label: "Coverage (non-AC)", value: "1600 – 3000 sq ft" },
      { label: "Air flow", value: "2500 – 5400 m³/h" },
      { label: "Compressor", value: "Reciprocating, 3-phase" },
      { label: "Refrigerant", value: "R22 / R407" },
      { label: "Filter", value: "20 micron" },
      { label: "Structure", value: "SS 304" },
      { label: "Supply", value: "440 V AC, 50 Hz" },
    ],
    applications: [
      "Humidity control on production floors",
      "Moisture protection in material storage",
    ],
  },
  {
    slug: "hot-air-dryer",
    index: "08",
    title: "Hot Air Dryer",
    summary:
      "Hopper dryers from 60 to 800 litres for consistent pre-drying ahead of the press.",
    description:
      "Eight insulated hopper dryers, 60 to 800 litres, each with its own heater bank and blower sized to the hopper. They drive surface moisture off granules before processing, which is what keeps splay and voids out of the part. All models run on a 415 V three-phase supply.",
    image: "/catalog/photos/2025/hot-air-dryer.webp",
    gallery: [],
    tags: ["Drying", "Material Preparation"],
    specs: [
      { label: "Models", value: "VAL-50 – VAL-800 (8)" },
      { label: "Hopper capacity", value: "60 – 800 L" },
      { label: "Heater capacity", value: "2.7 – 18 kW" },
      { label: "Blowing power", value: "90 – 750 W" },
      { label: "Height", value: "1040 – 2260 mm" },
      { label: "Supply", value: "415 V, 3-phase" },
    ],
    applications: ["Injection moulding", "Extrusion", "Blow moulding"],
    specSheet: "/catalog/spec-sheets/hot-air-dryer.webp",
  },
];

/**
 * Search-result text for each product page: the `<title>` and meta
 * description, kept apart from `title`/`summary` because those also drive the
 * H1, cards and menus, where "Industrial Chiller Manufacturer, Ahmedabad" would
 * read as clutter.
 *
 * Every figure is copied from that product's confirmed `specs`; change them
 * together. A product with no entry here (one added in the portal later)
 * falls back to its `title` and `summary`.
 */
export const PRODUCT_SEO: Partial<
  Record<ProductSlug, { title: string; description: string }>
> = {
  chillers: {
    title: "Industrial Chiller Manufacturer, Ahmedabad (2–65.5 TR) | Valnex",
    description:
      "Air-cooled (2–59 TR) and water-cooled (2.7–65.5 TR) industrial chillers, 28 models, for moulding and extrusion. Made by Valnex Industries, Ahmedabad.",
  },
  "mould-temp": {
    title: "Mould Temperature Controller, Oil & Water | Valnex Ahmedabad",
    description:
      "Oil (to 180 °C) and water (to 95 °C) mould temperature controllers, 3–18 kW heating, 9 models. Made by Valnex Industries in Ahmedabad, Gujarat.",
  },
  "hot-air-dryer": {
    title: "Hot Air Dryer for Plastics, 60–800 L | Valnex Ahmedabad",
    description:
      "Hopper hot air dryers from 60 to 800 litres, 2.7–18 kW heaters, 8 models, for pre-drying resin before moulding or extrusion. Valnex Industries, Ahmedabad.",
  },
  "flake-cutter": {
    title: "Flake Cutter & Granulator, 100–1000 kg/h | Valnex Ahmedabad",
    description:
      "Flake cutter granulators for beside-the-press regrind and central granulation: 100–1000 kg/h, 4–57 kW, 10 models. Made by Valnex Industries, Ahmedabad.",
  },
  "laser-marking": {
    title: "Fibre Laser Marking Machine, 30 W & 50 W | Valnex Ahmedabad",
    description:
      "30 W and 50 W pulsed fibre laser marking machines with on-the-fly marking for batch and traceability codes. Made by Valnex Industries, Ahmedabad.",
  },
  "hopper-loader": {
    title: "Vacuum Hopper Loader, 30–1200 kg/h | Valnex Ahmedabad",
    description:
      "Vacuum hopper loaders from 30 to 1200 kg/h, 6–85 L receivers, single and three phase, 6 models. Made by Valnex Industries in Ahmedabad, Gujarat.",
  },
  "volumetric-feeder": {
    title: "Volumetric Masterbatch Feeder, 0.004–73 kg/h | Valnex Ahmedabad",
    description:
      "Volumetric masterbatch dosing feeders in five screw sizes, 0.004 to 73 kg/h, with a 20 L hopper. Made by Valnex Industries in Ahmedabad, Gujarat.",
  },
  dehumidifier: {
    title: "Industrial Dehumidifier, 200–500 L/day | Valnex Ahmedabad",
    description:
      "SS 304 industrial dehumidifiers extracting 200–500 litres a day at 30 °C and 80 % RH, covering up to 3000 sq ft. Made by Valnex Industries, Ahmedabad.",
  },
};

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
