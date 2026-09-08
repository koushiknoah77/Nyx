# Nyx — Usage Guide

Nyx is a privacy-first counter on Midnight Preprod: a public total that only the owner
can move, with the owner secret never leaving your device. The increment is the public
constant 1 — there is no step input at all.

## Prerequisites

- **Lace wallet** (Chrome extension), switched to the **Preprod** network, funded with
  tNIGHT and DUST (faucet: https://midnight-tmnight-preprod.nethermind.dev).
- A reachable proof server for local proving (Lace Settings → Midnight section):
  - Local: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`
  - Or select Lace public prover if available in your Lace version.

## Getting Started on Preprod

1. Install the Lace wallet extension and create/restore a wallet.
2. In Lace, switch the network to **Preprod** and fund your address at the faucet.
3. Open the Nyx app (live URL or `npm run dev` → http://localhost:5173).
4. Click **Connect Wallet** and approve the connection in Lace.
5. If the counter shows "not initialized yet", click **Initialize** once — this binds the
   owner secret (stored only in this browser) to the contract.
6. Click **Increment +1** — the proof is generated locally in your wallet, the
   transaction is submitted on-chain, and the public total moves up by one.

## Your First Transaction

Initialize → wait for the total to appear → Increment +1 → watch the tx id and the
refreshed total. The label "Proved without revealing your input" is not decoration:
there is no input field in the app, the owner secret never leaves your browser, and the
increment is a public constant.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Lace wallet not installed" | Install Lace from the Chrome Web Store, then refresh the page (wallets inject only after a reload). |
| Wallet on the wrong network | Switch Lace to Preprod and reconnect. |
| Proving hangs on "Generating proof locally…" | Lace needs a reachable proof server — start the local one (port 6300) or pick the public prover in Lace Settings. |
| "already initialized" | The counter is bound to this browser secret. Switch to the browser that initialized it, or deploy a fresh contract. |
| "not owner" | The current browser has a different secret than the one that initialized the counter. |
| Count lags after submit | The indexer lags a few seconds; the app auto-refreshes and there is a manual Refresh button. |
| `npm` fails on Windows | The toolchain targets WSL Ubuntu — run all npm commands in WSL (`nvm use 22`). |

## Privacy model (short version)

- PUBLIC: the running total and the owner commitment.
- PRIVATE: the owner secret (32 bytes, device-local) and the identity behind a call.
- PROVED without revealing: "I know the secret behind this counter".
- The increment is the public constant 1 — there is no step to hide.
