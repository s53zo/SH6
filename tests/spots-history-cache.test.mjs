import assert from 'node:assert/strict';
import {createSpotsDataRuntime} from '../modules/spots/data-runtime.js';
import {loadMultiplierSpotHistory} from '../modules/integrity/spots.js';
const originalFetch=globalThis.fetch,requests=[];
let fail=false,partial=false;
const ts=Date.UTC(2025,10,29,0,2),cluster='https://cache.test/spots',rbn='https://cache.test/rbn';
globalThis.fetch=async url=>{
 requests.push(String(url));await new Promise(r=>setTimeout(r,2));
 if(fail)return new Response('',{status:500});
 if(String(url).includes('/rbn?')) {
  const u=new URL(url);return new Response(JSON.stringify({call:u.searchParams.get('call'),days:u.searchParams.get('days').split(','),ofUsSpots:[],byUsSpots:[],errors:partial?['missing source']:[],truncatedOfUs:false,truncatedByUs:false}));
 }
 return new Response(`14020^DL1AA^${(ts-120000)/1000}^CQ^K1AA^x`);
};
try {
 const runtime=createSpotsDataRuntime({normalizeCall:v=>String(v).toUpperCase(),rbnProxyUrl:rbn});
 const url=cluster+'/2025/333.dat';
 await Promise.all([runtime.fetchSpotFile(url),runtime.fetchSpotFile(url)]);
 assert.equal(requests.length,1,'concurrent cluster consumers share the request');
 await runtime.fetchSpotFile(url);assert.equal(requests.length,1);
 await runtime.fetchSpotFile(cluster+'/2025/332.dat');
 const data=await runtime.fetchRbnSpots('DL1AA',['20251129','20251128']);
 data.ofUsSpots.push({dxCall:'MUTATED'});
 const before=requests.length;
 const again=await runtime.fetchRbnSpots('dl1aa',['20251129']);
 assert.equal(again.ofUsSpots.length,0,'cached responses are isolated from caller mutations');
 assert.equal(requests.length,before,'covered date subsets reuse a complete RBN response');
 const history=await loadMultiplierSpotHistory({targets:[{call:'DL1AA',band:'20M',ts}],clusterBaseUrl:cluster,rbnUrl:rbn,parseBand:()=> '20M',fetchClusterText:runtime.fetchSpotFile,fetchRbnData:runtime.fetchRbnSpots});
 assert.equal(history.status,'loaded');assert.equal(requests.length,before,'integrity uses data already loaded by normal spot runtime');
 await runtime.fetchRbnSpots('DL2AA',['20251129']);assert.equal(requests.length,before+1,'different calls still require their own data');
 const beforeExpanded=requests.length;
 await runtime.fetchRbnSpots('DL1AA',['20251127','20251128','20251129']);assert.equal(requests.length,beforeExpanded+1,'missing dates are fetched');
 const uncached=createSpotsDataRuntime({normalizeCall:v=>String(v).toUpperCase(),rbnProxyUrl:rbn});
 partial=true;let count=requests.length;
 await uncached.fetchRbnSpots('DL3AA',['20251129']);await uncached.fetchRbnSpots('DL3AA',['20251129']);assert.equal(requests.length,count+2,'partial responses are not cached');
 partial=false;fail=true;count=requests.length;
 await assert.rejects(()=>uncached.fetchSpotFile(url));await assert.rejects(()=>uncached.fetchSpotFile(url));assert.equal(requests.length,count+2,'failed requests remain retryable');
 fail=false;await uncached.fetchSpotFile(url);
 const controller=new AbortController();let release;
 const blocked=loadMultiplierSpotHistory({targets:[{call:'DL1AA',band:'20M',ts}],clusterBaseUrl:cluster,rbnUrl:rbn,parseBand:()=> '20M',signal:controller.signal,fetchClusterText:()=>new Promise(r=>release=r)});
 await Promise.resolve();controller.abort();await assert.rejects(()=>blocked,/Cancelled/);release('');
 console.log('Shared cluster/RBN caching, in-flight reuse, date coverage, caller isolation and retryable failures: PASS');
} finally {globalThis.fetch=originalFetch;}
