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

export interface NavTarget {
  view: SiteView;
  anchor?: string;
}

const LINKS: Array<{ label: string; target: NavTarget; match: SiteView }> = [
  { label: 'Home', target: { view: 'home' }, match: 'home' },
  { label: 'Stats', target: { view: 'stats' }, match: 'stats' },
  { label: 'How It Works', target: { view: 'how' }, match: 'how' },
  { label: 'For Colleges', target: { view: 'colleges' }, match: 'colleges' },
  { label: 'Audit', target: { view: 'home', anchor: 'audit' }, match: 'home' },
  { label: 'FAQ', target: { view: 'stats', anchor: 'faq' }, match: 'stats' },
];

interface Props {
  view: SiteView;
  onGo: (v: SiteView, anchor?: string) => void;
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

function shortAddr(a: string): string {
  return a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

/** Top bar: brand, product links, Lace wallet action. */
export function Navbar({ view, onGo, status, onConnect, onDisconnect }: Props) {
  const connected = status.kind === 'connected';
  const connecting = status.kind === 'connecting';
  return (
    <div className="navbar">
      <div className="navbar-inner">
        <button type="button" className="brand" onClick={() => onGo('home')} aria-label="OfferStats home">
          <span className="brand-mark" aria-hidden>▮</span> OfferStats
        </button>
        <nav className="nav-links" aria-label="Product">
          {LINKS.map((l) => (
            <button
              key={l.label}
              type="button"
              className={`navlink${view === l.match ? ' active' : ''}`}
              aria-pressed={view === l.match}
              onClick={() => onGo(l.target.view, l.target.anchor)}
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
              <button type="button" className="ghost small navy" onClick={onDisconnect}>
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              className="small navy"
              style={{ margin: 0 }}
              onClick={onConnect}
              disabled={connecting}
            >
              {connecting ? 'Waiting…' : '◍ Connect Lace'}
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
