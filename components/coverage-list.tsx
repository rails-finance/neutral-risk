"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_COLOR, type Category } from "@/lib/data/protocols";
import type { CoverageStatus } from "@/lib/data/coverage";
import { CoverageDot } from "@/components/coverage-cell";
import { formatUsd } from "@/lib/format";
import { ArrowDown, ArrowDownFromLine, ArrowUp, ChevronsUpDown, Info, TrendingUpDown } from "lucide-react";

export interface MatrixRow {
  id: string;
  name: string;
  category: Category;
  family?: string;
  versions?: string;
  icon: string;
  tvl: number;
  tvlApplicable: boolean;
  cells: Record<string, CoverageStatus>;
  covered: number;
  partial: number;
  split?: boolean;
}

export interface MatrixFeed {
  id: string;
  short: string;
}

/** Optional metadata columns shared by the list + matrix views, toggled together from the single
 *  columns ("eye") menu in the shared controls (CoverageViews). */
export type ColKey = "tvl" | "feeds";

/** Neutral, charter-explicit explanation of the "fewer feeds than median" indicator. Shown on hover
 *  (legend item + in-row indicator) rather than as standing body text, so it stays available without
 *  cluttering the table. Worded to make the coverage-not-risk distinction (CHARTER §1) explicit. */
const THIN_NOTE =
  "“Fewer feeds than median” counts how many risk feeds report on a protocol against the registry median — a neutral coverage observation, not a risk assessment. We measure coverage, never risk.";

/** Sort state, shared by the list + matrix. The sort lives on the column headers now, so both
 *  tables drive the same parent state (CoverageViews) and stay in lockstep. */
export type SortKey = "tvl" | "name" | "coverage";
export type SortDir = "asc" | "desc";

/**
 * A sortable column header. Renders its own <th> (pass full classes via `thClassName`) wrapping a
 * button: click to sort by `sortKey`, click again to flip direction. Shows a direction arrow when
 * active and a faint up/down hint on hover when not — the standard sortable-table affordance.
 */
export function SortHeader({
  label,
  sortKey,
  sort,
  dir,
  onSort,
  thClassName = "",
  align = "left",
  info,
}: {
  label: string;
  sortKey: SortKey;
  sort: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  thClassName?: string;
  align?: "left" | "right" | "center";
  /** Optional info-icon tooltip rendered next to the label (e.g. the TVL source/date). Clicking it
   *  doesn't sort. */
  info?: string;
}) {
  const active = sort === sortKey;
  const justify = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <th className={thClassName}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className={`group/sort inline-flex w-full cursor-pointer items-center gap-1 ${justify} transition-colors hover:text-rr-50 ${
          active ? "text-rr-100" : ""
        }`}
      >
        <span>{label}</span>
        {info && (
          <span
            title={info}
            aria-label={info}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex cursor-help text-rr-500 transition-colors hover:text-rr-200"
          >
            <Info className="h-3.5 w-3.5" />
          </span>
        )}
        {active ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover/sort:opacity-40" />
        )}
      </button>
    </th>
  );
}

/**
 * List view body. Receives rows already filtered + sorted by the parent (CoverageViews); owns only
 * its own expand/collapse state. Charter-safe: the "fewer feeds than median" note is a neutral
 * coverage observation (feeds-reporting count vs. registry median), never a risk judgement.
 */
export function CoverageListBody({
  rows,
  feeds,
  medianReporting,
  cols,
  sort,
  dir,
  onSort,
  tvlInfo,
}: {
  rows: MatrixRow[];
  feeds: MatrixFeed[];
  medianReporting: number;
  cols: Record<ColKey, boolean>;
  sort: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  /** TVL source/date line, shown as the info tooltip on the TVL column header. */
  tvlInfo: string;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const total = feeds.length;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-rr-850">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="label bg-rr-800 text-left text-rr-300">
              <SortHeader label="Protocol" sortKey="name" sort={sort} dir={dir} onSort={onSort} thClassName="py-3 pl-4 pr-3" />
              {cols.tvl && (
                <SortHeader label="TVL" sortKey="tvl" sort={sort} dir={dir} onSort={onSort} thClassName="w-[15%] py-3 pr-3" align="right" info={tvlInfo} />
              )}
              <SortHeader label="Coverage" sortKey="coverage" sort={sort} dir={dir} onSort={onSort} thClassName="w-[26%] py-3 pr-4" />
              {cols.feeds && <th className="w-[20%] py-3 pr-4">Feeds</th>}
              <th className="w-9 py-3 pr-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const reporting = r.covered + r.partial;
              return (
                <FragmentRow
                  key={r.id}
                  r={r}
                  index={i}
                  feeds={feeds}
                  total={total}
                  reporting={reporting}
                  thin={reporting < medianReporting}
                  cols={cols}
                  isOpen={open.has(r.id)}
                  panelId={`feeds-${r.id}`}
                  onToggle={() => toggle(r.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend + neutral note */}
      <div className="label mt-5 flex flex-wrap items-center gap-4 text-rr-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-cov-covered" /> Covered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="cov-hatch h-3 w-3 rounded" /> Partial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rr-700/60" /> Not yet covered
        </span>
        <span className="flex items-center gap-1.5">
          <TrendingUpDown className="h-3.5 w-3.5 text-rr-400" /> Feeds differ
        </span>
        <span className="flex cursor-help items-center gap-1.5" title={THIN_NOTE}>
          <ArrowDownFromLine className="h-3 w-3 text-rr-400" /> Fewer feeds than median
        </span>
        <Link href="/methodology" className="ml-auto font-semibold text-brand hover:underline">
          How we compute coverage →
        </Link>
      </div>
    </div>
  );
}

function FragmentRow({
  r,
  index,
  feeds,
  total,
  reporting,
  thin,
  cols,
  isOpen,
  panelId,
  onToggle,
}: {
  r: MatrixRow;
  index: number;
  feeds: MatrixFeed[];
  total: number;
  reporting: number;
  thin: boolean;
  cols: Record<ColKey, boolean>;
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  const absent = total - reporting;
  // protocol + coverage + expand are always shown; TVL/Feeds are optional.
  const colSpan = 3 + (cols.tvl ? 1 : 0) + (cols.feeds ? 1 : 0);
  return (
    <>
      <tr className="border-b border-rr-700 transition-colors last:border-0 hover:bg-rr-800">
        <td className="py-3 pl-4 pr-3 align-middle">
          <Link
            href={`/protocol/${r.id}`}
            className="group flex w-fit items-center gap-3"
          >
            {/* Category is signalled by the colour dot on the icon's bottom-right corner (the
                top category filter is the colour legend) — no repeated text label. The name lives
                in a `title` + `aria-label` so the dot stays decodable and accessible. */}
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
            <span className="min-w-0">
              <span className="block truncate font-bold leading-tight group-hover:text-brand">
                {r.name}
                {r.versions && <span className="ml-1.5 text-xs font-normal text-rr-500">{r.versions}</span>}
              </span>
            </span>
          </Link>
        </td>
        {cols.tvl && (
          <td className="whitespace-nowrap py-3 pr-3 text-right align-middle font-mono text-sm font-semibold">
            {r.tvlApplicable ? (
              formatUsd(r.tvl)
            ) : (
              <span className="text-rr-500" title="TVL not applicable — volume metric">
                vol·
              </span>
            )}
          </td>
        )}
        <td className="py-3 pr-4 align-middle">
          <CoverageBar covered={r.covered} partial={r.partial} total={total} name={r.name} flipDown={index < 2} />
        </td>
        {cols.feeds && (
          <td className="py-3 pr-4 align-middle">
            <span className="font-mono text-xs font-bold">
              <span className="text-cov-covered">{r.covered}</span>
              <span className="text-rr-500"> / </span>
              <span className="text-cov-partial">{r.partial}</span>
              <span className="text-rr-500"> of {total}</span>
            </span>
            {r.split && (
              <span
                className="ml-1.5 inline-flex align-middle text-rr-400"
                title="Feeds differ on how fully they assess this protocol — some cover it fully, others only partially. Shown, not reconciled."
              >
                <TrendingUpDown className="h-3.5 w-3.5" />
              </span>
            )}
            {thin && (
              <span
                className="ml-1.5 inline-flex cursor-help align-middle text-rr-400"
                title={THIN_NOTE}
                aria-label="Fewer feeds than median"
              >
                <ArrowDownFromLine className="h-3 w-3" />
              </span>
            )}
          </td>
        )}
        <td className="py-3 pr-3 text-center align-middle">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${isOpen ? "Hide" : "Show"} feed-by-feed coverage for ${r.name}`}
            onClick={onToggle}
            className="grid h-6 w-6 cursor-pointer place-items-center rounded-md text-rr-500 hover:bg-rr-700 hover:text-rr-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={colSpan} className="bg-rr-800 px-4 py-4" id={panelId}>
            <div className="eyebrow mb-2.5 text-rr-300">
              Feed-by-feed coverage
            </div>
            <div className="eyebrow mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-cov-covered/15 px-2.5 py-0.5 text-cov-covered">
                {r.covered} covered
              </span>
              {r.partial > 0 && (
                <span className="rounded-full bg-cov-partial/15 px-2.5 py-0.5 text-cov-partial">
                  {r.partial} partial
                </span>
              )}
              <span className="rounded-full bg-rr-950 px-2.5 py-0.5 text-rr-400">
                {absent} absent
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {feeds.map((f) => {
                const status = r.cells[f.id];
                const dim =
                  status === "covered" ? "opacity-100" : status === "partial" ? "opacity-60" : "opacity-30";
                return (
                  <div
                    key={f.id}
                    className={`flex items-center gap-2 rounded-xl bg-rr-950 px-3 py-2 ${dim}`}
                    title={`${f.short}: ${status}`}
                  >
                    <CoverageDot status={status} />
                    <span className="truncate text-xs font-medium text-rr-200">{f.short}</span>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CoverageBar({
  covered,
  partial,
  flipDown,
  total,
  name,
}: {
  covered: number;
  partial: number;
  /** Open the hover detail downward instead of up — set for the top rows, whose upward tooltip
   *  would otherwise be clipped by the table card's `overflow-hidden` top edge. */
  flipDown?: boolean;
  total: number;
  name: string;
}) {
  const absent = total - covered - partial;
  return (
    <div className="group/bar relative">
      {/* Three independent segments (covered / partial / absent), each rounded with a small gap.
          Sized by flex-grow proportional to the count, so widths always sum to the track width. */}
      <div className="flex h-2.5 w-full items-stretch gap-1">
        {covered > 0 && (
          <span className="rounded-full bg-cov-covered" style={{ flexGrow: covered, flexBasis: 0 }} />
        )}
        {partial > 0 && (
          <span className="cov-hatch rounded-full" style={{ flexGrow: partial, flexBasis: 0 }} />
        )}
        {absent > 0 && (
          <span className="rounded-full bg-rr-700/60" style={{ flexGrow: absent, flexBasis: 0 }} />
        )}
      </div>
      {/* Hover detail — counts are also shown as text in the Feeds column, so this is supplementary. */}
      <div
        className={`glass-strong pointer-events-none absolute left-0 z-10 hidden whitespace-nowrap rounded-lg bg-rr-900/85 px-3 py-2 text-xs group-hover/bar:block ${
          flipDown ? "top-[calc(100%+6px)]" : "bottom-[calc(100%+6px)]"
        }`}
      >
        <div className="mb-1 font-semibold text-rr-200">{name}</div>
        <BarRow swatch="bg-cov-covered" label="covered" value={covered} />
        {partial > 0 && <BarRow swatch="cov-hatch" label="partial" value={partial} />}
        <BarRow swatch="bg-cov-none/60" label="absent" value={absent} />
      </div>
    </div>
  );
}

function BarRow({ swatch, label, value }: { swatch: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 leading-relaxed">
      <span className={`h-2 w-2 rounded-full ${swatch}`} />
      <span className="text-rr-500">{label}</span>
      <span className="ml-auto pl-3 font-mono font-medium text-rr-200">{value}</span>
    </div>
  );
}
