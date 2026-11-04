import "server-only";

import {
  productLabel,
  TIMELINES,
  VOLUMES,
  type Inquiry,
} from "@/lib/inquiry";
import { sendMail } from "@/services/email";
import { insertAdmin } from "@/services/supabase";

/**
 * Delivering an inquiry, both ways:
 *   1. Email notification to the sales / engineering inbox (via Resend or SMTP).
 *   2. Supabase database row (via insertAdmin) so inquiries are never lost.
 */

export interface StoredInquiry extends Inquiry {
  reference: string;
  submittedAt: string;
}

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

/* --- Curated Notification Email Template --------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function volumeLabel(value: string): string {
  if (!value) return "Not specified";
  return VOLUMES.find((v) => v.value === value)?.label ?? value;
}

function timelineLabel(value: string): string {
  if (!value) return "Not specified";
  return TIMELINES.find((t) => t.value === value)?.label ?? value;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return (
      d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " IST"
    );
  } catch {
    return isoString;
  }
}

function buildHtml(inquiry: StoredInquiry): string {
  const prod = productLabel(inquiry.product);
  const vol = volumeLabel(inquiry.volume);
  const time = timelineLabel(inquiry.timeline);
  const app = inquiry.application ? escapeHtml(inquiry.application) : "Not specified";
  const dateFormatted = formatDate(inquiry.submittedAt);
  const cleanPhone = inquiry.phone ? inquiry.phone.replace(/\D/g, "") : "";
  const mailtoUrl = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(
    `Re: Inquiry ${inquiry.reference} - Valnex Industries`,
  )}`;
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry ${escapeHtml(inquiry.reference)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f4f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#02102e;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f4f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(2,16,46,0.08);border:1px solid #e2e8f0;border-collapse:separate;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#02102e;padding:32px 32px 24px;color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#0055ff;">VALNEX INDUSTRIES</span>
                    <h1 style="margin:8px 0 4px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">New Customer Inquiry</h1>
                    <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);">Precision That Powers Progress &bull; Website Inquiry Notification</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;padding:6px 12px;background:rgba(0,85,255,0.18);border:1px solid rgba(0,85,255,0.4);border-radius:6px;font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:700;color:#60a5fa;">${escapeHtml(inquiry.reference)}</span>
                  </td>
                </tr>
              </table>
              <div style="height:3px;background:linear-gradient(90deg, #f97316 0%, #0047e1 100%);margin-top:20px;border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Metadata Strip -->
          <tr>
            <td style="background-color:#f8fafc;padding:12px 32px;border-bottom:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#64748b;">
                <tr>
                  <td>
                    <strong>Status:</strong> <span style="color:#0047e1;font-weight:600;">Action Required</span>
                  </td>
                  <td align="right">
                    <strong>Received:</strong> ${escapeHtml(dateFormatted)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:32px;">
              
              <!-- Client Information Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-bottom:12px;border-bottom:2px solid #f1f5f9;">
                    <span style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#0047e1;">Client Profile</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:14px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:8px 12px 8px 0;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Full Name</div>
                          <div style="font-size:15px;font-weight:700;color:#02102e;">${escapeHtml(inquiry.name)}</div>
                        </td>
                        <td width="50%" style="padding:8px 0 8px 12px;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Company / Plant</div>
                          <div style="font-size:15px;font-weight:700;color:#02102e;">${escapeHtml(inquiry.company)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:8px 12px 8px 0;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Work Email</div>
                          <div>
                            <a href="mailto:${escapeHtml(inquiry.email)}" style="font-size:14px;font-weight:600;color:#0047e1;text-decoration:none;">${escapeHtml(inquiry.email)}</a>
                          </div>
                        </td>
                        <td width="50%" style="padding:8px 0 8px 12px;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Phone Number</div>
                          <div>
                            ${
                              inquiry.phone
                                ? `<a href="tel:${escapeHtml(inquiry.phone)}" style="font-size:14px;font-weight:600;color:#02102e;text-decoration:none;">${escapeHtml(inquiry.phone)}</a>`
                                : `<span style="font-size:14px;color:#94a3b8;font-style:italic;">Not provided</span>`
                            }
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Requirements & Scope Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding-bottom:12px;border-bottom:2px solid #f1f5f9;">
                    <span style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#0047e1;">Equipment & Scope</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:14px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:8px 12px 8px 0;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Requested Machine</div>
                          <div>
                            <span style="display:inline-block;padding:4px 10px;background:#eef2ff;color:#0047e1;border:1px solid #c7d2fe;border-radius:6px;font-size:13px;font-weight:700;">${escapeHtml(prod)}</span>
                          </div>
                        </td>
                        <td width="50%" style="padding:8px 0 8px 12px;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Application</div>
                          <div style="font-size:14px;font-weight:500;color:#02102e;">${app}</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:8px 12px 8px 0;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Expected Volume</div>
                          <div style="font-size:14px;font-weight:500;color:#02102e;">${escapeHtml(vol)}</div>
                        </td>
                        <td width="50%" style="padding:8px 0 8px 12px;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Implementation Timeline</div>
                          <div style="font-size:14px;font-weight:500;color:#02102e;">${escapeHtml(time)}</div>
                        </td>
                      </tr>
                      ${
                        inquiry.drawingUrl
                          ? `
                      <tr>
                        <td colspan="2" style="padding:8px 0;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-bottom:4px;">Drawing / Spec Sheet</div>
                          <div>
                            <a href="${escapeHtml(inquiry.drawingUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:13px;font-weight:700;color:#166534;text-decoration:none;">View Technical Drawing &rarr;</a>
                          </div>
                        </td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Detailed Message Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding-bottom:12px;border-bottom:2px solid #f1f5f9;">
                    <span style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#0047e1;">Client Message & Technical Details</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:14px;">
                    <div style="background-color:#f8fafc;border-left:4px solid #0047e1;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 8px 8px 0;padding:20px;font-size:14px;line-height:1.65;color:#0f172a;white-space:pre-wrap;">${escapeHtml(inquiry.message)}</div>
                  </td>
                </tr>
              </table>

              <!-- Direct Action Buttons -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:8px;background-color:#0047e1;">
                          <a href="${mailtoUrl}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">Reply via Email &rarr;</a>
                        </td>
                        ${
                          waUrl
                            ? `
                        <td style="padding-left:12px;">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="border-radius:8px;background-color:#25D366;">
                                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">Chat on WhatsApp</a>
                              </td>
                            </tr>
                          </table>
                        </td>`
                            : ""
                        }
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;line-height:1.6;">
              <p style="margin:0 0 6px;font-weight:600;color:#334155;">Valnex Industries &bull; Industrial Machinery & Cooling Systems</p>
              <p style="margin:0 0 6px;">3, Maruti Industrial Park-2, Dhamatvan Bakrol Road, Dhamatvan, Ahmedabad-382435, Gujarat, India.</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">This inquiry was captured automatically by the Valnex Industries website form and delivered via Resend.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildText(inquiry: StoredInquiry): string {
  const prod = productLabel(inquiry.product);
  const vol = volumeLabel(inquiry.volume);
  const time = timelineLabel(inquiry.timeline);
  const app = inquiry.application || "Not specified";
  const dateFormatted = formatDate(inquiry.submittedAt);

  return [
    `=== NEW INQUIRY: ${inquiry.reference} ===`,
    `Submitted: ${dateFormatted}`,
    "",
    "--- CLIENT INFORMATION ---",
    `Name:        ${inquiry.name}`,
    `Company:     ${inquiry.company}`,
    `Email:       ${inquiry.email}`,
    inquiry.phone ? `Phone:       ${inquiry.phone}` : "Phone:       Not provided",
    "",
    "--- EQUIPMENT & SCOPE ---",
    `Equipment:   ${prod}`,
    `Application: ${app}`,
    `Volume:      ${vol}`,
    `Timeline:    ${time}`,
    inquiry.drawingUrl ? `Drawing:     ${inquiry.drawingUrl}` : "",
    "",
    "--- CLIENT MESSAGE ---",
    inquiry.message,
    "",
    "--------------------------------------------------",
    "Valnex Industries, Ahmedabad, Gujarat, India",
    "Delivered via Valnex Web Portal & Resend",
  ]
    .filter(Boolean)
    .join("\n");
}

async function notify(inquiry: StoredInquiry): Promise<DeliveryResult> {
  const to = process.env.INQUIRY_TO_EMAIL || "inquiry@valnexindustries.com";

  return sendMail({
    to,
    fromName: "Valnex Industries Portal",
    replyTo: inquiry.email,
    subject: `New Inquiry [${inquiry.reference}] — ${inquiry.company} (${inquiry.name})`,
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
 * Persists an inquiry and notifies the sales/engineering inbox.
 *
 * Runs delivery in parallel (`Promise.all`): email delivery and database
 * persistence never block or sink each other.
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
