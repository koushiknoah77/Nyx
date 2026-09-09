import { CircuitCall } from '../CircuitCall';
import { PublicCounter } from '../PublicCounter';
import { Steps } from '../Steps';
import { WalletConnect } from '../WalletConnect';
import type { MidnightStatus } from '../../hooks/useMidnight';
import type { CounterView } from '../../midnight/providers';

interface Props {
  status: MidnightStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onClearError: () => void;
  connected: boolean;
  initialized: boolean | null;
  onViewChange: (v: boolean | null) => void;
  publicView: CounterView | null;
  publicLoading: boolean;
  publicError: string | null;
  onPublicRefresh: () => void;
}

/**
 * The Nyx counter — the seed contract the whole product grows out of.
 * Preserved verbatim as the L2 demo surface: connect → initialize → increment.
 */
export function CounterView({
  status,
  onConnect,
  onDisconnect,
  onClearError,
  connected,
  initialized,
  onViewChange,
  publicView,
  publicLoading,
  publicError,
  onPublicRefresh,
}: Props) {
  const connectedApi = status.kind === 'connected' ? status : null;
  return (
    <>
      <Steps
        connected={connected}
        initialized={connected ? initialized : (publicView?.initialized ?? null)}
      />

      {!connected && (
        <PublicCounter
          view={publicView}
          loading={publicLoading}
          error={publicError}
          onRefresh={onPublicRefresh}
        />
      )}

      <WalletConnect
        status={status}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onClearError={onClearError}
      />

      {connectedApi ? (
        <CircuitCall
          api={connectedApi.api}
          unshieldedAddress={connectedApi.unshieldedAddress}
          onViewChange={onViewChange}
        />
      ) : (
        <section className="card" aria-label="How to transact">
          <h2>Transact</h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            Viewing is public — the live total above needs no wallet. To move it,
            connect Lace (Preprod): initialize once to bind this browser as owner,
            then increment +1 with a local zero-knowledge proof.
          </p>
        </section>
      )}
    </>
  );
}
