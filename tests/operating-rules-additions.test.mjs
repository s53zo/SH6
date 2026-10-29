import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
for(const path of ['modules/audit/profiles.js','modules/audit/evidence.js','modules/audit/band-changes.js','modules/audit/view.js','cqww-ms-audit.js']) vm.runInThisContext(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const api=globalThis.SH6OperatingAudit,registry=globalThis.SH6OperatingAuditProfiles;
const meta=(family,category='M/S',mode='RTTY')=>family==='EUHFC'
 ?{contestId:'EU-HF',categoryOperator:'SINGLE-OP',categoryMode:mode,categoryBand:'ALL',categoryPower:'HIGH'}
 :{contestId:family==='ARRLDX'?`ARRL-DX-${mode}`:`CQ-${family==='WWRTTY'?'WW':'WPX'}-RTTY`,categoryOperator:'MULTI-OP',categoryTransmitter:category==='M/S'?'ONE':'TWO'};
const source='START-OF-LOG: 3.0\n';
const q=(minute,band='20M',mode='RTTY',id='0',year=2026)=>({ts:Date.UTC(year,0,1)+minute*60000,band,mode,txId:id,call:'K1AA'});
const series=(n,mode='RTTY',id='0',year=2026)=>Array.from({length:n+1},(_,i)=>q(i*2,i%2?'40M':'20M',mode,id,year));
const build=(qs,m,raw=source)=>api.build(qs,m,raw);
const count=(m,id)=>m.hours.find(h=>h.id===id)?.count;
for(let year=2007;year<=2026;year++) for(const family of ['WWRTTY','WPXRTTY']) for(const category of ['M/S','M/2']) {
 const limit=year<2009?6:family==='WWRTTY'?8:year<2011?8:category==='M/S' || year===2011?10:8;
 const entry=meta(family,category),profile=registry.resolve(entry,year);
 assert.equal(profile.limit,limit,`${family} ${category} ${year}`);
 const id=profile.perStream?'0':'station';
 for(const n of [limit,limit+1]) {
  const qs=series(n,'RY','0',year),original=JSON.stringify(qs),m=build(qs,entry);
  assert.equal(count(m,id),n);assert.equal(JSON.stringify(qs),original);
  assert.equal(m.hours[0].status,n===limit?'At limit':'Over limit');
  const html=api.render(m,qs,'C');assert.ok(html.includes(`${year} official rules`));assert.ok(html.includes(profile.sources[0]));
  if(profile.signalRoles) assert.match(html,/RUN \(0\)/);
 }
 if(profile.perStream) {
  const m=build([...series(limit+1,'RTTY','0',year),...series(limit,'RTTY','1',year)],entry);
  assert.equal(count(m,'0'),limit+1);assert.equal(count(m,'1'),limit);
  assert.equal(m.findings.filter(f=>f.kind==='Changes').length,1);
 }
}
for(const family of ['WWRTTY','WPXRTTY']) {
 const entry=meta(family),qs=[q(59),q(60,'40M')],m=build(qs,entry);
 assert.equal(m.hours.find(h=>h.hour===Date.UTC(2026,0,1,1)/60000).count,1);
 assert.ok(build([q(0,'160M')],entry).findings.some(f=>f.kind==='Data'));
 assert.ok(build([q(0,'20M','FT8')],entry).findings.some(f=>f.kind==='Data'));
 assert.equal(build(qs,entry,'ADIF').checked,family==='WPXRTTY','no physical radio to functional signal guessing');
 assert.equal(registry.resolve(entry,2006),null);assert.equal(registry.resolve(entry,2027),null);
 const invalid=build([q(0),q(1,'40M','RTTY',''),q(2,'40M')],meta(family,'M/2'));
 assert.ok(invalid.findings.some(f=>f.kind==='Data'));assert.equal(invalid.hours[0].status,'Uncertain');
}
assert.match(build(series(11,'RTTY','0',2011),meta('WPXRTTY','M/2')).notices.join(' '),/2011.*10 changes/);
// Mode and band changes are joint transitions, including when both change.
for(const mode of ['CW','SSB','MIXED']) {
 const entry=meta('EUHFC','SO',mode);
 assert.equal(registry.resolve(entry,2026).countMode,mode==='MIXED');
 for(const n of [10,11]) {
  const qs=series(n,mode==='MIXED'?'CW':mode).map((e,i)=>({...e,mode:mode==='MIXED'?(i%2?'PH':'CW'):mode}));
  const m=build(qs,entry);assert.equal(count(m,'station'),n,'joint band/mode change is one, not two');
  assert.equal(m.findings.filter(f=>f.kind==='Changes').length,n===10?0:1);
 }
}
const mixed=meta('EUHFC','SO','MIXED');
assert.equal(count(build([q(0,'20M','CW'),q(1,'20M','SSB'),q(2,'40M','CW')],mixed),'station'),2);
assert.equal(count(build([q(0,'20M','PH'),q(1,'20M','PHONE')],mixed),'station'),0,'phone aliases are one mode');
const boundary=build([q(59,'20M','CW'),q(60,'40M','SSB')],mixed);
assert.equal(boundary.hours[1].count,1,'joint change attributed to destination clock hour');
const ambiguous=build([q(0,'20M','CW'),q(1,'20M','CW'),q(1,'20M','SSB'),q(2,'40M','CW')],mixed);
assert.equal(count(ambiguous,'station'),2);assert.equal(ambiguous.status,'Partial');
assert.equal(count(build([q(0,'20M','CW'),q(1,'20M','SSB'),q(1,'20M','CW'),q(2,'40M','CW')],mixed),'station'),2,'same-minute line order irrelevant');
assert.equal(build([q(0)],{...mixed,categoryMode:''}).status,'Insufficient evidence');
assert.equal(api.applicable({...mixed,categoryOperator:'SINGLE-OP-UNLIMITED'}),false);
assert.equal(api.applicable({...mixed,categoryOperator:'MULTI-OP'}),false);
assert.equal(api.applicable({...mixed,categoryBand:'20M'}),false,'unverified experimental single-band category not guessed');
assert.ok(api.applicable({...mixed,categoryAssisted:'UNLIMITED'}),'spotting assistance is not unlimited band changes');
assert.equal(registry.resolve({...mixed,categoryPower:'QRP'},2013),null);
assert.ok(registry.resolve({...mixed,categoryPower:'QRP'},2026));
assert.equal(registry.resolve({...mixed,categoryPower:'QRP',categoryMode:'CW'},2026),null,'EUHFC QRP is Mixed only');
assert.equal(registry.resolve({...mixed,categoryOperator:'SINGLE-OP ALL QRP',categoryPower:'',categoryMode:''},2025)?.countMode,true,'legacy QRP category explicitly establishes Mixed');
assert.ok(build([q(0,'20M','SSB')],meta('EUHFC','SO','CW')).findings.some(f=>f.kind==='Data'));
for(const mode of ['CW','SSB']) for(const category of ['M/S','M/2']) for(let year=2012;year<=2026;year++) {
 const entry=meta('ARRLDX',category,mode),limit=category==='M/2' || year<=2021?6:10;
 const m=build(series(limit+1,mode,'0',year),entry);assert.equal(m.profile.limit,limit);
 assert.equal(count(m,category==='M/2'?'0':'station'),limit+1);
 if(category==='M/2') assert.equal(build(series(7,mode,'0',year),entry,'ADIF').checked,false);
}
// Every enabled category/year must link the inspected edition, not a modern
// document or a capture whose contents still describe a different year.
const inventory=JSON.parse(fs.readFileSync(new URL('../docs/operating-rules-editions.json',import.meta.url),'utf8')).editions;
const euYears=[2010,2012,2013,2014,2016,2017,2018,2020,2025,2026];
for(const family of ['WWRTTY','WPXRTTY','ARRLDX','EUHFC']) for(const category of family==='EUHFC'?['SO']:['M/S','M/2']) {
 const modes=family==='EUHFC'?['CW','SSB','MIXED']:family==='ARRLDX'?['CW','SSB']:['RTTY'];
 for(const mode of modes) for(let year=2000;year<=2027;year++) {
  const entry=meta(family,category,mode),p=registry.resolve(entry,year);
  const expected=family==='EUHFC'?euYears.includes(year):year>=(family==='ARRLDX'?2012:2007) && year<=2026;
  assert.equal(!!p,expected,`${family} ${category} ${mode} ${year}`);
  if(!p) continue;
  const edition=inventory.find(e=>e.family===family && e.year===year);
  assert.ok(edition?.categories.includes(category));assert.equal(p.sources[0],edition.url);
  if(edition.sha256) assert.match(edition.sha256,/^[a-f0-9]{64}$/);
  const qs=series(p.limit+1,mode==='MIXED'?'CW':mode,'0',year),original=JSON.stringify(qs),model=build(qs,entry);
  assert.ok(model.checked);assert.ok(model.findings.some(f=>f.kind==='Changes'));
  assert.equal(JSON.stringify(qs),original);assert.ok(api.render(model,qs).includes(edition.url));
 }
}
assert.match(build([q(0,'20M','CW','0',2022)],meta('EUHFC','SO','CW')).notices.join(' '),/2022 was cancelled/);
const euhfcSource='START-OF-LOG: 3.0\nCONTEST: EU-HF\nCATEGORY-OPERATOR: SINGLE-OP\nCATEGORY-BAND: ALL\nQSO: 14000 CW 2026-08-01 1200 S51AA 599 91 S52AA 599 90\n';
assert.equal(build([q(0,'20M','CW')],meta('EUHFC','SO','CW'),euhfcSource).status,'Insufficient evidence','first-QSO mode fallback is not an entry declaration');
assert.ok(build([q(0,'20M','CW')],{...mixed,categoryBand:'20M'},euhfcSource.replace('CATEGORY-BAND: ALL','CATEGORY-BAND: ALL\nCATEGORY-MODE: MIXED')).checked,'source category overrides general first-QSO metadata fallback');
assert.equal(build([{...q(0,'20M','CW'),raw:{MODE:'CW'}}],meta('EUHFC','SO','CW'),'ADIF').status,'Insufficient evidence','ADIF contact mode also cannot establish entry mode');
assert.ok(build([{...q(0,'20M','CW'),raw:{MODE:'CW',CATEGORY_MODE:'MIXED'}}],mixed,'ADIF').checked,'explicit ADIF category extension supplies entry evidence');
console.log('New contest profiles, historical RTTY transitions, EUHFC mode counting and ARRL category limits: PASS');
