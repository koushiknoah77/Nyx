import type { SiteView } from '../site/Navbar';

interface Props {
  onGo: (v: SiteView) => void;
}

/** About: mission, vision, values, community banner. */
export function AboutPage({ onGo }: Props) {
  return (
    <>
      <section className="hero-block section-center">
        <p className="kicker">About OfferStats</p>
        <h1 className="mega">
          Building a fairer, <em>more transparent</em> future
        </h1>
        <p className="lede" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          OfferStats exists to bring trust and transparency to placement statistics
          while protecting every student&apos;s privacy. We believe credible data
          empowers better decisions for students, colleges, and the entire
          education ecosystem.
        </p>
      </section>

      <section className="trio" aria-label="Mission vision values">
        <div className="card trio-card">
          <span className="trio-num">M</span>
          <h3>Our Mission</h3>
          <p className="muted">
            Truth in placement statistics, without compromising privacy.
          </p>
        </div>
        <div className="card trio-card">
          <span className="trio-num">V</span>
          <h3>Our Vision</h3>
          <p className="muted">
            A world where every student can trust the numbers.
          </p>
        </div>
        <div className="card trio-card">
          <span className="trio-num">V</span>
          <h3>Our Values</h3>
          <p className="muted">
            Privacy first. Transparency always. Students at the center.
          </p>
        </div>
      </section>

      <section className="card brand-panel" aria-label="Community">
        <h2>Backed by a community that believes in better data.</h2>
        <p className="muted">
          Seniors prove. Juniors verify. Colleges publish what they can defend.
        </p>
        <div className="cta-row">
          <button
            type="button"
            onClick={() => onGo('join')}
            style={{ background: '#fff', color: 'var(--primary)', borderColor: '#fff', boxShadow: 'none' }}
          >
            Get Started
          </button>
        </div>
      </section>
    </>
  );
}
