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

export function summarizeCounterpart(records=[], entrant='', sourceKind='reconstructed', entrantReconstructed=false) {
  const canonical=v=>String(v || '').trim().toUpperCase().replace(/_/g,'/');
  const reviewed=canonical(entrant);
  const unique=new Map();
  for(const r of records) {
    const key=r.sourceRecordId || [r.sourcePath || '',r.sourceLine ?? '',r.call,r.ts,r.band,r.mode,r.freq,r.rstSent,r.rstRcvd,r.exchSent,r.exchRcvd].join('|');
    if(!unique.has(key)) unique.set(key,r);
  }
  const rows=[...unique.values()];
  const independent=entrantReconstructed?[]:rows.filter(r=>r.originCall && canonical(r.originCall)!==reviewed);
  return {sourceKind,independenceAssessed:!entrantReconstructed && rows.every(r=>!!r.originCall),observed:rows.length,stations:new Set(rows.map(r=>canonical(r.call)).filter(Boolean)).size,
    withEntrant:rows.filter(r=>canonical(r.call)===reviewed).length,
    independentlyReported:independent.length,
    independenceUnknown:entrantReconstructed?rows.length:rows.filter(r=>!r.originCall).length,
    otherStations:new Set(rows.filter(r=>canonical(r.call)!==reviewed).map(r=>canonical(r.call))).size,
    rows:rows.slice().sort((a,b)=>a.ts-b.ts)};
}

export function isReconstructedSource(path='',text='') {
  return /^RECONSTRUCTED_LOGS\//i.test(path) || /^CREATED-BY:.*reconstructed-log-builder/im.test(text) || /^SOAPBOX:.*reconstruct/im.test(text);
}
export function normalizeExchange(value,contest='') {
  const text=String(value ?? '').trim().toUpperCase().replace(/\s+/g,' ');
  const numeric=/^(CQWW|CQWPX|ARRLDX|EUHFC|EUHF)$/.test(String(contest).toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/(?:CW|SSB|RTTY|PHONE)$/,''));
  return numeric?text.split(' ').map(token=>/^\d+$/.test(token)?token.replace(/^0+(?=\d)/,''):token).join(' '):text;
}
export function compareReciprocal(candidate,qsos,records,entrant,sourceKind,options={}) {
  const canonical=v=>String(v || '').trim().toUpperCase().replace(/_/g,'/');
  const empty={matches:[],discrepancies:[],unmatched:[],ambiguous:[]};
  if(options.entrantReconstructed || sourceKind!=='submitted') return {...empty,label:'Reconstructed source lineage cannot establish independent reciprocal confirmation.'};
  const relevant=records.filter(r=>canonical(r.call)===canonical(entrant));
  const edges=[];
  for(const index of candidate.indexes) for(let ri=0;ri<relevant.length;ri++) {
    const q=qsos[index],r=relevant[ri],delta=Math.abs(r.ts-q.ts);
    if(!Number.isFinite(delta) || delta>5*60000 || r.band!==q.band || r.mode!==q.mode) continue;
    const differences=[];
    for(const [a,b,direction] of [[q.exchSent,r.exchRcvd,'Entrant sent / counterpart received'],[q.exchRcvd,r.exchSent,'Entrant received / counterpart sent']]) {
      if(String(a ?? '').trim() && String(b ?? '').trim() && normalizeExchange(a,options.contest)!==normalizeExchange(b,options.contest)) differences.push(direction);
    }
    edges.push({index,ri,delta,differences,counterpart:r});
  }
  const rank=(a,b)=>a.differences.length-b.differences.length || a.delta-b.delta;
  edges.sort(rank);
  const assigned=new Set(),used=new Set(),result={...empty};
  for(const e of edges) {
    if(assigned.has(e.index) || used.has(e.ri)) continue;
    const alternatives=edges.filter(x=>!assigned.has(x.index) && !used.has(x.ri) && (x.index===e.index || x.ri===e.ri) && rank(x,e)===0);
    if(alternatives.length>1) {
      for(const x of alternatives) if(!assigned.has(x.index)) {assigned.add(x.index);result.ambiguous.push({index:x.index,kind:'Several equally plausible reciprocal pairings'});}
      continue;
    }
    assigned.add(e.index);used.add(e.ri);
    if(e.differences.length) result.discrepancies.push({...e,kind:'Exchange discrepancy'});
    else result.matches.push(e);
  }
  for(const index of candidate.indexes) if(!assigned.has(index)) result.unmatched.push({index,kind:'No unique reciprocal match within five minutes'});
  return {...result,label:result.discrepancies.length?'Conflicting log records':result.unmatched.length || result.ambiguous.length?'Unmatched or ambiguous reciprocal records':'Reciprocal contacts matched within five minutes'};
}

export function compareCases(cases,qsos,records,entrant,sourceKind,options={}) {
 const all=compareReciprocal({indexes:[...new Set(cases.flatMap(c=>c.indexes))]},qsos,records,entrant,sourceKind,options);
 for(const c of cases) {
  const indexes=new Set(c.indexes),part={};
  for(const key of ['matches','discrepancies','unmatched','ambiguous']) part[key]=all[key].filter(r=>indexes.has(r.index));
  c.reciprocal={...part,label:options.entrantReconstructed || sourceKind!=='submitted'?all.label:part.discrepancies.length?'Conflicting log records':part.unmatched.length || part.ambiguous.length?'Unmatched or ambiguous reciprocal records':'Reciprocal contacts matched within five minutes'};
  c.label=part.discrepancies.length?'Conflicting log records':'Rapid multiband sequence';
 }
}

export function assessCounterpartActivity(evidence) {
 if(evidence?.indexed)return {state:'ok',unique:null,label:'OK — counterpart log indexed'};
 if(evidence?.records && evidence.summary) {
  const unique=evidence.summary.stations;
  return {state:unique>=5?'ok':'limited',unique,label:unique>=5?`OK — ${unique} unique callsigns`:`Limited activity — ${unique} unique callsigns`};
 }
 if(evidence?.status==='unavailable')return {state:'missing',unique:null,label:'Review — counterpart log not found'};
 return {state:'unknown',unique:null,label:evidence?.status==='error'?'Not checked — lookup failed':evidence?.status==='ambiguous'?'Not checked — ambiguous event':evidence?.status==='partial'?'Not checked — incomplete lookup':'Not checked'};
}
