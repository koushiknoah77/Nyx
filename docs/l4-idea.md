# L4 Idea Submission — Nyx / OfferStats

## Track
Consumer & Social

## Builds on (from the provided idea list)
Age / Eligibility Gate (prove a threshold without revealing the underlying value)
+ Confidential Credentials (prove a credential is valid without disclosing it)

## One-line overview
Tamper-proof campus placement statistics: placed seniors prove their offers count, without anyone seeing their salary — so colleges can't inflate the numbers.

## Problem
Every admission season, colleges publish placement stats that students don't trust — 100% placed, sky-high medians — and nobody can disprove them, because the raw data (who got what offer) is private and should stay private. The lie survives on the fact that the truth can't be shown.

## Solution
OfferStats lets a placed senior generate a ZK proof from an issuer-signed offer letter:
an offer commitment plus a nullifier means one offer = one count — no double-counting,
no invented entries. The contract publishes only aggregates: median CTC, % placed,
bracket counts. No names, no exact salaries. Only booleans and totals ever touch
the public ledger; everything identifying stays a private witness.

## Why Midnight (primitives used because the design needs them)
- Issuer-signed offer commitments (placement cell; mocked off-chain data for now)
- Range predicate: CTC >= threshold, disclosing only true/false
- Nullifier set on ledger: one offer counted once — this is what makes the stats
  unstuffable, which a plain server database can never guarantee
- Public aggregate ledger: per-bracket totals anyone can audit

## L4–L6 fit
- L4: MVP live on Preprod — senior prove-screen + public stats dashboard + docs/CI/CD.
- L5: 50 Preprod users = one placed batch proving + juniors verifying; feedback loop
  built into the dashboard. Gasless via DUST sponsorship so testers never touch keys.
- L6: Mainnet deploy + brand assets + 20 real users from the same cohort.

## Grows out of L1
Deployed Preview counter (6880d0b105b2f9610c14c73f9a68e240f08382a9feccdfd26fb23a99da186fa1)
evolves directly: owner-bound increments become one-nullifier-one-count offer brackets,
the 1–10 range proof becomes a CTC-threshold predicate, `count` becomes per-bracket
public totals.
