// Security audit history per protocol. Neutral, sourced fact — never a Rails judgement; we
// relay that an audit happened and link the public report. Every entry below was verified
// 2026-06-04 against an authoritative source (the protocol's official security page, the audit
// firm's site, or the protocol's GitHub audits folder). Representative, not exhaustive — major
// protocols have far more reviews than listed. The RFP's detail page calls for audit history.

import type { Provenance } from "./protocols";

export interface Audit {
  auditor: string;
  /** YYYY-MM, or a year where the month is not confirmed. Omitted if unverifiable. */
  date?: string;
  scope: string;
  provenance: Provenance;
  url?: string;
}

export const AUDITS: Record<string, Audit[]> = {
  "aave-v3": [
    { auditor: "OpenZeppelin", date: "2021-11", scope: "Aave V3 core (launch audit)", provenance: "verified", url: "https://github.com/aave/aave-v3-core/blob/master/audits/01-11-2021_OpenZeppelin_AaveV3.pdf" },
    { auditor: "Trail of Bits", date: "2022-01", scope: "Aave V3 core", provenance: "verified", url: "https://github.com/aave/aave-v3-core/blob/master/audits/07-01-2022_TrailOfBits_AaveV3.pdf" },
    { auditor: "Certora", date: "2024-11", scope: "Aave V3.3 (formal verification)", provenance: "verified", url: "https://github.com/aave-dao/aave-v3-origin/blob/main/audits/2024-11-07_Certora_Aave-v3.3.0.pdf" },
    { auditor: "Certora", date: "2025-06", scope: "Aave V3.4", provenance: "verified", url: "https://github.com/aave-dao/aave-v3-origin/tree/main/audits" },
  ],
  "compound-v3": [
    { auditor: "OpenZeppelin", date: "2022-06", scope: "Compound III (Comet) core", provenance: "verified", url: "https://www.openzeppelin.com/news/compound-iii-audit" },
    { auditor: "ChainSecurity", date: "2022-05", scope: "Compound III (Comet) contracts", provenance: "verified", url: "https://reports.chainsecurity.com/Compound/ChainSecurity_Compound_Comet_Audit.pdf" },
  ],
  morpho: [
    { auditor: "Spearbit", date: "2023-10", scope: "Morpho Blue core", provenance: "verified", url: "https://github.com/morpho-org/morpho-blue/tree/main/audits" },
    { auditor: "OpenZeppelin", date: "2023-10", scope: "Morpho Blue core", provenance: "verified", url: "https://github.com/morpho-org/morpho-blue/tree/main/audits" },
    { auditor: "Cantina (competition)", date: "2023-11", scope: "Morpho Blue core (public contest)", provenance: "verified", url: "https://github.com/morpho-org/morpho-blue/tree/main/audits" },
  ],
  spark: [
    { auditor: "ChainSecurity", scope: "SparkLend Core Updates (Spark-specific changes on Aave v3)", provenance: "verified", url: "https://github.com/sparkdotfi/sparklend-v1-core/tree/master/audits" },
    { auditor: "ChainSecurity", scope: "SparkLend Advanced (capped/fixed-price oracles)", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/makerdao-sparklend-advanced" },
    { auditor: "ChainSecurity", scope: "SparkLend Cap Automator", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/makerdao-sparklend-cap-automator" },
  ],
  lido: [
    { auditor: "Certora", date: "2025-12", scope: "Lido V3 (stVaults)", provenance: "verified", url: "https://github.com/lidofinance/audits/blob/main/Certora%20Lido%20V3%20Audit%20Report%20-%2012-2025.pdf" },
    { auditor: "Consensys Diligence", date: "2025-11", scope: "Lido V3 contracts", provenance: "verified", url: "https://github.com/lidofinance/audits/blob/main/Consensys%20Diligence%20Lido%20V3%20Security%20Audit%20-%2011-2025.pdf" },
    { auditor: "OpenZeppelin", date: "2024-11", scope: "Lido Dual Governance", provenance: "verified", url: "https://github.com/lidofinance/audits/blob/main/OpenZeppelin%20Dual%20Governance%20Audit%20Report%2011-2024.pdf" },
    { auditor: "Statemind", date: "2023-04", scope: "Lido V2 (withdrawals + staking router)", provenance: "verified", url: "https://github.com/lidofinance/audits/blob/main/Statemind%20Lido%20V2%20Audit%20Report%2004-23.pdf" },
  ],
  "rocket-pool": [
    { auditor: "Sigma Prime", date: "2021-09", scope: "Core staking protocol (v1 launch)", provenance: "verified", url: "https://rocketpool.net/files/audits/sigma-prime-audit.pdf" },
    { auditor: "Consensys Diligence", date: "2021-04", scope: "Core smart contracts", provenance: "verified", url: "https://diligence.security/audits/2021/04/rocketpool/" },
    { auditor: "Consensys Diligence", date: "2023-01", scope: "Atlas (v1.2) upgrade", provenance: "verified", url: "https://diligence.security/audits/2023/01/rocket-pool-atlas-v1.2/" },
    { auditor: "Trail of Bits", date: "2021", scope: "Smart contract security review", provenance: "verified", url: "https://github.com/trailofbits/publications/blob/master/reviews/RocketPool.pdf" },
  ],
  "liquity-v1": [
    { auditor: "Trail of Bits", date: "2021-01", scope: "Liquity v1 core contracts", provenance: "verified", url: "https://github.com/trailofbits/publications/blob/master/reviews/Liquity.pdf" },
  ],
  "liquity-v2": [
    { auditor: "Coinspect", date: "2024-12", scope: "Liquity V2 (BOLD) core", provenance: "verified", url: "https://www.coinspect.com/doc/Coinspect%20-%20Smart%20Contract%20Audit%20-%20Liquity%20-%20Bold%20-%20v241231.pdf" },
    { auditor: "ChainSecurity", date: "2025-05", scope: "Liquity V2 (BOLD) core", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/liquity-bold-smart-contracts" },
    { auditor: "Dedaub", date: "2024-11", scope: "Liquity V2 core (second audit)", provenance: "verified", url: "https://dedaub.com/audits/liquity/liquity-v2-second-audit-nov-11-2024/" },
  ],
  curve: [
    { auditor: "ChainSecurity", date: "2023-06", scope: "Curve Stablecoin (crvUSD)", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/curve-stablecoin" },
    { auditor: "MixBytes", date: "2023-06", scope: "Curve Stablecoin (crvUSD)", provenance: "verified", url: "https://github.com/mixbytes/audits_public/blob/master/Curve%20Finance/Curve%20Stablecoin%20(crvUSD)/Curve%20Stablecoin%20(crvUSD)%20Security%20Audit%20Report.pdf" },
    { auditor: "MixBytes", date: "2023-10", scope: "StableSwap-NG factory/pool/math", provenance: "verified", url: "https://github.com/mixbytes/audits_public/blob/master/Curve%20Finance/StableSwapNG/README.md" },
    { auditor: "ChainSecurity", date: "2023-06", scope: "tricrypto-ng (CryptoSwap NG)", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/curve-finance-tricrypto" },
  ],
  "uniswap-v4": [
    { auditor: "OpenZeppelin", date: "2024-08", scope: "Uniswap v4 core (PoolManager)", provenance: "verified", url: "https://www.openzeppelin.com/news/uniswap-v4-core-audit" },
    { auditor: "Certora", date: "2024-07", scope: "Uniswap v4 core (formal verification)", provenance: "verified", url: "https://www.certora.com/reports/uniswap-v4" },
    { auditor: "OpenZeppelin", date: "2024-08", scope: "v4-periphery + universal-router", provenance: "verified", url: "https://www.openzeppelin.com/news/uniswap-v4-periphery-and-universal-router-audit" },
  ],
  "balancer-v3": [
    { auditor: "Certora", date: "2024-09", scope: "Balancer v3 Vault + core (formal verification)", provenance: "verified", url: "https://github.com/balancer/balancer-v3-monorepo/blob/main/audits/certora/2024-09-04.pdf" },
    { auditor: "Spearbit", date: "2024-10", scope: "Balancer v3 monorepo", provenance: "verified", url: "https://github.com/balancer/balancer-v3-monorepo/blob/main/audits/spearbit/2024-10-04.pdf" },
    { auditor: "Trail of Bits", date: "2024-10", scope: "Balancer v3 monorepo", provenance: "verified", url: "https://github.com/balancer/balancer-v3-monorepo/tree/main/audits" },
  ],
  pendle: [
    { auditor: "ChainSecurity", date: "2022-09", scope: "Pendle V2 Core (SY, PT, markets)", provenance: "verified", url: "https://www.chainsecurity.com/reports/Pendle/ChainSecurity_Pendle_PendleV2Core_Audit.pdf" },
    { auditor: "Dedaub", date: "2022-07", scope: "Pendle V2 — yield tokenization & trading", provenance: "verified", url: "https://dedaub.com/audits/pendle/pendle-finance-v2-yield-tokenization-and-trading-jul-01-2022/" },
  ],
  yearn: [
    { auditor: "ChainSecurity", date: "2023", scope: "Yearn V3 Vaults (ERC-4626 system)", provenance: "verified", url: "https://www.chainsecurity.com/reports/Yearn/ChainSecurity_Yearn_V3Vaults_Audit.pdf" },
    { auditor: "yAcademy", date: "2023-06", scope: "Yearn Vaults V3", provenance: "verified", url: "https://github.com/yearn/yearn-vaults-v3/blob/master/audits/06-2023-Yearn-Vault-V3_yAcademy_Reports.pdf" },
    { auditor: "Statemind", date: "2023", scope: "Yearn V3 Vaults", provenance: "verified", url: "https://github.com/yearn/yearn-vaults-v3/blob/master/audits/Yearn%20V3%20report%20Statemind.pdf" },
  ],
  euler: [
    { auditor: "Spearbit", date: "2024", scope: "Euler Vault Kit (EVK) — v2 core", provenance: "verified", url: "https://github.com/euler-xyz/euler-vault-kit/tree/master/audits" },
    { auditor: "ChainSecurity", date: "2024", scope: "Euler Vault Kit (EVK)", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/euler-vault-kit" },
    { auditor: "Certora", date: "2024", scope: "Euler Vault Kit (EVK) — formal verification", provenance: "verified", url: "https://github.com/euler-xyz/euler-vault-kit/tree/master/audits" },
    { auditor: "Cantina (competition)", date: "2024", scope: "Euler v2 EVK (~$1.25M public contest)", provenance: "verified", url: "https://github.com/euler-xyz/euler-vault-kit/tree/master/audits" },
  ],
  gearbox: [
    { auditor: "ChainSecurity", date: "2024-03", scope: "Gearbox V3 Core", provenance: "verified", url: "https://github.com/Gearbox-protocol/security/blob/main/audits/2024%20Mar%20-%20ChainSecurity_Gearbox_Core_V3.pdf" },
    { auditor: "ABDK", date: "2023-12", scope: "Gearbox Core V3", provenance: "verified", url: "https://github.com/Gearbox-protocol/security/blob/main/audits/2023%20Dec%20-%20ABDK_Gearbox_Core_V3.pdf" },
    { auditor: "ChainSecurity", date: "2023-12", scope: "Gearbox V3 Integrations", provenance: "verified", url: "https://github.com/Gearbox-protocol/security/blob/main/audits/2023%20Dec%20-%20ChainSecurity_Gearbox_Integrations_V3.pdf" },
    { auditor: "ChainSecurity", date: "2025-03", scope: "Gearbox V3.1 upgrade", provenance: "verified", url: "https://github.com/Gearbox-protocol/security/tree/main/audits" },
  ],
  fluid: [
    { auditor: "MixBytes", date: "2024-06", scope: "Fluid Vault Protocol", provenance: "verified", url: "https://docs.fluid.instadapp.io/Mixbytes_Fluid_Vault_Protocol_Audit.pdf" },
    { auditor: "Cantina (competition)", date: "2025-01", scope: "Fluid DEX protocol", provenance: "verified", url: "https://docs.fluid.instadapp.io/cantina-audit-dex.pdf" },
    { auditor: "Statemind", date: "2024", scope: "Fluid protocol / Liquidity Layer", provenance: "verified", url: "https://docs.fluid.instadapp.io/Statemind_Fluid_Audit.pdf" },
  ],
  "morpho-vaults": [
    { auditor: "Spearbit (Cantina-managed)", date: "2023-11", scope: "MetaMorpho v1 (vaults)", provenance: "verified", url: "https://github.com/morpho-org/metamorpho/blob/main/audits/2023-11-14-metamorpho-cantina-managed-review.pdf" },
    { auditor: "OpenZeppelin", date: "2023-11", scope: "Morpho Blue periphery / MetaMorpho", provenance: "verified", url: "https://github.com/morpho-org/metamorpho/blob/main/audits/2023-11-16-morpho-blue-periphery-open-zeppelin.pdf" },
    { auditor: "Cantina (competition)", date: "2024-01", scope: "MetaMorpho periphery contest", provenance: "verified", url: "https://github.com/morpho-org/metamorpho/blob/main/audits/2024-01-05-periphery-cantina-competition.pdf" },
    { auditor: "Spearbit", date: "2025-05", scope: "Morpho Vaults V2", provenance: "verified", url: "https://github.com/spearbit/portfolio/blob/master/pdfs/Morpho-Vaults-v2-Spearbit-Security-Review-May-2025.pdf" },
  ],
  mellow: [
    { auditor: "Statemind", date: "2024-05", scope: "Mellow LRT core vaults", provenance: "verified", url: "https://github.com/mellow-finance/mellow-lrt/blob/main/audits/202405_Statemind/Mellow%20LRT%20Final%20report.pdf" },
    { auditor: "ChainSecurity", date: "2024", scope: "Mellow Symbiotic Vault", provenance: "verified", url: "https://www.chainsecurity.com/security-audit/mellow-symbiotic-vault" },
  ],
  "cow-swap": [
    { auditor: "Ackee Blockchain", date: "2023-07", scope: "ComposableCoW + ExtensibleFallbackHandler", provenance: "verified", url: "https://github.com/Ackee-Blockchain/public-audit-reports/blob/master/2023/ackee-blockchain-cow-protocol-composablecow-extensiblefallbackhandler-report.pdf" },
    { auditor: "G0 Group", date: "2021-05", scope: "Gnosis Protocol V2 (now CoW core settlement)", provenance: "verified", url: "https://github.com/cowprotocol/contracts/blob/main/audits/GnosisProtocolV2May2021.pdf" },
  ],
  "1inch": [
    { auditor: "OpenZeppelin", date: "2021-12", scope: "Limit Order Protocol v2", provenance: "verified", url: "https://www.openzeppelin.com/news/1inch-limit-order-protocol-audit" },
    { auditor: "OpenZeppelin", date: "2023-11", scope: "Aggregation Protocol (Router V6) diff audit", provenance: "verified", url: "https://www.openzeppelin.com/news/aggregation-protocol-diff-audit" },
    { auditor: "OpenZeppelin", date: "2024-05", scope: "Limit Order + Aggregation diff audit", provenance: "verified", url: "https://www.openzeppelin.com/news/limit-order-and-aggregation-protocols-diff-audit" },
    { auditor: "Decurity", date: "2023", scope: "Aggregation Router v6 + Limit Order v4", provenance: "verified", url: "https://github.com/decurity/audits/blob/master/1inch/1inch-aggregation-router-v6-limit-order-v4-audit-report-2023-1.1.pdf" },
  ],
  "0x": [
    { auditor: "OpenZeppelin", date: "2024-04", scope: "0x Settler (final audit)", provenance: "verified", url: "https://github.com/0xProject/0x-settler/blob/master/audits/OpenZeppelin%20Audit%20Report%20-%200x%20Settler%20Final%20Audit%20Report%20(April%202024).pdf" },
    { auditor: "Dedaub", date: "2025-01", scope: "0x Settler intent-protocol upgrade", provenance: "verified", url: "https://dedaub.com/audits/0x/0x-settler-intent-upgrade-jan-23-2025/" },
    { auditor: "Ourovoros", date: "2023-11", scope: "0x Settler (early review)", provenance: "verified", url: "https://github.com/0xProject/0x-settler/blob/master/audits/0xProtocolxOurovoros-Report-13-11-2023.pdf" },
  ],
};

/** Audit records for a protocol (empty if none on file). */
export function protocolAudits(id: string): Audit[] {
  return AUDITS[id] ?? [];
}
