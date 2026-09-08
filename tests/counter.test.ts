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
// Deterministic but distinct secrets per test so the privacy test can prove
// raw private bytes never reach public state.
// Runtime 0.16 API: createCircuitContext(address, coinKey, state, privateState),
// context shape is { currentQueryContext }, circuits are synchronous.

const SECRET_A = new Uint8Array(32).fill(7);
const SECRET_B = new Uint8Array(32).fill(9);

function witnessesFor(secret: Uint8Array): Witnesses<unknown> {
  return {
    userSecret: () => [undefined as unknown, secret],
  };
}

const coinKey = { bytes: new Uint8Array(32).fill(1) };
const contractAddress = sampleContractAddress();

function freshState() {
  const contract = new Contract(witnessesFor(SECRET_A));
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

    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A));
    const { context } = contract.impureCircuits.init(ctx);
    const after = publicStateOf({ context } as never);

    expect(after.count).toEqual(0n);
    expect(after.owner).not.toEqual(new Uint8Array(32)); // commitment stored
    // Same secret reproduces the same commitment → deterministic binding.
    const { contract: c2, currentContractState: s2 } = freshState();
    const ctx2 = circuitCtx(c2, s2, witnessesFor(SECRET_A));
    const r2 = c2.impureCircuits.init(ctx2);
    expect(publicStateOf(r2 as never).owner).toEqual(after.owner);
  });
});

describe('counter state transitions', () => {
  it('rejects a second init, even from the same secret', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A));
    const res = contract.impureCircuits.init(ctx);

    // Re-running init must fail: otherwise anyone could rebind the owner
    // and steal the counter (count stays 0 through init, so only the
    // initialized flag can guard this).
    const againCtx = circuitCtx(contract, stateOf(res as never), witnessesFor(SECRET_A));
    expect(() => contract.impureCircuits.init(againCtx)).toThrow('already initialized');
  });
  it('rejects increments before init', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A));
    expect(() => contract.impureCircuits.increment(ctx)).toThrow('not initialized');
  });
  it('increments the public total by the constant 1 and accumulates', () => {
    const { contract, currentContractState } = freshState();
    let ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A));
    let res = contract.impureCircuits.init(ctx);
    let state = publicStateOf(res as never);
    expect(state.count).toEqual(0n);

    // The increment amount is the public constant 1: three calls → 3.
    for (let i = 0; i < 3; i++) {
      ctx = circuitCtx(contract, stateOf(res as never), witnessesFor(SECRET_A));
      res = contract.impureCircuits.increment(ctx);
    }
    state = publicStateOf(res as never);
    expect(state.count).toEqual(3n);
  });
  it('rejects increments from a non-owner secret', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A));
    const res = contract.impureCircuits.init(ctx);

    const badCtx = circuitCtx(
      contract,
      stateOf(res as never),
      witnessesFor(SECRET_B),
    );
    expect(() => contract.impureCircuits.increment(badCtx)).toThrow('not owner');
  });
});

describe('counter privacy', () => {
  it('never exposes raw secrets in public state', () => {
    const { contract, currentContractState } = freshState();
    const ctx = circuitCtx(contract, currentContractState, witnessesFor(SECRET_A));
    const res = contract.impureCircuits.init(ctx);

    const after = publicStateOf(res as never);
    expect(after.owner).not.toEqual(SECRET_A); // commitment is a hash, not the secret

    // Two increments with the same secret; only the total is public.
    let last = res;
    for (let i = 0; i < 2; i++) {
      const c = circuitCtx(contract, stateOf(last as never), witnessesFor(SECRET_A));
      last = contract.impureCircuits.increment(c);
    }
    const final = publicStateOf(last as never);
    expect(final.count).toEqual(2n);

    // Raw secret bytes must not appear verbatim in any public field.
    const secretHex = Buffer.from(SECRET_A).toString('hex');
    expect(Buffer.from(after.owner).toString('hex')).not.toEqual(secretHex);
  });
});
