# L3 Demo Video Script (about 1 minute)

Target: the L3 prompt's three beats — full dApp flow, test output, green CI badge.
Total budget ~60 seconds. Record at the **live Vercel URL**, not localhost.

## Setup before recording
- Live URL open on the Home view (fresh profile / logged out first frame).
- Terminal ready with `npm test` (warm cache so it runs in seconds).
- README open on GitHub, scrolled to the badge row.
- Lace on Preprod, funded; local proof server selected if you transact live.
  (Prefer showing a completed flow: initialize once before recording, then
  record an increment — same chain, less waiting.)

## Shots (~20s each)
1. (0:00–0:20) Full dApp flow. Home → Prove: connect Lace (address appears) →
   record/count action → proving spinner → tx id + refreshed public total.
   Say: "Connect, prove locally, submitted on-chain — the private input never appears."
2. (0:20–0:40) Terminal: run `npm test`. Hold on "Tests 21 passed (21)".
   Say: "Twenty-one tests: circuit logic, state transitions, privacy."
3. (0:40–1:00) GitHub README badges: point at the green CI badge + link the
   passing run. End on the Privacy Model section header.
   Say: "Green CI on every push; privacy is the product, not a footnote."

## Don'ts
- Never open localStorage devtools on camera (secrets live there).
- Never paste a seed phrase or private key.
- One minute means one minute — cut the touring, keep the three beats.
