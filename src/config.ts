// Single source of truth for the Preprod deployment the UI talks to.
// L1 deployed Preview (6880d0b1...); L2 targets Preprod per the challenge spec.
// Preprod redeployed 2026-09-08 for the init-guard fix (initialized flag).
export const NETWORK_ID = 'preprod' as const;

export const PREPROD_CONTRACT_ADDRESS =
  'e15e39e7384dacd94089c6b5350094db636b3a238969d5da1793bfc445779890';

// Fallbacks only: after connecting we prefer the wallet's own service config
// (getConfiguration), since the user may point Lace at custom infrastructure.
export const FALLBACK_INDEXER = 'https://indexer.preprod.midnight.network/api/v4/graphql';
export const FALLBACK_INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

export const PRIVATE_STATE_ID = 'counterPrivateState';

// Served by Vite/Vercel from public/zk/counter -> {keys,zkir} copied from managed/.
export const ZK_BASE_PATH = '/zk/counter';

// Community explorer (TexLabs) for Preprod. Deep item URLs are not stable,
// so the UI links to the explorer home with a paste-your-hash hint.
export const EXPLORER_URL = 'https://preprod.midnightexplorer.com/';

// localStorage key for the owner's secret. Generated once per browser,
// never displayed anywhere in the UI.
export const SECRET_STORAGE_KEY = 'nyx-owner-secret';
