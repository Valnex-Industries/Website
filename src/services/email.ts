import "server-only";

import { Resend } from "resend";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * The unified email delivery engine for the website.
 *
 * Primary: Resend API via RESEND_API_KEY.
 * Fallback: SMTP via SMTP_HOST, SMTP_USER, SMTP_PASS, etc.
 * Dev fallback: Console log when neither is configured, so local dev doesn't break.
 */

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export function smtpSettings(): SmtpSettings | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    user,
    pass,
    from: process.env.INQUIRY_FROM_EMAIL || user,
  };
}

let cachedTransporter: Transporter | null = null;

function getTransporter(settings: SmtpSettings): Transporter {
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    requireTLS: settings.port !== 465,
    auth: { user: settings.user, pass: settings.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cachedTransporter;
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  /** So hitting reply in the inbox writes back to the customer. */
  replyTo?: string;
  /** Overrides the default sender name on the From header. */
  fromName?: string;
  /** Optional file attachments (e.g. Catalog PDF). */
  attachments?: EmailAttachment[];
}

export interface MailResult {
  ok: boolean;
  configured: boolean;
  delivered: boolean;
  error?: string;
}

let cachedResend: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cachedResend) {
    cachedResend = new Resend(apiKey);
  }
  return cachedResend;
}

/**
 * Sends one message using Resend (preferred) or SMTP (fallback).
 *
 * `configured` and `delivered` are tracked separately:
 *   - unconfigured is normal in local development (logs to console, returns ok: true, configured: false, delivered: false)
 *   - configured but failed to deliver is a real incident and surfaces an error to the user
 */
export async function sendMail(options: MailOptions): Promise<MailResult> {
  const resend = getResendClient();

  // 1. Resend API
  if (resend) {
    try {
      const configuredFrom = process.env.RESEND_FROM_EMAIL;
      const defaultFrom = "Valnex Industries <inquiry@valnexindustries.com>";
      const fromAddress = configuredFrom || defaultFrom;

      const toList = Array.isArray(options.to)
        ? options.to
        : options.to
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: toList,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      if (!error) {
        console.info("[email:resend] delivered successfully:", {
          id: data?.id,
          to: toList,
          subject: options.subject,
        });
        return { ok: true, configured: true, delivered: true };
      }

      // If the domain is not yet fully verified or restricted to account email in sandbox:
      const isDomainOrSandboxRestriction =
        error.statusCode === 403 ||
        error.message.includes("not verified") ||
        error.message.includes("testing emails");

      if (isDomainOrSandboxRestriction) {
        console.warn(
          "[email:resend] primary send restricted by Resend domain verification status; delivering to account owner fallback (valnexindustries@gmail.com)...",
        );

        const sandboxResult = await resend.emails.send({
          from: "Valnex Industries <onboarding@resend.dev>",
          to: ["valnexindustries@gmail.com"],
          replyTo: options.replyTo,
          subject: `[INQUIRY] ${options.subject}`,
          text: options.text,
          html: options.html,
        });

        if (!sandboxResult.error) {
          console.info(
            "[email:resend] delivered via verified mailbox fallback:",
            sandboxResult.data?.id,
          );
          return { ok: true, configured: true, delivered: true };
        }
      }

      console.error("[email:resend] delivery failed:", error);
      return {
        ok: false,
        configured: true,
        delivered: false,
        error: error.message || "Could not deliver email via Resend.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Resend request encountered an error";
      console.error("[email:resend] unexpected error:", err);
      return {
        ok: false,
        configured: true,
        delivered: false,
        error: message,
      };
    }
  }

  // 2. SMTP Transport
  const settings = smtpSettings();
  if (settings) {
    try {
      await getTransporter(settings).sendMail({
        from: {
          name: options.fromName ?? "Valnex Industries",
          address: settings.from,
        },
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      return { ok: true, configured: true, delivered: true };
    } catch (error) {
      cachedTransporter = null;
      console.error("[email:smtp] delivery failed:", options.to, error);
      return {
        ok: false,
        configured: true,
        delivered: false,
        error: "Could not reach the SMTP mail server.",
      };
    }
  }

  // 3. Development fallback (no email service configured yet)
  console.info("[email] Neither Resend nor SMTP is configured; logging email instead:", {
    to: options.to,
    subject: options.subject,
    replyTo: options.replyTo,
  });

  return { ok: true, configured: false, delivered: false };
}
