import { EXPLORER_URL, OFFERSTATS_CONTRACT_ADDRESS } from '../config';
import {
  BRACKET_META,
  medianBracket,
  percentPlaced,
  type OfferStatsView,
} from '../midnight/offerstats';
import { CopyButton } from './CopyButton';

interface Props {
  deployed: boolean;
  view: OfferStatsView | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

/**
 * Public placement-stats dashboard. Aggregates only: per-bracket counts,
 * % placed, median bracket, nullifiers used. No names, no salaries —
 * there is nothing private on this screen by construction.
 */
export function OfferStatsDashboard({ deployed, view, loading, error, onRefresh }: Props) {
  if (!deployed) {
    return (
      <section className="card" aria-label="OfferStats not deployed">
        <div className="row">
          <h2>OfferStats pilot batch</h2>
          <span className="pill">Not deployed yet</span>
        </div>
        <p className="muted">
          The OfferStats contract (4 CTC brackets, 32-slot nullifier set) is written and
          tested (8/8 green) but not yet deployed to Preprod. Deploy it, paste the address
          into <code>src/config.ts</code>, and this tab becomes the live stats board.
        </p>
        <p className="muted tiny" style={{ marginBottom: 0 }}>
          <code>npm run deploy:offerstats -- --network preprod</code>
        </p>
      </section>
    );
  }

  const counts = view?.counts ?? [0n, 0n, 0n, 0n];
  const max = counts.reduce((a, b) => (a > b ? a : b), 1n);
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = medianBracket(counts);

  return (
    <section className="card" aria-label="Placement statistics">
      <div className="row">
        <h2>Verified placements</h2>
        <span className="pill pre">Public aggregates only</span>
      </div>

      {loading && !view ? (
        <p className="muted">Reading Preprod state…</p>
      ) : view ? (
        <>
          <div className="statrow">
            <div className="stat">
              <span className="statnum">{view.total.toString()}</span>
              <span className="statlabel">offers counted / 32 slots</span>
            </div>
            <div className="stat">
              <span className="statnum">{pct ?? '—'}{pct ? '%' : ''}</span>
              <span className="statlabel">
                placed{view.batchSize > 0n ? ` of ${view.batchSize.toString()}` : ''}
              </span>
            </div>
            <div className="stat">
              <span className="statnum">{median == null ? '—' : BRACKET_META[median].short}</span>
              <span className="statlabel">median bracket</span>
            </div>
          </div>

          <ul className="bars" aria-label="Per-bracket counts">
            {BRACKET_META.map((b, i) => {
              const c = counts[i];
              const width = `${(Number(c) / Number(max)) * 100}%`;
              return (
                <li key={b.short} className="bar-row">
                  <span className="bar-label">{b.short}</span>
                  <span className="bar-track">
                    <span className="bar-fill" style={{ width }} />
                  </span>
                  <span className="bar-count">{c.toString()}</span>
                </li>
              );
            })}
          </ul>

          <p className="muted tiny">
            Nullifiers stored: {view.nullifiersUsed}/32 — one offer, one count, nobody
            double-counts. Median is derived off-chain from these public totals.
          </p>
        </>
      ) : (
        <p className="muted">Could not load Preprod state yet.</p>
      )}

      {error && !view && (
        <div className="error" role="alert">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="row" style={{ marginTop: '0.7rem' }}>
        <button type="button" className="ghost small" onClick={onRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        <span style={{ display: 'flex', gap: '0.4rem' }}>
          <CopyButton text={OFFERSTATS_CONTRACT_ADDRESS} label="Copy contract" />
          <a className="linkbtn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
            Explorer ↗
          </a>
        </span>
      </div>
    </section>
  );
}
