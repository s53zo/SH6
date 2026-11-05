const norm=v=>String(v || '').trim().toUpperCase();
const call=v=>norm(v).replace(/_/g,'/');
export function selectCounterpart(rows,request) {
  const matches=rows.filter(r=>norm(r.contest)===norm(request.contest) && Number(r.year)===Number(request.year)
    && (norm(r.mode)===norm(request.mode) || request.mixedEvent && ['CW','PH','SSB','MIXED'].includes(norm(r.mode))) && (!request.season || norm(r.season)===norm(request.season))
    && (!request.subcontest || norm(r.subcontest)===norm(request.subcontest))
    && (!request.detail || norm(r.detail)===norm(request.detail)));
  const editions=new Set(matches.map(r=>[norm(r.season),norm(r.subcontest),norm(r.detail)].join('|')));
  if(editions.size>1) return {status:'ambiguous',reason:'Several archive editions match; select the exact event.'};
  const sorted=matches.slice().sort((a,b)=>Number(/^RECONSTRUCTED_LOGS\//i.test(a.path))-Number(/^RECONSTRUCTED_LOGS\//i.test(b.path)) || a.path.localeCompare(b.path));
  return sorted.length?{status:'selected',row:sorted[0]}:{status:'unavailable',reason:'No exact contest/year/mode counterpart source is indexed.'};
}
export function materializeEvidence(qsos,{path='',entrant='',sourceKind='submitted',sourceCall=''}={}) {
  const reconstructed=sourceKind==='reconstructed';
  const seen=new Set(),records=[];
  for(const q of qsos) {
    // Reconstruction generator reverses original reports: worked call is the
    // reporting station. Its frequency is inherited, not an independent TX fix.
    const reporter=reconstructed?call(q.call):call(sourceCall);
    const identity=JSON.stringify([call(q.call),q.ts,q.band,q.mode,q.freq,q.rstSent,q.rstRcvd,q.exchSent,q.exchRcvd]);
    if(seen.has(identity)) continue;
    seen.add(identity);
    records.push({...q,sourcePath:path,sourceRecordId:`${path}:${identity}`,originCall:reporter || null,
      independentlyReported:reporter && call(entrant)?reporter!==call(entrant):null,
      frequencyProvenance:reconstructed?'Inherited from reporting station':'Submitted log'});
  }
  return records;
}
export function createEvidenceQueue({lookup,fetchText,parse,validate,concurrency=2}) {
  const cache=new Map();let active=0;const pending=[];
  const pump=()=>{while(active<concurrency && pending.length) {active++;const run=pending.shift();run().finally(()=>{active--;pump();});}};
  function load(request) {
    const key=JSON.stringify(request);
    if(cache.has(key)) return cache.get(key);
    const promise=new Promise(resolve=>pending.push(async()=>{
      try {
        const result=await lookup(request.callsign);
        const rows=Array.isArray(result)?result:result.rows;
        const selected=selectCounterpart(rows,request);
        if(selected.status!=='selected') {if(result.partial) {cache.delete(key);resolve({...selected,status:'partial',reason:'Partial shard lookup; counterpart availability is unknown.'});} else resolve(selected);return;}
        const downloaded=await fetchText(selected.row.path);
        if(!downloaded || typeof downloaded.text!=='string') throw Error('Counterpart source could not be downloaded.');
        const parsed=parse(downloaded.text,selected.row.path);
        const reason=validate(parsed,request,selected.row);
        if(reason) {resolve({status:'conflict',reason,path:selected.row.path});return;}
        const sourceKind=/^RECONSTRUCTED_LOGS\//i.test(selected.row.path)?'reconstructed':'submitted';
        if(result.partial) cache.delete(key);
        resolve({status:result.partial?'partial':'ready',coverage:Array.isArray(result)?'Alias coverage unknown':result.partial?'Partial alias coverage':'Indexed lookup completed',
          sourceKind,path:selected.row.path,source:downloaded.source,
          records:materializeEvidence(parsed.qsos,{path:selected.row.path,entrant:request.entrant,sourceKind,sourceCall:request.callsign})});
      } catch(error) {cache.delete(key);resolve({status:'error',reason:error.message || String(error)});}
    }));
    cache.set(key,promise);pump();return promise;
  }
  return {load,clear:()=>cache.clear()};
}
