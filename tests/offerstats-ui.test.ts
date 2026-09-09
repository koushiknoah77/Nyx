import { describe, it, expect } from 'vitest';
import {
  bracketForSalary,
  formatINR,
  medianBracket,
  percentPlaced,
} from '../src/midnight/offerstats';
import { badgeShareText } from '../src/components/offerstats/VerifiedBadge';

// Pure UI helpers for the OfferStats tab. The bracket boundaries here must
// stay exact mirrors of contracts/offerstats.compact (circuit tests in
// tests/offerstats.test.ts enforce the on-chain side).

describe('bracketForSalary', () => {
  it('maps salaries to the contract brackets, boundary-exact', () => {
    expect(bracketForSalary(0n)).toEqual(0);
    expect(bracketForSalary(499_999n)).toEqual(0);
    expect(bracketForSalary(500_000n)).toEqual(1);
    expect(bracketForSalary(999_999n)).toEqual(1);
    expect(bracketForSalary(1_000_000n)).toEqual(2);
    expect(bracketForSalary(1_999_999n)).toEqual(2);
    expect(bracketForSalary(2_000_000n)).toEqual(3);
    expect(bracketForSalary(50_000_000n)).toEqual(3);
  });
});

describe('percentPlaced', () => {
  it('derives % placed from public aggregates only', () => {
    expect(percentPlaced(16n, 32n)).toEqual('50.0');
    expect(percentPlaced(0n, 120n)).toEqual('0.0');
    expect(percentPlaced(32n, 32n)).toEqual('100.0');
  });
  it('returns null when the batch size is unknown', () => {
    expect(percentPlaced(0n, 0n)).toBeNull();
  });
});

describe('medianBracket', () => {
  it('finds the lower-median bracket from public counts', () => {
    expect(medianBracket([1n, 1n, 1n, 1n])).toEqual(2);
    expect(medianBracket([10n, 0n, 0n, 0n])).toEqual(0);
    expect(medianBracket([0n, 0n, 0n, 5n])).toEqual(3);
  });
  it('returns null on an empty board', () => {
    expect(medianBracket([0n, 0n, 0n, 0n])).toBeNull();
  });
});

describe('formatINR', () => {
  it('groups digits Indian-style', () => {
    expect(formatINR(750000n)).toEqual('7,50,000');
    expect(formatINR(500n)).toEqual('500');
    expect(formatINR(2800000n)).toEqual('28,00,000');
  });
});

describe('badgeShareText', () => {
  it('flexes bracket + proof refs without leaking salary', () => {
    const text = badgeShareText({
      bracket: 1,
      batchLabel: 'Batch of 32',
      nullifierHex: 'ab'.repeat(32),
      txId: 'tx123',
    });
    expect(text).toContain('VERIFIED PLACED');
    expect(text).toContain('₹5L');
    expect(text).toContain('tx123');
    expect(text).not.toContain('750000');
    expect(text).not.toMatch(/[0-9]{6,}/);
  });
});
