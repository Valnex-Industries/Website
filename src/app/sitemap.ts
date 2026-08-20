import type { MetadataRoute } from "next";
import { getNews, getProducts } from "@/services/content";
import { productHref } from "@/lib/products";
import { siteUrl } from "@/lib/site";

/** Product and news URLs come from the database, so anything published in the
 *  Analytics Portal is listed the moment it goes live rather than whenever
 *  someone remembers to edit this file. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([getProducts(), getNews(100)]);
  const lastModified = new Date();

  return [
    { url: siteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: siteUrl("/inquiry"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      /* Weekly rather than monthly: it is the one page whose content is
         expected to change on its own. */
      url: siteUrl("/news"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...products.map((product) => ({
      url: siteUrl(productHref(product.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...news.map((post) => ({
      url: siteUrl(`/news/${post.slug}`),
      /* The post's own publish date, not now: claiming every article changed
         today is the kind of signal that gets a sitemap distrusted. */
      lastModified: new Date(post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
