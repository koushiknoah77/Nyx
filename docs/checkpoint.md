# Nyx — Checkpoint (continue here)

Date: 2026-09-08. Branch `main` on https://github.com/koushiknoah77/Nyx, tree clean.

## What this is
Nyx: privacy-first counter on Midnight, seed of OfferStats (honest placement
stats via threshold proofs + nullifiers). Founder README in `README.md`,
L4 submission in `docs/l4-idea.md`, L2 demo script in `docs/l2-demo.md`.

## Deployments (public info)
- Preview (L1): `6880d0b105b2f9610c14c73f9a68e240f08382a9feccdfd26fb23a99da186fa1` (previous build; redeploy blocked — wallet-sdk 1.2.0 shielded sync crashes on Preview, see below)
- Preprod (L2): `e15e39e7384dacd94089c6b5350094db636b3a238969d5da1793bfc445779890` (redeployed 2026-09-08 for the init-guard fix)
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
- L1: compile, Preview deploy (previous build), README, 5+ commits, submitted shape.
- Contract audit fix: `init` used a `count == 0` guard that never trips (init
  leaves count at 0) — anyone could re-run init and steal ownership. Fixed
  with an `initialized` ledger flag; 2 new tests (double-init rejects,
  pre-init increment rejects). Suite now 6/6.
- L2 code: Preprod redeploy of the fixed build, full frontend
  (connect/disconnect + errors, init/increment calls, local proving, hidden
  witnesses, exact UI label, real `initialized` flag read),
  `tsc` + `vite build` green, README sections.
- Frontend hardening: secret storage survives blocked/corrupt localStorage
  (session fallback + hex validation), wallet-name guard, malformed-tx guard.
- Known issue: Preview redeploy blocked — wallet-sdk 1.2.0 shielded sync
  throws `pendingOutputs.values.map is not a function` against Preview
  (Node 22 confirmed, good seed confirmed, virgin + restored state both fail;
  Preprod syncs clean). Likely Preview-side data tripping an SDK replay path.
  Workaround when needed: fresh Preview wallet + faucet funds (virgin shielded
  state has no history to replay).
- OfferStats v1 contract (`contracts/offerstats.compact` → `managed/offerstats/`,
  `tests/offerstats.test.ts` 8/8): brackets b0–b3, 32 nullifier slots, init guard,
  capacity guard. Compact 0.23 findings: no C-style loops (`for const of lo..hi`),
  no element-wise ledger-Vector writes, circuit params are private by default
  (branching needs `disclose()`). `npm run compile` builds both contracts.
  Not yet deployed; frontend still targets the counter.

## Still manual (needs human)
1. `npm i -g vercel; vercel login; vercel --prod` → paste URL into README Live Demo.
   Pre-verified locally 2026-09-09: tsc clean, 14/14 tests, public-counter (no-wallet
   view) + favicon/OG + SDK note + deploy checklist all committed, `npm run build`
   pending final run. Incognito check after deploy: public total must render with no wallet.
2. Record demo video per `docs/l2-demo.md` (now opens on the disconnected public
   total) → paste link into README Demo Video. Capture 4 UI PNGs per `docs/DEPLOY-CHECKLIST.md`.
3. Submit repo + live link on Rise In (L2 prize: 60 x $10).
4. Lace wallet on Preprod + local proof server selected, for demo + testing.

## Command cheat sheet (WSL, repo root)
- `npm run compile` / `npm test` / `npm run build` / `npm run dev`
- Deploy: `MIDNIGHT_WALLET_SEED=<seed> npx tsx scripts/deploy-counter.ts --network preprod`
- First sync is slow; reuse same-seed `.midnight-wallet-state/<net>/` to resume fast.
- Never commit: `.midnight-state.json`, `.midnight-wallet-state/`, `midnight-level-db/`, `dist/`, seeds.
