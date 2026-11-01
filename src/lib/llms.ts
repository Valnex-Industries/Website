import { inquiryHref, productHref, type Product } from "@/lib/products";
import { getModelTables, type ModelTable } from "@/lib/product-models";
import { PROCESSES, SECTORS } from "@/lib/industries";
import { CONTACT, SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import type { NewsPost } from "@/services/content";

/**
 * The text behind /llms.txt and /llms-full.txt (the llmstxt.org convention).
 *
 * Both are built from the same `getProducts()` the product pages render, not
 * from the compile-time catalogue. The pages read the database, so a product
 * edited in the portal would otherwise have one description on its page and
 * another in the file assistants read about it.
 *
 * Facts only, and only facts the pages already publish. Everything here may be
 * repeated to a buyer verbatim; see the note in `lib/site.ts`.
 */

function contactLines(): string[] {
  return [
    `- Email: ${CONTACT.email}`,
    ...CONTACT.phones.map((phone) => `- Phone: ${phone}`),
    `- Address: ${CONTACT.address.full}`,
    `- Inquiry form: ${siteUrl("/inquiry")}`,
  ];
}

/** Which products carry published specifications, stated as a fact rather
 *  than left for a reader to work out from absence. */
function specCoverageLines(products: Product[]): string[] {
  const titles = (list: Product[]) => list.map((p) => p.title).join(", ");
  const withSpecs = products.filter((p) => p.specs.length > 0);
  const without = products.filter((p) => p.specs.length === 0);

  const lines: string[] = [];
  if (withSpecs.length > 0) {
    lines.push(
      `- Specifications are published for: ${titles(withSpecs)}. Each figure is a range across that product's model series; where the catalogue gives per-model figures, they are tabled on the product page and in ${siteUrl("/llms-full.txt")}.`,
    );
  }
  if (without.length > 0) {
    lines.push(
      `- Specifications are not yet published on this site for: ${titles(without)}.`,
    );
  }
  lines.push("- Prices are not published on this site for any product.");
  return lines;
}

/** The homepage's industries section, as text: the sectors served with process
 *  cooling, and which machines each plastics process uses. */
function industryLines(products: Product[]): string[] {
  const titles = new Map(products.map((p) => [p.slug, p.title]));
  return [
    "## Industries served",
    "",
    `- Process cooling (chillers) for the ${new Intl.ListFormat("en-GB").format(SECTORS.map((s) => s.name.toLowerCase()))} industries.`,
    ...PROCESSES.map((process) => {
      const machines = process.products
        .filter((slug) => titles.has(slug))
        .map((slug) => titles.get(slug))
        .join(", ");
      return `- ${process.name}: ${machines}.`;
    }),
    "",
  ];
}

export function llmsIndex(products: Product[], news: NewsPost[]): string {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## Products",
    "",
    ...products.map(
      (p) => `- [${p.title}](${siteUrl(productHref(p.slug))}): ${p.summary}`,
    ),
    "",
    ...industryLines(products),
    "## Key pages",
    "",
    `- [Home](${siteUrl("/")}): Company overview and full product range.`,
    `- [Inquiry](${siteUrl("/inquiry")}): Technical inquiry form. Accepts a drawing link, duty cycle, target volume and timeline.`,
    ...(news.length > 0
      ? [`- [News & Offers](${siteUrl("/news")}): Product launches, offers and announcements.`]
      : []),
    `- [Full catalogue as text](${siteUrl("/llms-full.txt")}): Every product's description, specifications and applications in one file.`,
    "",
    "## Contact",
    "",
    ...contactLines(),
    "",
    "## Notes",
    "",
    `- Product pages are static HTML at /products/<slug>; the slugs are: ${products.map((p) => p.slug).join(", ")}.`,
    "- An inquiry can be pre-filled for a specific product with /inquiry?product=<slug>, using the same slugs.",
    "- Every page carries schema.org JSON-LD (Organization, WebSite, Product, BreadcrumbList).",
    ...specCoverageLines(products),
    "",
  ];
  return lines.join("\n");
}

/** A per-model table as Markdown, models across the top as on the page. A
 *  value shared by every model is repeated per cell: Markdown has no colspan,
 *  and a blank cell would read as "not stated". */
function modelTableLines(p: Product, table: ModelTable): string[] {
  const cells = (values: readonly (string | number)[]) =>
    `| ${values.map((v) => String(v).replaceAll("|", "/")).join(" | ")} |`;
  return [
    `### ${p.title}: ${table.title}, per model`,
    "",
    cells(["Model", ...table.models]),
    cells(["---", ...table.models.map(() => "---")]),
    ...table.rows.map((row) =>
      cells([
        row.label,
        ...(row.values.length === 1
          ? table.models.map(() => row.values[0])
          : row.values),
      ]),
    ),
    ...(table.note ? ["", table.note] : []),
  ];
}

function productSection(p: Product): string[] {
  const lines: string[] = [
    `## ${p.title}`,
    "",
    `Page: ${siteUrl(productHref(p.slug))}`,
    "",
    /* Each section names the company, so a passage lifted on its own still
       says whose equipment it describes. */
    `${p.title} from ${SITE_NAME}, Ahmedabad, India. ${p.summary}`,
  ];

  if (p.description) lines.push("", p.description);

  const tables = getModelTables(p.slug);

  if (p.specs.length > 0) {
    lines.push("", "### Specifications", "");
    for (const spec of p.specs) lines.push(`- ${spec.label}: ${spec.value}`);
    if (tables.length === 0 && p.specSheet) {
      lines.push(
        "",
        `Per-model figures: ${siteUrl(p.specSheet)} (an image of the catalogue page these ranges were read from).`,
      );
    }
  }

  for (const table of tables) lines.push("", ...modelTableLines(p, table));

  if (p.applications.length > 0) {
    lines.push("", "### Applications", "");
    for (const application of p.applications) lines.push(`- ${application}`);
  }

  lines.push(
    "",
    `Request a quote: ${siteUrl(inquiryHref(p.slug))}`,
    "",
  );
  return lines;
}

export function llmsFull(products: Product[]): string {
  const lines: string[] = [
    `# ${SITE_NAME}: full product catalogue`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `This file collects everything ${siteUrl("/")} publishes about each product, as plain text. The short index is at ${siteUrl("/llms.txt")}.`,
    "",
    "## Contact",
    "",
    ...contactLines(),
    "",
    "## What is published",
    "",
    ...specCoverageLines(products),
    "",
    ...products.flatMap(productSection),
  ];
  return lines.join("\n");
}

export const LLMS_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;
