import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Assistant and answer-engine crawlers are named explicitly and allowed.
 *
 * A bare `User-agent: *` already permits them, so this is not what grants
 * access — it is a statement of intent. Several of these bots (Google-Extended,
 * Applebot-Extended, GPTBot) are honoured as opt-*out* signals, and some
 * publishers block them by default at the CDN; naming them here records that
 * this site wants to be cited by assistants, not merely indexed by search.
 */
const ASSISTANT_AGENTS = [
  // OpenAI: training, live retrieval, and the ChatGPT search index
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google and Apple assistant surfaces (distinct from Googlebot/Applebot)
  "Google-Extended",
  "Applebot-Extended",
  // Microsoft Copilot
  "Bingbot",
  // Meta, Amazon, DuckDuckGo, Common Crawl, You.com, Cohere
  "meta-externalagent",
  "Amazonbot",
  "DuckAssistBot",
  "CCBot",
  "YouBot",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* Query-string variants of the inquiry form are the same page with a
           chip preselected; let the canonical carry the weight. */
        disallow: ["/api/", "/_next/"],
      },
      ...ASSISTANT_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/").replace(/\/$/, ""),
  };
}
