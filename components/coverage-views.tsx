"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_COLOR, type Category } from "@/lib/data/protocols";
import { CoverageListBody, type MatrixRow, type MatrixFeed, type ColKey, type SortKey, type SortDir } from "@/components/coverage-list";
import { MatrixView } from "@/components/matrix-table";
import { CoverageMap, type MapPoint } from "@/components/coverage-quadrant";
import { GuidedExplorer, type ExploreData } from "@/components/guided-explorer";
import { List, LayoutGrid, ScatterChart, Signpost, Eye, ChevronDown, type LucideIcon } from "lucide-react";

export type ViewKey = "list" | "matrix" | "map" | "explore";

/** Default direction when first sorting by a column: magnitudes descend (biggest first), names
 *  ascend (A→Z). Re-clicking the active column flips it. */
const DEFAULT_DIR: Record<SortKey, SortDir> = { tvl: "desc", coverage: "desc", name: "asc" };

const CATEGORIES: (Category | "All")[] = [
  "All",
  "Lending",
  "DEX / AMM",
  "Swap Aggregator",
  "Yield / Vault",
  "Liquid Staking",
];

// Optional metadata columns. Protocol + coverage are always shown; TVL and the feeds-covered count
// are secondary, toggled together for both the list and matrix from one "eye" menu in the controls.
const TOGGLE_COLS: { key: ColKey; label: string }[] = [
  { key: "tvl", label: "TVL" },
  { key: "feeds", label: "Feeds covered" },
];

/** Columns ("eye") menu — shows/hides the optional TVL + Feeds columns across the list and matrix. */
function ColumnsMenu({ cols, onToggle }: { cols: Record<ColKey, boolean>; onToggle: (k: ColKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Show or hide columns"
        title="Show / hide columns"
        className="flex cursor-pointer items-center gap-1 rounded-full border border-transparent px-2 py-1 text-rr-400 transition-colors hover:border-brand hover:text-rr-50"
      >
        <Eye className="h-4 w-4" />
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="glass-strong absolute right-0 z-20 mt-1 w-44 rounded-xl bg-rr-900/85 p-1">
          <div className="eyebrow px-2 py-1.5 text-rr-500">Columns</div>
          {TOGGLE_COLS.map((c) => (
            <label
              key={c.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-rr-200 hover:bg-rr-800"
            >
              <input
                type="checkbox"
                checked={cols[c.key]}
                onChange={() => onToggle(c.key)}
                className="h-3.5 w-3.5 accent-brand"
              />
              {c.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Home-page coverage browser. Owns the shared controls (category, search, sort) plus a List/Matrix
 * view toggle, and feeds the already-filtered/sorted rows to whichever view is active — so switching
 * views preserves the current filter and sort.
 */
export function CoverageViews({
  rows,
  feeds,
  medianReporting,
  exploreData,
  tvlUpdated,
  initialView = "list",
}: {
  rows: MatrixRow[];
  feeds: MatrixFeed[];
  medianReporting: number;
  exploreData: ExploreData;
  /** Pre-formatted TVL snapshot date, e.g. "Jun 3, 2026". Shown only under the TVL-bearing views. */
  tvlUpdated: string;
  /** Which view to open on, set from the URL path (/coverage/matrix → "matrix"). Defaults to list. */
  initialView?: ViewKey;
}) {
  const [cat, setCat] = useState<Category | "All">("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("tvl");
  const [dir, setDir] = useState<SortDir>("desc");
  const [view, setView] = useState<ViewKey>(initialView);

  // Switching view also rewrites the URL (/coverage, /coverage/matrix, /coverage/map,
  // /coverage/explore) so every view is deep-linkable and shareable. We use the raw history API
  // rather than the Next router on purpose: the target is the same dynamic route, so this is a
  // pure URL swap with no re-render or data refetch, which keeps the current filter/sort intact.
  const selectView = (k: ViewKey) => {
    setView(k);
    if (typeof window === "undefined") return;
    const path = k === "list" ? "/coverage" : `/coverage/${k}`;
    window.history.replaceState(window.history.state, "", path);
  };
  // Shared TVL/Feeds column visibility — one "eye" menu drives both the list and matrix. Shown by
  // default (the list's primary columns); can be hidden in either view.
  const [cols, setCols] = useState<Record<ColKey, boolean>>({ tvl: true, feeds: true });
  const toggleCol = (k: ColKey) => setCols((c) => ({ ...c, [k]: !c[k] }));

  // Clicking a column header sorts by it; re-clicking the active one flips direction.
  const handleSort = (k: SortKey) => {
    if (k === sort) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(k);
      setDir(DEFAULT_DIR[k]);
    }
  };

  const visible = useMemo(() => {
    let r = rows;
    if (cat !== "All") r = r.filter((x) => x.category === cat);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      r = r.filter((x) => x.name.toLowerCase().includes(needle));
    }
    // Base comparator returns ascending order; flip for descending. "coverage" weighs partials half.
    const cmp = (a: MatrixRow, b: MatrixRow) => {
      if (sort === "tvl") return a.tvl - b.tvl;
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.covered + a.partial * 0.5 - (b.covered + b.partial * 0.5);
    };
    return [...r].sort((a, b) => (dir === "asc" ? cmp(a, b) : -cmp(a, b)));
  }, [rows, cat, q, sort, dir]);

  // Map view inputs: TVL-applicable points only (swap aggregators use a volume metric, not TVL).
  // refPoints is registry-wide so the axes + median guides stay fixed while the plotted set filters.
  const toPoint = (r: MatrixRow): MapPoint => ({
    id: r.id,
    name: r.name,
    category: r.category,
    tvl: r.tvl,
    reporting: r.covered + r.partial,
  });
  const refPoints = useMemo(() => rows.filter((r) => r.tvlApplicable).map(toPoint), [rows]);
  const mapPoints = useMemo(() => visible.filter((r) => r.tvlApplicable).map(toPoint), [visible]);

  // TVL provenance now rides on the TVL column header as an info-icon tooltip (the source line was
  // removed from below the table — the date already appears in the site status bar).
  const tvlInfo = `Live TVL from DefiLlama, updated ${tvlUpdated}.`;

  return (
    <div>
      {/* View switch — primary control, its own full-width row, bold + large. The guided explorer
          is the 4th tab: it renders its panel inline (like the other views swap in place), so it is
          a true peer mode rather than a link away. */}
      <div
        className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="group"
        aria-label="View"
      >
        {([
          { k: "list", label: "List", Icon: List },
          { k: "matrix", label: "Matrix", Icon: LayoutGrid },
          { k: "map", label: "Map", Icon: ScatterChart },
          { k: "explore", label: "Explore", Icon: Signpost },
        ] as { k: ViewKey; label: string; Icon: LucideIcon }[]).map(({ k, label, Icon }) => (
          <button
            key={k}
            onClick={() => selectView(k)}
            aria-pressed={view === k}
            className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 py-4 text-sm font-bold uppercase tracking-wide transition-colors sm:py-5 sm:text-base ${
              view === k
                ? "border-brand bg-brand/15 text-rr-50"
                : "border-transparent bg-rr-850 text-rr-400 hover:border-brand hover:bg-rr-800 hover:text-rr-50"
            }`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            {label}
          </button>
        ))}
      </div>

      {/* Filter / sort controls — not applicable to the guided explorer, which has its own flow. */}
      {view !== "explore" && (
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Flat chips, one per category — no segment dividers. Each is a borderless control: it
            reveals a brand border on hover, and the *active* chip tints to its own CATEGORY_COLOR
            (border + ~15% fill, set inline) per the documented category exception; the "All" chip,
            having no category, falls back to the brand selected-state. The hue also rides each
            chip's dot (the shared colour legend). */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((c) => {
            const active = cat === c;
            const color = c === "All" ? null : CATEGORY_COLOR[c];
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                aria-pressed={active}
                style={active && color ? { borderColor: color, backgroundColor: `${color}26` } : undefined}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? color
                      ? "text-rr-50"
                      : "border-brand bg-brand/15 text-rr-50"
                    : "border-transparent text-rr-400 hover:border-brand hover:text-rr-50"
                }`}
              >
                {color && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                )}
                {c}
              </button>
            );
          })}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search protocol…"
          className="h-8 w-44 rounded-full border border-transparent bg-rr-850 px-3.5 text-sm placeholder:text-rr-500 transition-colors focus:border-brand"
        />

        {/* Sorting now lives on the list/matrix column headers (click to sort, re-click to flip).
            Only the columns ("eye") menu remains here — it applies to the list + matrix, not the map. */}
        {view !== "map" && (
          <div className="ml-auto flex items-center">
            <ColumnsMenu cols={cols} onToggle={toggleCol} />
          </div>
        )}
      </div>
      )}

      {view === "list" && (
        <CoverageListBody rows={visible} feeds={feeds} medianReporting={medianReporting} cols={cols} sort={sort} dir={dir} onSort={handleSort} tvlInfo={tvlInfo} />
      )}
      {view === "matrix" && <MatrixView rows={visible} feeds={feeds} cols={cols} sort={sort} dir={dir} onSort={handleSort} tvlInfo={tvlInfo} />}
      {view === "map" && (
        <CoverageMap points={mapPoints} refPoints={refPoints} totalFeeds={feeds.length} />
      )}
      {view === "explore" && <GuidedExplorer data={exploreData} />}
    </div>
  );
}
