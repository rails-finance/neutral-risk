// Pulls live TVL for the seed protocols from DefiLlama into data/tvl-snapshot.json.
// Usage: npm run refresh:tvl
//
// In production this runs on a schedule. The app reads the committed snapshot so the
// site renders instantly and deterministically, with this script keeping it fresh.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = join(__dirname, "..", "data", "tvl-snapshot.json");

const current = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const slugs = Object.keys(current.tvl);

const res = await fetch("https://api.llama.fi/protocols");
if (!res.ok) throw new Error(`DefiLlama ${res.status}`);
const all = await res.json();

const bySlug = new Map();
for (const p of all) {
  const s = (p.slug || "").toLowerCase();
  if (s) bySlug.set(s, p);
}

const tvl = {};
for (const slug of slugs) {
  const p = bySlug.get(slug);
  tvl[slug] = p ? Math.round(p.tvl || 0) : current.tvl[slug];
  if (!p) console.warn(`  ! ${slug}: not found on DefiLlama, kept previous value`);
}

const out = { ...current, fetchedAt: new Date().toISOString(), tvl };
writeFileSync(SNAPSHOT, JSON.stringify(out, null, 2) + "\n");
console.log(`Updated ${slugs.length} protocols → ${SNAPSHOT}`);
