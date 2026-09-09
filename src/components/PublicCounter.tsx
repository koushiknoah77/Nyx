import { EXPLORER_URL, PREPROD_CONTRACT_ADDRESS } from '../config';
import type { CounterView } from '../midnight/providers';
import { toHex } from '../midnight/wallet';
import { CopyButton } from './CopyButton';
import { PrivacyPanel } from './PrivacyPanel';

interface Props {
  view: CounterView | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

/**
 * Live Preprod state visible WITHOUT a wallet. This is what judges see
 * first — the demo is never an empty page, even with no Lace installed.
 */
export function PublicCounter({ view, loading, error, onRefresh }: Props) {
  return (
    <section className="card" aria-label="Live counter on Preprod">
      <div className="row">
        <h2>Live on Preprod</h2>
        <span className="pill pre">No wallet needed to view</span>
      </div>

      {loading && !view ? (
        <div className="countbox skeleton" aria-label="Loading on-chain state">
          <span className="count">…</span>
          <span className="muted">Reading Preprod state…</span>
        </div>
      ) : view ? (
        <div className="countbox">
          <span className="count" key={view.count.toString()}>
            {view.count.toString()}
          </span>
          <span className="muted">
            {view.initialized ? 'current public total' : 'deployed · not initialized yet'}
          </span>
        </div>
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
          <CopyButton text={PREPROD_CONTRACT_ADDRESS} label="Copy contract" />
          <a className="linkbtn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
            Explorer ↗
          </a>
        </span>
      </div>

      <p className="muted tiny" style={{ marginTop: '0.7rem' }}>
        Owner commitment (public):{' '}
        {view
          ? view.owner.some((b) => b !== 0)
            ? `${toHex(view.owner).slice(0, 24)}…`
            : 'not bound yet — no owner has initialized'
          : '—'}
        {' · '}Connect Lace below to initialize or increment.
      </p>

      <PrivacyPanel />
    </section>
  );
}
