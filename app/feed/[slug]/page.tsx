import Link from "next/link";
import { notFound } from "next/navigation";
import { FEEDS, FEED_BY_ID } from "@/lib/data/feeds";
import { PROTOCOLS, PROTOCOL_BY_ID } from "@/lib/data/protocols";
import { COVERAGE } from "@/lib/data/coverage";
import { CoveragePill } from "@/components/coverage-cell";
import { IndependenceBadge } from "@/components/independence-badge";
import { ExportMenu } from "@/components/export-menu";
import { feedToMarkdown } from "@/lib/export/feed-to-markdown";

export function generateStaticParams() {
  return FEEDS.map((f) => ({ slug: f.id }));
}

export default async function FeedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = FEED_BY_ID[slug];
  if (!f) notFound();

  const order = { covered: 0, partial: 1, "not-covered": 2 } as const;

  const protocols = PROTOCOLS.map((p) => ({ p, c: COVERAGE[p.id][f.id] }))
    .filter((x) => x.c.status !== "not-covered")
    .sort((a, b) => order[a.c.status] - order[b.c.status]);

  const covered = protocols.filter((x) => x.c.status === "covered").length;
  const partial = protocols.filter((x) => x.c.status === "partial").length;

  const auto =
    f.machineReadable === "yes" ? "Automated" : f.machineReadable === "partial" ? "Partial" : "Manual";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link href="/feeds" className="inline-flex items-center gap-1 text-xs text-rr-500 hover:text-rr-50">
          ← Feed directory
        </Link>
        <ExportMenu markdown={feedToMarkdown(f)} ariaLabel={`Copy ${f.name} profile for an LLM`} />
      </div>

      {/* Page title spans its own row above both columns. */}
      <h1 className="text-4xl font-bold tracking-tight">{f.name}</h1>

      {/* Below the title: the feed's lead + credentials card in the narrow left sidebar, the
          covered-protocols list in the wide right column. The sidebar is DOM-first so it also
          leads (description first) on mobile. */}
      <div className="mt-8 grid gap-x-12 gap-y-10 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          {/* Lead, with the Visit-feed link inline as a pill (matches the protocol page). */}
          <p className="text-sm leading-relaxed text-rr-400">
            {f.focus}{" "}
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="label ml-1 inline-flex items-center whitespace-nowrap rounded-md border border-transparent bg-rr-850 px-2 py-0.5 align-middle text-rr-500 transition-colors hover:border-brand hover:text-rr-50"
            >
              Visit feed ↗
            </a>
          </p>

          {/* Credentials card — feed details. Coverage count rides here as a row, using the
              filled (covered) / hatched (partial) coverage grammar. */}
          <dl className="divide-y divide-rr-700 overflow-hidden rounded-xl bg-rr-850">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="eyebrow text-rr-500">Type</dt>
              <dd className="text-sm font-medium text-rr-200">{f.type}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="eyebrow text-rr-500">Ingestion</dt>
              <dd className="text-sm font-medium text-rr-200">{auto}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="eyebrow text-rr-500">Coverage</dt>
              <dd className="flex items-center gap-3 font-mono text-sm text-rr-200" title={`${covered} covered · ${partial} partial`}>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-cov-covered" aria-hidden="true" />
                  {covered}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="cov-hatch h-2.5 w-2.5 rounded-sm" aria-hidden="true" />
                  {partial}
                </span>
              </dd>
            </div>
            <div className="px-4 py-3.5">
              <div className="flex items-center justify-between gap-4">
                <dt className="eyebrow text-rr-500">Independence</dt>
                <dd>
                  <IndependenceBadge independence={f.independence} note={f.independenceNote} className="px-2 py-1" />
                </dd>
              </div>
              <dd className="mt-2.5 text-sm leading-relaxed text-rr-400">
                {f.independenceNote}{" "}
                <span className="text-rr-500">
                  A neutral disclosure of this feed&rsquo;s relationship to what it rates — not a
                  risk judgement of the feed.
                </span>
              </dd>
            </div>
          </dl>
        </aside>

        <section className="lg:col-span-8">
          <h2 className="text-2xl font-bold tracking-tight text-rr-100">Protocols covered by {f.name}</h2>
          {protocols.length === 0 ? (
            <p className="mt-4 text-sm text-rr-500">No protocols covered yet.</p>
          ) : (
            <div className="mt-5 space-y-2">
              {protocols.map(({ p, c }) => (
                <Link
                  key={p.id}
                  href={`/protocol/${p.id}`}
                  className="flex items-center gap-3 rounded-lg border border-transparent bg-rr-850 px-4 py-2.5 transition-colors hover:border-brand hover:bg-rr-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/icons/protocols/${PROTOCOL_BY_ID[p.id].icon}.png`} alt="" className="h-5 w-5 shrink-0 rounded-md bg-rr-800" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
                  {c.rating && (
                    <span className="shrink-0 truncate font-mono text-xs text-rr-500">&ldquo;{c.rating}&rdquo;</span>
                  )}
                  <CoveragePill status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
