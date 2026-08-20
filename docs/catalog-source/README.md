# The Valnex brand catalogue: what the source scans actually contain

This folder holds the printed Valnex catalogue as it was handed over, plus the
reasoning that turned it into the product data the site now serves. It exists
because the scans are **not** what their filenames claim, and anyone who trusts
the filenames will publish wrong specifications.

Source: `project-name-valnex-industries-website-2/public/images/products/`.

## The filenames are wrong

The catalogue was scanned as four double-width spreads and then sliced down the
middle. The eight resulting tiles were named after the first eight products of
an unrelated list, in order — so every tile after the first is named for the
wrong machine. A tile named `water-cooled-chiller.png` is not a water-cooled
chiller. It is the right-hand half of the Air Cooled Chiller table.

| Source file | What it really is |
| --- | --- |
| `air-cooled-chiller.png` | Air Cooled Chiller — **left** half |
| `water-cooled-chiller.png` | Air Cooled Chiller — **right** half |
| `hot-air-dryer.png` | Hot Air Dryer — **left** half |
| `hopper-loader.png` | Hot Air Dryer — **right** half |
| `mould-temperature-controller.png` | Mould Temperature Controller — **left** half |
| `volumetric-feeder.png` | Mould Temperature Controller — **right** half |
| `flake-cutter.png` | Flake Cutter — **left** half |
| `dehumidifier.png` | Flake Cutter — **right** half |
| `laser-marking-machine.png` | Laser Marking Machine — complete page |

The pairing is not a guess. Each table's rows continue across the seam with no
break: the Air Cooled Chiller's cooling-capacity row runs 2 → 9.4 TR on the
left tile and picks up at 11.3 → 59 TR on the right; its Refrigerant row is
blank on the left because the merged cell holding "R-22 OR R-407C OR R-410"
begins on the right. The same continuity holds for all four spreads.

Rejoining each pair reproduces the original page, and the full table becomes
readable. Those rejoined pages are committed as
`public/catalog/spec-sheets/*.webp` and are the artefact to cite — not the
tiles.

## The catalogue covers five machines, not nine

Because four of the nine "product images" are second halves, the printed
catalogue documents **five** machines:

| Machine | Models | Site product |
| --- | --- | --- |
| Air Cooled Chiller | 14 (`VI 02A` → `VI060A`) | `chillers` |
| Hot Air Dryer | 7+ (`VAL-50` → `VAL-600`) | `hot-air-dryer` (added) |
| Flake Cutter | 10 (`VAL-230` → `VAL-20 HP`) | `flake-cutter` |
| Mould Temperature Controller | 9 (`VAL-O-3` → `VAL-W-18`) | `mould-temp` |
| Laser Marking Machine | 2 (`VAL-30`, `VAL-50`) | `laser-marking` |

There is **no catalogue data at all** for the water-cooled chiller, the hopper
loader, the volumetric feeder or the dehumidifier. Those four products keep
empty `specs` and `applications`, which the product page renders as an absent
block rather than as filler. That remains the honest state until the company
supplies their pages.

## The other project's `config/products.ts` is not a source

`project-name-valnex-industries-website-2/config/products.ts` carries confident
specification tables for all nine products. They contradict the scans and
should not be copied:

- It gives the air-cooled chiller `R-410A / R-407C` and `460V/3Ph/60Hz`. The
  catalogue says `R-22 OR R-407C OR R-410`, and the Hot Air Dryer page states
  the supply as `415 v 3ø` — Indian mains, consistent with the Make-in-India
  badge shipped alongside. 460 V/60 Hz is North American and wrong here.
- It gives cooling capacity as `5 - 100 TR`. The catalogue range is `2 - 59 TR`.
- It invents specifications for the four machines the catalogue never covers.

Its prose (`longDescription`, applications, FAQ) is plausible marketing copy
with nothing behind it. Only the **applications** lists were reused here, as
category-level statements that the machine type makes true regardless of model,
and only for machines the catalogue does document.

## The PDFs in `public/downloads/` are not documents

Each `*-datasheet.pdf` is a single-page PDF whose only content is the matching
mislabelled PNG — same pixel dimensions, same byte size, no text layer. They
inherit the naming error, so half of them are a datasheet for the wrong machine
and all of them show half a table.

Each `*-manual.pdf` is roughly 5.7 KB of Helvetica with no product content — a
placeholder.

None were copied into `public/`. Publishing them would put half-tables and
wrong-machine "datasheets" on a download page. The rejoined spec sheets in
`public/catalog/spec-sheets/` supersede them.

## What was derived

- `public/catalog/spec-sheets/*.webp` — the four spreads rejoined, plus the
  laser page. Complete, readable tables.
- `public/catalog/photos/*.webp` — machine photography cut out of each page.
  These replace `division_energy.png` / `division_materials.png` /
  `division_robotics.png`, which were abstract division artwork standing in for
  products and were reused across three products each.
- `public/catalog/brand/` — the Make-in-India badge, the production-floor
  banner and the logo SVGs, carried over unchanged.

`air-cooled-chiller-alt.webp` is the second unit on the chiller spread, a blue
cabinet carrying the VALNEX wordmark; it is used as gallery imagery.

## Known gaps in the scans

The scans are 1500 px tall and the tables run past that edge, so the bottom of
three tables is cut off mid-row:

- **Hot Air Dryer** — one or more model rows below `VAL-600`.
- **Mould Temperature Controller** — rows below `Tank Volume (Ltr)`.
- **Flake Cutter** — rows below `Maximum Cutting Thickness (mm)`.
- **Air Cooled Chiller** — possible rows below `Max. Pressure (Bar)`.

Every figure transcribed into `src/lib/products.ts` comes from a fully visible
row. Nothing was extrapolated into the cut-off region. Re-scanning the printed
catalogue at full page height is the way to close this.
