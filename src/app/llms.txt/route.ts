import { llmsIndex, LLMS_HEADERS } from "@/lib/llms";
import { getNews, getProducts } from "@/services/content";

/**
 * /llms.txt — the llmstxt.org convention: the site as short, unambiguous
 * markdown, for a crawler that would otherwise have to execute a heavy
 * animated page or guess from the sitemap. The text lives in `lib/llms.ts`.
 *
 * Built from the database the pages read, on the product pages' revalidate
 * window, so it never describes a catalogue the site no longer shows.
 */

export const revalidate = 300;

export async function GET() {
  const [products, news] = await Promise.all([getProducts(), getNews(1)]);
  return new Response(llmsIndex(products, news), { headers: LLMS_HEADERS });
}
