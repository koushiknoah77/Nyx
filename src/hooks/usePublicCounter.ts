import { useCallback, useEffect, useRef, useState } from 'react';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FALLBACK_INDEXER, FALLBACK_INDEXER_WS } from '../config';
import { readCounterState, type CounterView } from '../midnight/providers';

export interface PublicCounterState {
  view: CounterView | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const POLL_MS = 15000;

/**
 * Read-only Preprod counter state — no wallet required.
 * Fixes the "empty demo" impression: judges and visitors without Lace
 * still see the live on-chain total, initialized flag, and owner commitment.
 * Wallet-gated proving stays in CircuitCall; this hook never touches secrets.
 */
export function usePublicCounter(): PublicCounterState {
  const [view, setView] = useState<CounterView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const publicDataProvider = indexerPublicDataProvider(
          FALLBACK_INDEXER,
          FALLBACK_INDEXER_WS,
        );
        const v = await readCounterState(
          publicDataProvider as Parameters<typeof readCounterState>[0],
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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    const cleanup = refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      mounted.current = false;
      cleanup?.();
      window.clearInterval(timer);
    };
  }, [refresh]);

  return { view, loading, error, refresh };
}
