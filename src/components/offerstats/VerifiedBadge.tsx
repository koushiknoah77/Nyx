import { BRACKET_META } from '../../midnight/offerstats';
import { CopyButton } from '../CopyButton';

export interface BadgeData {
  bracket: 0 | 1 | 2 | 3;
  batchLabel: string;
  nullifierHex: string;
  txId: string;
}

/**
 * Copy-paste flex text for WhatsApp / status — the campus viral loop.
 * Carries the bracket and the nullifier prefix so anyone can look the proof
 * up on the Trust page. Never carries a salary.
 */
export function badgeShareText(b: BadgeData): string {
  const nf = b.nullifierHex.slice(0, 12);
  return (
    `✅ VERIFIED PLACED — ${b.batchLabel}\n` +
    `Bracket: ${BRACKET_META[b.bracket].label} (proven, salary hidden)\n` +
    `Proof: nullifier ${nf}… · tx ${b.txId}\n` +
    `Verify: on-chain, no trust needed.`
  );
}

/**
 * The senior flex: a printed-credential card, not a glowing widget.
 * Paper, serif, seal — built to be screenshotted.
 */
export function VerifiedBadge({ badge }: { badge: BadgeData }) {
  return (
    <div className="badge" role="status" aria-label="Verified placement credential">
      <div className="badge-inner">
        <span className="badge-seal" aria-hidden>✓</span>
        <p className="badge-kicker">OfferStats · Verified credential</p>
        <p className="badge-title">Placed.</p>
        <p className="badge-sub">{badge.batchLabel} — proven on-chain, salary undisclosed.</p>
        <hr className="badge-rule" />
        <div className="badge-bracket">{BRACKET_META[badge.bracket].label}</div>
        <p className="badge-proof">
          nullifier {badge.nullifierHex.slice(0, 16)}… · tx{' '}
          {badge.txId.length > 24 ? `${badge.txId.slice(0, 24)}…` : badge.txId}
        </p>
        <div className="badge-actions">
          <CopyButton text={badgeShareText(badge)} label="Copy flex text" />
        </div>
      </div>
    </div>
  );
}
