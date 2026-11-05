import assert from 'node:assert/strict';
import {multiplierContacts,correlateMultiplierSpots,loadMultiplierSpotHistory} from '../modules/integrity/spots.js';
import {renderMultiplierSpotReview} from '../modules/integrity/spot-view.js';
const ts=Date.UTC(2025,10,29,0,2),q={call:'DL1AA',ts,band:'20M',mode:'CW',freq:14.02,qsoNumber:7};
const credit={callsign:q.call,timestamp:ts,band:q.band,qsoNumber:7,group:'country',entityKey:'DL'};
const targets=multiplierContacts([q],{multiplierModelSupported:true,multiplierCredits:[credit,{...credit,group:'zone',entityKey:'14'}]});
assert.equal(targets.length,1);assert.equal(targets[0].credits.length,2);
assert.equal(multiplierContacts([q],{multiplierModelSupported:false}).length,0);
const spot={source:'Cluster',dxCall:'DL1AA',ts:ts-120000,band:'20M',freqKHz:14020,spotter:'K1AA'};
let rows=correlateMultiplierSpots(targets,[spot]);assert.equal(rows[0].minDelay,2);assert.equal(rows[0].maxDelay,3);assert.equal(rows[0].frequencyDeltaKHz,0);
rows=correlateMultiplierSpots(targets,[{...spot,ts:ts+30000}]);assert.ok(rows[0].minDelay<0);assert.match(rows[0].label,/order unknown/);
assert.equal(correlateMultiplierSpots(targets,[{...spot,ts:ts+60000}])[0].spot,null);
assert.equal(correlateMultiplierSpots(targets,[{...spot,ts:ts-660000}],10)[0].spot,null);
assert.equal(correlateMultiplierSpots(targets,[{...spot,dxCall:'DL2AA'}])[0].spot,null);
assert.equal(correlateMultiplierSpots(targets,[{...spot,band:'40M'}])[0].spot,null);
assert.equal(correlateMultiplierSpots(targets,[{...spot,source:'RBN',txMode:'SSB'}])[0].spot,null);
assert.equal(correlateMultiplierSpots([{...targets[0],freq:14}],[spot])[0].frequencyDeltaKHz,null);
const urls=[];
const fetchImpl=async url=>{
 urls.push(String(url));
 if(String(url).includes('/rbn?'))return {ok:true,json:async()=>({call:'DL1AA',ofUsSpots:[{...spot,ts:ts-60000,txMode:'CW'}],truncatedOfUs:true,errors:[]})};
 return {ok:true,text:async()=>`14020^DL1AA^${(ts-120000)/1000}^CQ^K1AA^x`};
};
const history=await loadMultiplierSpotHistory({targets,clusterBaseUrl:'https://test/spots',rbnUrl:'https://test/rbn',parseBand:()=> '20M',fetchImpl});
assert.equal(history.status,'partial');assert.ok(urls.some(u=>u.includes('2025/332.dat')),'prior-day spots included for midnight lookback');
assert.ok(history.spots.some(s=>s.source==='RBN'));assert.ok(history.spots.some(s=>s.source==='Cluster'));
const unavailable=await loadMultiplierSpotHistory({targets,clusterBaseUrl:'https://test/spots',rbnUrl:'https://test/rbn',parseBand:()=> '20M',fetchImpl:async()=>({ok:false,status:404})});
assert.equal(unavailable.status,'partial');assert.ok(unavailable.coverage.every(c=>c.status==='unavailable'));
const html=renderMultiplierSpotReview({multiplierSpots:{windowMinutes:10,history,rows:correlateMultiplierSpots(targets,[{...spot,spotter:'<b>unsafe</b>'}]),status:'Done'}},'A');
assert.ok(!html.includes('<b>unsafe</b>'));assert.ok(html.includes('&lt;b&gt;unsafe&lt;/b&gt;'));assert.ok(html.includes('data-index="0"'));
console.log('Multiplier spot correlation, minute uncertainty, mode/call/band filtering, cross-midnight history, partial/error coverage and safe rendering: PASS');
let callsRequested=0;
const limited=await loadMultiplierSpotHistory({targets:[...targets,{...targets[0],call:'DL2AA'},{...targets[0],call:'DL3AA'}],clusterBaseUrl:'https://test/spots',rbnUrl:'https://test/rbn',parseBand:()=> '20M',fetchImpl:async url=>{
 if(String(url).includes('/rbn?')) {callsRequested++;return {ok:false,status:429};}
 return {ok:true,text:async()=>''};
}});
assert.equal(limited.status,'partial');assert.ok(callsRequested<=2);assert.equal(limited.coverage.filter(c=>c.source==='RBN').length,3);
const controller=new AbortController();controller.abort();
await assert.rejects(()=>loadMultiplierSpotHistory({targets,clusterBaseUrl:'https://test/spots',rbnUrl:'https://test/rbn',parseBand:()=> '20M',signal:controller.signal,fetchImpl:async()=>{throw Error('Aborted');}}));
console.log('RBN rate limiting halts further requests; cancellation is explicit: PASS');
const both=correlateMultiplierSpots(targets,[spot,{...spot,source:'RBN',ts:ts+30000,txMode:'CW'}])[0];
assert.equal(both.spot.source,'Cluster');assert.equal(both.definiteWithinWindow,true);assert.ok(both.sameMinuteSpot);
const boundary=correlateMultiplierSpots(targets,[{...spot,ts:ts-600000}],10)[0];
assert.equal(boundary.definiteWithinWindow,false);assert.equal(boundary.maxDelay,11);assert.match(boundary.label,/boundary/);
assert.equal(correlateMultiplierSpots(targets,[{...spot,tx_mode:'SSB'}])[0].spot,null);
console.log('Definite prior spots survive same-minute observations; cutoff overlaps remain uncertain; RBN mode aliases respected: PASS');
const {gzipSync}=await import('node:zlib');
const zipped=await loadMultiplierSpotHistory({targets,clusterBaseUrl:'https://test/spots',rbnUrl:'https://test/rbn',parseBand:()=> '20M',fetchImpl:async url=>{
 if(String(url).includes('/rbn?')) return {ok:true,json:async()=>({call:'DL1AA',days:new URL(url).searchParams.get('days').split(','),ofUsSpots:[],errors:[]})};
 if(String(url).endsWith('.gz'))return new Response(gzipSync(`14020^DL1AA^${(ts-60000)/1000}^CQ^K1AA^x`));
 return {ok:false,status:404};
}});
assert.ok(zipped.coverage.filter(c=>c.source==='Cluster').every(c=>c.url.endsWith('.gz')));assert.ok(zipped.spots.filter(s=>s.source==='Cluster').every(s=>s.sourceUrl.endsWith('.gz')));
console.log('Gzip fallback preserves the actual source URL: PASS');

const hidden=renderMultiplierSpotReview({multiplierSpots:{history,windowMinutes:10,rows:[...correlateMultiplierSpots(targets,[spot]),{...targets[0],call:'HIDE-ME',spot:null,label:'No matching spot in loaded data'}]}},'A');
assert.ok(!hidden.includes('HIDE-ME'));assert.ok(hidden.includes('/ 2 credited multiplier contacts'));
console.log('Unmatched rows hidden while full denominator retained: PASS');
