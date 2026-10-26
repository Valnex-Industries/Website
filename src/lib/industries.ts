import type { ProductSlug } from "@/lib/products";

/**
 * Who the equipment is for, in the two ways a buyer arrives asking.
 *
 * SECTORS is the company's own list of industries it serves, from the 2025
 * website brief (docs/VALNEX-Website.html), where every sector is served with
 * process cooling — "accurate temperature control with Valnex chillers". It is
 * not a client list: no sector here claims a named customer.
 *
 * PROCESSES is the same brief's "By Application" grouping: which machines a
 * plastics processor needs, by process. Products are referenced by slug, so a
 * process can only ever point at a machine that exists; the homepage drops any
 * slug the portal has unpublished.
 *
 * Add a sector or a process here and the homepage and /llms.txt pick it up.
 */

export const SECTORS = [
  { id: "chemical", name: "Chemical" },
  { id: "defence", name: "Defence" },
  { id: "energy", name: "Energy" },
  { id: "food", name: "Food" },
  { id: "medical", name: "Medical" },
  { id: "pharmaceutical", name: "Pharmaceutical" },
  { id: "plastics", name: "Plastics" },
  { id: "rubber", name: "Rubber" },
  { id: "semiconductor", name: "Semiconductor" },
  { id: "tyre", name: "Tyre" },
] as const;

export type SectorId = (typeof SECTORS)[number]["id"];

export interface Process {
  name: string;
  /** One line on what the machines do for this process. */
  summary: string;
  products: readonly ProductSlug[];
}

export const PROCESSES: readonly Process[] = [
  {
    name: "Injection moulding",
    summary:
      "Cooling, mould temperature control, drying, loading, dosing and regrind.",
    products: [
      "chillers",
      "mould-temp",
      "hot-air-dryer",
      "dehumidifier",
      "hopper-loader",
      "volumetric-feeder",
      "flake-cutter",
    ],
  },
  {
    name: "Blow moulding",
    summary: "Cooling, drying, loading, dosing and regrind for blow moulding lines.",
    products: [
      "chillers",
      "hot-air-dryer",
      "hopper-loader",
      "volumetric-feeder",
      "flake-cutter",
    ],
  },
  {
    name: "Extrusion (pipe, drip and profile)",
    summary:
      "Process cooling and material handling, with on-the-fly laser marking on the line.",
    products: [
      "chillers",
      "hot-air-dryer",
      "hopper-loader",
      "volumetric-feeder",
      "laser-marking",
    ],
  },
  {
    name: "Plastic recycling",
    summary: "Size reduction, drying and conveying for reprocessing scrap.",
    products: ["flake-cutter", "hot-air-dryer", "hopper-loader"],
  },
];
