import assert from 'node:assert/strict';
import {createSpotsDataRuntime} from '../modules/spots/data-runtime.js';
import {incompleteSpotCoverageMessage} from '../modules/integrity/spots.js';
const original=globalThis.fetch,requests=[];let mode='large';
globalThis.fetch=async url=>{
 const q=new URL(url).searchParams,calls=(q.get('calls') || q.get('call')).split(','),days=q.get('days').split(',');requests.push({calls,days});
 if(mode==='bulk') {
  const call=calls[0],base=Date.parse(days[0].slice(0,4)+'-'+days[0].slice(4,6)+'-'+days[0].slice(6)+'T00:00:00Z');
  const result={call,days,ofUsSpots:[],byUsSpots:days.length>1?[]:Array.from({length:100000},(_,i)=>({dxCall:'OTHER',spotter:call,ts:base+i,freqKHz:14020})),errors:[],totalOfUs:0,totalByUs:100000*days.length,total:100000*days.length,truncatedOfUs:false,truncatedByUs:days.length>1};
  return new Response(JSON.stringify({batchVersion:1,maxSpots:100000,results:[result]}));
 }
 let remaining=100;
 const results=calls.map(call=>{
  const total=(call==='ZERO'?1:60)*days.length;
  const truncated=mode==='direction'?false:mode==='stuck' || (mode==='unknown'?calls.length>1:total>remaining);remaining=Math.max(0,remaining-total);
  return {call,days,byUsIncluded:q.get('ofUsOnly')!=='1',totalOfUs:mode==='unknown'?0:total,totalByUs:0,total,ofUsSpots:days.map(day=>({dxCall:call,spotter:'RX1',ts:Date.parse(day.slice(0,4)+'-'+day.slice(4,6)+'-'+day.slice(6)+'T00:00:00Z'),freqKHz:14020})),byUsSpots:mode==='direction' && q.get('ofUsOnly')!=='1'?[{dxCall:'OTHER',spotter:call,ts:Date.UTC(2025,10,29),freqKHz:14020}]:[],errors:[],truncatedOfUs:truncated,truncatedByUs:false};
 });
 return new Response(JSON.stringify(q.has('calls')?{batchVersion:1,maxSpots:100,results}:results[0]));
};
const runtime=()=>createSpotsDataRuntime({normalizeCall:v=>String(v).toUpperCase(),rbnProxyUrl:'https://truncation.test/rbn'});
try {
 const client=runtime(),data=await client.fetchRbnSpotsBatch(['ZERO','BUSY1','BUSY2'],['20251129','20251130']);
 assert.ok([...data.values()].every(r=>!r.truncatedOfUs && !r.truncatedByUs));
 assert.equal(data.get('BUSY1').ofUsSpots.length,2);assert.equal(data.get('BUSY1').totalOfUs,120);
 assert.equal(requests.filter(q=>q.calls.includes('ZERO')).length,1,'complete calls are not re-requested');
 assert.ok(requests.some(q=>q.calls.length===1 && q.days.length===1),'oversized individual two-day responses are split by date');
 const count=requests.length;await client.fetchRbnSpotsBatch(['ZERO','BUSY1','BUSY2'],['20251129','20251130']);assert.equal(requests.length,count,'complete recovered responses enter the normal cache');
 mode='unknown';const before=requests.length;await runtime().fetchRbnSpotsBatch(['BUSY3','BUSY4'],['20251129']);assert.equal(requests.length-before,3,'missing totals still force strictly smaller retry groups');
 mode='stuck';const last=requests.length;const stuck=await runtime().fetchRbnSpotsBatch(['BUSY5'],['20251129']);assert.equal(requests.length,last+1);assert.equal(stuck.get('BUSY5').truncatedOfUs,true,'irreducible truncation remains unassessed without looping');
 mode='direction';const directional=runtime();
 const directionStart=requests.length;
 const selected=await directional.fetchRbnSpotsBatch(['RXCALL'],['20251129'],{ofUsOnly:true});assert.equal(selected.get('RXCALL').byUsIncluded,false);assert.equal(selected.get('RXCALL').byUsSpots.length,0);
 const full=await directional.fetchRbnSpots('RXCALL',['20251129']);assert.equal(requests.length,directionStart+2,'direction-only cache cannot masquerade as complete RBN menu data');assert.equal(full.byUsSpots.length,1);
 mode='bulk';const bulk=await runtime().fetchRbnSpotsBatch(['BIGRX'],['20251129','20251130']);assert.equal(bulk.get('BIGRX').byUsSpots.length,200000,'large merged arrays do not exceed the JavaScript argument stack');
 const message=incompleteSpotCoverageMessage({coverage:[{source:'Cluster',key:'2025-11-29',status:'loaded'},{source:'RBN',key:'BUSY5',status:'partial',error:'Response truncated'}]});
 assert.match(message,/RBN BUSY5: Response truncated/);assert.match(message,/Results are withheld/);
 console.log('Adaptive RBN recovery: smaller call/date batches, preserved complete calls, recovered cache, bounded retries and explicit failure details: PASS');
} finally {globalThis.fetch=original;}
