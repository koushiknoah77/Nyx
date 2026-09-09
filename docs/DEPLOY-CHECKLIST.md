# Deploy + Resubmit Checklist (L2/L3)

Do these in order. Each step is a judge failure point from the last round.

## 1. Build locally (WSL Ubuntu, Node 22)
```bash
nvm use 22
npm ci
npm run compile   # expect "Compiling 2 circuits"
npm run typecheck # clean
npm test          # expect 14 passed (6 counter + 8 offerstats)
npm run build     # dist/ + dist/zk/counter/ artifacts
```
If `dist/zk/counter/` is missing, the deployed demo will fail proving — do not deploy.

## 2. Deploy frontend (Vercel)
```bash
npm i -g vercel
vercel login
vercel --prod
```
- Verify in an **incognito window with no wallet**: hero + contract bar + live
  public total + Privacy panel all render. This is the "empty demo" fix.
- Verify `https://<your-app>.vercel.app/zk/counter/` serves ZK artifacts (200s).
- Paste the production URL into `README.md` Live Demo (replacing the placeholder).

## 3. Screenshots (PNGs next to the .txt logs in docs/screenshots/)
- `ui-disconnected.png` — public total, no wallet
- `ui-connected.png` — Lace address + Initialize/Increment
- `ui-proving.png` — "Generating proof locally…" spinner
- `ui-incremented.png` — new total + tx id + activity feed

## 4. Demo video (< 2 min, unlisted YouTube/Loom)
Script: `docs/l2-demo.md`. Required beats:
0. disconnected public total → 1. connect + address → 2. increment + local-proving
spinner → 3. tx id + refreshed total → 4. point at Privacy panel + "nowhere to type a secret".
Never show localStorage devtools or seeds. Paste link into `README.md` Demo Video.

## 5. Push + CI
```bash
git push origin main
```
Confirm the `CI` badge in README is green (compile + typecheck + test + build).

## 6. Resubmit on Rise In
Submit: repo URL + live Vercel URL + demo video link + Preprod address
`e15e39e7384dacd94089c6b5350094db636b3a238969d5da1793bfc445779890`.
If a judge flags `@midnight-ntwrk/midnight-js-network-provider` as missing, point to
`docs/l2-sdk-note.md` — that package 404s on npm; the 4.x equivalents are all wired.
