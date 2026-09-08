# Nyx — Checkpoint (continue here)

Date: 2026-09-08. Branch `main` on https://github.com/koushiknoah77/Nyx, tree clean.

## What this is
Nyx: privacy-first counter on Midnight, seed of OfferStats (honest placement
stats via threshold proofs + nullifiers). Founder README in `README.md`,
L4 submission in `docs/l4-idea.md`, L2 demo script in `docs/l2-demo.md`.

## Deployments (public info)
- Preview (L1): `6880d0b105b2f9610c14c73f9a68e240f08382a9feccdfd26fb23a99da186fa1`
- Preprod (L2): `3cec0caf86e0daf71868051c301f9c7841586963c3063ba3b232835ef304ff4f` (redeployed for constant-1 increment)
- Records live in local `.midnight-state.json` (gitignored, never commit).
- Wallet seeds live ONLY in `../mn-demo/.midnight-state.json` + env vars (never in repo).

## Toolchain (all in WSL Ubuntu, never PowerShell)
- `nvm use 22` → Node v22.23.2. PowerShell has Node 24 + wrong `compact` — ignore both.
- `compact compile --version` → 0.31.1. Runtime 0.16.0. midnight-js 4.1.1. wallet-sdk 1.2.0.
- Proof server `midnightntwrk/proof-server:8.1.0` on 6300. If unreachable, Docker
  Desktop itself is probably down: relaunch it, then `docker start midnight-proof-server`.
- Matrix is law: https://docs.midnight.network/relnotes/support-matrix
- Prompt package names that DO NOT EXIST: `@midnight-ntwrk/compact-compiler`,
  `@midnight-ntwrk/midnight-js-network-provider`. Never install those.

## Repo map
- `contracts/counter.compact` → `managed/counter/` (0.31.1 artifacts, committed)
- `src/` React+Vite dApp (App, components/WalletConnect+ CircuitCall,
  hooks/useMidnight, midnight/providers+wallet+ws-shim, config)
- `public/zk/counter/` browser ZK artifacts (copied from managed, committed)
- `scripts/deploy-counter.ts` deploys `--network preview|preprod` with
  `MIDNIGHT_WALLET_SEED` env. Wallet sync in `.midnight-wallet-state/` (gitignored).
- Faucets: preview `midnight-tmnight-preview.nethermind.dev`,
  preprod `midnight-tmnight-preprod.nethermind.dev`.

## Done
- L1: compile, 4/4 tests (constant-1 design), Preview deploy, README, 5+ commits, submitted shape.
- L2 code: Preprod deploy, full frontend (connect/disconnect + errors,
  init/increment calls, local proving, hidden witnesses, exact UI label),
  `tsc` + `vite build` green, L1 tests still 4/4 (constant-1 design), 9 L2 commits, README sections.

## Still manual (needs human)
1. `npm i -g vercel; vercel login; vercel --prod` → paste URL into README Live Demo.
2. Record demo video per `docs/l2-demo.md` → paste link into README Demo Video.
3. Submit repo + live link on Rise In (L2 prize: 60 x $10).
4. Lace wallet on Preprod + local proof server selected, for demo + testing.

## Command cheat sheet (WSL, repo root)
- `npm run compile` / `npm test` / `npm run build` / `npm run dev`
- Deploy: `MIDNIGHT_WALLET_SEED=<seed> npx tsx scripts/deploy-counter.ts --network preprod`
- First sync is slow; reuse same-seed `.midnight-wallet-state/<net>/` to resume fast.
- Never commit: `.midnight-state.json`, `.midnight-wallet-state/`, `midnight-level-db/`, `dist/`, seeds.
