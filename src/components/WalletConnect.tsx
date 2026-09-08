import type { MidnightStatus } from '../hooks/useMidnight';
import { CopyButton } from './CopyButton';

interface Props {
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onClearError: () => void;
}

/** Step 1 — Lace connect / disconnect with explicit wallet states. */
export function WalletConnect({ status, onConnect, onDisconnect, onClearError }: Props) {
  const connecting = status.kind === 'connecting';
  const connected = status.kind === 'connected';

  return (
    <section className="card" aria-label="Wallet connection">
      <div className="row">
        <h2>1 · Wallet</h2>
        <span className={`pill ${connected ? 'on' : 'off'}`}>
          {connected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      {connected ? (
        <>
          <p className="label">Connected through {status.walletName} · Preprod</p>
          <p className="addr" title={status.unshieldedAddress}>
            {status.unshieldedAddress}
          </p>
          <div className="row" style={{ marginTop: '0.7rem' }}>
            <button className="ghost" onClick={onDisconnect}>
              Disconnect Wallet
            </button>
            <CopyButton text={status.unshieldedAddress} label="Copy address" />
          </div>
        </>
      ) : (
        <>
          <p className="muted">
            Connect Lace to prove and transact on Preprod. Your secret is created in this
            browser — the wallet only submits proofs.
          </p>
          <button onClick={onConnect} disabled={connecting}>
            {connecting ? 'Waiting for wallet…' : 'Connect Wallet'}
          </button>
        </>
      )}

      {status.kind === 'error' && (
        <div className="error" role="alert">
          <p style={{ margin: 0 }}>{status.message}</p>
          <button className="ghost small" style={{ marginTop: '0.6rem' }} onClick={onClearError}>
            Dismiss
          </button>
        </div>
      )}
    </section>
  );
}
