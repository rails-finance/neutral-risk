// Key collateral assets — the other half of DeFi risk. An asset failing (de-peg, exploit,
// loss of backing) propagates to EVERY protocol that accepts it as collateral, so asset
// risk is a contagion vector that protocol-level coverage alone misses.
//
// Same charter as protocols: we AGGREGATE what asset/collateral feeds publish, verbatim,
// and add NEUTRAL, verifiable facts (type, issuer, backing mechanism, and the asset ->
// protocol EXPOSURE map). We never produce a Rails-derived asset score. See CHARTER.md.
//
// Exposure mappings here are curated SAMPLES in this prototype (provenance "sample"); the
// design intent is that they are produced on-chain via the verification layer (Sieve) — the
// rsETH incident below shows why that map is the differentiator: the same asset sat behind
// ~$196M of Aave exposure but only ~$1M on Morpho's isolated markets.

import type { Provenance } from "./protocols";

export type AssetType = "LST" | "LRT" | "Stablecoin" | "Wrapped BTC";

export const ASSET_TYPES: AssetType[] = ["LRT", "LST", "Stablecoin", "Wrapped BTC"];

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  issuer: string;
  /** Peg / backing mechanism, stated as a fact and provenance-tagged. */
  backing: string;
  backingProvenance: Provenance;
  notes: string;
  /** Protocols (by registry id) that accept this asset as collateral — the exposure map. */
  usedBy: { protocolId: string; note?: string }[];
  links: { defillama?: string; site?: string };
  /** Optional incident flag, surfaced as a neutral, sourced fact (not a score). */
  incident?: { label: string; date: string; source: string };
}

const sky = "https://defillama.com";

export const ASSETS: Asset[] = [
  {
    id: "rseth",
    symbol: "rsETH",
    name: "Kelp Restaked ETH",
    type: "LRT",
    issuer: "Kelp DAO",
    backing: "Liquid restaking token; backed by ETH restaked via EigenLayer, bridged across 20+ networks.",
    backingProvenance: "sample",
    notes:
      "Subject of the largest DeFi exploit of 2026 — see incident. The cross-chain backing model is central to what happened.",
    usedBy: [
      { protocolId: "aave-v3", note: "~$196M exposure at incident; markets frozen" },
      { protocolId: "spark", note: "rsETH markets paused at incident" },
      { protocolId: "fluid", note: "positions paused at incident" },
      { protocolId: "morpho", note: "~$1M, isolated markets only" },
      { protocolId: "pendle" },
      { protocolId: "euler" },
    ],
    links: { defillama: `${sky}/protocol/kelp` },
    incident: {
      label: "$292M LayerZero bridge exploit — 116,500 unbacked rsETH minted (~18% of supply)",
      date: "2026-04-18",
      source: "https://www.coindesk.com/tech/2026/04/19/2026-s-biggest-crypto-exploit-kelp-dao-hit-for-usd292-million-with-wrapped-ether-stranded-across-20-chains",
    },
  },
  {
    id: "weeth",
    symbol: "weETH",
    name: "ether.fi Wrapped eETH",
    type: "LRT",
    issuer: "ether.fi",
    backing: "Wrapped liquid restaking token over eETH (ETH restaked via EigenLayer).",
    backingProvenance: "sample",
    notes: "One of the largest LRTs by adoption as DeFi collateral.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "morpho" },
      { protocolId: "pendle" },
      { protocolId: "euler" },
      { protocolId: "spark" },
      { protocolId: "balancer-v2" },
    ],
    links: { defillama: `${sky}/protocol/ether.fi` },
  },
  {
    id: "ezeth",
    symbol: "ezETH",
    name: "Renzo Restaked ETH",
    type: "LRT",
    issuer: "Renzo",
    backing: "Liquid restaking token; backed by ETH restaked via EigenLayer.",
    backingProvenance: "sample",
    notes: "Has previously experienced a sharp secondary-market de-peg under thin liquidity.",
    usedBy: [
      { protocolId: "morpho" },
      { protocolId: "pendle" },
      { protocolId: "balancer-v2" },
      { protocolId: "euler" },
    ],
    links: { defillama: `${sky}/protocol/renzo` },
  },
  {
    id: "wsteth",
    symbol: "wstETH",
    name: "Wrapped stETH",
    type: "LST",
    issuer: "Lido",
    backing: "Wrapped staked ETH; value-accruing wrapper over stETH (1 stETH ≈ 1 staked ETH).",
    backingProvenance: "verified",
    notes: "The most widely used LST collateral across DeFi.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "spark" },
      { protocolId: "morpho" },
      { protocolId: "compound-v3" },
      { protocolId: "fluid" },
      { protocolId: "euler" },
      { protocolId: "curve" },
      { protocolId: "balancer-v2" },
      { protocolId: "pendle" },
      { protocolId: "gearbox" },
    ],
    links: { defillama: `${sky}/protocol/lido`, site: "https://lido.fi" },
  },
  {
    id: "reth",
    symbol: "rETH",
    name: "Rocket Pool ETH",
    type: "LST",
    issuer: "Rocket Pool",
    backing: "Staked ETH via decentralized node operators; value-accruing.",
    backingProvenance: "verified",
    notes: "Decentralized-operator LST.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "morpho" },
      { protocolId: "curve" },
      { protocolId: "balancer-v2" },
      { protocolId: "euler" },
    ],
    links: { defillama: `${sky}/protocol/rocket-pool`, site: "https://rocketpool.net" },
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    type: "Stablecoin",
    issuer: "Circle",
    backing: "Fiat-backed (USD cash & short-dated Treasuries); centralized issuer with freeze capability.",
    backingProvenance: "verified",
    notes: "The dominant stablecoin collateral; briefly de-pegged during the March 2023 SVB event.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "spark" },
      { protocolId: "compound-v3" },
      { protocolId: "morpho" },
      { protocolId: "fluid" },
      { protocolId: "euler" },
      { protocolId: "curve" },
      { protocolId: "balancer-v2" },
      { protocolId: "pendle" },
      { protocolId: "gearbox" },
      { protocolId: "yearn" },
    ],
    links: { defillama: `${sky}/stablecoin/usd-coin` },
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether",
    type: "Stablecoin",
    issuer: "Tether",
    backing: "Fiat- and reserve-backed; centralized issuer. Reserve composition disclosed via attestations.",
    backingProvenance: "self-reported",
    notes: "Largest stablecoin by supply.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "curve" },
      { protocolId: "morpho" },
      { protocolId: "fluid" },
      { protocolId: "compound-v3" },
    ],
    links: { defillama: `${sky}/stablecoin/tether` },
  },
  {
    id: "usde",
    symbol: "USDe",
    name: "Ethena USDe",
    type: "Stablecoin",
    issuer: "Ethena",
    backing: "Synthetic dollar: delta-neutral staked-ETH collateral hedged with short perpetual futures.",
    backingProvenance: "self-reported",
    notes: "Backing depends on funding rates and exchange counterparties — a distinct risk profile from fiat-backed stables.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "morpho" },
      { protocolId: "pendle" },
      { protocolId: "curve" },
    ],
    links: { defillama: `${sky}/protocol/ethena` },
  },
  {
    id: "crvusd",
    symbol: "crvUSD",
    name: "Curve USD",
    type: "Stablecoin",
    issuer: "Curve",
    backing: "Overcollateralized CDP stablecoin with LLAMMA soft-liquidation.",
    backingProvenance: "verified",
    usedBy: [{ protocolId: "curve" }, { protocolId: "morpho" }],
    notes: "Native to Curve; soft-liquidation mechanism.",
    links: { defillama: `${sky}/protocol/curve-dex` },
  },
  {
    id: "gho",
    symbol: "GHO",
    name: "Aave GHO",
    type: "Stablecoin",
    issuer: "Aave",
    backing: "Overcollateralized, minted against Aave collateral; governance-set facilitators.",
    backingProvenance: "verified",
    usedBy: [{ protocolId: "aave-v3" }, { protocolId: "balancer-v2" }, { protocolId: "morpho" }],
    notes: "Native Aave stablecoin.",
    links: { defillama: `${sky}/protocol/gho` },
  },
  {
    id: "usds",
    symbol: "USDS",
    name: "Sky USDS",
    type: "Stablecoin",
    issuer: "Sky (Maker)",
    backing: "Sky stablecoin; backed by a mix of crypto and RWA collateral via Sky governance.",
    backingProvenance: "verified",
    usedBy: [{ protocolId: "spark" }, { protocolId: "aave-v3" }, { protocolId: "morpho" }, { protocolId: "curve" }],
    notes: "Successor to DAI under Sky.",
    links: { defillama: `${sky}/protocol/sky` },
  },
  {
    id: "wbtc",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    type: "Wrapped BTC",
    issuer: "BitGo",
    backing: "Custodial BTC held 1:1 by a merchant/custodian model.",
    backingProvenance: "self-reported",
    notes: "Custody model has drawn governance debate across lending markets.",
    usedBy: [
      { protocolId: "aave-v3" },
      { protocolId: "compound-v3" },
      { protocolId: "morpho" },
      { protocolId: "curve" },
      { protocolId: "fluid" },
      { protocolId: "euler" },
    ],
    links: { defillama: `${sky}/protocol/wbtc` },
  },
  {
    id: "cbbtc",
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    type: "Wrapped BTC",
    issuer: "Coinbase",
    backing: "Custodial BTC held by Coinbase; centralized issuer.",
    backingProvenance: "self-reported",
    usedBy: [{ protocolId: "aave-v3" }, { protocolId: "morpho" }, { protocolId: "spark" }, { protocolId: "fluid" }],
    notes: "Coinbase-custodied BTC wrapper.",
    links: { defillama: `${sky}/protocol/coinbase-wrapped-btc` },
  },
];

export const ASSET_BY_ID: Record<string, Asset> = Object.fromEntries(ASSETS.map((a) => [a.id, a]));

/** How many registry protocols are exposed to an asset as collateral. */
export function exposureCount(assetId: string): number {
  return ASSET_BY_ID[assetId]?.usedBy.length ?? 0;
}
