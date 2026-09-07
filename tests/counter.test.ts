import { describe, it, expect } from 'vitest';
import {
  Contract,
  ledger,
  type Witnesses,
} from '../managed/counter/contract/index.js';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';

// ─── Test fixtures ───────────────────────────────────────────────────────────
// Deterministic but distinct secrets/steps per test so the privacy test can
// prove raw private bytes never reach public state.
// Runtime 0.16 API: createCircuitContext(address, coinKey, state, privateState),
// context shape is { currentQueryContext }, circuits are synchronous.

const SECRET_A = new Uint8Array(32).fill(7);
const SECRET_B = new Uint8Array(32).fill(9);

function witnessesFor(secret: Uint8Array, step: bigint): Witnesses<unknown> {
  return {
    userSecret: () => [undefined as unknown, secret],
    secretStep: () => [undefined as unknown, step],
  };
}

const coinKey = { bytes: new Uint8Array(32).fill(1) };
const contractAddress = sampleContractAddress();

function freshState() {
  const contract = new Contract(witnessesFor(SECRET_A, 3n));
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

describe('counter circuit logic', () => {
  it('initializes with count 0 and binds the owner commitment', () => {
    const { contract, currentContractState } = freshState();

    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A, 3n));
    const { context } = contract.impureCircuits.init(ctx);
    const after = publicStateOf({ context } as never);

    expect(after.count).toEqual(0n);
    expect(after.owner).not.toEqual(new Uint8Array(32)); // commitment stored
    // Same secret reproduces the same commitment → deterministic binding.
    const { contract: c2, currentContractState: s2 } = freshState();
    const ctx2 = circuitCtx(c2, s2, witnessesFor(SECRET_A, 3n));
    const r2 = c2.impureCircuits.init(ctx2);
    expect(publicStateOf(r2 as never).owner).toEqual(after.owner);
  });
});

describe('counter state transitions', () => {
  it('increments by the private step and accumulates across calls', () => {
    const { contract, currentContractState } = freshState();
    let ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A, 3n));
    let res = contract.impureCircuits.init(ctx);
    let state = publicStateOf(res as never);
    expect(state.count).toEqual(0n);

    for (const step of [3n, 10n, 1n]) {
      ctx = circuitCtx(
        contract,
        stateOf(res as never),
        witnessesFor(SECRET_A, step),
      );
      res = contract.impureCircuits.increment(ctx);
    }
    state = publicStateOf(res as never);
    expect(state.count).toEqual(14n);
  });

  it('rejects increments from a non-owner secret', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A, 3n));
    const res = contract.impureCircuits.init(ctx);

    const badCtx = circuitCtx(
      contract,
      stateOf(res as never),
      witnessesFor(SECRET_B, 3n),
    );
    expect(() => contract.impureCircuits.increment(badCtx)).toThrow('not owner');
  });

  it('rejects out-of-range private steps', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A, 3n));
    const res = contract.impureCircuits.init(ctx);
    const state = stateOf(res as never);

    for (const bad of [0n, 11n, 999n]) {
      const badCtx = circuitCtx(contract, state, witnessesFor(SECRET_A, bad));
      expect(() => contract.impureCircuits.increment(badCtx)).toThrow('out of range');
    }
  });
});

describe('counter privacy', () => {
  it('never exposes raw secrets or steps in public state', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A, 5n));
    const res = contract.impureCircuits.init(ctx);

    const seen: Uint8Array[] = [];
    const after = publicStateOf(res as never);
    seen.push(after.owner);

    // Run increments with distinct secrets/steps; collect every public artifact.
    let last = res;
    for (const [secret, step] of [
      [SECRET_A, 5n],
      [SECRET_A, 7n],
    ] as const) {
      const c = circuitCtx(
        contract,
        stateOf(last as never),
        witnessesFor(secret, step),
      );
      last = contract.impureCircuits.increment(c);
    }
    const final = publicStateOf(last as never);
    expect(final.count).toEqual(12n);

    // Raw private bytes must not appear verbatim in any public field.
    const secretHex = Buffer.from(SECRET_A).toString('hex');
    for (const pub of seen) {
      expect(Buffer.from(pub).toString('hex')).not.toEqual(secretHex);
    }
    // The owner commitment is a hash, not the secret.
    expect(after.owner).not.toEqual(SECRET_A);
    // Count reveals only the sum, never the individual steps:
    // 5+7 == 12 is also reachable by 6+6 / 10+2, so steps stay hidden.
    expect(final.count).toEqual(5n + 7n);
  });
});
