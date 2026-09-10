import { describe, it, expect } from 'vitest';
import {
  Contract,
  ledger,
  type Witnesses,
} from '../managed/offerstats/contract/index.js';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';

// ─── Test fixtures ───────────────────────────────────────────────────────────
// Same harness shape as counter.test.ts (runtime 0.16 API): synchronous
// circuits, context shape { currentQueryContext }, deterministic secrets.
// CTC values are plain INR per annum (bigint); brackets:
//   0: < 600,000 | 1: 600k–999,999 | 2: 1M–1,499,999 | 3: 1.5M–1,999,999 | 4: >= 2M

function secretFill(byte: number): Uint8Array {
  return new Uint8Array(32).fill(byte);
}

function witnessesFor(secret: Uint8Array, salary: bigint): Witnesses<unknown> {
  return {
    offerSecret: () => [undefined as unknown, secret],
    ctc: () => [undefined as unknown, salary],
  };
}

const coinKey = { bytes: new Uint8Array(32).fill(1) };
const contractAddress = sampleContractAddress();

function freshState() {
  const contract = new Contract(witnessesFor(secretFill(7), 750_000n));
  const { currentContractState } = contract.initialState(
    createConstructorContext(undefined, coinKey),
  );
  return { contract, currentContractState };
}

function circuitCtx(
  contract: Contract,
  state: unknown,
  witnesses: Witnesses<unknown>,
) {
  (contract as unknown as { witnesses: unknown }).witnesses = witnesses;
  return createCircuitContext(
    contractAddress,
    coinKey,
    state as never,
    undefined,
  );
}

function publicStateOf(result: { context: { currentQueryContext: { state: unknown } } }) {
  return ledger(result.context.currentQueryContext.state as never);
}

function stateOf(result: { context: { currentQueryContext: { state: unknown } } }) {
  return result.context.currentQueryContext.state;
}

function initBatch(contract: Contract, state: unknown, size = 32n) {
  const ctx = circuitCtx(contract, state, witnessesFor(secretFill(7), 750_000n));
  return contract.impureCircuits.init(ctx, size);
}

function recordOffer(
  contract: Contract,
  state: unknown,
  bracket: bigint,
  secret: Uint8Array,
  salary: bigint,
) {
  const ctx = circuitCtx(contract, state, witnessesFor(secret, salary));
  return contract.impureCircuits.record(ctx, bracket);
}

describe('offerstats setup', () => {
  it('initializes with the disclosed batch size and rejects a second init', () => {
    const { contract, currentContractState } = freshState();
    const res = initBatch(contract, currentContractState, 32n);
    const after = publicStateOf(res as never);
    expect(after.batchSize).toEqual(32n);
    expect(after.initialized).toEqual(true);
    expect(after.total).toEqual(0n);

    const againCtx = circuitCtx(
      contract,
      stateOf(res as never),
      witnessesFor(secretFill(7), 750_000n),
    );
    expect(() => contract.impureCircuits.init(againCtx, 32n)).toThrow(
      'already initialized',
    );
  });

  it('rejects empty and oversized batches', () => {
    const { contract, currentContractState } = freshState();
    // Zero students: % placed would divide by nothing.
    expect(() =>
      initBatch(contract, currentContractState, 0n),
    ).toThrow('bad batch size');
    // v1 holds 32 nullifier slots: a bigger cohort could never fully count.
    expect(() =>
      initBatch(contract, currentContractState, 33n),
    ).toThrow('batch exceeds');
  });

  it('rejects records before init', () => {
    const { contract, currentContractState } = freshState();
    expect(() =>
      recordOffer(contract, currentContractState, 1n, secretFill(7), 750_000n),
    ).toThrow('not initialized');
  });
});

describe('offerstats brackets', () => {
  it('counts an offer in each bracket with an in-range salary', () => {
    const { contract, currentContractState } = freshState();
    let res = initBatch(contract, currentContractState);
    const offers: Array<[bigint, Uint8Array, bigint]> = [
      [0n, secretFill(11), 350_000n],
      [1n, secretFill(12), 750_000n],
      [2n, secretFill(13), 1_200_000n],
      [3n, secretFill(14), 1_700_000n],
      [4n, secretFill(15), 2_800_000n],
    ];
    for (const [bracket, secret, salary] of offers) {
      res = recordOffer(contract, stateOf(res as never), bracket, secret, salary);
    }
    const after = publicStateOf(res as never);
    expect(after.total).toEqual(5n);
    expect([after.b0, after.b1, after.b2, after.b3, after.b4]).toEqual([1n, 1n, 1n, 1n, 1n]);
  });

  it('enforces bracket boundaries on the private salary', () => {
    const { contract, currentContractState } = freshState();
    const res = initBatch(contract, currentContractState);
    const state = stateOf(res as never);
    // 600,000 belongs to bracket 1, not 0 — boundary is exact.
    expect(() => recordOffer(contract, state, 0n, secretFill(21), 600_000n)).toThrow(
      'ctc not in bracket 0',
    );
    // 1,500,000 belongs to bracket 3, not 2.
    expect(() => recordOffer(contract, state, 2n, secretFill(22), 1_500_000n)).toThrow(
      'ctc not in bracket 2',
    );
    // 2,000,000 belongs to bracket 4, not 3.
    expect(() => recordOffer(contract, state, 3n, secretFill(24), 2_000_000n)).toThrow(
      'ctc not in bracket 3',
    );
    // 999,999 is the top of bracket 1.
    const ok = recordOffer(contract, state, 1n, secretFill(23), 999_999n);
    expect(publicStateOf(ok as never).b1).toEqual(1n);
  });

  it('rejects out-of-range bracket indexes', () => {
    const { contract, currentContractState } = freshState();
    const res = initBatch(contract, currentContractState);
    expect(() =>
      recordOffer(contract, stateOf(res as never), 5n, secretFill(31), 750_000n),
    ).toThrow('bad bracket');
  });
});

describe('offerstats nullifiers', () => {
  it('rejects counting the same offer secret twice', () => {
    const { contract, currentContractState } = freshState();
    let res = initBatch(contract, currentContractState);
    res = recordOffer(contract, stateOf(res as never), 1n, secretFill(41), 750_000n);
    expect(publicStateOf(res as never).total).toEqual(1n);
    // Same secret, even in a different bracket with a different salary claim:
    // the nullifier is bound to the secret, not the claim.
    expect(() =>
      recordOffer(contract, stateOf(res as never), 4n, secretFill(41), 5_000_000n),
    ).toThrow('already counted');
    // A fresh secret counts fine.
    res = recordOffer(contract, stateOf(res as never), 4n, secretFill(42), 5_000_000n);
    expect(publicStateOf(res as never).total).toEqual(2n);
  });

  it('fills all 32 slots and then reports the batch full', () => {
    const { contract, currentContractState } = freshState();
    let res = initBatch(contract, currentContractState, 32n);
    for (let i = 0; i < 32; i++) {
      const salary = 600_000n + BigInt(i);
      res = recordOffer(contract, stateOf(res as never), 1n, secretFill(100 + i), salary);
    }
    const full = publicStateOf(res as never);
    expect(full.total).toEqual(32n);
    expect(full.b1).toEqual(32n);
    // Every slot holds a distinct non-zero commitment.
    const slots = Array.from({ length: 32 }, (_, i) => {
      const key = `n${String(i).padStart(2, '0')}` as keyof typeof full;
      return Buffer.from(full[key] as Uint8Array).toString('hex');
    });
    expect(new Set(slots).size).toEqual(32);
    expect(slots.every((s) => s !== '00'.repeat(32))).toEqual(true);
    // 33rd offer: capacity guard trips before any state changes.
    expect(() =>
      recordOffer(contract, stateOf(res as never), 1n, secretFill(200), 600_000n),
    ).toThrow('batch full');
  });
});

describe('offerstats privacy', () => {
  it('never exposes raw secrets or salaries in public state', () => {
    const { contract, currentContractState } = freshState();
    const secret = secretFill(77);
    const salary = 1_234_567n;
    let res = initBatch(contract, currentContractState);
    res = recordOffer(contract, stateOf(res as never), 2n, secret, salary);
    const after = publicStateOf(res as never);

    const secretHex = Buffer.from(secret).toString('hex');
    const fields: string[] = [
      after.batchSize.toString(),
      after.total.toString(),
      after.b0.toString(),
      after.b1.toString(),
      after.b2.toString(),
      after.b3.toString(),
      ...Array.from({ length: 32 }, (_, i) => {
        const key = `n${String(i).padStart(2, '0')}` as keyof typeof after;
        return Buffer.from(after[key] as Uint8Array).toString('hex');
      }),
    ];
    // Salary digits must not appear verbatim in any public field...
    expect(fields.some((f) => f.includes(salary.toString()))).toEqual(false);
    // ...and the nullifier commitment must differ from the raw secret.
    expect(fields).not.toContain(secretHex);
  });
});
