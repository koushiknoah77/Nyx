import { useCallback, useEffect, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { CounterView } from '../midnight/providers';
import { buildProviders, callCircuit, readCounterState } from '../midnight/providers';
import { PREPROD_CONTRACT_ADDRESS } from '../config';
import { toHex, txIdOf } from '../midnight/wallet';

type Phase = 'idle' | 'reading' | 'proving' | 'done' | 'error';

interface Props {
  api: ConnectedAPI;
  unshieldedAddress: string;
}

/**
 * Calls init/increment on the Preprod counter. Proofs generate locally via
 * the connected wallet. The secret and the step are NEVER rendered here -
 * this file imports no secret material for display, only passes it into
 * witnesses inside providers.ts.
 */
export function CircuitCall({ api, unshieldedAddress }: Props) {
  const [view, setView] = useState<CounterView | null>(null);
  const [reading, setReading] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setReading(true);
    try {
      const { providers } = await buildProviders(api, unshieldedAddress);
      const v = await readCounterState(
        providers.publicDataProvider as Parameters<typeof readCounterState>[0],
      );
      setView(v);
    } catch {
      setView(null);
    } finally {
      setReading(false);
    }
  }, [api, unshieldedAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = useCallback(
    async (circuit: 'init' | 'increment') => {
      setPhase('proving');
      setError(null);
      setTxId(null);
      try {
        const { providers } = await buildProviders(api, unshieldedAddress);
        const result = await callCircuit(providers, circuit);
        setTxId(txIdOf(result));
        setPhase('done');
        // Indexer lags submission: re-read after a beat, plus manual Refresh.
        window.setTimeout(() => void refresh(), 10000);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setPhase('error');
      }
    },
    [api, unshieldedAddress, refresh],
  );

  const busy = phase === 'proving';

  return (
    <section className="card">
      <div className="row">
        <h2>Counter</h2>
        <span className="pill pre">Preprod</span>
      </div>

      <p className="label">Contract</p>
      <p className="addr small" title={PREPROD_CONTRACT_ADDRESS}>
        {PREPROD_CONTRACT_ADDRESS}
      </p>

      {reading ? (
        <p className="muted">Reading on-chain state…</p>
      ) : view ? (
        <div className="countbox">
          <span className="count">{view.count.toString()}</span>
          <span className="muted">
            {view.initialized ? 'current public total' : 'not initialized yet'}
          </span>
        </div>
      ) : (
        <p className="muted">Could not read state yet. Try Refresh.</p>
      )}

      {view && !view.initialized ? (
        <button onClick={() => void run('init')} disabled={busy}>
          {busy ? 'Generating proof locally…' : 'Initialize (bind this browser as owner)'}
        </button>
      ) : (
        <button onClick={() => void run('increment')} disabled={busy || !view}>
          {busy ? 'Generating proof locally…' : 'Increment +1 (private step)'}
        </button>
      )}
      <button className="ghost" onClick={() => void refresh()} disabled={busy || reading}>
        Refresh
      </button>

      {phase === 'done' && txId && (
        <p className="ok">
          Submitted on-chain. Tx: <span className="addr small">{txId}</span>
        </p>
      )}
      {phase === 'error' && error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      <p className="prove">Proved without revealing your input</p>
      <p className="muted tiny">
        Owner commitment (public):{' '}
        {view ? `${toHex(view.owner).slice(0, 24)}…` : '—'}
      </p>
    </section>
  );
}
