# Neutral Risk

*Neutral DeFi Risk Intelligence Aggregator*

**A neutral, open aggregator of what DeFi risk feeds say about Ethereum protocols — side by side, verbatim, with no composite scoring.**

DeFi risk intelligence is fragmented. Before deploying capital, users — from retail
participants to institutional allocators — must navigate dozens of dashboards, rating
services, and research feeds. The information exists; there is no neutral layer that puts
it in one place. This project is that layer: for each major Ethereum protocol, it shows
the **coverage status** of every risk feed in the registry, the **governance facts**
(with provenance), and **what each feed says, verbatim**.

The mental model is **oracle diversity**: no single feed is canonical for something this
important. The aggregation is the value. We add no synthesis, no editorial judgement, and
**no score of our own**. See [`CHARTER.md`](./CHARTER.md).

> **Status: prototype.** This repository is an early, in-development reference built for
> the Ethereum Foundation App Relations *Neutral DeFi Risk Intelligence Aggregator* RFP.
> Feed ratings shown in the UI are currently **illustrative samples** pending provider
> verification and are labelled as such. The protocol set, design, data model, and
> governance docs are real.

---

## What this is

- A **protocol × feed coverage matrix** for the top Ethereum DeFi protocols by funds at
  risk (TVL, or volume where TVL is not applicable), sourced from
  [DefiLlama](https://defillama.com/chain/ethereum).
- A **per-protocol detail page** (tabbed): governance facts with provenance tags, one feed
  card per provider (methodology one-liner + coverage status + verbatim rating + source link),
  an on-chain control timeline, incident and audit history, and — unique to this project — a
  **transaction-transparency** link into the protocol's live on-chain activity.
- An **AI intelligence layer** *(preview)* — the first tab on each detail page. A neutral,
  citation-grounded per-protocol **assessment** of the registry's *own* sourced facts, plus a
  living *"what changed"* investigative note (who / when / why / what) when the underlying data
  moves. It **never produces a score, grade, or ranking** — an explainer of facts, not a judge,
  cordoned off as a clearly-labelled, non-authoritative layer (charter-safe by construction).
  Currently an illustrative mockup; the evaluation harness that keeps it neutral, and the rest of
  its roadmap, is in [`docs/ROADMAP.md`](./docs/ROADMAP.md) §2.
- A **methodology page** stating exactly what the project does and does not do, the full
  feed registry, and the data-provenance tags.
- A **plain-language FAQ** answering what a DeFi risk feed is, what coverage means, and why
  the registry aggregates feeds rather than scoring them — each answer restating the
  no-composite-scoring stance.

## What this is not

- **Not a rating agency.** We never produce a composite or proprietary risk score. We show
  what *others* publish. The constraint is binding and documented in [`CHARTER.md`](./CHARTER.md).
- **Not editorial.** Where feeds disagree, we show the disagreement. We do not adjudicate.

---

## Data model

| Layer | File | Source of truth |
| :---- | :--- | :-------------- |
| Seed protocols + metadata | `lib/data/protocols.ts` | Hand-curated; ranked against DefiLlama |
| Live TVL | `data/tvl-snapshot.json` | DefiLlama API (`scripts/refresh-tvl.mjs`) |
| Feed registry | `lib/data/feeds.ts` | Hand-curated from the RFP registry + additions |
| Coverage + verbatim ratings | `lib/data/coverage.ts` | Curated now; automated per feed at M2 |
| Governance facts | `lib/data/protocols.ts` (`governance`) | On-chain / verifiable where possible |
| AI assessment layer *(preview)* | `lib/data/ai-preview.ts` | Illustrative mockup; live pipeline post-grant |

Every datum carries a **provenance tag**: `onchain`, `verified` (confirmed against a
primary source), `self-reported`, or `sample` (illustrative placeholder, prototype only).

**Infrastructure.** The `onchain` data and the transaction-transparency links are produced
by [Sieve](https://github.com/slvDev/sieve) (MIT OR Apache-2.0), our open-source Ethereum
indexer. Sieve syncs directly over the Ethereum P2P network — no RPC provider, no API keys,
no rate limits — into Postgres with a GraphQL API. Because the indexer is open and re-runs
over public P2P, every on-chain figure here is independently reproducible.

---

## Corrections & contributions

This is a community-correctable public good. There are three contribution paths, all via
GitHub so every change is reviewable and attributable:

1. **Correct a fact** (a wrong coverage status, a stale rating, a governance detail) —
   open an issue with the `correction` template, or edit the relevant file in `lib/data/`
   and open a PR. Cite the source. Maintainers verify against the cited source before merge.
2. **Add a protocol** — open an issue with the `new-protocol` template including the
   DefiLlama slug and rationale (funds at risk). Accepted protocols are added to
   `lib/data/protocols.ts`.
3. **Add or update a feed provider** — open an issue with the `new-feed` template
   describing the provider's focus, type, and whether it exposes machine-readable output
   (which determines automated vs. manual coverage). See `lib/data/feeds.ts`.

**Review SLA:** corrections triaged within 5 business days. A correction is merged only
once its cited source has been checked. Merged corrections are credited in the PR and in
the contributors list.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm run refresh:tvl  # pull latest TVL from DefiLlama into data/tvl-snapshot.json
npm run build
```

## Licence

[AGPL-3.0-or-later](./LICENSE). The full codebase and data layer are open and
community-correctable.

## Steward

Maintained by the Rails team (rails.finance) as a public good. See the proposal and
`CHARTER.md` for the stewardship commitment.
