// One-off CDP layout probe: finds elements wider than the viewport.
// Run: node scripts/cdp-width-probe.mjs "<url>" [width]
const url = process.argv[2];
const width = Number(process.argv[3] || 390);

const tab = await (
  await fetch(`http://localhost:9333/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height: 1200,
  deviceScaleFactor: 1,
  mobile: true,
});
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, 9000));

const expr = `(() => {
  const out = { innerWidth: window.innerWidth, docScrollWidth: document.documentElement.scrollWidth, offenders: [] };
  const all = document.querySelectorAll('body *');
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > window.innerWidth + 1 && r.left > -window.innerWidth) {
      let sel = el.tagName.toLowerCase();
      if (el.id) sel += '#' + el.id;
      if (el.className && typeof el.className === 'string') sel += '.' + el.className.split(' ').slice(0, 3).join('.');
      out.offenders.push({ sel, w: Math.round(r.width), left: Math.round(r.left), text: (el.textContent || '').trim().slice(0, 60) });
      if (out.offenders.length > 25) break;
    }
  }
  return JSON.stringify(out);
})()`;
const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
console.log(JSON.stringify(res.result?.result?.value ?? res, null, 1).slice(0, 4000));
const shot = await send('Page.captureScreenshot', { format: 'png' });
if (process.env.SHOT_PATH && shot.result?.data) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(process.env.SHOT_PATH, Buffer.from(shot.result.data, 'base64'));
  console.log('screenshot saved:', process.env.SHOT_PATH);
}
ws.close();
