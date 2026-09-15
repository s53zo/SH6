import http from 'node:http';
import { readFile, mkdtemp, stat, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Real-clock CDP runner: virtual-time --dump-dom can outrun analysis workers.
const root = fileURLToPath(new URL('../', import.meta.url));
const chromePath = process.env.SH6_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = await mkdtemp(path.join(tmpdir(), 'sh6-multiplier-browser-'));
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = path.resolve(root, `.${pathname}`);
    if (!target.startsWith(root)) { response.writeHead(403).end(); return; }
    const file = (await stat(target)).isDirectory() ? path.join(target, 'index.html') : target;
    const type = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const page = process.env.SH6_UI_SMOKE_PAGE || 'multiplier-ui-smoke.html';
if (!/^[a-z0-9-]+\.html$/.test(page)) throw new Error('Invalid smoke page filename');
const url = `http://127.0.0.1:${server.address().port}/tests/${page}`;
const chrome = spawn(chromePath, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
let launchError;
chrome.on('error', (error) => { launchError = error; });
let socket;
try {
  let port;
  for (let i = 0; i < 100; i += 1) {
    if (launchError) throw launchError;
    try { port = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await pause(100); }
  }
  if (!port) throw new Error('Chrome debugging endpoint did not start');
  const tab = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then((r) => r.json());
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); }
  });
  const call = (method, params) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  const deadline = Date.now() + 120000;
  let result;
  while (Date.now() < deadline) {
    const evaluated = await call('Runtime.evaluate', { expression: `JSON.stringify({status:document.querySelector('#status')?.textContent,result:document.querySelector('#result')?.textContent})`, returnByValue: true });
    const value = JSON.parse(evaluated.result.value || '{}');
    if (['PASS', 'FAIL'].includes(value.status)) { result = { ...JSON.parse(value.result), passed: value.status === 'PASS' }; break; }
    await pause(200);
  }
  if (!result) throw new Error('UI regression timed out on the real clock');
  if (result.passed && process.env.SH6_UI_SCREENSHOT === '1') {
    await call('Emulation.setDeviceMetricsOverride', { width: 1450, height: 1100, deviceScaleFactor: 1, mobile: false });
    await call('Runtime.evaluate', { expression: `document.querySelector('#result').style.display='none';document.querySelector('#status').style.display='none';document.querySelector('#app').style.height='1080px'` });
    const screenshot = await call('Page.captureScreenshot', { format: 'png' });
    const output = path.join(profile, 'multiplier-ui.png');
    await writeFile(output, Buffer.from(screenshot.data, 'base64'));
    result.screenshot = output;
  }
  if (result.passed && process.env.SH6_UI_PRINT_ARTIFACTS === '1') {
    const output = path.join(root, 'tmp', 'pdfs', 'multiplier-qa');
    await mkdir(output, { recursive: true });
    const evaluated = await call('Runtime.evaluate', { expression: 'window.__SH6_PRINT_CASES__', returnByValue: true });
    const cases = evaluated.result.value;
    if (!Array.isArray(cases) || !cases.length) throw new Error('Print fixture did not supply export cases');
    result.artifacts = [];
    for (const entry of cases) {
      if (!/^[a-z0-9-]+$/.test(entry.name)) throw new Error('Invalid print fixture name');
      const tree = await call('Page.getFrameTree', {});
      await call('Page.setDocumentContent', { frameId: tree.frameTree.frame.id, html: entry.html });
      await call('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      const pdf = await call('Page.printToPDF', { printBackground: true, preferCSSPageSize: true });
      await writeFile(path.join(output, `${entry.name}.pdf`), Buffer.from(pdf.data, 'base64'));
      await writeFile(path.join(output, `${entry.name}.html`), entry.html);
      result.artifacts.push(path.join(output, `${entry.name}.pdf`));
    }
  }
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  console.error(error.stack || String(error)); process.exitCode = 1;
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
