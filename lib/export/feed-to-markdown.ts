// Serializes a feed's profile + its verbatim protocol ratings to Markdown for "Copy for LLM".
//
// Charter note (CHARTER.md §1/§2): presentation, not synthesis. It relays this third-party feed's
// own published positions (verbatim, provenance-tagged) plus the neutral independence disclosure —
// never our judgement of the feed. The neutrality framing leads the document.
//
// Pure data → string; nothing fetched. Everything is in scope at build time on /feed/[slug].

import type { Feed } from "@/lib/data/feeds";
import { PROTOCOLS } from "@/lib/data/protocols";
import { COVERAGE } from "@/lib/data/coverage";
import { formatScanStamp } from "@/lib/format";
import { coverageScannedAt } from "@/lib/scan";
import { provTag } from "./provenance-label";

const PREAMBLE =
  "> A profile of a third-party DeFi risk feed and the protocols it covers, with ratings shown " +
  "verbatim and provenance preserved (`sample` = illustrative prototype placeholder). The " +
  "independence note is a neutral disclosure of the feed's relationship to what it rates — not a " +
  "Neutral Risk judgement of the feed, and not a risk score of our own.";

const INGESTION = { yes: "Automated", partial: "Partial", no: "Manual" } as const;

export function feedToMarkdown(f: Feed): string {
  const order = { covered: 0, partial: 1, "not-covered": 2 } as const;
  const protocols = PROTOCOLS.map((p) => ({ p, c: COVERAGE[p.id][f.id] }))
    .filter((x) => x.c.status !== "not-covered")
    .sort((a, b) => order[a.c.status] - order[b.c.status]);

  const covered = protocols.filter((x) => x.c.status === "covered").length;
  const partial = protocols.filter((x) => x.c.status === "partial").length;

  const out: string[] = [];

  out.push(`# ${f.name} — Neutral Risk feed profile`);
  out.push("");
  out.push(PREAMBLE);
  out.push("");
  out.push(`- **Type:** ${f.type}`);
  out.push(`- **Ingestion:** ${INGESTION[f.machineReadable]}`);
  out.push(`- **Independence:** ${f.independence} — ${f.independenceNote}`);
  out.push(`- **Coverage:** ${covered} covered · ${partial} partial`);
  out.push(`- **Source:** ${f.url}`);
  out.push(`- **Snapshot:** coverage scan ${formatScanStamp(coverageScannedAt)} (UTC)`);
  out.push("");
  out.push(f.focus);

  out.push("");
  out.push("## Protocols covered (verbatim ratings)");
  if (protocols.length === 0) {
    out.push("");
    out.push("_No protocols covered yet._");
  } else {
    for (const { p, c } of protocols) {
      const rating = c.rating ? `: "${c.rating}" ${provTag(c.provenance)}` : "";
      out.push(`- **${p.name}** — ${c.status}${rating}`);
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
