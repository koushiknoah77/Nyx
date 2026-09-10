# Audit — OfferStats + Counter (self-review, 2026-09-10)

Method: branch-by-branch read of both circuits, witness/disclose inventory,
integration-seam review (providers, witnesses, deploy scripts, UI guards).
Counts verified by inspection: 32 nullifier stores, 32 freshness asserts,
31 `total == N` comparisons + terminal else = 32 slot paths, exact boundary
predicates per bracket. Test suite: 21 green at time of writing.

## Findings

### F1 — Self-attested salaries: v1 proves consistency + uniqueness, not truth (HIGH, accepted by design)
`record()` verifies the salary is *consistent* with the claimed bracket and
the secret is *fresh* — but nothing binds the salary to a real offer. A user
can type any figure with a fresh secret and count it. The nullifier stops
double-counting, not fabrication.
- Status: **accepted for the pilot** (a classroom of known seniors +
  placement-cell oversight makes fabrication pointless), **must-fix for
  mainnet** via issuer-signed offer commitments (tracked in PROPOSAL.md §4).
- Never claim otherwise: the product proves *"a valid uncounted offer sits
  in bracket N"*, not *"this person earns ₹X"*.

### F2 — `init` accepted size 0 and sizes above slot capacity (MEDIUM, FIXED)
`init(size)` disclosed any `Uint<64>`: `0` (division-by-nothing % placed)
and `> 32` (cohort larger than the 32 nullifier slots — % placed can never
reach 100%) both produced incoherent states.
- Fix: `assert(size > 0)` + `assert(size <= 32)` with distinct messages, plus
  a circuit test. Batch semantics now: v1 holds one pilot batch of ≤ 32;
  larger cohorts need sharding (v2).

### F3 — Permissionless `init` front-run window (MEDIUM, FIXED procedurally)
Anyone could call `init` first and poison the batch (wrong size, or simply
not the placement cell). Compact has no `msg.sender`, so this cannot be
fixed in-circuit in v1.
- Fix: `scripts/deploy-offerstats.ts` now calls `init(batch-size)` in the
  **same run, same wallet**, immediately after deploy — the window shrinks
  to seconds and the UI init path remains for test/fresh flows.
- Counter note: same class existed; that contract is already deployed and
  initialized, so the window is closed.

### F4 — `pendingCtc` module-global races concurrent `record()` calls (LOW, mitigated)
The salary witness reads a module-level variable set just before the call.
Two overlapping record calls could cross salaries.
- Mitigation: UI serializes via `busy` disable on all record buttons; the
  variable is cleared in `finally`. Documented; a per-call witness scope is
  the future fix if concurrent proving is ever needed.

### F5 — Browser secret storage XSS surface (LOW, noted)
Offer/counter secrets live in localStorage; any injected script could read
them. Standard web threat, no chain impact (secrets only authorize proofs
for their own nullifiers), mainnet hardening later (seedless/gasless flows).

### F6 — Placeholder private-state password (LOW, noted)
`'Nyx-Local-Placeholder-Password-1'` in browser providers. Fine for Preprod
pilot; mainnet must derive per-user storage keys.

## Verified correct (do not "fix")
- Nullifier coverage: all 32 slots asserted fresh on every record.
- Slot routing: `total == 0..30` + else (guard pins `total ≤ 31`) — every
  total lands exactly one slot, no gaps, no overwrites (fill test proves
  32 distinct non-zero commitments then `batch full`).
- Boundary predicates exact at every cut (600k, 1M, 1.5M, 2M) — tested.
- Double-`init` and pre-`init` guards on both contracts — tested.
- Disclosure minimality: owner commitment / nullifier / bracket / size only;
  salary and secrets never disclosed — privacy tests assert absence.
- No `.tsx` view touches secret storage — asserted in CI (`npm run judge`).
- Counter: init-guard flag, owner-only increment, constant-+1 — tested.
