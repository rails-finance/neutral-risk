import type { Independence } from "@/lib/data/feeds";

/**
 * Independence is a neutral disclosure about a feed's structural relationship to what it rates —
 * not a risk verdict on the feed. Charter-safe: we surface the conflict so users can weigh a
 * rating themselves; we never grade the feed. Hence a restrained green→neutral→amber gradient
 * (no alarmist red) on the status (health) triad — a disclosure cue, kept distinct from the
 * coverage ramp.
 */
export const INDEPENDENCE_META: Record<Independence, { label: string; cls: string; definition: string }> = {
  independent: {
    label: "Independent",
    cls: "bg-status-ok/15 text-status-ok",
    definition: "no protocol money or capital deployed",
  },
  commercial: {
    label: "Commercial",
    cls: "bg-rr-800 text-rr-300",
    definition: "for-profit vendor, not protocol-funded",
  },
  "paid-mandate": {
    label: "Paid mandate",
    cls: "bg-status-warn/15 text-status-warn",
    definition: "paid by the protocols it assesses",
  },
  "curates-vaults": {
    label: "Curates vaults",
    cls: "bg-status-warn/25 text-status-warn ring-1 ring-status-warn/40",
    definition: "also deploys capital in markets it rates",
  },
};

/** Combined disclosure string for a tooltip: the level's generic definition, plus the feed's own
 *  note when supplied. One source for the badge title and any custom tooltip. */
export function independenceTitle(independence: Independence, note?: string): string {
  const def = INDEPENDENCE_META[independence].definition;
  return note ? `${def} — ${note}` : def;
}

export function IndependenceBadge({
  independence,
  note,
  className = "",
}: {
  independence: Independence;
  note?: string;
  className?: string;
}) {
  const m = INDEPENDENCE_META[independence];
  return (
    <span
      className={`eyebrow inline-block rounded-md px-1.5 py-0.5 ${m.cls} ${className}`}
      title={independenceTitle(independence, note)}
    >
      {m.label}
    </span>
  );
}
