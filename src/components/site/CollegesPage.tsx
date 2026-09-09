import { useOfferStatsPublic } from '../../hooks/useOfferStatsPublic';
import { percentPlaced } from '../../midnight/offerstats';
import type { SiteView } from '../site/Navbar';

interface Props {
  onGo: (v: SiteView) => void;
}

const BENEFITS = [
  ['Build trust with applicants', 'Independent verification of placement data.'],
  ['Prevent inflated claims', 'Numbers that cannot be manipulated.'],
  ['Detailed analytics', 'Bracket-wise distribution and trends.'],
  ['Shareable verification page', 'Showcase your verified stats publicly.'],
];

/** For Colleges: live report, benefits, honest voices, pilot CTA. */
export function CollegesPage({ onGo }: Props) {
  const { deployed, view } = useOfferStatsPublic();
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;

  return (
    <>
      <section className="hero-block">
        <p className="kicker">For Colleges</p>
        <h1 className="mega">
          Credible placement data is your <em>strongest story.</em>
        </h1>
        <p className="lede">
          Show the world your real impact with verified, tamper-proof placement statistics.
        </p>
      </section>

      <section className="trio" style={{ gridTemplateColumns: '1fr 1fr' }} aria-label="Report and benefits">
        <div className="card trio-card">
          <span className="pill pre">2026 Placement Report</span>
          <p className="muted tiny" style={{ margin: '0.5rem 0 0' }}>Verified by OfferStats</p>
          <div className="report" aria-label="Verified totals">
            <div className="report-cell">
              <div className="report-num">{deployed && view ? view.batchSize.toString() : '—'}</div>
              <div className="report-label">Total students</div>
            </div>
            <div className="report-cell">
              <div className="report-num">{deployed && view ? view.total.toString() : '—'}</div>
              <div className="report-label">Placed</div>
            </div>
            <div className="report-cell">
              <div className="report-num">{deployed && pct ? `${pct}%` : '—'}</div>
              <div className="report-label">Verified rate</div>
            </div>
          </div>
          <p className="muted tiny" style={{ marginBottom: 0 }}>
            {deployed ? 'Live on-chain counts — recompute them yourself.' : 'Live counts appear here the day the pilot batch opens.'}
          </p>
        </div>
        <div className="card trio-card">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.9rem' }}>
            {BENEFITS.map(([t, d]) => (
              <li key={t} style={{ display: 'flex', gap: '0.7rem' }}>
                <span className="checkdot" style={{ width: '1.4rem', height: '1.4rem', fontSize: '0.8rem', marginTop: '0.1rem' }}>✓</span>
                <div>
                  <b style={{ fontSize: '0.9rem' }}>{t}</b>
                  <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.82rem' }}>{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" style={{ marginTop: '1.1rem' }} onClick={() => onGo('join')}>
            Request a Demo
          </button>
        </div>
      </section>

      <section className="section">
        <h2 className="mega" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>Who it&apos;s for</h2>
        <div className="voices">
          <div className="card voice">
            <p className="voice-role">Senior perspective</p>
            <p>“Proof I placed, without my salary becoming corridor gossip. The badge is the point.”</p>
          </div>
          <div className="card voice">
            <p className="voice-role">Junior perspective</p>
            <p>“Real medians before I pick a college. No more brochure fiction.”</p>
          </div>
        </div>
      </section>

      <section className="card brand-panel" aria-label="Join the pilot">
        <h2>Join the movement for honest placement data.</h2>
        <p className="muted">One batch. Fifty phones. Stats nobody can inflate.</p>
        <div className="cta-row">
          <button
            type="button"
            onClick={() => onGo('join')}
            style={{ background: '#fff', color: 'var(--primary)', borderColor: '#fff', boxShadow: 'none' }}
          >
            Create Your Offer
          </button>
        </div>
      </section>
    </>
  );
}
