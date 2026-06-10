export function formatUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** A token/ETH spot price across a wide magnitude range (e.g. $6,420 or $0.0058). */
export function formatPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toPrecision(2)}`;
}

/** Signed 24h change with an arrow, e.g. "▲1.2%" / "▼3.1%". */
export function formatChange(pct: number): string {
  const arrow = pct >= 0 ? "▲" : "▼";
  return `${arrow}${Math.abs(pct).toFixed(1)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const LONG_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ordinalDay(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** Compact scan timestamp like "12pm 3rd June" — formatted in UTC so SSG output is deterministic. */
export function formatScanStamp(iso: string): string {
  const d = new Date(iso);
  const mins = d.getUTCMinutes();
  let h = d.getUTCHours();
  const ampm = h < 12 ? "am" : "pm";
  h = h % 12 || 12;
  const time = mins === 0 ? `${h}${ampm}` : `${h}:${String(mins).padStart(2, "0")}${ampm}`;
  return `${time} ${ordinalDay(d.getUTCDate())} ${LONG_MONTHS[d.getUTCMonth()]}`;
}
