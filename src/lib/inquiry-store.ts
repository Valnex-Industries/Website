import type { Inquiry } from "@/lib/inquiry";

/**
 * The one place inquiries get persisted.
 *
 * Right now there is no database wired up, so this logs to the server console
 * and succeeds. When Supabase is provisioned, set the two env vars below and
 * this starts writing to the `inquiries` table over PostgREST, and no other file
 * in the app has to change. Swapping in `@supabase/supabase-js` later is a
 * drop-in replacement for the `fetch` call in `insertViaSupabase`.
 *
 *   SUPABASE_URL=https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only, never NEXT_PUBLIC_
 *
 * Table DDL lives in supabase/migrations/0001_inquiries.sql.
 */

export interface StoredInquiry extends Inquiry {
  reference: string;
  submittedAt: string;
}

/**
 * The outcome of one delivery channel. `configured` and `delivered` are
 * separate on purpose: an unconfigured channel is a local-development state,
 * while a configured channel that delivered nothing is a production incident.
 * Only the second should ever show the visitor an error.
 */
export interface DeliveryResult {
  ok: boolean;
  configured: boolean;
  delivered: boolean;
  error?: string;
}

/** camelCase app shape → snake_case table columns. */
function toRow(inquiry: StoredInquiry) {
  return {
    reference: inquiry.reference,
    submitted_at: inquiry.submittedAt,
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    phone: inquiry.phone || null,
    division: inquiry.division,
    application: inquiry.application || null,
    volume: inquiry.volume || null,
    timeline: inquiry.timeline || null,
    drawing_url: inquiry.drawingUrl || null,
    message: inquiry.message,
  };
}

async function insertViaSupabase(
  url: string,
  key: string,
  inquiry: StoredInquiry,
): Promise<DeliveryResult> {
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(toRow(inquiry)),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[inquiry] Supabase insert failed", response.status, detail);
      return {
        ok: false,
        configured: true,
        delivered: false,
        error: `Supabase responded ${response.status}`,
      };
    }

    return { ok: true, configured: true, delivered: true };
  } catch (error) {
    console.error("[inquiry] Supabase insert threw", error);
    return {
      ok: false,
      configured: true,
      delivered: false,
      error: "Could not reach the database.",
    };
  }
}

export async function saveInquiry(
  inquiry: StoredInquiry,
): Promise<DeliveryResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    return insertViaSupabase(url, key, inquiry);
  }

  // No database yet, so keep the submission visible in the server log; nothing
  // is silently lost during development.
  console.info("[inquiry] no SUPABASE_URL set; logging instead of persisting", {
    ...toRow(inquiry),
    email: inquiry.email,
  });

  return { ok: true, configured: false, delivered: false };
}
