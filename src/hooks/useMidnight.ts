import { useCallback, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api';
import { NETWORK_ID } from '../config';
import { selectWallet } from '../midnight/wallet';

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

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/no midnight wallet/i.test(msg)) {
    return 'Lace wallet not installed. Install it from the Chrome Web Store, then refresh this page.';
  }
  if (/user rejected|rejected|denied|cancelled/i.test(msg)) {
    return 'Connection rejected in the wallet. Click Connect and approve to continue.';
  }
  return `Connection failed: ${msg}`;
}

/** Connection state machine for the Lace wallet (Preprod). */
export function useMidnight() {
  const [status, setStatus] = useState<MidnightStatus>({ kind: 'disconnected' });

  const connect = useCallback(async () => {
    setStatus({ kind: 'connecting' });
    try {
      const initial = selectWallet();
      const api = await initial.connect(NETWORK_ID);
      const { unshieldedAddress } = await api.getUnshieldedAddress();
      const conn = await api.getConnectionStatus();
      if (conn.status !== 'connected') {
        setStatus({ kind: 'error', message: 'Wallet did not confirm the connection. Try again.' });
        return;
      }
      if (conn.networkId !== NETWORK_ID) {
        setStatus({
          kind: 'error',
          message: `Wallet is on '${conn.networkId}'. Switch Lace to Preprod and reconnect.`,
        });
        return;
      }
      setStatus({
        kind: 'connected',
        api,
        walletName: initial.name,
        unshieldedAddress,
      });
    } catch (err) {
      setStatus({ kind: 'error', message: friendlyError(err) });
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
