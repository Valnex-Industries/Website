import { llmsFull, LLMS_HEADERS } from "@/lib/llms";
import { getProducts } from "@/services/content";

/**
 * /llms-full.txt — the companion to /llms.txt that the llmstxt.org convention
 * describes: every product's description, specifications and applications in
 * one plain-text file, so an assistant can read the whole catalogue in one
 * fetch instead of rendering eight animated pages. The text lives in
 * `lib/llms.ts`.
 */

export const revalidate = 300;

export async function GET() {
  return new Response(llmsFull(await getProducts()), { headers: LLMS_HEADERS });
}
