// OfferStats browser layer: witnesses, state reader, circuit calls.
// Mirrors midnight/providers.ts (counter) so both tabs share one provider shape.
// Private material rules (same as counter):
//   - offerSecret: per-browser, localStorage only, NEVER rendered.
//   - salary (ctc): in-memory only, set just before a record call, cleared after.
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import {
  Contract,
  ledger as readLedger,
} from '../../managed/offerstats/contract/index.js';
import {
  OFFER_SECRET_STORAGE_KEY,
  OFFERSTATS_CAPACITY,
  OFFERSTATS_CONTRACT_ADDRESS,
  OFFERSTATS_PRIVATE_STATE_ID,
  OFFERSTATS_ZK_BASE_PATH,
} from '../config';
import { buildProviders, type NyxProviders } from './providers';
import { networkReadProvider } from './network-provider';
import { fromHex, toHex } from './wallet';

// ─── Brackets (must match contracts/offerstats.compact) ─────────────────────
//   0: < 600,000 | 1: 600,000–999,999 | 2: 1,000,000–1,499,999
//   3: 1,500,000–1,999,999 | 4: >= 2,000,000

export const BRACKET_META = [
  { label: 'Under ₹6L', short: '<6L', min: 0n, max: 599_999n },
  { label: '₹6L – ₹10L', short: '6–10L', min: 600_000n, max: 999_999n },
  { label: '₹10L – ₹15L', short: '10–15L', min: 1_000_000n, max: 1_499_999n },
  { label: '₹15L – ₹20L', short: '15–20L', min: 1_500_000n, max: 1_999_999n },
  { label: '₹20L and above', short: '20L+', min: 2_000_000n, max: null },
] as const;

export type BracketIndex = 0 | 1 | 2 | 3 | 4;

/** Client-side bracket derivation. Boundary-exact: 600,000 → 1, 2,000,000 → 4. */
export function bracketForSalary(salary: bigint): BracketIndex {
  if (salary < 600_000n) return 0;
  if (salary < 1_000_000n) return 1;
  if (salary < 1_500_000n) return 2;
  if (salary < 2_000_000n) return 3;
  return 4;
}

/** "% placed" from public aggregates only. Null when batch size is unknown/zero. */
export function percentPlaced(total: bigint, batchSize: bigint): string | null {
  if (batchSize <= 0n) return null;
  const pct = (Number(total) / Number(batchSize)) * 100;
  return pct.toFixed(1);
}

/** Which bracket holds the median offer (off-chain derivation, public inputs only). */
export function medianBracket(counts: [bigint, bigint, bigint, bigint, bigint]): number | null {
  const total = counts.reduce((a, b) => a + b, 0n);
  if (total === 0n) return null;
  const rank = total / 2n; // lower-median rank
  let acc = 0n;
  for (let i = 0; i < 5; i++) {
    acc += counts[i];
    if (rank < acc) return i;
  }
  return 4;
}

/** Indian digit grouping: 750000 → "7,50,000". Pure display helper. */
export function formatINR(n: bigint): string {
  const s = n.toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  if (!rest) return last3;
  return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`;
}

export function isOfferStatsDeployed(): boolean {
  return OFFERSTATS_CONTRACT_ADDRESS.trim().length > 0;
}

// ─── Secrets ─────────────────────────────────────────────────────────────────

let memorySecret: Uint8Array | null = null;

/** The senior's per-browser offer secret. NEVER imported by .tsx for display. */
export function getOfferSecret(): Uint8Array {
  try {
    const stored = localStorage.getItem(OFFER_SECRET_STORAGE_KEY);
    if (stored) {
      const parsed = fromHex(stored);
      if (parsed) return parsed;
    }
    const fresh = crypto.getRandomValues(new Uint8Array(32));
    try {
      localStorage.setItem(OFFER_SECRET_STORAGE_KEY, toHex(fresh));
    } catch {
      memorySecret = fresh;
    }
    return fresh;
  } catch {
    if (!memorySecret) memorySecret = crypto.getRandomValues(new Uint8Array(32));
    return memorySecret;
  }
}

// The salary lives in memory only: set immediately before a record call,
// cleared right after. It is never persisted and never rendered back.
let pendingCtc: bigint | null = null;

export function setPendingCtc(salary: bigint | null): void {
  pendingCtc = salary;
}

let compiledCache: unknown = null;

export async function getCompiledOfferStats(): Promise<unknown> {
  if (compiledCache) return compiledCache;
  const witnesses = {
    offerSecret: ({ privateState }: { privateState: unknown }) =>
      [privateState, getOfferSecret()] as [unknown, Uint8Array],
    ctc: () => {
      if (pendingCtc == null) throw new Error('Enter your CTC first — no salary was supplied.');
      return [undefined as unknown, pendingCtc] as [unknown, bigint];
    },
  };
  compiledCache = CompiledContract.make('offerstats', Contract).pipe(
    CompiledContract.withWitnesses(witnesses as never),
    CompiledContract.withCompiledFileAssets(OFFERSTATS_ZK_BASE_PATH as never),
  );
  return compiledCache;
}

// ─── Providers / state / calls ───────────────────────────────────────────────

export interface OfferStatsView {
  batchSize: bigint;
  initialized: boolean;
  total: bigint;
  counts: [bigint, bigint, bigint, bigint, bigint];
  /** Non-zero nullifier slots — offers counted so far, without saying whose. */
  nullifiersUsed: number;
  /** Hex of every stored nullifier, oldest first. The public audit trail. */
  nullifiers: string[];
}

export async function buildOfferStatsProviders(
  api: ConnectedAPI,
  unshieldedAddress: string,
): Promise<NyxProviders> {
  return buildProviders(api, unshieldedAddress, {
    privateStateStoreName: 'nyx-offerstats-state',
    zkBasePath: OFFERSTATS_ZK_BASE_PATH,
  });
}

/** Read-only public state. Works without a wallet (indexer only). */
export async function readOfferStatsState(
  publicDataProvider: {
    queryContractState(address: string): Promise<{ serialize(): Uint8Array } | null>;
  },
): Promise<OfferStatsView | null> {
  if (!isOfferStatsDeployed()) return null;
  try {
    const onchain = await publicDataProvider.queryContractState(OFFERSTATS_CONTRACT_ADDRESS);
    if (!onchain) return null;
    const compact = ContractState.deserialize(onchain.serialize());
    const view = readLedger(compact.data) as unknown as {
      batchSize: bigint;
      initialized: boolean;
      total: bigint;
      b0: bigint;
      b1: bigint;
      b2: bigint;
      b3: bigint;
      b4: bigint;
    } & Record<string, unknown>;
    let nullifiersUsed = 0;
    const nullifiers: string[] = [];
    for (let i = 0; i < OFFERSTATS_CAPACITY; i++) {
      const slot = view[`n${String(i).padStart(2, '0')}`] as Uint8Array | undefined;
      if (slot && slot.some((b) => b !== 0)) {
        nullifiersUsed++;
        nullifiers.push(toHex(slot));
      }
    }
    return {
      batchSize: view.batchSize,
      initialized: view.initialized,
      total: view.total,
      counts: [view.b0, view.b1, view.b2, view.b3, view.b4],
      nullifiersUsed,
      nullifiers,
    };
  } catch {
    return null;
  }
}

/** Read-only provider for the public dashboard (no wallet). Single network path. */
export function readOnlyOfferStatsProvider() {
  return networkReadProvider();
}

export async function initOfferStatsBatch(
  providers: NyxProviders['providers'],
  batchSize: bigint,
): Promise<unknown> {
  const compiled = await getCompiledOfferStats();
  const found = (await findDeployedContract(providers as never, {
    contractAddress: OFFERSTATS_CONTRACT_ADDRESS,
    compiledContract: compiled,
    privateStateId: OFFERSTATS_PRIVATE_STATE_ID,
    initialPrivateState: {},
  } as never)) as unknown as { callTx: { init(size: bigint): Promise<unknown> } };
  return found.callTx.init(batchSize);
}

export async function recordOffer(
  providers: NyxProviders['providers'],
  bracket: BracketIndex,
  salary: bigint,
): Promise<unknown> {
  setPendingCtc(salary);
  try {
    const compiled = await getCompiledOfferStats();
    const found = (await findDeployedContract(providers as never, {
      contractAddress: OFFERSTATS_CONTRACT_ADDRESS,
      compiledContract: compiled,
      privateStateId: OFFERSTATS_PRIVATE_STATE_ID,
      initialPrivateState: {},
    } as never)) as unknown as { callTx: { record(b: bigint): Promise<unknown> } };
    return await found.callTx.record(BigInt(bracket));
  } finally {
    // Salary must not linger in memory longer than the call needs.
    setPendingCtc(null);
  }
}
