import "server-only";

import { productLabel, type Inquiry } from "@/lib/inquiry";
import { sendMail } from "@/services/email";
import { insertAdmin } from "@/services/supabase";

/**
 * Delivering an inquiry, both ways.
 *
 * This replaces `lib/inquiry-store.ts` and `lib/inquiry-email.ts`, which the
 * server action had to call separately and then reconcile. The reconciliation
 * logic — two channels, neither allowed to sink the other, "configured" and
 * "delivered" tracked apart — is the interesting part of this feature, and it
 * belongs next to the two channels rather than in a page's action.
 *
 * Email is what a person reacts to; the database is the record that survives a
 * full inbox, a deleted message, or someone leaving the company. Both run in
 * parallel and a failure in one never discards the other.
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
    product: inquiry.product || null,
    application: inquiry.application || null,
    volume: inquiry.volume || null,
    timeline: inquiry.timeline || null,
    drawing_url: inquiry.drawingUrl || null,
    message: inquiry.message,
  };
}

async function save(inquiry: StoredInquiry): Promise<DeliveryResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    /* No database yet, so keep the submission visible in the server log;
       nothing is silently lost during development. */
    console.info("[inquiry] no Supabase configured; logging instead", toRow(inquiry));
    return { ok: true, configured: false, delivered: false };
  }

  const result = await insertAdmin("inquiries", toRow(inquiry));
  return {
    ok: result.ok,
    configured: true,
    delivered: result.ok,
    error: result.error,
  };
}

/* --- The notification email ---------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#5b6478;font:400 13px system-ui,sans-serif;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#02102e;font:500 14px system-ui,sans-serif">${escapeHtml(value)}</td>
  </tr>`;
}

function buildHtml(inquiry: StoredInquiry): string {
  return `<div style="max-width:640px;margin:0 auto;padding:24px">
  <p style="margin:0 0 4px;color:#0047e1;font:700 12px system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase">New inquiry</p>
  <h1 style="margin:0 0 20px;color:#02102e;font:800 22px system-ui,sans-serif">${escapeHtml(inquiry.reference)}</h1>
  <table style="width:100%;border-collapse:collapse">
    ${row("Name", inquiry.name)}
    ${row("Email", inquiry.email)}
    ${row("Company", inquiry.company)}
    ${row("Phone", inquiry.phone)}
    ${row("Product", productLabel(inquiry.product))}
    ${row("Application", inquiry.application)}
    ${row("Volume", inquiry.volume)}
    ${row("Timeline", inquiry.timeline)}
    ${row("Drawing", inquiry.drawingUrl)}
    ${row("Submitted", inquiry.submittedAt)}
  </table>
  <p style="margin:24px 0 6px;color:#5b6478;font:400 13px system-ui,sans-serif">Message</p>
  <div style="padding:16px;border-left:3px solid #0047e1;background:#f5f7fb;color:#02102e;font:400 14px/1.6 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(inquiry.message)}</div>
</div>`;
}

/** Plain-text alternative. Without one, spam filters score the message worse. */
function buildText(inquiry: StoredInquiry): string {
  return [
    `New inquiry — ${inquiry.reference}`,
    "",
    `Name:        ${inquiry.name}`,
    `Email:       ${inquiry.email}`,
    `Company:     ${inquiry.company}`,
    inquiry.phone ? `Phone:       ${inquiry.phone}` : "",
    `Product:     ${productLabel(inquiry.product)}`,
    inquiry.application ? `Application: ${inquiry.application}` : "",
    inquiry.volume ? `Volume:      ${inquiry.volume}` : "",
    inquiry.timeline ? `Timeline:    ${inquiry.timeline}` : "",
    inquiry.drawingUrl ? `Drawing:     ${inquiry.drawingUrl}` : "",
    `Submitted:   ${inquiry.submittedAt}`,
    "",
    "Message:",
    inquiry.message,
  ]
    .filter(Boolean)
    .join("\n");
}

async function notify(inquiry: StoredInquiry): Promise<DeliveryResult> {
  const to = process.env.INQUIRY_TO_EMAIL;
  if (!to) {
    console.info("[inquiry] INQUIRY_TO_EMAIL not set; not notifying", {
      reference: inquiry.reference,
    });
    return { ok: true, configured: false, delivered: false };
  }

  return sendMail({
    to,
    fromName: "Valnex Industries website",
    /* So hitting reply in the inbox writes back to the customer. */
    replyTo: inquiry.email,
    subject: `Inquiry ${inquiry.reference} — ${inquiry.company}`,
    text: buildText(inquiry),
    html: buildHtml(inquiry),
  });
}

/* --- The operation the action calls -------------------------------------- */

export interface SubmissionOutcome {
  /** True when at least one channel is set up. False is local development. */
  configured: boolean;
  /** True when at least one channel actually accepted it. */
  delivered: boolean;
}

/**
 * Persists an inquiry and notifies the sales inbox.
 *
 * `Promise.all` rather than sequential: neither channel is allowed to sink the
 * other. An inquiry that reached the inbox is not lost because Supabase was
 * down, and one that reached the database is not lost because the mail server
 * was.
 */
export async function deliverInquiry(
  inquiry: StoredInquiry,
): Promise<SubmissionOutcome> {
  const [stored, emailed] = await Promise.all([save(inquiry), notify(inquiry)]);

  return {
    configured: stored.configured || emailed.configured,
    delivered: stored.delivered || emailed.delivered,
  };
}
