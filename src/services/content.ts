import "server-only";

import { PRODUCTS, type Product, type ProductSlug } from "@/lib/products";
import { queryPublic } from "@/services/supabase";

/**
 * Reads the content the Analytics Portal manages: products and news.
 *
 * Reads go through `services/supabase.ts`, which owns the credentials, the
 * cache tags and the failure semantics. The tag is what lets the portal purge
 * this cache the moment someone saves an edit (see /api/revalidate).
 *
 * Two properties worth stating plainly:
 *
 *   1. Reads use the ANON key. Row-level security means that key can only ever
 *      see published rows -- a draft product cannot leak onto the live site
 *      even if this file asked for it.
 *
 *   2. Products fall back to the compile-time catalogue in `products.ts` when
 *      Supabase is unset or unreachable. The website predates the database and
 *      must not go blank because of an outage in it; a slightly stale product
 *      list beats an empty homepage. News has no fallback, because an empty
 *      news feed is a truthful empty state rather than a broken one.
 */

export const CACHE_TAGS = {
  products: "products",
  news: "news",
} as const;

/* --- Products ------------------------------------------------------------ */

/** The subset of `media_assets` the website renders. */
export interface MediaAsset {
  file_path: string;
  alt: string;
  width: number | null;
  height: number | null;
}

interface ProductRow {
  slug: string;
  position: number;
  title: string;
  summary: string;
  description: string;
  image: string;
  gallery: string[] | null;
  tags: string[] | null;
  specs: { label: string; value: string }[] | null;
  applications: string[] | null;
  spec_sheet: string | null;
  image_asset: MediaAsset | null;
  product_media:
    | { position: number; alt: string | null; media_assets: MediaAsset | null }[]
    | null;
}

/**
 * `index` is the zero-padded label the cards show ("01"). It is derived from
 * the row's ordinal position here rather than stored, so reordering in the
 * portal renumbers the grid without a second column to keep in sync.
 *
 * ImageKit wins over the legacy column when both are set. That precedence is
 * what lets the seven seeded products keep their `public/` artwork until
 * someone uploads a replacement, with no migration inventing files that were
 * never in ImageKit.
 */
function toProduct(row: ProductRow, ordinal: number): Product {
  const gallery = (row.product_media ?? [])
    .slice()
    /* PostgREST cannot order an embedded resource by the join table's own
       column, so the sort happens here. */
    .sort((a, b) => a.position - b.position)
    /* The join row's `alt` overrides the library's for this one placement.
       Null is the normal case and means "use the library's description". */
    .map((entry) =>
      entry.media_assets
        ? { ...entry.media_assets, alt: entry.alt ?? entry.media_assets.alt }
        : null,
    )
    .filter((asset): asset is MediaAsset => Boolean(asset));

  return {
    slug: row.slug as ProductSlug,
    index: String(ordinal + 1).padStart(2, "0"),
    title: row.title,
    summary: row.summary,
    description: row.description,
    image: row.image_asset?.file_path || row.image,
    imageAlt: row.image_asset?.alt ?? "",
    imageWidth: row.image_asset?.width ?? null,
    imageHeight: row.image_asset?.height ?? null,
    gallery:
      gallery.length > 0
        ? gallery.map((asset) => asset.file_path)
        : (row.gallery ?? []),
    galleryAssets: gallery,
    tags: row.tags ?? [],
    specs: row.specs ?? [],
    applications: row.applications ?? [],
    /* Undefined rather than null when unset, so the product page's
       `product.specSheet && ...` guard reads the same for a database product
       as for one still coming from the compile-time catalogue. */
    specSheet: row.spec_sheet ?? undefined,
  };
}

const PRODUCT_SELECT =
  "select=slug,position,title,summary,description,image,gallery,tags,specs,applications,spec_sheet," +
  "image_asset:media_assets!products_image_id_fkey(file_path,alt,width,height)," +
  "product_media(position,alt,media_assets(file_path,alt,width,height))";

export async function getProducts(): Promise<Product[]> {
  const rows = await queryPublic<ProductRow>(
    `products?status=eq.published&order=position.asc&${PRODUCT_SELECT}`,
    { tag: CACHE_TAGS.products },
  );

  /* Null means "could not read", which is the outage case -- fall back.
     An empty array means the table is genuinely empty, which happens only
     before the seed migration runs; falling back there too keeps a fresh
     install looking like the site it is replacing. */
  if (!rows || rows.length === 0) return PRODUCTS;

  return rows.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

/* --- News ---------------------------------------------------------------- */

export type NewsKind = "news" | "offer" | "promotion";

export interface NewsPost {
  slug: string;
  kind: NewsKind;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  publishedAt: string;
  offerEndsAt: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

interface NewsRow {
  slug: string;
  kind: NewsKind;
  title: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  cover_alt: string | null;
  cover_asset: MediaAsset | null;
  published_at: string;
  offer_ends_at: string | null;
  cta_label: string | null;
  cta_url: string | null;
}

function toNews(row: NewsRow): NewsPost {
  return {
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    /* ImageKit wins when set; the legacy path is the fallback. */
    coverImage: row.cover_asset?.file_path ?? row.cover_image,
    /* Per-post alt overrides the library's, because a cover can be captioned
       differently from the same photo used elsewhere. */
    coverAlt: row.cover_alt ?? row.cover_asset?.alt ?? null,
    coverWidth: row.cover_asset?.width ?? null,
    coverHeight: row.cover_asset?.height ?? null,
    publishedAt: row.published_at,
    offerEndsAt: row.offer_ends_at,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
  };
}

const NEWS_SELECT =
  "select=slug,kind,title,excerpt,body,cover_image,cover_alt,published_at," +
  "offer_ends_at,cta_label,cta_url," +
  "cover_asset:media_assets!news_posts_cover_id_fkey(file_path,alt,width,height)";

export async function getNews(limit = 24): Promise<NewsPost[]> {
  /* The `published_at <= now` half of the filter is enforced by the RLS policy
     as well, so a scheduled post cannot appear early even if this query were
     wrong. Stating it here too keeps the intent visible at the call site. */
  const rows = await queryPublic<NewsRow>(
    `news_posts?status=eq.published&order=published_at.desc&limit=${limit}&${NEWS_SELECT}`,
    { tag: CACHE_TAGS.news },
  );

  return (rows ?? []).map(toNews);
}

export async function getNewsPost(slug: string): Promise<NewsPost | null> {
  const rows = await queryPublic<NewsRow>(
    `news_posts?status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1&${NEWS_SELECT}`,
    { tag: CACHE_TAGS.news },
  );

  return rows && rows.length > 0 ? toNews(rows[0]) : null;
}

/** True once an offer's end date has passed. The feed greys the card out. */
export function isExpired(post: NewsPost): boolean {
  return Boolean(post.offerEndsAt && new Date(post.offerEndsAt) < new Date());
}
