import type { MetadataRoute } from "next";
import { PRODUCTS, productHref } from "@/lib/products";
import { siteUrl } from "@/lib/site";

/** Product URLs come from the catalogue, so a new product is listed the moment
 *  it is added rather than whenever someone remembers to edit this file. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: siteUrl("/inquiry"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    ...PRODUCTS.map((product) => ({
      url: siteUrl(productHref(product.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
