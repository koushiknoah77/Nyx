import type { SiteView } from './Navbar';

interface Props {
  onGo: (v: SiteView) => void;
}

/** Site footer: brand, product columns, dev-surface link. */
export function Footer({ onGo }: Props) {
  return (
    <footer className="site">
      <div className="footer-grid">
        <div className="footer-brand">
          <button type="button" className="brand" onClick={() => onGo('home')} aria-label="OfferStats home">
            <span className="brand-mark" aria-hidden>O</span> OfferStats
          </button>
          <p>Real placement stats. No guesswork.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <button type="button" onClick={() => onGo('how')}>How it works</button>
          <button type="button" onClick={() => onGo('students')}>For Students</button>
          <button type="button" onClick={() => onGo('stats')}>Statistics</button>
        </div>
        <div className="footer-col">
          <h4>Resources</h4>
          <button type="button" onClick={() => onGo('about')}>About</button>
          <button type="button" onClick={() => onGo('colleges')}>For Colleges</button>
          <button type="button" onClick={() => onGo('join')}>Join the pilot</button>
        </div>
        <div className="footer-col">
          <h4>Build</h4>
          <button type="button" onClick={() => onGo('counter')}>Counter playground</button>
          <a className="linkbtn" href="https://github.com/koushiknoah77/Nyx" target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '0.45rem', fontSize: '0.82rem' }}>
            Source ↗
          </a>
        </div>
      </div>
      <div className="footer-base">
        <span>OfferStats — private proof, public truth.</span>
        <span>Built on Midnight · Preprod</span>
      </div>
    </footer>
  );
}
