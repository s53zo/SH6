const call=v=>String(v || '').trim().toUpperCase().replace(/_/g,'/');
const mode=v=>({PH:'SSB',PHONE:'SSB',RY:'RTTY'}[String(v || '').toUpperCase()] || String(v || '').toUpperCase());
export function multiplierContacts(qsos,scoring) {
 if(!scoring?.multiplierModelSupported) return [];
 const byNumber=new Map(qsos.map((q,index)=>[q.qsoNumber,{q,index}])),found=new Map();
 for(const credit of scoring.multiplierCredits || []) {
  if(credit.isQtc) continue;
  let entry=byNumber.get(credit.qsoNumber);
  const agrees=e=>e && call(e.q.call)===call(credit.callsign) && e.q.band===credit.band && e.q.ts===credit.timestamp;
  if(!agrees(entry)) {const index=qsos.findIndex(q=>call(q.call)===call(credit.callsign) && q.band===credit.band && q.ts===credit.timestamp);entry=index<0?null:{q:qsos[index],index};}
  if(!entry || !Number.isFinite(entry.q.ts)) continue;
  if(!found.has(entry.index)) found.set(entry.index,{...entry.q,index:entry.index,credits:[]});
  found.get(entry.index).credits.push(credit);
 }
 return [...found.values()].sort((a,b)=>a.ts-b.ts || a.index-b.index);
}
export function correlateMultiplierSpots(targets,spots,windowMinutes=10) {
 const byCallBand=new Map();
 for(const s of spots) {if(!Number.isFinite(s.ts))continue;const key=call(s.dxCall)+'|'+String(s.band).toUpperCase();if(!byCallBand.has(key))byCallBand.set(key,[]);byCallBand.get(key).push(s);}
 for(const list of byCallBand.values())list.sort((a,b)=>b.ts-a.ts);
 return targets.map(q=>{
  const start=Math.floor(q.ts/60000)*60000,end=start+60000;
  const matches=(byCallBand.get(call(q.call)+'|'+q.band) || []).filter(s=>s.ts<end && s.ts>=start-windowMinutes*60000 && (!(s.txMode || s.tx_mode) || mode(s.txMode || s.tx_mode)===mode(q.mode)));
  const sameMinuteSpot=matches.find(s=>s.ts>=start) || null;
  const latest=matches.find(s=>s.ts<start && (end-s.ts)/60000<=windowMinutes) || matches.find(s=>s.ts<start) || matches[0];
  if(!latest) return {...q,spot:null,spotCount:0,label:'No matching spot in loaded data'};
  const minDelay=(start-latest.ts)/60000,maxDelay=(end-latest.ts)/60000;
  const precise=Number.isFinite(q.freq) && ![1.8,3.5,7,14,21,28].some(f=>Math.abs(q.freq-f)<.000001);
  const frequencyDeltaKHz=precise && Number.isFinite(latest.freqKHz)?Math.abs(q.freq*1000-latest.freqKHz):null;
  const definiteWithinWindow=minDelay>0 && maxDelay<=windowMinutes;
  return {...q,spot:latest,sameMinuteSpot,spotCount:matches.length,minDelay,maxDelay,frequencyDeltaKHz,definiteWithinWindow,
    label:minDelay<=0?'Same minute; spot/QSO order unknown':definiteWithinWindow?'Multiplier worked after a spot':'Prior spot; delay overlaps the window boundary',
    sourceMatches:['Cluster','RBN'].map(source=>({source,spot:matches.find(s=>s.source===source) || null}))};
 });
}
function daysForTargets(targets,lookback) {
 const days=new Set();
 for(const q of targets) {const start=Math.floor((q.ts-lookback*60000)/86400000)*86400000,end=Math.floor((q.ts+59999)/86400000)*86400000;for(let t=start;t<=end;t+=86400000)days.add(t);}
 return [...days].sort((a,b)=>a-b);
}
export async function loadMultiplierSpotHistory({targets,clusterBaseUrl,rbnUrl,parseBand,fetchImpl=fetch,signal,onProgress=()=>{},lookbackMinutes=60,fetchClusterText,fetchRbnData,fetchRbnBatch}) {
 const spots=[],coverage=[],days=daysForTargets(targets,lookbackMinutes);
 if(days.length>7)throw Error('Spot timing requires a single contest edition spanning at most seven UTC dates.');
 // Cancelling one review stops its wait without aborting a request shared with other reports.
 const waitForShared=task=>new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(Error('Cancelled'));return;}
  const cancel=()=>{signal?.removeEventListener('abort',cancel);reject(Error('Cancelled'));};
  signal?.addEventListener('abort',cancel,{once:true});
  Promise.resolve().then(task).then(value=>{signal?.removeEventListener('abort',cancel);resolve(value);},error=>{signal?.removeEventListener('abort',cancel);reject(error);});
 });
 const read=async url=>{const response=await fetchImpl(url,{cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(30000)]):AbortSignal.timeout(30000)});if(!response.ok)throw Error(`HTTP ${response.status}`);return response;};
 for(const ts of days) {
  const date=new Date(ts),year=date.getUTCFullYear(),doy=Math.floor((ts-Date.UTC(year,0,1))/86400000)+1;
  const url=`${clusterBaseUrl}/${year}/${String(doy).padStart(3,'0')}.dat`;
  try {
   let text,loadedUrl=url;
   try {text=fetchClusterText?await waitForShared(()=>fetchClusterText(url)):await (await read(url)).text();}
   catch(error){if(signal?.aborted)throw error;loadedUrl=url+'.gz';if(fetchClusterText)text=await waitForShared(()=>fetchClusterText(loadedUrl));else {const response=await read(loadedUrl);if(typeof DecompressionStream!=='function')throw Error('gzip decompression unavailable');text=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text();}}
   const wanted=new Set(targets.map(q=>call(q.call)));
   for(const line of text.split(/\r?\n/)) {const p=line.split('^'),freqKHz=Number(p[0]),stamp=Number(p[2])*1000;if(p.length<6 || !wanted.has(call(p[1])) || !Number.isFinite(stamp) || !Number.isFinite(freqKHz))continue;spots.push({source:'Cluster',dxCall:call(p[1]),spotter:call(p[4]),ts:stamp,freqKHz,band:String(parseBand(freqKHz/1000) || '').toUpperCase(),comment:p[3],sourceUrl:loadedUrl});}
   coverage.push({source:'Cluster',key:date.toISOString().slice(0,10),status:'loaded',url:loadedUrl});
  } catch(error) {if(signal?.aborted)throw error;coverage.push({source:'Cluster',key:date.toISOString().slice(0,10),status:'unavailable',error:error.message,url});}
  onProgress({spots,coverage});
 }
 onProgress({spots,coverage,phase:'rbn'});
 const rbnDays=days.map(t=>new Date(t).toISOString().slice(0,10).replace(/-/g,''));
 const calls=[...new Set(targets.map(q=>call(q.call)))];let cursor=0,rateLimited=false;
 const batch=fetchRbnBatch?await waitForShared(()=>fetchRbnBatch(calls,rbnDays,{signal,onProgress:()=>onProgress({spots,coverage,phase:'rbn'})})):null;
 await Promise.all(Array.from({length:2},async()=>{
  while(cursor<calls.length) {
   const dx=calls[cursor++];
   if(signal?.aborted)throw Error('Cancelled');
   if(rateLimited){coverage.push({source:'RBN',key:dx,status:'unavailable',error:'Rate limited; retry later'});continue;}
   const url=rbnUrl+'?'+new URLSearchParams({call:dx,days:rbnDays.join(',')});
   try {
    const data=batch?batch.get(dx):fetchRbnData?await waitForShared(()=>fetchRbnData(dx,rbnDays)):await (await read(url)).json();
    if(data.notFound)throw Error('RBN archive unavailable');
    if(call(data.call)!==dx || !Array.isArray(data.ofUsSpots))throw Error('Invalid RBN response');
    for(const s of data.ofUsSpots)if(call(s.dxCall)===dx && Number.isFinite(Number(s.ts))) spots.push({...s,source:'RBN',dxCall:dx,band:String(s.band || parseBand(Number(s.freqKHz ?? s.freq)/1000)).toUpperCase(),ts:Number(s.ts),freqKHz:Number(s.freqKHz ?? s.freq),txMode:s.txMode || s.tx_mode || '',sourceUrl:url});
    const missingDays=rbnDays.some(day=>!Array.isArray(data.days) || !data.days.includes(day));
    coverage.push({source:'RBN',key:dx,status:data.truncatedOfUs || data.errors?.length || missingDays?'partial':'loaded',url,error:data.errors?.length?JSON.stringify(data.errors):data.truncatedOfUs?'Response truncated':missingDays?'Response did not confirm all requested UTC dates':''});
   }catch(error){if(signal?.aborted)throw error;if(/429/.test(error.message))rateLimited=true;coverage.push({source:'RBN',key:dx,status:'unavailable',error:error.message,url});}
   onProgress({spots,coverage});
  }
 }));
 const unique=[...new Map(spots.map(s=>[[s.source,s.dxCall,s.spotter,s.ts,s.freqKHz].join('|'),s])).values()];
 return {spots:unique,coverage,status:coverage.some(c=>c.status!=='loaded')?'partial':'loaded'};
}

export function offRunMultiplierContacts(qsos,scoring,classifyOperatingStyles) {
 const timed=qsos.map((q,index)=>({q,index})).filter(e=>Number.isFinite(e.q.ts));
 const roles=classifyOperatingStyles(timed.map(e=>e.q),Infinity);
 const byIndex=new Map(timed.map((e,i)=>[e.index,roles[i] || 'UNKNOWN']));
 const all=multiplierContacts(qsos,scoring),targets=[];let excludedRun=0,uncertain=0;
 for(const q of all) {
  const role=byIndex.get(q.index) || 'UNKNOWN';
  if(!Number.isFinite(q.freq) || [1.8,3.5,7,14,21,28].some(f=>Math.abs(q.freq-f)<.000001)) {uncertain++;continue;}
  if(role==='RUN') {excludedRun++;continue;}
  if(role!=='SEARCH' && role!=='INBAND') {uncertain++;continue;}
  targets.push({...q,integrityOperatingRole:role});
 }
 return {targets,excludedRun,uncertain,total:all.length};
}
