# Neutral Risk — Roadmap

> **What this is.** Neutral Risk launches as the neutral, 20-protocol DeFi risk-feed aggregator the
> Ethereum Foundation RFP describes — coverage matrix, per-protocol detail pages, on-chain
> verification, methodology, all under AGPL-3.0. This document is the roadmap **beyond that launch
> scope**: extensions and follow-on phases (several matching-funded) we intend to build as the
> project grows.
>
> **One gate applies to everything below** (per [`../CHARTER.md`](../CHARTER.md) §1): each idea
> must **present a fact or relay a feed — never create a Rails risk verdict**. No score, grade,
> rank, or composite. Everything here is neutral by construction, and **nothing here displaces the
> core 20-protocol deliverable**, which ships first.

---

## 1. Asset coverage view + asset → protocol exposure map  *(matching-funded)*

The risk picture isn't complete at the protocol level alone, because **assets are the contagion
vector**: when collateral fails, every protocol holding it is exposed at once. The April 2026 Kelp
rsETH exploit is the proof — ~$292M unbacked rsETH; Aave, SparkLend and Fluid froze markets within
the hour; exposure ran from ~$196M on Aave down to ~$1M on Morpho's isolated markets, all from the
*same asset*.

- **Already at launch:** asset-driven *incidents* (like rsETH) surface on the affected protocols'
  detail pages, sourced and provenance-tagged.
- **Extension (matching-funded):** a standalone **asset coverage view** aggregating what
  asset-focused feeds publish about key collateral, plus an on-chain **asset → protocol exposure
  map** — aggregation and provenance only, **no Rails asset score**. Candidate feeds include
  asset-level raters such as **Pharos** (`pharos.watch`) — named in the RFP's own provider list, but
  a *stablecoin/asset* rater rather than a protocol feed, so its coverage belongs in the asset layer
  rather than the protocol matrix — and **Yearn Curation** (`curation.yearn.fi`), whose ~33
  stablecoin/LRT/vault reports are asset-scoped; where a feed is operated by a listed protocol
  (Yearn self-rates its own vaults), those cells are shown verbatim and tagged `self-reported`, with
  the operator conflict disclosed per the charter.

We scope this exactly as the RFP scopes L2: out of the base grant, a follow-on if matching is
secured — it never displaces the 20-protocol core. The `lib/data/assets.ts` /
`lib/data/asset-coverage.ts` data layers are retained to back it.

---

## 2. AI intelligence layer — accountability & neutrality enforcement

*The AI layer itself launches with the product: a per-protocol neutral assessment plus a "what
changed" note, both citation-grounded and score-free, with a working mockup in the prototype today.
The roadmap for it is **not about making it bigger** — it is about making it **provably neutral and
accountable**.*

- **Evaluation harness (the trust layer).** Every AI-generated assessment is checked automatically
  *before* it publishes, on two things: **citation groundedness** — every claim must trace to a
  real fact already in the registry, so nothing can be invented — and a **charter-compliance gate**
  that scans for any scoring / grading / ranking language and **blocks publication outright** if it
  finds any. The harness's aggregate results (pass rates, cost, latency) are published openly, so
  the AI layer is auditable rather than a black box. This turns *"trust us to stay neutral"* into
  *"neutrality is mechanically enforced, and we show our work."*
- **Clearly labelled, non-authoritative.** AI text always carries its own badge and a standing
  disclaimer, visually distinct from the four-value factual provenance tags, so a reader never
  mistakes a generated summary for a verified datum.

**Charter stance:** an *explainer of facts already in the registry, never a judge.* It aggregates
and cites; it does not adjudicate — and the evaluation harness is what guarantees that holds at
scale.

---

## 3. Datum-level history (git-backed)

Because the data layer is public and in git, every cell can show **how it changed over time** —
e.g. *"DeFiScan rated this Stage 1 until 2026-04."* Provenance through version control: an audit
trail of facts, not an assessment. It's a transparency feature only an open public good can offer,
and it turns the AGPL licence from a checkbox into a feature. Build cost: medium.

---

## 4. Censorship-resistant publishing — IPFS + ENS

The app is already fully static, so each build is **content-addressed**: we can publish every
release to **IPFS with an ENS `contenthash`**, so the live site stays reachable with no single
hosting or DNS chokepoint. This extends the project's independence from "open data + open code" to
"open *hosting*" — turning the static architecture into a censorship-resistance property. A natural
extension of the build we already ship, not a rebuild.

---

## 5. L2 coverage  *(matching-funded, as the RFP frames it)*

The RFP scopes L2 out of the base grant as an explicit follow-on. We adopt the same framing:
extend the registry's protocol coverage to major L2 deployments if L2 matching is secured. Same
neutral model, same provenance discipline; out of base scope.

---

## Scope summary

| Milestone | Funding | Status today |
| :-------- | :------ | :----------- |
| Asset coverage + exposure (§1) | Matching | Incidents shipped; asset data layer retained |
| AI accountability — eval harness (§2) | Future | Base AI mockup shipped |
| Datum-level history (§3) | Future | — |
| IPFS / ENS publishing (§4) | Enhancement | Static build ready |
| L2 coverage (§5) | Matching | — |

Asset-driven **incidents** (the rsETH case study) ship **with the launch product**, on the protocol
detail pages — only the standalone asset *views* are a later extension.
