import { useCallback, useState } from 'react';
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

export default function App() {
  const { status, connect, disconnect, clearError } = useMidnight();
  const publicState = usePublicCounter();
  const offerStats = useOfferStatsPublic();
  const [view, setView] = useState<SiteView>('home');
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const connected = status.kind === 'connected';

  const handleDisconnect = useCallback(() => {
    disconnect();
    setInitialized(null);
  }, [disconnect]);

  const go = useCallback((v: SiteView) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <>
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
