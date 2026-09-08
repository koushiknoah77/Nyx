import { WalletConnect } from './components/WalletConnect';
import { CircuitCall } from './components/CircuitCall';
import { useMidnight } from './hooks/useMidnight';
import './index.css';

export default function App() {
  const { status, connect, disconnect, clearError } = useMidnight();

  return (
    <div className="page">
      <header>
        <h1>🌑 Nyx</h1>
        <p className="tag">Private counter on Midnight Preprod.</p>
      </header>

      <main>
        <WalletConnect
          status={status}
          onConnect={() => void connect()}
          onDisconnect={disconnect}
          onClearError={clearError}
        />

        {status.kind === 'connected' ? (
          <CircuitCall api={status.api} unshieldedAddress={status.unshieldedAddress} />
        ) : (
          <section className="card">
            <p className="muted">Connect Lace to call the counter circuits.</p>
          </section>
        )}
      </main>

      <footer>
        <p className="muted tiny">
          Proofs generate locally in your wallet. Your secret never leaves this browser.
        </p>
      </footer>
    </div>
  );
}
