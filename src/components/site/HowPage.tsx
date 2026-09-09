import { useOfferStatsPublic } from '../../hooks/useOfferStatsPublic';
import {
  BRACKET_META,
  medianBracket,
  percentPlaced,
} from '../../midnight/offerstats';
import type { SiteView } from '../site/Navbar';

interface Props {
  onGo: (v: SiteView) => void;
}

/** The four-step mechanism, with live chain numbers where they exist. */
export function HowPage({ onGo }: Props) {
  const { deployed, view } = useOfferStatsPublic();
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = view ? medianBracket(view.counts) : null;

  return (
    <>
      <section className="hero-block section-center">
        <p className="kicker">How it works</p>
        <h1 className="mega">
          Simple for you. <em>Powerful for everyone.</em>
        </h1>
        <p className="lede" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          A privacy-first verification flow that turns individual offers into
          credible, tamper-proof statistics.
        </p>
      </section>

      <section className="trio" style={{ gridTemplateColumns: '1fr 1fr' }} aria-label="Mechanism">
        <div className="card trio-card">
          <span className="trio-num">1</span>
          <h3>Verify Your Offer</h3>
          <p className="muted">
            Upload your offer and privately prove it meets your CTC bracket.
          </p>
          <ul className="bars" aria-label="Brackets">
            {BRACKET_META.map((b) => (
              <li key={b.short} className="bar-row">
                <span className="bar-label">{b.short}</span>
                <span className="bar-track"><span className="bar-fill" style={{ width: '100%', opacity: 0.25 }} /></span>
              </li>
            ))}
          </ul>
          <button type="button" className="ghost small" onClick={() => onGo('students')}>
            Verify Your Offer →
          </button>
        </div>
        <div className="card trio-card">
          <span className="trio-num">2</span>
          <h3>Unique Nullifier</h3>
          <p className="muted">
            Each offer creates a unique proof commitment to prevent double counting.
          </p>
          <p style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.6rem 0 0' }}>
            One offer<br />One count<br />No duplicates
          </p>
          <p className="muted tiny" style={{ marginTop: '0.5rem' }}>
            {deployed && view ? `${view.nullifiersUsed}/32 nullifiers stored` : 'Nullifier set goes live with the pilot batch'}
          </p>
        </div>
        <div className="card trio-card">
          <span className="trio-num">3</span>
          <h3>Aggregated on Chain</h3>
          <p className="muted">
            Only anonymous counts are published. Never personal data.
          </p>
          <ul className="bars" aria-label="Live bracket counts">
            {BRACKET_META.map((b, i) => (
              <li key={b.short} className="bar-row">
                <span className="bar-label">{b.short}</span>
                <span className="bar-count">{deployed && view ? view.counts[i].toString() : '—'}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card trio-card">
          <span className="trio-num">4</span>
          <h3>Real Statistics</h3>
          <p className="muted">
            Get transparent, verifiable placement data for your cohort.
          </p>
          <p style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.6rem 0 0' }}>
            {deployed && pct ? `${pct}%` : '—'}
          </p>
          <p className="muted tiny" style={{ marginTop: '0.2rem' }}>
            Verified placement rate
            {deployed && median != null ? ` · median ${BRACKET_META[median].short}` : ''}
          </p>
          <button type="button" className="ghost small" onClick={() => onGo('stats')}>
            Open the board →
          </button>
        </div>
      </section>
    </>
  );
}
