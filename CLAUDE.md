# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Neutral Risk** (package name `neutral-risk`) — a Next.js app that aggregates what third-party
DeFi risk feeds publish about Ethereum protocols, side by side and verbatim. Built for the
Ethereum Foundation "Neutral DeFi Risk Intelligence Aggregator" RFP. It is a **prototype**: most
feed ratings shown are illustrative samples pending provider verification, labelled as such in the
UI and by provenance tag.

## The Charter is binding — read it before changing data or features

`CHARTER.md` defines non-negotiable constraints. The most important, and the one most likely to
be accidentally violated:

- **No composite scoring (§1).** The project must NEVER produce its own risk score, grade,
  ranking-by-risk, or any derived/synthesized assessment. It shows what *other feeds* publish,
  verbatim. You may sort/filter by neutral external facts (TVL, category, feed-coverage count)
  but never by a risk judgement of our own. Aggregation is the product; synthesis is out of scope.
- **Verbatim presentation (§2):** ratings shown as the provider publishes them, attributed, with
  a source link. Disagreement between feeds is shown, not resolved.
- **Provenance (§4):** every datum carries a tag — `onchain`, `verified`, `self-reported`, or
  `sample`. `sample` = illustrative placeholder for the prototype; it must be replaced with
  verified data before losing the tag.

When adding any feature that looks analytical (the AI layer, the guided explorer, analytics
helpers), confirm it *routes to* or *explains* existing sourced facts rather than producing a
judgement. The AI layer (`lib/data/ai-preview.ts`) and explorer facets (`lib/data/facets.ts`)
both carry charter notes explaining how they stay compliant — preserve that property.

## Commands

```bash
npm run dev              # Next.js dev server
npm run build            # production build (SSG)
npm run lint             # eslint (eslint-config-next)
npm run refresh:tvl      # refresh data/tvl-snapshot.json from the DefiLlama API
npm run export:timeline  # regenerate data/control-timeline.json from a running Sieve indexer
```

There is no test suite. Verify changes with `npm run build` (catches type errors; `strict` is on)
and `npm run lint`. Path alias `@/*` maps to the repo root (`@/lib/...`, `@/components/...`).

## Architecture

### Static-by-construction (the load-bearing constraint)

The web app is fully static/SSG and intended to be IPFS/ENS-publishable. **Nothing dynamic may
become a runtime dependency of the site.** Live/external data (TVL, on-chain control events) is
fetched off-line by scripts, written to committed JSON snapshots in `data/`, and read at build
time. If an upstream source is down, the last committed snapshot still ships. Follow this pattern
for any new external data — never fetch at request time.

- `data/tvl-snapshot.json` ← `scripts/refresh-tvl.mjs` (DefiLlama). Read via `lib/tvl.ts`.
- `data/control-timeline.json` ← `scripts/export-control-timeline.mjs` (Sieve GraphQL). Read via
  `lib/control-timeline.ts`. `scripts/` is excluded from tsconfig and runs as plain `.mjs`.

### Data layer (`lib/data/`) — the source of truth

Everything the UI shows is hand-curated TypeScript modules. To correct or extend the registry you
edit these files, not a database:

- `protocols.ts` — seed protocol list, metadata, and `governance` control facts. Defines the core
  `Provenance`, `Category`, `GovernanceFact`, `ControlAction`, `Incident` types.
- `feeds.ts` — the risk-feed registry. `machineReadable` drives the automation story; `independence`
  classifies structural conflict-of-interest (`independent` → `commercial` → `paid-mandate` →
  `curates-vaults`).
- `coverage.ts` — the protocol × feed matrix. Cells default to `not-covered`; populated from
  per-feed `covered`/`partial` lists. Holds the verbatim `rating` strings (mostly `sample`).
- `asset-coverage.ts` / `assets.ts` — the asset-side mirror of the matrix. **Not currently in the
  UI** (Assets nav removed); retained to back a future milestone.
- `audits.ts`, `analytics.ts` (coverage-spread/divergence — measures *coverage*, not risk),
  `facets.ts` (explorer routing facets), `ai-preview.ts` (mockup AI output, no live model call).

Curated data carries verification dates in comments (e.g. `VERIFIED 2026-06-04`) — keep these
accurate when editing, and cite the source for corrections.

### Pages (`app/`, App Router)

- `/` (`page.tsx`) — home; the coverage browser with List / Matrix / Map / Explore views
  (`components/coverage-views.tsx`), all sharing one filter/sort state.
- `/protocol/[slug]` — per-protocol detail; tabbed (`components/protocol-tabs.tsx`): AI review,
  feeds, governance, control timeline, incidents, audits. Empty sections drop their tab.
- `/feed/[slug]` — per-feed detail. `/feeds`, `/explore`, `/methodology`, `/faq` — supporting pages.

Detail routes use `generateStaticParams`. The home page and `/explore` both build their data via
`buildExploreData()` in `lib/explore-data.ts` so they stay in lockstep.

### Styling

Tailwind v4 (CSS-first, `@theme` in `app/globals.css`). The site holds a **deliberately small
visual grammar** — a handful of styles, two typefaces. When adding UI, reuse the roles below rather
than inventing a new size/weight/tracking combo.

- **Typography — two fonts, one job each.** **Inter** (all prose/UI) + **JetBrains Mono** (numerics
  *only*: TVL, counts, prices, dates, hashes, rating codes — never decorative). Loaded + self-hosted
  by `next/font` in `layout.tsx` (no runtime fetch; stays IPFS-publishable), exposed as
  `--font-inter`/`--font-jetbrains` and fed into the `--font-sans`/`--font-mono` theme tokens.
  Type roles: page title `text-2xl font-bold tracking-tight`; section heading `.section-title`
  (uppercase); card/panel title `font-semibold`; **eyebrow/micro-label `.eyebrow`** (the one
  uppercase grammar for badges, chips, table headers, metadata, legends); **body / content
  `text-sm`; fine-print `text-xs`**. The `text-sm`/`text-xs` tokens are **lifted off the Tailwind
  defaults in `@theme`** — `text-sm` = **15px** (the BODY tier: prose, card descriptions, table
  cells) and `text-xs` = **13px** (FINE PRINT ONLY: timestamps, counts, provenance, footnotes).
  **Rule: any paragraph the user reads uses `text-sm`, never `text-xs`** — `text-xs` is reserved
  for metadata/labels. `.eyebrow`/`.label` (11px) and `.section-title` (13px) are `@utility` classes
  in `globals.css` and set size/weight/uppercase/tracking — apply colour separately. **No arbitrary
  `text-[Npx]`**, and weights stay within `normal`/`medium`/`semibold`/`bold` (no `font-black`).
- **Interaction grammar — borders are minimal; depth comes from a flat surface ladder.** A visible
  border is the exception, not the default. **Surface ladder (delineation by fill, not outline):**
  page `rr-900` → panel/card `bg-rr-850` → nested cell / raised control / hover-lift `bg-rr-800` →
  deep inset `bg-rr-950`. Each step is a flat opaque tone; that tonal step is what separates a panel
  from the page, a cell from its panel — **not** a border.
  - **Container** (panels, cards, tables, info boxes, metadata chips): flat fill, **no border**.
    Delineated by its surface tone alone. Don't wrap content in `border border-rr-*`.
  - **Control** (buttons, toggles, inputs, clickable cards): flat fill + a `border border-transparent`
    baseline (so the hover border doesn't shift layout) that becomes **`hover:border-brand`**
    (blue-500, the one accent) + `transition-colors`. The blue-on-hover border is the entire
    interactivity signal; controls are otherwise borderless tiles, same as containers — what marks
    them is `cursor-pointer` + the hover border/fill-lift, not a resting outline.
  - **Selected / active**: one language — **`border-brand` + a `bg-brand/15` tint** (view toggle,
    explorer option cards). **Exception: category filter chips** tint to *their own* `CATEGORY_COLOR`
    (border + ~15% fill, set inline); the "All" chip falls back to brand. Flat individual pills, no
    segmented dividers.
  - **Primary action**: solid `bg-brand` fill, no border (Continue, the on-chain Verify CTA).
  - **The few borders that remain are deliberate, never content outlines:** (a) the brand
    hover/active border above; (b) **functional lines** — table row dividers (`border-b`), the tab
    bar underline, hairline rules; (c) **semantic accent callouts** — coloured tint panels
    (`border-blue-500/20 bg-blue-500/5`, the violet AI card, the green/red methodology do/don't) and
    coloured status/provenance/coverage chips, where the tinted border carries meaning; (d) the
    floating menu/dropdown edge; (e) tiny inline label chips that *illustrate* a tag. Plain neutral
    `border-rr-*` around content is not one of them.
  - Radius scale: `rounded-md` (badges) · `rounded-lg` (buttons/inset panels) · `rounded-xl`
    (cards/containers) · `rounded-full` (pills/dots/round controls) — no `rounded-2xl`. Keyboard
    focus is one global `*:focus-visible` brand ring (don't `focus:outline-none`). Real controls
    get `cursor-pointer`.
- **Dark + light themes.** The `@theme` block holds the *dark* (default) `rr-*` ramp; light mode
  (`html[data-theme="light"]`) **inverts the same tokens** (rr-50 = darkest text, rr-900 = white bg)
  so components that reference `rr-*` recolour automatically — don't hardcode per-theme colours.
  `cov-covered` is the SAME mid fuchsia in both themes (no swap); only `cov-partial` — now a
  partial-count TEXT colour — keeps a per-theme override (brighter on dark, deeper on white) for
  legibility. The top status bar is theme-aware like everything else (it
  references `rr-*`/`cov-*` and recolours with the page). Category + status hues are constant.
  Theme is set pre-paint by an inline script in `layout.tsx` (no FOUC, defaults dark, persisted in
  `localStorage`) and flipped by `components/theme-toggle.tsx`. `<html>` always carries `data-theme`.
- **Palette — four disjoint colour systems, deliberately non-overlapping** so a colour always means
  one thing. (1) `rr-*` — a deep cool-slate **neutral** scale (`rr-600` = border tone), all
  structure/text. (2) `brand` — the single **interaction** accent, **blue** (blue-500): links, the
  selected state, primary buttons, the blue border-hover that marks a card clickable. (3) **Coverage**
  `cov-covered`/`cov-partial`/`cov-none` — a single-hue **value ramp**, NOT a traffic light. Covered
  and partial share **ONE fuchsia hue** (`cov-covered` = **fuchsia-500**, the same tone in both
  themes); **partial is distinguished by the diagonal HATCH** (`cov-hatch` — solid fuchsia stripes
  over a semi-opaque fuchsia wash of the same hue), *not* by a colour step. absent = muted slate.
  `cov-partial` is no longer a fill: it survives only as the **text/chip colour for partial counts**,
  where per-theme tuning still helps (fuchsia-400 on dark, fuchsia-600 on white). The ramp is
  *neutral*: covered ≠ "good", partial ≠ "risk" — per Charter §1 we measure coverage, not risk, so
  green/amber (which read as good/caution) were deliberately retired here. (4) **Category**
  `CATEGORY_COLOR` (`lib/data/protocols.ts`) — one identity hue per protocol kind (Lending sky,
  DEX/AMM teal, Swap amber, Yield/Vault green, Liquid Staking orange), shown as a small dot beside
  the category label everywhere it appears (list, matrix, map points, explorer, protocol header) and
  as the tint of the *active* category filter chip. Category is a neutral external fact, so colouring
  by it is charter-safe. The four regions don't collide: coverage owns pink-violet, categories own
  sky/teal/amber/green/orange, brand owns blue, structure stays neutral.
- **Status (health) triad — `status-ok`/`status-warn`/`status-down` (green/amber/red).** Separate
  from coverage: reports OUR pipeline's operational health (status bar) plus neutral
  capability/disclosure cues — machine-readability (`feeds`/`methodology`), feed independence
  (`independence-badge`), price direction (protocol header). This is where green/amber/red still mean
  good/caution/down; never use these for coverage, and never use `cov-*` for health. (Green/amber
  were moved *off* the coverage tokens onto these so the coverage ramp could go neutral.)
- **Flat surfaces, no translucency on anchored elements.** Everything anchored in the page —
  controls and containers alike — uses **flat opaque `rr-*` fills** (`bg-rr-850` for panels/cards
  and filled controls, `bg-rr-800` for raised/hover fills), never a translucent overlay. The old
  `surface`/`surface-hover`/`surface-sel` tokens were removed; don't reintroduce them.
- **Glass is for floating only.** The `glass` / `glass-strong` blur utilities are reserved for
  elements that float *above* content — the nav dropdown + mobile sheet, the columns menu, and the
  coverage-bar hover tooltip. Anchored surfaces stay flat (no glass, no emboss).
- **Nav.** A hamburger drawer at all breakpoints (`components/site-nav.tsx`, client; opaque bg) with
  a Connect section (GitHub + Telegram). Icons from `lucide-react`.

### Sieve (`sieve/`)

Config + ABIs + runbook for the off-line Ethereum P2P indexer that produces on-chain control
timelines. Demo scope is a single protocol (Aave v3). See `sieve/README.md`. The indexer is never
called by the site — it feeds `export:timeline` only.

## Governance docs

`CHARTER.md` (binding constraints), `DISCLOSURES.md` (maintainer conflict-of-interest disclosures,
required by Charter §3 — update when a relationship begins/changes/ends), and `README.md`. When
changing a feed/protocol that touches a disclosed relationship, check `DISCLOSURES.md` stays
accurate.
