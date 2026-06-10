import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { GovernanceControls } from "@/lib/data/protocols";
import { safeByAddress } from "@/lib/governance-snapshot";

/** "Governance at a glance" — a neutral, structured summary of a protocol's control surface, shown
 *  above the sourced prose facts. Where a safeAddress maps into data/governance-snapshot.json, the
 *  multisig threshold + signer count render live from the Safe Transaction Service. Every value is a
 *  structural fact (a capability exists or it doesn't), never a risk judgement — "Immutable" and
 *  "Upgradeable" carry equal weight, per Charter §1. */
export function GovernanceGlance({ controls }: { controls: GovernanceControls }) {
  const safe = controls.safeAddress ? safeByAddress(controls.safeAddress) : undefined;
  const multisig =
    safe && safe.threshold != null && safe.owners != null
      ? { text: `${safe.threshold} / ${safe.owners}`, address: safe.address, live: true }
      : controls.threshold
        ? { text: controls.threshold, address: controls.safeAddress, live: false }
        : null;

  const cells: { label: string; node: ReactNode }[] = [{ label: "Governance", node: controls.type }];
  if (multisig) {
    cells.push({
      label: "Multisig",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono">{multisig.text}</span>
          {multisig.address && (
            <a
              href={`https://etherscan.io/address/${multisig.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              <ExternalLink className="inline h-3 w-3" />
            </a>
          )}
        </span>
      ),
    });
  }
  if (controls.timelock) cells.push({ label: "Timelock", node: <span className="font-mono">{controls.timelock}</span> });
  if (controls.upgradeable !== undefined)
    cells.push({ label: "Core contracts", node: controls.upgradeable ? "Upgradeable" : "Immutable" });
  if (controls.pausable !== undefined) cells.push({ label: "Pause capability", node: controls.pausable ? "Yes" : "No" });

  return (
    <div className="mb-6 rounded-xl bg-rr-850 p-5">
      <h3 className="eyebrow mb-3 text-rr-500">Governance at a glance</h3>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cells.map((c) => (
          <div key={c.label} className="rounded-lg bg-rr-800 px-3.5 py-2.5">
            <dt className="eyebrow text-rr-500">{c.label}</dt>
            <dd className="mt-1 text-sm text-rr-100">{c.node}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-rr-500">
        Structural facts, distilled from the sourced control records below — neutral capabilities, not a risk score.
        {multisig?.live && " Multisig threshold and signer count are fetched live via the Safe API."}
      </p>
    </div>
  );
}
