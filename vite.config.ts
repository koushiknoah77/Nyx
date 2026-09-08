import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// Midnight ledger ships as WASM: the wasm + top-level-await plugins are
// required for the compact-runtime / ledger imports to load in the browser.
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  define: { global: 'globalThis' },
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()],
  },
  build: { target: 'esnext' },
  server: { port: 5173 },
});
