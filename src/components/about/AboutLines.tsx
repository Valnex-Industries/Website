import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { productHref, type Product } from "@/lib/products";

/** The spec that sizes a machine for a buyer, in the order worth trying. */
const SIZING_SPECS = [
  "Cooling capacity",
  "Hopper capacity",
  "Throughput",
  "Heating capacity",
  "Laser power",
];

/** A product's headline range, read from its confirmed specs. Products with
 *  no specs yet show none rather than a guess. The catalogue's en dashes are
 *  set as plain hyphens to match the rest of this page. */
function sizingFor(product: Product): string | undefined {
  for (const label of SIZING_SPECS) {
    const spec = product.specs.find((s) => s.label === label);
    if (spec) return spec.value.replace(/\s*–\s*/g, " - ");
  }
  return undefined;
}

/**
 * Every line the plant builds, each linking to its own page. Tiles share one
 * hairline grid (the gap shows the parent through) so the edges redraw across
 * the 2 to 4 column change without per-cell border rules.
 */
export function AboutLines({ products }: { products: Product[] }) {
  return (
    <section className="relative bg-[color:var(--brand-ink)] py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <Reveal>
          <h2 className="max-w-3xl text-[clamp(1.9rem,4.2vw,3.25rem)] font-black leading-[1.02] tracking-tight text-white">
            {products.length} lines, one plant.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:mt-16 lg:grid-cols-4">
            {products.map((product) => {
              const sizing = sizingFor(product);
              return (
                <li key={product.slug} className="bg-[color:var(--brand-ink)]">
                  <Link
                    href={productHref(product.slug)}
                    className="group flex h-full min-h-32 flex-col justify-between gap-5 p-4 transition-colors duration-300 hover:bg-[#071c52] sm:p-6 md:min-h-44 md:p-7"
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="font-orbitron text-xs font-bold tracking-[0.2em] text-white/35">
                        {product.index}
                      </span>
                      <ArrowUpRight
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#f97316]"
                      />
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold leading-snug text-white sm:text-lg">
                        {product.title}
                      </span>
                      {sizing && (
                        <span className="mt-1 block text-sm font-light text-white/55">
                          {sizing}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
