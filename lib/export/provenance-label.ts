// Inline provenance tag for Markdown exports — mirrors the on-page <ProvenanceTag> so a datum
// keeps its origin when copied into an LLM context. `sample` is the prototype placeholder; it
// MUST stay visible in exports so a downstream model never reads sample data as verified.
import type { Provenance } from "@/lib/data/protocols";

export function provTag(p: Provenance): string {
  return `[${p}]`;
}
