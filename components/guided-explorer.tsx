"use client";

// Guided exploration flow. A deterministic decision tree that ROUTES users to the verbatim
// data — it never scores, ranks, or answers "is X safe?". Fully inside CHARTER.md.
//
// If AI is ever threaded in, the only charter-safe seam is an intent router that maps a
// natural-language phrase to a destination/filter ONLY (navigation output, never prose),
// added alongside this flow. A generative "is X safe?" answer would synthesise feeds into
// the composite judgement the charter forbids, and is deliberately out of scope.

import { useState } from "react";
import Link from "next/link";
import {
  SearchCheck,
  Scale,
  Filter,
  Lightbulb,
  ArrowRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { formatUsd } from "@/lib/format";
import { CATEGORY_COLOR, type Category } from "@/lib/data/protocols";

export interface ExploreProtocol {
  id: string;
  name: string;
  category: string;
  family?: string;
  versions?: string;
  icon: string;
  tvl: number;
  tvlApplicable: boolean;
  covered: number;
  partial: number;
  control: { id: string; label: string; fact: { label: string; value: string; provenance: string } }[];
}

export interface ExploreFeed {
  id: string;
  name: string;
  short: string;
  focus: string;
  type: string;
  machineReadable: string;
  url: string;
  covers: { protocolId: string; name: string; icon: string; status: string; rating?: string }[];
}

export interface ExploreControl { id: string; label: string; blurb: string }
export interface ExploreLens { id: string; label: string; blurb: string; feedTypes: string[] }

export interface ExploreData {
  protocols: ExploreProtocol[];
  feeds: ExploreFeed[];
  controls: ExploreControl[];
  lenses: ExploreLens[];
  categories: string[];
}

type View =
  | { node: "root" }
  | { node: "pick-protocol" }
  | { node: "pick-category" }
  | { node: "pick-angle" }
  | { node: "pick-control" }
  | { node: "pick-feed" }
  | { node: "result-protocols"; title: string; subtitle: string; ids: string[]; evidenceControl?: string }
  | { node: "result-feed"; feedId: string }
  | { node: "result-lens"; lensId: string };

export function GuidedExplorer({ data }: { data: ExploreData }) {
  const [view, setView] = useState<View>({ node: "root" });
  const [history, setHistory] = useState<View[]>([]);

  function go(next: View) {
    setHistory((h) => [...h, view]);
    setView(next);
  }
  function back() {
    setHistory((h) => {
      const copy = [...h];
      const prev = copy.pop();
      if (prev) setView(prev);
      return copy;
    });
  }
  function reset() {
    setHistory([]);
    setView({ node: "root" });
  }

  return (
    <div className="pt-1">
      {(history.length > 0 || view.node !== "root") && (
        <div className="mb-5 flex items-center gap-2 text-xs">
          <button onClick={back} className="cursor-pointer rounded-full px-2.5 py-1 text-rr-400 transition-colors hover:bg-rr-800 hover:text-rr-50">
            ← Back
          </button>
          <button onClick={reset} className="cursor-pointer rounded-full px-2.5 py-1 text-rr-500 transition-colors hover:bg-rr-800 hover:text-rr-50">
            Start over
          </button>
        </div>
      )}

      {view.node === "root" && (
        <Question
          title="What brings you here?"
          options={[
            { label: "Check a specific protocol", desc: "Jump to one protocol's full feed coverage.", Icon: SearchCheck, phrase: "a specific protocol", onClick: () => go({ node: "pick-protocol" }) },
            { label: "Compare a category", desc: "See all protocols of one kind, side by side.", Icon: Scale, phrase: "a category comparison", onClick: () => go({ node: "pick-category" }) },
            { label: "I care about a specific angle", desc: "Governance control, live monitoring, ratings, or research.", Icon: Filter, phrase: "a specific angle", onClick: () => go({ node: "pick-angle" }) },
            { label: "Understand a risk feed", desc: "What one feed covers and how it assesses it.", Icon: Lightbulb, phrase: "understanding a risk feed", onClick: () => go({ node: "pick-feed" }) },
          ]}
        />
      )}

      {view.node === "pick-protocol" && (
        <div>
          <StepTitle>Which protocol?</StepTitle>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.protocols.map((p) => (
              <Link
                key={p.id}
                href={`/protocol/${p.id}`}
                className="flex items-center gap-2.5 rounded-xl bg-rr-850 px-4 py-3 border border-transparent transition-colors hover:border-brand hover:bg-rr-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/icons/protocols/${p.icon}.png`} alt="" className="h-6 w-6 rounded-md bg-rr-800" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{p.name}</span>
                  <span className="eyebrow flex items-center gap-1.5 truncate text-rr-500">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: CATEGORY_COLOR[p.category as Category] }}
                      aria-hidden="true"
                    />
                    {p.category}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {view.node === "pick-category" && (
        <Question
          title="Which kind of protocol?"
          options={data.categories.map((c) => ({
            label: c,
            desc: `${data.protocols.filter((p) => p.category === c).length} protocols`,
            phrase: `${c.toLowerCase()} protocols`,
            onClick: () =>
              go({
                node: "result-protocols",
                title: c,
                subtitle: `Protocols in ${c}, with how many feeds report on each. Open any to read what each feed says, verbatim.`,
                ids: data.protocols.filter((p) => p.category === c).map((p) => p.id),
              }),
          }))}
        />
      )}

      {view.node === "pick-angle" && (
        <Question
          title="What matters most to you?"
          options={[
            {
              label: "Governance & control",
              desc: "Who can change or pause the protocol — filter by a control fact.",
              phrase: "governance & control",
              onClick: () => go({ node: "pick-control" }),
            },
            ...data.lenses.map((l) => ({
              label: l.label,
              desc: l.blurb,
              phrase: l.label.toLowerCase(),
              onClick: () => go({ node: "result-lens", lensId: l.id }),
            })),
          ]}
        />
      )}

      {view.node === "pick-control" && (
        <Question
          title="Which control property?"
          note="Derived from each protocol's stated governance facts. Results show the supporting fact and its provenance tag — no judgement of ours."
          options={data.controls.map((c) => ({
            label: c.label,
            desc: c.blurb,
            phrase: c.label.toLowerCase(),
            onClick: () => {
              const ids = data.protocols.filter((p) => p.control.some((x) => x.id === c.id)).map((p) => p.id);
              go({
                node: "result-protocols",
                title: c.label,
                subtitle: c.blurb,
                ids,
                evidenceControl: c.id,
              });
            },
          }))}
        />
      )}

      {view.node === "pick-feed" && (
        <div>
          <StepTitle>Which feed?</StepTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.feeds.map((f) => (
              <button
                key={f.id}
                onClick={() => go({ node: "result-feed", feedId: f.id })}
                className="cursor-pointer rounded-xl bg-rr-850 px-4 py-3 text-left border border-transparent transition-colors hover:border-brand hover:bg-rr-800"
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-bold">{f.name}</span>
                  <span className="eyebrow rounded-full bg-rr-900 px-2 py-0.5 text-rr-400">{f.type}</span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-rr-500">{f.focus}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {view.node === "result-protocols" && (
        <ResultProtocols data={data} title={view.title} subtitle={view.subtitle} ids={view.ids} evidenceControl={view.evidenceControl} />
      )}

      {view.node === "result-feed" && <ResultFeed data={data} feedId={view.feedId} />}

      {view.node === "result-lens" && <ResultLens data={data} lensId={view.lensId} />}
    </div>
  );
}

interface QOption {
  label: string;
  desc: string;
  onClick: () => void;
  Icon?: LucideIcon;
  /** Phrase shown in the "showing results for …" status line; falls back to the label. */
  phrase?: string;
}

/**
 * Modern intent step: pick a card (it highlights), then a Continue button appears with a status
 * line. Double-click a card to skip the Continue. Selection is per-mount, so navigating resets it.
 */
function Question({ title, note, options }: { title: string; note?: string; options: QOption[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const chosen = selected !== null ? options[selected] : null;

  return (
    <div>
      <StepTitle>{title}</StepTitle>
      {note && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-rr-500">{note}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => {
          const active = selected === i;
          const Icon = o.Icon;
          return (
            <button
              key={o.label}
              onClick={() => setSelected(i)}
              onDoubleClick={o.onClick}
              aria-pressed={active}
              className={`group relative flex cursor-pointer flex-col gap-4 rounded-xl border px-5 py-5 text-left transition-colors ${
                active
                  ? "border-brand bg-brand/15"
                  : "border-transparent bg-rr-850 hover:border-brand hover:bg-rr-800"
              }`}
            >
              {active && <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-brand" />}
              {Icon && (
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                    active ? "bg-brand/15 text-brand" : "bg-rr-800 text-rr-400"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
              )}
              <span className="block">
                <span className="block text-lg font-bold tracking-tight">{o.label}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-rr-500">{o.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`mt-5 flex items-center justify-between gap-4 pt-4 transition-opacity duration-200 ${
          chosen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="min-w-0 truncate text-xs text-rr-500">
          → showing results for <span className="text-rr-300">{chosen?.phrase ?? chosen?.label.toLowerCase()}</span>
        </span>
        <button
          onClick={() => chosen?.onClick()}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-bright"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-2xl font-bold tracking-tight">{children}</h3>;
}

function ProtocolRow({
  p,
  evidence,
}: {
  p: ExploreProtocol;
  evidence?: { label: string; value: string; provenance: string };
}) {
  return (
    <Link
      href={`/protocol/${p.id}`}
      className="flex items-start gap-3 rounded-xl bg-rr-850 px-4 py-3 border border-transparent transition-colors hover:border-brand hover:bg-rr-800"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/icons/protocols/${p.icon}.png`} alt="" className="mt-0.5 h-7 w-7 rounded-md bg-rr-800" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-bold">
            {p.name}
            {p.versions && <span className="ml-1.5 text-xs font-normal text-rr-500">{p.versions}</span>}
          </span>
          <span className="whitespace-nowrap font-mono text-xs text-rr-500">
            {p.tvlApplicable ? formatUsd(p.tvl) : "vol·"}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-rr-500">
          <span className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: CATEGORY_COLOR[p.category as Category] }}
              aria-hidden="true"
            />
            {p.category}
          </span>
          <span>·</span>
          <span>
            <span className="text-cov-covered">{p.covered}</span>
            <span className="text-rr-500">/</span>
            <span className="text-cov-partial">{p.partial}</span> feeds
          </span>
        </span>
        {evidence && (
          <span className="mt-1.5 block rounded-md bg-rr-950 px-2 py-1 text-xs leading-relaxed text-rr-500">
            <span className="font-medium text-rr-400">{evidence.label}:</span> {evidence.value}{" "}
            <span className="eyebrow ml-1 rounded-sm bg-rr-800 px-1 py-px text-rr-500">
              {evidence.provenance}
            </span>
          </span>
        )}
      </span>
    </Link>
  );
}

function ResultProtocols({
  data,
  title,
  subtitle,
  ids,
  evidenceControl,
}: {
  data: ExploreData;
  title: string;
  subtitle: string;
  ids: string[];
  evidenceControl?: string;
}) {
  const list = data.protocols
    .filter((p) => ids.includes(p.id))
    .sort((a, b) => b.tvl - a.tvl);
  return (
    <div>
      <StepTitle>{title}</StepTitle>
      <p className="mt-2 mb-4 text-sm leading-relaxed text-rr-500">{subtitle}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => (
          <ProtocolRow
            key={p.id}
            p={p}
            evidence={evidenceControl ? p.control.find((c) => c.id === evidenceControl)?.fact : undefined}
          />
        ))}
      </div>
      <Closing />
    </div>
  );
}

function ResultFeed({ data, feedId }: { data: ExploreData; feedId: string }) {
  const f = data.feeds.find((x) => x.id === feedId);
  if (!f) return null;
  const auto = f.machineReadable === "yes" ? "Automated ingestion" : f.machineReadable === "partial" ? "Partly automatable" : "Manually curated";
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <StepTitle>{f.name}</StepTitle>
        <a href={f.url} className="shrink-0 text-xs font-semibold text-brand hover:underline" target="_blank" rel="noreferrer">
          Visit feed ↗
        </a>
      </div>
      <p className="mt-2 mb-3 text-sm leading-relaxed text-rr-400">{f.focus}</p>
      <div className="eyebrow mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-rr-800 px-2.5 py-1 text-rr-400">{f.type}</span>
        <span className="rounded-full bg-rr-800 px-2.5 py-1 text-rr-400">{auto}</span>
        <span className="rounded-full bg-rr-800 px-2.5 py-1 text-rr-400">{f.covers.length} protocols reported on</span>
      </div>
      {f.covers.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {f.covers.map((c) => {
            const p = data.protocols.find((x) => x.id === c.protocolId);
            if (!p) return null;
            return (
              <Link
                key={c.protocolId}
                href={`/protocol/${p.id}`}
                className="flex items-center gap-3 rounded-xl bg-rr-850 px-4 py-3 border border-transparent transition-colors hover:border-brand hover:bg-rr-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/icons/protocols/${p.icon}.png`} alt="" className="h-6 w-6 rounded-md bg-rr-800" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{p.name}</span>
                  {c.rating && <span className="block truncate text-xs text-rr-500">&ldquo;{c.rating}&rdquo;</span>}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${c.status === "covered" ? "bg-cov-covered" : "cov-hatch"}`} />
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-rr-500">No covered protocols recorded yet for this feed.</p>
      )}
      <Closing />
    </div>
  );
}

function ResultLens({ data, lensId }: { data: ExploreData; lensId: string }) {
  const lens = data.lenses.find((l) => l.id === lensId);
  if (!lens) return null;
  const feeds = data.feeds.filter((f) => lens.feedTypes.includes(f.type));
  return (
    <div>
      <StepTitle>{lens.label}</StepTitle>
      <p className="mt-2 mb-4 text-sm leading-relaxed text-rr-500">
        {lens.blurb} These feeds publish through this lens — open one to see what it covers and what it says, verbatim.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {feeds.map((f) => (
          <a
            key={f.id}
            href={f.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl bg-rr-850 px-4 py-3 text-left border border-transparent transition-colors hover:border-brand hover:bg-rr-800"
          >
            <span className="flex items-center justify-between">
              <span className="text-sm font-bold text-rr-50">{f.name}</span>
              <span className="text-xs text-rr-500">{f.covers.length} protocols</span>
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-rr-500">{f.focus}</span>
          </a>
        ))}
      </div>
      <Closing />
    </div>
  );
}

function Closing() {
  return (
    <p className="mt-6 text-xs text-rr-500">
      We show what the feeds publish — you decide. Nothing here is a Rails score or
      recommendation.
    </p>
  );
}
