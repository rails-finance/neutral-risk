import Link from "next/link";
import { FEEDS } from "@/lib/data/feeds";
import { PROTOCOL_COUNT, DEPLOYMENT_COUNT } from "@/lib/data/protocols";

export const metadata = {
  title: "About — Neutral Risk",
  description:
    "Who builds Neutral Risk, the Ethereum Foundation RFP it was built for, and how it stays a neutral public good.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">About</h1>

      <p className="mt-4 text-sm leading-relaxed text-rr-200">
        <strong className="text-rr-50">Neutral Risk</strong> is a neutral public good that puts what
        independent DeFi risk feeds publish about Ethereum protocols side by side — attributed and
        verbatim. It aggregates {FEEDS.length} feeds across {PROTOCOL_COUNT} protocols
        ({DEPLOYMENT_COUNT} versioned deployments) and{" "}
        <strong>never produces a risk score of its own</strong>; where feeds disagree, it shows the
        disagreement rather than resolving it. The{" "}
        <Link href="/methodology" className="text-blue-400 hover:underline">methodology</Link>{" "}
        explains how it works, and the{" "}
        <Link href="/faq" className="text-blue-400 hover:underline">FAQ</Link> answers the common
        questions.
      </p>

      {/* Who builds it */}
      <section className="mt-8">
        <h2 className="section-title text-rr-500">Who builds it</h2>
        <p className="mt-2 text-sm leading-relaxed text-rr-200">
          The registry is stewarded and verified by the team at{" "}
          <a href="https://rails.finance" className="text-blue-400 hover:underline">Rails</a>, which
          renders the full event-level on-chain history of each protocol — so the feeds&rsquo;
          assessments can be checked against what actually happened on-chain. The feeds tell you what
          they <em>say</em>; the verification layer shows what <em>is</em>.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-rr-500">
          To keep the registry neutral, Rails is deliberately <strong>not</strong> a rated feed in the
          matrix — a steward grading itself alongside the feeds would not be neutral. It earns no
          rating column, and every maintainer relationship to a listed protocol or feed is disclosed
          in{" "}
          <a
            href="https://github.com/rails-finance/neutral-risk/blob/main/DISCLOSURES.md"
            className="text-blue-400 hover:underline"
          >
            DISCLOSURES.md
          </a>
          .
        </p>
      </section>

      {/* Origin — the EF RFP */}
      <section className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <h2 className="section-title text-blue-400">Origin — the Ethereum Foundation RFP</h2>
        <p className="mt-2 text-sm leading-relaxed text-rr-200">
          Neutral Risk was built in response to the Ethereum Foundation&rsquo;s{" "}
          <em>Neutral DeFi Risk Intelligence Aggregator</em> RFP. It is an independent prototype
          submitted under that RFP — <strong>not funded, endorsed, or operated by the Ethereum
          Foundation</strong>.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-rr-200">
          The Foundation&rsquo;s role is a deliberate neutrality backstop rather than an editorial
          one: under the{" "}
          <a
            href="https://github.com/rails-finance/neutral-risk/blob/main/CHARTER.md"
            className="text-blue-400 hover:underline"
          >
            project charter
          </a>
          , the core no-scoring constraint cannot be relaxed without the Ethereum Foundation&rsquo;s
          written agreement.
        </p>
      </section>

      {/* A public good */}
      <section className="mt-8">
        <h2 className="section-title text-rr-500">A public good</h2>
        <p className="mt-2 text-sm leading-relaxed text-rr-200">
          The project is open source under <strong>AGPL-3.0</strong> and built static-by-construction
          to be IPFS/ENS-publishable, so it can outlive any single maintainer. Every datum is
          community-correctable: open an issue or PR on{" "}
          <a
            href="https://github.com/rails-finance/neutral-risk"
            className="text-blue-400 hover:underline"
          >
            GitHub
          </a>{" "}
          citing a source.
        </p>
      </section>

      {/* Prototype status — the disclaimer that used to live in the footer */}
      <p className="mt-8 text-xs leading-relaxed text-rr-500">
        <strong className="text-rr-400">Prototype status:</strong> most feed ratings shown are
        illustrative samples pending provider verification, each labelled with a{" "}
        <Link href="/methodology" className="text-blue-400 hover:underline">provenance tag</Link>. The
        site-wide status reads <span className="text-status-warn">Sample data</span> until verified
        data replaces them.
      </p>
    </div>
  );
}
