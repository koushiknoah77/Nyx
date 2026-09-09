import type { OfferStatsPublicState } from '../../hooks/useOfferStatsPublic';
import { BRACKET_META, medianBracket, percentPlaced } from '../../midnight/offerstats';

export type View = 'home' | 'stats' | 'prove' | 'trust' | 'colleges' | 'counter';

interface Props {
  offerStats: OfferStatsPublicState;
  onGo: (v: View) => void;
}

/** The landing page: the lie, the killing of it, and the live proof. */
export function HomeView({ offerStats, onGo }: Props) {
  const { deployed, view } = offerStats;
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = view ? medianBracket(view.counts) : null;

  return (
    <>
      <section className="hero-block" aria-label="OfferStats pitch">
        <span className="hero-eyebrow">
          <span className="dot" aria-hidden /> Tamper-proof placement stats · Midnight Preprod
        </span>
        <h1 className="mega">
          Stats nobody
          <br />
          <em>can inflate.</em>
        </h1>
        <p className="lede">
          Every admission season, brochures claim 100% placed. Placed seniors now prove
          their offers count toward honest numbers — without anyone seeing their salary.
          One offer, one count. No double-counting, no invented entries.
        </p>
        <div className="cta-row">
          <button type="button" onClick={() => onGo('prove')}>
            Prove your offer
          </button>
          <button type="button" className="ghost" onClick={() => onGo('stats')}>
            Verify the numbers
          </button>
        </div>
      </section>

      <section className="card versus" aria-label="Claimed versus proven">
        <div className="vs-col claim">
          <p className="vs-kicker">The brochure claims</p>
          <p className="vs-num">100%</p>
          <p className="vs-note muted">placed · sky-high medians · zero proof</p>
          <span className="pill off">unproven</span>
        </div>
        <div className="vs-x" aria-hidden>vs</div>
        <div className="vs-col proof">
          <p className="vs-kicker">The chain proves</p>
          <p className="vs-num">
            {!deployed ? '—' : view ? `${pct ?? '—'}${pct ? '%' : ''}` : '…'}
          </p>
          <p className="vs-note muted">
            {!deployed
              ? 'pilot batch goes live soon'
              : view
                ? `${view.total.toString()} verified offers · median ${median == null ? '—' : BRACKET_META[median].short}`
                : 'reading Preprod…'}
          </p>
          <span className={`pill ${deployed ? 'on' : ''}`}>
            {deployed ? '● verified on-chain' : '○ pilot pending'}
          </span>
        </div>
      </section>

      <section className="card" aria-label="How it works">
        <h2>How the lie dies</h2>
        <ol className="how">
          <li>
            <strong>Seniors prove.</strong> Your offer becomes a nullifier — one offer, one
            count — with your exact salary hidden inside a zero-knowledge proof.
          </li>
          <li>
            <strong>The chain counts.</strong> Only public brackets move. Nobody — not the
            college, not the platform — can edit a nullifier or invent an entry.
          </li>
          <li>
            <strong>Everyone verifies.</strong> Juniors read real numbers, seniors flex a
            verified badge, colleges market stats nobody can dispute.
          </li>
        </ol>
      </section>

      <section className="trio" aria-label="Why it spreads">
        <div className="card trio-card">
          <span className="trio-num">01</span>
          <h3>Seniors get status</h3>
          <p className="muted">
            A verified credential with weight on campus — proof of bracket, zero salary
            leaked. Bragging rights, cryptographically backed.
          </p>
          <button type="button" className="ghost small" onClick={() => onGo('prove')}>
            Get your badge →
          </button>
        </div>
        <div className="card trio-card">
          <span className="trio-num">02</span>
          <h3>Juniors get truth</h3>
          <p className="muted">
            Real medians and bracket counts before choosing a college — every number
            traces back to a proof you can audit yourself.
          </p>
          <button type="button" className="ghost small" onClick={() => onGo('trust')}>
            Audit the proofs →
          </button>
        </div>
        <div className="card trio-card">
          <span className="trio-num">03</span>
          <h3>Colleges get belief</h3>
          <p className="muted">
            Credible placement data is the #1 admission pitch. “Stats nobody can inflate”
            as a subscription — not a brochure.
          </p>
          <button type="button" className="ghost small" onClick={() => onGo('colleges')}>
            Run the pilot →
          </button>
        </div>
      </section>

      <section className="card" aria-label="Beyond placements">
        <h2>One pattern, every credential</h2>
        <p className="muted">
          The same nullifier-bracket machine stretches to internships, hackathon wins —
          any countable credential where the truth is private but the total must be honest.
        </p>
        <div className="cred-row">
          <span className="pill">Placements · now</span>
          <span className="pill">Internships · next</span>
          <span className="pill">Hackathons · next</span>
        </div>
      </section>
    </>
  );
}
