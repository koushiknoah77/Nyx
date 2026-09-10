import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PhoneMock } from '../site/PhoneMock';
import { useOfferStatsPublic } from '../../hooks/useOfferStatsPublic';
import { BRACKET_META, medianBracket, percentPlaced } from '../../midnight/offerstats';
import { prefersReducedMotion } from '../../lib/smooth';
import type { SiteView } from '../site/Navbar';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  onGo: (v: SiteView) => void;
}

/**
 * Landing: hero timeline, scroll reveals, live ticker with count-up,
 * phone parallax — all transform/opacity only, all gated on reduced motion.
 */
export function HomePage({ onGo }: Props) {
  const { deployed, view } = useOfferStatsPublic();
  const pct = view ? percentPlaced(view.total, view.batchSize) : null;
  const median = view ? medianBracket(view.counts) : null;
  const scope = useRef<HTMLElement>(null);

  const live = deployed && view;
  const totalNum = live && view ? Number(view.total) : 0;
  const nfNum = live && view ? view.nullifiersUsed : 0;
  const pctNum = live && pct ? Number.parseFloat(pct) : 0;

  useGSAP(
    () => {
      if (prefersReducedMotion() || !scope.current) return;

      // Hero entrance: kicker → headline → lede → CTAs → phone.
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hx', { y: 28, opacity: 0, duration: 0.7, stagger: 0.09 })
        .from('.hphone', { y: 40, opacity: 0, duration: 0.8 }, '-=0.45');

      // Phone drifts against scroll (parallax). Badges keep their CSS float —
      // different elements, no transform fights.
      gsap.to('.hphone', {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: { trigger: '.hphone', start: 'top 85%', end: 'bottom 20%', scrub: true },
      });

      // Ticker cells rise in a batch; live numerals count up once.
      gsap.from('.tcell', {
        y: 22,
        opacity: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.ticker', start: 'top 88%' },
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
            scrollTrigger: { trigger: el, start: 'top 90%' },
            onUpdate: () => {
              el.textContent = `${obj.v.toFixed(decimals)}${suffix}`;
            },
          });
        }
      }

      // Lower sections reveal on scroll.
      gsap.utils.toArray<HTMLElement>('.sreveal').forEach((el) => {
        gsap.from(el, {
          y: 26,
          opacity: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
    },
    { scope, dependencies: [deployed, view?.total?.toString() ?? '', view?.nullifiersUsed ?? 0] },
  );

  return (
    <span ref={scope as never} style={{ display: 'contents' }}>
      <section className="hero-block">
        <div className="hero-grid">
          <div>
            <p className="kicker hx">Private proof · Public truth</p>
            <h1 className="mega hx">
              Real Placement Stats. <em>No Guesswork.</em>
            </h1>
            <p className="lede hx">
              Students verify their offers privately. Colleges publish credible
              placement data. Finally, numbers you can trust.
            </p>
            <div className="cta-row hx">
              <button type="button" onClick={() => onGo('students')}>
                Verify Your Offer
              </button>
              <button type="button" className="ghost" onClick={() => onGo('stats')}>
                Explore Stats
              </button>
            </div>
          </div>
          <div className="hphone">
            <PhoneMock variant="home" />
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="Live chain figures">
        <div className="ticker-cell tcell">
          <div
            className={`ticker-num tcount${live ? ' ok' : ''}`}
            data-count={totalNum}
            data-decimals={0}
          >
            {live ? view.total.toString() : '—'}
          </div>
          <div className="ticker-label">Verified offers</div>
        </div>
        <div className="ticker-cell tcell">
          <div className="ticker-num tcount" data-count={nfNum} data-decimals={0} data-suffix="/32">
            {live ? `${nfNum}/32` : '—/32'}
          </div>
          <div className="ticker-label">Nullifiers stored</div>
        </div>
        <div className="ticker-cell tcell">
          <div className="ticker-num tcount" data-count={pctNum} data-decimals={1} data-suffix="%">
            {live && pct ? `${pct}%` : '—'}
          </div>
          <div className="ticker-label">Placement rate</div>
        </div>
        <div className="ticker-cell tcell">
          <div className="ticker-num">{live && median != null ? BRACKET_META[median].short : '—'}</div>
          <div className="ticker-label">Median bracket</div>
        </div>
      </section>

      <section className="card tint pilot-strip sreveal" aria-label="Pilot invite">
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

      <section className="section section-center sreveal">
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
    </span>
  );
}
