// Pulls live multisig threshold/owner counts for protocol-controlling Safes from the Safe
// Transaction Service into data/governance-snapshot.json.
// Usage: npm run refresh:governance
//
// Mirrors refresh:tvl exactly: live data is fetched off-line and written to a committed
// snapshot that the app reads at build time, so the site stays static/IPFS-publishable and
// the last snapshot still ships if the API is down. This keeps governance figures (multisig
// threshold + signer count) current without a runtime dependency.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = join(__dirname, "..", "data", "governance-snapshot.json");
const BASE = "https://safe-transaction-mainnet.safe.global/api/v1/safes";

const current = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const addresses = Object.keys(current.safes);

const safes = {};
for (const addr of addresses) {
  const prev = current.safes[addr];
  try {
    const res = await fetch(`${BASE}/${addr}/`);
    if (!res.ok) throw new Error(`Safe TS ${res.status}`);
    const data = await res.json();
    const owners = Array.isArray(data.owners) ? data.owners.length : prev.owners;
    safes[addr] = { ...prev, threshold: data.threshold ?? prev.threshold, owners };
    console.log(`  ${prev.label}: ${safes[addr].threshold}/${owners}`);
  } catch (e) {
    safes[addr] = prev;
    console.warn(`  ! ${prev.label} (${addr}): ${e.message}, kept previous value`);
  }
}

const out = { ...current, fetchedAt: new Date().toISOString(), safes };
writeFileSync(SNAPSHOT, JSON.stringify(out, null, 2) + "\n");
console.log(`Updated ${addresses.length} Safes → ${SNAPSHOT}`);
