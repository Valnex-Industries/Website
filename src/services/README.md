# services/

Everything that talks to something outside this process.

## The rule

| | `lib/` | `services/` |
| --- | --- | --- |
| Contains | pure functions, constants, types | I/O and side effects |
| Depends on | nothing external | Supabase, SMTP, ImageKit |
| Testable by | calling it | needing a fake or a network |
| Safe in a client component | usually | **never** — every file here is `server-only` |

If a function reads an env var to reach a network service, it belongs here. If
it transforms data you already have, it belongs in `lib/`.

## What is in here

| File | Owns |
| --- | --- |
| `supabase.ts` | The only place this app builds a PostgREST request. Anon reads (cached, tagged) and service-role writes. |
| `email.ts` | The only SMTP transport. Cached, timeout-bounded. |
| `content.ts` | Products and news, read for rendering. Falls back to the compile-time catalogue when the database is unreachable. |
| `analytics.ts` | Pageviews, Web Vitals and WhatsApp click intents. |
| `inquiries.ts` | Persisting an inquiry and notifying the sales inbox — both channels, reconciled. |
| `newsletter.ts` | Double opt-in signup, confirmation and unsubscribe. |

## Why this exists

The four data modules each carried their own copy of "read two env vars, build
a PostgREST URL, set the headers, log and swallow the failure". They had already
drifted — one logged the response body on failure and the others did not, and
only one set `cache: "no-store"` on a write. There were also two nodemailer
transports, and only one of them had the connection timeouts that stop a hung
mail server holding a request open until the platform kills the function.

Consolidating removed both duplications and, more usefully, made the remaining
decisions single. There is now one answer to "what happens when Supabase is
down" and one answer to "how long do we wait for SMTP".

## Two conventions worth keeping

**Reads return `null` on failure, not `[]`.** The difference between "the
database said nothing" and "the database returned nothing" is the difference
between falling back to the static catalogue and rendering an empty homepage.

**Writes never throw.** A visitor's page must not break because an analytics
insert failed. Services log and return a result; the caller decides whether the
failure is worth showing. `inquiries.ts` is the one place a failure *is* shown,
because a lost sales inquiry costs more than an awkward error message.
