import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isOfferStatsDeployed,
  readOfferStatsState,
  readOnlyOfferStatsProvider,
  type OfferStatsView,
} from '../midnight/offerstats';

export interface OfferStatsPublicState {
  deployed: boolean;
  view: OfferStatsView | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const POLL_MS = 15000;

/**
 * Public OfferStats dashboard state — no wallet required.
 * Before the contract is deployed (address unset in config) this reports
 * `deployed: false` so the tab renders an honest "not deployed yet" card
 * instead of a blank or broken view.
 */
export function useOfferStatsPublic(): OfferStatsPublicState {
  const [view, setView] = useState<OfferStatsView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const deployed = isOfferStatsDeployed();

  const refresh = useCallback(() => {
    if (!isOfferStatsDeployed()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const provider = readOnlyOfferStatsProvider();
        const v = await readOfferStatsState(
          provider as Parameters<typeof readOfferStatsState>[0],
        );
        if (cancelled || !mounted.current) return;
        if (v) {
          setView(v);
        } else {
          setError('Could not reach the Preprod indexer yet. Try Refresh.');
        }
      } catch (err) {
        if (cancelled || !mounted.current) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled && mounted.current) setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    if (!isOfferStatsDeployed()) return () => void (mounted.current = false);
    const timer = window.setInterval(() => refresh(), POLL_MS);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
    };
  }, [refresh]);

  return { deployed, view, loading, error, refresh };
}
