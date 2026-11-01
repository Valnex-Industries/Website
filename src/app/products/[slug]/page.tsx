import type { Metadata } from "next";
import { CdnImage } from "@/components/CdnImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import { getProduct, getProducts } from "@/services/content";
import { PRODUCT_SEO, inquiryHref, productHref } from "@/lib/products";
import { getModelTables } from "@/lib/product-models";
import { ModelTables } from "@/components/ModelTables";

/**
 * True now that the catalogue lives in the database. A product added in the
 * Analytics Portal has to work the moment it is published -- with this false it
 * would 404 until the site was rebuilt, which turns "add a product" back into a
 * deploy and undoes the point of making it editable.
 */
export const dynamicParams = true;

/* Pre-renders whatever is published at build time; anything added later is
   rendered on first request and then cached. */
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  const path = productHref(product.slug);
  /* PRODUCT_SEO holds a hand-written, query-first title and spec-based
     description for each catalogue product; those titles already name the
     brand, so they bypass the root layout's "| Valnex Industries" template.
     A product added in the portal later has no entry, and falls back to a
     derived title that still carries the place buyers search with. */
  const seo = PRODUCT_SEO[product.slug];
  const title = seo?.title ?? `${product.title} in Ahmedabad, Gujarat`;
  const description = seo?.description ?? metaDescription(product.summary);

  return {
    title: seo ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Google shows about 155 characters. The summaries alone run 70-90, which
 *  left the snippet without the company or the place; each extra clause is
 *  added only while it still fits. */
const META_LIMIT = 155;
function metaDescription(summary: string): string {
  return [
    "From Valnex Industries, Ahmedabad, Gujarat.",
    "Send an inquiry or chat on WhatsApp.",
  ].reduce(
    (text, clause) =>
      text.length + 1 + clause.length <= META_LIMIT ? `${text} ${clause}` : text,
    summary,
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const modelTables = getModelTables(product.slug);
  const others = products
    .filter((item) => item.slug !== product.slug)
    .slice(0, 3);

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
                    className="border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55"
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
              <div className="relative aspect-4/3 w-full overflow-hidden border border-white/12">
                <CdnImage
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
                  {product.gallery.map((src, index) => (
                    <div
                      key={src}
                      className="relative aspect-4/3 overflow-hidden border border-white/12"
                    >
                      <CdnImage
                        src={src}
                        /* Real alt text once the image comes from the media
                           library, which stores a description against the
                           photograph. Empty stays the honest answer for the
                           legacy public-folder images, which have none. */
                        alt={product.galleryAssets?.[index]?.alt ?? ""}
                        fill
                        sizes="(max-width: 1024px) 30vw, 18vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Reveal>

            <div className="flex flex-col gap-6 lg:col-span-5">
              {/* The inquiry page's sheets, carried over: square corners, an
                  opaque off-white panel on the dark page, blue labels and
                  values, with an orange rule along the top as the one warm
                  mark. Every block renders only when the catalogue has data
                  for it, so an unfilled product reads as sparse, not wrong. */}
              {(product.description ||
                product.specs.length > 0 ||
                product.applications.length > 0) && (
                <Reveal delay={0.1}>
                  <div className="border border-[color:var(--brand-blue)]/10 bg-[#f8f9fa] shadow-2xl shadow-black/10">
                    <div aria-hidden="true" className="h-1 bg-[#f97316]" />
                    <div className="flex flex-col gap-10 p-5 sm:p-6 md:p-8">
                      {product.description && (
                        <div>
                          <span className="eyebrow text-[color:var(--brand-blue)]">
                            Overview
                          </span>
                          <p className="mt-4 text-sm font-medium leading-relaxed text-[color:var(--brand-ink)]/75 md:text-[15px]">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {product.specs.length > 0 && (
                        <div>
                          <span className="eyebrow text-[color:var(--brand-blue)]">
                            Specifications
                          </span>
                          <dl className="mt-4 flex flex-col">
                            {product.specs.map((spec) => (
                              <div
                                key={spec.label}
                                className="flex flex-col gap-1 border-b border-[color:var(--brand-blue)]/10 py-3.5 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                              >
                                <dt className="text-xs font-light text-[color:var(--brand-ink)]/60">
                                  {spec.label}
                                </dt>
                                <dd className="text-sm font-semibold text-[color:var(--brand-blue)] sm:text-right">
                                  {spec.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}

                      {product.applications.length > 0 && (
                        <div>
                          <span className="eyebrow text-[color:var(--brand-blue)]">
                            Applications
                          </span>
                          <ul className="mt-4 flex flex-col gap-2.5">
                            {product.applications.map((application) => (
                              <li
                                key={application}
                                className="flex items-baseline gap-3 text-sm font-medium leading-relaxed text-[color:var(--brand-ink)]/75"
                              >
                                <span
                                  aria-hidden="true"
                                  className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 bg-[#f97316]"
                                />
                                {application}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              )}

              <Reveal delay={0.16}>
                <div className="border border-[color:var(--brand-blue)]/10 bg-[#f8f9fa] p-5 shadow-xl shadow-black/5 sm:p-6 md:p-8">
                  <span className="eyebrow text-[color:var(--brand-blue)]/70">
                    Ask about this equipment
                  </span>
                  <p className="mt-4 text-sm font-medium leading-relaxed text-[color:var(--brand-ink)]/75">
                    Send a duty cycle, a drawing, or just the problem. The
                    inquiry arrives tagged to {product.title}.
                  </p>
                  {/* The inquiry form's own submit button: square, solid blue. */}
                  <Link
                    href={inquiryHref(product.slug)}
                    className="group mt-6 flex items-center justify-between gap-6 bg-[color:var(--brand-blue)] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[color:var(--brand-blue)]/20 transition-transform duration-300 hover:-translate-y-0.5"
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

        {/* Every model, as published: the figures behind the ranges above. */}
        {modelTables.length > 0 && (
          <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-20 sm:px-6 lg:px-10 lg:pb-28">
            <Reveal>
              <div className="border-b border-white/10 pb-8">
                <span className="eyebrow text-white/45">Full specification</span>
                <h2 className="mt-4 text-[clamp(1.5rem,3.4vw,2.25rem)] font-black leading-tight tracking-tight text-white">
                  Every model, as published
                </h2>
                <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/55">
                  The figures above are the range across the series. These are
                  the figures model by model, from the Valnex New Catalogue
                  2025. Customised versions are built to a client&rsquo;s
                  specification on request.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <ModelTables tables={modelTables} />
            </Reveal>
          </section>
        )}

        {/* The scanned catalogue page, for a product with no transcribed
            tables — one added in the portal later, say. Where tables exist
            they supersede it: the scans cut off the bottom of several pages. */}
        {modelTables.length === 0 && product.specSheet && (
          <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-20 sm:px-6 lg:px-10 lg:pb-28">
            <Reveal>
              <div className="border-b border-white/10 pb-8">
                <span className="eyebrow text-white/45">Full specification</span>
                <h2 className="mt-4 text-[clamp(1.5rem,3.4vw,2.25rem)] font-black leading-tight tracking-tight text-white">
                  Every model, as published
                </h2>
                <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/55">
                  The figures above are the range across the series. This is the
                  catalogue page they come from, model by model.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              {/* Wide table artwork: it stays legible by being openable at full
                  size, which matters more here than fitting the column. */}
              <a
                href={product.specSheet}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 block overflow-hidden border border-white/12 bg-white transition-colors duration-500 hover:border-white/30"
              >
                <CdnImage
                  src={product.specSheet}
                  alt={`Technical specification table for ${product.title}`}
                  width={2360}
                  height={1500}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="h-auto w-full"
                />
              </a>
              <p className="mt-3 text-xs font-light text-white/40">
                Open the sheet for the full table.
              </p>
            </Reveal>
          </section>
        )}

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
                  className="group relative flex h-full flex-col overflow-hidden border border-[color:var(--brand-blue)]/10 bg-[#f8f9fa] shadow-xl shadow-black/10 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {/* The orange rule runs in from the left on hover: the card's
                      one warm mark, as on the sheets above. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-[#f97316] transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <div className="relative aspect-4/3 overflow-hidden bg-[#08131f]">
                    <CdnImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
                    <h3 className="text-base font-extrabold tracking-tight text-[color:var(--brand-ink)]">
                      {item.title}
                    </h3>
                    <ArrowUpRight
                      size={18}
                      className="mt-0.5 shrink-0 text-[color:var(--brand-blue)]/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[color:var(--brand-blue)]"
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
