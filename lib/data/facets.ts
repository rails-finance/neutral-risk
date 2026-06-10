// Neutral, fact-only facets used by the guided explorer to ROUTE users to the verbatim
// data — never to score or judge. Every facet here is a control *fact* the protocol (or a
// feed) already states; the explorer surfaces the supporting fact + its provenance tag as
// evidence, so a match is verifiable, not an assertion of ours. See CHARTER.md.

import { PROTOCOLS, type GovernanceFact, type Protocol } from "./protocols";
import type { FeedType } from "./feeds";

/** A control property a protocol may exhibit, derived from its stated governance facts. */
export interface ControlProperty {
  id: string;
  /** Short filter label. */
  label: string;
  /** One-liner shown as the option description. */
  blurb: string;
  /** Matches a governance fact that evidences this property. */
  test: (f: GovernanceFact) => boolean;
}

export const CONTROL_PROPERTIES: ControlProperty[] = [
  {
    id: "immutable",
    label: "Immutable core",
    blurb: "No upgrades or admin keys over the core contracts.",
    test: (f) =>
      /immutable|non-upgradeable|not upgradeable|no upgrades|fixed at deploy|no admin key|no privileged owner/i.test(
        `${f.label} ${f.value}`,
      ),
  },
  {
    id: "upgradeable",
    label: "Upgradeable contracts",
    blurb: "Core or key contracts can be upgraded (typically via governance).",
    test: (f) =>
      /upgradeable/i.test(`${f.label} ${f.value}`) &&
      !/non-upgradeable|not upgradeable|no upgrades|^none/i.test(f.value),
  },
  {
    id: "onchain-gov",
    label: "On-chain DAO governance",
    blurb: "Protocol changes go through on-chain, token-holder voting.",
    test: (f) => {
      const s = `${f.label} ${f.value}`;
      const govish = /govern|voting|\bDAO\b|governor/i.test(s);
      return (f.provenance === "onchain" && govish) || /on-chain|Governor/i.test(f.value);
    },
  },
  {
    id: "guardian",
    label: "Emergency guardian / pause",
    blurb: "A guardian or multisig can pause or intervene in an emergency.",
    test: (f) => /guardian|pause|emergency|gateseal/i.test(`${f.label} ${f.value}`),
  },
  {
    id: "timelock",
    label: "Timelock on changes",
    blurb: "Privileged changes are subject to an enforced time delay.",
    test: (f) => /timelock|\bdelay\b/i.test(`${f.label} ${f.value}`),
  },
];

/** For one protocol, the control properties it exhibits, each with the supporting fact. */
export function controlFacts(p: Protocol): { property: ControlProperty; fact: GovernanceFact }[] {
  const out: { property: ControlProperty; fact: GovernanceFact }[] = [];
  for (const cp of CONTROL_PROPERTIES) {
    const fact = p.governance.find(cp.test);
    if (fact) out.push({ property: cp, fact });
  }
  return out;
}

/** Protocols exhibiting a given control property, with the supporting fact. */
export function protocolsWithControl(propertyId: string): { protocol: Protocol; fact: GovernanceFact }[] {
  const cp = CONTROL_PROPERTIES.find((c) => c.id === propertyId);
  if (!cp) return [];
  const out: { protocol: Protocol; fact: GovernanceFact }[] = [];
  for (const p of PROTOCOLS) {
    const fact = p.governance.find(cp.test);
    if (fact) out.push({ protocol: p, fact });
  }
  return out;
}

/** The "what angle do you care about" lenses, mapped to neutral feed types. */
export interface Lens {
  id: string;
  label: string;
  blurb: string;
  feedTypes: FeedType[];
}

export const LENSES: Lens[] = [
  {
    id: "decentralization",
    label: "Decentralization & ratings",
    blurb: "How feeds rate control, upgradeability, and decentralization maturity.",
    feedTypes: ["Rating"],
  },
  {
    id: "live-monitoring",
    label: "Live market monitoring",
    blurb: "Dashboards and alerting for liquidations, collateral health, and live events.",
    feedTypes: ["Dashboard", "Monitoring"],
  },
  {
    id: "research",
    label: "In-depth research",
    blurb: "Long-form protocol and collateral risk research and parameter analysis.",
    feedTypes: ["Research"],
  },
];
