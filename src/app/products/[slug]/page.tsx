import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import {
  PRODUCTS,
  getProduct,
  inquiryHref,
  productHref,
} from "@/lib/products";

/** The catalogue is fixed at build time, so anything else is a 404, not a
 *  render attempt. */
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) return {};

  const path = productHref(product.slug);

  return {
    /* The root layout's template appends "| Valnex Industries". */
    title: product.title,
    description: product.summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.summary,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.summary,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) notFound();

  const others = PRODUCTS.filter((item) => item.slug !== product.slug).slice(
    0,
    3,
  );

  return (
    <div className="relative w-full bg-[color:var(--brand-ink)]">
      {/* Product identity and its place in the site, for answer engines that
          cite a specific machine rather than the homepage. */}
      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Products", path: "/#products" },
          { name: product.title, path: productHref(product.slug) },
        ])}
      />
      <Navbar />

      <main className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
        />

        {/* Intro */}
        <section className="relative mx-auto w-full max-w-[1280px] px-5 pt-28 pb-12 sm:px-6 md:pt-36 md:pb-16 lg:px-10 lg:pt-44">
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="font-orbitron text-xs font-bold tracking-[0.2em] text-white/35">
                {product.index}
              </span>
              <Link
                href="/#products"
                className="eyebrow text-white/45 transition-colors hover:text-[#f97316]"
              >
                Products
              </Link>
            </div>

            <h1 className="mt-4 max-w-3xl text-[clamp(1.9rem,7.5vw,4.25rem)] font-black leading-[1] tracking-tight text-white sm:leading-[0.95]">
              {product.title}
            </h1>

            <p className="mt-6 max-w-xl text-[15px] font-light leading-relaxed text-white/60 sm:mt-8 sm:text-base md:text-lg">
              {product.summary}
            </p>

            {product.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Reveal>
        </section>

        {/* Image + detail */}
        <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-20 sm:px-6 md:pb-28 lg:px-10 lg:pb-32">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-white/12">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#02102e] via-transparent to-transparent" />
              </div>

              {product.gallery.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {product.gallery.map((src) => (
                    <div
                      key={src}
                      className="relative aspect-4/3 overflow-hidden rounded-xl border border-white/12"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 30vw, 18vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Reveal>

            <div className="lg:col-span-5">
              {/* Every block below renders only when the catalogue has data for
                  it, so an unfilled product reads as sparse rather than wrong. */}
              {product.description && (
                <Reveal delay={0.1}>
                  <span className="eyebrow text-white/45">Overview</span>
                  <p className="mt-6 text-sm font-light leading-relaxed text-white/65 md:text-base">
                    {product.description}
                  </p>
                </Reveal>
              )}

              {product.specs.length > 0 && (
                <Reveal delay={0.14}>
                  <div className={product.description ? "mt-12" : ""}>
                    <span className="eyebrow text-white/45">Specifications</span>
                    <dl className="mt-6 flex flex-col">
                      {product.specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex flex-col gap-1 border-b border-white/10 py-4 first:pt-0 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                        >
                          <dt className="text-xs font-light text-white/45">
                            {spec.label}
                          </dt>
                          <dd className="text-sm font-medium text-white sm:text-right">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Reveal>
              )}

              {product.applications.length > 0 && (
                <Reveal delay={0.18}>
                  <div className="mt-12">
                    <span className="eyebrow text-white/45">Applications</span>
                    <ul className="mt-6 flex flex-col gap-3">
                      {product.applications.map((application) => (
                        <li
                          key={application}
                          className="flex gap-3 text-sm font-light leading-relaxed text-white/65"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-px w-4 shrink-0 bg-[#f97316]"
                          />
                          {application}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )}

              <Reveal delay={0.22}>
                <div className="mt-12 rounded-2xl border border-white/12 bg-white/[0.03] p-6 md:p-8">
                  <h2 className="text-lg font-extrabold tracking-tight text-white">
                    Ask about this equipment
                  </h2>
                  <p className="mt-3 text-sm font-light leading-relaxed text-white/55">
                    Send a duty cycle, a drawing, or just the problem. The
                    inquiry arrives tagged to {product.title}.
                  </p>
                  <Link
                    href={inquiryHref(product.slug)}
                    className="group mt-6 flex items-center justify-between gap-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-[color:var(--brand-blue)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Start an inquiry
                    <ArrowRight
                      size={16}
                      strokeWidth={2.5}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-24 sm:px-6 lg:px-10 lg:pb-32">
          <Reveal>
            <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-8">
              <h2 className="text-[clamp(1.5rem,3.4vw,2.25rem)] font-black leading-tight tracking-tight text-white">
                Other equipment
              </h2>
              <Link
                href="/#products"
                className="group flex shrink-0 items-center gap-2 text-sm font-bold text-[#f97316]"
              >
                View all
                <ArrowRight
                  size={14}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {others.map((item, i) => (
              <Reveal key={item.slug} delay={i * 0.1}>
                <Link
                  href={productHref(item.slug)}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] transition-colors duration-500 hover:border-white/30"
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#02102e] via-[rgba(2,16,46,0.25)] to-transparent" />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                    <h3 className="text-base font-extrabold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="mt-0.5 shrink-0 text-white/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
