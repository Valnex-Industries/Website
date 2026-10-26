import type { SectorId } from "@/lib/industries";
import { SECTOR_FIGURES } from "@/lib/sector-figures.generated";
import { cn } from "@/utils/cn";

/**
 * One sector's Hairline figure: an isometric line drawing of the equipment
 * that sector runs, drawn by scripts/sector-figures.mjs. Static SVG, so it
 * costs no JavaScript. Colour comes from the `.hairline` rules in globals.css:
 * the classes on each stroke (silhouette, crease, highlight, guide) are the
 * whole palette, and the plates take the ground colour from `--hl-plate`.
 */
export function SectorFigure({
  id,
  className,
}: {
  id: SectorId;
  className?: string;
}) {
  const figure = SECTOR_FIGURES[id];
  return (
    <svg
      viewBox={figure.viewBox}
      aria-hidden="true"
      focusable="false"
      className={cn("hairline block h-auto w-full", className)}
    >
      {figure.paths.map(([cls, d], i) => (
        <path key={i} className={cls} d={d} />
      ))}
    </svg>
  );
}
