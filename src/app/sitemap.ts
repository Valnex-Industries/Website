import type { MetadataRoute } from "next";
import { getProducts } from "@/services/content";
import { absoluteImageUrl } from "@/lib/imagekit";
import { productHref } from "@/lib/products";
import { siteUrl } from "@/lib/site";

/** Product URLs come from the database, so anything published in the
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
  const products = await getProducts();

  return [
    { url: siteUrl("/") },
    { url: siteUrl("/about") },
    { url: siteUrl("/inquiry") },
    ...products.map((product) => {
      const imageUrl = absoluteImageUrl(product.image);
      return {
        url: siteUrl(productHref(product.slug)),
        ...(product.updatedAt && { lastModified: new Date(product.updatedAt) }),
        ...(imageUrl && { images: [imageUrl] }),
      };
    }),
  ];
}

