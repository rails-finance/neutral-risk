// ─────────────────────────────────────────────────────────────────────────────
// AI INTELLIGENCE LAYER — FRONTEND MOCKUP ONLY (illustrative, not live)
//
// This module hardcodes *illustrative* AI output so the proposed AI layer can be shown
// in the UI for the grant pitch. There is NO live model call, NO data pipeline, NO scheduler
// here — the real integration is deferred until/if the grant lands. Everything below is a
// "preview" and is labelled as such in the UI.
//
// CHARTER NOTE (§1, binding — no composite scoring): the AI layer is an *explainer of facts
// already in the registry*, never a judge. It produces NO score, grade, rank, or severity.
// Changes are tagged with neutral category labels only. The data shape here mirrors what the
// eventual off-line script would emit, so it is drop-in replaceable later.
// ─────────────────────────────────────────────────────────────────────────────

import type { Protocol } from "./protocols";

/** Which on-page sourced fact an observation rests on (shown as a citation chip). */
export type CiteSource =
  | "governance"
  | "control timeline"
  | "incident"
  | "audits"
  | "coverage"
  | "tvl"
  | "price";

export interface AiObservation {
  text: string;
  cite: CiteSource;
}

/** Neutral category for a detected change — deliberately NOT a severity or score. */
export type AiChangeCategory =
  | "governance change"
  | "control action"
  | "TVL move"
  | "price move"
  | "incident";

export interface AiAlertUpdate {
  at: string; // illustrative relative time, e.g. "2h ago"
  note: string;
}

/** A "what changed" alert — the investigative pass (who/when/why/what + risk implications). */
export interface AiAlert {
  category: AiChangeCategory;
  freshness: string; // illustrative, e.g. "6h ago"
  status: "open" | "updated" | "resolved";
  title: string;
  who: string;
  when: string;
  why: string;
  what: string;
  /** Neutral, sourced implications — never a score or verdict. */
  implications: string;
  before?: string;
  after?: string;
  txUrl?: string;
  updates?: AiAlertUpdate[];
}

export interface AiAssessment {
  freshness: string; // illustrative, e.g. "2h ago"
  model: string; // illustrative label
  summary: string;
  observations: AiObservation[];
  /** Present only when a change was "detected" — drives the "What changed" subsection. */
  alert?: AiAlert;
}

const MODEL_LABEL = "Claude (preview)";

const etherscan = (tx: string) => `https://etherscan.io/tx/${tx}`;

// ── Bespoke, curated previews for a few flagship protocols ───────────────────────
const CURATED: Record<string, (ctx: PreviewCtx) => AiAssessment> = {
  aave: ({ reporting }) => ({
    freshness: "2h ago",
    model: MODEL_LABEL,
    summary:
      "Aave is a governance-controlled, upgradeable lending protocol and the most widely-covered " +
      "protocol in the registry. Its two notable events — the 2022 CRV bad-debt episode and the " +
      "April 2026 Kelp rsETH incident — were both market/collateral events contained by governance " +
      "and guardian action; the core protocol was not exploited.",
    observations: [
      { text: "Upgradeable, controlled by governance executors behind short/long timelocks.", cite: "governance" },
      { text: "Carried the largest exposure (~$196M) in the April 2026 rsETH exploit; the Guardian froze rsETH/wrsETH markets within the hour.", cite: "incident" },
      { text: `Broadest coverage in the registry — ${reporting} feeds report on Aave.`, cite: "coverage" },
    ],
    alert: {
      category: "governance change",
      freshness: "2h ago",
      status: "updated",
      title: "Admin owner rotation on the Aave v3 Pool proxy",
      who: "Aave Governance short executor → new Pool implementation",
      when: "2026-06-04 · block 22,481,003",
      why: "Scheduled implementation upgrade enacted through on-chain governance (AIP), after its timelock.",
      what: "The Pool proxy's implementation slot changed; risk parameters and asset configurations were unchanged.",
      implications:
        "An upgrade path was exercised through the normal governance timelock; no change to custody or " +
        "user-facing parameters was observed in this change. Verify against the linked transaction.",
      before: "impl 0xabc1…1234",
      after: "impl 0xdef5…5678",
      txUrl: etherscan("0x0000000000000000000000000000000000000000000000000000000000000000"),
      updates: [
        { at: "6h ago", note: "Implementation change detected on-chain via the control timeline." },
        { at: "2h ago", note: "Cross-checked against the governance forum proposal; details confirmed." },
      ],
    },
  }),

  curve: ({ reporting }) => ({
    freshness: "5h ago",
    model: MODEL_LABEL,
    summary:
      "Curve is a DAO-governed stablecoin/LST AMM. Its pools are immutable — the DAO governs " +
      "parameters and gauges, not pool logic. Its one major loss (July 2023) came from a Vyper " +
      "compiler reentrancy bug, not Curve's own code, and was largely recovered.",
    observations: [
      { text: "Pools are immutable; the DAO (veCRV) governs parameters and gauges only.", cite: "governance" },
      { text: "2023 losses traced to a Vyper compiler bug rather than Curve pool logic; ~70%+ recovered.", cite: "incident" },
      { text: `${reporting} risk feeds in the registry report on Curve.`, cite: "coverage" },
    ],
    alert: {
      category: "TVL move",
      freshness: "1d ago",
      status: "open",
      title: "Reported TVL down ~18% over 24h",
      who: "Aggregate on-chain liquidity (no single actor).",
      when: "Trailing 24h",
      why: "Net outflows concentrated in two crvUSD-related pools, coinciding with a broad market drawdown.",
      what: "Reported TVL moved from ~$1.88B to ~$1.54B.",
      implications:
        "A liquidity change of this size can affect swap depth and liquidation efficiency for protocols " +
        "that route through Curve; no contract change or incident is associated with the move. Figures are illustrative.",
      before: "$1.88B",
      after: "$1.54B",
      updates: [{ at: "1d ago", note: "TVL move crossed the alert threshold; flagged for review." }],
    },
  }),

  lido: ({ reporting }) => ({
    freshness: "3h ago",
    model: MODEL_LABEL,
    summary:
      "Lido is the largest ETH liquid-staking protocol; stETH is the most widely-used DeFi collateral. " +
      "It is DAO-upgradeable with an emergency multisig (GateSeal). No material change has been detected " +
      "in the current window — an example of the calm, no-alert state.",
    observations: [
      { text: "Upgradeable, controlled by the Lido DAO (Aragon) plus an agent and emergency GateSeal multisig.", cite: "governance" },
      { text: "stETH is the most widely-used DeFi collateral, making Lido a systemic dependency for lenders.", cite: "coverage" },
      { text: `${reporting} feeds report on Lido; no incidents are recorded in the registry.`, cite: "incident" },
    ],
    // no alert — demonstrates the steady-state card
  }),
};

interface PreviewCtx {
  reporting: number; // feeds covering + partial
  total: number;
}

/** Generic, data-grounded preview for protocols without a curated entry. */
function generic(p: Protocol, ctx: PreviewCtx): AiAssessment {
  const fam = p.family && p.family !== p.name ? ` in the ${p.family} family` : "";
  const gov = p.governance[0];
  const incidentNote =
    p.incidents && p.incidents.length > 0
      ? `${p.incidents.length} sourced incident${p.incidents.length > 1 ? "s" : ""} on record.`
      : "No incidents are recorded in the registry.";
  return {
    freshness: "4h ago",
    model: MODEL_LABEL,
    summary:
      `${p.name} is a ${p.category.toLowerCase()} protocol${fam}. ${ctx.reporting} of ${ctx.total} ` +
      `risk feeds in the registry report on it. ${incidentNote} No material change has been detected ` +
      `in the current window.`,
    observations: [
      { text: `${gov.label}: ${gov.value}`, cite: "governance" },
      { text: `${ctx.reporting} of ${ctx.total} feeds report on ${p.name}.`, cite: "coverage" },
      {
        text:
          p.incidents && p.incidents.length > 0
            ? `Most recent recorded event: ${p.incidents[0].title}.`
            : "No incidents recorded — an empty incident history is itself a signal.",
        cite: "incident",
      },
    ],
  };
}

/** The illustrative AI assessment for a protocol's page (mockup; not live). */
export function aiPreview(p: Protocol, ctx: PreviewCtx): AiAssessment {
  const curated = CURATED[p.id];
  return curated ? curated(ctx) : generic(p, ctx);
}

// ── Illustrative prices (ETH + native token, 24h change). Mock, not live. ────────
export interface PricePoint {
  symbol: string;
  usd: number;
  change24h: number;
}

const ETH_PRICE: PricePoint = { symbol: "ETH", usd: 3420.18, change24h: 1.2 };

const TOKEN_PRICES: Record<string, PricePoint> = {
  aave: { symbol: "AAVE", usd: 98.42, change24h: -3.1 },
  lido: { symbol: "LDO", usd: 0.92, change24h: 0.6 },
  curve: { symbol: "CRV", usd: 0.41, change24h: -5.4 },
  uniswap: { symbol: "UNI", usd: 7.85, change24h: 2.1 },
  morpho: { symbol: "MORPHO", usd: 1.74, change24h: 0.9 },
  "morpho-vaults": { symbol: "MORPHO", usd: 1.74, change24h: 0.9 },
  compound: { symbol: "COMP", usd: 44.1, change24h: -1.2 },
  pendle: { symbol: "PENDLE", usd: 4.62, change24h: 3.8 },
  gearbox: { symbol: "GEAR", usd: 0.0058, change24h: -2.4 },
  euler: { symbol: "EUL", usd: 8.9, change24h: 1.5 },
  balancer: { symbol: "BAL", usd: 1.13, change24h: -0.8 },
  yearn: { symbol: "YFI", usd: 6420, change24h: 0.4 },
  "rocket-pool": { symbol: "RPL", usd: 5.31, change24h: -1.9 },
  liquity: { symbol: "LQTY", usd: 0.94, change24h: 2.7 },
  fluid: { symbol: "FLUID", usd: 4.18, change24h: -3.6 },
  "1inch": { symbol: "1INCH", usd: 0.21, change24h: -1.1 },
  spark: { symbol: "SPK", usd: 0.067, change24h: 1.0 },
  "cow-swap": { symbol: "COW", usd: 0.38, change24h: 0.5 },
};

/** Illustrative ETH + (optional) native-token price for a protocol. Mock, not live. */
export function mockPrice(protocolId: string): { eth: PricePoint; token?: PricePoint } {
  return { eth: ETH_PRICE, token: TOKEN_PRICES[protocolId] };
}
