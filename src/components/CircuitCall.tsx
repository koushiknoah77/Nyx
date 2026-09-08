import { useCallback, useEffect, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { CounterView } from '../midnight/providers';
import { buildProviders, callCircuit, readCounterState } from '../midnight/providers';
import { EXPLORER_URL, PREPROD_CONTRACT_ADDRESS } from '../config';
import { toHex, txIdOf } from '../midnight/wallet';
import { CopyButton } from './CopyButton';
import { PrivacyPanel } from './PrivacyPanel';

type Phase = 'idle' | 'proving' | 'done' | 'error';

interface Props {
  api: ConnectedAPI;
  unshieldedAddress: string;
  /** Lets the App journey indicator follow on-chain setup state. */
  onViewChange?: (initialized: boolean | null) => void;
}

interface ActivityEntry {
  id: number;
  time: string;
  circuit: 'init' | 'increment';
  txId: string;
}

let activitySeq = 0;

/**
 * Calls init/increment on the Preprod counter. Proofs generate locally via
 * the connected wallet. The secret is NEVER rendered here — this file holds
 * no secret material, only passes it into witnesses inside providers.ts.
 */
export function CircuitCall({ api, unshieldedAddress, onViewChange }: Props) {
  const [view, setView] = useState<CounterView | null>(null);
  const [reading, setReading] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const refresh = useCallback(async () => {
    setReading(true);
    try {
      const { providers } = await buildProviders(api, unshieldedAddress);
      const v = await readCounterState(
        providers.publicDataProvider as Parameters<typeof readCounterState>[0],
      );
      setView(v);
      onViewChange?.(v ? v.initialized : null);
    } catch {
      setView(null);
      onViewChange?.(null);
    } finally {
      setReading(false);
    }
  }, [api, unshieldedAddress, onViewChange]);

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
        const id = txIdOf(result);
        setTxId(id);
        setPhase('done');
        setActivity((prev) =>
          [
            {
              id: ++activitySeq,
              time: new Date().toLocaleTimeString(),
              circuit,
              txId: id,
            },
            ...prev,
          ].slice(0, 8),
        );
        // Indexer lags submission: re-read on a short retry schedule so the
        // on-chain result appears promptly; manual Refresh always available.
        for (const delay of [3000, 10000]) {
          window.setTimeout(() => void refresh(), delay);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setPhase('error');
      }
    },
    [api, unshieldedAddress, refresh],
  );

  const busy = phase === 'proving';
  const initialized = view?.initialized ?? false;

  return (
    <section className="card" aria-label="Counter circuits">
      <div className="row">
        <h2>{initialized ? '3 · Increment' : '2 · Initialize'}</h2>
        <span className="pill pre">Preprod</span>
      </div>

      <p className="label">Contract</p>
      <p className="addr small" title={PREPROD_CONTRACT_ADDRESS}>
        {PREPROD_CONTRACT_ADDRESS}
      </p>
      <div className="row" style={{ marginTop: '0.6rem' }}>
        <CopyButton text={PREPROD_CONTRACT_ADDRESS} label="Copy contract" />
        <a className="linkbtn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
          Explorer ↗
        </a>
      </div>

      {reading ? (
        <p className="muted">Reading on-chain state…</p>
      ) : view ? (
        <div className="countbox">
          <span className="count" key={view.count.toString()}>
            {view.count.toString()}
          </span>
          <span className="muted">
            {view.initialized ? 'current public total' : 'not initialized yet'}
          </span>
        </div>
      ) : (
        <p className="muted">Could not read state yet. Try Refresh.</p>
      )}

      {busy && (
        <div className="proving" role="status">
          <span className="spinner" aria-hidden />
          Generating proof locally in your wallet…
        </div>
      )}

      {!initialized ? (
        <button onClick={() => void run('init')} disabled={busy || reading}>
          {busy ? 'Generating proof locally…' : 'Initialize (bind this browser as owner)'}
        </button>
      ) : (
        <button onClick={() => void run('increment')} disabled={busy || !view}>
          {busy ? 'Generating proof locally…' : 'Increment +1'}
        </button>
      )}
      <button className="ghost" onClick={() => void refresh()} disabled={busy || reading}>
        Refresh
      </button>

      {phase === 'done' && txId && (
        <div className="ok" role="status">
          Submitted on-chain.
          <br />
          <span className="txhash">{txId}</span>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}>
            <CopyButton text={txId} label="Copy tx" />
            <a className="linkbtn" href={EXPLORER_URL} target="_blank" rel="noreferrer">
              Look up ↗
            </a>
          </div>
        </div>
      )}
      {phase === 'error' && error && (
        <div className="error" role="alert">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {activity.length > 0 && (
        <>
          <p className="label">This session</p>
          <ul className="activity">
            {activity.map((a) => (
              <li key={a.id}>
                <span className="op">{a.circuit === 'init' ? 'init' : '+1'}</span>
                <span className="tx" title={a.txId}>
                  {a.txId}
                </span>
                <time>{a.time}</time>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="prove">Proved without revealing your input</p>
      <PrivacyPanel />
      <p className="muted tiny">
        Owner commitment (public): {view ? `${toHex(view.owner).slice(0, 24)}…` : '—'}
      </p>
    </section>
  );
}
