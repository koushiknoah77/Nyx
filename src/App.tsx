import { useCallback, useEffect, useState } from 'react';
import { Navbar, type SiteView } from './components/site/Navbar';
import { Footer } from './components/site/Footer';
import { HomePage } from './components/site/HomePage';
import { AboutPage } from './components/site/AboutPage';
import { HowPage } from './components/site/HowPage';
import { StudentsPage } from './components/site/StudentsPage';
import { CollegesPage } from './components/site/CollegesPage';
import { StatsPage } from './components/site/StatsPage';
import { JoinPage } from './components/site/JoinPage';
import { CounterView } from './components/offerstats/CounterView';
import { useMidnight } from './hooks/useMidnight';
import { usePublicCounter } from './hooks/usePublicCounter';
import { useOfferStatsPublic } from './hooks/useOfferStatsPublic';
import './index.css';

const VIEWS: SiteView[] = ['home', 'about', 'how', 'students', 'colleges', 'stats', 'join', 'counter'];

/** Deep-linkable views: #/stats opens the board, etc. Also powers screenshots. */
function viewFromHash(): SiteView {
  const h = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return (VIEWS as string[]).includes(h) ? (h as SiteView) : 'home';
}

export default function App() {
  const { status, connect, disconnect, clearError } = useMidnight();
  const publicState = usePublicCounter();
  const offerStats = useOfferStatsPublic();
  const [view, setView] = useState<SiteView>(() => viewFromHash());
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const connected = status.kind === 'connected';

  const handleDisconnect = useCallback(() => {
    disconnect();
    setInitialized(null);
  }, [disconnect]);

  const go = useCallback((v: SiteView) => {
    setView(v);
    window.location.hash = `#/${v}`;
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => {
      setView(viewFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <>
      <div className="announce" role="status">
        MIDNIGHT PREPROD · OFFERSTATS PILOT{' '}
        <b>{offerStats.deployed ? '● LIVE' : '○ PENDING'}</b>
        {' · '}PROOFS LOCAL · SALARIES NEVER ON-CHAIN
      </div>
      <Navbar
        view={view}
        onGo={go}
        status={status}
        onConnect={() => void connect()}
        onDisconnect={handleDisconnect}
      />
      <div className="page">
        <main>
          {view === 'home' && <HomePage onGo={go} />}
          {view === 'about' && <AboutPage onGo={go} />}
          {view === 'how' && <HowPage onGo={go} />}
          {view === 'students' && (
            <StudentsPage
              status={status}
              onConnect={() => void connect()}
              onDisconnect={handleDisconnect}
              onClearError={clearError}
              offerStats={offerStats}
            />
          )}
          {view === 'colleges' && <CollegesPage onGo={go} />}
          {view === 'stats' && <StatsPage />}
          {view === 'join' && <JoinPage />}
          {view === 'counter' && (
            <>
              <section className="hero-block">
                <p className="kicker">Developer playground</p>
                <h1 className="mega" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>
                  The seed contract.
                </h1>
                <p className="lede">
                  The Nyx counter every OfferStats bracket grows out of — L2 demo
                  surface, preserved verbatim.
                </p>
              </section>
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
            </>
          )}
        </main>
        <Footer onGo={go} />
      </div>
    </>
  );
}
