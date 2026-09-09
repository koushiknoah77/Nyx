import { useCallback, useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { PublicCounter } from './components/PublicCounter';
import { Steps } from './components/Steps';
import { CopyButton } from './components/CopyButton';
import { useMidnight } from './hooks/useMidnight';
import { usePublicCounter } from './hooks/usePublicCounter';
import { EXPLORER_URL, PREPROD_CONTRACT_ADDRESS } from './config';
import './index.css';

export default function App() {
  const { status, connect, disconnect, clearError } = useMidnight();
  const publicState = usePublicCounter();
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const connected = status.kind === 'connected';

  const handleDisconnect = useCallback(() => {
    disconnect();
    setInitialized(null);
  }, [disconnect]);

  return (
    <div className="page">
      <header className="hero">
        <span className="hero-eyebrow">
          <span className="dot" aria-hidden /> Midnight · Preprod
        </span>
        <h1>Nyx</h1>
        <p className="tag">A private counter. Public totals, secret owners, honest numbers.</p>
        <div className="hero-pills">
          <span className="pill pre">Preprod</span>
          <span className="pill">Compact 0.31.1</span>
          <span className="pill">React + Lace</span>
        </div>
        <div className="contractbar">
          <span className="k">Contract</span>
          <code title={PREPROD_CONTRACT_ADDRESS}>{PREPROD_CONTRACT_ADDRESS}</code>
          <span className="actions">
            <CopyButton text={PREPROD_CONTRACT_ADDRESS} label="Copy" />
            <a className="linkbtn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
              Explorer ↗
            </a>
          </span>
        </div>
      </header>

      <main>
        {/* Journey follows the wallet's on-chain view once connected,
            otherwise the public read-only state — never blank. */}
        <Steps
          connected={connected}
          initialized={connected ? initialized : (publicState.view?.initialized ?? null)}
        />

        {/* Live Preprod total is always visible, even with no wallet.
            This is the fix for the "empty demo" judge feedback. */}
        {!connected && (
          <PublicCounter
            view={publicState.view}
            loading={publicState.loading}
            error={publicState.error}
            onRefresh={publicState.refresh}
          />
        )}

        <WalletConnect
          status={status}
          onConnect={() => void connect()}
          onDisconnect={handleDisconnect}
          onClearError={clearError}
        />

        {connected ? (
          <CircuitCall
            api={status.api}
            unshieldedAddress={status.unshieldedAddress}
            onViewChange={setInitialized}
          />
        ) : (
          <section className="card" aria-label="How to transact">
            <h2>Transact</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              Viewing is public — the live total above needs no wallet. To move it,
              connect Lace (Preprod): initialize once to bind this browser as owner,
              then increment +1 with a local zero-knowledge proof.
            </p>
          </section>
        )}
      </main>

      <footer>
        <p className="muted tiny" style={{ margin: 0 }}>
          Proofs generate locally in your wallet. Your secret never leaves this browser.
        </p>
        <p className="explorer-hint tiny">
          <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
            Midnight Explorer (Preprod) ↗
          </a>
          {' · '}
          <a
            href="https://github.com/koushiknoah77/Nyx"
            target="_blank"
            rel="noreferrer"
          >
            Source ↗
          </a>
        </p>
      </footer>
    </div>
  );
}
