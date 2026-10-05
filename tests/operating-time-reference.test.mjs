// Read-only public archive validation. No downloaded log files are saved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
vm.runInThisContext(fs.readFileSync(new URL('../modules/analysis/core.js', import.meta.url), 'utf8'));
vm.runInThisContext(fs.readFileSync(new URL('../operating-time.js', import.meta.url), 'utf8'));
const core = globalThis.SH6AnalysisCore;
for (const [call, expectedQsos, expectedRadios] of [['ef8r',12991,['0']],['cq9a',11520,['0','1']]]) {
  const response = await fetch(`https://raw.githubusercontent.com/s53zo/Hamradio-Contest-logs-Archives/main/CQWW/cw/2025/${call}.log`);
  assert.equal(response.ok, true);
  const parsed = core.parseLogFile(await response.text(), `${call}.log`);
  const derived = core.buildDerived(parsed.qsos, {}, {qtcs:parsed.qtcs || []});
  const before = JSON.stringify(parsed.qsos);
  const started = performance.now();
  const model = globalThis.SH6OperatingTime.build(parsed.qsos, derived.contestMeta);
  const durationMs = performance.now()-started;
  assert.equal(parsed.qsos.length, expectedQsos);
  assert.equal(model.elapsedMinutes,2880);
  assert.equal(model.rows.reduce((n,r)=>n+r.minutes,0),2880);
  assert.equal(model.operatorKind,'single');
  assert.ok(model.dualMinutes>0);
  assert.deepEqual([...new Set(model.periods.flatMap(p=>p.radios))].sort(),expectedRadios);
  assert.ok(model.periods.some(p=>p.start===model.start && p.bands.includes('20M') && p.bands.includes('40M')));
  assert.ok(model.dualMinutes<=model.rows.find(r=>r.role==='RUN').minutes);
  assert.equal(model.dualRow.minutes,model.dualMinutes);
  assert.equal(model.hours.reduce((n,h)=>n+h.DUAL,0),model.dualMinutes);
  if(call==='cq9a') assert.ok(model.sessions.some(s=>s.segments.includes(model.periods[0]) && s.segments.includes(model.periods[1])),'CQ9A initial band change should be one session');
  assert.equal(JSON.stringify(parsed.qsos),before,'time analysis must leave every parsed/scoring field unchanged');
  assert.ok(durationMs<5000,'time analysis should remain practical on 13k contacts');
  console.log(JSON.stringify({call,qsos:parsed.qsos.length,durationMs:Math.round(durationMs),minutes:Object.fromEntries(model.rows.map(r=>[r.role,r.minutes])),dualMinutes:model.dualMinutes,periods:model.periods.length,sessions:model.sessions.length,firstSession:{dual:model.sessions[0].minutes,span:model.sessions[0].spanMinutes,segments:model.sessions[0].segments.length},radios:expectedRadios}));
}
