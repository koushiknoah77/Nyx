/**
 * Post-process Compact 0.34.x generated output for the stable deploy stack.
 *
 * Background: compiler 0.34 emits `async` circuit entry points, but the
 * stable Midnight.js stack (midnight-js-contracts 4.1.1 / compact-js 2.5.1)
 * invokes `initialState` synchronously — destructuring the returned Promise
 * yields `undefined` everywhere and deploy dies in `decodeZswapLocalState`.
 * Every `await` in the generated file awaits a synchronous value (internal
 * circuit impls and sync witness callbacks), so removing `async` + those
 * `await`s is semantics-preserving. `await` on the results elsewhere
 * (tests, tsx) keeps working — awaiting a non-promise is legal.
 *
 * Re-run automatically via `npm run compile`. Fails loudly if any `await`
 * survives, so a future compiler change can't silently break deploys.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const managedDir = process.argv[2] ?? path.join(process.cwd(), 'managed');
if (!fs.existsSync(managedDir)) {
  console.error(`syncify-managed: directory not found: ${managedDir}`);
  process.exit(1);
}

const rules = [
  [/async initialState\(/g, 'initialState('],
  [/async (_[A-Za-z0-9_]+)\(/g, '$1('],
  [/(\w+): async \(\.\.\./g, '$1: (...'],
  [/await (this\._[A-Za-z0-9_]+\()/g, '$1'],
];

let changed = 0;
for (const entry of fs.readdirSync(managedDir)) {
  const file = path.join(managedDir, entry, 'contract', 'index.js');
  if (!fs.existsSync(file)) continue;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  for (const [re, sub] of rules) src = src.replace(re, sub);
  if (/\bawait\b/.test(src)) {
    console.error(`syncify-managed: surviving 'await' in ${file} — aborting, compiler output changed shape`);
    process.exit(1);
  }
  if (src !== before) {
    fs.writeFileSync(file, src);
    changed++;
    console.log(`syncify-managed: stripped async from ${file}`);
  }
}
if (changed === 0) console.log('syncify-managed: nothing to change');
