import { Sparkles, AlertTriangle, ExternalLink, ArrowRight, CornerDownRight } from "lucide-react";
import type { AiAssessment, AiAlert } from "@/lib/data/ai-preview";

// The AI intelligence layer's hero card. Styled with a violet accent so it reads as a distinct,
// non-authoritative layer — never like the green/blue/amber factual provenance tags. This is a
// FRONTEND MOCKUP: content is illustrative ("preview"), with no live model call behind it.

const STATUS: Record<AiAlert["status"], { label: string; cls: string }> = {
  open: { label: "open", cls: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  updated: { label: "updated", cls: "border-violet-500/40 bg-violet-500/10 text-violet-300" },
  resolved: { label: "resolved", cls: "border-rr-500/40 bg-rr-800 text-rr-400" },
};

function AiBadge() {
  return (
    <span className="eyebrow inline-flex items-center gap-1 rounded-md border border-violet-500/40 bg-violet-500/10 px-1.5 py-0.5 text-violet-300">
      <Sparkles className="h-3 w-3" /> AI
    </span>
  );
}

function CiteChip({ cite }: { cite: string }) {
  return (
    <span className="eyebrow inline-flex items-center gap-0.5 whitespace-nowrap rounded-md bg-rr-800 px-1.5 py-0.5 align-middle text-rr-500">
      <CornerDownRight className="h-2.5 w-2.5" /> {cite}
    </span>
  );
}

function WhatChanged({ alert, protocolName }: { alert: AiAlert; protocolName: string }) {
  const s = STATUS[alert.status];
  const rows: [string, string][] = [
    ["Who", alert.who],
    ["When", alert.when],
    ["Why", alert.why],
    ["What", alert.what],
    ["Risk", alert.implications],
  ];
  return (
    <div className="mt-4 rounded-lg border border-violet-500/20 bg-rr-900/60 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
        <span className="eyebrow text-rr-300">What changed</span>
        <span className="eyebrow rounded-md border border-rr-600 bg-rr-850 px-1.5 py-0.5 text-rr-400">
          {alert.category}
        </span>
        <span className="text-xs text-rr-500">· {alert.freshness}</span>
        <span className={`eyebrow ml-auto rounded-md border px-1.5 py-0.5 ${s.cls}`}>
          {s.label}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-rr-100">{alert.title}</p>

      <dl className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 text-sm leading-relaxed">
            <dt className="eyebrow w-12 shrink-0 text-rr-500">{k}</dt>
            <dd className="text-rr-300">{v}</dd>
          </div>
        ))}
      </dl>

      {(alert.before || alert.after) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-rr-850 px-4 py-3 font-mono text-xs">
          <span className="text-rr-500">before</span>
          <span className="text-rr-300">{alert.before}</span>
          <ArrowRight className="h-3 w-3 text-rr-500" />
          <span className="text-rr-500">after</span>
          <span className="text-rr-100">{alert.after}</span>
          {alert.txUrl && (
            <a
              href={alert.txUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-blue-400 hover:underline"
            >
              tx <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {alert.updates && alert.updates.length > 0 && (
        <ol className="mt-3 space-y-1 border-l border-rr-700 pl-3">
          {alert.updates.map((u, i) => (
            <li key={i} className="text-xs leading-relaxed text-rr-500">
              <span className="font-mono text-rr-400">{u.at}</span> — {u.note}
            </li>
          ))}
        </ol>
      )}

      <p className="mt-3 text-xs leading-relaxed text-rr-500">
        Investigative summary of a detected change to {protocolName}. Neutral and sourced — not a
        severity rating or risk score.
      </p>
    </div>
  );
}

export function AiCard({ ai, protocolName }: { ai: AiAssessment; protocolName: string }) {
  return (
    <section className="rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <AiBadge />
        <h2 className="section-title text-rr-300">AI assessment</h2>
        <span className="ml-auto inline-flex items-center gap-2 text-xs text-rr-500">
          <span>updated {ai.freshness}</span>
          <span>·</span>
          <span>{ai.model}</span>
          <span>·</span>
          <span className="eyebrow rounded-md border border-violet-500/30 px-1.5 py-0.5 text-violet-300/80">
            preview
          </span>
        </span>
      </div>

      {/* Summary */}
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-rr-200">{ai.summary}</p>

      {/* Observations with citation chips */}
      <ul className="mt-4 space-y-2">
        {ai.observations.map((o, i) => (
          <li key={i} className="flex flex-wrap items-start gap-x-2 gap-y-1 text-sm leading-relaxed text-rr-300">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400/70" />
            <span className="min-w-0">
              {o.text} <CiteChip cite={o.cite} />
            </span>
          </li>
        ))}
      </ul>

      {/* What changed (alert) */}
      {ai.alert && <WhatChanged alert={ai.alert} protocolName={protocolName} />}

      {/* Standing disclaimer */}
      <p className="mt-4 border-t border-rr-700 pt-3 text-xs leading-relaxed text-rr-500">
        AI-generated summary of facts already in this registry — <span className="text-rr-400">not a
        Rails assessment, not a risk score, and not a ranking</span>. Per the project charter, the
        registry never produces its own composite risk judgement. Verify every point against the
        linked sources below. <span className="text-rr-400">This is an illustrative preview</span> of
        a proposed feature; the content is not live.
      </p>
    </section>
  );
}
