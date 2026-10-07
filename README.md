<p align="center">
  <img src="public/assets/blue-valnex-logo.webp" alt="Valnex Industries" width="72" />
</p>

<h1 align="center">Valnex Industries: Marketing Site</h1>

<p align="center">
  The public website for Valnex Industries: engineering-equipment manufacturer, chillers to dehumidifiers,
  built as a fast, SEO/AEO-ready Next.js site with a working inquiry pipeline behind it.
</p>

<p align="center">
  <a href="https://www.valnexindustries.com"><img src="https://img.shields.io/badge/site-live-0047e1?style=flat-square" alt="Live site"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/license-proprietary-lightgrey?style=flat-square" alt="Proprietary">
</p>

---

## What this is, in plain terms

This is the website at **[valnexindustries.com](https://www.valnexindustries.com)**, the front door for a
company that manufactures industrial equipment (chillers, flake cutters, hopper loaders, laser marking
machines, volumetric feeders, mould temperature controllers, dehumidifiers). A visitor lands here to see
what Valnex builds, read about the company, and send an inquiry. That inquiry has to actually arrive
somewhere real, so this repo is also the plumbing that makes that happen (a database record *and* an email,
not a form that quietly discards what people type into it).

If you're not a developer and just want to know "does this work," the short version is **yes**: pages render
fast, the contact form writes to a real database and emails a real inbox, and the site is built to be found
and correctly understood by both Google and AI answer engines (ChatGPT, Perplexity, Google's AI Overviews),
not just ranked in a classic search results page.

## What this is, technically

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack) on **React 19** and **TypeScript**.
- **[Tailwind CSS 4](https://tailwindcss.com)** for styling, no separate CSS files per component.
- **[Framer Motion](https://motion.dev)** for the scroll-driven sequences (the hero video reveal, the pinned
  "Strengths" section, the horizontal product scroller), all CSS-transform-driven, nothing GPU-hostile.
- **[Lenis](https://lenis.darkroom.engineering)** for smooth scrolling.
- **[Supabase](https://supabase.com)** (Postgres + PostgREST) as the inquiry database.
- **[Nodemailer](https://nodemailer.com)** over SMTP for the inquiry email notification.
- Deployed on **[Vercel](https://vercel.com)**, with `@vercel/analytics` and `@vercel/speed-insights` wired in.

### ⚠️ This is not the Next.js you remember

The project pins **Next.js 16**, which is new enough that a lot of AI training data (and muscle memory) is
stale against it: `params`/`searchParams` are `Promise`s now, file conventions for metadata
(`sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.tsx`) have specific shapes, and some patterns
that worked in Next 13/14 will silently do the wrong thing here. **Read `node_modules/next/dist/docs/` before
assuming you know an API.** This isn't a style preference; it's in `AGENTS.md` for a reason, and it applies
to human contributors as much as to an AI one.

## Project structure

```text
src/
  app/                    Routes (App Router). One folder per page.
    inquiry/              The contact form page + its server action
    products/[slug]/      One page per product, statically generated
    sitemap.ts            Generated from the product catalogue
    robots.ts             Crawler rules, see "Built to be read by AI" below
    manifest.ts           PWA manifest
    llms.txt/             The llms.txt convention, for AI agents that read it
  components/             UI components (PascalCase, one per file)
  lib/                    Business logic, data, and the "single source of truth" files:
    products.ts             the product catalogue (nav, cards, pages all derive from this)
    site.ts                 company identity, contact details, WhatsApp link
    inquiry.ts               inquiry form types + validation
    inquiry-store.ts         writes an inquiry to Supabase
    inquiry-email.ts          emails a notification via Nodemailer
    countries.ts              static country/dial-code list for the phone field
  utils/                  Small stateless helpers (e.g. `cn` for class merging)
supabase/
  migrations/             SQL migrations for the inquiries table
docs/
  implementation-plans/   Design docs written before building a non-trivial feature
public/
  assets/                 Images (WebP), logos, product sketches
```

**The pattern to know before editing anything:** most content that appears in more than one place, the
product list, company contact info, the WhatsApp number, has exactly **one** file that owns it
(`src/lib/products.ts`, `src/lib/site.ts`). The navbar, footer, mega menu, mobile drawer, homepage grid, and
individual product pages all *derive* from that file rather than repeating the data. If you're adding a
product or changing a phone number, there is one correct place to do it: grep for the current value first.

## Getting started

```bash
npm install
cp .env.example .env    # then fill in real values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build, also the closest thing to a full test suite this repo has
npm run lint     # ESLint
npx tsc --noEmit # TypeScript, no test runner configured: this + build + lint is the verification loop
npm run lighthouse:seo  # after a build: Lighthouse SEO audit of every page in the sitemap
```

### Environment variables

Copy `.env.example` to `.env` and fill in real values. **Never commit `.env`**: it's gitignored, and the
`SUPABASE_SERVICE_ROLE_KEY` in particular bypasses every database access rule if it leaks.

| Variable | What it's for |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, used to build absolute links in metadata/sitemap |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Inquiry database. Without these, inquiries still "succeed" locally but nothing is stored |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Outbound email for inquiry notifications |
| `INQUIRY_FROM_EMAIL`, `INQUIRY_TO_EMAIL` | Who the notification email is from/to |

The inquiry form is designed to degrade honestly: if the database isn't configured, it says so in the
logs instead of pretending to succeed; if the database **is** configured but the write fails, the visitor
sees an actual error rather than a fabricated reference number. See
`docs/implementation-plans/inquiry-email-delivery.md` for the full reasoning.

## Built to be read by machines, not just people

A meaningful part of this codebase exists to make the site legible to things that aren't a person scrolling
a browser:

- **Structured data** (`src/components/JsonLd.tsx`, `src/lib/schema.ts`): Organization, LocalBusiness,
  WebSite, Product, and BreadcrumbList schema, so a search engine or an LLM doesn't have to guess what the
  page is about.
- **`llms.txt`** (`src/app/llms.txt/route.ts`): the emerging convention for telling an AI agent what a site
  is and where to find the parts that matter.
- **`robots.ts`**: explicitly allows the known AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
  Google-Extended) rather than leaving them to a default that might block them.
- **Per-product static pages** (`/products/[slug]`) with their own metadata, so a product can be a direct
  answer to a search query instead of only reachable by browsing a grid.
- **Lighthouse SEO audit** (`npm run lighthouse:seo`, `lighthouserc.cjs`): runs Lighthouse's SEO category
  against every URL in `/sitemap.xml` and fails unless each page scores 100. It runs on every branch push
  (`.github/workflows/lighthouse-seo.yml`) against a secret-less build, which checks the code. To check
  what's actually published, point it at production:
  `npm run lighthouse:seo -- https://www.valnexindustries.com`. Reports land in `.lighthouseci/reports/`.
  Lighthouse no longer validates JSON-LD, so this does not cover the structured data.

If you're touching any of this, the goal in one sentence: a visitor asking ChatGPT "who makes industrial
chillers in Gujarat" should be answerable from what's actually published here, not from an SEO trick that
only works on a 2015-era search engine.

## Deployment

Production deploys automatically on push to `main` via Vercel, to `www.valnexindustries.com`. There is no
staging environment, so `npm run build` locally is the check before merging, along with a manual pass over the
change at mobile, tablet, and desktop widths, since a meaningful share of this site's traffic is mobile and
that isn't covered by a type check.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch conventions, commit style, and the verification checklist
expected on every change.

## License

Proprietary. © Valnex Industries. All rights reserved. This code is not licensed for reuse.
