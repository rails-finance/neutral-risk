// The asset × feed coverage matrix — the asset-side mirror of coverage.ts.
//
// Only the asset/collateral-focused feeds are columns here; protocol-only feeds (e.g.
// DeFiScan's decentralization staging) do not assess assets and are excluded by design.
// Verbatim ratings are ILLUSTRATIVE SAMPLES pending provider verification, exactly as on
// the protocol side. Coverage *status* reflects publicly-observable presence and is
// provisional until the M2 verification pass.

import { FEED_BY_ID } from "./feeds";
import { ASSETS } from "./assets";
import type { CoverageStatus, Coverage } from "./coverage";

/** Feeds (by id) that assess assets/collateral, in column order. */
export const ASSET_FEED_IDS = [
  "llamarisk",
  "blockanalitica",
  "curatorwatch",
  "xerberus",
  "philidor",
  "pigi",
  "pharos",
  "defisaver",
] as const;

// Per-feed asset coverage. Anything not listed defaults to "not-covered".
const ASSET_FEED_COVERAGE: Record<string, { covered: string[]; partial: string[] }> = {
  llamarisk: {
    covered: ["wsteth", "reth", "rseth", "weeth", "usde", "crvusd"],
    partial: ["ezeth", "usds", "gho"],
  },
  blockanalitica: {
    covered: ["wsteth", "weeth", "usdc", "usdt", "wbtc"],
    partial: ["rseth", "cbbtc", "usde"],
  },
  curatorwatch: {
    covered: ["wsteth", "weeth", "usdc", "usde"],
    partial: ["rseth", "ezeth"],
  },
  xerberus: {
    covered: ["rseth", "weeth", "ezeth", "wsteth", "usde"],
    partial: ["reth", "cbbtc"],
  },
  philidor: {
    covered: ["wsteth", "weeth", "usde", "crvusd", "usdc"],
    partial: ["rseth", "ezeth", "reth"],
  },
  pigi: {
    covered: ["wsteth", "weeth", "usdc", "usdt"],
    partial: ["rseth", "usde", "wbtc"],
  },
  pharos: {
    covered: ["wsteth", "rseth"],
    partial: ["usde", "weeth", "ezeth"],
  },
  defisaver: {
    covered: ["wsteth", "wbtc", "usdc"],
    partial: ["reth", "weeth"],
  },
};

// Hand-curated SAMPLE verbatim notes for flagship asset cells (prototype illustration only).
const SAMPLE_ASSET_RATINGS: Record<string, Record<string, { rating: string; note: string }>> = {
  rseth: {
    llamarisk: { rating: "Collateral risk research", note: "Restaking-backing and cross-chain bridge risk analysis for rsETH." },
    xerberus: { rating: "Risk rating (sample)", note: "Asset-level risk signal across backing, liquidity, and concentration." },
    pharos: { rating: "Monitored", note: "Real-time alerting on peg and backing events." },
  },
  wsteth: {
    llamarisk: { rating: "Collateral risk research", note: "stETH peg, withdrawal queue, and operator-set analysis." },
    blockanalitica: { rating: "Live dashboard", note: "Collateral health and liquidation exposure across lending markets." },
  },
  usde: {
    llamarisk: { rating: "Collateral risk research", note: "Delta-neutral backing, funding-rate and custody/counterparty risk." },
  },
};

function buildAssetCoverage(): Record<string, Record<string, Coverage>> {
  const out: Record<string, Record<string, Coverage>> = {};
  for (const a of ASSETS) {
    out[a.id] = {};
    for (const fid of ASSET_FEED_IDS) {
      const fc = ASSET_FEED_COVERAGE[fid] ?? { covered: [], partial: [] };
      let status: CoverageStatus = "not-covered";
      if (fc.covered.includes(a.id)) status = "covered";
      else if (fc.partial.includes(a.id)) status = "partial";

      const sample = SAMPLE_ASSET_RATINGS[a.id]?.[fid];
      out[a.id][fid] = {
        status,
        rating: sample?.rating,
        note: sample?.note ?? (status !== "not-covered" ? FEED_BY_ID[fid].focus : undefined),
        url: status !== "not-covered" ? FEED_BY_ID[fid].url : undefined,
        provenance: "sample",
      };
    }
  }
  return out;
}

export const ASSET_COVERAGE = buildAssetCoverage();

export function assetCoverageCount(assetId: string): { covered: number; partial: number; total: number } {
  const row = ASSET_COVERAGE[assetId] ?? {};
  const vals = Object.values(row);
  return {
    covered: vals.filter((c) => c.status === "covered").length,
    partial: vals.filter((c) => c.status === "partial").length,
    total: vals.length,
  };
}
