import type { SiteView } from '../site/Navbar';

interface Props {
  onGo: (v: SiteView) => void;
}

/** About: thesis, numbered principles, community banner. */
export function AboutPage({ onGo }: Props) {
  return (
    <>
      <section className="hero-block">
        <p className="kicker">About OfferStats</p>
        <h1 className="mega">
          Building a fairer, <em>more transparent</em> future
        </h1>
        <p className="lede">
          OfferStats exists to bring trust and transparency to placement statistics
          while protecting every student&apos;s privacy. Credible data empowers
          better decisions for students, colleges, and the entire education ecosystem.
        </p>
      </section>

      <div className="geo-band" aria-hidden />

      <section className="section" aria-label="Principles">
        <ol className="how numbered">
          <li>
            <span className="stepnum">01</span>
            <div>
              <strong>Our Mission — truth without exposure.</strong>
              <br />
              Placement statistics the world can check, built from evidence no one
              has to reveal. Every number traces to a proof; no proof names a name.
            </div>
          </li>
          <li>
            <span className="stepnum">02</span>
            <div>
              <strong>Our Vision — trust as infrastructure.</strong>
              <br />
              A world where every student can trust the numbers — where
              &ldquo;verified on-chain&rdquo; sits next to every claim a college markets.
            </div>
          </li>
          <li>
            <span className="stepnum">03</span>
            <div>
              <strong>Our Values — privacy first, transparency always.</strong>
              <br />
              Students at the center: salaries never touch the chain, the dashboard,
              or any office. The product can&apos;t leak what it never holds.
            </div>
          </li>
        </ol>
      </section>

      <section className="card brand-panel" aria-label="Community">
        <p className="kicker">Community</p>
        <h2>Backed by a community that believes in better data.</h2>
        <p className="muted">
          Seniors prove. Juniors verify. Colleges publish what they can defend.
        </p>
        <div className="cta-row">
          <button type="button" onClick={() => onGo('join')}>
            Get Started
          </button>
        </div>
      </section>
    </>
  );
}
