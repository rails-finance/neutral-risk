#!/usr/bin/env node
// Export Sieve-indexed control events -> data/control-timeline.json (committed snapshot).
//
// Keeps the web app static: Sieve produces events; this script materialises them into a
// committed JSON the app reads at build time. Run on a schedule on the indexer box, then
// commit the result. See sieve/README.md.
//
// Usage:  SIEVE_GRAPHQL_URL=http://localhost:4000 node scripts/export-control-timeline.mjs
//
// IMPORTANT: the GraphQL table/field names below are Sieve's auto-generated names (event ->
// table, camelCase -> snake_case). Align each query/mapping with the actual generated schema
// (open the GraphQL playground on :4000) before relying on output. Immutable protocols
// (liquity/morpho/uniswap) are seeded as verified facts and preserved as-is.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "control-timeline.json");
const GRAPHQL = process.env.SIEVE_GRAPHQL_URL ?? "http://localhost:4000";
const ETHERSCAN_TX = (hash) => `https://etherscan.io/tx/${hash}`;

// Protocols whose timeline is seeded (immutable) — never overwritten by the indexer.
const IMMUTABLE = new Set(["liquity", "morpho", "uniswap"]);

// Per-protocol: which Sieve event tables map to which human-readable control action.
// `table` = Sieve's generated GraphQL collection; tune to the real schema.
// SCOPE: single protocol (Aave v3) for the initial demo, matching sieve.toml.
// The other flagships were removed from the indexer config — reinstate their
// blocks from git history when we widen coverage.
const MAP = {
  aave: [
    { table: "aave_governance_v3_proposal_executed", action: "Governance proposal executed" },
    { table: "aave_payloads_controller_payload_executed", action: "Payload executed" },
    { table: "aave_v3_pool_upgraded", action: "Core Pool upgraded" },
    { table: "aave_acl_manager_role_granted", action: "Role granted" },
  ],
};

async function gql(query) {
  const res = await fetch(`${GRAPHQL}/graphql`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status} for ${GRAPHQL}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// Pull rows for one event table. Adjust field names (block_timestamp, transaction_hash,
// block_number) to the generated schema.
async function fetchEvents(table) {
  const data = await gql(`{
    ${table}(order_by: { block_number: desc }, limit: 25) {
      block_timestamp
      transaction_hash
      block_number
    }
  }`);
  return data?.[table] ?? [];
}

async function main() {
  const snapshot = JSON.parse(readFileSync(OUT, "utf8"));
  const timelines = { ...snapshot.timelines };

  for (const [protocol, sources] of Object.entries(MAP)) {
    if (IMMUTABLE.has(protocol)) continue;
    const actions = [];
    for (const { table, action } of sources) {
      let rows = [];
      try {
        rows = await fetchEvents(table);
      } catch (e) {
        console.warn(`skip ${table}: ${e.message}`);
        continue;
      }
      for (const r of rows) {
        actions.push({
          date: new Date(Number(r.block_timestamp) * 1000).toISOString().slice(0, 10),
          action,
          detail: `${action} at block ${r.block_number}.`,
          provenance: "onchain",
          txUrl: ETHERSCAN_TX(r.transaction_hash),
        });
      }
    }
    actions.sort((a, b) => (a.date < b.date ? 1 : -1));
    timelines[protocol] = actions;
  }

  const out = {
    fetchedAt: new Date().toISOString(),
    source: snapshot.source,
    timelines,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
