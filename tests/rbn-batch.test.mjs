import assert from 'node:assert/strict';
import {createSpotsDataRuntime} from '../modules/spots/data-runtime.js';
const original=globalThis.fetch,urls=[];let mode='ok';
globalThis.fetch=async url=>{
 urls.push(String(url));const u=new URL(url),days=u.searchParams.get('days').split(','),calls=(u.searchParams.get('calls') || u.searchParams.get('call')).split(',');
 if(mode==='429')return new Response('',{status:429});
 const results=calls.map(call=>({call,days,ofUsSpots:days.map(day=>({dxCall:call,spotter:'RX1',ts:Date.parse(day.slice(0,4)+'-'+day.slice(4,6)+'-'+day.slice(6)+'T00:00:00Z'),freqKHz:14020})),byUsSpots:[],errors:mode==='partial'?[{error:'missing data'}]:[],truncatedOfUs:false,truncatedByUs:false,total:days.length,totalOfUs:days.length,totalByUs:0}));
 return new Response(JSON.stringify(u.searchParams.has('calls')?{batchVersion:1,results:mode==='missing'?results.slice(1):results}:results[0]));
};
try {
 const runtime=createSpotsDataRuntime({normalizeCall:v=>String(v).toUpperCase(),rbnProxyUrl:'https://batch.test/rbn'});
 const days=['20251128','20251129','20251130'],calls=Array.from({length:65},(_,i)=>'K'+i+'AA');
 await runtime.fetchRbnSpots('K0AA',days.slice(0,2));const before=urls.length;
 const data=await runtime.fetchRbnSpotsBatch(calls,days);
 assert.equal(urls.length-before,5,'65 calls / 3 days use bounded calls/date groups and skip preloaded K0AA');
 for(const url of urls.slice(before)){const q=new URL(url).searchParams;assert.ok(q.get('calls').split(',').length<=32);assert.ok(q.get('days').split(',').length<=2);}
 assert.equal(data.size,65);assert.equal(data.get('K0AA').ofUsSpots.length,3);assert.equal(data.get('K0AA').totalOfUs,3);
 const cached=urls.length;await runtime.fetchRbnSpotsBatch(calls,days);assert.equal(urls.length,cached,'fully cached batch does no network work');
 const subset=await runtime.fetchRbnSpotsBatch(['K0AA'],['20251129']);assert.equal(urls.length,cached);assert.equal(subset.get('K0AA').ofUsSpots.length,1,'cached supersets do not leak other days');
 mode='partial';await runtime.fetchRbnSpotsBatch(['DL1AA'],['20251129']);let count=urls.length;await runtime.fetchRbnSpotsBatch(['DL1AA'],['20251129']);assert.equal(urls.length,count+1,'partial entries remain retryable');
 mode='missing';await assert.rejects(()=>runtime.fetchRbnSpotsBatch(['DL2AA'],['20251129']),/omitted/);
 mode='429';count=urls.length;await assert.rejects(()=>runtime.fetchRbnSpotsBatch(calls.map(c=>'W'+c),days),/429/);assert.equal(urls.length,count+1,'rate limiting stops later batches');
 console.log('RBN batches: bounded grouping, cache reuse, date slicing, partial/malformed responses and rate-limit stop: PASS');
} finally {globalThis.fetch=original;}
