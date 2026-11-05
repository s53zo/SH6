import assert from 'node:assert/strict';
import {correlateMultiplierSpots} from '../modules/integrity/spots.js';
import {renderMultiplierSpotReview} from '../modules/integrity/spot-view.js';
const ts=Date.UTC(2025,10,29,1),target={call:'NOMATCH',band:'20M',mode:'CW',freq:14.025,ts,index:42,qsoNumber:43,credits:[{group:'country'}],integrityOperatingRole:'SEARCH'};
const history={status:'loaded',coverage:[{source:'Cluster',status:'loaded'},{source:'RBN',status:'loaded'}]};
const rows=correlateMultiplierSpots([target],[]);
const data={history,rows,currentCheckValid:true,windowMinutes:10};
const html=renderMultiplierSpotReview({multiplierSpots:data},'D');
assert.ok(html.includes('integrity-unspotted-review'));assert.ok(html.includes('NOMATCH'));assert.ok(html.includes('No recent spot corroboration'));assert.ok(html.includes('14025 kHz'));
assert.ok(html.includes('data-slot="D" data-index="42"'));assert.ok(html.includes('not proof the station was not calling CQ'));
for(const changed of [
 {currentCheckValid:false},{loading:true},
 {history:{...history,status:'partial'}},
 {history:{...history,coverage:[{source:'Cluster',status:'loaded'},{source:'RBN',status:'partial'}]}},
 {history:{...history,coverage:[{source:'Cluster',status:'loaded'}]}},
 {rows:[{...rows[0],integrityOperatingRole:'RUN'}]},
 {rows:[{...rows[0],integrityOperatingRole:'UNKNOWN'}]},
 {rows:[{...rows[0],credits:[]}]}
])assert.ok(!renderMultiplierSpotReview({multiplierSpots:{...data,...changed}},'D').includes('class="integrity-unspotted-review"'));
const sameMinute=correlateMultiplierSpots([target],[{source:'RBN',dxCall:target.call,band:'20M',txMode:'CW',ts:ts+1000,freqKHz:14025}]);
assert.ok(!renderMultiplierSpotReview({multiplierSpots:{...data,rows:sameMinute}},'D').includes('class="integrity-unspotted-review"'),'same-minute uncertainty is not absence');
const old=correlateMultiplierSpots([target],[{source:'RBN',dxCall:target.call,band:'20M',txMode:'CW',ts:ts-7200000,freqKHz:14025}]);
assert.ok(renderMultiplierSpotReview({multiplierSpots:{...data,rows:old}},'D').includes('preceding 10 minutes'),'the note concerns the recent window, not all-day absence');
console.log('Unspotted off-RUN review notes: complete dual-source coverage, eligible credits/roles, minute uncertainty, missing/partial-source guards and QSO navigation: PASS');
