import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
for(const path of ['modules/audit/profiles.js','modules/audit/evidence.js','modules/audit/band-changes.js','modules/audit/view.js','cqww-ms-audit.js']) vm.runInThisContext(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const api=globalThis.SH6OperatingAudit,registry=globalThis.SH6OperatingAuditProfiles;
const epoch=Date.UTC(2026,0,1),source='START-OF-LOG: 3.0\n';
const q=(minute,band='20M',id='0',extra={})=>({ts:epoch+minute*60000,band,mode:'SSB',txId:id,call:'T'+minute,...extra});
const meta=(family='WW',tx='TWO',mode='SSB')=>({contestId:`CQ-${family}-${mode}`,categoryOperator:'MULTI-OP',categoryTransmitter:tx});
const build=(qs,m=meta(),raw=source)=>api.build(qs,m,raw);
const series=(changes,id='0',offset=0)=>Array.from({length:changes+1},(_,i)=>q(offset+i*2,i%2?'40M':'20M',id));
const hour=(m,id='0',start=0)=>m.hours.find(row=>row.id===id && row.hour===epoch/60000+start);
assert.equal(registry.profiles.length,4);
assert.equal(api,globalThis.SH6CqwwMsAudit,'public compatibility alias');
for(const missing of ['profiles','evidence','band-changes','view']) {
 const sandbox={};vm.createContext(sandbox);
 for(const path of ['profiles','evidence','band-changes','view'].filter(name=>name!==missing)) vm.runInContext(fs.readFileSync(new URL('../modules/audit/'+path+'.js',import.meta.url),'utf8'),sandbox);
 vm.runInContext(fs.readFileSync(new URL('../cqww-ms-audit.js',import.meta.url),'utf8'),sandbox);
 assert.equal(sandbox.SH6CqwwMsAudit,undefined,`missing ${missing} leaves unrelated app startup safe`);
}
for(const family of ['WW','WPX']) for(const tx of ['ONE','TWO']) for(const mode of ['CW','SSB']) {
 const p=registry.resolve(meta(family,tx,mode),2026);assert.ok(p);assert.ok(p.sources.every(s=>s.startsWith('https://')));
 assert.equal(registry.resolve(meta(family,tx,mode),2025),null);
 assert.equal(registry.resolve(meta(family,tx,mode),2027),null);
}
for(const m of [meta('WW','UNLIMITED'),{...meta(),categoryOperator:'SINGLE-OP'},meta('WW','TWO','RTTY'),meta('WPX','TWO','RTTY'),{...meta(),categoryStation:'DISTRIBUTED'},meta('IARU')]) assert.equal(api.applicable(m),false);
for(const [category,expected] of [['M/S','M/S'],['M/2','M/2'],['MULTI-ONE ALL HIGH','M/S'],['MULTI-TWO ALL HIGH','M/2']]) assert.equal(registry.identify({...meta(),categoryOperator:category,categoryTransmitter:''}).category,expected);
assert.equal(registry.identify({...meta(),categoryOperator:'MULTI-ONE'}),null,'conflicting category is not guessed');
for(const family of ['WW','WPX']) {
 for(const n of [0,1,2,8,9]) {
  const m=build(series(n),meta(family));assert.equal(hour(m).count,n);
  assert.equal(hour(m).status,n>8?'Over limit':n===8?'At limit':'Within logged limit');
  assert.equal(m.findings.filter(f=>f.kind==='Changes').length,n>8?1:0);
  if(n>8) {assert.equal(m.findings[0].index,9);assert.equal(m.findings[0].priorIndex,8);assert.equal(m.findings[0].minimum,false);}
 }
 const independent=build([...series(9),...series(8,'1')],meta(family));
 assert.equal(hour(independent,'0').count,9);assert.equal(hour(independent,'1').count,8);
 assert.equal(hour(independent,'1').status,'At limit');
 assert.equal(independent.findings.filter(f=>f.kind==='Changes').length,1);
 const noCountry=build(series(9).map(({country,cqZone,...rest})=>rest),meta(family));assert.equal(hour(noCountry).count,9);
}
for(const n of [0,1,2,10,11]) {
 const m=build(series(n).map(e=>({...e,txId:''})),meta('WPX','ONE'));
 assert.equal(hour(m,'station').count,n);assert.equal(m.findings.filter(f=>f.kind==='Data').length,0,'WPX M/S needs no stream ID');
 assert.equal(hour(m,'station').status,n>10?'Over limit':n===10?'At limit':'Within logged limit');
 assert.equal(m.findings.filter(f=>f.kind==='Changes').length,n>10?1:0);
}
const station=build([q(0,'20M','0'),q(1,'40M','1'),q(2,'20M','0')],meta('WPX','ONE'));
assert.equal(hour(station,'station').count,2,'station-wide, not physical-radio counters');
for(const m of [meta(),meta('WPX'),meta('WPX','ONE')]) {
 const id=m.categoryTransmitter==='ONE'?'station':'0';
 const boundary=build([q(59),q(60,'40M'),q(70,'20M'),q(119,'15M'),q(120,'10M')],m);
 assert.equal(hour(boundary,id).count,0);assert.equal(hour(boundary,id,60).count,3);assert.equal(hour(boundary,id,120).count,1);
 const midnight=build([q(1439),q(1440,'40M'),q(1441,'20M')],m);assert.equal(hour(midnight,id,1440).count,2);
 const duplicates=build([q(0),q(1,'20M','0',{isDupe:true}),q(2,'40M','0',{isDupe:true}),q(3,'20M')],m);assert.equal(hour(duplicates,id).count,2);
 const list=series(9).reverse(),before=JSON.stringify(list),sorted=build(list,m);assert.equal(JSON.stringify(list),before);assert.equal(hour(sorted,id).count,9);
 const ambiguous=build([q(0),q(1,'20M'),q(1,'40M'),q(2,'20M')],m);
 assert.equal(hour(ambiguous,id).count,2);assert.equal(hour(ambiguous,id).status,'Uncertain');assert.equal(ambiguous.status,'Partial');
 const permuted=build([q(0),q(1,'40M'),q(1,'20M'),q(2,'20M')],m);assert.equal(hour(permuted,id).count,2,'do not use line order inside one minute');
 const raw=source+'X-QSO: 14000 PH 2026-01-01 0059 TEST 59 15 X1AA 59 5 0\n';
 const excluded=build([q(59),q(60,'40M')],m,raw);
 assert.equal(hour(excluded,id,60).count,0,'unknown outgoing band cannot manufacture a boundary change');
 assert.equal(hour(excluded,id,60).status,'Uncertain');assert.equal(excluded.xCount,1);
 const malformed=build([q(0),q(1,'bad-band'),q(2,'40M')],m);assert.ok(malformed.findings.some(f=>f.kind==='Data'));assert.equal(hour(malformed,id).status,'Uncertain');
 const badtime=build([q(0),q(1,'40M','0',{raw:{QSO_DATE:'2026-01-01',TIME_ON:'2500'}}),q(2,'40M')],m);assert.ok(badtime.findings.some(f=>f.kind==='Data'));assert.equal(hour(badtime,id).status,'Uncertain');
 const missing=build([q(0),q(1,'40M','0',{ts:null}),q(60,'40M')],m);assert.equal(hour(missing,id,60).count,0);assert.equal(hour(missing,id,60).status,'Uncertain');
 const rawSkipped=build([q(0),q(60,'40M')],m,source+'QSO: broken\nQSO: broken\nQSO: skipped\n');assert.equal(rawSkipped.unparsed,1);assert.equal(hour(rawSkipped,id,60).status,'Uncertain');
}
for(const family of ['WW','WPX']) {
 const missing=build([q(0),q(1,'40M',''),q(2,'40M')],meta(family));assert.ok(missing.findings.some(f=>f.kind==='Data'));assert.equal(hour(missing).status,'Uncertain');
 const malformed=build([q(0),q(1,'40M','R1'),q(2,'40M')],meta(family));assert.equal(hour(malformed).status,'Uncertain');
 const physical=build(series(9),meta(family),'ADIF export');assert.equal(physical.checked,false);
}
assert.equal(build(series(11),meta('WPX','ONE'),'ADIF export').checked,true,'station-wide check does not mistake radios for streams');
const old=build([q(0,'20M','0',{ts:Date.UTC(2025,0,1)})]);assert.equal(old.checked,false);assert.match(api.render(old),/Unsupported edition/);
assert.equal(build([q(0,'20M','0',{ts:null})]).status,'Insufficient evidence');
const uncertainExcess=build([q(0),q(1,'40M'),q(1,'20M'),q(1,'40M'),q(1,'20M'),...Array.from({length:9},(_,i)=>q(i+2,i%2?'20M':'40M'))]);
assert.ok(uncertainExcess.findings.some(f=>f.kind==='Changes' && f.minimum && /exact first excess contact may be earlier/.test(f.detail)));
const badMode=build([q(0,'20M','0',{mode:'RTTY'})]);assert.ok(badMode.findings.some(f=>f.kind==='Data'));
const m=build(series(9));const html=api.render(m,series(9),'B');
assert.match(html,/CQ-WW-SSB.*2026.*M\/2/);assert.match(html,/8 band changes/);assert.match(html,/Over limit/);assert.match(html,/Hour sequence/);assert.match(html,/data-slot="B" data-index="9"/);
assert.doesNotMatch(html,/MULT \(1\)|Same-minute band-order warning|Different bands share the same minute|MULT contact on the observed RUN/);
// Exhaustive tiny permutations independently verify lower-bound DP against
// actual sequences, including repeated bands and ambiguous preceding bands.
function permutations(items) {if(!items.length)return [[]];return items.flatMap((item,i)=>permutations(items.filter((_,j)=>i!==j)).map(rest=>[item,...rest]));}
for(const items of [['20M','40M'],['20M','20M','40M'],['20M','40M','15M'],['20M','40M','20M','15M']]) {
 for(const prior of [null,'20M','40M','10M']) for(const end of [...new Set(items)]) {
  const actual=Math.min(...permutations(items).filter(seq=>seq.at(-1)===end).map(seq=>{let cost=0,previous=prior;for(const b of seq){if(previous!=null && previous!==b)cost++;previous=b;}return cost;}));
  assert.equal(globalThis.SH6OperatingAuditChanges.minimumStep(prior,[...new Set(items)],end),actual);
 }
}
console.log('All four operating-audit profiles, lower bounds, boundaries and compatibility: PASS');
