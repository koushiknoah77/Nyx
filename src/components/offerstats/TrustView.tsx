import { EXPLORER_URL } from '../../config';
import type { OfferStatsPublicState } from '../../hooks/useOfferStatsPublic';
import { CopyButton } from '../CopyButton';

/** The audit trail: every counted offer, no names — by design. */
export function TrustView({ offerStats }: { offerStats: OfferStatsPublicState }) {
  const { deployed, view, loading, error, refresh } = offerStats;

  return (
    <>
      <section className="card" aria-label="Why trust this">
        <h2>Don&apos;t trust us. Audit this.</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Each counted offer leaves exactly one nullifier on-chain — a commitment that
          proves <em>an</em> offer was counted without saying <em>whose</em>. Same offer
          twice? The chain rejects it. Invented entry? There&apos;s no proof behind it,
          so it can&apos;t exist here.
        </p>
      </section>

      <section className="card" aria-label="Counted offers">
        <div className="row">
          <h2>Counted offers</h2>
          <span className="pill pre">
            {deployed && view ? `${view.nullifiersUsed}/32 nullifiers` : 'Preprod'}
          </span>
        </div>

        {!deployed ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            No pilot batch on-chain yet. When the first class proves, every nullifier
            lands here — oldest first, each one traceable, none of them named.
          </p>
        ) : loading && !view ? (
          <p className="muted">Reading Preprod state…</p>
        ) : view && view.nullifiers.length > 0 ? (
          <ul className="activity">
            {view.nullifiers.map((nf, i) => (
              <li key={nf}>
                <span className="op">#{i + 1}</span>
                <span className="tx" title={nf}>{nf}</span>
                <CopyButton text={nf} label="Copy" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted" style={{ marginBottom: 0 }}>
            Batch is open, zero offers counted. Be the first proof.
          </p>
        )}

        {error && !view && (
          <div className="error" role="alert">
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {deployed && (
          <div className="row" style={{ marginTop: '0.7rem' }}>
            <button type="button" className="ghost small" onClick={refresh} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <a className="linkbtn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
              Explorer ↗
            </a>
          </div>
        )}
      </section>

      <section className="card" aria-label="How to verify">
        <h2>Verify in 3 steps</h2>
        <ol className="how muted">
          <li>Pick any nullifier above and copy it.</li>
          <li>Find its transaction on the Midnight explorer — the bracket it counted toward is public.</li>
          <li>Recompute the Stats board from the nullifiers. If a number doesn&apos;t trace here, it isn&apos;t real.</li>
        </ol>
      </section>
    </>
  );
}
