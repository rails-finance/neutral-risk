import type { CoverageStatus } from "@/lib/data/coverage";

// Covered = solid fuchsia; partial = the SAME hue, distinguished by the diagonal hatch (cov-hatch),
// matching the matrix/bar/legend grammar — never a second colour step. (cov-partial survives only as
// the partial-count TEXT colour, not a fill.)
const DOT: Record<CoverageStatus, string> = {
  covered: "bg-cov-covered",
  partial: "cov-hatch",
  "not-covered": "bg-cov-none/40",
};

const RING: Record<CoverageStatus, string> = {
  covered: "ring-cov-covered/20",
  partial: "ring-cov-covered/20",
  "not-covered": "ring-transparent",
};

/** Compact matrix indicator. */
export function CoverageDot({ status, title }: { status: CoverageStatus; title?: string }) {
  return (
    <span className="inline-grid place-items-center" title={title}>
      <span className={`h-2.5 w-2.5 rounded-full ring-4 ${DOT[status]} ${RING[status]}`} />
    </span>
  );
}

const PILL: Record<CoverageStatus, { label: string; cls: string }> = {
  covered: { label: "Covered", cls: "border-cov-covered/30 bg-cov-covered/10 text-cov-covered" },
  partial: { label: "Partial", cls: "border-cov-partial/30 bg-cov-partial/10 text-cov-partial" },
  "not-covered": { label: "Not yet covered", cls: "border-rr-600 bg-rr-800 text-rr-500" },
};

export function CoveragePill({ status }: { status: CoverageStatus }) {
  const p = PILL[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${p.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {p.label}
    </span>
  );
}
