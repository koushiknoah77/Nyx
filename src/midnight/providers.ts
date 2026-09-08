// Browser-side Midnight providers: wallet (Lace) for balance/submit,
// wallet-delegated proving, fetch-based ZK artifacts, Preprod indexer.
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { ContractState, ledger as readLedger } from '@midnight-ntwrk/compact-runtime';
import {
  FALLBACK_INDEXER,
  FALLBACK_INDEXER_WS,
  FIXED_STEP,
  NETWORK_ID,
  PREPROD_CONTRACT_ADDRESS,
  PRIVATE_STATE_ID,
  ZK_BASE_PATH,
} from '../config';
import { fromHex, getOwnerSecret, isZeroBytes, toHex } from './wallet';

export interface CounterView {
  count: bigint;
  owner: Uint8Array;
  /** False until init() binds an owner commitment. */
  initialized: boolean;
}

let compiledCache: unknown = null;

/** Compiled counter with LOCAL witnesses. Dummy values are never used here:
 * userSecret comes from this browser's localStorage, step is always FIXED_STEP.
 * Neither value is ever rendered in the UI. */
export async function getCompiledContract(): Promise<never> {
  if (compiledCache) return compiledCache as never;
  const mod = await import('../../managed/counter/contract/index.js');
  const witnesses = {
    userSecret: ({ privateState }: { privateState: unknown }) =>
      [privateState, getOwnerSecret()] as [unknown, Uint8Array],
    secretStep: ({ privateState }: { privateState: unknown }) =>
      [privateState, FIXED_STEP] as [unknown, bigint],
  };
  compiledCache = CompiledContract.make('counter', mod.Contract).pipe(
    CompiledContract.withWitnesses(witnesses as never),
    // Inert in the browser (the fetch provider below serves the artifacts);
    // kept so the CompiledContract type resolves fully.
    CompiledContract.withCompiledFileAssets(ZK_BASE_PATH as never),
  );
  return compiledCache as never;
}

export interface NyxProviders {
  providers: {
    privateStateProvider: unknown;
    publicDataProvider: unknown;
    zkConfigProvider: unknown;
    proofProvider: unknown;
    walletProvider: unknown;
    midnightProvider: unknown;
  };
}

/** Assemble the six midnight-js providers from a connected Lace wallet. */
export async function buildProviders(
  api: ConnectedAPI,
  unshieldedAddress: string,
): Promise<NyxProviders> {
  setNetworkId(NETWORK_ID);

  const shields = await api.getShieldedAddresses();
  const svc = await api.getConfiguration().catch(() => null);
  const indexer = svc?.indexerUri ?? FALLBACK_INDEXER;
  const indexerWS = svc?.indexerWsUri ?? FALLBACK_INDEXER_WS;

  // ZK artifacts are served by the app itself (public/zk/counter).
  // window.fetch is passed explicitly: bundlers may otherwise resolve the
  // default cross-fetch to its Node build and fail opaquely.
  const zkConfigProvider = new FetchZkConfigProvider(
    `${window.location.origin}${ZK_BASE_PATH}`,
    window.fetch.bind(window),
  );
  // Proving is delegated to the connected wallet (local proving).
  const proofProvider = await dappConnectorProofProvider(
    api,
    zkConfigProvider,
    ledger.CostModel.initialCostModel(),
  );

  // Hex bridge: midnight-js transactions <-> connector hex-string API.
  const walletProvider = {
    getCoinPublicKey: () => shields.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shields.shieldedEncryptionPublicKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    balanceTx: async (tx: any) => {
      const { tx: balancedHex } = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
      return ledger.Transaction.deserialize(
        'signature',
        'proof',
        'pre-binding',
        fromHex(balancedHex),
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submitTx: async (tx: any) => {
      const [txId] = tx.identifiers() as string[];
      await api.submitTransaction(toHex(tx.serialize()));
      return txId;
    },
  };

  return {
    providers: {
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: 'nyx-counter-state',
        accountId: unshieldedAddress,
        privateStoragePasswordProvider: () => 'Nyx-Local-Placeholder-Password-1',
      }),
      publicDataProvider: indexerPublicDataProvider(indexer, indexerWS),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider: { submitTx: walletProvider.submitTx },
    },
  };
}

/** Read + decode the public counter state. Returns null when unreadable. */
export async function readCounterState(
  publicDataProvider: {
    queryContractState(address: string): Promise<{ serialize(): Uint8Array } | null>;
  },
): Promise<CounterView | null> {
  try {
    const onchain = await publicDataProvider.queryContractState(PREPROD_CONTRACT_ADDRESS);
    if (!onchain) return null;
    // Round-trip through bytes: the indexer returns the ledger-v8 class while
    // the generated ledger() reader expects the compact-runtime class. Same
    // ledger-8 binary format, so deserialize-then-read is safe.
    const compact = ContractState.deserialize(onchain.serialize());
    const view = readLedger(compact.data);
    return { count: view.count, owner: view.owner, initialized: !isZeroBytes(view.owner) };
  } catch {
    return null;
  }
}

/** Join the deployed Preprod contract and call init or increment. */
export async function callCircuit(
  providers: NyxProviders['providers'],
  circuit: 'init' | 'increment',
): Promise<unknown> {
  const compiled = await getCompiledContract();
  const found = (await findDeployedContract(providers as never, {
    contractAddress: PREPROD_CONTRACT_ADDRESS,
    compiledContract: compiled,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  } as never)) as {
    callTx: Record<'init' | 'increment', () => Promise<unknown>>;
  };
  return found.callTx[circuit]();
}
