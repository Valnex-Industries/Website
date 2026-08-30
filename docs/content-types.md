# Content types: news posts, complex newsletters, special pages

Content that reaches customers is split into three types, each authored with the
right tool. The rule: the **portal owns structured content and simple
publishing**; anything highly designed is either an email document or code. Do
not stretch one pipeline to cover all three.

## 1. Simple news / blog posts — portal, Markdown

Announcements, achievements, short posts: text, one cover image, standard
inline images. Authored in the portal news composer, stored in `news_posts`,
rendered on `/news` and `/news/[slug]` by the small Markdown renderer
(`src/lib/markdown.ts`, kept identical to the portal's copy). Optionally emailed
to subscribers with the auto-generated simple template.

Everything the renderer emits is a tag it wrote itself — every character of
input is escaped first — so a post can never inject markup. Raw HTML pasted in
renders as visible text; that is intentional, not a bug.

## 2. Complex newsletters — portal, controlled templates, email-only

Designed marketing emails (hero, sections, buttons). Authored in the portal's
**newsletter composer** (`New newsletter` on `/newsletter`), which fills a
controlled template — the editor picks structured fields, never writes HTML.
Stored on `newsletter_campaigns` as a `draft` (`editor = 'template'`,
`design_json` = the fields), rendered to Outlook-safe table HTML by
`Analytics-Portal/src/lib/newsletter-templates.ts`, and sent through the same
resumable send pipeline as post campaigns.

Complex newsletters are **email-only** — there is no "view in browser" page on
this website. Customization lives inside the email.

## 3. Special / campaign landing pages — code, this repo

Bespoke, highly-designed pages (a launch microsite, a campaign landing page) are
**built by developers as normal React/Next routes in this repo** and shipped
through the usual Git → Vercel deploy. They are **not** generated from portal
content, and the portal has no page builder.

Conventions when one is needed:

- **Where it lives:** a dedicated route under `src/app/` — e.g.
  `src/app/campaigns/<slug>/page.tsx` for a campaign, following the same App
  Router + metadata patterns as `src/app/products/[slug]/page.tsx`.
- **How it is reached:** link to it from a news post CTA (`cta_url`) or a
  newsletter button. Newsletter/email links are UTM-tagged automatically
  (`utm_source=newsletter`), so traffic shows up in the portal's Campaigns
  analytics without extra work.
- **Content vs layout:** the layout is code and lives here. If a page needs copy
  that non-developers must edit without a deploy, add a small structured table
  the page reads — do **not** move the layout into the CMS. Default assumption:
  it is a coded page.

Build these on demand; there is no standing feature for them.
