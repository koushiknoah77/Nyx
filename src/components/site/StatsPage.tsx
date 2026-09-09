import { useOfferStatsPublic } from '../../hooks/useOfferStatsPublic';
import {
  BRACKET_META,
  medianBracket,
  percentPlaced,
} from '../../midnight/offerstats';
import { Faq } from '../site/Faq';

/** The public board: live aggregates, distribution chart, FAQ. */
export function StatsPage() {
  const { deployed, view, loading, error, refresh } = useOfferStatsPublic();
  const counts = view?.counts ?? [0n, 0n, 0n, 0n, 0n];
  const max = counts.reduce((a, b) => (a > b ? a : b), 1n);
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = view ? medianBracket(view.counts) : null;

  return (
    <>
      <section className="hero-block section-center">
        <p className="kicker">Placement Statistics</p>
        <h1 className="mega">
          Numbers you <em>can trust.</em>
        </h1>
        <p className="lede" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Verified, tamper-proof placement data from real student contributions.
        </p>
      </section>

      {!deployed ? (
        <section className="card" aria-label="Board pending">
          <div className="row">
            <h2>Pilot batch pending</h2>
            <span className="pill">Not deployed yet</span>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>
            This board fills the day the first class proves — bracket counts,
            placement rate, median. Until then, every figure here would be a
            guess, and guesses are what we kill.
          </p>
        </section>
      ) : (
        <>
          <div className="scope-row" aria-label="Scope">
            <span className="pill pre">2026 Batch</span>
            <span className="pill">All Departments</span>
            <span className="pill">CTC Brackets</span>
          </div>

          <section className="statrow" aria-label="Headline figures">
            <div className="stat">
              <span className="statnum">{view ? view.total.toString() : '…'}</span>
              <span className="statlabel">Verified Offers</span>
            </div>
            <div className="stat">
              <span className="statnum">{pct ?? '…'}{pct ? '%' : ''}</span>
              <span className="statlabel">Placement Rate</span>
            </div>
            <div className="stat">
              <span className="statnum">{median == null ? '…' : BRACKET_META[median].short}</span>
              <span className="statlabel">Median Bracket</span>
            </div>
          </section>

          <section className="card" aria-label="CTC distribution">
            <div className="row">
              <h2>CTC Distribution</h2>
              <span className="pill pre">{view ? `${view.nullifiersUsed}/32 counted` : 'Preprod'}</span>
            </div>
            {loading && !view ? (
              <p className="muted">Reading Preprod state…</p>
            ) : (
              <div className="vbars" role="img" aria-label="Verified offers per CTC bracket">
                {BRACKET_META.map((b, i) => (
                  <div key={b.short} className="vbar">
                    <span className="vbar-count">{counts[i].toString()}</span>
                    <span
                      className="vbar-col"
                      style={{ height: `${8 + (Number(counts[i]) / Number(max)) * 120}px` }}
                    />
                    <span className="vbar-label">{b.short}</span>
                  </div>
                ))}
              </div>
            )}
            {error && !view && (
              <div className="error" role="alert">
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}
            <div className="row" style={{ marginTop: '1rem' }}>
              <button type="button" className="ghost small" onClick={refresh} disabled={loading}>
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              <span className="muted tiny">Median derived off-chain from public counts.</span>
            </div>
          </section>

          <section className="card tint" aria-label="Audit trail">
            <div className="row">
              <h2 style={{ fontSize: '1.1rem' }}>Don&apos;t trust us. Audit this.</h2>
              <span className="pill pre">{view ? `${view.nullifiersUsed}/32 nullifiers` : '—'}</span>
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>
              Every counted offer leaves exactly one nullifier on-chain — proof that{' '}
              <em>an</em> offer was counted, without saying <em>whose</em>. Same offer
              twice gets rejected; invented entries can&apos;t exist here.
            </p>
          </section>
        </>
      )}

      <section className="section">
        <h2 className="mega" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>Frequently Asked Questions</h2>
        <Faq />
      </section>
    </>
  );
}
