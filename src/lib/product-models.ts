import type { ProductSlug } from "@/lib/products";

/**
 * Per-model specification tables, from the Valnex New Catalogue 2025
 * (docs/catalog-source/valnex-new-catalogue-2025.pdf).
 *
 * `Product.specs` holds one range per attribute ("100 – 1000 kg/h"), which is
 * what a buyer scans first. These tables are the figures behind each range,
 * model by model, so a buyer can pick a model rather than a product line. Each
 * machine is measured in its own terms — a chiller in TR, a flake cutter in
 * kg/h and chamber size, a dryer in litres — so every table keeps the rows the
 * catalogue gives that machine and nothing is forced into a shared schema.
 *
 * Keyed by slug, like `PRODUCT_SEO`, because the portal's `products` table has
 * no column for them; a product without an entry simply shows no table.
 *
 * Figures are copied as printed. Rows the catalogue prints ambiguously or
 * against its own neighbours are left out rather than corrected — the list,
 * and the reasoning, is in docs/catalog-source/specifications.md.
 */

export interface ModelRow {
  label: string;
  /** One value per model, in `models` order. A single value applies to every
   *  model and renders across the whole row. */
  values: readonly (string | number)[];
}

export interface ModelTable {
  /** Shown above the table. */
  title: string;
  /** Column headers: the model codes, in catalogue order. */
  models: readonly string[];
  rows: readonly ModelRow[];
  /** Printed under the table: nomenclature, or how to read a cell. */
  note?: string;
}

const BSP = ['1"', '1"', '1"', '1"', '1½"', '1½"', '1½"', '1½"', '1½"', '1½"'];

export const PRODUCT_MODELS: Partial<Record<ProductSlug, readonly ModelTable[]>> = {
  chillers: [
    {
      title: "Air-cooled series",
      models: ["VI02A", "VI03A", "VI05A", "VI06A", "VI07A", "VI08A", "VI010A", "VI015A", "VI017A", "VI024A", "VI030A", "VI040A", "VI050A", "VI060A"],
      rows: [
        { label: "Cooling capacity (TR)", values: [2, 3.15, 5, 5.53, 7.2, 9.4, 11.3, 14.2, 19.1, 24.4, 29.5, 38.3, 49.2, 59] },
        { label: "Compressor (kW)", values: [2.5, 3.17, 5.2, 5.37, 6.69, 9.06, 10.76, 13.65, 18.36, 23.1, 27.6, "18.3 / 2", "23.1 / 2", "27.6 / 2"] },
        { label: "Refrigerant", values: ["R-22 / R-407C / R-410"] },
        { label: "Process pump (kW)", values: [0.46, 0.96, 1.1, 1.1, 1.1, 1.5, 1.5, 2, 2.2, 2.2, 3, 4, 5.5, 7.5] },
        { label: "Process pump flow (LPM)", values: [55, 105, 150, 150, 230, 230, 230, 230, 230, 230, 380, 480, 480, 880] },
        { label: "Max. pressure (bar)", values: [2.4, 3, 4.6, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 5.6, 4.4] },
        { label: "Water tank (L)", values: [40, 100, 100, 100, 150, 150, 150, 200, 200, 200, 300, 500, 500, 1000] },
        { label: "Fans (qty / kW)", values: ["1 / 0.25", "1 / 0.8", "2 / 0.5", "2 / 0.5", "2 / 1.2", "2 / 1.2", "2 / 1.2", "—", "—", "4 / 3.2", "4 / 3.2", "6 / 4.8", "8 / 6.4", "8 / 6.4"] },
        { label: "Process connection, in/out (BSP)", values: [...BSP, '2"', '2"', '2"', '2½"'] },
        { label: "Length (mm)", values: [1100, 1600, 1700, 1700, 1850, 1850, 1850, 2100, 2300, 2750, 2750, 3350, 3900, 3900] },
        { label: "Width (mm)", values: [775, 1025, 1025, 1025, 1125, 1125, 1125, 1475, 1475, 1705, 1705, 1705, 2000, 2000] },
        { label: "Height (mm)", values: [1300, 1700, 1700, 1700, 1750, 1750, 1750, 1950, 2100, 2200, 2200, 2200, 2350, 2600] },
        { label: "Weight (kg)", values: [150, 300, 500, 500, 700, 700, 700, 900, 1000, 1100, 1500, 1600, 2000, 2200] },
        { label: "Connected load (kW)", values: [3.21, 4.93, 6.8, 6.97, 8.99, 11.76, 13.46, 18.05, 23.68, 28.5, 33.8, 45.4, 58.2, 69.1] },
      ],
      note: "“18.3 / 2” denotes two compressors. A dash is printed as such in the catalogue.",
    },
    {
      title: "Water-cooled series",
      models: ["VI02W", "VI03W", "VI05W", "VI06W", "VI07W", "VI08W", "VI010W", "VI015W", "VI017W", "VI024W", "VI030W", "VI040W", "VI050W", "VI060W"],
      rows: [
        { label: "Cooling capacity (TR)", values: [2.7, 3.47, 5.82, 6.44, 8, 10.43, 12.4, 15.67, 21.3, 27.5, 32.7, "—", 55, 65.5] },
        { label: "Refrigerant", values: ["R-22 / R-407C / R-410"] },
        { label: "Process pump (kW)", values: [0.46, 0.96, 1.1, 1.1, 1.1, 1.5, 1.5, 2, 2.2, 2.2, 3, 4, 5.5, 7.5] },
        { label: "Process pump flow (LPM)", values: [55, 105, 150, 150, 230, 230, 230, 230, 230, 230, 380, 480, 480, 880] },
        { label: "Max. pressure (bar)", values: [2.4, 3, 4.6, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 4.8, 5.6, 4.4] },
        { label: "Water tank (L)", values: [40, 100, 100, 100, 100, 150, 150, 200, 200, 200, 300, 500, 500, 1000] },
        { label: "Condenser cooling tower (TR)", values: [5, 5, 8, 10, 10, 15, 20, 30, 32, 35, 40, 55, 70, 85] },
        { label: "Condenser water flow (LPM)", values: [50, 70, 130, 150, 180, 220, 240, 300, 320, 350, 400, 600, 800, 900] },
        { label: "Condenser water, in/out (BSP)", values: [...BSP, '2"', '2"', '2"', '2"'] },
        { label: "Process connection, in/out (BSP)", values: [...BSP, '2"', '2"', '2"', '2½"'] },
        { label: "Weight (kg)", values: [150, 150, 400, 400, 800, 800, 800, 850, 850, 900, 1300, 2000, 2000, 2000] },
        { label: "Connected load (kW)", values: [2.35, 3.16, 4.9, 5.08, 6.27, 8.06, 9.55, 12.2, 16.35, 20.2, 24.5, "—", 41.7, 48.5] },
      ],
      note: "A dash is printed as such in the catalogue.",
    },
  ],
  "flake-cutter": [
    {
      title: "Flake cutter series",
      models: ["VAL-230", "VAL-300", "VAL-400", "VAL-500", "VAL-600", "VAL-800", "VAL-960", "VAL-10 HP", "VAL-15 HP", "VAL-20 HP"],
      rows: [
        { label: "Grinding chamber (mm)", values: ["230 × 200", "310 × 200", "410 × 240", "510 × 300", "610 × 330", "815 × 470", "960 × 610", "360 × 260", "420 × 280", "480 × 330"] },
        { label: "Throughput (kg/h)", values: ["100 – 150", "150 – 200", "200 – 250", "300 – 350", "350 – 450", "450 – 600", "800 – 1000", "150 – 250", "200 – 300", "250 – 350"] },
        { label: "Stationary cutters", values: [2, 2, 2, 2, 4, 4, 4, 2, 2, 2] },
        { label: "Rotary cutters", values: [6, 9, 12, 15, 18, 24, 30, 18, 21, 24] },
        { label: "Screen mesh (mm)", values: [8, 8, 8, 10, 10, 10, 12, 10, 10, 10] },
        { label: "Motor (kW)", values: [4, 5.5, 7.5, 11, 15, "22 / 30", "37 / 45 / 57", 7.5, 10, 15] },
        { label: "Motor (HP)", values: [5, 7.5, 10, 15, 20, "30 / 40", "50 / 60 / 75", 10, 15, 20] },
        { label: "Max. cutting thickness (mm)", values: [4, 5, 6, 7, 8, 10, 14, 1.5, 2, 2.2] },
        { label: "Dimensions, L × W × H (mm)", values: ["890 × 640 × 1145", "1010 × 715 × 1300", "1010 × 815 × 1330", "1290 × 975 × 1670", "1290 × 1075 × 1740", "1735 × 1525 × 2180", "1950 × 1760 × 2740", "1090 × 870 × 1340", "1290 × 995 × 1580", "1435 × 1075 × 1775"] },
        { label: "Approx. net weight (kg)", values: [290, 435, 500, 900, 970, 2000, 3000, 540, 795, 1040] },
        { label: "Dimensions, SP (mm)", values: ["1200 × 870 × 1510", "1320 × 840 × 1580", "1320 × 940 × 1640", "1640 × 1080 × 1980", "1940 × 1180 × 2050", "1850 × 1540 × 2680", "2050 × 1850 × 2860", "1350 × 880 × 1550", "1540 × 1020 × 1800", "1600 × 1140 × 1960"] },
        { label: "Approx. net weight, SP (kg)", values: [400, 435, 604, 900, 1180, 2380, 3500, 750, 1180, 1400] },
      ],
      note: "VAL-10 HP to VAL-20 HP are a separate motor-rated series, not a continuation of the chamber sizes. “SP” is the catalogue’s own designation.",
    },
  ],
  "hopper-loader": [
    {
      title: "Hopper loader series",
      /* VAL-85 before VAL-12 is the catalogue's own order. */
      models: ["VAL-02", "VAL-07", "VAL-14", "VAL-85", "VAL-12", "VAL-32"],
      rows: [
        { label: "Nominal throughput (kg/h)", values: [30, "150 – 200", "600 – 750", 1200, 250, 500] },
        { label: "Receiver volume (L)", values: [6, 6, 14, 85, 12, 32] },
        { label: "Body diameter (mm)", values: [203, 203, 304, 635, 254, 381] },
        { label: "Loader height (mm)", values: [640, 470, 475, 1155, 690, 900] },
        { label: "Material / vacuum line, mm (in)", values: ['40 (1.5")', '40-50-60 (1.5"-2"-2.5")', '40-50-60 (1.5"-2"-2.5")', '(2.5", 3", 4")', '50-60-75 (2"-2.5"-3")', '50-60-75 (2"-2.5"-3")'] },
        { label: "Vacuum blower (kW)", values: [0.9, "0.9 / 1.5 / 2.2", "4 / 5.5 / 7.5", 7.5, 4, 7.5] },
        { label: "Supply", values: ["230 V 1-ph", "415 V 3-ph", "415 V 3-ph", "415 V 3-ph", "415 V 3-ph", "415 V 3-ph"] },
        { label: "Compressed air", values: ["28.3 L/min at 5.51 bar"] },
        { label: "Options", values: ["Automatic filter cleaning, ratio valve, positive discharge, common line valve, photo-electric material sensor, intermediate hopper"] },
      ],
      note: "Suffixes: AB — with ratio valve; MC — manual filter cleaning; AC — automatic filter cleaning (e.g. VAL-07 AC).",
    },
  ],
  "laser-marking": [
    {
      title: "Online laser marking machine",
      models: ["VAL-30", "VAL-50"],
      rows: [
        { label: "Laser power", values: ["30 W", "50 W"] },
        { label: "Laser type", values: ["Pulsed fibre laser"] },
        { label: "Wavelength", values: ["1064 nm"] },
        { label: "Cooling", values: ["Air-cooled"] },
        { label: "Beam quality", values: [1.5] },
        { label: "Beam diameter", values: ["7 mm"] },
        { label: "Pulse energy", values: ["0.5 – 1.0 mJ"] },
        { label: "Marking type", values: ["On-the-fly"] },
        { label: "Materials", values: ["LLDP / DRIP / HDPE / PVC"] },
        { label: "Speed synchronisation", values: ["Rotary encoder, depending on controller option"] },
        { label: "Marking area", values: ["150 × 150 mm"] },
        { label: "Focal distance", values: ["210 mm"] },
        { label: "Z-axis travel", values: ["500 mm"] },
        { label: "Min. marking height", values: ["0.1 mm (depends on font)"] },
        { label: "Single line width", values: ["0.01 mm"] },
        { label: "Working accuracy", values: ["0.19 mm"] },
        { label: "Operating panel", values: ['10" touch panel, Laser Mark software'] },
        { label: "Connectivity", values: ["USB, U-disk"] },
        { label: "Fume extraction", values: ["Centrifugal suction unit"] },
        { label: "Enclosure", values: ["With enclosure, red guide light"] },
        { label: "Laser source life", values: ["70,000 – 100,000 h"] },
        { label: "Power consumption", values: ["750 W"] },
        { label: "Main supply", values: ["220 V AC, 50–60 Hz, UPS protected"] },
        { label: "Operating temperature", values: ["0 – 40 °C"] },
        { label: "Optional", values: ["AC panel cooling unit, remote option"] },
      ],
    },
  ],
  "volumetric-feeder": [
    {
      title: "Volumetric feeder series",
      models: ["VAL 1", "VAL 2", "VAL 3", "VAL 4", "VAL 5"],
      rows: [
        { label: "Dosing capacity (kg/h)", values: ["0.004 – 3.6", "0.07 – 7.0", "0.20 – 10.9", "0.5 – 33.0", "0.5 – 73.0"] },
        { label: "Screw size", values: ["3/8 × 1/4", "3/8 × 3/8", "1/2 × 1/2", "3/4 × 3/4", "1 × 1"] },
        { label: "Hopper capacity", values: ["20 L"] },
        { label: "Feeder weight", values: ["19 kg"] },
        { label: "Control panel (H × W × D)", values: ["300 × 230 × 160 mm"] },
        { label: "Supply", values: ["230 V AC, 50/60 Hz, 1 A running"] },
      ],
    },
  ],
  "mould-temp": [
    {
      title: "Oil and water series",
      models: ["VAL-O-3", "VAL-O-6", "VAL-O-9", "VAL-O-12", "VAL-O-18", "VAL-W-3", "VAL-W-6", "VAL-W-9", "VAL-W-18"],
      rows: [
        { label: "Circulating media", values: ["Oil", "Oil", "Oil", "Oil", "Oil", "Water", "Water", "Water", "Water"] },
        { label: "Max. temperature (°C)", values: [180, 180, 180, 180, 180, 95, 95, 95, 95] },
        { label: "Heating capacity (kW)", values: [3, 6, 9, 12, 18, 3, 6, 9, 18] },
        { label: "Nominal cooling capacity (kW)", values: [20, 20, 20, 28, 28, 20, 20, 20, 28] },
        { label: "Pump pressure (bar)", values: [3.8, 3.8, 3.8, 5, 5, 3.8, 3.8, 3.8, 5] },
        { label: "Pump motor (kW)", values: [0.5, 0.5, 0.5, 2.2, 2.2, 0.5, 0.5, 0.5, 2.2] },
        { label: "Flow rate (LPM)", values: [65, 65, 65, 100, 150, 65, 65, 65, 150] },
        { label: "Tank volume (L)", values: [16, 16, 16, 45, 45, 16, 16, 16, 45] },
        { label: "Weight (kg)", values: [60, 60, 60, 100, 120, 60, 60, 60, 120] },
        { label: "Operating voltage", values: ["415 V, 50 Hz, 3-phase with neutral and earthing"] },
        { label: "Control voltage", values: ["230 V"] },
      ],
      note: "O — oil-circulating; W — water-circulating.",
    },
  ],
  dehumidifier: [
    {
      title: "Dehumidifier series",
      models: ["VI 2DH", "VI 3DH", "VI 5DH"],
      rows: [
        { label: "Moisture extraction at 30 °C, 80 % RH", values: ["200 L/day", "300 L/day", "500 L/day"] },
        { label: "Coverage, non-AC", values: ["1600 sq ft / 450 m³", "2400 sq ft / 679 m³", "3000 sq ft / 845 m³"] },
        { label: "Coverage, AC without AHU", values: ["800 sq ft / 220 m³", "1200 sq ft / 399 m³", "1500 sq ft / 424 m³"] },
        { label: "Air flow, axial fan", values: ["2500 m³/h", "4000 m³/h", "5400 m³/h"] },
        { label: "Noise level", values: ["83 dB", "87 dB", "90 dB"] },
        { label: "Water tank, SS 304", values: ["22 L", "25 L", "30 L"] },
        { label: "Dimensions", values: ['21.5" × 20.5" × 38.5"', '24" × 21" × 40"', '33" × 20.5" × 57"'] },
        { label: "Compressor", values: ["Reciprocating, 3-phase"] },
        { label: "Refrigerant", values: ["R22 / R407"] },
        { label: "Filter", values: ["20 micron"] },
        { label: "Structure", values: ["SS 304, with drain connection"] },
        { label: "Power", values: ["440 V AC, 50 Hz"] },
      ],
    },
  ],
  "hot-air-dryer": [
    {
      title: "Hot air dryer series",
      models: ["VAL-50", "VAL-100", "VAL-150", "VAL-200", "VAL-300", "VAL-400", "VAL-600", "VAL-800"],
      rows: [
        { label: "Hopper capacity (L)", values: [60, 100, 150, 200, 300, 400, 600, 800] },
        { label: "Heater (kW)", values: [2.7, 3.9, 6, 6, 10, 12, 18, 18] },
        { label: "Blower (W)", values: [90, 200, 250, 250, 400, 400, 750, 750] },
        { label: "Height (mm)", values: [1040, 1200, 1234, 1390, 1640, 1840, 1910, 2260] },
        { label: "Width (mm)", values: [730, 680, 1020, 1250, 1250, 1250, 1360, 1370] },
        { label: "Depth (mm)", values: [430, 620, 660, 660, 840, 840, 990, 980] },
        { label: "Supply", values: ["415 V, 3-phase"] },
      ],
    },
  ],
};

export function getModelTables(slug: string): readonly ModelTable[] {
  return PRODUCT_MODELS[slug as ProductSlug] ?? [];
}
