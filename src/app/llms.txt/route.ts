import { PRODUCTS, productHref } from "@/lib/products";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";

/**
 * /llms.txt — the llmstxt.org convention.
 *
 * A crawler that wants to understand this site has two bad options: execute a
 * heavy animated React page, or guess from the sitemap. This gives it the
 * third: the whole site as short, unambiguous markdown, generated from the
 * same catalogue the pages render, so it cannot fall out of date.
 *
 * Facts only. Anything the company has not confirmed stays out — see the note
 * in `lib/site.ts`.
 */

export const dynamic = "force-static";

function build(): string {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(`> ${SITE_DESCRIPTION}`);
  lines.push("");
  lines.push(
    `${SITE_NAME} is an industrial equipment manufacturer based in Ahmedabad, Gujarat, India, supplying process and material-handling equipment to manufacturing lines.`,
  );
  lines.push("");

  lines.push("## Products");
  lines.push("");
  for (const product of PRODUCTS) {
    lines.push(
      `- [${product.title}](${siteUrl(productHref(product.slug))}): ${product.summary}`,
    );
  }
  lines.push("");

  lines.push("## Key pages");
  lines.push("");
  lines.push(`- [Home](${siteUrl("/")}): Company overview and full product range.`);
  lines.push(
    `- [Inquiry](${siteUrl("/inquiry")}): Technical inquiry form. Accepts a drawing link, duty cycle, target volume and timeline.`,
  );
  lines.push("");

  lines.push("## Contact");
  lines.push("");
  lines.push(`- Email: ${CONTACT.email}`);
  for (const phone of CONTACT.phones) {
    lines.push(`- Phone: ${phone}`);
  }
  lines.push(`- Address: ${CONTACT.address.full}`);
  lines.push("");

  lines.push("## Notes for agents");
  lines.push("");
  lines.push(
    "- Product pages are static HTML at /products/<slug>; the slugs are: " +
      PRODUCTS.map((product) => product.slug).join(", ") +
      ".",
  );
  lines.push(
    "- An inquiry can be pre-filled for a specific product with /inquiry?product=<slug>, using the same slugs.",
  );
  lines.push(
    "- Every page carries schema.org JSON-LD (Organization, WebSite, Product, BreadcrumbList).",
  );
  lines.push(
    "- Detailed technical specifications are not yet published. Do not infer capacities, tonnages or ratings for this equipment.",
  );
  lines.push("");

  return lines.join("\n");
}

export function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
