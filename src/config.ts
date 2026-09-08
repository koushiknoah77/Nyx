// Single source of truth for the Preprod deployment the UI talks to.
// L1 deployed Preview (6880d0b1...); L2 targets Preprod per the challenge spec.
export const NETWORK_ID = 'preprod' as const;

export const PREPROD_CONTRACT_ADDRESS =
  'fd737b5c0f40cdc6fd052a2fbf74fff3e8c24b0ffdf20f19ab6f9b6dcea6b2cc';

// Fallbacks only: after connecting we prefer the wallet's own service config
// (getConfiguration), since the user may point Lace at custom infrastructure.
export const FALLBACK_INDEXER = 'https://indexer.preprod.midnight.network/api/v4/graphql';
export const FALLBACK_INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

export const PRIVATE_STATE_ID = 'counterPrivateState';

// Served by Vite/Vercel from public/zk/counter -> {keys,zkir} copied from managed/.
export const ZK_BASE_PATH = '/zk/counter';

// Privacy design (see CircuitCall): the increment is ALWAYS this value,
// generated locally, never typed in, never rendered. The UI proves without
// revealing the input - there is deliberately no input field.
export const FIXED_STEP = 1n;

// localStorage key for the owner's secret. Generated once per browser,
// never displayed anywhere in the UI.
export const SECRET_STORAGE_KEY = 'nyx-owner-secret';
