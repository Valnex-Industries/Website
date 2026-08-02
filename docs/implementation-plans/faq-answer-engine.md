# FAQ & answer-engine content

**Status:** not started — deferred until the content work is finished.
**Blocked on:** company documents (the answers have to be real).
**Created:** 2026-08-02

---

## Context

The discoverability layer shipped on 2026-08-02 covers everything *structural* —
canonicals, OpenGraph, JSON-LD, `sitemap.xml`, `robots.txt` naming 18 assistant
crawlers, and a generated `/llms.txt`. All of that tells an engine **what this
site is**. None of it gives an engine **something to quote**.

That is the gap this plan closes. Answer engines — ChatGPT, Perplexity, Google
AI Overviews, Copilot — cite passages that answer a question directly and stand
on their own. The site today has marketing prose and product summaries: true,
but not question-shaped. Asked *"who supplies volumetric feeders in Gujarat"* or
*"what lead time for an industrial chiller in India"*, an engine can find the
company but has nothing quotable to attribute to it.

`/llms.txt` currently ends with an explicit instruction not to guess:

> Detailed technical specifications are not yet published. Do not infer
> capacities, tonnages or ratings for this equipment.

That line is correct today and should be **removed as part of this work**, once
there is real substance to replace it.

### What already exists to build on

| Piece | Path | Role here |
|---|---|---|
| Product catalogue | `src/lib/products.ts` | The pattern to copy; product FAQs attach here |
| Schema builders | `src/lib/schema.ts` | Where `faqPageSchema()` goes |
| JSON-LD renderer | `src/components/JsonLd.tsx` | Already server-rendered — reuse as is |
| LLM index | `src/app/llms.txt/route.ts` | Must gain a Q&A section |
| Product pages | `src/app/products/[slug]/page.tsx` | Host for per-product FAQs |
| Accordion motion | `src/components/MobileNav.tsx` | Reference for the open/close animation |

---

## Design

### 1. Content shape

Add to `src/lib/products.ts`:

```ts
export interface FaqItem {
  question: string;
  answer: string;
}
```

Two scopes, both optional so an unfilled entry renders nothing:

- **Per product** — add `faq?: FaqItem[]` to the `Product` interface. Keeps one
  catalogue rather than a parallel file that drifts, and the product page
  already has the product in hand.
- **Company-wide** — `GENERAL_FAQ: FaqItem[]` in a new `src/lib/faq.ts`
  (lead times, warranty, support, shipping, certifications, custom builds).

### 2. Writing rules — this is the substance, not the markup

Schema alone ranks nothing. How the answers are written decides whether they get
cited:

- **Self-contained.** An engine lifts one answer with no surrounding context.
  Never "as mentioned above" or "our equipment" — say "Valnex volumetric feeders".
- **Answer in the first sentence**, qualifications after. Engines truncate.
- **Name the concrete nouns** a query would contain: product name, "Valnex
  Industries", "Ahmedabad", "Gujarat", "India".
- **40–70 words.** Long enough to be complete, short enough to quote whole.
- **Drop the marketing adjectives.** "Industry-leading" is never cited;
  "ships assembled and commissioned on site" is.
- **Never invent a number.** If a document does not state a lead time, warranty
  period or capacity, the question does not get published. This is the same rule
  as `src/lib/site.ts` — structured data is republished verbatim as fact.

### 3. Schema

`faqPageSchema(items: FaqItem[])` in `src/lib/schema.ts`, emitting `FAQPage`
with `mainEntity` of `Question` / `acceptedAnswer`.

Three constraints that are easy to get wrong:

- **Return `null` and render nothing when `items` is empty.** An empty
  `FAQPage` is worse than no `FAQPage`.
- **The visible text must match the schema text exactly.** Google treats
  mismatched markup as spam. Both must render from the same `FaqItem`.
- **One `FAQPage` per URL.** If both the general and a product FAQ ever appear
  on the same page, merge them into a single node.

### 4. Rendering

New `src/components/Faq.tsx`.

> **The one thing that must not be got wrong:** every answer has to be in the
> server-rendered HTML even when visually collapsed. Conditional mounting —
> `{open && <p>…</p>}`, which is what `MobileNav` does — means a crawler that
> does not click sees an empty page. Use `<details>`/`<summary>`, or render all
> content and hide it with CSS. Borrow `MobileNav`'s easing for polish, not its
> mount/unmount behaviour.

Placement:

- `/products/[slug]` — product FAQ, after Specifications, before "Other equipment"
- `/` — general FAQ, between `Manifesto` and `CtaBand`
- Consider a dedicated `/faq` route only if the general list passes ~12 items;
  `sitemap.ts` enumerates from data, so it will pick the route up automatically

### 5. `llms.txt`

Add a `## Frequently asked questions` section with the **answers inline**, not
links to them. This is the highest-value single change in this plan for LLM
retrieval: it hands an assistant the text instead of asking it to render and
parse an animated React page. Remove the "specifications are not yet published"
caveat in the same change.

---

## To extract from the company documents

Nothing below gets written from assumption. Tick only what a document states.

- [ ] Typical lead time, per product or as a range
- [ ] Minimum order / whether single units are supplied
- [ ] Warranty period and what it covers
- [ ] Installation and commissioning — included, chargeable, or customer-side
- [ ] Spares and service availability, response time
- [ ] Certifications (ISO, CE, others) and what is certified
- [ ] Power and utility requirements per product
- [ ] Export markets served / countries shipped to
- [ ] Custom and made-to-order capability, and its limits
- [ ] Payment terms
- [ ] Industries served (plastics, pharma, food, …)

---

## TODO

- [ ] Add `FaqItem` and `faq?: FaqItem[]` to `src/lib/products.ts`
- [ ] Create `src/lib/faq.ts` with `GENERAL_FAQ`
- [ ] Fill answers from the documents, following the writing rules above
- [ ] Add `faqPageSchema()` to `src/lib/schema.ts`, returning `null` when empty
- [ ] Build `src/components/Faq.tsx` — content in the DOM when collapsed
- [ ] Render the general FAQ on `/` and emit its `FAQPage`
- [ ] Render product FAQs on `/products/[slug]` and emit their `FAQPage`
- [ ] Extend `src/app/llms.txt/route.ts` with the Q&A inline
- [ ] Delete the "specifications are not yet published" caveat from `llms.txt`
- [ ] Add `/faq` route + sitemap entry *(only if the list outgrows the homepage)*

---

## Verification

- `npx tsc --noEmit`, `npm run lint`, `npm run build`
- **Load a page with JavaScript disabled** and confirm every answer is in the
  HTML. This is the check that actually matters — if it fails, the schema is
  claiming content a crawler cannot see.
- Paste a rendered page into Google's Rich Results Test and the schema.org
  validator; both must report `FAQPage` with no errors
- Diff visible answer text against the JSON-LD `acceptedAnswer` text — they must
  be identical, not merely similar
- `curl /llms.txt` and read it end to end as if you were the assistant
- Confirm a product with no `faq` renders no FAQ section and no empty `FAQPage`

---

## Notes

- **Not in scope:** the 2-second preloader inflating LCP. It is a deliberate
  design choice and a separate decision, but it remains the largest ranking
  liability on the site — worth raising again when this work lands.
- Adjacent opportunity, deliberately excluded here to keep the change reviewable:
  a `HowTo` or `TechArticle` schema on selection/sizing guidance would compete
  for a different and less contested class of query than product pages do.
