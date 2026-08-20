"use client";

import { Reveal } from "@/components/Reveal";
import { PRODUCTS } from "@/lib/products";

/**
 * Every figure here has to be one the company can stand behind if a customer
 * checks it. The previous set — founded 1962, 24 plants, 3,400+ staff, 99.2%
 * on-time — was placeholder copy, and contradicted by the public incorporation
 * record (Valnex Industries Private Limited, 05 Aug 2021).
 *
 * The product count is derived rather than typed, so it cannot go stale.
 */
function stats(productCount: number) {
  return [
    { value: "2021", label: "Founded in Ahmedabad" },
    { value: String(productCount), label: "Product lines" },
    { value: "Gujarat", label: "Manufacturing base" },
    { value: "2", label: "Satisfied clients" },
  ];
}

export function Manifesto({
  productCount = PRODUCTS.length,
}: {
  productCount?: number;
}) {
  const STATS = stats(productCount);

  return (
    <section
      id="company"
      className="relative overflow-hidden bg-linear-to-b from-[#02102e] via-[#071c52] to-[#0a2472] py-20 md:py-28 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-8 md:gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <span className="eyebrow text-white/45">Company profile</span>
            <h2 className="mt-4 text-[clamp(2rem,4.4vw,3.5rem)] font-black leading-[0.98] tracking-tight text-white">
              Built to respond.
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            {/* "For decades" and "twenty years without a service call" were
                removed with the stats above: the first is contradicted by the
                2021 incorporation date, the second is a durability claim no
                document supports. The voice is unchanged. */}
            <p className="text-base font-light leading-relaxed text-white/75 sm:text-lg md:text-xl">
              Valnex Industries engineers the equipment a production line cannot
              afford to lose: the chillers that hold tolerance under thermal
              load, the volumetric feeders that cannot drift, and the flake
              cutters that have to keep cycling.
            </p>
            <p className="mt-6 text-sm font-light leading-relaxed text-white/55 md:text-base">
              We keep thermal management, materials processing, and automation
              under one roof, so every system is validated before it ever reaches
              a customer line. That is what we mean by the power to respond.
            </p>
          </Reveal>
        </div>

        {/* Square corners, but held inside the page gutter rather than run to
            the viewport edge. Hairlines are the parent showing through the
            gap, which redraws itself across the 2→4 column change without
            per-cell border rules. */}
        <div className="mt-14 grid grid-cols-2 gap-px bg-[color:var(--brand-ink)]/10 md:mt-20 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="min-w-0 bg-white">
              <div className="flex h-full min-w-0 flex-col gap-2 p-5 sm:p-6 md:p-8">
                {/* Capped well below the cell width: "Gujarat" is the widest
                    value and Orbitron is a wide face, so at 1024px — where the
                    band first splits into four — it has only ~188px to sit in. */}
                <span className="font-orbitron text-[clamp(1.5rem,5vw,2.25rem)] font-black leading-none tracking-tight text-[#f97316] xl:text-[2.5rem]">
                  {stat.value}
                </span>
                <span className="eyebrow text-[color:var(--brand-ink)]/55">
                  {stat.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
