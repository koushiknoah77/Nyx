import { useCallback, useState } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { OFFERSTATS_CAPACITY } from '../config';
import {
  BRACKET_META,
  bracketForSalary,
  buildOfferStatsProviders,
  formatINR,
  initOfferStatsBatch,
  recordOffer,
  type BracketIndex,
  type OfferStatsView,
} from '../midnight/offerstats';
import { txIdOf } from '../midnight/wallet';
import { CopyButton } from './CopyButton';

interface Props {
  api: ConnectedAPI;
  unshieldedAddress: string;
  view: OfferStatsView | null;
  onChanged: () => void;
  /** Fired after a successful record so the parent can mint the flex badge. */
  onRecorded?: (txId: string, bracket: BracketIndex) => void;
}

type Phase = 'idle' | 'proving' | 'done' | 'error';

const MAX_SALARY = 100_000_000n; // ₹10Cr sanity cap for the input field

/**
 * Placement-cell init + senior record flow. The salary input is held in
 * component state only (never localStorage, never rendered back after
 * submit) and is cleared the moment the proof call resolves.
 */
export function OfferStatsTransact({ api, unshieldedAddress, view, onChanged, onRecorded }: Props) {
  const [batchSize, setBatchSize] = useState(String(OFFERSTATS_CAPACITY));
  const [salaryText, setSalaryText] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = phase === 'proving';
  const initialized = view?.initialized ?? false;
  const batchFull = view != null && view.total >= BigInt(OFFERSTATS_CAPACITY);

  const parsedSalary = /^\d+$/.test(salaryText.trim()) ? BigInt(salaryText.trim()) : null;
  const salaryValid = parsedSalary != null && parsedSalary > 0n && parsedSalary <= MAX_SALARY;
  const derivedBracket = salaryValid && parsedSalary != null ? bracketForSalary(parsedSalary) : null;

  const runInit = useCallback(async () => {
    const size = /^\d+$/.test(batchSize.trim()) ? BigInt(batchSize.trim()) : 0n;
    if (size <= 0n || size > BigInt(OFFERSTATS_CAPACITY)) {
      setError(`Batch size must be 1–${OFFERSTATS_CAPACITY} (v1 holds one pilot batch of 32).`);
      setPhase('error');
      return;
    }
    setPhase('proving');
    setError(null);
    setTxId(null);
    try {
      const { providers } = await buildOfferStatsProviders(api, unshieldedAddress);
      const result = await initOfferStatsBatch(providers, size);
      setTxId(txIdOf(result));
      setPhase('done');
      window.setTimeout(() => onChanged(), 3000);
      window.setTimeout(() => onChanged(), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }, [api, unshieldedAddress, batchSize, onChanged]);

  const runRecord = useCallback(async () => {
    if (!salaryValid || parsedSalary == null || derivedBracket == null) return;
    setPhase('proving');
    setError(null);
    setTxId(null);
    try {
      const { providers } = await buildOfferStatsProviders(api, unshieldedAddress);
      const result = await recordOffer(providers, derivedBracket, parsedSalary);
      setTxId(txIdOf(result));
      setPhase('done');
      setSalaryText(''); // salary must not linger in the field after proving
      onRecorded?.(txIdOf(result), derivedBracket);
      window.setTimeout(() => onChanged(), 3000);
      window.setTimeout(() => onChanged(), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }, [api, unshieldedAddress, salaryValid, parsedSalary, derivedBracket, onChanged, onRecorded]);

  if (!initialized) {
    return (
      <section className="card" aria-label="Initialize placement batch">
        <div className="row">
          <h2>1 · Start the batch</h2>
          <span className="pill pre">Placement cell</span>
        </div>
        <p className="muted">
          Publish the batch size on-chain. No secrets involved — this just opens counting
          for one pilot batch (max {OFFERSTATS_CAPACITY} offers).
        </p>
        <label className="label" htmlFor="batch-size">Students in this batch</label>
        <input
          id="batch-size"
          className="field"
          inputMode="numeric"
          value={batchSize}
          onChange={(e) => setBatchSize(e.target.value)}
          placeholder="32"
        />
        <div>
          <button onClick={() => void runInit()} disabled={busy}>
            {busy ? 'Generating proof locally…' : 'Initialize batch'}
          </button>
        </div>
        {phase === 'done' && txId && (
          <div className="ok" role="status">
            Batch opened on-chain.<br />
            <span className="txhash">{txId}</span>
            <div style={{ marginTop: '0.5rem' }}>
              <CopyButton text={txId} label="Copy tx" />
            </div>
          </div>
        )}
        {phase === 'error' && error && (
          <div className="error" role="alert">
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="card" aria-label="Count your offer">
      <div className="row">
        <h2>2 · Count your offer</h2>
        <span className="pill pre">
          {view ? `${view.total.toString()}/${OFFERSTATS_CAPACITY} counted` : 'Preprod'}
        </span>
      </div>

      {batchFull ? (
        <p className="muted">This batch is full — all {OFFERSTATS_CAPACITY} slots are counted.</p>
      ) : (
        <>
          <p className="muted">
            Type your exact CTC. The app proves it falls in a public bracket — the number
            itself never leaves this browser except inside your zero-knowledge proof.
          </p>
          <label className="label" htmlFor="ctc">Your CTC (₹ per annum, digits only)</label>
          <input
            id="ctc"
            className="field"
            inputMode="numeric"
            autoComplete="off"
            value={salaryText}
            onChange={(e) => setSalaryText(e.target.value)}
            placeholder="750000"
          />
          {salaryText.trim() !== '' && !salaryValid && (
            <p className="error" role="alert" style={{ marginTop: '0.6rem' }}>
              Enter a whole number between 1 and {formatINR(MAX_SALARY)}.
            </p>
          )}
          {derivedBracket != null && (
            <p className="muted" style={{ marginBottom: 0 }}>
              → counts toward <strong>{BRACKET_META[derivedBracket].label}</strong> (public).
              Your exact figure stays private.
            </p>
          )}
          <div>
            <button onClick={() => void runRecord()} disabled={busy || !salaryValid}>
              {busy ? 'Generating proof locally…' : 'Prove & count my offer'}
            </button>
          </div>
        </>
      )}

      {busy && (
        <div className="proving" role="status">
          <span className="spinner" aria-hidden />
          Generating proof locally in your wallet…
        </div>
      )}
      {phase === 'done' && txId && (
        <div className="ok" role="status">
          Counted on-chain — one offer, one count.
          <br />
          <span className="txhash">{txId}</span>
          <div style={{ marginTop: '0.5rem' }}>
            <CopyButton text={txId} label="Copy tx" />
          </div>
        </div>
      )}
      {phase === 'error' && error && (
        <div className="error" role="alert">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      <p className="prove">Proved without revealing your input</p>
    </section>
  );
}
