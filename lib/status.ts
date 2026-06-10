// Operational status of the aggregator's OWN data pipeline — surfaced in the top status bar, the
// way a service status page reports its own health. This is deliberately NOT a judgement of any
// feed or protocol: per CHARTER.md §1 we never grade the things we aggregate. It reports whether
// the data WE ingested is live, fresh, degraded, or (today) illustrative sample data.
//
// In the prototype the coverage matrix is curated sample data, so the live status is "sample".
// When the M2 ingestion job lands, wire `SITE_STATUS` to real feed-fetch health — flip to
// "operational" when all feeds last fetched cleanly, "degraded" when some failed, "down" when the
// pipeline is broken. The colour vocabulary below already supports those states.

export type StatusLevel = "operational" | "degraded" | "down" | "sample";

export interface SiteStatus {
  level: StatusLevel;
  /** Short bar label, e.g. "All feeds live" / "Sample data". */
  label: string;
  /** One-line explanation, shown on hover. */
  detail: string;
}

export const SITE_STATUS: SiteStatus = {
  level: "sample",
  label: "Sample data",
  detail:
    "Prototype — feed ratings shown are illustrative samples pending provider verification.",
};
