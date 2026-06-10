"use client";

import Link from "next/link";
import type { CoverageStatus } from "@/lib/data/coverage";
import { CATEGORY_COLOR } from "@/lib/data/protocols";
import { formatUsd } from "@/lib/format";
import { TrendingUpDown } from "lucide-react";
import { SortHeader, type MatrixRow, type MatrixFeed, type ColKey, type SortKey, type SortDir } from "@/components/coverage-list";

/** Bold-grammar matrix indicator: a sharp filled square for covered/partial; absent cells are left
 *  blank (no square) so the grid reads as "what's actually covered". */
function MatrixCell({ status, title }: { status: CoverageStatus; title?: string }) {
  if (status === "not-covered") return null;
  const cls = status === "covered" ? "bg-cov-covered" : "cov-hatch";
  return (
    <span className="inline-grid place-items-center" title={title}>
      <span className={`h-4 w-4 rounded-md ${cls}`} />
    </span>
  );
}

/**
 * Matrix view body — the full protocol × feed grid. Receives rows already filtered + sorted by
 * the parent (CoverageViews), plus the shared TVL/Feeds column visibility (one columns "eye" menu
 * drives both the list and the matrix). Lets you read down a feed's column to see what each feed
 * covers across the registry — the "oracle diversity" view. Absent cells are blank.
 */
export function MatrixView({
  rows,
  feeds,
  cols,
  sort,
  dir,
  onSort,
  tvlInfo,
}: {
  rows: MatrixRow[];
  feeds: MatrixFeed[];
  cols: Record<ColKey, boolean>;
  sort: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  /** TVL source/date line, shown as the info tooltip on the TVL column header. */
  tvlInfo: string;
}) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-rr-850">
       <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-rr-800 text-left">
              <SortHeader
                label="Protocol"
                sortKey="name"
                sort={sort}
                dir={dir}
                onSort={onSort}
                thClassName="sticky left-0 z-10 bg-rr-800 px-4 py-3 eyebrow text-rr-300"
              />
              {cols.tvl && (
                <SortHeader label="TVL" sortKey="tvl" sort={sort} dir={dir} onSort={onSort} thClassName="px-3 py-3 eyebrow text-rr-300" align="right" info={tvlInfo} />
              )}
              {cols.feeds && (
                <SortHeader label="Feeds" sortKey="coverage" sort={sort} dir={dir} onSort={onSort} thClassName="px-3 py-3 eyebrow text-rr-300" align="center" />
              )}
              {feeds.map((f) => (
                <th
                  key={f.id}
                  className="label px-3 py-3 text-center text-rr-400"
                  title={f.short}
                >
                  <span className="inline-block max-w-[64px] truncate align-bottom [writing-mode:horizontal-tb]">
                    {f.short}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-rr-700 bg-rr-850 transition-colors last:border-0 hover:bg-rr-800">
                <td className="sticky left-0 z-10 bg-inherit px-4 py-3">
                  <Link href={`/protocol/${r.id}`} className="group flex w-fit items-center gap-3">
                    {/* Category shown as a corner dot on the icon (matches the list view); the top
                        category filter is the colour legend, so no repeated text label here. */}
                    <span className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons/protocols/${r.icon}.png`}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-md bg-rr-800"
                      />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-rr-850"
                        style={{ background: CATEGORY_COLOR[r.category] }}
                        title={r.category}
                        aria-label={`${r.category} category`}
                        role="img"
                      />
                    </span>
                    <span>
                      <span className="block font-bold leading-tight group-hover:text-brand">
                        {r.name}
                        {r.versions && <span className="ml-1.5 text-xs font-normal text-rr-500">{r.versions}</span>}
                      </span>
                    </span>
                  </Link>
                </td>
                {cols.tvl && (
                  <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-sm font-semibold">
                    {r.tvlApplicable ? (
                      formatUsd(r.tvl)
                    ) : (
                      <span className="text-rr-500" title="TVL not applicable — volume metric">
                        vol·
                      </span>
                    )}
                  </td>
                )}
                {cols.feeds && (
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <span className="font-mono text-xs font-bold">
                      <span className="text-cov-covered">{r.covered}</span>
                      <span className="text-rr-500"> / </span>
                      <span className="text-cov-partial">{r.partial}</span>
                    </span>
                    {r.split && (
                      <span
                        className="ml-1.5 inline-flex align-middle text-rr-400"
                        title="Feeds differ on how fully they assess this protocol — some cover it fully, others only partially. Shown, not reconciled."
                      >
                        <TrendingUpDown className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </td>
                )}
                {feeds.map((f) => (
                  <td key={f.id} className="px-3 py-3 text-center">
                    <MatrixCell status={r.cells[f.id]} title={`${f.short}: ${r.cells[f.id]}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
       </div>
      </div>

      {/* Legend — uses `.label` (normal-case) to match the list view's legend; the coverage tables
          deliberately avoid the shouty uppercase eyebrow for their metadata/legends. */}
      <div className="label mt-5 flex flex-wrap items-center gap-4 text-rr-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cov-covered" /> Covered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="cov-hatch h-3 w-3 rounded" /> Partial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-rr-600" /> Not yet covered
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUpDown className="h-3.5 w-3.5 text-rr-400" /> Feeds differ
        </span>
        {cols.feeds && (
          <span className="ml-auto">Feeds column: covered / partial count</span>
        )}
      </div>
    </div>
  );
}
