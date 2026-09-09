import type { MidnightStatus } from '../../hooks/useMidnight';

export type SiteView =
  | 'home'
  | 'about'
  | 'how'
  | 'students'
  | 'colleges'
  | 'stats'
  | 'join'
  | 'counter';

const LINKS: Array<{ id: SiteView; label: string }> = [
  { id: 'home', label: 'Product' },
  { id: 'students', label: 'For Students' },
  { id: 'colleges', label: 'For Colleges' },
  { id: 'stats', label: 'Stats' },
  { id: 'about', label: 'About' },
];

interface Props {
  view: SiteView;
  onGo: (v: SiteView) => void;
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

function shortAddr(a: string): string {
  return a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

/** Top bar: brand, product links, wallet action. */
export function Navbar({ view, onGo, status, onConnect, onDisconnect }: Props) {
  const connected = status.kind === 'connected';
  const connecting = status.kind === 'connecting';
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <button type="button" className="brand" onClick={() => onGo('home')} aria-label="OfferStats home">
          <span className="brand-mark" aria-hidden>O</span> OfferStats
        </button>
        <nav className="nav-links" aria-label="Product">
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`navlink${view === l.id ? ' active' : ''}`}
              aria-pressed={view === l.id}
              onClick={() => onGo(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <span className="nav-cta">
          {connected ? (
            <>
              <span className="addr-pill" title={status.unshieldedAddress}>
                {shortAddr(status.unshieldedAddress)}
              </span>
              <button type="button" className="ghost small" onClick={onDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              className="small"
              style={{ margin: 0 }}
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? 'Waiting…' : 'Get Started'}
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
