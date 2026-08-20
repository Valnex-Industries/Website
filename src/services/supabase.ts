import "server-only";

/**
 * The one place this app talks to Supabase.
 *
 * Before this file existed the same twenty lines — read two env vars, build a
 * PostgREST URL, set the apikey and Authorization headers, log and swallow the
 * failure — were copied into four modules. They had already drifted: one logged
 * the response body on failure and the others did not, and only one set
 * `cache: "no-store"` on a write. Consolidating removes the drift and gives
 * every caller the same failure semantics.
 *
 * `@supabase/supabase-js` is deliberately not used. The website needs no
 * realtime, no auth and no storage client — just HTTP GET and POST against
 * PostgREST — and `fetch` is what Next.js can attach a cache tag to, which is
 * the mechanism the portal uses to purge this site's cache on save.
 *
 * TWO KEYS, TWO FUNCTIONS, AND THE DIFFERENCE MATTERS:
 *
 *   anon         reads published content. Row-level security means it cannot
 *                see a draft even if a query asked for one.
 *   service role bypasses RLS entirely. Used only for visitor-generated writes
 *                (analytics, inquiries, newsletter signups), which have no anon
 *                insert policy precisely so they must come through here.
 *
 * Never reach for the admin functions to make a read "just work" — if a public
 * read needs the service role, the real problem is a missing RLS policy.
 */

interface Credentials {
  url: string;
  key: string;
}

function credentials(keyName: "SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY"): Credentials | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env[keyName];
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function headers(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

/** True when the database is reachable at all. Callers use this to decide
 *  between a real failure and the "not provisioned yet" local case. */
export function isSupabaseConfigured(): boolean {
  return credentials("SUPABASE_ANON_KEY") !== null;
}

/**
 * Logs a failed response with the body PostgREST sent back.
 *
 * The status alone is close to useless for diagnosis: a 400 from PostgREST is
 * almost always a schema mismatch, and the body names the offending column or
 * relationship outright ("column products.spec_sheet does not exist"). Without
 * it, a migration that never got applied is indistinguishable from a malformed
 * filter, and the site quietly serves fallback content while the console says
 * only "400".
 *
 * Capped because a gateway or WAF can answer with a full HTML page, and one of
 * those in the server log buries everything around it.
 */
async function logFailure(label: string, path: string, response: Response) {
  let detail = "";
  try {
    detail = (await response.text()).slice(0, 300);
  } catch {
    /* Body already consumed or the connection dropped mid-read. The status is
       still worth logging, so this must not throw. */
  }
  console.error(`[supabase] ${label}`, path, response.status, detail);
}

export interface CacheOptions {
  /** Next.js cache tag. The portal purges these through /api/revalidate. */
  tag: string;
  /** Seconds. A backstop for when the purge call never arrived. */
  revalidate?: number;
}

/**
 * Cached read with the anon key, for public content.
 *
 * Returns null on any failure — including "not configured" — so callers can
 * tell "the database said nothing" apart from "the database returned nothing",
 * which is the difference between falling back and rendering an empty state.
 */
export async function queryPublic<T>(
  path: string,
  cache: CacheOptions,
): Promise<T[] | null> {
  const supabase = credentials("SUPABASE_ANON_KEY");
  if (!supabase) return null;

  try {
    const response = await fetch(`${supabase.url}/rest/v1/${path}`, {
      headers: headers(supabase.key),
      next: { tags: [cache.tag], revalidate: cache.revalidate ?? 300 },
    });

    if (!response.ok) {
      await logFailure("read failed", path, response);
      return null;
    }

    return (await response.json()) as T[];
  } catch (error) {
    console.error("[supabase] read threw", path, error);
    return null;
  }
}

/** Uncached read with the service role, for rows no public policy exposes. */
export async function queryAdmin<T>(path: string): Promise<T[] | null> {
  const supabase = credentials("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabase) return null;

  try {
    const response = await fetch(`${supabase.url}/rest/v1/${path}`, {
      headers: headers(supabase.key),
      cache: "no-store",
    });

    if (!response.ok) {
      await logFailure("admin read failed", path, response);
      return null;
    }

    return (await response.json()) as T[];
  } catch (error) {
    console.error("[supabase] admin read threw", path, error);
    return null;
  }
}

export interface WriteResult<T> {
  ok: boolean;
  rows: T[];
  error?: string;
}

/**
 * Insert with the service role.
 *
 * `returning` defaults to false because most writes here are fire-and-forget
 * analytics, and asking PostgREST to echo the row back costs bandwidth for
 * data nobody reads.
 */
export async function insertAdmin<T = unknown>(
  table: string,
  rows: unknown,
  options: { returning?: boolean } = {},
): Promise<WriteResult<T>> {
  const supabase = credentials("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabase) {
    /* Local development without Supabase. Logged rather than thrown so a
       missing database cannot take a page down — the visitor's experience is
       that nothing happened, which is correct. */
    console.info(`[supabase] not configured; skipped write to ${table}`);
    return { ok: false, rows: [], error: "not configured" };
  }

  try {
    const response = await fetch(`${supabase.url}/rest/v1/${table}`, {
      method: "POST",
      headers: headers(supabase.key, {
        "Content-Type": "application/json",
        Prefer: options.returning ? "return=representation" : "return=minimal",
      }),
      body: JSON.stringify(rows),
      cache: "no-store",
    });

    if (!response.ok) {
      await logFailure("insert failed", table, response);
      return { ok: false, rows: [], error: `Supabase responded ${response.status}` };
    }

    const body = options.returning ? ((await response.json()) as T[]) : [];
    return { ok: true, rows: body };
  } catch (error) {
    console.error(`[supabase] insert into ${table} threw`, error);
    return { ok: false, rows: [], error: "Could not reach the database." };
  }
}

/** Update with the service role. `path` carries the PostgREST filter. */
export async function patchAdmin<T = unknown>(
  path: string,
  values: unknown,
  options: { returning?: boolean } = { returning: true },
): Promise<WriteResult<T>> {
  const supabase = credentials("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabase) return { ok: false, rows: [], error: "not configured" };

  try {
    const response = await fetch(`${supabase.url}/rest/v1/${path}`, {
      method: "PATCH",
      headers: headers(supabase.key, {
        "Content-Type": "application/json",
        Prefer: options.returning ? "return=representation" : "return=minimal",
      }),
      body: JSON.stringify(values),
      cache: "no-store",
    });

    if (!response.ok) {
      await logFailure("patch failed", path, response);
      return { ok: false, rows: [], error: `Supabase responded ${response.status}` };
    }

    const body = options.returning ? ((await response.json()) as T[]) : [];
    return { ok: true, rows: body };
  } catch (error) {
    console.error("[supabase] patch threw", path, error);
    return { ok: false, rows: [], error: "Could not reach the database." };
  }
}
