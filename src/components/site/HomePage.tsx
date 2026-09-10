import { PhoneMock } from '../site/PhoneMock';
import { useOfferStatsPublic } from '../../hooks/useOfferStatsPublic';
import { BRACKET_META, medianBracket, percentPlaced } from '../../midnight/offerstats';
import type { SiteView } from '../site/Navbar';

interface Props {
  onGo: (v: SiteView) => void;
}

/** Landing: the promise, the live ticker, the pilot invite. */
export function HomePage({ onGo }: Props) {
  const { deployed, view } = useOfferStatsPublic();
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = view ? medianBracket(view.counts) : null;

  return (
    <>
      <section className="hero-block">
        <div className="hero-grid">
          <div>
            <p className="kicker">Private proof · Public truth</p>
            <h1 className="mega">
              Real Placement Stats. <em>No Guesswork.</em>
            </h1>
            <p className="lede">
              Students verify their offers privately. Colleges publish credible
              placement data. Finally, numbers you can trust.
            </p>
            <div className="cta-row">
              <button type="button" onClick={() => onGo('students')}>
                Verify Your Offer
              </button>
              <button type="button" className="ghost" onClick={() => onGo('stats')}>
                Explore Stats
              </button>
            </div>
          </div>
          <PhoneMock variant="home" />
        </div>
      </section>

      <section className="ticker" aria-label="Live chain figures">
        <div className="ticker-cell">
          <div className={`ticker-num${deployed && view ? ' ok' : ''}`}>
            {deployed && view ? view.total.toString() : '—'}
          </div>
          <div className="ticker-label">Verified offers</div>
        </div>
        <div className="ticker-cell">
          <div className="ticker-num">{deployed && view ? view.nullifiersUsed : '—'}/32</div>
          <div className="ticker-label">Nullifiers stored</div>
        </div>
        <div className="ticker-cell">
          <div className="ticker-num">{deployed && pct ? `${pct}%` : '—'}</div>
          <div className="ticker-label">Placement rate</div>
        </div>
        <div className="ticker-cell">
          <div className="ticker-num">{deployed && median != null ? BRACKET_META[median].short : '—'}</div>
          <div className="ticker-label">Median bracket</div>
        </div>
      </section>

      <section className="card tint pilot-strip" aria-label="Pilot invite">
        <div>
          <h2 style={{ fontSize: '1.15rem' }}>Launching with our first pilot batch.</h2>
          <p className="muted" style={{ margin: '0.3rem 0 0' }}>
            One graduating class proves. Everyone else verifies. Your college could be first.
          </p>
        </div>
        <button type="button" onClick={() => onGo('join')}>
          Join the pilot
        </button>
      </section>

      <section className="section section-center">
        <p className="kicker">How it works</p>
        <h2 className="mega" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
          Simple for you. <em>Powerful for everyone.</em>
        </h2>
        <p className="lede" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          A privacy-first verification flow that turns individual offers into
          credible, tamper-proof statistics.
        </p>
        <div className="cta-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="ghost" onClick={() => onGo('how')}>
            See the four steps
          </button>
        </div>
      </section>
    </>
  );
}
