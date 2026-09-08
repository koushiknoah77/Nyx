// Browser shim for 'isomorphic-ws': the indexer's named WebSocket import does
// not exist on isomorphic-ws/browser.js, but browsers already have a native
// WebSocket global. Aliased in vite.config.ts.
const NativeWebSocket = globalThis.WebSocket;

export { NativeWebSocket as WebSocket };
export default NativeWebSocket;
