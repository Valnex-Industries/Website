# Contributing

This is a small, closely-held codebase (currently maintained by a single team), so this document is
shorter than a typical open-source `CONTRIBUTING.md` — it's here to keep future-you (or a teammate, or an
AI agent working on this repo) consistent with how the project actually operates, not to gatekeep outside
contributions.

## Before you start

Read `AGENTS.md`. It's short, and it says something that matters more than it looks: this project pins
**Next.js 16**, which broke enough conventions from earlier versions that acting on memory instead of
checking `node_modules/next/dist/docs/` will produce code that looks right and behaves wrong (`params` and
`searchParams` are `Promise`s now, being the most common trip-up).

## Branching

- **Never commit directly to `main`.** Every change — feature, fix, or content update — goes on its own
  branch, named for what it does (`feat/whatsapp-inquiry`, `fix/navbar-tablet-height`), not for who's doing
  it or when.
- Merge with `git merge --no-ff` so the feature stays visible as a unit in `git log --graph`, rather than
  disappearing into a flat history.
- `main` deploys automatically on push (Vercel). Pushing to `main` is a production deploy, not a save
  point — treat it accordingly.

## Commit messages

Look at the existing log before writing one; the convention is consistent and worth matching:

- **Explain why, not what.** The diff already shows what changed. A good commit message says why the
  previous behaviour was wrong, what the constraint was, or what would have broken without this change.
  `fix: drop the tablet step from the navbar height` plus a body explaining *which* commit introduced the
  regression and *why* it was wrong beats `fix navbar`.
- If a change reverts or supersedes a specific earlier commit, **name that commit's hash** in the body.
  Future-you debugging a regression will run `git log` before asking anyone, and a message that says
  "this undoes `a1b2c3d`" saves that lookup.
- Body paragraphs over bullet soup for anything with real reasoning behind it; bullets are fine for a list
  of mechanical, unrelated changes.

## Before you open anything for review (or merge it yourself)

There is no test suite in this repo — the verification loop is type-checking, linting, and a production
build:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

All three, every time, even for a change that "obviously" can't break the build. Tailwind's arbitrary-value
classes (`w-[62vw]`, `md:mr-0`) are a common silent-failure point: a typo in one doesn't error, it just
doesn't generate the CSS rule, and the class quietly does nothing. If you're relying on an unusual utility
class, it's worth confirming it actually compiled:

```bash
grep -o '\.your-class-name{[^}]*}' .next/static/chunks/*.css
```

## Responsive changes

A meaningful share of this site's traffic is mobile. Any layout change needs a mental (or actual) pass at
**mobile, tablet portrait, tablet landscape, and desktop** — this codebase treats those as four genuinely
different layouts in places (see `Strengths.tsx` for why: a tablet held upright and the same tablet turned
sideways need different sizing, and the breakpoint boundaries where that split happens are chosen
deliberately, not by fitting whatever felt right in the moment).

## Data ownership

Before adding a new place that lists products, contact details, or navigation links: check whether one
already exists. `src/lib/products.ts` and `src/lib/site.ts` exist specifically so this data has one home;
a second copy is a future inconsistency, not a shortcut.

## Secrets

`.env` is gitignored; `.env.example` documents every key without values. If you're asked to add a new
environment variable, add it to `.env.example` too — an undocumented required variable is a bug that only
shows up in someone else's `npm run dev`, not yours.

Never paste a real value of `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_PASS`, or `SUPABASE_ANON_KEY` into a commit
message, an issue, a PR description, or a chat with an AI assistant. If one leaks, rotate it — Supabase
Settings → API → reset, and update the SMTP mailbox password if it's ever shared outside `.env`.
