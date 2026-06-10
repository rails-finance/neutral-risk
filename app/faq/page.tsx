import Link from "next/link";
import { BookOpen, Table2, Scale, GitPullRequest } from "lucide-react";
import { FEEDS } from "@/lib/data/feeds";
import { PROTOCOL_COUNT, DEPLOYMENT_COUNT } from "@/lib/data/protocols";

export const metadata = {
  title: "FAQ — Neutral Risk",
  description:
    "Plain-language answers about DeFi risk feeds, what coverage means, and why this registry aggregates feeds rather than scoring them.",
};

export default function FaqPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Frequently asked questions</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-rr-500">
        Plain-language answers about what DeFi risk feeds are, how to read this registry,
        and why we aggregate feeds rather than score them. For the formal definitions, see{" "}
        <Link href="/methodology" className="text-blue-400 hover:underline">
          methodology
        </Link>
        .
      </p>

      {/* Four sections as a 2×2 grid of panels; each carries a Lucide icon to tell the sections
          apart by shape (palette stays neutral — no decorative per-section hue). Answers stay
          expanded; questions are divided by hairline rules within each card. */}
      <div className="mt-12 grid items-start gap-x-8 gap-y-10 md:grid-cols-2">
      {/* The basics */}
      <FaqSection title="The basics" icon={BookOpen}>
        <FaqItem q="What is a DeFi risk feed?">
          <p>
            An independent service that publishes an assessment of a DeFi protocol&rsquo;s
            risk — a rating, a research report, or a live monitoring signal. The{" "}
            {FEEDS.length} feeds in this registry range from formal rating methodologies to
            security-monitoring tools and research desks. Each looks at risk through its own
            lens. You can see the full list, with each provider&rsquo;s focus, on the{" "}
            <Link href="/feeds" className="text-blue-400 hover:underline">
              feeds
            </Link>{" "}
            page.
          </p>
        </FaqItem>

        <FaqItem q="Are all DeFi risk feeds equal?">
          <p>
            No — they differ in <strong>focus</strong> (some weigh smart-contract risk,
            others governance, liquidity, or market risk), in <strong>methodology</strong>,
            and in how much of the protocol landscape they <strong>cover</strong>. That is
            precisely why we put them side by side rather than picking a winner: no single
            feed is canonical for something this important. We show what each one says,
            attributed and verbatim, and let you weigh them.{" "}
            <strong>We never rank the feeds or merge them into a score of our own.</strong>
          </p>
        </FaqItem>

        <FaqItem q="Why aggregate feeds instead of producing your own rating?">
          <p>
            Because the aggregation <em>is</em> the value. The information already exists
            across dozens of dashboards and reports; what is missing is a neutral layer that
            puts it in one place. We treat risk feeds the way Ethereum treats price oracles —
            diversity is the point. Adding our own composite score would just create one more
            opinion to reconcile, and it would compromise our neutrality. This constraint is
            binding; see the{" "}
            <a
              href="https://github.com/rails-finance/neutral-risk/blob/main/CHARTER.md"
              className="text-blue-400 hover:underline"
            >
              charter
            </a>
            .
          </p>
        </FaqItem>
      </FaqSection>

      {/* Reading the registry */}
      <FaqSection title="Reading the registry" icon={Table2}>
        <FaqItem q="What does “coverage” mean — covered, partial, not covered?">
          <p>
            Coverage describes whether a feed has published an assessment of a given
            protocol, not how risky the protocol is.{" "}
            <span className="text-cov-covered">Covered</span> means the feed reports on the
            protocol; <span className="text-cov-partial">partial</span> means limited or
            indirect coverage; and{" "}
            <span className="text-rr-400">not yet covered</span> means the feed has not
            published on it. A protocol with fewer feeds reporting on it has thinner{" "}
            <em>coverage</em> — a fact about the feed ecosystem, not a verdict on the
            protocol.
          </p>
        </FaqItem>

        <FaqItem q="What do you mean by “verbatim”?">
          <p>
            Where a feed publishes a rating or summary, we show it as the feed states it,
            attributed to the provider, with a link to the source — we do not paraphrase it
            into a judgement of our own. In this prototype some ratings are illustrative{" "}
            <span className="text-rr-400">sample</span> values pending provider verification,
            and are labelled as such.
          </p>
        </FaqItem>

        <FaqItem q="What happens when two feeds disagree?">
          <p>
            We show the disagreement. Divergence between feeds is signal, not noise — it
            tells you risk on that protocol is contested and worth a closer look. We do not
            adjudicate, average, or pick a side.
          </p>
        </FaqItem>
      </FaqSection>

      {/* Neutrality & the data */}
      <FaqSection title="Neutrality and the data" icon={Scale}>
        <FaqItem q="Why isn’t there a single overall risk score?">
          <p>
            By design, and by binding commitment. Producing a composite or proprietary risk
            score — or ranking protocols by any risk judgement of our own — is exactly what
            this project does <em>not</em> do. We sort and filter only by neutral,
            externally-sourced facts (TVL, category, feed-coverage count). The full list of
            what we do and don&rsquo;t do is on the{" "}
            <Link href="/methodology" className="text-blue-400 hover:underline">
              methodology
            </Link>{" "}
            page; changing the constraint requires written agreement from the Ethereum
            Foundation.
          </p>
        </FaqItem>

        <FaqItem q="How is this different from a ratings agency?">
          <p>
            A ratings agency produces its own verdict. We produce none — we show what{" "}
            <em>others</em> publish, side by side, and add a verification layer so you can
            check those claims against what actually happened on-chain. We are an aggregator
            and a verifier, not a rater.
          </p>
        </FaqItem>

        <FaqItem q="Where does the on-chain data come from?">
          <p>
            The on-chain facts and the transaction-transparency links are produced by{" "}
            <a
              href="https://github.com/slvDev/sieve"
              className="text-blue-400 hover:underline"
            >
              Sieve
            </a>
            , an open-source Ethereum indexer that syncs directly over the P2P network — no
            RPC provider, no API keys. Because the indexer is open and re-runs over public
            data, every on-chain figure here is independently reproducible. The feeds tell
            you what they <em>say</em>; the verification layer shows what <em>is</em>.
          </p>
        </FaqItem>

        <FaqItem q="Is Rails one of the feeds it lists?">
          <p>
            No. Rails stewards and verifies the registry but is deliberately{" "}
            <strong>not</strong> a rated feed in the matrix — a steward grading itself
            alongside the feeds would not be neutral. Rails is infrastructure (provenance and
            on-chain verification) and earns no rating column. The relationship is disclosed
            in{" "}
            <a
              href="https://github.com/rails-finance/neutral-risk/blob/main/DISCLOSURES.md"
              className="text-blue-400 hover:underline"
            >
              DISCLOSURES.md
            </a>
            .
          </p>
        </FaqItem>
      </FaqSection>

      {/* Contributing */}
      <FaqSection title="Contributing" icon={GitPullRequest}>
        <FaqItem q="How are protocols and feeds chosen?">
          <p>
            The registry seeds {PROTOCOL_COUNT} protocols across {DEPLOYMENT_COUNT} versioned
            deployments, chosen as top Ethereum protocols by funds at risk and curated for
            coverage across every category, and{" "}
            {FEEDS.length} feeds chosen to maximise methodology diversity. Selection uses only
            neutral, externally-sourced facts — never a risk judgement of our own. The full
            selection criteria are on the{" "}
            <Link href="/methodology" className="text-blue-400 hover:underline">
              methodology
            </Link>{" "}
            page.
          </p>
        </FaqItem>

        <FaqItem q="Something looks wrong. Can I correct it?">
          <p>
            Yes — every datum is community-correctable. To fix a coverage status, a stale
            rating, or a governance detail, or to propose a new protocol or feed, open an
            issue or PR on{" "}
            <a
              href="https://github.com/rails-finance/neutral-risk"
              className="text-blue-400 hover:underline"
            >
              GitHub
            </a>{" "}
            citing the source. Maintainers verify against the cited source before merge.
          </p>
        </FaqItem>
      </FaqSection>
      </div>
    </div>
  );
}

/** Section panel — flat card (delineated by surface tone, no border) with an icon chip + title
 *  header. The icon differentiates sections by shape; colour stays neutral (palette discipline —
 *  the brand-blue accent lives only in the answer links). Questions inside are split by hairline
 *  row rules. */
function FaqSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-rr-850 p-6 sm:p-8">
      <h2 className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rr-800 text-rr-300">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-semibold text-rr-50">{title}</span>
      </h2>
      <div className="mt-5 divide-y divide-rr-800">{children}</div>
    </section>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <h3 className="text-lg font-semibold text-rr-50">{q}</h3>
      <div className="mt-2 text-sm leading-relaxed text-rr-200">{children}</div>
    </div>
  );
}
