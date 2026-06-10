import snapshot from "@/data/control-timeline.json";
import type { ControlAction } from "@/lib/data/protocols";

// Control timelines are rendered from a committed snapshot, not inline data, so the app stays
// static/SSG (IPFS-publishable) while the on-chain events are produced off-line by Sieve.
// Immutable protocols carry a seeded "verified" entry; upgradeable ones are filled from chain
// state via `npm run export:timeline`. See sieve/README.md.
const TIMELINES = snapshot.timelines as Record<string, ControlAction[]>;

/** On-chain control actions for a protocol (empty if none indexed / not applicable). */
export function controlTimeline(protocolId: string): ControlAction[] {
  return TIMELINES[protocolId] ?? [];
}

export const controlTimelineFetchedAt = snapshot.fetchedAt;
