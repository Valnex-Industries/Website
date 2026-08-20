import type { Metadata } from "next";
import { CdnImage } from "@/components/CdnImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { Navbar } from "@/components/Navbar";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { getNews, getNewsPost, isExpired } from "@/services/content";
import { absoluteImageUrl } from "@/lib/imagekit";
import { markdownToText, renderMarkdown } from "@/lib/markdown";
import { SITE_NAME, siteUrl } from "@/lib/site";

export const revalidate = 300;

/**
 * True, unlike the product pages. A post published in the portal has to be
 * reachable immediately -- it may already be in a newsletter that has gone out.
 * With dynamicParams false, every link in that email would 404 until the site
 * was rebuilt.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getNews(50);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPost(slug);

  if (!post) return {};

  /* Falls back to the body's opening words rather than shipping an empty
     description, which is what a search result would otherwise show. */
  const description = post.excerpt || markdownToText(post.body).slice(0, 160);
  const path = `/news/${post.slug}`;
  const cover = absoluteImageUrl(post.coverImage);

  return {
    title: post.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: path,
      publishedTime: post.publishedAt,
      /* Absolute, and resolved against the right origin: metadataBase would
         otherwise turn an ImageKit path into a URL on our own domain, and
         the link preview would come back blank. */
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function NewsPostPage({
  params,
}: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const post = await getNewsPost(slug);

  if (!post) notFound();

  const others = (await getNews(4)).filter((item) => item.slug !== post.slug).slice(0, 3);
  const expired = isExpired(post);
  const description = post.excerpt || markdownToText(post.body).slice(0, 160);

  return (
    <>
      <Navbar />

      {/* NewsArticle rather than BlogPosting: these are company announcements,
          and the type a crawler is given decides how the result is presented. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          description,
          datePublished: post.publishedAt,
          image: absoluteImageUrl(post.coverImage),
          mainEntityOfPage: siteUrl(`/news/${post.slug}`),
          author: { "@type": "Organization", name: SITE_NAME },
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />

      <main className="flex-1 bg-ink text-white">
        <article className="mx-auto w-full max-w-3xl px-6 pt-32 pb-16 md:pt-40">
          <Reveal>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs tracking-widest text-white/50 uppercase transition-colors hover:text-white"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              All news
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
              <time dateTime={post.publishedAt} className="text-white/40">
                {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Asia/Kolkata",
                })}
              </time>
              {expired ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-white/50">
                  This offer has ended
                </span>
              ) : null}
            </div>

            <h1 className="font-orbitron mt-4 text-3xl leading-[1.1] font-bold md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-5 text-lg leading-relaxed text-white/60">
                {post.excerpt}
              </p>
            ) : null}
          </Reveal>

          {post.coverImage ? (
            <Reveal delay={0.05}>
              <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl bg-white/5">
                <CdnImage
                  src={post.coverImage}
                  alt={post.coverAlt ?? ""}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  priority
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}

          <Reveal delay={0.1}>
            {/* The renderer escapes every character of the source before it
                formats any of it, so the only tags here are ones the app wrote.
                See lib/markdown.ts — that property is what makes this safe to
                render from content typed into the portal. */}
            <div
              className="article-body mt-10"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
            />

            {post.ctaUrl && !expired ? (
              <Link
                href={post.ctaUrl}
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
              >
                {post.ctaLabel || "Find out more"}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </Reveal>
        </article>

        <section className="mx-auto w-full max-w-3xl px-6 pb-16">
          <NewsletterSignup compact />
        </section>

        {others.length > 0 ? (
          <section className="mx-auto w-full max-w-7xl px-6 pb-24 md:px-10">
            <h2 className="font-orbitron text-xs tracking-[0.3em] text-white/50 uppercase">
              More news
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  href={`/news/${item.slug}`}
                  className="group rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/25"
                >
                  <time
                    dateTime={item.publishedAt}
                    className="text-xs text-white/40"
                  >
                    {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Kolkata",
                    })}
                  </time>
                  <h3 className="font-orbitron mt-2 text-base leading-snug font-bold">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <SiteFooter />
    </>
  );
}
