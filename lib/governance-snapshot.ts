import snapshot from "@/data/governance-snapshot.json";

/**
 * Live-snapshotted multisig facts for a protocol-controlling Safe. Threshold/owners are
 * refreshed off-line by `npm run refresh:governance` (Safe Transaction Service) and read at
 * build time — the static-snapshot pattern, so the figure stays current without a runtime
 * fetch. `null` means not yet fetched. Backs the M1 wiring into the governance UI; mirrors
 * how lib/tvl.ts reads the TVL snapshot.
 */
export interface SafeSnapshot {
  protocol: string;
  label: string;
  threshold: number | null;
  owners: number | null;
}

const SAFES = snapshot.safes as Record<string, SafeSnapshot>;

/** Snapshotted multisig facts for a Safe, by address (case-insensitive). */
export function safeByAddress(address: string): (SafeSnapshot & { address: string }) | undefined {
  const hit = Object.entries(SAFES).find(([a]) => a.toLowerCase() === address.toLowerCase());
  return hit ? { address: hit[0], ...hit[1] } : undefined;
}

/** All snapshotted Safes controlling a given protocol id. */
export function safesForProtocol(protocolId: string): Array<SafeSnapshot & { address: string }> {
  return Object.entries(SAFES)
    .filter(([, s]) => s.protocol === protocolId)
    .map(([address, s]) => ({ address, ...s }));
}

export const governanceFetchedAt = snapshot.fetchedAt;
export const governanceSource = snapshot.source;
