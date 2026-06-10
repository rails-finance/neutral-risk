# Sieve verification-layer indexer — runbook

This stands up [Sieve](https://github.com/slvDev/sieve) (Slava's open-source Ethereum P2P
indexer, MIT/Apache-2.0) to render the registry's **control timelines from chain truth**. It
is the "verification layer" the proposal describes, made real for the demo.

> **Scope:** the initial demo indexes a **single protocol — Aave v3**. The other flagships and
> the Phase-B TVL cross-check were removed from `sieve.toml`/the export script for now;
> reinstate their blocks from git history when widening coverage.

> **Architecture rule (do not break):** the web app is fully static / SSG and IPFS-publishable.
> Sieve must **never** be a runtime dependency of the site. The box *produces* data; the site
> *ships* a committed snapshot. Flow:
>
> ```
> Sieve on Hetzner ──devp2p──> Ethereum
>        │ (Postgres + GraphQL :4000)
>        ▼
> scripts/export-control-timeline.ts  (scheduled)
>        ▼
> data/control-timeline.json  (committed)  ──build──>  app reads at SSG time
> ```
>
> If the box is down, the last committed snapshot still ships. This mirrors the existing
> `data/tvl-snapshot.json` pattern and keeps the IPFS/ENS story intact.

## 1. Provision the box (Hetzner)

Sieve runs its own lightweight devp2p node — **no execution/consensus client, no RPC
provider, no archive node**. It only stores filtered contract data, so disk is modest.

- A Hetzner **dedicated** or CAX/CPX box is plenty (Sieve's own benchmark — ~1000 blocks/sec —
  is on a Hetzner dedicated server). Start with ~8 vCPU / 16–32 GB RAM / NVMe; size up only if
  backfill is slow.
- Install PostgreSQL; create db `sieve`.
- Cost note: this hosting sits inside the proposal's **$500/12mo Infrastructure** line. The
  "$0 RPC provider" claim stays literally true — Sieve uses no RPC.

## 2. Install Sieve

```bash
curl -fsSL https://raw.githubusercontent.com/slvDev/sieve/main/sieveup/install | bash
# or use the published Docker image
```

## 3. The config (already built)

`sieve.toml` in this directory is **complete and validated** — `sieve inspect --config sieve.toml`
parses all 6 Aave v3 contracts and resolves every event to its table. Nothing to finish before
running. How it was built, for reference / when widening coverage:

1. **ABIs** (committed in `abis/`) were fetched with `sieve add-contract <address> --name <n>
   --etherscan-api-key <key>`, which auto-resolves proxies to their implementation. The config
   uses the real Sieve schema: per-contract `abi = "abis/<n>.json"` + `[[contracts.events]]`
   blocks (the `events = ["Name"]` shorthand is **not** valid — Sieve rejects it). Events are
   pruned to the control plane; full event sets remain in the ABI files.
   - **Pool exception:** `add-contract` resolved `aave_v3_pool` to the implementation ABI
     (`PoolInstance`), which has no `Upgraded` event (the proxy emits it). `abis/aave_v3_pool.json`
     is therefore a minimal proxy ABI containing just `Upgraded(address)`. Re-fetch the impl ABI
     for Phase B (TVL via Supply/Withdraw).
2. **start_blocks** are creation blocks, verified against Etherscan `getcontractcreation`
   (2026-06-04): governance 18119225, payloads controller 18119740, executor (short) 18119610,
   executor (long) 18119717, Pool 16291127, ACL manager 16291117. No `# TODO`s remain.

## 4. Run

```bash
sieve   # backfills from each start_block, catches up to head, then follows. One command.
```
GraphQL comes up on `:4000`. Reorg-safe to 64 blocks.

## 5. Export → committed snapshot

`scripts/export-control-timeline.ts` (see that file) queries the GraphQL API, maps each event
to a `ControlAction` (`date`, `action`, `detail`, `provenance: "onchain"`, `txUrl` → Etherscan),
and writes `data/control-timeline.json` keyed by protocol id. Run it on a schedule (cron/systemd
timer) and commit the result — same cadence as the TVL refresh.

```bash
npm run export:timeline   # add to package.json: tsx scripts/export-control-timeline.ts
git add data/control-timeline.json && git commit -m "chore: refresh control timeline"
```

The app reads `data/control-timeline.json` at build time and renders it on each protocol detail
page (replacing the inline placeholder). Immutable protocols (Liquity v1, Morpho core, Uniswap
core) intentionally have **empty** timelines — that absence is the signal, and is labelled as
such rather than left blank.

## 6. Phase B — TVL cross-check (later, scoped)

Once control-timeline indexing is solid, add a TVL cross-check: index an Aave v3 reserve
(aToken Mint/Burn → supplied balance), give it accounting logic in a second export script, and
surface the on-chain number beside DefiLlama's. Label it openly as a cross-check, never a
replacement — per `../CHARTER.md`.

## Provenance discipline

Every indexed datum is `provenance: "onchain"` with a tx link — the strongest tier. This is the
whole point: the feeds *rate* control; the verification layer *proves* it. Nothing here produces
a Rails score; it relays chain facts.
