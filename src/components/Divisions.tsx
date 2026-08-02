"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS, productHref } from "@/lib/products";

export function Divisions() {
  return (
    <section
      id="products"
      className="relative overflow-hidden bg-[color:var(--brand-ink)] py-20 md:py-28 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between md:pb-10">
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

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 md:mt-14">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.1}>
              {/* The whole card is the link — the arrow was only ever a hint
                  that it went somewhere, and now it actually does. */}
              <Link
                href={productHref(product.slug)}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] transition-colors duration-500 hover:border-white/30"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.title} product`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#02102e] via-[rgba(2,16,46,0.25)] to-transparent" />
                  <span className="absolute left-5 top-5 text-xs font-bold tracking-[0.2em] text-white/70">
                    {product.index}
                  </span>
                </div>

                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                      {product.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="mt-1 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                  <p className="text-sm font-light leading-relaxed text-white/55">
                    {product.summary}
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
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
