import type { NavTarget } from './Navbar';

interface Props {
  onGo: (v: NavTarget['view'], anchor?: string) => void;
}

/** Site footer: brand, product columns, chain badges. */
export function Footer({ onGo }: Props) {
  return (
    <footer className="site">
      <div className="footer-grid">
        <div className="footer-brand">
          <button type="button" className="brand" onClick={() => onGo('home')} aria-label="OfferStats home">
            <span className="brand-mark" aria-hidden>▮</span> OfferStats
          </button>
          <p>Private proof. Public truth.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <button type="button" onClick={() => onGo('home')}>Home</button>
          <button type="button" onClick={() => onGo('stats')}>Stats</button>
          <button type="button" onClick={() => onGo('how')}>How It Works</button>
          <button type="button" onClick={() => onGo('colleges')}>For Colleges</button>
          <button type="button" onClick={() => onGo('home', 'audit')}>Audit</button>
          <button type="button" onClick={() => onGo('stats', 'faq')}>FAQ</button>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <button type="button" onClick={() => onGo('about')}>About</button>
          <button type="button" onClick={() => onGo('join')}>Join the pilot</button>
          <a className="linkbtn" href="https://github.com/koushiknoah77/Nyx" target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '0.45rem', fontSize: '0.82rem' }}>
            Source ↗
          </a>
        </div>
        <div className="footer-col">
          <h4>Chain</h4>
          <span className="foot-badge"><span className="dotring">◍</span> Built on Midnight</span>
          <span className="foot-badge"><span className="dotring">◍</span> Powered by Lace</span>
        </div>
      </div>
      <div className="footer-base">
        <span>© 2026 OfferStats. All rights reserved.</span>
        <span>Private proof. Public truth.</span>
      </div>
    </footer>
  );
}
