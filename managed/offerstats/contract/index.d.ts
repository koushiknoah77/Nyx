import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  offerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  ctc(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  init(context: __compactRuntime.CircuitContext<PS>, size_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  record(context: __compactRuntime.CircuitContext<PS>, bracket_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  init(context: __compactRuntime.CircuitContext<PS>, size_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  record(context: __compactRuntime.CircuitContext<PS>, bracket_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  init(context: __compactRuntime.CircuitContext<PS>, size_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  record(context: __compactRuntime.CircuitContext<PS>, bracket_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly batchSize: bigint;
  readonly initialized: boolean;
  readonly total: bigint;
  readonly b0: bigint;
  readonly b1: bigint;
  readonly b2: bigint;
  readonly b3: bigint;
  readonly b4: bigint;
  readonly n00: Uint8Array;
  readonly n01: Uint8Array;
  readonly n02: Uint8Array;
  readonly n03: Uint8Array;
  readonly n04: Uint8Array;
  readonly n05: Uint8Array;
  readonly n06: Uint8Array;
  readonly n07: Uint8Array;
  readonly n08: Uint8Array;
  readonly n09: Uint8Array;
  readonly n10: Uint8Array;
  readonly n11: Uint8Array;
  readonly n12: Uint8Array;
  readonly n13: Uint8Array;
  readonly n14: Uint8Array;
  readonly n15: Uint8Array;
  readonly n16: Uint8Array;
  readonly n17: Uint8Array;
  readonly n18: Uint8Array;
  readonly n19: Uint8Array;
  readonly n20: Uint8Array;
  readonly n21: Uint8Array;
  readonly n22: Uint8Array;
  readonly n23: Uint8Array;
  readonly n24: Uint8Array;
  readonly n25: Uint8Array;
  readonly n26: Uint8Array;
  readonly n27: Uint8Array;
  readonly n28: Uint8Array;
  readonly n29: Uint8Array;
  readonly n30: Uint8Array;
  readonly n31: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
