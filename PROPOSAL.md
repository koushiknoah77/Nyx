# PROPOSAL — OfferStats (Nyx)

> Level 3 product proposal, Midnight Builder Challenge.
> Track: **Consumer & Social** · Builds on: **Age / Eligibility Gate** + **Confidential Credentials**.

## 1. What is the product, and who uses it?

**OfferStats** is tamper-proof campus placement statistics. Placed seniors prove their offers
count toward honest aggregate stats — without anyone seeing their salary — so the numbers
cannot be inflated.

- **Seniors (placed):** prove their offer once (one offer = one count) and get a verified
  placement badge to flex. Privacy is the engine: they never reveal CTC or salary.
- **Juniors:** finally get placement numbers they can trust before choosing colleges.
- **Colleges & recruiters:** "stats nobody can inflate" — credible placement data is their
  #1 admission-marketing asset, and every number on the ledger traces back to a proof.

## 2. Why Midnight specifically?

The workflow has three properties that a transparent chain — or a plain server database —
cannot provide:

1. **One offer = one count.** A nullifier set lives on the ledger; no server admin, platform,
   or college can edit it. A database can be overwritten; a nullifier proof cannot.
2. **Salary must never be visible — not even to the platform.** The design publishes only
   aggregates. On a transparent chain the salary inputs would be public by construction;
   Midnight shielded state keeps them private witnesses.
3. **Threshold proof, not disclosure.** "CTC ≥ ₹X" is proven as a zero-knowledge predicate
   that reveals only true/false. Midnight ZK circuits make publish-the-aggregate /
   prove-the-inputs / hide-the-data the default architecture, not a bolt-on.

## 3. Data Model

| Visibility | Data | Notes |
|---|---|---|
| **PUBLIC** (ledger, auditable by anyone) | Per-bracket counts and % placed; median-CTC bracket totals; nullifier set (spent offer commitments); issuer commitment registry | Aggregates are the product — the world gets to see the numbers |
| **PRIVATE** (witness, never on-chain) | Offer-commitment preimage (student + offer details), CTC / salary value, student identity | Lives on the user device, dies with it |
| **DISCLOSED** (deliberate `disclose()` use) | The nullifier at count time (enforces one-offer-one-count); the boolean threshold result; an opt-in "verified placement" flag for a public badge | The minimum facts needed to make the stats true and auditable |

**Who receives what:** anyone on-chain sees only aggregates, nullifiers, and booleans. The
student sees their own proof inputs. Nobody — including the platform — ever sees the salary.

## 4. Mainnet Feasibility

**Yes, realistically by Level 6 — as a Preprod-validated product with a credible mainnet pilot.**

- The MVP contract is small and already proven in miniature: the Level 1 counter evolves
  directly — owner-bound increments become one-nullifier-one-count offer brackets, the 1–10
  ownership proof becomes a CTC-threshold predicate, `count` becomes per-bracket totals.
- The binding constraint is not the contract (weeks) but user acquisition — which is why
  L5 targets one placed batch, a natural first cohort.
- **Mainnet risks and mitigations:**
  - *Issuer-signed offer commitments:* MVP uses student-uploaded offer letters committed
    client-side; mainnet adds a trusted issuer role (college/HR) signing commitments.
  - *Wallet friction:* gasless through DUST sponsorship so testers never see a seed phrase
    or a fee.
  - *Scope discipline:* honest L6 target is a mainnet-ready contract + 20-user cohort pilot,
    not a public launch.
