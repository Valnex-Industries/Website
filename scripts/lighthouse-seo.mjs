/**
 * Lighthouse SEO audit of every page the sitemap lists.
 *
 *   npm run build && npm run lighthouse:seo       audit the local production build
 *   npm run lighthouse:seo -- <url>               audit a running server or deployment
 *
 * The URLs come from /sitemap.xml rather than from a list in lighthouserc.cjs.
 * The sitemap is already derived from the catalogue and the news table, and it
 * is the site's own statement of what it wants indexed -- so a product
 * published in the portal is audited without anyone touching this file, and a
 * page the sitemap advertises but crawlers can't use is exactly what this is
 * here to catch.
 *
 * Each <loc> names the canonical host (www.valnexindustries.com); its path is
 * re-rooted onto the origin under test, so a local build is audited locally and
 * production is only ever audited when it is named explicitly.
 *
 * Settings and pass/fail rules: lighthouserc.cjs. Reports: .lighthouseci/reports/.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";

const require = createRequire(import.meta.url);

/* Run with node directly rather than through npx: on Windows npx needs a
   shell, and killing that shell leaves the server it started still running. */
const NEXT_BIN = require.resolve("next/dist/bin/next");
const LHCI_BIN = require.resolve("@lhci/cli/src/cli.js");

/* Off 3000 so the audit can run alongside `npm run dev`. */
const PORT = 3100;
const READY_TIMEOUT_MS = 60_000;

let server;

async function startServer() {
  const origin = `http://localhost:${PORT}`;
  server = spawn(process.execPath, [NEXT_BIN, "start", "--port", String(PORT)], {
    stdio: ["ignore", "inherit", "inherit"],
  });

  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error("`next start` exited. Run `npm run build` first.");
    }
    try {
      await fetch(origin);
      return origin;
    } catch {
      await sleep(500);
    }
  }
  throw new Error(`\`next start\` did not answer on ${origin} within ${READY_TIMEOUT_MS / 1000}s.`);
}

async function sitemapUrls(origin) {
  const response = await fetch(`${origin}/sitemap.xml`);
  if (!response.ok) {
    throw new Error(`${origin}/sitemap.xml returned ${response.status}.`);
  }

  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1].trim().replaceAll("&amp;", "&"),
  );
  if (locs.length === 0) throw new Error(`${origin}/sitemap.xml lists no URLs.`);

  return locs.map((loc) => {
    const { pathname, search } = new URL(loc);
    return new URL(pathname + search, origin).href;
  });
}

function run(command, args) {
  return new Promise((resolve) => {
    spawn(command, args, { stdio: "inherit" }).once("exit", (code) => resolve(code ?? 1));
  });
}

async function main() {
  const target = process.argv[2];
  const origin = target ? new URL(target).origin : await startServer();
  const urls = await sitemapUrls(origin);

  console.log(`\nAuditing ${urls.length} URLs from ${origin}/sitemap.xml\n`);
  return run(process.execPath, [
    LHCI_BIN,
    "autorun",
    ...urls.map((url) => `--collect.url=${url}`),
  ]);
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(`\n${error.message}`);
  process.exitCode = 1;
} finally {
  server?.kill();
}
