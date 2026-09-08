import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'node:path';

// Midnight ledger ships as WASM (vite-plugin-wasm) and several SDK deps
// expect Node builtins (events/assert/buffer) that don't exist in browsers
// (nodePolyfills). isomorphic-ws's browser entry lacks the named WebSocket
// export the indexer provider imports, so it is aliased to the native one.
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    nodePolyfills({ include: ['events', 'assert', 'buffer', 'process'] }),
  ],
  define: { global: 'globalThis' },
  resolve: {
    alias: {
      'isomorphic-ws': path.resolve(__dirname, 'src/midnight/ws-shim.ts'),
    },
  },
  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
  build: { target: 'esnext' },
  server: { port: 5173 },
});
