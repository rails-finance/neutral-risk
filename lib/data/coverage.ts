// The protocol × feed coverage matrix.
//
// Every cell is assessed and labelled: "covered", "partial", or "not-covered".
// Coverage status is derived from per-feed coverage lists below; cells default to
// "not-covered" so the matrix is fully populated by construction.
//
// Verbatim ratings shown on detail pages are, in this prototype, ILLUSTRATIVE SAMPLES
// (provenance: "sample") pending provider verification — exactly as the EF POC labels its
// own data. The coverage *status* reflects publicly-observable presence but should also be
// treated as provisional until the M2 automation/verification pass.

import { FEEDS } from "./feeds";
import { PROTOCOLS } from "./protocols";

export type CoverageStatus = "covered" | "partial" | "not-covered";

export interface Coverage {
  status: CoverageStatus;
  /** Verbatim rating as published by the feed. */
  rating?: string;
  /** Methodology one-liner / how this feed assesses this protocol. */
  note?: string;
  url?: string;
  provenance: "verified" | "sample";
}

// Per-feed coverage. Anything not listed defaults to "not-covered".
const FEED_COVERAGE: Record<string, { covered: string[]; partial: string[] }> = {
  defiscan: {
    // VERIFIED 2026-06-03 against the canonical deficollective/defiscan repo. The DEX
    // aggregators, Fluid, Gearbox, Euler, Balancer, Yearn, Mellow, standalone MetaMorpho
    // vaults, and Rocket Pool have no DeFiScan review.
    covered: ["spark", "aave-v3", "morpho", "compound-v3", "liquity-v1", "uniswap-v3", "curve", "pendle", "lido"],
    partial: [],
  },
  // All entries below VERIFIED 2026-06-04 via per-feed source research (see RESEARCH-BRIEF.md).
  llamarisk: {
    // Risk-service provider, not a per-protocol rated feed: Curve Market Health Scores,
    // Aave risk-steward work, and per-collateral (LST/PT) assessments. Others are cross-
    // protocol mentions only.
    covered: ["curve", "aave-v3", "aave-v4", "lido", "rocket-pool", "pendle"],
    // liquity + balancer dropped 2026-06-07: LlamaRisk's only Liquity work is the archived
    // bLUSD (Chicken Bonds) asset assessment, and Balancer appears only as a cross-mention in
    // other assets' reports — neither is genuine per-version protocol coverage.
    partial: ["morpho", "morpho-vaults", "euler", "gearbox", "yearn", "uniswap-v3"],
  },
  blockanalitica: {
    // Lending-risk dashboards (dedicated subdomains for spark/morpho/compound; Sphere app
    // covers aave/liquity/fluid). Curates MetaMorpho vaults (partial).
    covered: ["spark", "aave-v3", "morpho", "compound-v3", "liquity-v2", "fluid"],
    // Sphere's live Liquity coverage is V2/BOLD; V1 only loosely referenced → partial.
    partial: ["morpho-vaults", "liquity-v1"],
  },
  curatorwatch: {
    covered: ["morpho-vaults", "morpho"],
    partial: ["aave-v3", "aave-v4", "euler", "compound-v3", "spark", "mellow"],
  },
  defipunkd: {
    // Broad registry; "covered" = a graded page exists, "partial" = page exists but ungraded
    // ("no model has graded any dimension yet" / Wood tier).
    // Graded pages → covered; "Wood tier"/ungraded pages → partial. Aave & Liquity have
    // separate per-version pages; V4/BOLD/Balancer-V2 pages exist but are ungraded → partial.
    covered: ["spark", "aave-v3", "aave-v4", "morpho", "liquity-v1", "curve", "balancer-v3", "pendle", "lido", "rocket-pool"],
    partial: ["fluid", "gearbox", "euler", "compound-v3", "uniswap-v3", "uniswap-v4", "cow-swap", "1inch", "0x", "yearn", "mellow", "liquity-v2", "balancer-v2"],
  },
  // pharos removed 2026-06-07 — asset-side feed (stablecoins), zero protocol coverage. Its
  // asset-coverage.ts entry is retained for the future asset-risk milestone. See feeds.ts note.
  // defisphere removed (= Block Analitica's Sphere product; coverage folded into blockanalitica).
  credora: {
    // Live per-vault credit ratings on Morpho and Spark only. (Aave/Compound logos on
    // credora.network are RedStone *oracle* clients, not Credora ratings.)
    covered: ["spark", "morpho", "morpho-vaults"],
    partial: [],
  },
  xerberus: {
    // Public Xerberus ratings are ASSET-level; protocol-level is open beta with no public
    // per-protocol rating string. Aave/Morpho/Lido named only as examples.
    covered: [],
    partial: ["aave-v3", "morpho", "lido"],
  },
  philidor: {
    // Public API (api.philidor.io) returns exactly these protocols with scored vaults.
    covered: ["spark", "aave-v3", "morpho", "compound-v3", "uniswap-v3", "uniswap-v4", "yearn", "morpho-vaults"],
    partial: [],
  },
  pigi: {
    covered: ["spark", "aave-v3", "morpho", "fluid", "gearbox", "euler", "liquity-v1", "liquity-v2", "morpho-vaults", "lido"],
    partial: ["uniswap-v3"],
  },
  // risklayer removed (pre-launch AVS, no live feed).
  defisaver: {
    // Position-management app (not a published rating feed): "coverage" = supported for
    // management + safety-ratio / liquidation automation. Borderline as a "feed".
    covered: ["aave-v3", "aave-v4", "spark", "morpho", "fluid", "euler", "compound-v3", "compound-v2", "liquity-v1", "liquity-v2", "curve"],
    partial: ["morpho-vaults", "lido", "rocket-pool", "uniswap-v3", "1inch", "0x"],
  },
  zyfai: {
    // Live per-pool risk grades via risk.zyf.ai API (chainId=1). Lending/yield pools only.
    covered: ["aave-v3", "spark", "morpho", "morpho-vaults", "fluid", "euler", "compound-v3", "yearn"],
    partial: [],
  },
  // ── Added 2026-06-10. The five feeds surfaced from the EF "OpenRisk" POC. Coverage below is
  // researched per-feed (see notes); most ratings are illustrative samples pending the M2
  // verification pass, except where a stage/engagement was confirmed against a live source.
  anticapture: {
    // Governance-capture framework (Blockful). Tracks token-DAO governance security as a
    // "Stage" (L2Beat-style). Of our protocols only the UNI and COMP DAOs are assessed; Aave is
    // listed on the dashboard but "Not Assessed" → partial.
    covered: ["uniswap-v3", "compound-v3"],
    partial: ["aave-v3"],
  },
  exponential: {
    // A–F pool risk ratings (protocol/asset/chain/pool). NOTE: the standalone product migrated
    // into YO Protocol in 2026 — every grade here is a pre-migration sample pending re-verification.
    covered: ["aave-v3", "compound-v3", "morpho", "curve", "lido", "pendle"],
    partial: ["compound-v2", "fluid", "euler", "uniswap-v3", "balancer-v2", "liquity-v1", "yearn"],
  },
  defisafety: {
    // Process Quality Reviews (0–100%). The PQRs (and their ids/URLs) are real; the percentages
    // are sample, pending confirmation on the live PQR pages (snippet-derived; two conflicted).
    covered: ["aave-v3", "uniswap-v3", "lido", "liquity-v1", "liquity-v2", "yearn", "balancer-v2"],
    partial: ["compound-v3", "compound-v2", "curve", "rocket-pool", "morpho", "euler", "pendle", "1inch", "0x"],
  },
  gauntlet: {
    // Agent-based simulation + (since 2024) direct Morpho vault curation. Active: Compound,
    // Morpho, Euler. Aave mandate ENDED Feb 2024. Uniswap work is incentive optimization, not
    // lending-risk → partial.
    covered: ["compound-v3", "morpho", "morpho-vaults", "euler"],
    partial: ["aave-v3", "uniswap-v4"],
  },
  chaoslabs: {
    // Economic-risk dashboards / parameter automation. Active: Gearbox. Aave mandate TERMINATED
    // 2026-04-06 (LlamaRisk took over); Compound is a grants-funded monitoring hub, not a mandate.
    covered: ["gearbox"],
    partial: ["aave-v3", "compound-v3"],
  },
};

// Verbatim ratings per (protocol, feed) cell. Entries tagged provenance "verified" are
// confirmed against the feed's published source (url); the rest are illustrative samples
// pending the M2 verification pass. The DeFiScan Stage values below are VERIFIED 2026-06-03
// against the canonical deficollective/defiscan repo (curve/compound/pendle carry a
// placeholder publish_date upstream but render live with the stages shown).
const RATINGS: Record<
  string,
  Record<string, { rating?: string; note: string; provenance?: "verified" | "sample"; url?: string }>
> = {
  spark: {
    defiscan: { rating: "Stage 0", note: "Governed via Sky/Spark proxy; loss-of-funds upgrades lack a ≥7-day exit window or sufficient Security Council.", provenance: "verified", url: "https://www.defiscan.info/protocols/spark/ethereum" },
    blockanalitica: { rating: "Live dashboard", note: "On-chain risk dashboard for SparkLend markets: rates, liquidations, collateral exposure.", provenance: "verified", url: "https://spark.blockanalitica.com" },
    credora: { rating: "A to B+", note: "Per-vault credit ratings on Spark Savings Vaults (e.g. Savings USDS A-, Staked USDS B+) with probability-of-significant-loss.", provenance: "verified", url: "https://reports.credora.io/spark/latest.pdf" },
    philidor: { rating: "Prime (8.4–8.7 / 10)", note: "Deterministic vault scores; e.g. sUSDS 8.38, Spark wstETH 8.71.", provenance: "verified", url: "https://analytics.philidor.io" },
    zyfai: { rating: "Excellent (6/6)", note: "Live per-pool risk grade (TVL/APY stability, liquidity, Lindy checks).", provenance: "verified", url: "https://risk.zyf.ai" },
    defipunkd: { rating: "Bronze tier", note: "5-dimension AI-consensus (Control / Exit / Autonomy / Open Access / Verifiability); spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/spark" },
  },
  "aave-v3": {
    defiscan: { rating: "Stage 0", note: "Governance can upgrade pools without a ≥7-day exit window or sufficient Security Council.", provenance: "verified", url: "https://www.defiscan.info/protocols/aave/ethereum" },
    blockanalitica: { rating: "Live dashboard", note: "Sphere tracks Aave v3 (Core & Prime) rates, liquidations, and risk scores.", provenance: "verified", url: "https://app.defi-sphere.com/aave_core" },
    llamarisk: { rating: "Risk-steward (research)", note: "Official Aave V3 risk service provider: collateral onboarding, parameter assessments, PT-risk analytics.", provenance: "verified", url: "https://research.llamarisk.com/research-aave" },
    philidor: { rating: "Prime / Core (≈7.9–8.8 / 10)", note: "Aave v3 supply vaults; e.g. WETH 8.76 (Prime), USDT 7.90 (Core).", provenance: "verified", url: "https://analytics.philidor.io" },
    zyfai: { rating: "Excellent (4/4)", note: "Live per-pool grade; flagship USDC and WETH reserves pass all checks.", provenance: "verified", url: "https://risk.zyf.ai" },
    defipunkd: { rating: "Silver tier", note: "5-dimension AI-consensus (page titled Aave V3); spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/aave" },
    anticapture: { rating: "Not Assessed", note: "Listed on the Anticapture governance-security dashboard but no Stage published yet.", provenance: "verified", url: "https://app.anticapture.com/aave" },
    exponential: { rating: "A (top tier)", note: "A–F pool risk; Aave V3 pools rated around A (top protocol tier). Pre-migration sample — methodology moved into YO Protocol in 2026.", provenance: "sample" },
    defisafety: { rating: "94% (PQR)", note: "Process Quality Review; ~94% (a 93% figure also appears across sources — confirm on the live PQR). Documentation, testing, audits, admin keys.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/358" },
    gauntlet: { rating: "Mandate ended (2024)", note: "Aave's official risk steward 2021–2024 (quarterly risk reviews, parameter recommendations); Gauntlet discontinued the engagement Feb 2024.", provenance: "verified", url: "https://blockworks.co/news/gauntlet-discontinues-work-at-aave" },
    chaoslabs: { rating: "Mandate ended (2026)", note: "Primary Aave risk provider Nov 2022–Apr 2026 (Risk Stewards, Edge Risk Oracles, VaR dashboards); Chaos Labs exited 2026-04-06, LlamaRisk took over continuity.", provenance: "verified", url: "https://www.coindesk.com/tech/2026/04/06/aave-loses-key-risk-manager-chaos-labs-amid-contributor-exodus-and-disputes" },
  },
  "aave-v4": {
    llamarisk: { rating: "Risk-centric analysis", note: "Published Aave V4 risk analyses: hub-and-spoke architecture, dynamic liquidations, V4 parameters.", provenance: "verified", url: "https://governance.aave.com/t/hubs-spokes-in-aave-v4-a-risk-centric-analysis/23907" },
    defipunkd: { rating: "Silver tier", note: "Separate 'Aave V4' page (~$85M TVL); 5-dimension AI-consensus, most dimensions unknown.", provenance: "sample", url: "https://defipunkd.com/protocol/aave-v4" },
    defisaver: { rating: "Full management", note: "Aave V4 live on DeFi Saver day-one: automation, leverage, liquidation protection.", provenance: "sample", url: "https://app.defisaver.com" },
  },
  morpho: {
    defiscan: { rating: "Stage 1", note: "Morpho Blue core is immutable and upgrades protected; short of Stage 2 on on-chain governance + 30-day exit window.", provenance: "verified", url: "https://www.defiscan.info/protocols/morpho/ethereum" },
    blockanalitica: { rating: "Live dashboard", note: "On-chain analytics for Morpho Blue markets: rates, liquidations, collateral exposure.", provenance: "verified", url: "https://morpho.blockanalitica.com" },
    credora: { rating: "A+ to D", note: "Live credit ratings on Morpho Blue markets & vaults; blue-chip vaults rated A+.", provenance: "verified", url: "https://forum.morpho.org/t/credora-network-risk-ratings-on-morpho/1652" },
    curatorwatch: { rating: "Grade (0–100)", note: "Curator/vault grading across MetaMorpho vaults; High/Medium/Low + composite score.", provenance: "verified", url: "https://curatorwatch.com/docs" },
    philidor: { rating: "Prime (≈8.5 / 10)", note: "Curated MetaMorpho vaults; e.g. Steakhouse USDC 8.61, Gauntlet USDC Prime 8.49.", provenance: "verified", url: "https://analytics.philidor.io" },
    zyfai: { rating: "Excellent (top vaults)", note: "27 curated MetaMorpho vaults graded live; range Good–Excellent.", provenance: "verified", url: "https://risk.zyf.ai" },
    defipunkd: { rating: "Bronze tier", note: "5-dimension AI-consensus (Morpho Blue + Optimizers); spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/morpho" },
    exponential: { rating: "A (top tier)", note: "Morpho Blue in the A-rated protocol tier (immutable core). Pre-migration sample (YO Protocol).", provenance: "sample" },
    defisafety: { note: "Process Quality Review published (PQR id 535); verbatim score pending confirmation on the live page.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/535" },
    gauntlet: { rating: "Vault curator", note: "Curates Morpho vaults via curator multisig (caps, allocations, fees) across Prime/Core/Frontier risk bands — judge-and-player.", provenance: "verified", url: "https://www.gauntlet.xyz/resources/under-the-hood-unpacking-our-morpho-vault-curation-methodology" },
  },
  lido: {
    defiscan: { rating: "Stage 0", note: "Lido v2: DAO/Aragon upgrade rights not protected by a ≥7-day exit window or sufficient Security Council.", provenance: "verified", url: "https://www.defiscan.info/protocols/lido-v2/ethereum" },
    llamarisk: { rating: "Collateral Risk Assessment", note: "Qualitative wstETH assessment (Market / Technology / Counterparty risk).", provenance: "verified", url: "https://hackmd.io/@PrismaRisk/wsteth" },
    defipunkd: { rating: "Silver tier", note: "5-dimension AI-consensus; spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/lido" },
    exponential: { rating: "Average", note: "Protocol-risk component rated \"Average\" (tiers: Best/Good/Average/Watch out/Avoid); Lido ETH staking pool rated A. Pre-migration sample.", provenance: "sample" },
    defisafety: { rating: "92% (PQR)", note: "Process Quality Review; ~92% (an earlier review scored 84%).", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/437" },
  },
  "liquity-v1": {
    defiscan: { rating: "Stage 2", note: "Immutable LUSD CDP; no loss-of-funds upgrade path, dependencies mitigated, alternative frontends exist. DeFiScan's Liquity review is V1-only.", provenance: "verified", url: "https://www.defiscan.info/protocols/liquity/ethereum" },
    defipunkd: { rating: "Silver tier", note: "'Liquity V1 CDP' page; 5-dimension AI-consensus, all green (tentative); spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/liquity" },
    exponential: { note: "Liquity (LUSD) protocol page listed; pool grades not captured pre-migration.", provenance: "sample" },
    defisafety: { rating: "93% (PQR)", note: "Process Quality Review (Oct 2023); an earlier review scored 97%.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/376" },
  },
  "liquity-v2": {
    blockanalitica: { rating: "Live dashboard", note: "Sphere tracks Liquity V2 (BOLD): borrow metrics and the V2 Stability Pool.", provenance: "verified", url: "https://app.defi-sphere.com" },
    defipunkd: { rating: "Wood tier (ungraded)", note: "'Liquity V2 CDP' page exists but ungraded — no model quorum yet; spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/liquity" },
    defisafety: { rating: "85% (PQR)", note: "Process Quality Review of Liquity V2 / BOLD (Feb 2025).", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/611" },
  },
  "uniswap-v3": {
    defiscan: { rating: "Stage 2", note: "Uniswap v3: non-custodial, no loss-of-funds upgrade path, no external dependencies, alternative frontends exist.", provenance: "verified", url: "https://www.defiscan.info/protocols/uniswap-v3/ethereum" },
    philidor: { rating: "Prime (≈8.7 / 10)", note: "Uniswap v3 LP positions scored as vaults; e.g. USDC/WETH 0.05% 8.72.", provenance: "verified", url: "https://analytics.philidor.io" },
    defipunkd: { rating: "Wood tier (ungraded)", note: "Uniswap V3 deployment page; at least one model submission, no quorum yet.", provenance: "sample", url: "https://defipunkd.com/protocol/uniswap" },
    anticapture: { rating: "Stage 1", note: "Governance-security Stage (L2Beat-style): no High-Risk items, ≥1 Medium-Risk; \"4 items to Stage 2\". Tracks the UNI DAO.", provenance: "verified", url: "https://app.anticapture.com/uni" },
    exponential: { note: "Uniswap V3 protocol page listed; pool grades not captured pre-migration.", provenance: "sample" },
    defisafety: { rating: "96% (PQR)", note: "Process Quality Review (PASS); 94–96% across sources — pending confirmation on the live PQR.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/415" },
  },
  "uniswap-v4": {
    philidor: { note: "Uniswap V4 LP positions scored as vaults (Philidor covers V2/V3/V4 deployments).", provenance: "sample", url: "https://analytics.philidor.io" },
    defipunkd: { rating: "Wood tier", note: "Uniswap V4 deployment listed (PoolManager/hooks) but no analysis on file yet.", provenance: "sample", url: "https://defipunkd.com/protocol/uniswap" },
    gauntlet: { rating: "Incentive optimization", note: "Uniswap Foundation partnership optimising v4 / Unichain liquidity incentives — not lending-risk parameters.", provenance: "verified", url: "https://www.gauntlet.xyz" },
  },
  curve: {
    defiscan: { rating: "Stage 0", note: "DAO/admin upgrade rights not protected by a ≥7-day exit window or sufficient Security Council.", provenance: "verified", url: "https://www.defiscan.info/protocols/curve-finance/ethereum" },
    llamarisk: { rating: "Market Health Scores", note: "Quantitative market-health scoring for crvUSD / LlamaLend markets.", provenance: "verified", url: "https://llamarisk.com/research/curve-market-health-methodology" },
    defipunkd: { rating: "Silver tier", note: "5-dimension AI-consensus; spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/curve-finance" },
    exponential: { rating: "Good", note: "Protocol-risk component rated \"Good\" (tiers: Best/Good/Average/Watch out/Avoid). Pre-migration sample.", provenance: "sample" },
    defisafety: { note: "Process Quality Review published (PQR id 550); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/550" },
  },
  "compound-v3": {
    defiscan: { rating: "Stage 0", note: "Comet (V3): governance can upgrade markets without a ≥7-day exit window or sufficient Security Council. DeFiScan has no separate V2 page.", provenance: "verified", url: "https://www.defiscan.info/protocols/compound-v3/ethereum" },
    blockanalitica: { rating: "Live dashboard", note: "On-chain risk dashboard for Compound v3 markets: rates, liquidations, collateral health.", provenance: "verified", url: "https://compound.blockanalitica.com" },
    philidor: { rating: "Core / Prime (5.5–8.7 / 10)", note: "Compound v3 supply markets; e.g. USDC 5.50 (Core), USDT 8.73 (Prime).", provenance: "verified", url: "https://analytics.philidor.io" },
    zyfai: { rating: "Excellent (5/5)", note: "Compound v3 USDC/USDT/WBTC/WETH Comet markets graded live.", provenance: "verified", url: "https://risk.zyf.ai" },
    anticapture: { rating: "Stage 0", note: "Governance-security Stage: ≥1 High-Risk item; \"5 items to Stage 1\". Tracks the COMP Governor (one DAO across Compound versions).", provenance: "verified", url: "https://app.anticapture.com/comp" },
    exponential: { rating: "A (pools)", note: "Compound V3 (Comet) USDC markets rated A. Pre-migration sample.", provenance: "sample" },
    defisafety: { note: "Process Quality Review of Compound III / Comet published (PQR id 582); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/582" },
    gauntlet: { rating: "Active risk mandate", note: "24/7 risk management across Comet deployments: parameter optimization (collateral factors, supply caps, IR curves) with recommendations to Compound governance.", provenance: "verified", url: "https://www.gauntlet.xyz" },
    chaoslabs: { rating: "Risk monitoring hub", note: "Grants-funded Compound Multi-Chain Risk Monitoring Hub: VaR, collateral-at-risk, per-wallet health scores — monitoring, not a parameter mandate.", provenance: "verified", url: "https://chaoslabs.xyz/posts/compound-multi-chain-risk-monitoring-hub" },
  },
  "compound-v2": {
    defisaver: { note: "Legacy Compound V2 (Comptroller / cToken) position management; support being deprecated.", provenance: "sample", url: "https://help.defisaver.com/protocols/compound" },
    exponential: { note: "Legacy Compound (V2) pools rated pre-migration (e.g. an ETH lending pool rated A).", provenance: "sample" },
    defisafety: { note: "Process Quality Review of Compound (Finance) published (PQR id 426); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/426" },
  },
  pendle: {
    defiscan: { rating: "Stage 0", note: "Pendle multisig holds upgrade rights; upgrades unprotected and frontend self-hosting requirement unmet.", provenance: "verified", url: "https://www.defiscan.info/protocols/pendle/ethereum" },
    llamarisk: { rating: "PT collateral assessment", note: "Pendle PT-as-collateral risk + Exponential-Lower-Bound pricing methodology.", provenance: "verified", url: "https://www.llamarisk.com/research/2025-02-14T17:10:51.000Z" },
    defipunkd: { rating: "Bronze tier", note: "5-dimension AI-consensus (Pendle V2); spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/pendle" },
    exponential: { rating: "B (pools)", note: "Pendle PT / yield pools cluster around a B pool rating. Pre-migration sample.", provenance: "sample" },
    defisafety: { note: "Process Quality Review published (PQR id 601); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/601" },
  },
  "balancer-v3": {
    defipunkd: { rating: "Bronze tier", note: "'Balancer V3' page; 5-dimension AI-consensus, 2 of 5 graded; preliminary. Spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/balancer" },
  },
  "balancer-v2": {
    defipunkd: { rating: "Wood tier (partial)", note: "Separate 'Balancer V2' page; only Verifiability graded, other dimensions unknown.", provenance: "sample", url: "https://defipunkd.com/protocol/balancer-v2" },
    exponential: { note: "Balancer V2 protocol page listed; pool grades not captured pre-migration.", provenance: "sample" },
    defisafety: { note: "Process Quality Review published (PQR id 568); a 100% figure appears in one source — treat as unconfirmed pending the live PQR.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/568" },
  },
  "rocket-pool": {
    llamarisk: { rating: "Collateral Risk Assessment", note: "Qualitative rETH assessment; suitable as minority collateral exposure.", provenance: "verified", url: "https://hackmd.io/@PrismaRisk/rETH" },
    defipunkd: { rating: "Bronze tier (preliminary)", note: "5-dimension AI-consensus, Phase-0 preliminary; spot-check pending.", provenance: "sample", url: "https://defipunkd.com/protocol/rocket-pool" },
    defisafety: { note: "Process Quality Review published (PQR id 581, ~2024); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/581" },
  },
  fluid: {
    blockanalitica: { rating: "Live dashboard", note: "Added to Sphere coverage in 2025; rates, liquidations, risk analytics.", provenance: "verified", url: "https://defi-sphere.com" },
    zyfai: { rating: "Good–Excellent", note: "Live per-pool grades; e.g. wstETH Excellent (5/5), WETH Good (3/5).", provenance: "verified", url: "https://risk.zyf.ai" },
    exponential: { note: "Fluid protocol page listed; pool grades not captured pre-migration.", provenance: "sample" },
  },
  euler: {
    zyfai: { rating: "Good–Excellent", note: "Euler Prime WETH Excellent (4/4); Euler Earn USDC Good (3/4, low TVL).", provenance: "verified", url: "https://risk.zyf.ai" },
    exponential: { note: "Euler (v2) protocol page listed; pool grades not captured pre-migration.", provenance: "sample" },
    defisafety: { note: "Process Quality Review of Euler V2 published (PQR id 607); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/607" },
    gauntlet: { rating: "Risk param recs", note: "Recurring Market Risk Parameter Recommendations on Euler governance (Euler Prime/Yield/Base): supply/borrow caps, IR curves; co-manages a USDC vault.", provenance: "verified", url: "https://forum.euler.finance/t/gauntlet-market-risk-parameter-recommendations-2025-03-19/1326" },
  },
  yearn: {
    philidor: { rating: "Core (≈7.5–7.9 / 10)", note: "Yearn v3 vaults; e.g. USDC yVault 7.50, Curve sUSD yVault 7.90.", provenance: "verified", url: "https://analytics.philidor.io" },
    zyfai: { rating: "Excellent (most vaults)", note: "Yearn mainnet USDT/WETH vaults graded live.", provenance: "verified", url: "https://risk.zyf.ai" },
    exponential: { note: "Yearn appeared in the A-rated tier yet a \"Watch out\" label also surfaced pre-migration — conflicting; pending re-verification.", provenance: "sample" },
    defisafety: { rating: "93% (PQR)", note: "Process Quality Review of Yearn V2.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/354" },
  },
  "morpho-vaults": {
    credora: { rating: "A+ to D", note: "Flagship per-vault credit product across MetaMorpho vaults; many blue-chip vaults A+.", provenance: "verified", url: "https://forum.morpho.org/t/credora-network-risk-ratings-on-morpho/1652" },
    curatorwatch: { rating: "Grade (0–100)", note: "MetaMorpho vaults graded on 9 requirements + 5-factor composite score.", provenance: "verified", url: "https://curatorwatch.com/docs" },
    philidor: { rating: "Prime (≈8.5 / 10)", note: "MetaMorpho vaults; e.g. Steakhouse Prime USDC 8.54.", provenance: "verified", url: "https://analytics.philidor.io" },
    zyfai: { rating: "Excellent (top vaults)", note: "Curated MetaMorpho vaults graded live; range Good–Excellent.", provenance: "verified", url: "https://risk.zyf.ai" },
    gauntlet: { rating: "Curated vaults", note: "Named MetaMorpho vaults — Gauntlet USDC Prime/Core/Frontier, WETH Prime, USDT Core, USD Alpha — across Prime/Core/Frontier risk bands.", provenance: "verified", url: "https://app.morpho.org" },
  },
  gearbox: {
    chaoslabs: { rating: "Risk partnership", note: "Risk monitoring & alerting platform plus recommendations: gauge APY rates, fees, per-collateral liquidation thresholds, leverage bounds.", provenance: "verified", url: "https://chaoslabs.xyz/posts/chaos-labs-partners-with-gearbox" },
  },
  "1inch": {
    defisafety: { note: "An early DeFi Safety review exists (PQR id 17); confirm it is current and read the score on the live page.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/17" },
  },
  "0x": {
    defisafety: { note: "Process Quality Review of 0x Protocol published (PQR id 131); verbatim score pending confirmation.", provenance: "sample", url: "https://www.defisafety.com/app/pqrs/131" },
  },
};

function buildCoverage(): Record<string, Record<string, Coverage>> {
  const out: Record<string, Record<string, Coverage>> = {};
  for (const p of PROTOCOLS) {
    out[p.id] = {};
    for (const f of FEEDS) {
      const fc = FEED_COVERAGE[f.id] ?? { covered: [], partial: [] };
      let status: CoverageStatus = "not-covered";
      if (fc.covered.includes(p.id)) status = "covered";
      else if (fc.partial.includes(p.id)) status = "partial";

      const r = RATINGS[p.id]?.[f.id];
      out[p.id][f.id] = {
        status,
        rating: r?.rating,
        note: r?.note ?? (status !== "not-covered" ? f.focus : undefined),
        url: r?.url ?? (status !== "not-covered" ? f.url : undefined),
        provenance: r?.provenance ?? "sample",
      };
    }
  }
  return out;
}

export const COVERAGE = buildCoverage();

export function coverageCount(protocolId: string): { covered: number; partial: number; total: number } {
  const row = COVERAGE[protocolId] ?? {};
  const vals = Object.values(row);
  return {
    covered: vals.filter((c) => c.status === "covered").length,
    partial: vals.filter((c) => c.status === "partial").length,
    total: vals.length,
  };
}
