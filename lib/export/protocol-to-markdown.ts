// Serializes a protocol's aggregated, sourced facts to Markdown for the "Copy for LLM" export.
//
// Charter note (CHARTER.md §1/§2): this is PRESENTATION, not synthesis — it relays the same
// verbatim, provenance-tagged facts already on the page into a machine-ingestible surface. It
// produces no score, ranking, or reconciled verdict of our own, and it deliberately EXCLUDES the
// AI-review card (a no-live-model mockup) so a downstream LLM never reads a mockup as sourced
// output. The neutrality framing leads the document so it travels into the model's context.
//
// Pure data → string; nothing fetched (stays SSG/IPFS-publishable). Everything here is already in
// scope at build time on /protocol/[slug].

import type { Protocol } from "@/lib/data/protocols";
import { FEEDS, FEED_BY_ID } from "@/lib/data/feeds";
import { COVERAGE, coverageCount } from "@/lib/data/coverage";
import { protocolTvl } from "@/lib/tvl";
import { controlTimeline } from "@/lib/control-timeline";
import { protocolAudits } from "@/lib/data/audits";
import { formatUsd, formatScanStamp } from "@/lib/format";
import { coverageScannedAt } from "@/lib/scan";
import { provTag } from "./provenance-label";

const PREAMBLE =
  "> Aggregated verbatim from third-party DeFi risk feeds. Provenance tags are preserved on " +
  "every datum — `sample` marks an illustrative prototype placeholder pending provider " +
  "verification. This is NOT a Neutral Risk assessment, score, or ranking: feeds are shown " +
  "side by side and never reconciled into a single verdict.";

export function protocolToMarkdown(p: Protocol): string {
  const counts = coverageCount(p.id);
  const notCovered = counts.total - counts.covered - counts.partial;
  const tvl = protocolTvl(p);
  const timeline = controlTimeline(p.id);
  const audits = protocolAudits(p.id);

  const order = { covered: 0, partial: 1, "not-covered": 2 } as const;
  const sortedFeeds = [...FEEDS].sort(
    (a, b) => order[COVERAGE[p.id][a.id].status] - order[COVERAGE[p.id][b.id].status],
  );

  const out: string[] = [];

  out.push(`# ${p.name} — Neutral Risk aggregation`);
  out.push("");
  out.push(PREAMBLE);
  out.push("");
  out.push(`- **Category:** ${p.category}`);
  out.push(
    p.tvlApplicable
      ? `- **TVL:** ${formatUsd(tvl)} (DefiLlama)`
      : `- **TVL:** not applicable (volume-metric protocol)`,
  );
  out.push(
    `- **Feed coverage:** ${counts.covered} covered · ${counts.partial} partial · ${notCovered} not yet covered, of ${counts.total} feeds`,
  );
  out.push(`- **DefiLlama:** ${p.links.defillama}`);
  if (p.links.site) out.push(`- **Site:** ${p.links.site}`);
  out.push(`- **Snapshot:** coverage scan ${formatScanStamp(coverageScannedAt)} (UTC)`);
  if (p.notes) {
    out.push("");
    out.push(p.notes);
  }

  // Feed ratings — the core of the aggregation, verbatim with provenance + source.
  out.push("");
  out.push("## Feed ratings (verbatim)");
  const reporting = sortedFeeds.filter((f) => COVERAGE[p.id][f.id].status !== "not-covered");
  if (reporting.length === 0) {
    out.push("");
    out.push("_No feed in the registry reports on this protocol yet._");
  } else {
    for (const f of reporting) {
      const c = COVERAGE[p.id][f.id];
      const meta = FEED_BY_ID[f.id];
      out.push("");
      out.push(`### ${f.name} — ${c.status} (${meta.type})`);
      if (c.rating) out.push(`- **Rating:** "${c.rating}" ${provTag(c.provenance)}`);
      out.push(`- **How they assess it:** ${c.note ?? meta.focus}`);
      out.push(`- **Source:** ${c.url ?? meta.url}`);
    }
    const notReporting = sortedFeeds.filter(
      (f) => COVERAGE[p.id][f.id].status === "not-covered",
    );
    if (notReporting.length > 0) {
      out.push("");
      out.push(`_Not yet covered by: ${notReporting.map((f) => f.name).join(", ")}._`);
    }
  }

  // Governance & control facts — authoritative, provenance-tagged.
  if (p.governance.length > 0) {
    out.push("");
    out.push("## Governance & control facts");
    for (const g of p.governance) {
      const src = g.source ? ` (${g.source})` : "";
      out.push(`- **${g.label}:** ${g.value} ${provTag(g.provenance)}${src}`);
    }
  }

  // Control timeline — from chain state via Sieve.
  if (timeline.length > 0) {
    out.push("");
    out.push("## Control timeline (from chain state via Sieve)");
    for (const a of timeline) {
      const tx = a.txUrl ? ` (${a.txUrl})` : "";
      out.push(`- **${a.date}** — ${a.action} ${provTag(a.provenance)}: ${a.detail}${tx}`);
    }
  }

  // Incidents — sourced, verbatim.
  if (p.incidents && p.incidents.length > 0) {
    out.push("");
    out.push("## Incidents");
    for (const inc of p.incidents) {
      const src = inc.source ? ` (${inc.source})` : "";
      out.push(`- **${inc.date}** — ${inc.title} ${provTag(inc.provenance)}: ${inc.summary}${src}`);
    }
  }

  // Audits — representative public reviews, attributed.
  if (audits.length > 0) {
    out.push("");
    out.push("## Audits (representative, not exhaustive)");
    for (const a of audits) {
      const date = a.date ? ` (${a.date})` : "";
      const url = a.url ? ` (${a.url})` : "";
      out.push(`- **${a.auditor}**${date} — ${a.scope} ${provTag(a.provenance)}${url}`);
    }
  }

  out.push("");
  out.push("---");
  out.push(
    "_Exported from Neutral Risk — a verbatim aggregator of what third-party DeFi risk feeds " +
      "publish. Not a risk score, grade, or ranking of our own (Charter §1)._",
  );

  return out.join("\n");
}
