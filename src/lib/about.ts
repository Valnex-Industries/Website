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
}

/**
 * `group` is the real team photograph and the climax of `PeopleCollage`: it
 * pops in last, largest and in the middle. `machines` frame it, popping in
 * first around the edges, so the section reads as the people at the centre
 * of the machines.
 *
 * TODO(photos): `hero` and most of `machines` are still STAND-INS from the
 * existing site artwork (renders, not photographs of the Valnex floor). Swap
 * in real shop-floor photos when they exist, in public/assets/about/.
 *  - `hero`: a wide landscape shot, at least 2000px on the long side. It
 *    opens up to fill the screen, so the subject should sit near the centre.
 *  - `machines`: four shots of the plant and the machines. The first two are
 *    portrait-cropped (4:5), the last two landscape (4:3).
 */
export const ABOUT_PHOTOS: {
  hero: AboutPhoto;
  group: AboutPhoto;
  machines: AboutPhoto[];
} = {
  hero: {
    src: "/assets/cta-background.webp",
    alt: "The Valnex machine hall in Dhamatvan, Ahmedabad",
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
  /* Read over the photo once it has opened to full screen. */
  caption:
    "Valnex Industries Private Limited, incorporated in Ahmedabad on 5 August 2021.",
};

export const ABOUT_STORY = {
  heading: "Built for the lines that cannot stop.",
  paragraphs: [
    "Valnex Industries started in Ahmedabad in 2021 to build the auxiliary equipment that injection moulding, blow moulding and extrusion lines depend on.",
    "Every Valnex machine is designed and manufactured at our plant in Dhamatvan, on the Bakrol road outside Ahmedabad. Nothing in the range is bought in and rebadged.",
  ],
};

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
