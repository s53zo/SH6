import assert from 'node:assert/strict';
import {createArchiveClient} from '../modules/archive/client.js';
let downloads=0,queries=0;
const rows=Array.from({length:600},(_,i)=>({callsign:'K'+i,path:'CQWW/'+i+'.log',contest:'CQWW',year:2025,mode:'CW',season:''}));
globalThis.window={initSqlJs:async()=>({Database:class {
 exec(){return [{values:['callsign','path','contest','year','mode','season'].map(c=>[0,c])}];}
 prepare(sql){queries++;let selected=[],index=-1;return {bind(params){selected=rows.filter(r=>params.includes(r.callsign));},step(){return ++index<selected.length;},getAsObject(){return selected[index];},free(){}};}
}})};
globalThis.fetch=async()=>{downloads++;await new Promise(r=>setTimeout(r,5));return {ok:true,arrayBuffer:async()=>new ArrayBuffer(0)};};
const deps={sqlJsBaseUrls:['https://test/'],normalizeCall:c=>String(c).toUpperCase(),normalizeArchiveContestToken:s=>s,normalizeArchiveModeToken:s=>s,getArchiveShardUrlsForCallsign:c=>['https://test/'+(Number(c.slice(1))%3)+'.sqlite'],withTimeoutPromise:p=>p};
const client=createArchiveClient(deps);
const result=await client.queryRowsByCallsigns(rows.map(r=>r.callsign));
assert.equal(downloads,3);assert.equal(queries,3);assert.equal(result.size,600);assert.ok([...result.values()].every(r=>!r.partial && r.rows.length===1));
await client.queryRowsByCallsigns(rows.map(r=>r.callsign));assert.equal(downloads,3);assert.equal(queries,3);
const cold=createArchiveClient(deps);downloads=0;
await Promise.all([cold.queryRowsByCallsign('K1'),cold.queryRowsByCallsign('K4'),cold.queryRowsByCallsigns(['K7'])]);assert.equal(downloads,1,'concurrent callers share one in-flight shard download');
console.log('600 calls grouped into 3 shard downloads/queries; cached repeat does zero work; concurrent callers share in-flight downloads: PASS');
queries=0;downloads=0;
const one=createArchiveClient({...deps,getArchiveShardUrlsForCallsign:()=>['https://test/one.sqlite']});
await one.queryRowsByCallsigns(rows.map(r=>r.callsign));assert.equal(downloads,1);assert.equal(queries,2,'SQLite parameter batches are capped at 400');
let brokenRequests=0;
globalThis.fetch=async url=>{if(String(url).includes('broken')){brokenRequests++;throw Error('Alias shard unavailable');}return {ok:true,arrayBuffer:async()=>new ArrayBuffer(0)};};
const aliases=createArchiveClient({...deps,getArchiveShardUrlsForCallsign:c=>[c.includes('_')?'https://test/broken.sqlite':'https://test/good.sqlite']});
const partial=await aliases.queryRowsByCallsigns(['X/PORT','K1']);assert.equal(partial.get('X/PORT').partial,true);assert.equal(partial.get('K1').partial,false);assert.equal(partial.get('K1').rows.length,1);
await aliases.queryRowsByCallsigns(['X/PORT']);assert.equal(brokenRequests,2,'failed aliases retry rather than caching definitive absence');
const controller=new AbortController();controller.abort();await assert.rejects(()=>aliases.queryRowsByCallsigns(['K2'],{signal:controller.signal}),/cancelled/);
console.log('Large shard queries chunk safely; partial alias failure is isolated and retryable; cancellation is honored: PASS');
