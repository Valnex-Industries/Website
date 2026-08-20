import type { Metadata } from "next";
import { CdnImage } from "@/components/CdnImage";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { getNews, isExpired, type NewsPost } from "@/services/content";

export const metadata: Metadata = {
  title: "News & Offers",
  description:
    "Product launches, offers and announcements from Valnex Industries.",
  alternates: { canonical: "/news" },
  openGraph: {
    type: "website",
    title: "News & Offers",
    description:
      "Product launches, offers and announcements from Valnex Industries.",
    url: "/news",
  },
};

/* The feed is edited in the portal, and the portal purges this page's cache on
   save (see /api/revalidate). Between purges it is served from cache, so an
   editor's save is visible within a second and a visitor never waits on a
   database read. */
export const revalidate = 300;

const KIND_LABEL: Record<NewsPost["kind"], string> = {
  news: "News",
  offer: "Offer",
  promotion: "Announcement",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export default async function NewsPage() {
  const posts = await getNews();

  const [lead, ...rest] = posts;

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-ink text-white">
        <section className="mx-auto w-full max-w-7xl px-6 pt-32 pb-12 md:px-10 md:pt-40">
          <Reveal>
            <p className="font-orbitron text-xs tracking-[0.3em] text-white/50 uppercase">
              Newsroom
            </p>
            <h1 className="font-orbitron mt-4 text-4xl leading-[1.05] font-bold md:text-6xl">
              News &amp; Offers
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/60 md:text-lg">
              Product launches, price offers and announcements. Subscribe and we
              will send them to you as they happen.
            </p>
          </Reveal>
        </section>

        {posts.length === 0 ? (
          <section className="mx-auto w-full max-w-7xl px-6 pb-24 md:px-10">
            <div className="rounded-3xl border border-white/10 p-12 text-center md:p-20">
              <p className="font-orbitron text-lg font-semibold">
                Nothing published yet
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
                Announcements will appear here. Subscribe below and you will get
                the first one by email.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* The most recent post gets the full width. A feed where every card
                is the same size makes the reader do the work of finding what is
                new; leading with one is the whole job of a newsroom. */}
            <section className="mx-auto w-full max-w-7xl px-6 pb-6 md:px-10">
              <Reveal>
                <LeadCard post={lead} />
              </Reveal>
            </section>

            {rest.length > 0 ? (
              <section className="mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, index) => (
                    <Reveal key={post.slug} delay={index * 0.05}>
                      <PostCard post={post} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        <section
          id="subscribe"
          className="mx-auto w-full max-w-7xl px-6 pb-24 md:px-10"
        >
          <NewsletterSignup />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function Meta({ post }: { post: NewsPost }) {
  const expired = isExpired(post);

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <span className="rounded-full border border-white/20 px-3 py-1 font-orbitron tracking-widest text-white/70 uppercase">
        {KIND_LABEL[post.kind]}
      </span>
      <time dateTime={post.publishedAt} className="text-white/40">
        {formatDate(post.publishedAt)}
      </time>
      {/* An expired offer is labelled rather than hidden. Pulling it would
          leave a dead link in every email that announced it. */}
      {expired ? (
        <span className="rounded-full bg-white/10 px-3 py-1 text-white/50">
          Offer ended
        </span>
      ) : post.offerEndsAt ? (
        <span className="rounded-full bg-brand-bright/20 px-3 py-1 text-white">
          Until {formatDate(post.offerEndsAt)}
        </span>
      ) : null}
    </div>
  );
}

function LeadCard({ post }: { post: NewsPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-white/10 transition-colors hover:border-white/25 lg:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-white/5 lg:aspect-auto lg:min-h-[420px]">
        {post.coverImage ? (
          <CdnImage
            src={post.coverImage}
            alt={post.coverAlt ?? ""}
            fill
            /* Two columns above lg, full width below — telling the browser so
               it does not download a 1200px image for a 400px slot. */
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/40 to-ink" />
        )}
      </div>

      <div className="flex flex-col justify-center gap-5 p-8 md:p-12">
        <Meta post={post} />
        <h2 className="font-orbitron text-2xl leading-tight font-bold md:text-4xl">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="text-sm leading-relaxed text-white/60 md:text-base">
            {post.excerpt}
          </p>
        ) : null}
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          Read more
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: NewsPost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 transition-colors hover:border-white/25"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
        {post.coverImage ? (
          <CdnImage
            src={post.coverImage}
            alt={post.coverAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-ink" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <Meta post={post} />
        <h3 className="font-orbitron text-lg leading-snug font-bold">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-white/55">
            {post.excerpt}
          </p>
        ) : null}
        <span className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-bold text-white/80">
          Read more
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
