# L2 Demo Video Script (under 2 minutes)

Target: prove the four Step 7 shots. Total budget ~110 seconds.

## Setup before recording
- Lace wallet installed, switched to Preprod, funded with tNIGHT + DUST.
- Local proof server running (Lace Settings, Midnight section, Local):
  `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v`
- App open (live URL or `npm run dev` at http://localhost:5173).
- Counter already initialized once (so the recording shows an increment).
  If not: click "Initialize" first, wait, refresh.

## Shots
1. (0:00-0:25) Connect Lace wallet. Show the address appearing on screen.
   Say: "Connected through Lace on Preprod."
2. (0:25-1:00) Click "Increment +1 (private step)". Show the
   "Generating proof locally..." loading state. Say: "The proof is being
   generated locally in the wallet."
3. (1:00-1:35) Show the submitted transaction id and the refreshed public
   total going up. Say: "Submitted on-chain, and the public total moved."
4. (1:35-1:50) Point at the screen: no secret field, no step field anywhere.
   Point at the label. Say: "Proved without revealing your input - there is
   nowhere to even type it."

## Don'ts
- Never open devtools localStorage on camera (the owner secret lives there).
- Never paste a seed phrase or private key.
- Keep it under 2 minutes; one continuous take beats editing.
