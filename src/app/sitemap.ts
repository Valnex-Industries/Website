import type { MetadataRoute } from "next";
import { getNews, getProducts } from "@/services/content";
import { productHref } from "@/lib/products";
import { siteUrl } from "@/lib/site";

/** Product and news URLs come from the database, so anything published in the
 *  Analytics Portal is listed the moment it goes live rather than whenever
 *  someone remembers to edit this file. */
export const revalidate = 3600;

/**
 * `lastmod` is only given where a real edit date exists. Google honours it only
 * when it is consistently accurate, and stamping every URL with the build time
 * (what this used to do) teaches it to ignore the field for the whole site. A
 * page with no honest date gets no `lastmod` at all.
 *
 * `changefreq` and `priority` are left out: Google ignores both.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([getProducts(), getNews(100)]);

  return [
    { url: siteUrl("/") },
    { url: siteUrl("/about") },
    { url: siteUrl("/inquiry") },
    /* Listed only once something is published. An empty "Nothing published
       yet" page is thin content, and the sitemap is a list of pages worth
       indexing. News is ordered newest first, so [0] is the latest change. */
    ...(news.length > 0
      ? [{ url: siteUrl("/news"), lastModified: new Date(news[0].publishedAt) }]
      : []),
    ...products.map((product) => ({
      url: siteUrl(productHref(product.slug)),
      ...(product.updatedAt && { lastModified: new Date(product.updatedAt) }),
    })),
    ...news.map((post) => ({
      url: siteUrl(`/news/${post.slug}`),
      /* The post's own publish date, not now: claiming every article changed
         today is the kind of signal that gets a sitemap distrusted. */
      lastModified: new Date(post.publishedAt),
    })),
  ];
}
