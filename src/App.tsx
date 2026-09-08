import { useCallback, useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { Steps } from './components/Steps';
import { CopyButton } from './components/CopyButton';
import { useMidnight } from './hooks/useMidnight';
import { EXPLORER_URL, PREPROD_CONTRACT_ADDRESS } from './config';
import './index.css';

export default function App() {
  const { status, connect, disconnect, clearError } = useMidnight();
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
        <Steps connected={connected} initialized={connected ? initialized : null} />

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
          <section className="card">
            <p className="muted" style={{ margin: 0 }}>
              Connect Lace to call the counter circuits — initialize once, then increment
              forever.
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
