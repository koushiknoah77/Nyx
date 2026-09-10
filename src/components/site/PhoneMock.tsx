interface Props {
  variant?: 'home' | 'students';
}

/** Pure-CSS phone with floating proof badges. Decorative — no chain data. */
export function PhoneMock({ variant = 'home' }: Props) {
  return (
    <div className="phone-wrap" aria-hidden>
      <div style={{ position: 'relative' }}>
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            <span className="phone-appicon">O</span>
            {variant === 'home' ? (
              <>
                <b style={{ fontSize: '1.05rem' }}>Verify your offer</b>
                <span className="muted tiny">Private proof. Public truth.</span>
              </>
            ) : (
              <>
                <b style={{ fontSize: '1.05rem' }}>Verified</b>
                <span className="muted tiny">Offer counted</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)' }}>20 LPA+</span>
              </>
            )}
          </div>
        </div>
        {variant === 'home' ? (
          <>
            <div className="phone-badge b1">
              <span className="checkdot">✓</span>
              <div><b>Verified</b><span>Your offer has been counted</span></div>
            </div>
            <div className="phone-badge b2">
              <span className="checkdot" style={{ background: 'var(--primary)' }}>◍</span>
              <div><b>Private &amp; Secure</b><span>No salary or personal data shared</span></div>
            </div>
          </>
        ) : (
          <>
            <div className="phone-badge b1">
              <span className="checkdot">✓</span>
              <div><b>Verified</b><span>Bracket proven, salary hidden</span></div>
            </div>
            <div className="phone-badge b2">
              <span className="checkdot" style={{ background: 'var(--primary)' }}>◍</span>
              <div><b>Private. Verified. Real.</b><span>One offer, one count</span></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
