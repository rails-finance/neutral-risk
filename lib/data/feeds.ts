// The risk-feed registry. The RFP registry is illustrative; this is our proposed final
// set with rationale. `machineReadable` drives the M2 automation story: feeds that expose
// structured/public output are automated; the rest are manually curated.

export type FeedType = "Rating" | "Dashboard" | "Monitoring" | "Research";

/**
 * Structural independence from the protocols/markets a feed rates. Surfaced so users can
 * weigh a rating against its funding/operating conflicts (see the COI analysis in source/).
 * Ordered loosely from least to most conflicted:
 *  - "independent"    non-profit / public good; no protocol money, no capital deployed
 *  - "commercial"     for-profit data vendor; not paid by, nor deploying capital in, rated protocols
 *  - "paid-mandate"   paid by the protocols/DAOs it assesses (issuer-pays dynamic)
 *  - "curates-vaults" also allocates depositor capital in markets it assesses (judge-and-player)
 */
export type Independence = "independent" | "commercial" | "paid-mandate" | "curates-vaults";

export interface Feed {
  id: string;
  name: string;
  /** Short column label for the matrix header. */
  short: string;
  focus: string;
  type: FeedType;
  /** Can we automate coverage ingestion (public/structured output)? */
  machineReadable: "yes" | "partial" | "no";
  /** Structural independence from the protocols/markets this feed rates. */
  independence: Independence;
  /** One-line justification for the independence classification. */
  independenceNote: string;
  url: string;
}

export const FEEDS: Feed[] = [
  {
    id: "defiscan",
    name: "DeFiScan",
    short: "DeFiScan",
    focus: "Decentralization maturity: who controls keys, upgrades, and admin powers. Stage 0–2 framework.",
    type: "Rating",
    machineReadable: "yes",
    independence: "independent",
    independenceNote: "Non-profit DeFi Collective; open-source and community-reviewed. No protocol mandates or vault curation.",
    url: "https://defiscan.info",
  },
  {
    id: "llamarisk",
    name: "LlamaRisk",
    short: "LlamaRisk",
    focus: "Protocol risk research and parameter recommendations; collateral and governance risk.",
    type: "Research",
    machineReadable: "partial",
    independence: "curates-vaults",
    independenceNote: "Paid Curve/Aave/Ethena risk mandates and operates IPOR vaults supplying crvUSD to LlamaLend markets it oversees — both judge-and-player and issuer-pays.",
    url: "https://www.llamarisk.com",
  },
  {
    id: "blockanalitica",
    name: "BlockAnalitica",
    short: "BlockAnalitica",
    focus: "Quantitative on-chain risk dashboards for lending markets: liquidations, collateral health, exposure.",
    type: "Dashboard",
    machineReadable: "partial",
    independence: "curates-vaults",
    independenceNote: "Major Morpho/Maker curator (Sphere by Block Analitica) allocating depositor capital in the same lending markets its dashboards assess.",
    url: "https://blockanalitica.com",
  },
  {
    id: "curatorwatch",
    name: "CuratorWatch",
    short: "CuratorWatch",
    focus: "Vault-level risk monitoring for Morpho curators: allocation risk and curator behavior.",
    type: "Dashboard",
    machineReadable: "no",
    independence: "independent",
    independenceNote: "Independent watchdog monitoring Morpho curators; not paid by, nor curating, the vaults it tracks.",
    url: "https://curatorwatch.com",
  },
  {
    id: "defipunkd",
    name: "DeFiPunk'd",
    short: "DeFiPunk'd",
    focus: "Multi-dimension registry: Control, Exit, Autonomy, Open Access, Verifiability via LLM consensus.",
    type: "Rating",
    machineReadable: "no",
    independence: "independent",
    independenceNote: "Community-style registry using LLM-consensus scoring; no public team, funding, or revenue model disclosed — independent as far as can be determined, but unverifiable.",
    url: "https://defipunkd.com",
  },
  // NOTE: "Pharos" removed 2026-06-07 — it is an ASSET-side feed (stablecoin peg/backing/freeze
  // monitoring across 360+ stablecoins), with zero protocol coverage in this matrix. Its entry is
  // retained in asset-coverage.ts to back the future asset-risk milestone, where it fits cleanly.
  // NOTE: "DeFi Sphere" removed 2026-06-04 — it is "Sphere by Block Analitica", the same
  // provider, with identical coverage. Listing it separately double-counted one feed. Block
  // Analitica's entry carries that coverage (incl. the Sphere app).
  {
    id: "credora",
    name: "Credora",
    short: "Credora",
    focus: "Institutional-grade credit-risk ratings for DeFi protocols and borrowers. Credora by RedStone; GraphQL API + on-chain attestations (EAS).",
    type: "Rating",
    machineReadable: "yes",
    independence: "paid-mandate",
    independenceNote: "Credora by RedStone: ratings distributed via RedStone's commercial oracle and deployed on Morpho/Spark vaults — issuer/venue-adjacent funding.",
    url: "https://www.credora.network",
  },
  {
    id: "xerberus",
    name: "Xerberus",
    short: "Xerberus",
    focus: "Independent risk rating for DeFi vaults; 300+ subscores across 85+ mechanisms. Open-source.",
    type: "Rating",
    machineReadable: "yes",
    independence: "commercial",
    independenceNote: "Investor- and token-funded (Cardano Catalyst + private rounds); publicly refuses payment from the issuers/protocols it rates, and curates no vaults — the strongest independence stance in the commercial tier.",
    url: "https://www.xerberus.io",
  },
  {
    id: "philidor",
    name: "Philidor Analytics",
    short: "Philidor",
    focus: "Deterministic vault risk scoring across 700+ vaults: asset quality, code maturity, governance. Open methodology (public API, CLI, MCP server).",
    type: "Rating",
    machineReadable: "yes",
    independence: "commercial",
    independenceNote: "For-profit vendor with open, deterministic methodology (public API/CLI/MCP); not paid by, nor curating, rated vaults.",
    url: "https://philidor.io",
  },
  {
    id: "pigi",
    name: "pigi.finance",
    short: "pigi",
    focus: "Vault analytics and risk-adjusted yield across 50+ protocols; exploits, concentration, risk-adjusted APY. Paid structured API.",
    type: "Dashboard",
    machineReadable: "yes",
    independence: "commercial",
    independenceNote: "For-profit analytics vendor (paid API); not paid by, nor curating, the protocols it tracks.",
    url: "https://pigi.finance",
  },
  // NOTE: "RiskLayer" removed 2026-06-04 — pre-launch EigenLayer AVS (Chainrisk Labs) with no
  // live public Proof-of-Risk feed yet. Nothing to aggregate; revisit if/when it ships.
  {
    id: "defisaver",
    name: "DeFi Saver",
    short: "DeFi Saver",
    // Tooling/monitoring entry, not a rating feed: a position-management app whose
    // loan-health / safety-ratio data is risk-relevant but not a published third-party rating.
    focus: "Position-management tooling: live loan-health / safety-ratio tracking and automated liquidation protection for leveraged positions.",
    type: "Monitoring",
    machineReadable: "no",
    independence: "commercial",
    independenceNote: "Position-management tooling earning execution fees on user activity, not a rater — profits from usage, not from scores.",
    url: "https://defisaver.com",
  },
  {
    id: "zyfai",
    name: "Zyfai Risk",
    short: "Zyfai",
    focus: "Real-time risk scores for DeFi liquidity pools: risk metrics, TVL, APY, security grades.",
    type: "Dashboard",
    machineReadable: "partial",
    independence: "curates-vaults",
    independenceNote: "Risk dashboard is secondary to its core yield agent, which deploys user capital into the same whitelisted protocols it scores (10% performance fee) — judge-and-player. EF-incubated; ZFI token.",
    url: "https://zyf.ai",
  },
  // Added 2026-06-10 from the EF "OpenRisk" POC reference (it lists both as provider columns).
  // Coverage cells still default to not-covered in coverage.ts until per-protocol coverage is
  // verified — these registry entries are charter-safe on their own (not-covered is honest).
  {
    id: "anticapture",
    name: "Anticapture",
    short: "Anticapture",
    focus: "DAO governance-capture risk: delegate/voting-power concentration, cost-to-attack vs. treasury value, and proposal/power-shift monitoring across major DAOs. Open-source.",
    type: "Research",
    machineReadable: "partial",
    independence: "paid-mandate",
    independenceNote: "Open-source governance-security framework, but built by Blockful — a paid governance service provider to DAOs it assesses (e.g. ENS DAO) — an issuer-pays dynamic in the governance space it covers.",
    url: "https://anticapture.com",
  },
  {
    id: "exponential",
    name: "Exponential DeFi",
    short: "Exponential",
    focus: "Risk ratings (A–F) decomposed into protocol, asset, chain, and pool risk across DeFi yield pools. Open whitepaper methodology. (Standalone product migrated into YO Protocol in 2026 — ratings shown are pre-migration samples.)",
    type: "Rating",
    machineReadable: "partial",
    independence: "curates-vaults",
    independenceNote: "Investment platform (Paradigm-led $14M raise) that allocates user capital into the same pools it rates — judge-and-player; earns on deployed capital rather than issuer fees.",
    url: "https://exponential.fi",
  },
  // Added 2026-06-10 — these appear in the EF "OpenRisk" POC registry and each brings a methodology
  // none of the feeds above use (process-quality review; agent-based economic simulation; parameter
  // automation). Coverage cells still default to not-covered in coverage.ts until coverage is verified.
  {
    id: "defisafety",
    name: "DeFi Safety",
    short: "DeFi Safety",
    focus: "Process Quality Reviews (PQR): documentation, testing, audits, and admin-key practices scored 0–100. Transparency-of-process, not market risk.",
    type: "Rating",
    machineReadable: "partial",
    independence: "independent",
    independenceNote: "Independent public-good reviewer; process-quality scores are openly published, not paid for by the protocols reviewed, and it deploys no capital in them.",
    url: "https://defisafety.com",
  },
  {
    id: "gauntlet",
    name: "Gauntlet",
    short: "Gauntlet",
    focus: "Agent-based economic simulation: insolvency prevention, parameter optimization, and risk-scenario analysis for lending markets.",
    type: "Research",
    machineReadable: "partial",
    independence: "paid-mandate",
    independenceNote: "Holds paid risk-management mandates from the DAOs it assesses (Aave, Compound, and others retain Gauntlet for parameter recommendations) — issuer-pays.",
    url: "https://www.gauntlet.xyz",
  },
  {
    id: "chaoslabs",
    name: "Chaos Labs",
    short: "Chaos Labs",
    focus: "Edge risk oracles and economic-risk dashboards: real-time parameter automation and scenario stress for lending markets (active on Aave, GMX, Pendle).",
    type: "Dashboard",
    machineReadable: "partial",
    independence: "paid-mandate",
    independenceNote: "Paid risk-management and parameter-automation mandates from the protocols it assesses (Aave, GMX, Pendle, and others) — issuer-pays, the same dynamic as Gauntlet.",
    url: "https://chaoslabs.xyz",
  },
];

export const FEED_BY_ID: Record<string, Feed> = Object.fromEntries(FEEDS.map((f) => [f.id, f]));
