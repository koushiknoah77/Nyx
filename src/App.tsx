import { useCallback, useState } from 'react';
import { CounterView } from './components/offerstats/CounterView';
import { HomeView, type View } from './components/offerstats/HomeView';
import { StatsView } from './components/offerstats/StatsView';
import { ProveView } from './components/offerstats/ProveView';
import { TrustView } from './components/offerstats/TrustView';
import { CollegesView } from './components/offerstats/CollegesView';
import { useMidnight } from './hooks/useMidnight';
import { usePublicCounter } from './hooks/usePublicCounter';
import { useOfferStatsPublic } from './hooks/useOfferStatsPublic';
import { EXPLORER_URL } from './config';
import './index.css';

const NAV: Array<{ id: View; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'stats', label: 'Stats' },
  { id: 'prove', label: 'Prove' },
  { id: 'trust', label: 'Trust' },
  { id: 'colleges', label: 'Colleges' },
  { id: 'counter', label: 'Counter' },
];

export default function App() {
  const { status, connect, disconnect, clearError } = useMidnight();
  const publicState = usePublicCounter();
  const offerStats = useOfferStatsPublic();
  const [view, setView] = useState<View>('home');
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const connected = status.kind === 'connected';

  const handleDisconnect = useCallback(() => {
    disconnect();
    setInitialized(null);
  }, [disconnect]);

  return (
    <div className="page">
      <header className="brandbar">
        <button
          type="button"
          className="brand"
          onClick={() => setView('home')}
          aria-label="OfferStats home"
        >
          <span className="brand-mark" aria-hidden>◍</span> OfferStats
        </button>
        <span className="pill pre">Preprod</span>
      </header>

      <nav className="tabs product-nav" aria-label="Product">
        {NAV.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`tab${view === n.id ? ' active' : ''} ${n.id === 'counter' ? 'tab-dev' : ''}`}
            aria-pressed={view === n.id}
            onClick={() => setView(n.id)}
            title={n.id === 'counter' ? 'The seed contract — L2 demo surface' : n.label}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <main>
        {view === 'home' && <HomeView offerStats={offerStats} onGo={setView} />}
        {view === 'stats' && <StatsView offerStats={offerStats} />}
        {view === 'prove' && (
          <ProveView
            status={status}
            onConnect={() => void connect()}
            onDisconnect={handleDisconnect}
            onClearError={clearError}
            connected={connected}
            offerStats={offerStats}
          />
        )}
        {view === 'trust' && <TrustView offerStats={offerStats} />}
        {view === 'colleges' && <CollegesView />}
        {view === 'counter' && (
          <CounterView
            status={status}
            onConnect={() => void connect()}
            onDisconnect={handleDisconnect}
            onClearError={clearError}
            connected={connected}
            initialized={initialized}
            onViewChange={setInitialized}
            publicView={publicState.view}
            publicLoading={publicState.loading}
            publicError={publicState.error}
            onPublicRefresh={publicState.refresh}
          />
        )}
      </main>

      <footer>
        <p className="muted tiny" style={{ margin: 0 }}>
          Proofs generate locally in your wallet. Secrets never leave this browser.
        </p>
        <p className="explorer-hint tiny">
          <a href={EXPLORER_URL} target="_blank" rel="noreferrer">
            Midnight Explorer (Preprod) ↗
          </a>
          {' · '}
          <a href="https://github.com/koushiknoah77/Nyx" target="_blank" rel="noreferrer">
            Source ↗
          </a>
        </p>
      </footer>
    </div>
  );
}
