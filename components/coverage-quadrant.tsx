import Link from "next/link";
import { CATEGORY_COLOR, type Category } from "@/lib/data/protocols";
import { formatUsd } from "@/lib/format";

// "Funds at risk vs. eyes on it." Neutral by construction: both axes are objective facts, and it
// measures coverage, not risk — we never imply a protocol is risky, only that the feed ecosystem
// under-watches it relative to capital at stake. Presentational: the parent supplies the points to
// plot plus a registry-wide reference set (refPoints) so axes + median guides stay stable when the
// view is filtered.

// Category hues come from the shared CATEGORY_COLOR (lib/data/protocols) so the map, list, matrix
// and detail pages all speak one category colour language.
const CAT_COLOR = CATEGORY_COLOR;

const FLOOR = 1_000_000; // clamp tiny TVL to $1M so the log axis stays legible
// Panoramic viewBox: the SVG is `w-full`, so a wide W/H spends the container's width on the plot
// (and spreads the TVL axis so same-row points sit farther apart). Labels are kept inside the plot
// by the placer below, so the right margin no longer needs to reserve label room.
const W = 1240;
const H = 560;
const M = { l: 64, r: 48, t: 28, b: 54 };
const PW = W - M.l - M.r;
const PH = H - M.t - M.b;

type Box = { x0: number; y0: number; x1: number; y1: number };

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface MapPoint {
  id: string;
  name: string;
  category: Category;
  tvl: number;
  reporting: number;
}

export function CoverageMap({
  points,
  refPoints,
  totalFeeds,
}: {
  points: MapPoint[];
  refPoints: MapPoint[];
  totalFeeds: number;
}) {
  // Axes + medians come from the registry-wide reference set, so filtering highlights a subset
  // against a fixed backdrop and "median" keeps a consistent meaning.
  const ref = refPoints.map((p) => ({ ...p, logTvl: Math.log10(Math.max(p.tvl, FLOOR)) }));
  const plot = points.map((p) => ({ ...p, logTvl: Math.log10(Math.max(p.tvl, FLOOR)) }));

  const xMin = 6; // $1M
  const xMax = ref.length ? Math.ceil(Math.max(...ref.map((p) => p.logTvl)) * 10) / 10 + 0.1 : 11;
  const yMax = totalFeeds;

  const sx = (logTvl: number) => M.l + ((logTvl - xMin) / (xMax - xMin)) * PW;
  const sy = (n: number) => M.t + PH - (n / yMax) * PH;

  const medX = median(ref.map((p) => p.logTvl));
  const medY = median(ref.map((p) => p.reporting));

  const xTicks = [6, 7, 8, 9, 10].filter((t) => t >= xMin && t <= xMax);
  const tickLabel = (e: number) => formatUsd(Math.pow(10, e));
  const yTicks = Array.from({ length: Math.floor(yMax / 2) + 1 }, (_, i) => i * 2);

  // Zone captions — the two medians cut the plane into four; each names both neutral facts it
  // combines (TVL half · coverage half) so the plot explains itself. Coverage-framed (Charter §1):
  // "thin coverage" = few feeds watching, never a risk judgement. Held as data so the label placer
  // can reserve their boxes.
  const zones = [
    { text: "Low TVL · Well-watched", x: M.l + 8, y: M.t + 14, anchor: "start" as const, fill: "fill-rr-500", size: 10, op: 0.7 },
    { text: "High TVL · Well-watched", x: M.l + PW - 6, y: M.t + 14, anchor: "end" as const, fill: "fill-rr-500", size: 10, op: 0.7 },
    { text: "Low TVL · Thin coverage", x: M.l + 8, y: M.t + PH - 8, anchor: "start" as const, fill: "fill-rr-500", size: 10, op: 0.7 },
    { text: "High TVL · Thin coverage", x: M.l + PW - 6, y: M.t + PH - 8, anchor: "end" as const, fill: "fill-rr-500", size: 10, op: 0.7 },
  ];

  // Label placer: feed counts are small integers, so many protocols share a y-row and their names
  // collide when pinned to the right of each dot. Keep every DOT at its true (x, y); place its label
  // in the first candidate slot — right, left, then nudged up/down — that clears every placed label,
  // every dot, and the zone captions. A leader line ties a moved label back to its dot.
  const CHAR_W = 5.6; // ~avg Inter glyph at 11px — width estimate, no DOM measurement
  const LH = 13;
  const boxOf = (lx: number, cy: number, w: number, anchor: "start" | "end"): Box => {
    const x0 = anchor === "end" ? lx - w : lx;
    return { x0, y0: cy - LH / 2, x1: x0 + w, y1: cy + LH / 2 };
  };
  const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

  const dotBoxes: Box[] = plot.map((p) => {
    const cx = sx(p.logTvl), cy = sy(p.reporting);
    return { x0: cx - 7, y0: cy - 7, x1: cx + 7, y1: cy + 7 };
  });
  const placedBoxes: Box[] = zones.map((z) => boxOf(z.x, z.y, z.text.length * CHAR_W + 6, z.anchor));

  const CANDS = [
    { dx: 9, dy: 0, anchor: "start" as const },
    { dx: -9, dy: 0, anchor: "end" as const },
    { dx: 9, dy: -LH, anchor: "start" as const },
    { dx: 9, dy: LH, anchor: "start" as const },
    { dx: -9, dy: -LH, anchor: "end" as const },
    { dx: -9, dy: LH, anchor: "end" as const },
    { dx: 9, dy: -2 * LH, anchor: "start" as const },
    { dx: 9, dy: 2 * LH, anchor: "start" as const },
    { dx: -9, dy: -2 * LH, anchor: "end" as const },
    { dx: -9, dy: 2 * LH, anchor: "end" as const },
  ];

  const labels = plot
    .map((p) => ({ p, cx: sx(p.logTvl), cy: sy(p.reporting) }))
    // Place the visually dominant points (more feeds, then higher TVL) first so they claim the
    // prime right/left slots; crowded neighbours flow into the nudged slots around them.
    .sort((a, b) => b.p.reporting - a.p.reporting || b.cx - a.cx)
    .map(({ p, cx, cy }) => {
      const w = p.name.length * CHAR_W + 6;
      const nearRight = cx > M.l + PW - 120;
      const order = nearRight
        ? [...CANDS].sort((a, b) => Number(b.anchor === "end") - Number(a.anchor === "end"))
        : CANDS;
      let best: { lx: number; ly: number; anchor: "start" | "end"; moved: boolean } | null = null;
      for (const c of order) {
        const lx = cx + c.dx, ly = cy + c.dy;
        const box = boxOf(lx, ly, w, c.anchor);
        if (box.x0 < M.l + 2 || box.x1 > M.l + PW - 2) continue; // keep inside the plot
        if (box.y0 < M.t - 8 || box.y1 > M.t + PH + 8) continue;
        if (placedBoxes.some((b) => hit(box, b)) || dotBoxes.some((b) => hit(box, b))) continue;
        placedBoxes.push(box);
        best = { lx, ly, anchor: c.anchor, moved: c.dy !== 0 };
        break;
      }
      if (!best) {
        // Nothing clear — fall back to the first slot and accept the overlap (rare, crowded corner).
        const c = order[0];
        const lx = cx + c.dx, ly = cy + c.dy;
        placedBoxes.push(boxOf(lx, ly, w, c.anchor));
        best = { lx, ly, anchor: c.anchor, moved: c.dy !== 0 };
      }
      return { p, cx, cy, ...best };
    });

  return (
    <section>
      {plot.length === 0 ? (
        <div className="mt-4 rounded-xl bg-rr-850 p-8 text-center text-sm text-rr-500">
          No TVL-applicable protocols in this filter. Swap aggregators use a volume metric, not TVL,
          so they don&rsquo;t appear on this axis.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl bg-rr-850 p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[760px] w-full" role="img" aria-label="Coverage gap scatter plot">
            {/* No background wash on any quadrant — they're marked by their captions alone, to keep
                the plot neutral and avoid implying a risk hue. */}
            {/* Zone captions (data-driven so the placer can reserve their boxes). Drawn before the
                points so the blobs read on top. */}
            {zones.map((z) => (
              <text key={z.text} x={z.x} y={z.y} textAnchor={z.anchor} className={z.fill} fontSize={z.size} opacity={z.op}>
                {z.text}
              </text>
            ))}

            {/* axes */}
            <line x1={M.l} y1={M.t} x2={M.l} y2={M.t + PH} stroke="#303631" />
            <line x1={M.l} y1={M.t + PH} x2={M.l + PW} y2={M.t + PH} stroke="#303631" />

            {/* median guide lines */}
            <line x1={sx(medX)} y1={M.t} x2={sx(medX)} y2={M.t + PH} stroke="#707c73" strokeDasharray="3 4" opacity={0.5} />
            <line x1={M.l} y1={sy(medY)} x2={M.l + PW} y2={sy(medY)} stroke="#707c73" strokeDasharray="3 4" opacity={0.5} />

            {/* x ticks */}
            {xTicks.map((t) => (
              <text key={`x${t}`} x={sx(t)} y={M.t + PH + 18} textAnchor="middle" className="fill-rr-500" fontSize={10}>
                {tickLabel(t)}
              </text>
            ))}
            <text x={M.l + PW / 2} y={H - 6} textAnchor="middle" className="fill-rr-500" fontSize={11}>
              TVL (log scale) — DefiLlama
            </text>

            {/* y ticks */}
            {yTicks.map((t) => (
              <text key={`y${t}`} x={M.l - 10} y={sy(t) + 3} textAnchor="end" className="fill-rr-500" fontSize={10}>
                {t}
              </text>
            ))}
            <text x={16} y={M.t + PH / 2} textAnchor="middle" className="fill-rr-500" fontSize={11} transform={`rotate(-90 16 ${M.t + PH / 2})`}>
              feeds reporting
            </text>

            {/* points — each dot + its de-overlapped label is one link to the protocol page */}
            {labels.map(({ p, cx, cy, lx, ly, anchor, moved }) => (
              <Link key={p.id} href={`/protocol/${p.id}`} className="group">
                {moved && <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="#707c73" strokeWidth={1} opacity={0.4} />}
                <circle cx={cx} cy={cy} r={5} fill={CAT_COLOR[p.category]} stroke="#0a0c0a" strokeWidth={1} className="cursor-pointer transition-colors group-hover:stroke-brand">
                  <title>{`${p.name} — ${formatUsd(p.tvl)} TVL, ${p.reporting} feeds reporting`}</title>
                </circle>
                <text x={lx} y={ly} dominantBaseline="middle" textAnchor={anchor} fontSize={11} className="cursor-pointer fill-rr-200 transition-colors group-hover:fill-brand">
                  {p.name}
                </text>
              </Link>
            ))}
          </svg>
        </div>
      )}

      {/* The explanation lives below the plot: a one-line read of the chart, then the map-specific
          caveats (medians, swap exclusion). No category colour key — the top category filter is the
          shared legend. */}
      <p className="mt-3 max-w-3xl text-xs text-rr-500">
        TVL (capital at stake) against feeds reporting — a map of <em>coverage</em>, not risk. Dashed
        lines mark registry-wide medians; swap aggregators are excluded (volume metric, not TVL).{" "}
        <Link href="/methodology" className="font-semibold text-brand hover:underline">How we compute coverage →</Link>
      </p>
    </section>
  );
}
