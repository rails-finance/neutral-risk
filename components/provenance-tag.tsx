import type { Provenance } from "@/lib/data/protocols";

const STYLES: Record<Provenance, { label: string; cls: string }> = {
  onchain: { label: "on-chain", cls: "border-green-500/30 bg-green-500/10 text-green-400" },
  verified: { label: "verified", cls: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  "self-reported": { label: "self-reported", cls: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  sample: { label: "sample", cls: "border-rr-500/40 bg-rr-800 text-rr-500" },
};

export function ProvenanceTag({ provenance }: { provenance: Provenance }) {
  const s = STYLES[provenance];
  return (
    <span
      className={`eyebrow inline-flex items-center rounded-md border px-1.5 py-0.5 ${s.cls}`}
      title={`Provenance: ${s.label}`}
    >
      {s.label}
    </span>
  );
}
