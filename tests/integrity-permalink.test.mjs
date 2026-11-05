import assert from 'node:assert/strict';
import {counterpartPermalink} from '../modules/integrity/permalink.js';
import {decodeV3State} from '../modules/session/permalink-v3.js';
import {renderIntegrity} from '../modules/integrity/view.js';
for(const path of ['CQWW/cw/2025/gd0amd.log','RECONSTRUCTED_LOGS/CQWW/cw/2025/JW7QIA.log']) {
 const url=new URL(counterpartPermalink(path));assert.equal(url.origin,'https://s53m.com');assert.equal(url.pathname,'/SH6/');
 const compact=decodeV3State(url.searchParams.get('state'));assert.equal(compact.s.length,1);assert.equal(compact.s[0].i,'A');assert.equal(compact.s[0].p,path);assert.ok(!compact.s[0].t || compact.s[0].t==='a','archive path implies archive source even when v3 elides the default tag');
 assert.ok(!url.searchParams.has('view'),'current-page filters/views do not leak into the new analysis');
}
for(const path of ['',null,'https://bad.example/a.log','../a.log','/absolute.log','a\\b.log'])assert.equal(counterpartPermalink(path),null);
const qsos=[{call:'GD0AMD',band:'20M',ts:Date.UTC(2025,10,30,6,16),mode:'CW'}];
const item={id:'one',call:'GD0AMD',start:qsos[0].ts/60000,end:qsos[0].ts/60000+4,elapsedMin:3,elapsedMax:5,bands:['20M','40M','80M'],indexes:[0],label:'Rapid multiband sequence'};
const model={cases:[item],evidence:{},analysisSources:{GD0AMD:{path:'CQWW/cw/2025/gd0amd.log'}},windowMinutes:5,minBands:3};
const html=renderIntegrity(model,qsos,'B');assert.match(html,/class="integrity-counterpart-link"/);assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.match(html,/>GD0AMD<\/a>/);
const absent=renderIntegrity({...model,analysisSources:{}},qsos,'B');assert.ok(!absent.includes('integrity-counterpart-link'),'missing or ambiguous sources do not get guessed links');
console.log('Counterpart permalinks: exact submitted/reconstructed path, isolated single-log v3 payload, safe new tab and absent-source fallback: PASS');
