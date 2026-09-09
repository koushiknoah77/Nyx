import { useState } from 'react';
import { OfferStatsTransact } from '../OfferStatsTransact';
import { VerifiedBadge, type BadgeData } from './VerifiedBadge';
import { WalletConnect } from '../WalletConnect';
import type { MidnightStatus } from '../../hooks/useMidnight';
import type { OfferStatsPublicState } from '../../hooks/useOfferStatsPublic';

interface Props {
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onClearError: () => void;
  connected: boolean;
  offerStats: OfferStatsPublicState;
}

/** Seniors flex: prove once, screenshot the badge, run the campus. */
export function ProveView({
  status,
  onConnect,
  onDisconnect,
  onClearError,
  connected,
  offerStats,
}: Props) {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const connectedApi = status.kind === 'connected' ? status : null;

  const handleRecorded = (txId: string, bracket: 0 | 1 | 2 | 3) => {
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
      <section className="card" aria-label="Why prove">
        <h2>Your offer is proof. Flex it.</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          One proof counts your offer toward stats nobody can cook — and mints you a
          verified badge for it. Your exact salary stays in this browser; only your
          bracket goes public.
        </p>
      </section>

      {badge && (
        <section aria-label="Your verified badge">
          <VerifiedBadge badge={badge} />
        </section>
      )}

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
              Connect Lace on Preprod above. The proof generates locally in your wallet —
              you'll approve one transaction, then screenshot your badge.
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
    </>
  );
}
