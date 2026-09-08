import type { MidnightStatus } from '../hooks/useMidnight';

interface Props {
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onClearError: () => void;
}

/** Lace connect / disconnect UI with explicit connected + disconnected states. */
export function WalletConnect({ status, onConnect, onDisconnect, onClearError }: Props) {
  const connecting = status.kind === 'connecting';

  return (
    <section className="card">
      <div className="row">
        <h2>Wallet</h2>
        <span className={`pill ${status.kind === 'connected' ? 'on' : 'off'}`}>
          {status.kind === 'connected' ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {status.kind === 'connected' ? (
        <>
          <p className="label">Connected through {status.walletName} (Preprod)</p>
          <p className="addr" title={status.unshieldedAddress}>
            {status.unshieldedAddress}
          </p>
          <button onClick={onDisconnect}>Disconnect Wallet</button>
        </>
      ) : (
        <>
          <p className="muted">Connect Lace to prove and transact on Preprod.</p>
          <button onClick={onConnect} disabled={connecting}>
            {connecting ? 'Waiting for wallet…' : 'Connect Wallet'}
          </button>
        </>
      )}

      {status.kind === 'error' && (
        <div className="error">
          <p>{status.message}</p>
          <button className="ghost" onClick={onClearError}>
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}
