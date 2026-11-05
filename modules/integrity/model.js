// Source-only candidate detection. Timestamps denote occupied UTC minutes,
// never an invented order or overlapping transmissions inside a minute.
export function detectSequences(qsos = [], options = {}) {
  const windowMinutes = Math.max(1, Math.min(60, Number(options.windowMinutes) || 5));
  const minBands = Math.max(2, Math.min(6, Number(options.minBands) || 3));
  const byCall = new Map();
  qsos.forEach((q,index) => {
    const call = String(q.call || '').trim().toUpperCase();
    if (!call || !Number.isFinite(q.ts) || q.isQtc || !['160M','80M','40M','20M','15M','10M'].includes(q.band)) return;
    if (!byCall.has(call)) byCall.set(call, []);
    byCall.get(call).push({index,minute:Math.floor(q.ts/60000),band:q.band});
  });
  const cases=[];
  for (const [call,entries] of byCall) {
    entries.sort((a,b)=>a.minute-b.minute || a.index-b.index);
    const merged=[],counts=new Map();let right=0;
    for(let left=0;left<entries.length;left++) {
      while(right<entries.length && entries[right].minute-entries[left].minute<windowMinutes) {
        const band=entries[right++].band;counts.set(band,(counts.get(band) || 0)+1);
      }
      if(counts.size>=minBands) {
        const w={start:entries[left].minute,end:entries[right-1].minute,left,right};
        const last=merged.at(-1);
        if(last && w.start<=last.end) {last.end=Math.max(last.end,w.end);last.right=Math.max(last.right,w.right);}
        else merged.push(w);
      }
      const band=entries[left].band,count=counts.get(band)-1;
      if(count) counts.set(band,count);else counts.delete(band);
    }
    for(const w of merged) w.indexes=entries.slice(w.left,w.right).map(e=>e.index);
    for(const w of merged) cases.push({...w,call,bands:[...new Set(w.indexes.map(i=>qsos[i].band))],id:`${call}:${w.start}`,label:'Rapid multiband sequence',elapsedMin:Math.max(0,w.end-w.start-1),elapsedMax:w.end-w.start+1});
  }
  return cases.sort((a,b)=>a.start-b.start || a.call.localeCompare(b.call));
}

export function summarizeCounterpart(records=[], entrant='', sourceKind='reconstructed') {
  const canonical=v=>String(v || '').trim().toUpperCase().replace(/_/g,'/');
  const reviewed=canonical(entrant);
  const unique=new Map();
  for(const r of records) {
    const key=r.sourceRecordId || [r.sourcePath || '',r.sourceLine ?? '',r.call,r.ts,r.band,r.mode,r.freq,r.rstSent,r.rstRcvd,r.exchSent,r.exchRcvd].join('|');
    if(!unique.has(key)) unique.set(key,r);
  }
  const rows=[...unique.values()];
  const independent=rows.filter(r=>r.originCall && canonical(r.originCall)!==reviewed);
  return {sourceKind,observed:rows.length,stations:new Set(rows.map(r=>canonical(r.call))).size,
    withEntrant:rows.filter(r=>canonical(r.call)===reviewed).length,
    independentlyReported:independent.length,
    independenceUnknown:rows.filter(r=>!r.originCall).length,
    otherStations:new Set(rows.filter(r=>canonical(r.call)!==reviewed).map(r=>canonical(r.call))).size,
    rows:rows.slice().sort((a,b)=>a.ts-b.ts)};
}

export function compareReciprocal(candidate,qsos,records,entrant,sourceKind) {
  const canonical=v=>String(v || '').trim().toUpperCase().replace(/_/g,'/');
  const relevant=records.filter(r=>canonical(r.call)===canonical(entrant));
  if(sourceKind!=='submitted') return {label:'Reconstructed observations cannot independently confirm the reports that generated them.',matches:[],discrepancies:[]};
  const matches=[],discrepancies=[];
  for(const index of candidate.indexes) {
    const q=qsos[index];
    const nearby=relevant.filter(r=>Number.isFinite(r.ts) && Math.abs(r.ts-q.ts)<=5*60000);
    const exact=nearby.find(r=>r.band===q.band && r.mode===q.mode);
    if(exact) {
      const sent=String(q.exchSent || '').trim(),received=String(exact.exchRcvd || '').trim();
      if(sent && received && sent!==received) discrepancies.push({index,kind:'Exchange discrepancy',counterpart:exact});
      else matches.push({index,counterpart:exact});
    } else discrepancies.push({index,kind:nearby.length?'Band or mode discrepancy':'No nearby reciprocal record',counterpart:nearby[0] || null});
  }
  return {matches,discrepancies,label:discrepancies.length?'Conflicting log records':'Reciprocal contacts matched within five minutes'};
}
