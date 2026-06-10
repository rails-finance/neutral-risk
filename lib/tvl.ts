import snapshot from "@/data/tvl-snapshot.json";
import type { Protocol } from "@/lib/data/protocols";

const TVL: Record<string, number> = snapshot.tvl;

/** Summed USD TVL for a protocol across its DefiLlama slugs. */
export function protocolTvl(p: Protocol): number {
  return p.tvlSlugs.reduce((sum, slug) => sum + (TVL[slug] ?? 0), 0);
}

export const tvlFetchedAt = snapshot.fetchedAt;
export const tvlSource = snapshot.source;
