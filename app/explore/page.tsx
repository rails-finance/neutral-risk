import type { Metadata } from "next";
import { GuidedExplorer } from "@/components/guided-explorer";
import { buildExploreData } from "@/lib/explore-data";

export const metadata: Metadata = {
  title: "Guided explorer · Neutral Risk",
  description:
    "Answer a few questions to find the verbatim feed data that matters to you. The explorer routes — it never scores.",
};

export default function ExplorePage() {
  const data = buildExploreData();

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Guided explorer</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-rr-500">
          Not sure where to start? Answer a couple of questions and we&rsquo;ll point you to
          the feeds and protocols that match — then you read what each feed says, verbatim.
          This tool only navigates; it produces no score or recommendation of its own.
        </p>
      </section>

      <GuidedExplorer data={data} />
    </div>
  );
}
