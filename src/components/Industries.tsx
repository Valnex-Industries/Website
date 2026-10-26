import Link from "next/link";
import {
  Cpu,
  Droplet,
  FlaskConical,
  Milk,
  Pill,
  Shield,
  Stethoscope,
  Torus,
  Wheat,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PROCESSES, SECTORS, type SectorId } from "@/lib/industries";
import { PRODUCTS, productHref, type Product } from "@/lib/products";

/** Kept here rather than in lib/industries.ts: lib/ holds data, not React. */
const SECTOR_ICONS: Record<SectorId, LucideIcon> = {
  chemical: FlaskConical,
  defence: Shield,
  energy: Zap,
  food: Wheat,
  medical: Stethoscope,
  pharmaceutical: Pill,
  plastics: Milk,
  rubber: Droplet,
  semiconductor: Cpu,
  tyre: Torus,
};

/**
 * Industries served, placed between the company profile and the inquiry band:
 * what Valnex makes, who it is, then who it is for.
 *
 * Two answers to "is this for my plant?". The sector grid answers it for a
 * buyer who thinks in industries — all of them served with process cooling, as
 * the company states it. The process rows answer it for a plastics processor,
 * who thinks in moulding and extrusion, and route straight to the machines.
 *
 * The background runs from the profile's closing blue down to ink, so the two
 * sections read as one surface rather than as a seam.
 */
export function Industries({ products = PRODUCTS }: { products?: Product[] }) {
  const titles = new Map(products.map((p) => [p.slug, p.title]));

  return (
    <section
      id="industries"
      className="relative overflow-hidden bg-linear-to-b from-[#0a2472] to-[color:var(--brand-ink)] py-20 md:py-28 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-white/45">Industries we serve</span>
            <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.5rem)] font-black leading-[0.98] tracking-tight text-white">
              For every line that runs hot.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7 lg:pt-2">
            <p className="text-base font-light leading-relaxed text-white/75 sm:text-lg md:text-xl">
              Valnex chillers deliver accurate process temperature control
              across {SECTORS.length} industries, from pharmaceutical and medical
              manufacturing to food, energy and semiconductors.
            </p>
            <p className="mt-6 text-sm font-light leading-relaxed text-white/55 md:text-base">
              For plastics processors, the full auxiliary range covers every
              stage around the machine: drying, conveying, dosing, mould
              temperature and regrind.
            </p>
          </Reveal>
        </div>

        {/* Same hairline-grid construction as the profile's stat band above:
            the gap is the parent showing through, so the rules redraw
            themselves across the 2 → 5 column change. */}
        <Reveal delay={0.05}>
          <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-5 md:mt-20">
            {SECTORS.map((sector) => {
              const Icon = SECTOR_ICONS[sector.id];
              return (
                <li
                  key={sector.id}
                  className="flex min-w-0 flex-col gap-4 bg-[#061a4a] p-5 sm:p-4 md:p-6"
                >
                  <Icon
                    aria-hidden="true"
                    size={26}
                    strokeWidth={1.5}
                    className="text-[#f97316]"
                  />
                  {/* "Pharmaceutical" is the longest name and has ~100px at
                      768, where the grid first runs five across. */}
                  <span className="text-[13px] font-bold tracking-tight text-white md:text-base">
                    {sector.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <div className="border-b border-white/10 pb-6">
              <span className="eyebrow text-white/45">
                Plastics processing, by process
              </span>
            </div>
          </Reveal>

          <ol className="flex flex-col">
            {PROCESSES.map((process, i) => {
              const slugs = process.products.filter((slug) => titles.has(slug));
              return (
                /* Reveal renders a div, so it goes inside the <li>: an <ol>
                   may only hold list items. */
                <li key={process.name} className="border-b border-white/10">
                  <Reveal
                    delay={i * 0.06}
                    className="grid gap-5 py-8 md:grid-cols-12 md:gap-8 md:py-10"
                  >
                    <div className="flex gap-5 md:col-span-5">
                      <span className="font-orbitron text-xs font-bold tracking-[0.2em] text-white/35 md:pt-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-lg font-extrabold tracking-tight text-white md:text-xl">
                          {process.name}
                        </h3>
                        <p className="mt-2 text-sm font-light leading-relaxed text-white/55">
                          {process.summary}
                        </p>
                      </div>
                    </div>

                    <ul className="flex flex-wrap content-start gap-2 pl-10 md:col-span-7 md:pl-0">
                      {slugs.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={productHref(slug)}
                            className="inline-flex rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/75 transition-colors duration-300 hover:border-[#f97316] hover:text-white"
                          >
                            {titles.get(slug)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
