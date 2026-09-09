/** Colleges buy credibility: the SaaS pitch, honestly scoped to the pilot. */
export function CollegesView() {
  return (
    <>
      <section className="hero-block" aria-label="Pitch to colleges">
        <span className="hero-eyebrow">
          <span className="dot" aria-hidden /> For placement cells
        </span>
        <h1 className="mega">
          Your best admission asset,
          <br />
          <em>beyond dispute.</em>
        </h1>
        <p className="lede">
          Every junior has seen a 100%-placed brochure they don&apos;t believe. Publish
          stats backed by proofs instead — “verified on-chain” next to every number you
          market.
        </p>
      </section>

      <section className="trio" aria-label="What you get">
        <div className="card trio-card">
          <span className="trio-num">01</span>
          <h3>A live board</h3>
          <p className="muted">
            Per-bracket counts, % placed, median — always current, every figure traceable
            to a proof. No screenshots of spreadsheets.
          </p>
        </div>
        <div className="card trio-card">
          <span className="trio-num">02</span>
          <h3>Unstuffable stats</h3>
          <p className="muted">
            Nullifiers make double-counting impossible and invented entries unprovable.
            Neither your staff nor ours can edit the ledger.
          </p>
        </div>
        <div className="card trio-card">
          <span className="trio-num">03</span>
          <h3>Private by default</h3>
          <p className="muted">
            Student salaries never touch the chain, the dashboard, or your office. The
            product can&apos;t leak what it never holds.
          </p>
        </div>
      </section>

      <section className="card" aria-label="Pilot offer">
        <div className="row">
          <h2>The pilot: one batch, 50 phones</h2>
          <span className="pill pre">Free pilot</span>
        </div>
        <ol className="how muted">
          <li>Your placed batch opens the app in one classroom session.</li>
          <li>Seniors prove (gasless — testers never see a seed phrase or fee).</li>
          <li>Juniors verify live. You walk away with the only placement page that proves itself.</li>
        </ol>
        <div className="cta-row" style={{ justifyContent: 'flex-start' }}>
          <a
            className="linkbtn big"
            href="https://github.com/koushiknoah77/Nyx"
            target="_blank"
            rel="noreferrer"
          >
            Run the pilot — start on GitHub ↗
          </a>
        </div>
        <p className="muted tiny" style={{ marginBottom: 0 }}>
          Later the same machine covers internships, hackathon wins — any countable
          credential your brochure wants to brag about.
        </p>
      </section>
    </>
  );
}
