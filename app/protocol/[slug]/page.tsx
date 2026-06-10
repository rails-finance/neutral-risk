import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ExternalLink, TrendingUpDown } from "lucide-react";
import { PROTOCOLS, PROTOCOL_BY_ID, CATEGORY_COLOR } from "@/lib/data/protocols";
import { FEEDS, FEED_BY_ID } from "@/lib/data/feeds";
import { COVERAGE, coverageCount } from "@/lib/data/coverage";
import { coverageSpread, coverageDivergence } from "@/lib/data/analytics";
import { protocolTvl } from "@/lib/tvl";
import { controlTimeline } from "@/lib/control-timeline";
import { protocolAudits } from "@/lib/data/audits";
import { formatUsd, formatPrice, formatChange } from "@/lib/format";
import { aiPreview, mockPrice } from "@/lib/data/ai-preview";
import { ProvenanceTag } from "@/components/provenance-tag";
import { CoveragePill } from "@/components/coverage-cell";
import { AiCard } from "@/components/ai-card";
import { GovernanceGlance } from "@/components/governance-glance";
import { ProtocolTabs, type ProtocolTab } from "@/components/protocol-tabs";

export function generateStaticParams() {
  return PROTOCOLS.map((p) => ({ slug: p.id }));
}

export default async function ProtocolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PROTOCOL_BY_ID[slug];
  if (!p) notFound();

  const counts = coverageCount(p.id);
  const tvl = protocolTvl(p);
  const spread = coverageSpread(p.id);
  const divergence = coverageDivergence(p.id);
  const timeline = controlTimeline(p.id);
  const audits = protocolAudits(p.id);
  const ai = aiPreview(p, { reporting: counts.covered + counts.partial, total: counts.total });
  const price = mockPrice(p.id);
  const LENS_TYPES = ["Rating", "Dashboard", "Monitoring", "Research"] as const;

  // Feeds ordered: covered → partial → not-covered
  const order = { covered: 0, partial: 1, "not-covered": 2 } as const;
  const feeds = [...FEEDS].sort(
    (a, b) => order[COVERAGE[p.id][a.id].status] - order[COVERAGE[p.id][b.id].status],
  );

  // Dense factual sections live behind tabs to keep the page scannable. The AI card and header
  // stay always-visible above; empty sections (no incidents / audits / verify) drop their tab.
  const tabs: ProtocolTab[] = [
    {
      id: "ai",
      label: "AI review",
      content: <AiCard ai={ai} protocolName={p.name} />,
    },
    {
      id: "lens",
      label: "How feeds see it",
      content: (
        <>
          {/* Coverage summary */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl bg-rr-850 px-5 py-4 text-sm">
            <span className="text-rr-500">Feed coverage</span>
            <span className="font-mono">
              <span className="text-cov-covered">{counts.covered} covered</span>
              <span className="text-rr-500"> · </span>
              <span className="text-cov-partial">{counts.partial} partial</span>
              <span className="text-rr-500"> · {counts.total - counts.covered - counts.partial} not yet covered</span>
              <span className="text-rr-500"> of {counts.total}</span>
            </span>
          </div>

          {/* How the feeds see it — methodology-lens spread (neutral, fact-only) */}
          <section className="mt-6">
            <div className="rounded-xl bg-rr-850 p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {LENS_TYPES.map((t) => {
                  const v = spread.byType[t];
                  const n = v.covered + v.partial;
                  return (
                    <div key={t} className={`rounded-lg bg-rr-800 px-4 py-3 ${n === 0 ? "opacity-40" : ""}`}>
                      <div className="eyebrow text-rr-500">{t}</div>
                      <div className="mt-0.5 font-mono text-sm">
                        {n === 0 ? (
                          <span className="text-rr-500">—</span>
                        ) : (
                          <>
                            <span className="text-cov-covered">{v.covered}</span>
                            <span className="text-rr-500"> / </span>
                            <span className="text-cov-partial">{v.partial}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-rr-500">
                {spread.reporting === 0 ? (
                  <>No feed in the registry reports on {p.name} yet.</>
                ) : (
                  <>
                    Seen through <span className="text-rr-200">{spread.lensCount} of 4</span> methodology lenses
                    ({spread.lenses.join(", ").toLowerCase()}).{" "}
                    {spread.reporting > 0 && (
                      <>
                        Of {spread.reporting} feeds reporting,{" "}
                        <span className="text-rr-200">{Math.round((1 - spread.partialShare) * 100)}%</span> assess fully and{" "}
                        <span className="text-rr-200">{Math.round(spread.partialShare * 100)}%</span> only partially —{" "}
                        {spread.partialShare >= 0.5
                          ? "feeds vary in how fully they can assess it."
                          : "broad agreement on assessability."}
                      </>
                    )}{" "}
                    A neutral view of who is looking and how — not a risk judgement.
                  </>
                )}
              </p>
            </div>
          </section>
        </>
      ),
    },
    {
      id: "governance",
      label: "Governance",
      content: (
        <>
          {/* Governance at a glance — structured control-surface summary (neutral facts). */}
          {p.controls && <GovernanceGlance controls={p.controls} />}

          {/* Governance — the authoritative, provenance-tagged prose facts. */}
          <section>
            <div className="overflow-hidden rounded-xl bg-rr-850">
              <table className="w-full text-sm">
                <tbody>
                  {p.governance.map((g, i) => (
                    <tr key={i} className="border-b border-rr-700 last:border-0">
                      <td className="w-44 bg-rr-800 px-4 py-3 align-top text-rr-500">{g.label}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{g.value}</span>
                          <ProvenanceTag provenance={g.provenance} />
                          {g.source && (
                            <a href={g.source} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                              <ExternalLink className="inline h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Control timeline — the verifier edge: control actions from chain truth (Sieve). */}
          {timeline.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-1 section-title text-rr-500">Control timeline</h2>
              <p className="mb-3 max-w-2xl text-sm leading-relaxed text-rr-500">
                Every upgrade, parameter change, and key rotation over {p.name}&rsquo;s contracts,
                rendered from chain state via Sieve. The feeds <em>rate</em> control; the verification
                layer <em>proves</em> it. Each action links to its transaction; an immutable protocol
                shows an empty timeline, which is itself the signal.
              </p>
              <div className="overflow-hidden rounded-xl bg-rr-850">
                <ol>
                  {timeline.map((a, i) => (
                    <li key={i} className="flex gap-4 border-b border-rr-700 px-4 py-3 last:border-0">
                      <span className="w-24 shrink-0 font-mono text-xs text-rr-500">{a.date}</span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{a.action}</span>
                          <ProvenanceTag provenance={a.provenance} />
                          {a.txUrl && (
                            <a href={a.txUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                              <ExternalLink className="inline h-3 w-3" />
                            </a>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-rr-500">{a.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}
        </>
      ),
    },
    {
      id: "feeds",
      label: "Feeds",
      content: (
        /* Risk Intelligence Feeds */
        <section>
          <p className="mb-4 text-sm text-rr-500">
            {counts.covered + counts.partial} of {counts.total} feeds report on {p.name}
          </p>
          {divergence.split && (
            <div className="mb-4 rounded-lg bg-rr-800 px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUpDown className="h-4 w-4 text-rr-400" /> Where feeds differ
              </div>
              <p className="mt-1 text-sm leading-relaxed text-rr-500">
                The {divergence.reporting} reporting feeds are split on how fully they assess {p.name}:{" "}
                <span className="text-cov-covered">{divergence.covered} assess it fully</span>,{" "}
                <span className="text-cov-partial">{divergence.partial} only partially</span>, and they
                use different methodologies and scales. We show every position side by side and{" "}
                <span className="text-rr-300">do not reconcile them into a single verdict</span> — oracle
                diversity made visible, not adjudicated.
              </p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {feeds.map((f) => {
              const c = COVERAGE[p.id][f.id];
              const meta = FEED_BY_ID[f.id];
              const dim = c.status === "not-covered";
              return (
                <div
                  key={f.id}
                  className={`rounded-xl bg-rr-850 p-5 ${dim ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{f.name}</div>
                      <div className="eyebrow text-rr-500">{meta.type}</div>
                    </div>
                    <CoveragePill status={c.status} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-rr-500">{c.note ?? meta.focus}</p>
                  {c.rating && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-md bg-rr-800 px-2 py-1 font-mono text-sm">{c.rating}</span>
                      <ProvenanceTag provenance={c.provenance} />
                    </div>
                  )}
                  {!dim && (
                    <a
                      href={c.url ?? meta.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                    >
                      View source <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ),
    },
  ];

  if (p.incidents && p.incidents.length > 0) {
    tabs.push({
      id: "incidents",
      label: "Incidents",
      content: (
        /* Incident history — sourced, neutral facts (RFP protocol detail page). */
        <section>
          <div className="space-y-3">
            {p.incidents.map((inc, i) => (
              <div key={i} className="rounded-xl bg-rr-850 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-rr-500">{inc.date}</span>
                  <span className="font-semibold">{inc.title}</span>
                  <ProvenanceTag provenance={inc.provenance} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-rr-300">{inc.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  {inc.source && (
                    <a href={inc.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                      Source <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-rr-500">
            Material risk events, presented verbatim from cited sources — not a Rails assessment.
          </p>
        </section>
      ),
    });
  }

  if (audits.length > 0) {
    tabs.push({
      id: "audits",
      label: "Audits",
      content: (
        /* Security audits — sourced, neutral facts (RFP protocol detail page). */
        <section>
          <div className="overflow-hidden rounded-xl bg-rr-850">
            <table className="w-full text-sm">
              <thead>
                <tr className="eyebrow border-b border-rr-600 bg-rr-800 text-left text-rr-500">
                  <th className="px-4 py-3">Auditor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a, i) => (
                  <tr key={i} className="border-b border-rr-700 align-top last:border-0">
                    <td className="px-4 py-2.5 font-medium">{a.auditor}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-rr-500">{a.date ?? "—"}</td>
                    <td className="px-4 py-2.5 text-rr-300">{a.scope}</td>
                    <td className="px-4 py-3">
                      {a.url && (
                        <a href={a.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:underline">
                          Report <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-rr-500">
            Representative public audits, attributed and linked to source — not a Rails assessment,
            and not a completeness or safety guarantee.
          </p>
        </section>
      ),
    });
  }

  if (p.links.railsExplorer) {
    tabs.push({
      id: "verify",
      label: "Verify on-chain",
      content: (
        /* Verify on-chain — the verification layer (Rails as steward/verifier, not a rated feed) */
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-4">
            <p className="max-w-2xl text-sm leading-relaxed text-rr-200">
              The feeds above tell you what they <em>say</em>. To check what actually
              happened, every {p.name} position and interaction is inspectable on-chain. This
              registry&apos;s verification layer — <span className="font-medium text-rr-50">Rails</span> —
              renders the full, event-level transaction history, so any claim here can be
              checked against chain truth.
            </p>
            <a
              href={p.links.railsExplorer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400"
            >
              Verify {p.name} on-chain <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      ),
    });
  }

  return (
    <div>
      <Link href="/" className="mb-5 inline-flex items-center gap-1 text-xs text-rr-500 hover:text-rr-50">
        ← All protocols
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/protocols/${p.icon}.png`} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg bg-rr-800" />
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                {p.name}
                {p.versions && <span className="text-base font-normal text-rr-500">{p.versions}</span>}
              </h1>
              <p className="mt-0.5 text-sm text-rr-500">
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ background: CATEGORY_COLOR[p.category] }}
                  aria-hidden="true"
                />
                {p.category}
                {p.family && p.family !== p.name ? ` · ${p.family} family` : ""} — {p.notes}
              </p>
            </div>
          </div>
          {/* Source links — one compact line beneath the icon/title (DefiLlama / site). */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href={p.links.defillama} target="_blank" rel="noreferrer" className="label whitespace-nowrap rounded-md border border-transparent bg-rr-850 px-2 py-0.5 text-rr-500 transition-colors hover:border-brand hover:text-rr-50">
              DefiLlama ↗
            </a>
            {p.links.site && (
              <a href={p.links.site} target="_blank" rel="noreferrer" className="label whitespace-nowrap rounded-md border border-transparent bg-rr-850 px-2 py-0.5 text-rr-500 transition-colors hover:border-brand hover:text-rr-50">
                Protocol site ↗
              </a>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold">
            {p.tvlApplicable ? formatUsd(tvl) : <span className="text-rr-500">volume metric</span>}
          </div>
          <div className="text-xs text-rr-500">{p.tvlApplicable ? "TVL · DefiLlama" : "TVL not applicable"}</div>
          {/* Spot prices (illustrative mock — ETH + native token, 24h change). */}
          <div className="mt-1.5 flex items-center justify-end gap-3 font-mono text-sm">
            <span className="text-rr-300">
              {price.eth.symbol} {formatPrice(price.eth.usd)}{" "}
              <span className={price.eth.change24h >= 0 ? "text-status-ok" : "text-status-down"}>
                {formatChange(price.eth.change24h)}
              </span>
            </span>
            {price.token && (
              <span className="text-rr-300">
                {price.token.symbol} {formatPrice(price.token.usd)}{" "}
                <span className={price.token.change24h >= 0 ? "text-status-ok" : "text-status-down"}>
                  {formatChange(price.token.change24h)}
                </span>
              </span>
            )}
          </div>
          <div className="text-xs text-rr-500">price · DefiLlama (24h) · preview</div>
        </div>
      </div>

      {/* AI review is the first tab; the dense factual sections follow behind tabs. */}
      <ProtocolTabs tabs={tabs} defaultId="ai" />
    </div>
  );
}
