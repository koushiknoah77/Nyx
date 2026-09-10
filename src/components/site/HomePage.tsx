import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useOfferStatsPublic } from '../../hooks/useOfferStatsPublic';
import { BRACKET_META, medianBracket, percentPlaced } from '../../midnight/offerstats';
import { prefersReducedMotion } from '../../lib/smooth';
import type { NavTarget } from '../site/Navbar';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onGo: (v: NavTarget['view'], anchor?: string) => void;
}

const SOLUTION_STEPS = [
  {
    n: '1',
    title: 'Enter Privately',
    body: 'Add your exact CTC and offer details in your browser. It never leaves your device.',
  },
  {
    n: '2',
    title: 'Generate Proof',
    body: 'A zero-knowledge proof verifies your offer falls in a CTC bracket and hasn\u2019t been counted before.',
  },
  {
    n: '3',
    title: 'Submit to Midnight',
    body: 'Your proof and a unique nullifier are committed on-chain. No salary, no company, no identity.',
  },
  {
    n: '4',
    title: 'See the Impact',
    body: 'Anonymous counts update instantly. Juniors, colleges, and anyone can verify the numbers.',
  },
];

const BEYOND = [
  { glyph: '◧', title: 'Internships' },
  { glyph: '◈', title: 'Hackathon Wins' },
  { glyph: '▤', title: 'Certifications' },
  { glyph: '◍', title: 'Scholarships' },
];

/**
 * Landing, section-for-section: hero, pilot invite, problem, solution,
 * live audit board, beyond placements, stakeholders, movement CTA.
 * Every figure is live chain data or an honest pending state — no mocks.
 */
export function HomePage({ onGo }: Props) {
  const { deployed, view, loading, error, refresh } = useOfferStatsPublic();
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = view ? medianBracket(view.counts) : null;
  const scope = useRef<HTMLElement>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const live = deployed && view;
  const counts = view?.counts ?? [0n, 0n, 0n, 0n, 0n];
  const max = counts.reduce((a, b) => (a > b ? a : b), 1n);
  const totalNum = live && view ? Number(view.total) : 0;
  const pctNum = live && pct ? Number.parseFloat(pct) : 0;

  useEffect(() => {
    if (view) setUpdatedAt(new Date());
  }, [view]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return;

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hx', { y: 28, opacity: 0, duration: 0.7, stagger: 0.09 })
        .from('.hphone', { y: 40, opacity: 0, duration: 0.8 }, '-=0.45');

      gsap.to('.hphone', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: '.hphone', start: 'top 85%', end: 'bottom 20%', scrub: true },
      });

      gsap.utils.toArray<HTMLElement>('.sreveal').forEach((el) => {
        gsap.from(el, {
          y: 26,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });

      if (live) {
        for (const el of gsap.utils.toArray<HTMLElement>('.tcount')) {
          const target = Number(el.dataset.count ?? '0');
          const decimals = Number(el.dataset.decimals ?? '0');
          const suffix = el.dataset.suffix ?? '';
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 92%' },
            onUpdate: () => {
              el.textContent = `${obj.v.toFixed(decimals)}${suffix}`;
            },
          });
        }
      }
    },
    { scope, dependencies: [deployed, view?.total?.toString() ?? '', view?.nullifiersUsed ?? 0] },
  );

  return (
    <span ref={scope as never} style={{ display: 'contents' }}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-block">
        <div className="hero-grid">
          <div>
            <p className="pill hx">◍ Built on Midnight</p>
            <h1 className="mega hx" style={{ marginTop: '1rem' }}>
              Real placements. <em>Verifiable.</em> Private.
            </h1>
            <p className="lede hx">
              OfferStats lets students prove their offer falls in a CTC bracket
              without revealing their salary, company, or identity — and publishes
              only anonymous, on-chain aggregates anyone can verify.
            </p>
            <div className="cta-row hx">
              <button type="button" onClick={() => onGo('stats')}>
                View Live Stats →
              </button>
              <button type="button" className="ghost" onClick={() => onGo('students')}>
                Prove Your Offer
              </button>
            </div>
            <div className="trust-row hx" aria-label="Assurances">
              <span><span className="trust-dot">◈</span> Zero-knowledge proofs</span>
              <span><span className="trust-dot">⬡</span> On-chain verification</span>
              <span><span className="trust-dot">◍</span> Your data stays private</span>
            </div>
          </div>
          <div className="hphone" aria-hidden>
            <div className="claim-stack">
              <div className="claim-card back">
                <p className="claim-big">Your Offer.</p>
                <p className="claim-mid">Your Privacy.</p>
                <p className="claim-big">Real Impact.</p>
              </div>
              <div className="claim-card" style={{ transform: 'rotate(-2deg)' }}>
                <span className="checkdot" style={{ margin: '0 auto' }}>✓</span>
                <p style={{ fontWeight: 800, margin: '0.6rem 0 0.2rem' }}>Verified</p>
                <p className="muted tiny" style={{ margin: 0 }}>Offer counted<br />CTC: Private</p>
              </div>
            </div>
            <p className="script" style={{ textAlign: 'center', marginTop: '1rem' }}>
              Private proof.<br />Public truth.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pilot invite (honest: no fake institution logos) ── */}
      <section className="card tint pilot-strip sreveal" aria-label="Pilot invite">
        <div>
          <p className="eyebrow" style={{ marginBottom: '0.3rem' }}>Launching with one batch</p>
          <h2 style={{ fontSize: '1.15rem' }}>Your college could be first.</h2>
          <p className="muted" style={{ margin: '0.3rem 0 0' }}>
            One graduating class proves. Everyone else verifies.
          </p>
        </div>
        <button type="button" onClick={() => onGo('join')}>
          Join the pilot
        </button>
      </section>

      {/* ── Problem ──────────────────────────────────────── */}
      <section className="section sreveal">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 className="mega" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
              Impressive numbers. No way to verify them.
            </h2>
            <p className="lede">
              Every admission season, colleges publish placement stats nobody can
              verify. The raw evidence is private — so the lie survives because
              the truth can&apos;t be shown.
            </p>
          </div>
          <div className="claim-stack" aria-label="Illustrative unverified brochure claim">
            <div className="claim-card back" aria-hidden>
              <p className="claim-big">100%</p>
              <p className="claim-cap">Placed</p>
            </div>
            <div className="claim-card">
              <p className="claim-big">100%</p>
              <p className="claim-cap">Placed</p>
              <p className="claim-mid">₹24 LPA</p>
              <p className="claim-cap">Median · claimed, not proven</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solution ─────────────────────────────────────── */}
      <section className="section section-center sreveal">
        <p className="eyebrow" style={{ textAlign: 'center' }}>The solution</p>
        <h2 className="mega" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
          Private proof. Public truth.
        </h2>
        <p className="lede" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          A simple flow. Zero compromise.
        </p>
        <div className="steps4" style={{ textAlign: 'left' }}>
          {SOLUTION_STEPS.map((s) => (
            <div key={s.n} className="step4">
              <span className="n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live audit board ─────────────────────────────── */}
      <section className="section sreveal" id="audit" aria-label="Live placement statistics">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">
              <span style={{ color: 'var(--verified)' }}>●</span> Live on-chain
            </p>
            <h2 className="mega" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
              Placement Stats You Can Trust
            </h2>
            <p className="lede">
              Real-time, verifiable, and completely anonymous.
            </p>
            <div className="cta-row">
              <button type="button" className="navy" onClick={() => onGo('stats')}>
                View Live Stats →
              </button>
            </div>
          </div>
          <div className="card" style={{ marginTop: 0 }} aria-label="Verified board preview">
            <div className="scope-row" style={{ marginTop: 0 }}>
              <span className="pill pre">Pilot Batch</span>
              <span className="pill">Preprod</span>
            </div>
            <div className="report" style={{ marginTop: '1rem' }}>
              <div className="report-cell">
                <div
                  className="report-num tcount"
                  data-count={totalNum}
                  data-decimals={0}
                >
                  {live ? view.total.toString() : '—'}
                </div>
                <div className="report-label">Verified Offers</div>
              </div>
              <div className="report-cell">
                <div
                  className="report-num tcount"
                  data-count={pctNum}
                  data-decimals={1}
                  data-suffix="%"
                >
                  {live && pct ? `${pct}%` : '—'}
                </div>
                <div className="report-label">Verified Placement</div>
              </div>
              <div className="report-cell">
                <div className="report-num" style={{ fontSize: '1.2rem' }}>
                  {live && median != null ? BRACKET_META[median].short : '—'}
                </div>
                <div className="report-label">Median CTC Bracket</div>
              </div>
            </div>
            <ul className="bars" aria-label="Live bracket counts">
              {BRACKET_META.map((b, i) => {
                const c = counts[i];
                const width = `${live ? (Number(c) / Number(max === 0n ? 1n : max)) * 100 : 4}%`;
                return (
                  <li key={b.short} className="bar-row">
                    <span className="bar-label">{b.short}</span>
                    <span className="bar-track"><span className="bar-fill" style={{ width }} /></span>
                    <span className="bar-count">{live ? c.toString() : '—'}</span>
                  </li>
                );
              })}
            </ul>
            <div className="row" style={{ marginTop: '0.9rem' }}>
              <span className="muted tiny">
                {loading && !view
                  ? 'Reading Preprod…'
                  : updatedAt
                    ? `Updated ${updatedAt.toLocaleTimeString()}`
                    : 'Awaiting pilot batch'}
              </span>
              <span className="muted tiny">
                {live ? `${view.nullifiersUsed} unique credentials · 0 duplicates` : 'No counts yet — guesses are what we kill'}
              </span>
            </div>
            {error && !view && (
              <div className="error" role="alert">
                <p style={{ margin: 0 }}>{error}</p>
                <button type="button" className="ghost small" style={{ marginTop: '0.6rem' }} onClick={refresh}>
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Beyond placements ────────────────────────────── */}
      <section className="section sreveal">
        <p className="eyebrow">Beyond placements</p>
        <h2 className="mega" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)' }}>
          A general solution for private credentials.
        </h2>
        <p className="lede">
          The same architecture works for any countable credential where the
          truth is private but the total must be honest.
        </p>
        <div className="minis">
          {BEYOND.map((b) => (
            <div key={b.title} className="card mini">
              <span className="mini-ico" aria-hidden>{b.glyph}</span>
              <h3>{b.title}</h3>
              <span className="pill">Next</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stakeholders ─────────────────────────────────── */}
      <section className="section sreveal">
        <p className="eyebrow">Built for every stakeholder</p>
        <div className="trio">
          <div className="card trio-card">
            <span className="trio-num">S</span>
            <h3>For Students</h3>
            <ul className="how">
              <li>→ Prove your offer, keep it private</li>
              <li>→ Get a verified badge</li>
              <li>→ Flex what matters</li>
            </ul>
            <button type="button" className="ghost small" onClick={() => onGo('students')}>
              Prove Your Offer →
            </button>
          </div>
          <div className="card trio-card">
            <span className="trio-num">J</span>
            <h3>For Juniors</h3>
            <ul className="how">
              <li>→ See real, verifiable numbers</li>
              <li>→ Make informed decisions</li>
              <li>→ No more unverifiable claims</li>
            </ul>
            <button type="button" className="ghost small" onClick={() => onGo('stats')}>
              View Live Stats →
            </button>
          </div>
          <div className="card trio-card">
            <span className="trio-num">C</span>
            <h3>For Colleges</h3>
            <ul className="how">
              <li>→ A placement record that proves itself</li>
              <li>→ Build trust with applicants</li>
              <li>→ Access dashboards and reports</li>
            </ul>
            <button type="button" className="ghost small" onClick={() => onGo('colleges')}>
              Partner With Us →
            </button>
          </div>
        </div>
      </section>

      {/* ── Movement CTA ─────────────────────────────────── */}
      <section className="card brand-panel sreveal" aria-label="Join the movement">
        <div className="hero-grid">
          <div>
            <p className="kicker" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              Join the movement
            </p>
            <h2>A more transparent future for higher education.</h2>
            <p className="muted">Be part of the first verifiable placement network.</p>
            <div className="cta-row">
              <button
                type="button"
                onClick={() => onGo('stats')}
                style={{ background: '#fff', color: 'var(--primary)', borderColor: '#fff', boxShadow: 'none' }}
              >
                View Live Stats →
              </button>
              <button
                type="button"
                onClick={() => onGo('join')}
                style={{ background: 'transparent', color: '#fff', borderColor: '#fff', boxShadow: 'none' }}
              >
                Get Early Access
              </button>
            </div>
          </div>
          <p className="script" style={{ color: '#fff', fontSize: '2.2rem', textAlign: 'center' }}>
            Private proof.<br />Public truth.
          </p>
        </div>
      </section>
    </span>
  );
}
