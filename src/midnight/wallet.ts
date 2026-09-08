// Wallet discovery + local secrets. No private material is ever rendered
// by the UI; this module is the only place secrets exist (memory/localStorage).
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import '@midnight-ntwrk/dapp-connector-api';
import { SECRET_STORAGE_KEY } from '../config';

/** All injected Midnight wallets (keyed by UUID per CAIP-372, never a fixed name). */
export function listWallets(): InitialAPI[] {
  const injected = window.midnight as Record<string, InitialAPI> | undefined;
  return injected ? Object.values(injected) : [];
}

/** Prefer Lace when several wallets are present, else take the first one. */
export function selectWallet(): InitialAPI {
  const wallets = listWallets();
  if (wallets.length === 0) {
    throw new Error('No Midnight wallet found. Install the Lace wallet extension first.');
  }
  return wallets.find((w) => w.name.toLowerCase().includes('lace')) ?? wallets[0];
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * The owner's 32-byte secret. Generated once per browser and persisted to
 * localStorage. NEVER imported by any .tsx file for display - only passed
 * into circuit witnesses.
 */
export function getOwnerSecret(): Uint8Array {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  if (stored) return fromHex(stored);
  const fresh = crypto.getRandomValues(new Uint8Array(32));
  try {
    localStorage.setItem(SECRET_STORAGE_KEY, toHex(fresh));
  } catch {
    // Private browsing: keep it in memory for this session only.
  }
  return fresh;
}

export function isZeroBytes(v: Uint8Array): boolean {
  return v.every((b) => b === 0);
}

/** Best-effort extraction of a displayable id from a midnight-js call result. */
export function txIdOf(result: unknown): string {
  const o = result as {
    public?: { txId?: unknown; txHash?: unknown; identifiers?: unknown };
    txId?: unknown;
  };
  const cand =
    o?.public?.txId ?? o?.public?.txHash ?? o?.txId ??
    (Array.isArray(o?.public?.identifiers) ? o.public.identifiers[0] : undefined);
  return typeof cand === 'string' && cand.length > 0 ? cand : 'submitted (see Lace history)';
}
