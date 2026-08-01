"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const PRODUCTS = [
  {
    index: "01",
    title: "Air/Water Cooled Chillers",
    image: "/assets/division_energy.png",
    description: "Industrial cooling systems designed for precision temperature control and maximum uptime.",
    tags: ["Air Cooled", "Water Cooled", "Thermal"],
  },
  {
    index: "02",
    title: "Flake Cutter",
    image: "/assets/division_materials.png",
    description: "High-performance size reduction equipment for consistent, clean flake processing.",
    tags: ["Size Reduction", "Processing"],
  },
  {
    index: "03",
    title: "Hopper Loader",
    image: "/assets/division_robotics.png",
    description: "Automated material handling solutions for seamless production line integration.",
    tags: ["Material Handling", "Automation"],
  },
  {
    index: "04",
    title: "Laser Marking Machine",
    image: "/assets/division_energy.png",
    description: "High-speed, precision marking systems for permanent part identification and traceability.",
    tags: ["Marking", "Traceability"],
  },
  {
    index: "05",
    title: "Volumetric Feeder",
    image: "/assets/division_materials.png",
    description: "Accurate dosing and feeding technology for strict quality and recipe control.",
    tags: ["Dosing", "Feeding"],
  },
  {
    index: "06",
    title: "Mould Temp Controller",
    image: "/assets/division_energy.png",
    description: "Critical thermal regulation units to maintain precise mould conditions.",
    tags: ["Thermal", "Regulation"],
  },
  {
    index: "07",
    title: "Dehumidifier",
    image: "/assets/division_robotics.png",
    description: "Advanced moisture removal systems to protect sensitive materials and processes.",
    tags: ["Moisture Control", "Drying"],
  },
];

export function Divisions() {
  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[color:var(--brand-ink)] py-24 md:py-32"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow text-white/45">Products</span>
              <h2 className="mt-4 max-w-2xl text-[clamp(2rem,4.4vw,3.5rem)] font-black leading-[0.98] tracking-tight text-white">
                Precision equipment,
                <br />
                one engineering standard.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-white/55">
              Every Valnex system runs through the same gate: prove it on the
              bench, prove it on the line, then hold it for the life of the
              asset.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.title} delay={i * 0.1}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] transition-colors duration-500 hover:border-white/30">
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.title} product`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#02102e] via-[rgba(2,16,46,0.25)] to-transparent" />
                  <span className="absolute left-5 top-5 text-xs font-bold tracking-[0.2em] text-white/70">
                    {product.index}
                  </span>
                </div>

                <div className="flex flex-col gap-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-extrabold tracking-tight text-white">
                      {product.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="mt-1 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <p className="text-sm font-light leading-relaxed text-white/55">
                    {product.description}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
