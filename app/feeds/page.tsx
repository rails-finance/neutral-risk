import type { Metadata } from "next";
import Link from "next/link";
import { FEEDS, type FeedType, type Independence } from "@/lib/data/feeds";
import { PROTOCOLS } from "@/lib/data/protocols";
import { COVERAGE } from "@/lib/data/coverage";
import { IndependenceBadge, INDEPENDENCE_META, independenceTitle } from "@/components/independence-badge";

/** Tinted segment colour per independence level, for the card meta pill — the same status-triad
 *  hues as IndependenceBadge, as a faint fill + text colour for one segment of the pill. */
const INDEP_SEG: Record<Independence, string> = {
  independent: "bg-status-ok/10 text-status-ok",
  commercial: "bg-rr-800 text-rr-300",
  "paid-mandate": "bg-status-warn/10 text-status-warn",
  "curates-vaults": "bg-status-warn/15 text-status-warn",
};

export const metadata: Metadata = {
  title: "Feed directory · Neutral Risk",
  description:
    "Every risk feed in the registry — its focus, type, and what it covers. The matrix, flipped: a directory of the risk-feed ecosystem.",
};

const TYPES: FeedType[] = ["Rating", "Dashboard", "Monitoring", "Research"];

function feedReach(feedId: string) {
  let covered = 0;
  let partial = 0;
  for (const p of PROTOCOLS) {
    const s = COVERAGE[p.id][feedId].status;
    if (s === "covered") covered++;
    else if (s === "partial") partial++;
  }
  return { covered, partial };
}

export default function FeedsPage() {
  return (
    <div>
      <section className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Feed directory</h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-rr-500">
          A page per risk feed — its focus, methodology type, and what it covers across the registry.
        </p>
      </section>

      <div className="space-y-12">
        {TYPES.map((t) => {
          const feeds = FEEDS.filter((f) => f.type === t);
          if (!feeds.length) return null;
          return (
            <section key={t}>
              <h2 className="mb-5 text-2xl font-bold tracking-tight text-rr-100">{t}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {feeds.map((f) => {
                  const r = feedReach(f.id);
                  const mr =
                    f.machineReadable === "yes"
                      ? { label: "Automated", seg: "bg-status-ok/10 text-status-ok" }
                      : f.machineReadable === "partial"
                        ? { label: "Partial", seg: "bg-status-warn/10 text-status-warn" }
                        : { label: "Manual", seg: "bg-rr-800 text-rr-400" };
                  return (
                    <Link
                      key={f.id}
                      href={`/feed/${f.id}`}
                      className="rounded-xl border border-transparent bg-rr-850 p-6 transition-colors hover:border-brand hover:bg-rr-800"
                    >
                      <span className="block font-semibold">{f.name}</span>
                      {/* Meta pill — content-tinted segments, divide-x seams reading them apart:
                          independence (trust) · coverage (a short bar + count, sized like the
                          coverage-table bar — solid = covered, hatched = partial, same hue, the
                          matrix/list grammar) · machine-readability (capability). The coverage
                          segment drops out entirely when the feed covers nothing. */}
                      <div className="mt-2 inline-flex items-center divide-x divide-rr-900/50 overflow-hidden rounded-full text-xs font-medium">
                        <span className={`px-2.5 py-1 ${INDEP_SEG[f.independence]}`} title={independenceTitle(f.independence, f.independenceNote)}>
                          {INDEPENDENCE_META[f.independence].label}
                        </span>
                        {(r.covered > 0 || r.partial > 0) && (
                          <span
                            className="inline-flex items-center gap-3 bg-rr-800 px-2.5 py-1 font-mono text-rr-300"
                            title={`${r.covered} covered · ${r.partial} partial`}
                          >
                            {r.covered > 0 && (
                              <span className="inline-flex items-center gap-1.5" aria-label={`${r.covered} covered`}>
                                <span className="h-2.5 w-6 rounded-full bg-cov-covered" aria-hidden="true" />
                                {r.covered}
                              </span>
                            )}
                            {r.partial > 0 && (
                              <span className="inline-flex items-center gap-1.5" aria-label={`${r.partial} partial`}>
                                <span className="cov-hatch h-2.5 w-6 rounded-full" aria-hidden="true" />
                                {r.partial}
                              </span>
                            )}
                          </span>
                        )}
                        <span className={`px-2.5 py-1 ${mr.seg}`} title="Machine-readable output (drives M2 automation)">
                          {mr.label}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-rr-500">{f.focus}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Independence legend — moved to the foot as a reference; each feed's badge/pill carries the
          same disclosure inline (definition + the feed's own note) on hover, where it's relevant. */}
      <section className="mt-12 border-t border-rr-700 pt-6">
        <h2 className="eyebrow text-rr-500">Independence — how a feed relates to what it rates</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-2.5 text-sm text-rr-500 sm:grid-cols-2">
          {(Object.keys(INDEPENDENCE_META) as (keyof typeof INDEPENDENCE_META)[]).map((k) => (
            <div key={k} className="flex items-baseline gap-2">
              <dt className="shrink-0">
                <IndependenceBadge independence={k} />
              </dt>
              <dd>{INDEPENDENCE_META[k].definition}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-rr-500">We disclose the conflict; we never grade the feed.</p>
      </section>
    </div>
  );
}
