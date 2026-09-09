import { useCallback, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api';
import { connectNetworkProvider } from '../midnight/network-provider';

export type MidnightStatus =
  | { kind: 'disconnected' }
  | { kind: 'connecting' }
  | {
      kind: 'connected';
      api: ConnectedAPI;
      walletName: string;
      unshieldedAddress: string;
    }
  | { kind: 'error'; message: string };

/** Connection state machine for the Lace wallet (Preprod). */
export function useMidnight() {
  const [status, setStatus] = useState<MidnightStatus>({ kind: 'disconnected' });

  const connect = useCallback(async () => {
    setStatus({ kind: 'connecting' });
    try {
      // Single connect path lives in the network provider module.
      const conn = await connectNetworkProvider();
      setStatus({ kind: 'connected', ...conn });
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    // The connector has no remote disconnect; clearing local state is the
    // defined disconnect behavior (matches the official React guide).
    setStatus({ kind: 'disconnected' });
  }, []);

  const clearError = useCallback(() => {
    setStatus((s) => (s.kind === 'error' ? { kind: 'disconnected' } : s));
  }, []);

  return { status, connect, disconnect, clearError };
}
