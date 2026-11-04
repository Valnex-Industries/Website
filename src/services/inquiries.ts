import "server-only";

import fs from "node:fs";
import path from "node:path";

import {
  productLabel,
  TIMELINES,
  VOLUMES,
  type Inquiry,
} from "@/lib/inquiry";
import { siteUrl } from "@/lib/site";
import { sendMail, type EmailAttachment } from "@/services/email";
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

/* --- Catalog Attachment Loader ------------------------------------------- */

function getCatalogAttachments(): EmailAttachment[] | undefined {
  try {
    const catalogPath = path.join(
      process.cwd(),
      "public",
      "Valnex-Industries-Catalog.pdf",
    );
    if (fs.existsSync(catalogPath)) {
      const buffer = fs.readFileSync(catalogPath);
      return [
        {
          filename: "Valnex-Industries-Catalog.pdf",
          content: buffer,
          contentType: "application/pdf",
        },
      ];
    }
  } catch (err) {
    console.warn("[inquiry] Could not load catalog PDF as attachment:", err);
  }
  return undefined;
}

/* --- Customer Confirmation Email Template ------------------------------- */

function buildCustomerHtml(inquiry: StoredInquiry, catalogUrl: string): string {
  const prod = productLabel(inquiry.product);
  const dateFormatted = formatDate(inquiry.submittedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Inquiry Has Been Registered — Valnex Industries</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f4f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#02102e;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f4f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(2,16,46,0.08);border:1px solid #e2e8f0;border-collapse:separate;">
          
          <!-- Header Banner in Deep Navy -->
          <tr>
            <td style="background-color:#0a2472;padding:32px 32px 24px;color:#ffffff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:18px;font-weight:900;letter-spacing:0.04em;color:#ffffff;text-transform:uppercase;">
                      VALNEX <span style="font-weight:400;color:#93c5fd;">INDUSTRIES PVT. LTD.</span>
                    </div>
                    <div style="margin-top:4px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#38bdf8;text-transform:uppercase;">
                      QUALITY &bull; EXCELLENCE &bull; COMMITMENT
                    </div>
                    <div style="margin-top:8px;display:inline-block;padding:3px 10px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#e0f2fe;text-transform:uppercase;">
                      MANUFACTURER OF PLASTIC AUXILIARIES
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;padding:6px 12px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:6px;font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:700;color:#ffffff;">
                      ${escapeHtml(inquiry.reference)}
                    </span>
                  </td>
                </tr>
              </table>
              <div style="height:3px;background:linear-gradient(90deg, #38bdf8 0%, #0055ff 100%);margin-top:20px;border-radius:2px;"></div>
            </td>
          </tr>

          <!-- Confirmation Hero Block -->
          <tr>
            <td style="background-color:#f0fdf4;padding:24px 32px;border-bottom:1px solid #dcfce7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" valign="top" style="padding-right:16px;">
                    <div style="width:32px;height:32px;line-height:32px;border-radius:50%;background:#16a34a;color:#ffffff;text-align:center;font-size:16px;font-weight:800;">✓</div>
                  </td>
                  <td valign="middle">
                    <h2 style="margin:0 0 6px;font-size:18px;font-weight:800;color:#14532d;line-height:1.35;">
                      Your inquiry has been registered. Thank you for choosing us, Valnex Industries.
                    </h2>
                    <p style="margin:0;font-size:13px;color:#166534;line-height:1.5;">
                      Dear <strong>${escapeHtml(inquiry.name)}</strong>, our technical sales and engineering team has received your requirement for <strong>${escapeHtml(prod)}</strong> and is reviewing your specifications.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:32px;">

              <!-- Inquiry Summary Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:10px;">Registered Inquiry Overview</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:4px 0;font-size:13px;color:#64748b;">Reference No: <strong style="color:#02102e;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(inquiry.reference)}</strong></td>
                        <td width="50%" style="padding:4px 0;font-size:13px;color:#64748b;">Registered: <strong style="color:#02102e;">${escapeHtml(dateFormatted)}</strong></td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:4px 0;font-size:13px;color:#64748b;">Company / Plant: <strong style="color:#02102e;">${escapeHtml(inquiry.company)}</strong></td>
                        <td width="50%" style="padding:4px 0;font-size:13px;color:#64748b;">Equipment: <strong style="color:#0047e1;">${escapeHtml(prod)}</strong></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Reference ID Card to Copy -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px dashed #0047e1;border-radius:10px;padding:18px;margin-bottom:28px;text-align:center;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#0047e1;margin-bottom:6px;">
                      YOUR REFERENCE ID (COPY &amp; SAVE)
                    </div>
                    <div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:24px;font-weight:900;color:#0a2472;letter-spacing:0.14em;user-select:all;-webkit-user-select:all;padding:6px 0;">
                      ${escapeHtml(inquiry.reference)}
                    </div>
                    <div style="font-size:12px;color:#64748b;line-height:1.4;">
                      Click or tap the ID above to copy it. Please quote this reference number in all inquiries or correspondence with our team.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Two-Way Active Communication Channel -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#15803d;margin-bottom:6px;">
                      Two-Way Active Communication
                    </div>
                    <h4 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#14532d;">
                      Direct Two-Way Channel With Our Engineers
                    </h4>
                    <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#166534;">
                      This email is an active two-way thread. You can hit <strong>Reply</strong> directly to send technical drawings, ask duty cycle questions, or provide plant specifications to our engineers.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:6px;background-color:#0047e1;">
                          <a href="mailto:info@valnexindustries.com?subject=${encodeURIComponent(`Re: Inquiry [${inquiry.reference}] — ${inquiry.company}`)}" style="display:inline-block;padding:10px 18px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
                            Reply to Engineering Desk &rarr;
                          </a>
                        </td>
                        <td style="padding-left:10px;">
                          <a href="https://wa.me/917574848748?text=${encodeURIComponent(`Hello Valnex Industries, regarding inquiry [${inquiry.reference}]. I would like to discuss specifications.`)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 16px;font-size:13px;font-weight:700;color:#ffffff;background:#25D366;text-decoration:none;border-radius:6px;">
                            Chat on WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Product Catalog Download Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, #0a2472 0%, #0047e1 100%);border-radius:10px;padding:24px;margin-bottom:32px;color:#ffffff;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#38bdf8;margin-bottom:6px;">Machinery &amp; Auxiliaries Catalog</div>
                    <h3 style="margin:0 0 8px;font-size:18px;font-weight:800;color:#ffffff;">Download Our Product Catalog (PDF)</h3>
                    <p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.85);">
                      We have attached our complete product catalog PDF directly to this email. You can also view or download it via the button below to explore technical specifications across our entire industrial cooling and auxiliary range.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:6px;background-color:#ffffff;">
                          <a href="${escapeHtml(catalogUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:800;color:#0a2472;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">
                            Download Equipment Catalog (PDF) &darr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Types of Products Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding-bottom:12px;border-bottom:2px solid #f1f5f9;">
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#0047e1;">Types of Products We Manufacture</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" valign="top" style="padding-right:12px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Air Cooled Chiller</td></tr>
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Water Cooled Chiller</td></tr>
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Hooper Loader</td></tr>
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Hot Air Dryer</td></tr>
                          </table>
                        </td>
                        <td width="50%" valign="top" style="padding-left:12px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Mould Temperature Controller</td></tr>
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Dozer</td></tr>
                            <tr><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e293b;"><span style="color:#0284c7;font-size:16px;margin-right:8px;">&bull;</span> Dehumidifier (Refri)</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact & Support Section (3 Lines + Service Number) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#0047e1;margin-bottom:10px;">Get In Touch &amp; Dedicated Support</div>
                    <p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#334155;">
                      If you need immediate technical consultation, customized plant sizing, or order updates, please reach out to our team:
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                      <tr>
                        <td style="padding:6px 0;color:#64748b;" width="140"><strong>Email ID:</strong></td>
                        <td style="padding:6px 0;"><a href="mailto:info@valnexindustries.com" style="color:#0047e1;font-weight:700;text-decoration:none;">info@valnexindustries.com</a></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;"><strong>Contact Phone:</strong></td>
                        <td style="padding:6px 0;"><a href="tel:+917574848748" style="color:#02102e;font-weight:700;text-decoration:none;">+91 75748 48748</a></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;"><strong>Service Number:</strong></td>
                        <td style="padding:6px 0;"><a href="tel:+919173194131" style="color:#0284c7;font-weight:800;text-decoration:none;">SERVICES :- 91731 94131</a></td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;"><strong>Website:</strong></td>
                        <td style="padding:6px 0;"><a href="https://www.valnexindustries.com" target="_blank" rel="noopener noreferrer" style="color:#0047e1;font-weight:600;text-decoration:none;">www.valnexindustries.com</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Manufacturing Plant / Address Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td style="padding:16px 20px;background:#f1f5f9;border-radius:8px;font-size:12px;line-height:1.6;color:#475569;">
                    <div style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#1e293b;margin-bottom:4px;">
                      VALNEX INDUSTRIES PVT. LTD.
                    </div>
                    <div>3, MARUTI INDUSTRIAL PARK-2, DHAMATVAN-BAKROL ROAD, DHAMATVAN, AHMEDABAD - 382435, GUJARAT, INDIA</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Banner -->
          <tr>
            <td style="background-color:#02102e;padding:24px 32px;text-align:center;color:#94a3b8;font-size:12px;line-height:1.6;">
              <div style="font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#38bdf8;margin-bottom:6px;">
                QUALITY &bull; EXCELLENCE &bull; COMMITMENT
              </div>
              <p style="margin:0 0 6px;color:#cbd5e1;">&copy; 2026 Valnex Industries Pvt. Ltd. All rights reserved.</p>
              <p style="margin:0;font-size:11px;color:#64748b;">This automated confirmation was sent because an inquiry was submitted on valnexindustries.com with this email address.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCustomerText(
  inquiry: StoredInquiry,
  catalogUrl: string,
): string {
  const prod = productLabel(inquiry.product);
  const dateFormatted = formatDate(inquiry.submittedAt);

  return [
    "=== VALNEX INDUSTRIES PVT. LTD. ===",
    "QUALITY · EXCELLENCE · COMMITMENT",
    "MANUFACTURER OF PLASTIC AUXILIARIES",
    "",
    `Dear ${inquiry.name},`,
    "",
    "Your inquiry has been registered. Thank you for choosing us, Valnex Industries.",
    "",
    `Our engineering team has received your inquiry for ${prod} and is reviewing your application requirements. We will connect with you shortly with detailed technical specs and pricing.`,
    "",
    "--- INQUIRY OVERVIEW ---",
    `Reference No: ${inquiry.reference}`,
    `Date:         ${dateFormatted}`,
    `Company:      ${inquiry.company}`,
    `Equipment:    ${prod}`,
    "",
    "--- YOUR REFERENCE ID (COPY & SAVE) ---",
    `REFERENCE ID: ${inquiry.reference}`,
    "(Please copy and quote this Reference ID in all correspondence with our team)",
    "",
    "--- TWO-WAY ACTIVE COMMUNICATION ---",
    "This is an active two-way thread. You can hit Reply directly to this email to",
    "attach drawings, specify cycle times, or ask technical sizing questions.",
    "",
    "--- PRODUCT & MACHINERY CATALOG ---",
    "We have attached our complete product catalog PDF to this email.",
    "You can also download it directly at:",
    catalogUrl,
    "",
    "--- TYPES OF PRODUCTS WE MANUFACTURE ---",
    "• Air Cooled Chiller",
    "• Water Cooled Chiller",
    "• Hooper Loader",
    "• Hot Air Dryer",
    "• Mould Temperature Controller",
    "• Dozer",
    "• Dehumidifier (Refri)",
    "",
    "--- CONTACT & DEDICATED SUPPORT ---",
    "You can contact us directly at:",
    "• Email: info@valnexindustries.com",
    "• Phone / Sales: +91 75748 48748",
    "• Dedicated Service Support: SERVICES :- 91731 94131",
    "• Website: https://www.valnexindustries.com",
    "",
    "--- PLANT & FACTORY ADDRESS ---",
    "VALNEX INDUSTRIES PVT. LTD.",
    "3, MARUTI INDUSTRIAL PARK-2, DHAMATVAN-BAKROL ROAD,",
    "DHAMATVAN, AHMEDABAD - 382435, GUJARAT, INDIA",
  ].join("\n");
}

async function sendCustomerConfirmation(
  inquiry: StoredInquiry,
): Promise<DeliveryResult> {
  if (!inquiry.email || !inquiry.email.includes("@")) {
    return {
      ok: false,
      configured: false,
      delivered: false,
      error: "Invalid customer email address",
    };
  }

  const catalogUrl = siteUrl("/Valnex-Industries-Catalog.pdf");
  const attachments = getCatalogAttachments();

  return sendMail({
    to: inquiry.email,
    fromName: "Valnex Industries",
    replyTo: "info@valnexindustries.com",
    subject: `Your Inquiry Has Been Registered — Valnex Industries [${inquiry.reference}]`,
    text: buildCustomerText(inquiry, catalogUrl),
    html: buildCustomerHtml(inquiry, catalogUrl),
    attachments,
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
 * Persists an inquiry, notifies the sales/engineering inbox,
 * and sends an automated acknowledgment + catalog PDF to the customer.
 *
 * Runs delivery in parallel (`Promise.all`): email delivery and database
 * persistence never block or sink each other.
 */
export async function deliverInquiry(
  inquiry: StoredInquiry,
): Promise<SubmissionOutcome> {
  const [stored, emailed, customerAck] = await Promise.all([
    save(inquiry),
    notify(inquiry),
    sendCustomerConfirmation(inquiry).catch((err) => {
      console.error("[inquiry] Customer confirmation delivery error:", err);
      return {
        ok: false,
        configured: true,
        delivered: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }),
  ]);

  console.info("[inquiry:delivery]", {
    reference: inquiry.reference,
    dbSaved: stored.delivered,
    internalEmailDelivered: emailed.delivered,
    customerEmailDelivered: customerAck.delivered,
  });

  return {
    configured: stored.configured || emailed.configured,
    delivered: stored.delivered || emailed.delivered,
  };
}
