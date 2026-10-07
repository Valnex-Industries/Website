@AGENTS.md

# Valnex Industries — website

The public marketing site for Valnex Industries, an industrial-equipment
manufacturer in Ahmedabad, Gujarat, India. Single-page marketing home plus a
static page per product and a working inquiry pipeline (database + email). Built
to rank in classic search *and* to be quoted correctly by AI answer engines
(ChatGPT, Perplexity, Google AI Overviews, Copilot).

This file is the operational guide for working in the repo. `README.md` and
`CONTRIBUTING.md` are the human-facing versions and go deeper on the *why*; read
them when a change touches something load-bearing.

## Read this first

`AGENTS.md` (imported above) is not boilerplate. This repo pins **Next.js 16**,
which broke conventions that older training data still assumes:

- `params` and `searchParams` are **`Promise`s** — `await` them. (See
  `src/app/products/[slug]/page.tsx`.)
- Metadata files have specific shapes: `sitemap.ts`, `robots.ts`, `manifest.ts`,
  `opengraph-image.tsx`, and route handlers like `llms.txt/route.ts`.
- **Read `node_modules/next/dist/docs/` before assuming any Next.js API.** A
  Next 13/14 pattern can compile here and silently do the wrong thing.

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript** (strict).
- **Tailwind CSS 4** via `@tailwindcss/postcss`. No per-component CSS files;
  design tokens live in `src/app/globals.css`.
- **Framer Motion** for scroll-driven sequences; **Lenis** for smooth scroll.
- **Supabase** (Postgres + PostgREST) for the inquiry database.
- **Nodemailer** over SMTP (Microsoft 365) for inquiry notifications.
- Deployed on **Vercel** with `@vercel/analytics` + `@vercel/speed-insights`.
- Import alias `@/*` → `src/*`. No test runner exists (see Verification).

## Layout

```text
src/
  app/                     Routes (App Router), one folder per page
    page.tsx               Home — composes the section components
    layout.tsx             Root layout: fonts, metadata, JSON-LD, Preloader, SmoothScroll
    globals.css            Tailwind import + brand tokens + keyframe/utility CSS
    inquiry/               Contact form page + its server action (actions.ts)
    products/[slug]/       One static page per product (generateStaticParams)
    sitemap.ts robots.ts manifest.ts   Generated metadata routes
    llms.txt/route.ts      /llms.txt, generated from the catalogue
    opengraph-image.tsx    Generated OG card
  components/              UI components — PascalCase, one export per file
  lib/                     Data + business logic (the sources of truth, below)
  utils/cn.ts              clsx + tailwind-merge class helper
supabase/migrations/       SQL for the inquiries table
docs/implementation-plans/ Design docs written before non-trivial features
public/assets/             WebP images, logos, product sketches
```

## The one rule that matters most: single sources of truth

Content that appears in more than one place has **exactly one** file that owns
it. Everything else derives. Before adding a new list of products, links, or
contact details, **grep for the existing value first** — a second copy is a
future inconsistency, not a shortcut.

- **`src/lib/products.ts`** — the product catalogue. `PRODUCT_SLUGS` (a literal
  tuple → the `ProductSlug` union) and the `PRODUCTS` array drive the nav, mega
  menu, mobile drawer, footer, homepage grid, `/products/[slug]` pages, the
  inquiry form's product chips, `sitemap.ts`, and `llms.txt`. **Adding a product
  = adding one entry here.** Empty `description`/`specs`/`applications` render as
  nothing (an unfinished entry looks unfinished, never wrong).
- **`src/lib/site.ts`** — company identity: name, tagline, description, contact,
  address, WhatsApp, canonical origin (`SITE_ORIGIN`, `siteUrl()`). `www` is the
  canonical host and must not be flipped post-launch. Unconfirmed facts
  (`BUSINESS.geo`, hours, `sameAs`) are `null`/empty and omitted from output on
  purpose — never fill them with a guess.
- **`src/lib/nav.ts`** — header/menu/footer link structure, derived from
  `products.ts`.
- **`src/lib/schema.ts`** — all schema.org JSON-LD (Organization/LocalBusiness,
  WebSite, Product, BreadcrumbList), built from `site.ts` + `products.ts`.

**Structured data and `llms.txt` are consumed verbatim by crawlers.** An
invented figure here is republished as fact. If the company hasn't confirmed
something (founding year, headcount, tonnages, specs), leave it out.

## The inquiry pipeline

`/inquiry` → server action `submitInquiry` (`src/app/inquiry/actions.ts`), which
writes to **two independent channels in parallel** — neither can sink the other:

- `saveInquiry` (`lib/inquiry-store.ts`) → Supabase over PostgREST.
- `sendInquiryEmail` (`lib/inquiry-email.ts`) → SMTP via Nodemailer.

Validation lives in **`lib/inquiry.ts`** (dependency-free, shared by the client
form and the server action). Field names map camelCase → snake_case onto the
`inquiries` table columns. Phone numbers are folded to E.164 via
`lib/countries.ts` before anything downstream sees them.

Each channel returns a `DeliveryResult` where **`configured` and `delivered` are
separate on purpose**: an *unconfigured* channel is local development (it logs
and reports success); a *configured* channel that delivered nothing is a real
production failure and is the only case that shows the visitor an error. The
form degrades honestly — it never fabricates a success or a reference number.

`makeReference()` mints a quotable id like `VX-M4K2P9`. The honeypot `website`
field is accepted-and-dropped.

> Note: as of the plan docs, the pipeline is **code-complete but not
> provisioned** — no SMTP or Supabase credentials are set, so submissions log to
> the server console. See `docs/implementation-plans/inquiry-email-delivery.md`.
> `nodemailer` is in `serverExternalPackages` (`next.config.ts`) so the bundler
> doesn't break it.

## Discoverability layer (built to be read by machines)

- `src/components/JsonLd.tsx` + `src/lib/schema.ts` — JSON-LD on every route.
- `src/app/llms.txt/route.ts` — the llmstxt.org convention, generated from the
  catalogue so it can't drift. Ends with an explicit "do not infer specs" note.
- `src/app/robots.ts` — names ~18 assistant crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, …) as an explicit statement of intent.
- Per-product static pages so a product can be a direct answer, not just a grid
  cell.
- `scripts/lighthouse-seo.mjs` + `lighthouserc.cjs` — Lighthouse SEO gate over
  every sitemap URL. A page in the sitemap must be indexable and score 100;
  a `noindex` page belongs out of the sitemap, not in an exception list.

Touching any of this: the goal is that "who makes industrial chillers in
Gujarat" is answerable from what's actually published, not an SEO trick.

## Styling & animation conventions

- Tailwind utility classes inline; no CSS modules. Merge classes with
  `cn()` from `src/utils/cn.ts`.
- Brand tokens are CSS variables in `globals.css`: `--brand-blue` (#0047e1),
  `--brand-ink` (#02102e), etc., exposed to Tailwind via `@theme inline`.
  Fonts: **Orbitron** (headings/marquee, on the critical path — self-hosted via
  `next/font`, never `@import`ed) and **Exo 2** (body).
- Section components (`HeroScroll`, `Strengths`, `Divisions`, `Manifesto`,
  `Marquee`, etc.) are `"use client"` and use Framer Motion, all
  CSS-transform-driven. Keyframe/scroll math is commented — read the header
  comments before adjusting magic numbers.
- Respect `prefers-reduced-motion` (handled globally in `globals.css`).
- **Mobile matters.** Treat mobile / tablet-portrait / tablet-landscape /
  desktop as genuinely different layouts (see `Strengths.tsx`, `.hero-window`).
  Tailwind arbitrary values (`w-[62vw]`) fail silently on a typo — a mistyped
  class generates no CSS rather than erroring.

## Verification (there is no test suite)

The verification loop is type-check + lint + build. Run **all three** on every
change, even one that "can't" break:

```bash
npx tsc --noEmit
npm run lint
npm run build      # closest thing to a full test suite; also catches silent Tailwind misses
```

For a change touching metadata, routes, links, images, `robots.ts` or
`sitemap.ts`, also run `npm run lighthouse:seo` after the build. It starts the
production server on :3100, audits every URL in `/sitemap.xml` with Lighthouse's
SEO category (rules in `lighthouserc.cjs`, every audit must pass), and stops the
server. CI runs the same on every branch push. Pass a URL
(`npm run lighthouse:seo -- https://www.valnexindustries.com`) to audit a live
deployment instead.

`npm run dev` for local work (http://localhost:3000). For a layout change, do an
actual pass at the four widths above — type-checking won't catch it.

## Git & workflow

- Never commit to `main`. Branch per change, named for what it does
  (`feat/…`, `fix/…`). Merge with `--no-ff`.
- **Pushing to `main` is a production Vercel deploy** (→ `www.valnexindustries.com`),
  not a save point. No staging environment.
- Commit messages explain **why**, not what; name the hash of any commit a
  change reverts or supersedes.
- **Secrets:** `.env` is gitignored; every key is documented (without values) in
  `.env.example` — add new vars there too. Never put a real
  `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_PASS`, or `SUPABASE_ANON_KEY` in a commit,
  PR, issue, or chat. If one leaks, rotate it.

See `CONTRIBUTING.md` for the full branch/commit/secret policy.
