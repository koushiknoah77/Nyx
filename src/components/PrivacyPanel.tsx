/** What observers see vs can never see. Static copy — no secrets involved. */
export function PrivacyPanel() {
  return (
    <div className="privacy-grid">
      <div className="privacy-cell pub">
        <h3>01 — Public</h3>
        <p>
          Bracket counts, totals, nullifiers. That&apos;s the product — anyone may audit it.
        </p>
      </div>
      <div className="privacy-cell priv">
        <h3>02 — Private</h3>
        <p>
          Your exact salary and your secret. They live in this browser and die with the tab.
        </p>
      </div>
      <div className="privacy-cell prove">
        <h3>03 — Proven</h3>
        <p>That your salary falls in the bracket you counted. True or false — nothing else.</p>
      </div>
    </div>
  );
}
