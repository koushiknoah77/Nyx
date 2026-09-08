/** What observers see vs can never see. Static copy — no secrets involved. */
export function PrivacyPanel() {
  return (
    <div className="privacy-grid">
      <div className="privacy-cell pub">
        <h3>👁 Public</h3>
        <p>
          Total <code>count</code>, owner commitment, setup flag. The increment is the constant{' '}
          <code>1</code>.
        </p>
      </div>
      <div className="privacy-cell priv">
        <h3>🔒 Private</h3>
        <p>
          Your 32-byte secret. Lives in this browser only. Never rendered, never transmitted.
        </p>
      </div>
      <div className="privacy-cell prove">
        <h3>✨ Proved</h3>
        <p>“I know the secret behind this counter” — without revealing it or who you are.</p>
      </div>
    </div>
  );
}
