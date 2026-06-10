import { PROTOCOLS, PROTOCOL_COUNT } from "@/lib/data/protocols";
import { FEEDS } from "@/lib/data/feeds";
import { coverageCount } from "@/lib/data/coverage";
import { coverageScannedAt } from "@/lib/scan";
import { formatScanStamp } from "@/lib/format";
import { SITE_STATUS, type StatusLevel } from "@/lib/status";

/** Dot/text colour per status level. operational→green, sample/degraded→amber, down→red.
 *  Uses the status (health) triad, not the coverage ramp — this reports the pipeline's own
 *  health, not a feed judgement. See lib/status.ts. */
const DOT: Record<StatusLevel, string> = {
  operational: "bg-status-ok",
  sample: "bg-status-warn",
  degraded: "bg-status-warn",
  down: "bg-status-down",
};
const TEXT: Record<StatusLevel, string> = {
  operational: "text-status-ok",
  sample: "text-status-warn",
  degraded: "text-status-warn",
  down: "text-status-down",
};

/**
 * Site-wide status content, rendered as the top row of the footer: data-pipeline status on the
 * left, registry-wide coverage counts on the right. Stats are derived from the committed data
 * modules (neutral facts — protocol/feed counts, matrix coverage), so it is correct on every page
 * without prop-drilling. Layout-only wrapper (container/border/padding) is supplied by the footer.
 */
export function StatusBar() {
  // "Protocols" (20, derived) is the lead count — the RFP's unit of scope. Each versioned
  // deployment (Aave V3/V4, …) is its own matrix row, so `deployments` (26) is the row count,
  // shown second — consistent with the "20 protocols across 26 deployments" framing used in the
  // methodology/about/FAQ copy. Deployments × feeds = the matrix cell count.
  const deployments = PROTOCOLS.length;
  const feeds = FEEDS.length;
  const cells = deployments * feeds;
  let covered = 0;
  let partial = 0;
  for (const p of PROTOCOLS) {
    const c = coverageCount(p.id);
    covered += c.covered;
    partial += c.partial;
  }

  const { level, label, detail } = SITE_STATUS;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5" title={detail}>
          <span className={`h-2 w-2 rounded-full ${DOT[level]}`} aria-hidden="true" />
          <span className={`label ${TEXT[level]}`}>{label}</span>
        </span>
        <span className="text-xs font-medium text-rr-500">
          Latest scan {formatScanStamp(coverageScannedAt)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <Stat value={PROTOCOL_COUNT} label="Protocols" />
        <Stat value={deployments} label="Deployments" />
        <Stat value={feeds} label="Feeds" />
        <Stat value={cells} label="Cells" />
        <Stat value={covered} label="Covered" accent="covered" />
        <Stat value={partial} label="Partial" accent="partial" />
      </div>
    </div>
  );
}

/** Compact inline stat: mono numeral + eyebrow label. */
function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: "covered" | "partial";
}) {
  const valueCls =
    accent === "covered" ? "text-cov-covered" : accent === "partial" ? "text-cov-partial" : "text-rr-50";
  return (
    <span className="flex items-center gap-1.5">
      <span className={`font-mono text-xs font-bold ${valueCls}`}>{value}</span>
      <span className="label text-rr-500">{label}</span>
    </span>
  );
}
