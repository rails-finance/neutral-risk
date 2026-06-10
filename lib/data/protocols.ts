// Seed protocol list — the top Ethereum DeFi protocols by funds at risk (TVL, or
// volume where TVL is not applicable). Ranked against DefiLlama; see data/tvl-snapshot.json.
//
// Governance facts are DeFiScan-style *control* facts (who holds keys, upgradeability,
// timelock) — distinct from on-chain governance *voting* activity. Each fact carries a
// provenance tag. In this prototype, specifics not yet confirmed against a primary source
// are tagged "sample" and must be verified before they lose that tag.

export type Provenance = "onchain" | "verified" | "self-reported" | "sample";

export type Category = "Lending" | "DEX / AMM" | "Swap Aggregator" | "Yield / Vault" | "Liquid Staking";

export const CATEGORIES: Category[] = [
  "Lending",
  "DEX / AMM",
  "Swap Aggregator",
  "Yield / Vault",
  "Liquid Staking",
];

/** Category identity colours — one hue per protocol kind, used site-wide as a small identifying
 *  mark (a dot beside the category label, the scatter-map points, the active filter chip) so e.g.
 *  "DEX / AMM" reads the same teal everywhere. Charter-safe: category is a neutral external fact,
 *  never a risk judgement. The palette deliberately avoids the pink-violet coverage ramp and the
 *  brand blue, so the three colour systems (coverage · category · brand) never collide. */
export const CATEGORY_COLOR: Record<Category, string> = {
  Lending: "#56b6e6", // sky
  "DEX / AMM": "#2dd4bf", // teal
  "Swap Aggregator": "#f5bf4f", // amber
  "Yield / Vault": "#4ade80", // green
  "Liquid Staking": "#fb923c", // orange
};

export interface GovernanceFact {
  label: string;
  value: string;
  provenance: Provenance;
  source?: string;
}

/** Structured, glanceable summary of a protocol's control surface — a neutral "governance at a
 *  glance" view that distils the sourced GovernanceFacts below it into comparable fields. Every
 *  field is a structural FACT (a capability exists or it doesn't), never a risk judgement:
 *  upgradeable ≠ unsafe, immutable ≠ safe, a pause path ≠ danger. Rendered above the prose facts,
 *  which carry the authoritative provenance tag + source for each datum. */
export interface GovernanceControls {
  /** Governance model, e.g. "DAO (on-chain)" / "None (governance-free)". */
  type: string;
  /** Controlling multisig threshold as "N/M". Omit where there is no single controlling multisig. */
  threshold?: string;
  /** Full checksummed Safe address. When present in data/governance-snapshot.json, the threshold +
   *  owner count render live from the Safe Transaction Service (refreshed by `npm run refresh:governance`). */
  safeAddress?: string;
  /** Execution delay on privileged actions, e.g. "2 days" / "None". */
  timelock?: string;
  /** Can core contracts be changed by an admin/governance key? false = immutable core. Omit where
   *  our sourced facts don't establish it (don't assert what isn't sourced). */
  upgradeable?: boolean;
  /** Can a privileged role pause/freeze the protocol? Omit where not established from a primary source. */
  pausable?: boolean;
}

/** A control action (upgrade, parameter change, key rotation) over the protocol's contracts.
 * Designed to be rendered from chain truth via the verification layer (Rails/Sieve) — DeFiScan
 * *rates* control; Rails *proves* it. In this prototype the entries are provenance-tagged
 * samples; production links each to its on-chain transaction. Neutral facts, never a score. */
export interface ControlAction {
  date: string; // ISO
  action: string;
  detail: string;
  provenance: Provenance;
  txUrl?: string; // on-chain proof (production)
}

/** A material, sourced risk event affecting the protocol. Presented as neutral fact, not a
 * Rails assessment. The RFP's protocol detail page calls for incident history. */
export interface Incident {
  date: string; // ISO
  title: string;
  summary: string;
  provenance: Provenance;
  source?: string;
  /** Related collateral asset, if the incident originated at the asset level. */
  assetId?: string;
}

export interface Protocol {
  id: string;
  name: string;
  category: Category;
  family?: string; // groups versioned protocols in the matrix
  versions?: string;
  notes: string;
  /** DefiLlama slugs whose TVL is summed for this protocol. */
  tvlSlugs: string[];
  /** false → TVL not the right metric (swap aggregators); show volume note. */
  tvlApplicable: boolean;
  icon: string;
  /** Structured control-surface summary (the "governance at a glance" strip). Optional: omit and the
   *  strip is skipped, leaving the prose facts below. */
  controls?: GovernanceControls;
  governance: GovernanceFact[];
  // controlTimeline now lives in data/control-timeline.json (rendered from Sieve); see
  // lib/control-timeline.ts. The ControlAction type above remains the snapshot's row shape.
  incidents?: Incident[];
  links: { defillama: string; site?: string; railsExplorer?: string };
}

const llama = (slug: string) => `https://defillama.com/protocol/${slug}`;
const rails = (p: string) => `https://rails-explorer.vercel.app/activity?protocol=${p}`;

export const PROTOCOLS: Protocol[] = [
  {
    id: "spark",
    name: "Spark",
    category: "Lending",
    family: "Sky",
    notes: "Sky sub-protocol. SparkLend and sUSDS.",
    tvlSlugs: ["sparklend"],
    tvlApplicable: true,
    icon: "spark",
    controls: { type: "DAO (Sky / Maker)", upgradeable: true, pausable: true },
    governance: [
      { label: "Governance", value: "Sky (Maker) governance → Spark SubDAO (SparkLend is an Aave v3 fork)", provenance: "verified", source: "https://github.com/sparkdotfi/spark-address-registry" },
      { label: "Upgradeability", value: "Upgradeable Pool proxy (0xC13e…E987); impl set via PoolAddressesProvider (0x02C3…93eE)", provenance: "onchain", source: "https://etherscan.io/address/0xC13e21B648A5Ee794902342038FF3aDAB66BE987" },
      { label: "Admin control", value: "Owner = Spark SubDAO Proxy (0x3300…f8c4), governed by the Sky MCD Chief", provenance: "verified", source: "https://github.com/sparkdotfi/sparklend-freezer" },
      { label: "Timelock", value: "Sky GSM pause-proxy delay (MCD_PAUSE_PROXY 0xBE8E…98FB)", provenance: "verified", source: "https://github.com/sparkdotfi/spark-address-registry" },
    ],
    incidents: [
      {
        date: "2026-04-18",
        title: "Kelp rsETH bridge exploit — markets paused",
        summary:
          "SparkLend paused its rsETH markets in the same window as the Kelp DAO rsETH exploit. It subsequently saw large deposit inflows as users rotated out of affected venues.",
        provenance: "verified",
        source: "https://thedefiant.io/news/defi/sparklend-tvl-surges-by-usd1b-since-kelp-exploit",
        assetId: "rseth",
      },
    ],
    links: { defillama: llama("sparklend"), site: "https://spark.fi", railsExplorer: rails("spark") },
  },
  {
    id: "aave-v3",
    name: "Aave V3",
    category: "Lending",
    notes: "Live Aave lending protocol (V3.x). Pooled, cross-collateral markets; stETH/USDC flagship reserves.",
    tvlSlugs: ["aave-v3"],
    tvlApplicable: true,
    icon: "aave-v3",
    controls: { type: "DAO (on-chain)", upgradeable: true, pausable: true },
    governance: [
      { label: "Governance", value: "Aave Governance V3 (on-chain, AAVE/stkAAVE voting)", provenance: "onchain", source: "https://governance.aave.com" },
      { label: "Upgradeability", value: "Upgradeable; controlled by governance executors", provenance: "verified" },
      { label: "Guardian", value: "Protocol & Emergency Guardian multisigs", provenance: "verified" },
      { label: "Timelock", value: "Short/long executor timelocks", provenance: "verified" },
    ],
    incidents: [
      {
        date: "2026-04-18",
        title: "Kelp rsETH bridge exploit — collateral exposure",
        summary:
          "After ~$292M of unbacked rsETH was minted via a Kelp DAO bridge exploit, the Aave Guardian froze rsETH and wrsETH markets within the hour. Aave carried the largest exposure (~$196M) and faced an estimated $123M–$230M in potential bad debt; it launched the 'DeFi United' recovery initiative on Apr 23.",
        provenance: "verified",
        source: "https://governance.aave.com/t/rseth-incident-report-april-20-2026/24580",
        assetId: "rseth",
      },
      {
        date: "2022-11",
        title: "CRV short / bad debt (market risk, not an exploit)",
        summary:
          "A trader borrowed ~92M CRV against USDC on Aave v2 attempting a short squeeze; the liquidation left ~$1.6M of CRV bad debt under thin liquidity. The attempt failed and the Aave DAO subsequently cleared the deficit. Core contracts were not exploited. (Incident predates V3; retained as Aave-lending market-risk history.)",
        provenance: "verified",
        source: "https://thedefiant.io/news/defi/crv-trade-aave-bad-debt",
      },
    ],
    links: { defillama: llama("aave-v3"), site: "https://aave.com", railsExplorer: rails("aave-v3") },
  },
  {
    id: "aave-v4",
    name: "Aave V4",
    category: "Lending",
    notes: "Next-gen hub-and-spoke architecture (Liquidity Hub + isolated Spokes). Launched Mar 2026 with conservative initial markets; small mainnet TVL so far.",
    tvlSlugs: ["aave-v4"],
    tvlApplicable: true,
    icon: "aave-v4",
    controls: { type: "DAO (on-chain)", upgradeable: true },
    governance: [
      { label: "Governance", value: "Aave Governance V3 (shared AAVE/stkAAVE voting)", provenance: "verified", source: "https://governance.aave.com" },
      { label: "Architecture", value: "Hub-and-spoke: a unified Liquidity Hub with isolated Spoke markets", provenance: "verified", source: "https://governance.aave.com/t/hubs-spokes-in-aave-v4-a-risk-centric-analysis/23907" },
      { label: "Upgradeability", value: "Upgradeable; governance-controlled (new V4 contracts)", provenance: "sample" },
      { label: "Status", value: "Launched Mar 2026 with conservative initial markets", provenance: "verified" },
    ],
    links: { defillama: llama("aave-v4"), site: "https://aave.com", railsExplorer: rails("aave-v4") },
  },
  {
    id: "morpho",
    name: "Morpho",
    category: "Lending",
    family: "Morpho",
    notes: "Core lending protocol (Morpho Blue). See also Morpho Vaults under Yield.",
    tvlSlugs: ["morpho-blue"],
    tvlApplicable: true,
    icon: "morpho",
    controls: { type: "DAO (on-chain)", safeAddress: "0xcBa28b38103307Ec8dA98377ffF9816C164f9AFa", upgradeable: false, pausable: false },
    governance: [
      { label: "Core", value: "Morpho Blue is immutable (no upgrades to core)", provenance: "verified", source: "https://docs.morpho.org" },
      { label: "Governance", value: "Morpho DAO governs incentives & enabled IRMs/LLTVs", provenance: "verified" },
      { label: "Markets", value: "Permissionless market creation", provenance: "onchain" },
      { label: "Admin control", value: "Owner (Morpho DAO 5/9 multisig 0xcBa2…9AFa) can only whitelist IRMs/LLTVs + set a capped fee; no control over user funds", provenance: "verified", source: "https://docs.morpho.org/governance/organization/morpho-dao/" },
    ],
    incidents: [
      {
        date: "2026-04-18",
        title: "Kelp rsETH bridge exploit — limited exposure",
        summary:
          "During the same Kelp DAO rsETH exploit that hit several lending markets, Morpho's exposure was ~$1M, confined to two isolated markets, with other vaults unaffected — a consequence of the isolated-market architecture rather than shared pools.",
        provenance: "verified",
        source: "https://defiprime.com/kelpdao-rseth-exploit",
        assetId: "rseth",
      },
    ],
    links: { defillama: llama("morpho-blue"), site: "https://morpho.org", railsExplorer: rails("morpho") },
  },
  {
    id: "fluid",
    name: "Fluid",
    category: "Lending",
    family: "Instadapp",
    notes: "Lending and DEX hybrid (Instadapp).",
    tvlSlugs: ["fluid-lending"],
    tvlApplicable: true,
    icon: "default",
    controls: { type: "DAO (on-chain)", timelock: "2 days", upgradeable: true },
    governance: [
      { label: "Governance", value: "FLUID token DAO; Compound-style GovernorBravo (0x0204…fA1B), ~3-day vote", provenance: "onchain", source: "https://etherscan.io/address/0x0204Cd037B2ec03605CFdFe482D8e257C765fA1B" },
      { label: "Upgradeability", value: "Upgradeable; admin rights moved from team multisig to the Governance Timelock (IGP#1)", provenance: "onchain", source: "https://gov.fluid.io/t/gov-acceptance-of-admin-rights/66" },
      { label: "Admin control", value: "Protocol admin = InstaTimelock (0xC7Cb…0eFC), itself controlled by DAO governance", provenance: "onchain", source: "https://etherscan.io/address/0xC7Cb1dE2721BFC0E0DA1b9D526bCdC54eF1C0eFC" },
      { label: "Timelock", value: "InstaTimelock delay 2 days (MIN 2d / MAX 30d)", provenance: "onchain", source: "https://etherscan.io/address/0xC7Cb1dE2721BFC0E0DA1b9D526bCdC54eF1C0eFC" },
    ],
    incidents: [
      {
        date: "2026-05-27",
        title: "Rewards Merkle-distributor key compromise",
        summary:
          "A compromised proposer/approver key was used to submit empty-proof Merkle claims, draining ~125K FLUID and ~51.9K GHO from rewards-distributor contracts. The core lending protocol and user deposits were unaffected; compromised roles were rotated out.",
        provenance: "verified",
        source: "https://www.cryptotimes.io/2026/05/31/fluid-protocol-loses-125k-fluid-51-9k-gho-in-key-compromise-attack/",
      },
      {
        date: "2026-04-18",
        title: "Kelp rsETH bridge exploit — positions paused",
        summary:
          "Fluid paused rsETH positions during the Kelp DAO rsETH exploit, among the lending venues that froze the asset within the hour of the unbacked mint.",
        provenance: "verified",
        source: "https://coinedition.com/nine-defi-protocols-frozen-after-293-million-kelpdao-rseth-exploit/",
        assetId: "rseth",
      },
    ],
    links: { defillama: llama("fluid-lending"), site: "https://fluid.io" },
  },
  {
    id: "gearbox",
    name: "Gearbox",
    category: "Lending",
    notes: "Credit-account leverage protocol.",
    tvlSlugs: ["gearbox"],
    tvlApplicable: true,
    icon: "gearbox",
    controls: { type: "DAO (on-chain)", safeAddress: "0xA7D5DDc1b8557914F158076b228AA91eF613f1D5", timelock: "2 days", upgradeable: true },
    governance: [
      { label: "Governance", value: "GEAR DAO; Snapshot vote → on-chain Governor (0x29B9…f2c7) + Timelock", provenance: "verified", source: "https://docs.gearbox.finance/governance/setup" },
      { label: "Upgradeability", value: "V3 params/contracts changed via Governor + ControllerTimelockV3, behind a 2-day timelock", provenance: "onchain", source: "https://github.com/Gearbox-protocol/security/blob/main/bug-bounty/v3-scope.md" },
      { label: "Admin control", value: "Technical multisig (0xA7D5…f1D5) queues proposals; veto-admin multisig can block", provenance: "onchain", source: "https://etherscan.io/address/0xA7D5DDc1b8557914F158076b228AA91eF613f1D5" },
      { label: "Timelock", value: "Timelock (0xa133…f23b): 2-day delay; permissionless execution after delay", provenance: "onchain", source: "https://etherscan.io/address/0xa133C9A92Fb8dDB962Af1cbae58b2723A0bdf23b" },
    ],
    links: { defillama: llama("gearbox"), site: "https://gearbox.fi", railsExplorer: rails("gearbox-v3") },
  },
  {
    id: "euler",
    name: "Euler",
    category: "Lending",
    notes: "Modular vault lending (Euler v2 / EVK).",
    tvlSlugs: ["euler-v2"],
    tvlApplicable: true,
    icon: "euler",
    controls: { type: "DAO (on-chain)", threshold: "4/8", timelock: "48 hours", upgradeable: true, pausable: true },
    governance: [
      { label: "Governance", value: "EUL token DAO (OZ Governor, on-chain voting), overseen by the Euler Foundation", provenance: "verified", source: "https://docs.euler.finance/euler-dao/treasury/" },
      { label: "Upgradeability", value: "EVK vaults deployed via factory; upgradeability optional per vault, routed through an OZ TimelockController", provenance: "verified", source: "https://docs.euler.finance/security/pause-and-upgrade/" },
      { label: "Admin control", value: "Operational 4/8 Safe (6 Euler Labs + 2 Foundation); GovernorAccessControlEmergency role model", provenance: "verified", source: "https://forum.euler.finance/t/euler-foundation-multisig-update/1703" },
      { label: "Timelock", value: "Dual timelock — Admin (governor control) + Wildcard (routine params), both 48h min delay", provenance: "verified", source: "https://docs.euler.finance/security/dao-vaults-governance/" },
    ],
    incidents: [
      {
        date: "2023-03-13",
        title: "Flash-loan exploit (donateToReserves missing health check)",
        summary:
          "~$197M was drained from Euler's lending pools via a missing liquidity check in donateToReserves (added after the audited code). The attacker subsequently returned essentially all recoverable funds, making victims effectively whole.",
        provenance: "verified",
        source: "https://www.chainalysis.com/blog/euler-finance-flash-loan-attack/",
      },
    ],
    links: { defillama: llama("euler-v2"), site: "https://euler.finance", railsExplorer: rails("euler-v2") },
  },
  {
    id: "compound-v3",
    name: "Compound V3",
    category: "Lending",
    notes: "Comet — current Compound version. Isolated single-borrow-asset markets (USDC/USDT/WETH/WBTC).",
    tvlSlugs: ["compound-v3"],
    tvlApplicable: true,
    icon: "compound",
    controls: { type: "DAO (on-chain)", upgradeable: true, pausable: true },
    governance: [
      { label: "Governance", value: "Compound Governor Bravo (on-chain, COMP voting)", provenance: "onchain", source: "https://compound.finance/governance" },
      { label: "Upgradeability", value: "Comet is upgradeable via governance", provenance: "verified" },
      { label: "Timelock", value: "Governance Timelock", provenance: "onchain" },
      { label: "Guardian", value: "Pause guardian multisig", provenance: "verified" },
    ],
    links: { defillama: llama("compound-v3"), site: "https://compound.finance", railsExplorer: rails("compound-v3") },
  },
  {
    id: "compound-v2",
    name: "Compound V2",
    category: "Lending",
    notes: "Legacy Comptroller + cToken pool model. Superseded by Comet (V3); minimal active development.",
    tvlSlugs: ["compound-v2"],
    tvlApplicable: true,
    icon: "compound",
    controls: { type: "DAO (on-chain)", upgradeable: true },
    governance: [
      { label: "Governance", value: "Compound Governor Bravo (on-chain, COMP voting)", provenance: "onchain", source: "https://compound.finance/governance" },
      { label: "Core", value: "Comptroller + cToken markets (legacy pooled model)", provenance: "verified" },
      { label: "Upgradeability", value: "Comptroller upgradeable via governance", provenance: "verified" },
      { label: "Status", value: "Superseded by Comet (V3); minimal active development", provenance: "verified" },
    ],
    incidents: [
      {
        date: "2021-09-30",
        title: "COMP distribution bug (Comptroller, Proposal 62)",
        summary:
          "A faulty governance upgrade introduced a comparison error in the V2 Comptroller's reward logic, erroneously distributing large amounts of COMP (estimates ~$80M–$160M). User collateral and borrows were never at risk; some COMP was voluntarily returned, the rest lost. Patched via governance.",
        provenance: "verified",
        source: "https://www.coindesk.com/tech/2021/10/01/compound-founder-says-80m-bug-presents-moral-dilemma-for-defi-users",
      },
    ],
    links: { defillama: llama("compound-finance"), site: "https://compound.finance" },
  },
  {
    id: "liquity-v1",
    name: "Liquity V1",
    category: "Lending",
    notes: "Original immutable LUSD CDP: interest-free borrowing, 110% min collateral, governance-free.",
    tvlSlugs: ["liquity-v1"],
    tvlApplicable: true,
    icon: "liquity",
    controls: { type: "None (governance-free)", timelock: "None", upgradeable: false, pausable: false },
    governance: [
      { label: "Core", value: "Immutable — no admin keys, no upgrades to core contracts", provenance: "onchain", source: "https://docs.liquity.org" },
      { label: "Governance", value: "None — fully governance-free protocol", provenance: "onchain" },
      { label: "Upgradeability", value: "None (contracts are fixed at deploy)", provenance: "verified" },
      { label: "Admin control", value: "No privileged owner over user funds", provenance: "verified" },
    ],
    links: { defillama: llama("liquity-v1"), site: "https://liquity.org", railsExplorer: rails("liquity-v1") },
  },
  {
    id: "liquity-v2",
    name: "Liquity V2",
    category: "Lending",
    notes: "BOLD — new immutable CDP with user-set interest rates. Distinct codebase from V1; LQTY-staked governance over PIL incentives only.",
    tvlSlugs: ["liquity-v2"],
    tvlApplicable: true,
    icon: "liquity",
    controls: { type: "Minimal (incentives only)", upgradeable: false, pausable: false },
    governance: [
      { label: "Core", value: "Immutable core contracts (BOLD CDP)", provenance: "onchain", source: "https://docs.liquity.org" },
      { label: "Governance", value: "LQTY-staked governance over PIL incentives only", provenance: "onchain" },
      { label: "Upgradeability", value: "None for core (contracts fixed at deploy)", provenance: "verified" },
      { label: "Admin control", value: "No privileged owner over user funds", provenance: "verified" },
    ],
    links: { defillama: llama("liquity-v2"), site: "https://liquity.org", railsExplorer: rails("liquity-v2") },
  },
  {
    id: "uniswap-v3",
    name: "Uniswap V3",
    category: "DEX / AMM",
    notes: "Concentrated-liquidity AMM; dominant Uniswap TVL. Immutable core.",
    tvlSlugs: ["uniswap-v3"],
    tvlApplicable: true,
    icon: "uniswap-v3",
    controls: { type: "DAO (on-chain)", upgradeable: false, pausable: false },
    governance: [
      { label: "Governance", value: "Uniswap Governor (on-chain, UNI voting)", provenance: "onchain", source: "https://www.uniswap.org/governance" },
      { label: "Core", value: "v3 core contracts non-upgradeable", provenance: "verified" },
      { label: "Admin control", value: "Governance can set protocol fee switch only", provenance: "verified" },
    ],
    links: { defillama: llama("uniswap-v3"), site: "https://uniswap.org", railsExplorer: rails("uniswap-v3") },
  },
  {
    id: "uniswap-v4",
    name: "Uniswap V4",
    category: "DEX / AMM",
    notes: "Singleton PoolManager + hooks architecture; launched 2025. Per-pool hooks extend behaviour.",
    tvlSlugs: ["uniswap-v4"],
    tvlApplicable: true,
    icon: "uniswap",
    controls: { type: "DAO (on-chain)", upgradeable: false, pausable: false },
    governance: [
      { label: "Governance", value: "Uniswap Governor (on-chain, UNI voting)", provenance: "onchain", source: "https://www.uniswap.org/governance" },
      { label: "Core", value: "Singleton PoolManager non-upgradeable; hooks are per-pool", provenance: "verified" },
      { label: "Admin control", value: "Governance fee switch only; hook deployment permissionless", provenance: "verified" },
    ],
    links: { defillama: llama("uniswap-v4"), site: "https://uniswap.org" },
  },
  {
    id: "uniswap-x",
    name: "UniswapX",
    category: "Swap Aggregator",
    notes: "Off-chain intent / Dutch-auction routing with a permissionless filler network. TVL not applicable — volume metric.",
    tvlSlugs: [],
    tvlApplicable: false,
    icon: "uniswap",
    controls: { type: "DAO (on-chain)" },
    governance: [
      { label: "Governance", value: "Uniswap Governor (on-chain, UNI voting)", provenance: "onchain", source: "https://www.uniswap.org/governance" },
      { label: "Mechanism", value: "Off-chain signed orders filled via Dutch auction by a permissionless filler network", provenance: "verified" },
      { label: "Settlement", value: "Reactor contracts settle filled orders on-chain", provenance: "verified" },
    ],
    links: { defillama: llama("uniswap"), site: "https://uniswap.org" },
  },
  {
    id: "curve",
    name: "Curve",
    category: "DEX / AMM",
    notes: "Stablecoin and LST AMM infrastructure.",
    tvlSlugs: ["curve-dex"],
    tvlApplicable: true,
    icon: "curve",
    controls: { type: "DAO (veCRV)", upgradeable: false },
    governance: [
      { label: "Governance", value: "Curve DAO (veCRV voting)", provenance: "onchain", source: "https://dao.curve.fi" },
      { label: "Upgradeability", value: "Pools immutable; DAO governs parameters/gauges", provenance: "verified" },
      { label: "Admin control", value: "DAO ownership agent + emergency DAO", provenance: "verified" },
    ],
    incidents: [
      {
        date: "2023-07-30",
        title: "Vyper compiler reentrancy bug drains several pools",
        summary:
          "A faulty reentrancy lock in Vyper 0.2.15/0.2.16/0.3.0 — not Curve's pool logic — let attackers drain several pools (pETH/msETH/alETH/CRV-ETH) for ~$70M. Roughly 70%+ was recovered or returned by white-hats within days; Curve committed to reimbursing users.",
        provenance: "verified",
        source: "https://hackmd.io/@LlamaRisk/BJzSKHNjn",
      },
    ],
    links: { defillama: llama("curve-dex"), site: "https://curve.fi", railsExplorer: rails("curve") },
  },
  {
    id: "balancer-v2",
    name: "Balancer V2",
    category: "DEX / AMM",
    notes: "Established Vault-based AMM (weighted / stable / boosted pools). The 2023 and 2025 exploits below were both on V2.",
    tvlSlugs: ["balancer-v2"],
    tvlApplicable: true,
    icon: "balancer",
    controls: { type: "DAO (Snapshot + multisig)", safeAddress: "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f", timelock: "None", upgradeable: false },
    governance: [
      { label: "Governance", value: "BAL/veBAL holders vote via Snapshot; DAO multisig enacts (no discretionary power, no fund custody)", provenance: "verified", source: "https://docs-v2.balancer.fi/concepts/governance/multisig.html" },
      { label: "Upgradeability", value: "V2 Vault immutable/non-upgradeable; LP funds withdrawable even if governance is compromised", provenance: "verified", source: "https://docs-v2.balancer.fi/concepts/vault/" },
      { label: "Admin control", value: "DAO multisig 6/11 (0x10A1…2e4f), admin of the Authorizer", provenance: "onchain", source: "https://etherscan.io/address/0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f" },
      { label: "Authorizer", value: "Vault permissions via Authorizer (0xA331…3aE6), an AccessControl contract (no built-in delay)", provenance: "onchain", source: "https://etherscan.io/address/0xA331D84eC860Bf466b4CdCcFb4aC09a1B43F3aE6" },
    ],
    incidents: [
      {
        date: "2025-11-03",
        title: "ComposableStablePool rounding-error exploit",
        summary:
          "An attacker exploited integer-division precision loss in Balancer V2 ComposableStablePool invariant math to drain pools across several chains; reported losses range ~$110M–$128M. As of late Nov 2025 the DAO was discussing redistributing ~$8M recovered — most funds were not recovered.",
        provenance: "verified",
        source: "https://research.checkpoint.com/2025/how-an-attacker-drained-128m-from-balancer-through-rounding-error-exploitation/",
      },
      {
        date: "2023-08-22",
        title: "Boosted-pool vulnerability (mostly mitigated)",
        summary:
          "Balancer disclosed a critical V2 Boosted Pool vulnerability and urged LPs to withdraw; ~$0.9M was exploited despite mitigation, with most at-risk funds withdrawn after the warning.",
        provenance: "verified",
        source: "https://decrypt.co/154002/balancer-suffers-nearly-1m-exploit-team-urges-users-withdraw-funds",
      },
    ],
    links: { defillama: llama("balancer-v2"), site: "https://balancer.fi", railsExplorer: rails("balancer-v2") },
  },
  {
    id: "balancer-v3",
    name: "Balancer V3",
    category: "DEX / AMM",
    notes: "Re-architected Vault; custom-pool friendly, multi-token pools. Audited 2024; distinct codebase from V2.",
    tvlSlugs: ["balancer-v3"],
    tvlApplicable: true,
    icon: "balancer",
    controls: { type: "DAO (shared Balancer governance)", safeAddress: "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f", upgradeable: false },
    governance: [
      { label: "Governance", value: "BAL/veBAL holders vote via Snapshot; DAO multisig enacts (shared Balancer governance)", provenance: "verified", source: "https://docs-v2.balancer.fi/concepts/governance/multisig.html" },
      { label: "Upgradeability", value: "V3 Vault immutable/non-upgradeable; LP funds withdrawable even if governance is compromised", provenance: "verified", source: "https://docs.balancer.fi" },
      { label: "Admin control", value: "DAO multisig governs Vault permissions via the Authorizer", provenance: "verified" },
      { label: "Architecture", value: "Re-architected Vault with a simplified custom-pool model", provenance: "verified", source: "https://github.com/balancer/balancer-v3-monorepo" },
    ],
    links: { defillama: llama("balancer-v3"), site: "https://balancer.fi", railsExplorer: rails("balancer-v3") },
  },
  {
    id: "cow-swap",
    name: "CoW Swap",
    category: "Swap Aggregator",
    notes: "Intent-based DEX with MEV protection. TVL not applicable — volume metric.",
    tvlSlugs: ["cowswap"],
    tvlApplicable: false,
    icon: "cow",
    controls: { type: "DAO (CoW DAO Safe)", safeAddress: "0xcA771eda0c70aA7d053aB1B25004559B918FE662", upgradeable: false },
    governance: [
      { label: "Governance", value: "CoW DAO (COW token, CIPs); on-chain authority = CoW DAO Safe 3/5 (0xcA77…E662)", provenance: "onchain", source: "https://etherscan.io/address/0xcA771eda0c70aA7d053aB1B25004559B918FE662" },
      { label: "Upgradeability", value: "Core GPv2Settlement (0x9008…ab41) is immutable; only the solver allow-list authenticator is an upgradeable proxy", provenance: "onchain", source: "https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41" },
      { label: "Admin control", value: "Authenticator proxy owner = CoW DAO Safe 3/5 (0xcA77…E662); only key able to upgrade it", provenance: "onchain", source: "https://etherscan.io/address/0x2c4c28ddbdac9c5e7055b4c863b72ea0149d8afe" },
      { label: "Solvers", value: "Permissioned solver allow-list; manager (adds/removes solvers) = CoW DAO solver-payouts Safe", provenance: "onchain", source: "https://docs.cow.fi/cow-protocol/reference/contracts/core/allowlist" },
    ],
    incidents: [
      {
        date: "2023-02-07",
        title: "Third-party solver exploit (protocol fees only)",
        summary:
          "An attacker abused a pre-existing approval from the settlement contract to a vulnerable third-party solver's helper, draining ~$166K of accrued protocol fees. User funds were never custodied or at risk, and the loss was made whole via the solver bonding mechanism.",
        provenance: "verified",
        source: "https://blog.cow.fi/cow-swap-solver-exploit-post-mortem-07-02-2023-2faa9f918e29",
      },
    ],
    links: { defillama: llama("cowswap"), site: "https://cow.fi" },
  },
  {
    id: "1inch",
    name: "1inch",
    category: "Swap Aggregator",
    notes: "DEX aggregator and limit-order protocol. TVL not applicable — volume metric.",
    tvlSlugs: ["1inch"],
    tvlApplicable: false,
    icon: "default",
    controls: { type: "DAO (on-chain)", safeAddress: "0x7951c7ef839e26F63DA87a42C9a87986507f1c07", timelock: "72 hours", upgradeable: false },
    governance: [
      { label: "Governance", value: "1inch DAO (1INCH); treasury Safe 7/12 (0x7951…1c07) with a 72-hour timelock", provenance: "onchain", source: "https://gov.1inch.community/docs/governance/dao-treasury/" },
      { label: "Upgradeability", value: "Aggregation Router V6 (0x1111…2a65) is non-upgradeable; new versions deploy as fresh contracts", provenance: "onchain", source: "https://etherscan.io/address/0x111111125421ca6dc452d289314280a0f8842a65" },
      { label: "Admin control", value: "Router owner = 3/5 Safe (0x9f81…976a); limited powers (fund rescue), cannot alter swap logic (immutable)", provenance: "onchain", source: "https://etherscan.io/address/0x111111125421ca6dc452d289314280a0f8842a65" },
      { label: "Aggregation", value: "Routing is permissionless on-chain (off-chain Pathfinder computes routes); no privileged solver gate", provenance: "verified", source: "https://github.com/mixbytes/audits_public/blob/master/1inch/Aggregation%20Router%20V4/README.md" },
    ],
    incidents: [
      {
        date: "2025-03-05",
        title: "Deprecated Fusion v1 resolver exploit",
        summary:
          "A calldata bug in an obsolete Fusion v1 settlement contract was exploited to drain ~$5M from a market-maker/resolver — not 1inch core or end-user funds. Most funds were returned after a bug-bounty negotiation.",
        provenance: "verified",
        source: "https://blog.1inch.com/vulnerability-discovered-in-resolver-contract/",
      },
    ],
    links: { defillama: llama("1inch-network"), site: "https://1inch.io" },
  },
  {
    id: "0x",
    name: "0x / Matcha",
    category: "Swap Aggregator",
    notes: "0x protocol and Matcha frontend. TVL not applicable — volume metric.",
    tvlSlugs: ["0x", "matcha"],
    tvlApplicable: false,
    icon: "default",
    controls: { type: "DAO (on-chain)", upgradeable: false, pausable: true },
    governance: [
      { label: "Governance", value: "0x DAO (ZRX token, ZEIP process; on-chain since ZEIP-95)", provenance: "verified", source: "https://forum.0xprotocol.org/t/zeip-95-migrating-0x-protocol-to-on-chain-governance-process/3513" },
      { label: "Upgradeability", value: "Settler contracts are immutable & stateless; new features ship as new Settler deploys (registry-tracked)", provenance: "verified", source: "https://github.com/0xProject/0x-settler/blob/master/README.md" },
      { label: "Admin control", value: "Deployer/registry (UUPS) owner = 2-of-n Safe (0xf36b…2f51); deploys new Settlers", provenance: "onchain", source: "https://github.com/0xProject/0x-settler/blob/master/README.md" },
      { label: "Settlement", value: "Permissionless (no solver allow-list); allowances isolated in AllowanceHolder/Permit2; 1-of-n emergency pauser", provenance: "onchain", source: "https://0x.org/docs/developer-resources/core-concepts/contracts" },
    ],
    links: { defillama: llama("0x"), site: "https://matcha.xyz" },
  },
  {
    id: "yearn",
    name: "Yearn Finance",
    category: "Yield / Vault",
    notes: "Automated yield vaults (v3).",
    tvlSlugs: ["yearn-finance"],
    tvlApplicable: true,
    icon: "yearn",
    controls: { type: "DAO (YFI)", safeAddress: "0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52", upgradeable: false, pausable: true },
    governance: [
      { label: "Governance", value: "YFI holder DAO; stewardship delegated to 'yChad' multisig (ychad.eth, 0xFEB4…aFF52)", provenance: "verified", source: "https://docs.yearn.fi/developers/security/multisig" },
      { label: "Upgradeability", value: "v3 vaults are non-upgradeable — once deployed, vault logic cannot change", provenance: "verified", source: "https://github.com/yearn/yearn-vaults-v3/blob/master/TECH_SPEC.md" },
      { label: "Admin control", value: "Per-vault role-based access; role_manager for Yearn vaults = yChad 6/9 Safe (0xFEB4…aFF52)", provenance: "verified", source: "https://docs.yearn.fi/developers/v3/vault_management" },
      { label: "Guardian", value: "yChad 6/9 acts as Guardian (veto only); EMERGENCY_MANAGER role can shut a vault down", provenance: "verified", source: "https://docs.yearn.fi/developers/security/multisig" },
    ],
    incidents: [
      {
        date: "2023-04-13",
        title: "Legacy yUSDT (iearn) vault misconfiguration exploit",
        summary:
          "A deprecated 2020-era iearn yUSDT contract, misconfigured since deployment to reference iUSDC, was exploited to mint vast yUSDT and extract ~$11.6M. Yearn's modern v2 vaults were unaffected; funds were not recovered.",
        provenance: "verified",
        source: "https://www.coindesk.com/business/2023/04/13/defi-protocols-aave-yearn-finance-likely-impacted-in-exploit-peckshield",
      },
    ],
    links: { defillama: llama("yearn-finance"), site: "https://yearn.fi", railsExplorer: rails("yearn") },
  },
  {
    id: "mellow",
    name: "Mellow",
    category: "Yield / Vault",
    notes: "Modular LRT vault infrastructure.",
    tvlSlugs: ["mellow"],
    tvlApplicable: true,
    icon: "default",
    controls: { type: "Per-vault (no global DAO)", timelock: "1–7 days", upgradeable: true },
    governance: [
      { label: "Governance", value: "No protocol-wide DAO; each LRT vault governed independently by its curator/admin set (role-based)", provenance: "verified", source: "https://docs.mellow.finance/restaking-vaults/simple-lrt/overview" },
      { label: "Upgradeability", value: "Vaults are upgradeable proxies; upgrades via a per-vault ProxyAdmin", provenance: "onchain", source: "https://docs.mellow.finance/core-vaults/core-deployments" },
      { label: "Admin control", value: "Per-vault OZ TimelockController + admin roles — no single global multisig", provenance: "onchain", source: "https://docs.mellow.finance/core-vaults/core-deployments" },
      { label: "Timelock", value: "Per-vault timelock, typically 1–7 days (exact delay varies by vault)", provenance: "verified", source: "https://docs.mellow.finance/security" },
    ],
    links: { defillama: llama("mellow"), site: "https://mellow.finance" },
  },
  {
    id: "morpho-vaults",
    name: "Morpho Vaults",
    category: "Yield / Vault",
    family: "Morpho",
    notes: "Curated MetaMorpho vaults over Morpho Blue markets.",
    tvlSlugs: ["morpho-blue"],
    tvlApplicable: true,
    icon: "morpho",
    controls: { type: "Per-vault (4-role)", timelock: "≥24 hours", upgradeable: false },
    governance: [
      { label: "Vault standard", value: "MetaMorpho vaults are immutable, non-upgradeable ERC-4626; no protocol-wide DAO over vaults", provenance: "verified", source: "https://github.com/morpho-org/metamorpho/blob/main/README.md" },
      { label: "Admin control", value: "Per-vault 4-role model — Owner / Curator / Allocator / Guardian; configured per vault (multisig recommended)", provenance: "verified", source: "https://docs.morpho.org/morpho-vaults/concepts/roles/" },
      { label: "Curators", value: "Curator raises caps under timelock, lowers instantly; allocators reallocate between enabled markets", provenance: "verified", source: "https://docs.morpho.org/morpho-vaults/concepts/roles/" },
      { label: "Timelock", value: "Per-vault timelock, min 24h, on cap increases / new markets / guardian changes; guardian can revoke pending actions", provenance: "verified", source: "https://docs.morpho.org/curate/concepts/timelock/" },
    ],
    links: { defillama: llama("morpho-blue"), site: "https://app.morpho.org/vaults", railsExplorer: rails("morpho") },
  },
  {
    id: "pendle",
    name: "Pendle",
    category: "Yield / Vault",
    notes: "Yield tokenization and fixed-rate trading.",
    tvlSlugs: ["pendle"],
    tvlApplicable: true,
    icon: "pendle",
    controls: { type: "DAO (multisig)", safeAddress: "0x8119EC16F0573B7dAc7C0CB94EB504FB32456ee1", timelock: "7 days (token params)", upgradeable: true, pausable: true },
    governance: [
      { label: "Governance", value: "Governance multisig 3/5 (0x8119…6ee1) holds DEFAULT_ADMIN_ROLE; vePENDLE is incentive/voting only", provenance: "onchain", source: "https://etherscan.io/address/0x8119EC16F0573B7dAc7C0CB94EB504FB32456ee1" },
      { label: "Upgradeability", value: "AMM core immutable, but many modules upgradeable by governance with no exit window (DeFiScan: High risk)", provenance: "verified", source: "https://www.defiscan.info/protocols/pendle/ethereum" },
      { label: "Markets", value: "Permissionless PT/YT market creation on-chain (UI listing curated)", provenance: "verified", source: "https://www.defiscan.info/protocols/pendle/ethereum" },
      { label: "Timelock / Guardian", value: "Only PENDLE-token params have a 7-day timelock; other actions instant. Guardian can pause SY tokens", provenance: "verified", source: "https://www.defiscan.info/protocols/pendle/ethereum" },
    ],
    links: { defillama: llama("pendle"), site: "https://pendle.finance", railsExplorer: rails("pendle") },
  },
  {
    id: "lido",
    name: "Lido",
    category: "Liquid Staking",
    notes: "Largest ETH staking protocol. stETH is the most widely used DeFi collateral.",
    tvlSlugs: ["lido"],
    tvlApplicable: true,
    icon: "lido",
    controls: { type: "DAO (Aragon)", upgradeable: true, pausable: true },
    governance: [
      { label: "Governance", value: "Lido DAO (Aragon, LDO voting)", provenance: "onchain", source: "https://vote.lido.fi" },
      { label: "Upgradeability", value: "Upgradeable; controlled by DAO + agent", provenance: "verified" },
      { label: "Admin control", value: "Easy Track + emergency multisig (GateSeal)", provenance: "verified" },
      { label: "Operators", value: "Curated + community node-operator sets", provenance: "verified" },
    ],
    links: { defillama: llama("lido"), site: "https://lido.fi", railsExplorer: rails("lido") },
  },
  {
    id: "rocket-pool",
    name: "Rocket Pool",
    category: "Liquid Staking",
    notes: "Decentralized ETH staking. rETH.",
    tvlSlugs: ["rocket-pool"],
    tvlApplicable: true,
    icon: "rocketpool",
    controls: { type: "Two-DAO (pDAO + oDAO)", upgradeable: true },
    governance: [
      { label: "Governance", value: "Two-DAO: pDAO (RPL holders, fully on-chain since Houston) + oDAO (permissioned oracle set, applies upgrades)", provenance: "verified", source: "https://docs.rocketpool.net/upgrades/houston/participate" },
      { label: "Upgradeability", value: "Eternal-storage pattern: upgrades deploy new contracts + register addresses in RocketStorage; pDAO-authorised", provenance: "onchain", source: "https://github.com/rocket-pool/rocketpool/blob/master/contracts/contract/RocketStorage.sol" },
      { label: "Operators", value: "Permissionless node operators (RPL bond)", provenance: "onchain" },
      { label: "Admin control", value: "RocketStorage guardian role (historically a team EOA); Security Council (RPIP-33) elected by pDAO can veto", provenance: "verified", source: "https://dao.rocketpool.net/t/protocol-dao-security-council/3050" },
    ],
    links: { defillama: llama("rocket-pool"), site: "https://rocketpool.net", railsExplorer: rails("rocketpool") },
  },
];

export const PROTOCOL_BY_ID: Record<string, Protocol> = Object.fromEntries(
  PROTOCOLS.map((p) => [p.id, p]),
);

/** Count of distinct versioned deployments — every row in the matrix (Aave V3 and V4 each count). */
export const DEPLOYMENT_COUNT = PROTOCOLS.length;

/** Count of logical protocols — versioned deployments (Aave V3/V4, Uniswap V3/V4/X, …) collapse to
 *  one; Morpho and Morpho Vaults stay distinct (different products). The RFP's "top 20" scope.
 *  Derived, not hardcoded, so it stays correct as the registry grows. */
export const PROTOCOL_COUNT = new Set(
  PROTOCOLS.map((p) => p.id.replace(/-v\d+$|-x$/, "")),
).size;
