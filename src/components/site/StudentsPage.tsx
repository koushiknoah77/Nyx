import { useState } from 'react';
import { OfferStatsTransact } from '../OfferStatsTransact';
import { VerifiedBadge, type BadgeData } from '../offerstats/VerifiedBadge';
import { WalletConnect } from '../WalletConnect';
import { PhoneMock } from '../site/PhoneMock';
import type { MidnightStatus } from '../../hooks/useMidnight';
import type { OfferStatsPublicState } from '../../hooks/useOfferStatsPublic';
import type { BracketIndex } from '../../midnight/offerstats';

interface Props {
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onClearError: () => void;
  offerStats: OfferStatsPublicState;
}

const BENEFITS = [
  'Keep your salary private',
  'Get a verified badge',
  'Build credibility on campus',
  'Help juniors get real data',
];

/** For Students: the pitch, the badge promise, and the real prove flow. */
export function StudentsPage({ status, onConnect, onDisconnect, onClearError, offerStats }: Props) {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const connected = status.kind === 'connected';
  const connectedApi = status.kind === 'connected' ? status : null;

  const scrollToProve = () => {
    document.getElementById('prove')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRecorded = (txId: string, bracket: BracketIndex) => {
    const latest =
      offerStats.view && offerStats.view.nullifiers.length > 0
        ? offerStats.view.nullifiers[offerStats.view.nullifiers.length - 1]
        : 'syncing from indexer…';
    setBadge({
      bracket,
      batchLabel: `Batch of ${offerStats.view?.batchSize.toString() ?? '…'}`,
      nullifierHex: latest,
      txId,
    });
  };

  return (
    <>
      <section className="hero-block">
        <div className="hero-grid">
          <div>
            <p className="kicker">For Students</p>
            <h1 className="mega">
              Verify. Flex. <em>Make an impact.</em>
            </h1>
            <p className="lede">
              Prove your offer, get a verified badge, and contribute to honest
              placement statistics — without revealing your salary.
            </p>
            <ul style={{ listStyle: 'none', margin: '1.2rem 0 0', padding: 0, display: 'grid', gap: '0.55rem' }}>
              {BENEFITS.map((b) => (
                <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', fontWeight: 600 }}>
                  <span className="checkdot" style={{ width: '1.4rem', height: '1.4rem', fontSize: '0.8rem' }}>✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="cta-row">
              <button type="button" onClick={scrollToProve}>
                Verify Your Offer
              </button>
            </div>
          </div>
          <PhoneMock variant="students" />
        </div>
      </section>

      <section className="section">
        <h2 className="mega" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>More than a badge</h2>
        <p className="lede">Your verification helps create a fairer, more transparent ecosystem for every student.</p>
        <div className="trio">
          <div className="card trio-card">
            <span className="trio-num">R</span>
            <h3>Recognition</h3>
            <p className="muted">Showcase your achievement with a verified badge.</p>
          </div>
          <div className="card trio-card">
            <span className="trio-num">C</span>
            <h3>Contribution</h3>
            <p className="muted">Help juniors make informed decisions.</p>
          </div>
          <div className="card trio-card">
            <span className="trio-num">C</span>
            <h3>Community</h3>
            <p className="muted">Be part of a movement for honest data.</p>
          </div>
        </div>
      </section>

      <section className="section" id="prove" aria-label="Prove your offer">
        <p className="kicker">Prove your offer</p>
        <h2 className="mega" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)' }}>Counted in one proof.</h2>

        {badge && <VerifiedBadge badge={badge} />}

        <WalletConnect
          status={status}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onClearError={onClearError}
        />

        {offerStats.deployed ? (
          connectedApi ? (
            <OfferStatsTransact
              api={connectedApi.api}
              unshieldedAddress={connectedApi.unshieldedAddress}
              view={offerStats.view}
              onChanged={offerStats.refresh}
              onRecorded={handleRecorded}
            />
          ) : (
            <section className="card" aria-label="Connect to prove">
              <h2>Connect to prove</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                Connect Lace on Preprod above. The proof generates locally in your
                wallet — one approval, then your badge.
              </p>
            </section>
          )
        ) : (
          <section className="card" aria-label="Pilot not live">
            <div className="row">
              <h2>Proving opens with the pilot</h2>
              <span className="pill">Not deployed yet</span>
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>
              The first batch goes live with one placed class — phones in a classroom,
              gasless, no seed phrases. This screen becomes the prove button the day it opens.
            </p>
          </section>
        )}

        {!connected && offerStats.deployed && (
          <p className="muted tiny" style={{ textAlign: 'center' }}>
            Viewing the board needs no wallet — only proving does.
          </p>
        )}
      </section>
    </>
  );
}
