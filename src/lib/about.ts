/**
 * Content for /about: one file for the copy and the photographs, so the page
 * components hold layout and motion only.
 *
 * The same rule as `lib/site.ts` applies. Every sentence here is either a
 * confirmed fact (founded 2021 in Ahmedabad, all eight lines made in-house,
 * the spec ranges in the catalogue) or the company's own voice already
 * published elsewhere on the site. A person's name or role renders only when
 * it is filled in, so an unnamed photo reads as a photo, never as a guess.
 */

export interface AboutPhoto {
  src: string;
  /** Describe the people and the place, e.g. "Valnex founders on the assembly
   *  floor in Dhamatvan". Empty only for a purely decorative image. */
  alt: string;
  /** Shown under the photo when set. */
  name?: string;
  role?: string;
  /** Intrinsic size, for photos shown uncropped at their own aspect ratio. */
  width?: number;
  height?: number;
}

/**
 * `group` is the real team photograph and the climax of `PeopleCollage`: it
 * pops in last, largest and in the middle. `machines` frame it, popping in
 * first around the edges, so the section reads as the people at the centre
 * of the machines.
 *
 * TODO(photos): most of `machines` are still STAND-INS from the existing
 * site artwork (renders, not photographs of the Valnex floor). Swap in real
 * shop-floor photos when they exist, in public/assets/about/: four shots of
 * the plant and the machines, the first two portrait-cropped (4:5), the last
 * two landscape (4:3).
 */
export const ABOUT_PHOTOS: {
  hero: AboutPhoto;
  group: AboutPhoto;
  machines: AboutPhoto[];
} = {
  /* The real team photograph, shown whole (3:2, never cropped). */
  hero: {
    src: "/assets/about/team-group.webp",
    alt: "The Valnex Industries team in Ahmedabad, most in Valnex polo shirts",
    width: 1600,
    height: 1062,
  },
  group: {
    src: "/assets/about/team-group.webp",
    alt: "The Valnex Industries team standing together outdoors, most in Valnex polo shirts",
  },
  machines: [
    {
      src: "/catalog/brand/valnex-machines.jpg",
      alt: "Valnex machines lined up on the shop floor",
    },
    {
      src: "/assets/strength-4.webp",
      alt: "An engineer marking up a machine drawing",
    },
    {
      src: "/assets/strength-3.webp",
      alt: "The Valnex product range on the factory floor",
    },
    {
      src: "/assets/strength-2.webp",
      alt: "A technician fitting the pipework on a chiller",
    },
  ],
};

export const ABOUT_HERO = {
  title: ["Made in Ahmedabad.", "Since 2021."],
  lede: "We design and manufacture process equipment for plastics plants, all of it under one roof in Gujarat.",
  /* Read under the photo once it has grown to fill the screen. */
  caption:
    "The Valnex team. Valnex Industries Private Limited was incorporated in Ahmedabad on 5 August 2021.",
};

/**
 * The story, written to be quotable on its own: each paragraph names the
 * company and says one thing a buyer or an answer engine can repeat without
 * the rest. Ranges come from the confirmed catalogue specs; change them with
 * `lib/products.ts`.
 */
export const ABOUT_STORY = {
  heading: "Built for the lines that cannot stop.",
  paragraphs: [
    "Valnex Industries is an industrial equipment manufacturer in Ahmedabad, Gujarat. The company was incorporated on 5 August 2021 to build the auxiliary equipment that injection moulding, blow moulding and extrusion lines depend on: the machines that cool, dry, feed, regrind and mark around the press.",
    "Every Valnex machine is designed and manufactured in-house at our plant in Dhamatvan, on the Bakrol road outside Ahmedabad. Nothing in the range is bought in and rebadged, so the engineer who answers a question about a machine works where it is built.",
    "The range runs from industrial chillers of 2 to 59 TR and mould temperature controllers working to 180 °C, through hot air dryers of 60 to 600 litres and flake cutters handling 100 to 1000 kg/h, to 30 W and 50 W fibre laser marking machines. Hopper loaders, volumetric feeders and dehumidifiers complete the line-up.",
    "Keeping thermal management, materials processing and automation under one roof means each system is validated before it reaches a customer line. It also means one named contact, from the first drawing to delivery.",
  ],
};

/** Shown with the product lines: who the range is for, in one paragraph. */
export const ABOUT_LINES_LEDE =
  "Every line below is designed and built at the Dhamatvan plant. Each page lists the confirmed specifications, the processes the machine is built for and the catalogue sheet the figures come from.";

/** Plain questions with plain answers, so the facts a buyer (or an answer
 *  engine) looks for first sit in one place in the page text. Deliberately
 *  not marked up as FAQPage: Google no longer shows FAQ rich results, and the
 *  value here is the text itself. */
export const ABOUT_QUESTIONS_HEADING = "Valnex Industries at a glance.";

export const ABOUT_PEOPLE = {
  heading: "The people behind the machines.",
  lede: "The founders and the crew who design, build and test every Valnex machine.",
};

export const ABOUT_VISION = {
  /* DRAFT: the owner to confirm or rewrite this sentence before merge. */
  statement:
    "Plastics plants across India running on process equipment designed and built in India.",
  principles: [
    {
      title: "One roof",
      body: "Thermal, materials and automation are designed and built together, so every system is validated before it reaches your line.",
    },
    {
      title: "An engineer reads every inquiry",
      body: "Your inquiry goes to the engineer who owns that product line, not to a queue.",
    },
    {
      title: "Bench, then line",
      body: "Every program is proved on the bench first, then on the line.",
    },
  ],
};
