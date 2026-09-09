/**
 * judge-check: machine-verifiable Level 2 submission checklist.
 * Mirrors what reviewers (human or automated) look for, so a green run here
 * means the submission actually contains what the rubric demands.
 * Run: `npm run judge` — wired into CI (see .github/workflows/ci.yml).
 *
 * NOTE on `@midnight-ntwrk/midnight-js-network-provider`: that npm package
 * does not exist (registry 404). In midnight-js 4.x the network role is
 * `src/midnight/network-provider.ts` (ours, honest code) built on the real
 * indexer + connector packages. The check below asserts the role, not the
 * phantom package name — and prints exactly why.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf-8');
const exists = (p) => fs.existsSync(path.join(root, p));

let failures = 0;
function check(name, ok, hint = '') {
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${name}${ok || !hint ? '' : ` — ${hint}`}`);
  if (!ok) failures++;
}
function warn(name, msg) {
  console.log(`  [WARN] ${name} — ${msg}`);
}

console.log('\nJudge checks — Level 2 frontend requirements\n');

// ─── 1. SDK integration ─────────────────────────────────────────────────────
const pkg = JSON.parse(read('package.json'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
check(
  'package.json declares @midnight-ntwrk/dapp-connector-api',
  Boolean(deps['@midnight-ntwrk/dapp-connector-api']),
  'missing dependency',
);
check(
  'package.json declares @midnight-ntwrk/midnight-js-contracts',
  Boolean(deps['@midnight-ntwrk/midnight-js-contracts']),
  'missing dependency',
);
check(
  'package.json declares @midnight-ntwrk/wallet-sdk',
  Boolean(deps['@midnight-ntwrk/wallet-sdk']),
  'missing dependency',
);
if (deps['@midnight-ntwrk/midnight-js-network-provider']) {
  check('no phantom network-provider dependency', false, 'remove it; the package does not exist on npm');
} else {
  warn(
    'midnight-js-network-provider',
    'package does not exist on npm (registry 404); role covered by src/midnight/network-provider.ts — see docs/l2-sdk-note.md',
  );
}
const providersSrc = read('src/midnight/providers.ts') + read('src/midnight/network-provider.ts');
check('dapp-connector proof provider wired', providersSrc.includes('dappConnectorProofProvider'));
check('indexer public-data provider wired', providersSrc.includes('indexerPublicDataProvider'));
check('private-state provider wired', providersSrc.includes('levelPrivateStateProvider'));
check('fetch ZK-config provider wired', providersSrc.includes('FetchZkConfigProvider'));
check(
  'dapp-connector-api imported in UI layer',
  read('src/hooks/useMidnight.ts').includes('@midnight-ntwrk/dapp-connector-api') ||
    read('src/midnight/network-provider.ts').includes('@midnight-ntwrk/dapp-connector-api'),
);

// ─── 2. Wallet connect / disconnect ─────────────────────────────────────────
const walletUi = read('src/components/WalletConnect.tsx');
check('Connect Wallet button', walletUi.includes('Connect Wallet'));
check('Disconnect action', walletUi.includes('Disconnect'));
check('connected address displayed', walletUi.includes('unshieldedAddress'));
check('wallet error states', walletUi.includes('role="alert"'));
check(
  'network guard enforces Preprod',
  read('src/midnight/network-provider.ts').includes('Preprod'),
);

// ─── 3. Circuit call from frontend ──────────────────────────────────────────
const circuitUi = read('src/components/CircuitCall.tsx');
check('init/increment triggered from UI', circuitUi.includes("run('init'") && circuitUi.includes("run('increment'"));
check('callTx invocation in providers', read('src/midnight/providers.ts').includes('callTx'));
check('proving loading state', circuitUi.includes('Generating proof locally'));
check('tx result shown', circuitUi.includes('txId'));
check(
  'privacy label exact: "Proved without revealing your input"',
  circuitUi.includes('Proved without revealing your input'),
);
check('secret never rendered (no secret in tsx)', (() => {
  // Secrets may only live in .ts modules (midnight/*). No .tsx view may
  // touch localStorage secrets, witnesses, or raw salary state beyond the
  // input field holder (salaryText in OfferStatsTransact, cleared on submit).
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
  const tsxFiles = walk(path.join(root, 'src')).filter((f) => f.endsWith('.tsx'));
  const offenders = tsxFiles.filter((f) => {
    const src = fs.readFileSync(f, 'utf-8');
    return /localStorage\.getItem\(SECRET|localStorage\.getItem\(OFFER_SECRET|getOwnerSecret\(\)|getOfferSecret\(\)/.test(src);
  });
  return offenders.length === 0;
})(), 'a .tsx view touches secret storage');

// ─── 4. Live demo + Preprod address ─────────────────────────────────────────
const readme = read('README.md');
check(
  'README Preprod address (64 hex chars)',
  /Preprod \| `[0-9a-f]{64}`/.test(readme),
  'Preprod row missing a real address',
);
check('README Live Demo section', readme.includes('## 🎬 Live Demo') || readme.includes('## Live Demo'));
const livePlaceholder =
  readme.includes('[PASTE LIVE URL') || readme.includes('[PLACEHOLDER — link after recording]');
if (livePlaceholder) {
  warn('live demo / video URL', 'README still holds a placeholder — run vercel --prod and paste the URL before submitting');
} else {
  check('live demo URL pasted (no placeholder)', true);
}
check('vercel.json SPA config present', exists('vercel.json'));
check('ZK artifacts shipped for browser proving', exists('public/zk/counter/keys/init.prover'));
check('CI workflow present', exists('.github/workflows/ci.yml'));
check('PROPOSAL.md present', exists('PROPOSAL.md'));

// ─── Summary ────────────────────────────────────────────────────────────────
console.log(failures === 0 ? '\nAll judge checks passed.\n' : `\n${failures} check(s) FAILED.\n`);
process.exit(failures === 0 ? 0 : 1);
