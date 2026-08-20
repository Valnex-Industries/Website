import "server-only";

import { CONTACT, SITE_ORIGIN } from "@/lib/site";
import { hashIp } from "@/lib/visitor";
import { sendMail } from "@/services/email";
import { insertAdmin, patchAdmin, queryAdmin } from "@/services/supabase";

/**
 * Newsletter signups from the website.
 *
 * Double opt-in, and not as a formality. A single-opt-in list can be poisoned
 * by anyone typing someone else's address into the form, and the resulting spam
 * complaints land on the sending domain — the same domain the inquiry mailbox
 * depends on. So a signup creates a `pending` row and an email; only clicking
 * the link in that email produces a subscriber who will ever receive a campaign.
 *
 * Writes use the service role, through `services/supabase.ts`. The subscribers
 * table has no anon insert policy on purpose, so the only route to it is
 * through this file, on this origin, where the address can be validated first.
 */

interface SubscriberRow {
  id: string;
  status: string;
  confirm_token: string;
}

export type SubscribeOutcome =
  | { status: "sent" }
  | { status: "already" }
  | { status: "error"; message: string };

export async function subscribe(
  email: string,
  name: string | null,
  source: string,
  ip: string,
  userAgent: string,
): Promise<SubscribeOutcome> {
  const normalised = email.trim().toLowerCase();

  /* Look first, because the response to an existing address depends on what
     state it is in — and because re-inserting would fail on the unique
     constraint and lose the token needed to resend the confirmation. */
  const existing = await queryAdmin<SubscriberRow>(
    `subscribers?email=eq.${encodeURIComponent(normalised)}&select=id,status,confirm_token`,
  );

  if (existing === null) {
    return { status: "error", message: "Signups are not available right now." };
  }

  if (existing.length > 0) {
    const row = existing[0];

    if (row.status === "confirmed") return { status: "already" };

    /* Pending, unsubscribed or bounced: resend the confirmation rather than
       refuse. Someone who lost the first email, or changed their mind after
       unsubscribing, should not have to contact anyone to fix it. */
    await patchAdmin(
      `subscribers?id=eq.${row.id}`,
      { status: "pending", unsubscribed_at: null },
      { returning: false },
    );

    await sendConfirmation(normalised, row.confirm_token);
    return { status: "sent" };
  }

  const created = await insertAdmin<SubscriberRow>(
    "subscribers",
    {
      email: normalised,
      name: name || null,
      status: "pending",
      source,
      /* Consent evidence without keeping an identifier: enough to answer
         "prove they opted in", never the raw address. */
      signup_ip_hash: hashIp(ip),
      signup_user_agent: userAgent.slice(0, 300),
    },
    { returning: true },
  );

  if (!created.ok || created.rows.length === 0) {
    return { status: "error", message: "Could not save that. Please try again." };
  }

  await sendConfirmation(normalised, created.rows[0].confirm_token);
  return { status: "sent" };
}

/** Flips a pending row to confirmed. Returns false for an unknown token. */
export async function confirmSubscription(token: string): Promise<boolean> {
  const result = await patchAdmin(
    `subscribers?confirm_token=eq.${encodeURIComponent(token)}&select=id`,
    { status: "confirmed", confirmed_at: new Date().toISOString() },
  );

  /* An empty result means the token matched nothing — which is what an expired,
     mistyped or already-used link looks like. */
  return result.ok && result.rows.length > 0;
}

export async function unsubscribe(token: string): Promise<boolean> {
  const result = await patchAdmin(
    `subscribers?unsubscribe_token=eq.${encodeURIComponent(token)}&select=id`,
    { status: "unsubscribed", unsubscribed_at: new Date().toISOString() },
  );

  return result.ok && result.rows.length > 0;
}

/**
 * The confirmation email.
 *
 * One message per signup, nowhere near the rate limit that shapes the
 * newsletter sender in the portal, so it goes straight out rather than being
 * queued.
 */
async function sendConfirmation(email: string, token: string): Promise<void> {
  const confirmUrl = `${SITE_ORIGIN}/newsletter/confirm?token=${token}`;

  const result = await sendMail({
    to: email,
    subject: "Confirm your Valnex Industries subscription",
    text: [
      "Please confirm you want news and offers from Valnex Industries.",
      "",
      confirmUrl,
      "",
      "If you did not sign up, ignore this email — nothing will be sent to you.",
      "",
      `Valnex Industries · ${CONTACT.address.full}`,
    ].join("\n"),
    html: `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f8fc;font-family:Segoe UI,Arial,sans-serif;color:#02102e;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #e0e5f0;border-radius:12px;padding:28px;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:15px;font-weight:700;letter-spacing:1px;">VALNEX<span style="color:#0047e1;">.</span></p>
        <h1 style="margin:0 0 12px;font-size:20px;">Confirm your subscription</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
          Click below to start receiving news and offers from Valnex Industries.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="background:#0047e1;border-radius:8px;">
            <a href="${confirmUrl}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;">Confirm subscription</a>
          </td>
        </tr></table>
        <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#5b6885;">
          If you did not sign up, ignore this email — nothing will be sent to you.<br />
          Valnex Industries · ${CONTACT.address.full}
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  });

  if (!result.configured) {
    /* Logged so a local signup can still be completed by hand. */
    console.info("[newsletter] confirmation not sent", { email, confirmUrl });
    return;
  }

  if (!result.delivered) {
    /* The row is already saved. A failed confirmation email is recoverable —
       signing up again resends it — so this must not surface as "signup
       failed" and make someone think their address was not recorded. */
    console.error("[newsletter] confirmation email failed", email, result.error);
  }
}
