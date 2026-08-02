import nodemailer, { type Transporter } from "nodemailer";
import { divisionLabel } from "@/lib/inquiry";
import type { DeliveryResult, StoredInquiry } from "@/lib/inquiry-store";

/**
 * Emails each inquiry to the sales inbox, in parallel with the database write.
 *
 * Sent over SMTP through the company's own Microsoft 365 mailbox, which means
 * Microsoft signs the message: SPF and DKIM pass with no DNS changes, and the
 * root SPF record (`v=spf1 include:secureserver.net -all`, a hard fail) never
 * has to be touched. A third-party sender would have needed its own records.
 *
 *   SMTP_HOST=smtp.office365.com
 *   SMTP_PORT=587
 *   SMTP_USER=contact@valnexindustries.com
 *   SMTP_PASS=<app password, or OAuth2 — see note below>
 *   INQUIRY_FROM_EMAIL=contact@valnexindustries.com   # must match SMTP_USER
 *   INQUIRY_TO_EMAIL=contact@valnexindustries.com
 *
 * Exchange Online rejects a From address the authenticated mailbox has no
 * SendAs right over, so INQUIRY_FROM_EMAIL should normally equal SMTP_USER.
 *
 * With nothing configured this logs and reports `configured: false`, which the
 * server action treats as a development state rather than a failure.
 */

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
    ${row("Product", divisionLabel(inquiry.division))}
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
  const lines = [
    `New inquiry — ${inquiry.reference}`,
    "",
    `Name:        ${inquiry.name}`,
    `Email:       ${inquiry.email}`,
    `Company:     ${inquiry.company}`,
    inquiry.phone ? `Phone:       ${inquiry.phone}` : "",
    `Product:     ${divisionLabel(inquiry.division)}`,
    inquiry.application ? `Application: ${inquiry.application}` : "",
    inquiry.volume ? `Volume:      ${inquiry.volume}` : "",
    inquiry.timeline ? `Timeline:    ${inquiry.timeline}` : "",
    inquiry.drawingUrl ? `Drawing:     ${inquiry.drawingUrl}` : "",
    `Submitted:   ${inquiry.submittedAt}`,
    "",
    "Message:",
    inquiry.message,
  ];
  return lines.filter(Boolean).join("\n");
}

/* Cached across warm invocations. A serverless function cannot pool sockets
   between cold starts, but it can reuse one within a container's lifetime, and
   the SMTP handshake is the slow part of sending. */
let cachedTransporter: Transporter | null = null;

function getTransporter(host: string, port: number, user: string, pass: string) {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 opens plain and upgrades via STARTTLS.
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
    /* Bounded so a silent SMTP server cannot hold the request open until the
       platform kills the function — the visitor would wait the whole time. */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cachedTransporter;
}

export async function sendInquiryEmail(
  inquiry: StoredInquiry,
): Promise<DeliveryResult> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const from = process.env.INQUIRY_FROM_EMAIL ?? user;
  const to = process.env.INQUIRY_TO_EMAIL;

  if (!host || !user || !pass || !from || !to) {
    console.info("[inquiry] email not configured; skipping", {
      reference: inquiry.reference,
    });
    return { ok: true, configured: false, delivered: false };
  }

  try {
    await getTransporter(host, port, user, pass).sendMail({
      from: { name: "Valnex Industries website", address: from },
      to,
      // So hitting reply in the inbox writes back to the customer.
      replyTo: inquiry.email,
      subject: `Inquiry ${inquiry.reference} — ${inquiry.company}`,
      text: buildText(inquiry),
      html: buildHtml(inquiry),
    });

    return { ok: true, configured: true, delivered: true };
  } catch (error) {
    /* A failed handshake can leave the cached transporter unusable; drop it so
       the next submission builds a fresh one. */
    cachedTransporter = null;
    console.error("[inquiry] SMTP send failed", error);
    return {
      ok: false,
      configured: true,
      delivered: false,
      error: "Could not reach the mail server.",
    };
  }
}
