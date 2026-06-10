import { PROTOCOLS, PROTOCOL_BY_ID, CATEGORIES } from "@/lib/data/protocols";
import { FEEDS } from "@/lib/data/feeds";
import { COVERAGE, coverageCount } from "@/lib/data/coverage";
import { CONTROL_PROPERTIES, LENSES, controlFacts } from "@/lib/data/facets";
import { protocolTvl } from "@/lib/tvl";
import type { ExploreData } from "@/components/guided-explorer";

/**
 * Assembles the data the guided explorer needs. Shared by the standalone /explore route and the
 * home-page Explorer tab so the two stay in lockstep.
 */
export function buildExploreData(): ExploreData {
  return {
    categories: [...CATEGORIES],
    controls: CONTROL_PROPERTIES.map((c) => ({ id: c.id, label: c.label, blurb: c.blurb })),
    lenses: LENSES.map((l) => ({ id: l.id, label: l.label, blurb: l.blurb, feedTypes: [...l.feedTypes] })),
    protocols: PROTOCOLS.map((p) => {
      const c = coverageCount(p.id);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        family: p.family,
        versions: p.versions,
        icon: p.icon,
        tvl: protocolTvl(p),
        tvlApplicable: p.tvlApplicable,
        covered: c.covered,
        partial: c.partial,
        control: controlFacts(p).map(({ property, fact }) => ({
          id: property.id,
          label: property.label,
          fact: { label: fact.label, value: fact.value, provenance: fact.provenance },
        })),
      };
    }),
    feeds: FEEDS.map((f) => {
      const covers = PROTOCOLS.flatMap((p) => {
        const cell = COVERAGE[p.id][f.id];
        if (cell.status === "not-covered") return [];
        return [{
          protocolId: p.id,
          name: p.name,
          icon: PROTOCOL_BY_ID[p.id].icon,
          status: cell.status,
          rating: cell.rating,
        }];
      });
      return {
        id: f.id,
        name: f.name,
        short: f.short,
        focus: f.focus,
        type: f.type,
        machineReadable: f.machineReadable,
        url: f.url,
        covers,
      };
    }),
  };
}
