"use client";

import { Reveal } from "@/components/Reveal";

const STATS = [
  { value: "1962", label: "Founded" },
  { value: "24", label: "Plants worldwide" },
  { value: "3,400+", label: "Engineers & operators" },
  { value: "99.2%", label: "On-time delivery" },
];

export function Manifesto() {
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
            <p className="text-base font-light leading-relaxed text-white/75 sm:text-lg md:text-xl">
              For decades Valnex Industries has engineered the industrial equipment
              nobody else could deliver: the chillers that hold tolerance under extreme thermal load,
              the volumetric feeders that cannot drift, and the flake cutters that have to
              cycle for twenty years without a service call.
            </p>
            <p className="mt-6 text-sm font-light leading-relaxed text-white/55 md:text-base">
              We keep advanced thermal management, materials processing, and automation
              under one roof, so every system is validated against the highest standards
              before it ever reaches a customer line. That is what we mean by the power to respond.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 md:mt-20 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="bg-[#0a2472]"
            >
              <div className="flex h-full flex-col gap-2 p-5 sm:p-6 md:p-8">
                <span className="text-[clamp(1.6rem,7vw,2.75rem)] font-black leading-none tracking-tight text-white">
                  {stat.value}
                </span>
                <span className="eyebrow text-white/45">{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
