// Neutral, fact-only analytics derived from the coverage matrix. No risk judgement —
// these measure *coverage*, not risk (see CHARTER.md).

import { FEEDS, FEED_BY_ID, type FeedType } from "./feeds";
import { COVERAGE } from "./coverage";

const TYPES: FeedType[] = ["Rating", "Dashboard", "Monitoring", "Research"];

/** How many feeds report on a protocol, and the spread of methodology lenses. */
export function coverageSpread(protocolId: string) {
  const row = COVERAGE[protocolId] ?? {};
  let covered = 0;
  let partial = 0;
  const byType: Record<FeedType, { covered: number; partial: number }> = {
    Rating: { covered: 0, partial: 0 },
    Dashboard: { covered: 0, partial: 0 },
    Monitoring: { covered: 0, partial: 0 },
    Research: { covered: 0, partial: 0 },
  };
  for (const f of FEEDS) {
    const s = row[f.id]?.status;
    const t = FEED_BY_ID[f.id].type;
    if (s === "covered") {
      covered++;
      byType[t].covered++;
    } else if (s === "partial") {
      partial++;
      byType[t].partial++;
    }
  }
  const reporting = covered + partial;
  // Fact-only "spread": share of reporting feeds that can only partially assess. High share
  // means feeds vary in how fully they cover it — a neutral observation, not a verdict.
  const partialShare = reporting ? partial / reporting : 0;
  const lenses = TYPES.filter((t) => byType[t].covered + byType[t].partial > 0);
  return { covered, partial, reporting, partialShare, byType, lensCount: lenses.length, lenses, total: FEEDS.length };
}

/**
 * Coverage divergence — where the reporting feeds DISAGREE on how fully they can assess a
 * protocol (some "covered", some only "partial"). We surface the disagreement; we never
 * reconcile it into a single verdict (that would be composite scoring). Neutral by
 * construction: derived from objective coverage statuses, not from reading ratings.
 */
export function coverageDivergence(protocolId: string) {
  const row = COVERAGE[protocolId] ?? {};
  let covered = 0;
  let partial = 0;
  for (const f of FEEDS) {
    const s = row[f.id]?.status;
    if (s === "covered") covered++;
    else if (s === "partial") partial++;
  }
  const reporting = covered + partial;
  const minority = Math.min(covered, partial);
  const minorityShare = reporting ? minority / reporting : 0;
  // "Split" only when both camps exist and the smaller one is non-trivial (≥ ~1/3).
  const split = covered > 0 && partial > 0 && minorityShare >= 0.33;
  return { covered, partial, reporting, minorityShare, split };
}
