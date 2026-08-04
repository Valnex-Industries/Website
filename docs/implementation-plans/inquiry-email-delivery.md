# Inquiry delivery — email & database

**Status:** code complete, **not provisioned**. No inquiry submitted today
reaches a human.
**Blocked on:** SMTP credentials and a Supabase project.
**Created:** 2026-08-02

---

## Context

`/inquiry` looks like a working form. It validates, it shows a success screen,
it issues a quotable reference (`VX-M4K2P9`). It delivers nothing.

`saveInquiry` falls back to `console.info` when `SUPABASE_URL` is unset, and
`sendInquiryEmail` does the same when `SMTP_HOST` is unset. Neither is
configured, so every submission is written to a server log nobody reads and the
visitor is told it arrived. **This is the single most damaging open issue on the
site** — a lost sales inquiry costs more than any ranking.

The code to fix it is written and building. What remains is credentials and a
deliberate test.

### Why two channels

Email is what a person actually reacts to; the database is the record that
survives a full inbox, a deleted message or someone leaving the company. They
run in `Promise.all` and neither is allowed to sink the other — an inquiry that
reached the inbox is not lost because Supabase was down, and vice versa.

---

## What is already built

| Piece | Path | State |
|---|---|---|
| SMTP sender | `src/lib/inquiry-email.ts` | Nodemailer, cached transporter, bounded timeouts, HTML + plain text |
| Database writer | `src/lib/inquiry-store.ts` | Supabase over PostgREST |
| Orchestration | `src/app/inquiry/actions.ts` | Both channels in parallel; error only if a *configured* channel delivered nothing |
| Validation | `src/lib/inquiry.ts` | `parseInquiry`, honeypot, `makeReference` |
| Bundler opt-out | `next.config.ts` | `serverExternalPackages: ["nodemailer"]` |
| Table DDL | `supabase/migrations/0001_inquiries.sql` | Not applied |
| CHECK fix | `supabase/migrations/0002_division_values.sql` | Not applied — see below |
| Env template | `.env.example` | Documented |

### The `DeliveryResult` contract

Both channels return `{ ok, configured, delivered, error? }`. The three states
matter and are easy to collapse by accident:

- `configured: false` — no credentials. **Local development.** Not a failure;
  the visitor still sees success.
- `configured: true, delivered: true` — landed.
- `configured: true, delivered: false` — **production incident.** This is the
  only case that shows the visitor an error.

Preserve this if either channel is ever rewritten. Collapsing it to a boolean
reintroduces exactly the bug this plan exists to fix.

### Why Nodemailer over an HTTP provider

Sending through the company's own Microsoft 365 mailbox means Microsoft signs
the message: **SPF and DKIM pass with no DNS changes at all.** The root SPF
record is `v=spf1 include:secureserver.net -all` — a hard fail — so a
third-party sender would have needed its own SPF/DKIM, and editing that record
risks the live company email. This route sidesteps it.

The trade-off accepted: SMTP on serverless pays a full TCP + TLS + AUTH
handshake on a cold start, typically 1–3s. It runs in parallel with the database
write so it does not stack, but submit will feel slower than an HTTP API.

---

## The blocking risk: Microsoft is retiring SMTP Basic auth

`SMTP_PASS` with a plain mailbox password **may simply be refused**. Microsoft
has been phasing out Basic authentication for SMTP client submission on Exchange
Online. If the tenant has it disabled, `smtp.office365.com` rejects the login and
no notification is ever sent.

**Test this first.** Everything else in this plan is routine; this is the one
step that can force a different design.

Three outcomes, in order of preference:

1. **Basic auth works** — set `SMTP_PASS` and move on.
2. **App password** — requires security defaults off / per-user MFA configured.
   Works with the code exactly as written.
3. **OAuth2** — Azure app registration, client credentials, `Mail.Send`
   application permission with an access policy scoped to the one mailbox.
   Nodemailer supports `auth: { type: "OAuth2", ... }`; `getTransporter()` in
   `inquiry-email.ts` needs a token fetch and refresh. Roughly half a day.

A fallback worth knowing: **Microsoft Graph `sendMail`** over HTTPS avoids SMTP
entirely, is faster on serverless, and uses the same Azure app registration as
option 3. If OAuth2 is required anyway, Graph is the better destination.

---

## Setup

### 1. SMTP

Verify auth works before touching anything else:

```bash
# from a machine, not the browser
node -e "const n=require('nodemailer');n.createTransport({host:'smtp.office365.com',port:587,secure:false,requireTLS:true,auth:{user:'info@valnexindustries.com',pass:'...'}}).verify().then(console.log).catch(console.error)"
```

Then set, in Vercel → Settings → Environment Variables:

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@valnexindustries.com
SMTP_PASS=<app password>
INQUIRY_FROM_EMAIL=info@valnexindustries.com
INQUIRY_TO_EMAIL=info@valnexindustries.com
```

`INQUIRY_FROM_EMAIL` must equal `SMTP_USER` — Exchange Online rejects a From
address the authenticated mailbox has no SendAs right over.

### 2. Database

```bash
supabase db push        # applies 0001 and 0002
```

**0002 is not optional.** `0001` constrained `division` to
`('robotics','materials','energy','unsure')` — the original business divisions.
The form now submits product slugs (`chillers`, `flake-cutter`, …), so without
`0002` every insert except "Not sure yet" fails its CHECK constraint. Apply both
or the database channel silently rejects almost everything.

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

The service role key bypasses RLS. Server-only — never prefix `NEXT_PUBLIC_`.

### 3. Function timeout

The SMTP timeouts are 10s connect / 10s greeting / 15s socket. **Check these
against the Vercel plan's function limit.** If the function is capped below the
socket timeout, a slow mail server kills the request before Nodemailer gives up,
and the visitor sees a platform error rather than the handled one. Either raise
`maxDuration` or lower the socket timeout.

---

## Verification

Provisioning is not done until the failure paths have been exercised. The
success path passing proves very little.

- [ ] Submit a real inquiry from the deployed site
- [ ] Email arrives at `info@valnexindustries.com`
- [ ] Reply goes to the **customer**, not the sending mailbox (`replyTo`)
- [ ] Row appears in `inquiries` with the correct `division` slug
- [ ] Reference in the email matches the one on screen and the row
- [ ] **Break SMTP** (wrong password) → visitor still sees success, row written,
      `[inquiry] delivered on one channel only` in the logs
- [ ] **Break Supabase** (wrong key) → visitor still sees success, email arrives
- [ ] **Break both** → visitor sees the error with the fallback address
- [ ] Message is not spam-foldered — check Junk on first send
- [ ] HTML renders in Outlook, not just in a browser preview

Local development, with nothing configured, must still show success and log both
skips. That path is the default for anyone running the repo.

---

## TODO

- [ ] Confirm whether SMTP Basic auth is permitted on the tenant
- [ ] If not: app password, else OAuth2 / Graph (see above)
- [ ] Set the six SMTP env vars in Vercel, all environments
- [ ] Create the Supabase project
- [ ] `supabase db push` — both migrations
- [ ] Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Redeploy
- [ ] Work the verification checklist, failure paths included
- [ ] Send one inquiry a week later to confirm nothing has expired

---

## Known limitations

Accepted for now, recorded so they are decisions rather than surprises:

- **No retry or queue.** If both channels fail, the inquiry is gone — the
  visitor is told so and given the direct address, but nothing is buffered. A
  durable queue is the proper fix if volume ever justifies it.
- **No rate limiting.** The honeypot in `parseInquiry` stops naive bots; a
  determined one can flood the inbox. Add an IP or token bucket if abused.
- **No admin view.** Reading inquiries means the Supabase table editor. `0001`
  already carries a `status` column (`new` / `triaged` / `answered` / `closed`)
  for a dashboard that does not exist yet.
- **No attachments.** The form takes a link to a drawing, not a file. Uploads
  would need storage plus virus scanning.
