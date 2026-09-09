/** Counter privacy strip: what the Nyx counter shows vs never shows. Static copy. */
export function PrivacyPanel() {
  return (
    <div className="privacy-grid">
      <div className="privacy-cell pub">
        <h3>01 — Public</h3>
        <p>
          The running total, the owner commitment, the setup flag. That&apos;s the
          whole ledger — anyone may audit it.
        </p>
      </div>
      <div className="privacy-cell priv">
        <h3>02 — Private</h3>
        <p>
          Your 32-byte secret. Generated in this browser, never rendered anywhere.
        </p>
      </div>
      <div className="privacy-cell prove">
        <h3>03 — Proven</h3>
        <p>
          That you know the secret behind this counter — without revealing it or who you are.
        </p>
      </div>
    </div>
  );
}
