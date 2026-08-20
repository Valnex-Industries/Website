import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * The one SMTP transport in the website.
 *
 * There were two: the inquiry notifier built a cached, timeout-bounded
 * transporter, and the newsletter confirmation built a fresh unbounded one on
 * every signup. The second inherited none of the first's hard-won settings —
 * so a hung mail server would hold a signup request open until the platform
 * killed the function, while the identical failure on an inquiry timed out
 * cleanly in ten seconds. One transport means one set of those decisions.
 *
 * Gmail note: `from` defaults to the authenticated user, because Gmail rewrites
 * the From header to the account that authenticated unless the other address is
 * a verified "Send mail as" alias — and it does so silently.
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

/* Cached across warm invocations. A serverless function cannot pool sockets
   between cold starts, but it can reuse one within a container's lifetime, and
   the SMTP handshake is the slow part of sending. */
let cached: Transporter | null = null;

function transporter(settings: SmtpSettings): Transporter {
  if (cached) return cached;

  cached = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    /* 465 is implicit TLS; 587 opens plain and upgrades via STARTTLS.
       requireTLS on 587 refuses to fall back to an unencrypted session. */
    secure: settings.port === 465,
    requireTLS: settings.port !== 465,
    auth: { user: settings.user, pass: settings.pass },
    /* Bounded so a silent SMTP server cannot hold the request open until the
       platform kills the function — the visitor would wait the whole time. */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cached;
}

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** So hitting reply in the inbox writes back to the customer. */
  replyTo?: string;
  /** Overrides the default sender name on the From header. */
  fromName?: string;
}

export interface MailResult {
  ok: boolean;
  configured: boolean;
  delivered: boolean;
  error?: string;
}

/**
 * Sends one message.
 *
 * `configured` and `delivered` are separate on purpose: an unconfigured mailer
 * is a local-development state, while a configured mailer that delivered
 * nothing is a production incident. Only the second should ever reach a
 * visitor as an error.
 */
export async function sendMail(options: MailOptions): Promise<MailResult> {
  const settings = smtpSettings();

  if (!settings) {
    console.info("[email] SMTP not configured; not sending", {
      to: options.to,
      subject: options.subject,
    });
    return { ok: true, configured: false, delivered: false };
  }

  try {
    await transporter(settings).sendMail({
      from: {
        name: options.fromName ?? "Valnex Industries",
        address: settings.from,
      },
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { ok: true, configured: true, delivered: true };
  } catch (error) {
    /* A failed handshake can leave the cached transporter unusable; drop it so
       the next send builds a fresh one rather than repeating the failure. */
    cached = null;
    console.error("[email] send failed", options.to, error);
    return {
      ok: false,
      configured: true,
      delivered: false,
      error: "Could not reach the mail server.",
    };
  }
}
