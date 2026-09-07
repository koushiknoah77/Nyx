# Campus Counter
> A privacy-first counter on Midnight: only the owner can increment, the step stays secret, and only the total is ever public.

## Contract Address
| Network | Address |
|---------|------------------------------------------------------------------|
| Preview | 6880d0b105b2f9610c14c73f9a68e240f08382a9feccdfd26fb23a99da186fa1 |
| Preprod | [PASTE ADDRESS AFTER DEPLOY] |

## What This Does
Campus Counter is a Compact smart contract that keeps a running total anyone can read, while the *increments* stay private. The owner initializes the counter by binding it to a secret commitment, then increments it with hidden steps (1–10). Each call proves two things in zero knowledge: the caller is the owner, and the hidden step is in range. Built as the Level 1 entry for a campus-eligibility product (prove enrollment/age/threshold without revealing ID/DOB/grades) — the counter is the minimal circuit exercising the same public/private/disclose pattern.

## Privacy Model
- What is PUBLIC (on-chain, visible to anyone):
  - `count`: the running total.
  - `owner`: a hash commitment (`persistentHash("campus-counter:owner:v1" || secret)`) identifying the owner without revealing the secret.
- What is PRIVATE (private witness, never on-chain):
  - `userSecret()`: the owner's 32-byte secret.
  - `secretStep()`: the increment amount (1–10).
- What the user PROVES without revealing:
  - Knowledge of the secret behind the `owner` commitment.
  - That the hidden increment is within 1–10.

## Tech Stack
- Midnight network, Compact language (compiler 0.31.1, language 0.23.0, `pragma language_version >= 0.23`)
- Node.js v22 (WSL Ubuntu via nvm), Docker (proof server `midnightntwrk/proof-server:8.1.0` on port 6300)
- `@midnight-ntwrk/compact-runtime` 0.16.0, `@midnight-ntwrk/midnight-js-*` 4.1.1, `@midnight-ntwrk/wallet-sdk` 1.2.0, TypeScript, Vitest
- Deployed to Preview: `6880d0b105b2f9610c14c73f9a68e240f08382a9feccdfd26fb23a99da186fa1`

## Prerequisites
- Node.js v22 (WSL Ubuntu: `nvm use 22` — Windows PowerShell Node is NOT supported, use WSL per https://docs.midnight.network/guides/windows-compact-setup)
- Docker running + proof server on port 6300: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`
- Compact toolchain manager (`compact update 0.31.1` per https://docs.midnight.network/relnotes/support-matrix — NOT `npm install -g @midnight-ntwrk/compact-compiler`)

## Setup
```bash
cd my-project
npm install
npm run compile   # compact compile contracts/counter.compact managed/counter
```

## Run Tests
```bash
npm test   # vitest run — 5 tests: circuit logic, state transitions, privacy
```

## Initial Idea
Campus clubs and canteens need to check eligibility (enrolled student, age 18+,
meal-credit threshold) without collecting ID cards, birth dates, or grades.
The end goal is a campus pass where a student proves "I qualify" in zero
knowledge and only a pass/fail plus a nullifier goes on-chain.

This Level 1 counter is the minimal version of that pattern: `count` and an
owner commitment are public, while the secret and each increment (1–10) stay
private as witnesses. `init` binds the counter to `ownerOf(secret)` and
`increment` proves ownership plus range, disclosing only the new total. Level 2
will put a frontend on top; later levels extend the same shape to real
eligibility attributes.

## Screenshots
Terminal captures live under `docs/screenshots/`.
To add PNGs: take screenshots of your own terminal and save them as
`docs/screenshots/compile.png`, `tests.png`, `deploy.png`.

### Compile (`docs/screenshots/compile.txt`)
```text
> campus-counter-l1@1.0.0 compile
> compact compile contracts/counter.compact managed/counter && node scripts/syncify-managed.mjs managed

Compiling 2 circuits:
syncify-managed: nothing to change
```

### Tests — 5 passing (`docs/screenshots/tests.txt`)
```text
 ✓ tests/counter.test.ts (5 tests)

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

### Deploy — Preview contract address (`docs/screenshots/deploy.txt`)
```text
Contract Address: 6880d0b105b2f9610c14c73f9a68e240f08382a9feccdfd26fb23a99da186fa1
```
