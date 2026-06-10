import Link from "next/link";
import { Ban, CircleCheck } from "lucide-react";
import { FEEDS } from "@/lib/data/feeds";
import { PROTOCOL_COUNT, DEPLOYMENT_COUNT, CATEGORIES } from "@/lib/data/protocols";

export const metadata = { title: "Methodology — Neutral Risk" };

export default function MethodologyPage() {
  const machineReadable = FEEDS.filter((f) => f.machineReadable !== "no").length;

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Methodology</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-rr-500">
        How the registry is built — how protocols and feeds are chosen, how we stay neutral, and how
        every figure here can be checked against what actually happened on-chain.
      </p>

      {/* Hero — the thesis paired with the binding do/don't, as three equal-width columns. */}
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <section className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-blue-400">The oracle-diversity principle</h2>
          <p className="mt-4 text-sm leading-relaxed text-rr-200">
            No single feed should be canonical for something as important as protocol risk.
            We treat risk feeds the way Ethereum treats price oracles: diversity is the point.
            We put what each one publishes side by side, attributed and verbatim, and let you
            weigh them. The aggregation is the value.
          </p>
        </section>

        <section className="rounded-xl border border-status-ok/20 bg-status-ok/5 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-status-ok">
            <CircleCheck className="h-6 w-6 shrink-0" /> What we do
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-rr-200">
            <Bullet>Show each feed&rsquo;s coverage status per protocol — covered, partial, or not yet covered.</Bullet>
            <Bullet>Show what each feed publishes, verbatim and attributed, with a link to source.</Bullet>
            <Bullet>Surface governance facts with a provenance tag on every datum.</Bullet>
            <Bullet>Sort and filter by neutral facts: TVL, category, feed-coverage count.</Bullet>
          </ul>
        </section>

        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-red-400">
            <Ban className="h-6 w-6 shrink-0" /> What we do not do
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-rr-200">
            <Bullet>Produce a composite or proprietary risk score of our own.</Bullet>
            <Bullet>Combine feeds into a single derived signal.</Bullet>
            <Bullet>Adjudicate when feeds disagree — we show the disagreement.</Bullet>
            <Bullet>Rank protocols by any risk judgement.</Bullet>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-rr-500">
            This constraint is binding and documented in the{" "}
            <a href="https://github.com/rails-finance/neutral-risk/blob/main/CHARTER.md" className="text-blue-400 hover:underline">
              project charter
            </a>
            . Changing it requires written agreement from the Ethereum Foundation.
          </p>
        </section>
      </div>

      {/* Body — narrative in the main column, glanceable reference in a right rail. */}
      <div className="mt-20 grid gap-x-16 gap-y-16 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-7">
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-rr-100">
              Opinion vs. ground truth — the verification layer
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              The feeds publish <em>assessments</em> — diverse, subjective, shown side by side.
              Separately, the registry is stewarded by the team at{" "}
              <a href="https://rails.finance" className="text-blue-400 hover:underline">Rails</a>,
              which renders the full event-level on-chain history of each protocol, so every claim
              here can be checked against what actually happened. The feeds tell you what they{" "}
              <em>say</em>; the verification layer shows what <em>is</em>.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              To stay neutral, the verifier is deliberately <strong>not</strong> a rated feed —
              a steward grading itself alongside the feeds wouldn&rsquo;t be neutral. Rails is
              infrastructure, earns no rating column, and the relationship is disclosed in{" "}
              <a href="https://github.com/rails-finance/neutral-risk/blob/main/DISCLOSURES.md" className="text-blue-400 hover:underline">
                DISCLOSURES.md
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-rr-100">How we select protocols</h2>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              The registry covers <span className="text-rr-50">{PROTOCOL_COUNT} protocols across{" "}
              {DEPLOYMENT_COUNT} versioned deployments</span> — the RFP&rsquo;s <strong>seed protocol
              list, populated in full</strong>. That list names the top Ethereum DeFi protocols by
              TVL (or 24-hour volume where TVL doesn&rsquo;t apply), prioritising those where user
              capital is directly at risk, and we adopt it verbatim: all {PROTOCOL_COUNT} protocols
              across every category ({CATEGORIES.join(", ")}), including each version the RFP names
              (Aave V3/V4, Compound V2/V3, Liquity V1/V2, Uniswap V3/V4/X). Rankings are re-verified
              against{" "}
              <a href="https://defillama.com/chain/ethereum" className="text-blue-400 hover:underline">DefiLlama</a>{" "}
              at build time, as the RFP instructs. We add <strong>no selection criterion of our
              own</strong>.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              As the registry expands beyond the seed list, new members are admitted on the RFP&rsquo;s{" "}
              <strong>own stated basis</strong> — TVL, or 24-hour volume for routing/intent venues
              where TVL doesn&rsquo;t apply (CoW, UniswapX, 1inch, 0x, where funds don&rsquo;t sit{" "}
              <em>in</em> the protocol), prioritising where user capital is directly at risk — ranked
              on neutral DefiLlama facts. As live metrics move, this would naturally pull in large
              restaking and synthetic-dollar protocols; the basis is the RFP&rsquo;s, never a risk
              judgement of ours.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              The seed set already spans the full <strong>control spectrum</strong>, from large
              upgradeable lending markets to immutable CDPs like Liquity. We surface that as a{" "}
              <em>verifiable property, never a selection input</em>: an immutable protocol — core
              contracts no admin or governance key can change — has an empty control timeline, which
              our verification layer renders. Immutability is shown as a structural fact, never a mark
              of safety.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              Versioned deployments are listed as their own rows (e.g. Aave V3 and V4, Uniswap
              V3/V4/X), so each carries its own governance and coverage; the {PROTOCOL_COUNT}{" "}
              protocols therefore surface across {DEPLOYMENT_COUNT} deployments. A protocol may
              appear in more than one category where it runs distinct products (e.g. Morpho lending
              vs. Morpho Vaults).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-rr-100">How we select feeds</h2>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              The registry includes <span className="text-rr-50">{FEEDS.length} feeds</span> chosen to
              maximise methodology diversity — formal rating desks, dashboards, security-monitoring
              tools, and research. We also track whether each exposes <strong>machine-readable</strong>{" "}
              output ({machineReadable} of {FEEDS.length} today): the basis for our M2 automation —
              automate where possible, curate by hand where not. Each feed&rsquo;s focus, type,
              independence, and coverage lives in the{" "}
              <Link href="/feeds" className="text-blue-400 hover:underline">feed directory</Link>.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              Curation is deliberate, and we document the calls. We scope each provider to where it
              actually publishes: a service that rates <em>stablecoins</em> rather than protocols is
              held for the asset-risk layer rather than padded into this matrix, and where one
              dashboard is published under two names it is counted once. The goal is a registry that
              reflects <strong>distinct methodologies</strong>, not an inflated provider count.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight text-rr-100">Corrections</h2>
            <p className="mt-4 text-sm leading-relaxed text-rr-200">
              Every datum is community-correctable. To fix a coverage status, a stale rating, or a
              governance detail, open an issue or PR on{" "}
              <a href="https://github.com/rails-finance/neutral-risk" className="text-blue-400 hover:underline">
                GitHub
              </a>{" "}
              citing the source.
            </p>
          </section>
        </div>

        <aside className="space-y-8 lg:col-span-5">
          {/* By the numbers — neutral counts (charter-safe: facts about the registry, no risk judgement). */}
          <div className="rounded-xl bg-rr-850 p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-rr-100">By the numbers</h2>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6">
              <Stat value={PROTOCOL_COUNT} label="Protocols tracked" />
              <Stat value={DEPLOYMENT_COUNT} label="Versioned deployments" />
              <Stat value={FEEDS.length} label="Risk feeds" />
              <Stat value={machineReadable} label="Machine-readable feeds" />
              <Stat value={CATEGORIES.length} label="Categories" />
            </dl>
          </div>

          {/* Provenance tags — reference legend for the tag on every datum. */}
          <div className="rounded-xl bg-rr-850 p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-rr-100">Data provenance tags</h2>
            <div className="mt-5 space-y-3 text-sm">
              <ProvRow tag="on-chain" cls="text-green-400" desc="Read directly from chain state or on-chain governance contracts." />
              <ProvRow tag="verified" cls="text-blue-400" desc="Confirmed against a primary source (docs, audited address, governance record)." />
              <ProvRow tag="self-reported" cls="text-amber-400" desc="Stated by the protocol; not independently confirmed." />
              <ProvRow tag="sample" cls="text-rr-500" desc="Illustrative placeholder shown in this prototype, pending verification." />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** List item with the bullet held in its own fixed column, so wrapped lines hang-indent under the
 *  text rather than under the bullet. */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden="true" className="select-none leading-relaxed text-rr-500">•</span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="font-mono text-2xl font-bold text-rr-50">{value}</dt>
      <dd className="label mt-0.5 text-rr-500">{label}</dd>
    </div>
  );
}

function ProvRow({ tag, cls, desc }: { tag: string; cls: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-32 shrink-0">
        <span className={`eyebrow inline-flex items-center whitespace-nowrap rounded-md border border-rr-600 bg-rr-850 px-1.5 py-0.5 ${cls}`}>
          {tag}
        </span>
      </span>
      <span className="text-rr-500">{desc}</span>
    </div>
  );
}
