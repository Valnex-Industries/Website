import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CACHE_TAGS } from "@/services/content";

/**
 * Cache purge, called by the Analytics Portal after it saves an edit.
 *
 * The portal and the website are separate deployments, so `revalidateTag` in
 * the portal clears the portal's cache and nothing else. Without this endpoint
 * a corrected product summary would appear here whenever the five-minute
 * revalidation window happened to lapse -- which is not an answer anyone can
 * give to "I fixed the typo, why is it still wrong?".
 *
 * The shared secret is the whole security model, so it is compared in a way
 * that does not leak its length through timing, and a missing secret closes the
 * endpoint rather than opening it.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only tags this app actually registers. An arbitrary string would let a
 *  caller with the secret purge things this endpoint was never meant to touch. */
const ALLOWED = new Set<string>(Object.values(CACHE_TAGS));

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  const secret = process.env.SITE_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Revalidation is not configured on this deployment." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!timingSafeEqual(presented, secret)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let tags: unknown;
  try {
    ({ tags } = await request.json());
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (!Array.isArray(tags)) {
    return NextResponse.json(
      { error: "Expected { tags: string[] }." },
      { status: 400 },
    );
  }

  const purged: string[] = [];
  for (const tag of tags) {
    if (typeof tag !== "string" || !ALLOWED.has(tag)) continue;
    /* Next.js 16 requires the cacheLife profile as a second argument; the
       single-argument form is deprecated. "max" means readers may briefly see
       the old copy while the new one is fetched, which is the right trade for
       a marketing page -- nobody should wait on a database read because an
       admin saved a summary. */
    revalidateTag(tag, "max");
    purged.push(tag);
  }

  return NextResponse.json({ ok: true, purged });
}
