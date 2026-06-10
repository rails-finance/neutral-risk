import { PROTOCOLS } from "@/lib/data/protocols";
import { FEEDS } from "@/lib/data/feeds";
import { COVERAGE, coverageCount } from "@/lib/data/coverage";
import { coverageDivergence } from "@/lib/data/analytics";
import { protocolTvl, tvlFetchedAt } from "@/lib/tvl";
import { formatDate } from "@/lib/format";
import { type MatrixRow, type MatrixFeed } from "@/components/coverage-list";
import { CoverageViews } from "@/components/coverage-views";
import { buildExploreData } from "@/lib/explore-data";

export default function HomePage() {
  const feeds: MatrixFeed[] = FEEDS.map((f) => ({ id: f.id, short: f.short }));

  const rows: MatrixRow[] = PROTOCOLS.map((p) => {
    const cells: Record<string, string> = {};
    for (const f of FEEDS) cells[f.id] = COVERAGE[p.id][f.id].status;
    const c = coverageCount(p.id);
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      family: p.family,
      versions: p.versions,
      icon: p.icon,
      tvl: protocolTvl(p),
      tvlApplicable: p.tvlApplicable,
      cells: cells as MatrixRow["cells"],
      covered: c.covered,
      partial: c.partial,
      split: coverageDivergence(p.id).split,
    };
  });

  // Registry-wide median of "feeds reporting" (covered + partial). A stable neutral fact used by
  // the list to flag protocols the feed ecosystem watches less than the typical protocol — a
  // coverage observation, never a risk judgement (CHARTER.md §1).
  const reporting = rows.map((r) => r.covered + r.partial).sort((a, b) => a - b);
  const mid = Math.floor(reporting.length / 2);
  const medianReporting =
    reporting.length % 2 ? reporting[mid] : (reporting[mid - 1] + reporting[mid]) / 2;

  return (
    <div>
      {/* Title + registry stats now live in the global header strapline and top status bar
          (app/layout.tsx, components/status-bar.tsx). The page keeps an sr-only h1 so it still
          has a single document heading for accessibility/SEO without visual duplication. */}
      <h1 className="sr-only">Aggregated DeFi risk intelligence — coverage browser</h1>

      <CoverageViews
        rows={rows}
        feeds={feeds}
        medianReporting={medianReporting}
        exploreData={buildExploreData()}
        tvlUpdated={formatDate(tvlFetchedAt)}
      />
    </div>
  );
}
