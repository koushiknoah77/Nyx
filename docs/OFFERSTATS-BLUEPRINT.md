# OfferStats — Full Idea + Midnight Implementation

> Canonical blueprint: the product, the cryptography, the code, and the path
> to mainnet. Everything below maps to files in this repo.

## Part I — The Idea

### 1. Problem
Every admission season, colleges publish placement reports — 100% placed,
₹X LPA median, highest package, N companies — that prospective students and
parents cannot independently verify. The underlying evidence (which student
got which offer, from whom, for how much) is sensitive and **should stay
private**. Hence the deadlock: private data → unverifiable claims; public
data → destroyed privacy.

### 2. Core insight
**You don't need to reveal the evidence to prove the evidence exists.**
A senior proves *"a legitimate offer of mine sits in bracket N"* while
revealing no name, salary, company, letter, wallet, or exact compensation.
The public sees only the resulting aggregate — and can trust it anyway.

### 3. Mechanism (one offer → one count)
```text
Offer
  ↓  private verification (bracket predicate on hidden salary)
Credential qualifies
  ↓  unique nullifier committed on-chain
Bracket selected (public by design — it picks which total moves)
  ↓
Aggregate counter +1
```
The nullifier is the load-bearing primitive: the system detects that the
*same credential already contributed* without knowing *who submitted it*.
Privacy, uniqueness, and public verifiability at once.

### 4. Actors and incentives
- **Seniors** prove once and get a **Verified Badge** (bracket shown, salary
  hidden) — status on campus, shareable flex. Not altruism: social proof.
- **Juniors** finally see real medians and distributions before choosing
  colleges. Every number traces to a proof they can audit.
- **Colleges** buy credibility: "Trust us" becomes **"Verify us."**
  Verified rate, verified median, verified counts — an admission asset no
  rival can dismiss. Free for students; institutions pay for cohorts,
  dashboards, analytics, API, accreditation evidence.

### 5. Wedge and vision
First market is **placement transparency**: annual event, defined cohort,
strong incentives, existing distrust — ideal for verification. Launch is
**one verified placement batch** (≈50 users: 20–30 seniors, juniors, one
placement rep; gasless via DUST so testers never touch keys). The same
nullifier-bracket machine then extends to internships, hackathon wins,
certifications — a private-credential → public-statistic protocol.
Positioning: **Private proof. Public truth.** We don't publish the evidence.
We publish the proof that the count is real.

## Part II — Midnight Implementation

### 6. Contracts (`contracts/`)
**`counter.compact` (seed, deployed).** Ledgers: `count`, `owner`
commitment, `initialized` flag. Witness: `userSecret()`. Circuits:
`init()` (one-time `disclose(ownerOf(secret))`), `increment()` (owner-only
+1). Proves the ownership pattern the product scales up.

**`offerstats.compact` (v1, 5 brackets, 32 slots).** Ledgers: `batchSize`,
`initialized`, `total`, `b0..b4`, nullifier slots `n00..n31`. Witnesses:
`offerSecret()`, `ctc()`. Circuits:
- `init(size)` — placement cell publishes batch size (`disclose(size)`), once.
- `record(bracket)` — atomic: init guard → capacity guard (`total < 32`) →
  `disclose(bracket)` + range check → `disclose(nullifierOf(secret))` +
  32-way freshness asserts → private salary range predicate per bracket →
  store nullifier in slot `total` → `total + 1`.
- Brackets: `<6L | 6–10L | 10–15L | 15–20L | 20L+` (bottom is a catch-all so
  sub-₹3L offers count instead of silently dropping).

Privacy per field: public = counts, batch size, flag, nullifiers (hash
commitments, not identities). Private = secret, exact CTC, caller identity.
Disclosed = nullifier + bracket index + threshold booleans — the minimum
facts that make stats true and auditable. Salary and secret are **never**
disclosed. Top-of-file comment blocks in both contracts state this.

### 7. Frontend (`src/`)
- **Site** (`components/site/`): Home (hero, live chain ticker, pilot
  invite), About, How (4-step mechanism, live counts), Students (benefits +
  real prove flow + VerifiedBadge with share text), Colleges (live report +
  pilot CTA), Stats (scope, headline cards, distribution chart, nullifier
  audit strip, FAQ), Join (local pilot waitlist), hash-routed (`#/stats`),
  GSAP hero/scroll choreography + Lenis smooth scroll on Home.
- **Midnight layer** (`midnight/`): `network-provider.ts` owns the network
  role (Preprod indexer reads + Lace connect/network guard);
  `providers.ts` assembles the six midnight-js providers (indexer,
  level-private-state, fetch-ZK-config, dapp-connector proof provider,
  wallet hex-bridge, midnight submit); `offerstats.ts` adds witnesses
  (localStorage secret; **in-memory-only salary, cleared after proving**),
  state reader (incl. nullifier hex trail), `init`/`record` via
  `findDeployedContract().callTx`; `wallet.ts` holds all secret material.
- **Guarantee enforced in CI**: no `.tsx` view touches secret storage
  (`npm run judge` asserts it); the salary input clears on submit.

### 8. Tests, CI, deploy
- **21 tests**: 6 counter (binding, double-init, pre-init, accumulation,
  non-owner, privacy) · 8 OfferStats circuits (setup, 5-bracket counting,
  exact boundaries, bad index, double-count, 32-fill + full, privacy) ·
  7 UI helpers (bracket map, % placed, median, INR format, badge text).
- **CI** (`.github/workflows/ci.yml`): Compact 0.31.1 install → deps →
  `npm run judge` → compile → typecheck → tests → `vite build`. Green.
- **Deploy** (`scripts/`): `deploy-counter.ts` (live: Preprod `e15e39e7…`,
  Preview `6880d0b1…`) and `deploy-offerstats.ts` (records under
  `contracts["offerstats:<network>"]` without clobbering the counter slot;
  needs a funded `MIDNIGHT_WALLET_SEED`; paste address into
  `src/config.ts`, rebuild, init batch from the Students page).
- **Docs**: `PROPOSAL.md` (idea-list fit: Confidential Credentials +
  Age/Eligibility Gate), `docs/l4-idea.md`, `USAGE.md`, `l2-demo.md`,
  `l3-demo.md`, `l2-sdk-note.md`, `DEPLOY-CHECKLIST.md`.

### 9. Honest limits (v1 → mainnet)
- 32 offers per batch (explicit nullifier fields; v2 = Merkle set or shards).
- v1 sybil model is out-of-band (placement cell hands each senior one
  secret); mainnet adds **issuer-signed offer commitments**.
- Wallet-visible today; **DUST-sponsored gasless** for the classroom pilot.
- Median/% derived off-chain from public counts — recomputable by anyone.
- L5 (50-user batch + feedback loop) and L6 (mainnet-ready contract +
  20-user pilot) are human operations; the code is ready for them.

### 10. One line
**OfferStats lets students privately prove their placement offer is real and
belongs in a CTC bracket, publishing only anonymous aggregates — so colleges
can no longer inflate placement numbers without exposing anyone's salary.**
