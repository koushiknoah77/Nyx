import { OfferStatsDashboard } from '../OfferStatsDashboard';
import type { OfferStatsPublicState } from '../../hooks/useOfferStatsPublic';

/** Juniors verify: the public board plus how to read it. */
export function StatsView({ offerStats }: { offerStats: OfferStatsPublicState }) {
  return (
    <>
      <OfferStatsDashboard
        deployed={offerStats.deployed}
        view={offerStats.view}
        loading={offerStats.loading}
        error={offerStats.error}
        onRefresh={offerStats.refresh}
      />
      <section className="card" aria-label="How to read this board">
        <h2>How to read this board</h2>
        <ul className="how muted">
          <li>
            <strong>% placed</strong> = verified offers ÷ batch size. The batch size is
            published by the placement cell at setup — the denominator can't move either.
          </li>
          <li>
            <strong>Median bracket</strong> is derived off-chain from the public counts.
            No hidden inputs, anyone can recompute it.
          </li>
          <li>
            <strong>Every count links to a nullifier.</strong> Open the Trust page and
            match any offer to its on-chain commitment — no names attached, by design.
          </li>
        </ul>
      </section>
    </>
  );
}
