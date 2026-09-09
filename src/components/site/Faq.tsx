import { useState } from 'react';

const ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'Is my salary visible to anyone?',
    a: 'No. Your exact salary, company, and personal details remain private. Only aggregated bracket counts are published — never individual figures.',
  },
  {
    q: 'Can I submit multiple offers?',
    a: 'Each offer produces one unique nullifier. The same offer cannot be counted twice — the chain rejects replays automatically.',
  },
  {
    q: 'How is double counting prevented?',
    a: 'Your proof commits a nullifier on-chain at record time. If that nullifier already exists in the 32-slot set, the transaction fails with "already counted".',
  },
  {
    q: 'Do I need a crypto wallet?',
    a: 'For the pilot, yes — the Lace wallet on Midnight Preprod, with a local proof server selected. The pilot roadmap is gasless: testers will never see a seed phrase or a fee.',
  },
  {
    q: 'Is this only for placements?',
    a: 'Placements are the wedge — one batch, one truth. The same nullifier-bracket pattern extends to internships, hackathon wins, and any countable credential.',
  },
  {
    q: 'How can colleges use OfferStats?',
    a: 'Open a pilot: your placed batch proves, juniors verify live, and you publish the only placement page that proves itself. Start from the For Colleges page.',
  },
];

/** Accordion FAQ. Static copy — the chain is the source of truth, not this text. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq" role="list">
      {ITEMS.map((item, i) => (
        <div key={item.q} className={`faq-item${open === i ? ' open' : ''}`} role="listitem">
          <button
            type="button"
            className="faq-q"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.q}
            <span className="faq-chev" aria-hidden>⌄</span>
          </button>
          {open === i && <p className="faq-a">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
