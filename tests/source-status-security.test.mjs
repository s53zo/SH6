import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

createRequire(import.meta.url)('../modules/ui/source-status.js');
const { classifySource, isProxy } = globalThis.SH6SourceStatus;

test('expected HTTPS hosts keep their source badges and proxy classification', () => {
  for (const source of ['https://azure.s53m.com/spots', 'HTTPS://AZURE.S53M.COM/cors/cty.dat', 'https://azure.s53m.com:443/cors/MASTER.DTA']) {
    assert.deepEqual(classifySource(source), { mark: '✓', className: 'source-local' });
    assert.equal(isProxy(source), false);
  }
  for (const source of ['https://corsproxy.io/?https%3A%2F%2Fexample.org', 'https://api.allorigins.win/raw?url=https%3A%2F%2Fexample.org', 'https://CORSPROXY.IO:443/']) {
    assert.deepEqual(classifySource(source), { mark: '✓', className: 'source-proxy' });
    assert.equal(isProxy(source), true);
  }
});

test('relative, malformed and misleading sources cannot claim a remote badge', () => {
  for (const source of [
    '', null, undefined, 42, {}, 'cty.dat', './MASTER.DTA', '/corsproxy.io/cty.dat',
    '//azure.s53m.com/cty.dat', 'azure.s53m.com', 'https://', 'https://[broken',
    'https:azure.s53m.com', 'https:///azure.s53m.com',
    'http://azure.s53m.com/file', 'http://corsproxy.io/', 'file:///azure.s53m.com/file',
    'https://azure.s53m.com.attacker.invalid/file', 'https://evil-corsproxy.io/',
    'https://corsproxy.io.attacker.invalid/', 'https://allorigins.win/',
    'https://another.allorigins.win/', 'https://attacker.invalid/azure.s53m.com',
    'https://attacker.invalid/?source=corsproxy.io', 'https://attacker.invalid/#api.allorigins.win',
    'https://azure.s53m.com@attacker.invalid/', 'https://corsproxy.io@attacker.invalid/',
    'https://user:password@azure.s53m.com/', 'https://user@corsproxy.io/',
    'https://@azure.s53m.com/', 'https://azure.s53m.com\\@attacker.invalid/',
    'https://azure.s53m.\ncom/', 'https://\tazure.s53m.com/',
    'https://azure.s53m.com:8443/', 'https://api.allorigins.win:444/',
    'https://azure.s53m.com./'
  ]) {
    assert.deepEqual(classifySource(source), { mark: '', className: '' }, String(source));
    assert.equal(isProxy(source), false, String(source));
  }
});
