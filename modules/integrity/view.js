import {counterpartPermalink} from './permalink.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const utc=m=>new Date(m*60000).toISOString().slice(0,16).replace('T',' ')+'Z';
const table=(heads,rows)=>`<div class="table-wrap"><table class="mtc"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const timeIndexes=new WeakMap();
function surrounding(qsos,start,end) {
 let index=timeIndexes.get(qsos);
 if(!index) {index=qsos.filter(q=>Number.isFinite(q.ts)).slice().sort((a,b)=>a.ts-b.ts);timeIndexes.set(qsos,index);}
 const lower=ts=>{let a=0,b=index.length;while(a<b){const m=(a+b)>>1;if(index[m].ts<ts)a=m+1;else b=m;}return a;};
 return index.slice(lower(start),lower(end));
}
export function renderIntegrity(model,qsos,slot,{fullTimelines=false}={}) {
 const counterpartLink=call=>{
  const evidence=model.evidence?.[call],source=model.analysisSources?.[call] || (['indexed','ready'].includes(evidence?.status)?evidence:null);
  const href=source?.path?counterpartPermalink(source.path):null;
  return href?`<a class="integrity-counterpart-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="Open ${esc(call)} in SH6${/^RECONSTRUCTED_LOGS\//i.test(source.path)?' (reconstructed log)':''}">${esc(call)}</a>`:esc(call);
 };
 const jump=(i,label)=>`<button type="button" class="integrity-qso" data-slot="${esc(slot)}" data-index="${i}">${esc(label)}</button>`;
 const timeline=list=>`${!fullTimelines && !model.showAllTimelines && list.length>100?`<p>Showing 100 of ${list.length} records. Use Show all timelines or export for the complete activity.</p>`:''}${table(['UTC','Call','Band','Mode','Exchange sent / received','Source / reporter'],(fullTimelines || model.showAllTimelines?list:list.slice(0,100)).map(q=>[Number.isFinite(q.ts)?esc(utc(Math.floor(q.ts/60000))):'Unknown',esc(q.call),esc(q.band),esc(q.mode),esc(`${q.exchSent || '—'} / ${q.exchRcvd || '—'}`),esc([q.sourcePath || 'Loaded log',q.originCall || '',q.frequencyProvenance || ''].filter(Boolean).join(' · '))]))}`;
 const priority=c=>1+(c.reciprocal?.discrepancies.length?1:0)+(model.evidence?.[c.call]?.summary?.independenceAssessed && model.evidence?.[c.call]?.summary?.independentlyReported<3 && model.evidence?.[c.call]?.summary?.withEntrant>=3?1:0);
 const cases=model.cases.filter(c=>!model.filter || c.call.includes(model.filter.toUpperCase())).sort((a,b)=>priority(b)-priority(a) || a.start-b.start);
 const rows=cases.map(c=>{
  const e=model.evidence?.[c.call],summary=e?.summary;
  const message=summary?`${summary.observed} observed contacts; ${summary.stations} stations; ${summary.withEntrant} with entrant (${summary.observed?(100*summary.withEntrant/summary.observed).toFixed(1):0}%); ${summary.otherStations} distinct other stations; ${summary.independenceAssessed?`${summary.independentlyReported} independent reports`:'Independent corroboration not assessed (unknown source lineage)'}; ${summary.independenceUnknown} unknown provenance.`:e?.reason || e?.status || 'Evidence not loaded';
  const nearby=surrounding(qsos,(c.start-15)*60000,(c.end+16)*60000);
  const impact=model.impacts?.[c.id];
  const detail=`<details><summary>${esc(c.label)} · ${esc(c.call)}</summary><p>${esc(message)}</p>${c.reciprocal?`<p>${esc(c.reciprocal.label)}</p>${[...c.reciprocal.discrepancies,...(c.reciprocal.unmatched || []),...(c.reciprocal.ambiguous || [])].map(r=>`<p>${esc(r.kind)} · QSO ${r.index+1}${r.counterpart?` · counterpart ${esc(`${utc(Math.floor(r.counterpart.ts/60000))} ${r.counterpart.band} ${r.counterpart.mode} ${r.counterpart.exchSent || ''} / ${r.counterpart.exchRcvd || ''}`)}`:''}</p>`).join('')}`:''}${e?.sourceKind?`<p>${esc(e.sourceKind)} · ${esc(e.coverage || '')}</p>`:''}<h4>Entrant activity ±15 minutes</h4>${timeline(nearby)}${c.indexes.map(i=>jump(i,`${qsos[i].call} #${qsos[i].qsoNumber ?? i+1}`)).join(' ')}${summary?`<h4>Counterpart observed activity</h4>${timeline(summary.rows)}`:''}${impact?`<p>${esc(impact.label)}</p>`:''}</details>`;
  return [String(priority(c)),counterpartLink(c.call),`${esc(utc(c.start))} – ${esc(utc(c.end))}<br>${c.elapsedMin}–${c.elapsedMax} min possible elapsed`,esc(c.bands.join(', ')),String(c.indexes.length),impact?esc(impact.creditLabel):'Not calculated',detail];
 });
 return `<section class="log-integrity-review"><div class="no-print"><label>Window (minutes) <input data-integrity-setting="windowMinutes" data-slot="${esc(slot)}" type="number" min="1" max="60" value="${model.windowMinutes}"></label> <label>Minimum bands <input data-integrity-setting="minBands" data-slot="${esc(slot)}" type="number" min="2" max="6" value="${model.minBands}"></label> <label>Call filter <input data-integrity-filter data-slot="${esc(slot)}" value="${esc(model.filter || '')}"></label> <button type="button" data-integrity-impact="${esc(slot)}">Calculate score impact</button> <button type="button" data-integrity-all="${esc(slot)}">Show all timelines</button></div><p>${esc(model.status || 'Full-log review')} · ${model.cases.length} candidate sequences. Timestamp intervals do not establish simultaneous transmissions.</p>${rows.length?table(['Review observations','Counterpart','UTC interval','Bands','Contacts','Multiplier impact','Evidence'],rows):'<p>No sequences match these thresholds. This is not a compliance finding.</p>'}<details class="report-more"><summary>More</summary><p>Window: ${esc(model.windowMinutes)} minutes; minimum bands: ${esc(model.minBands)}; call filter: ${esc(model.filter || 'none')}; displayed: ${cases.length} / ${model.cases.length} cases.</p><p>Rapid multiband sequences are review candidates, not findings of misconduct. Counts describe observed archive activity, not all contacts made. Independent reporting excludes observations originating from the entrant. Reconstructed frequencies are inherited from reporting stations. Missing sources and network failures do not establish zero activity.</p><p>Intervals use occupied UTC minutes. Contacts starting at the window endpoint are outside that window. Overlapping detections are grouped. Hypothetical scores, when available, use unchanged contest scoring with replacement contacts recalculated.</p>${Object.values(model.evidence || {}).filter(e=>e.source && /^https?:\/\//i.test(e.source)).map(e=>`<p><a href="${esc(e.source)}">${esc(e.path || e.source)}</a></p>`).join('')}</details></section>`;
}

export function renderCounterpartActivity(model,slot) {
 const activityRows=(model.counterpartCalls || []).filter(call=>!model.filter || call.includes(model.filter.toUpperCase())).map(call=>{
  const e=model.evidence?.[call],check=model.activityChecks?.[call];
  return [esc(call),esc(check?.label || (model.loading?'Checking…':'Not checked')),esc(e?.sourceKind || '—')];
 });
 const activity=activityRows.length?`<section class="integrity-counterpart-activity"><h3>Counterpart activity</h3><div class="no-print"><button type="button" class="button utility-primary-btn integrity-shard-action" data-integrity-load="${esc(slot)}" ${model.loading?'disabled':''}>${model.loading?'Checking shards…':'Recheck counterpart logs'}</button></div><p class="integrity-shard-help">Eligible off-RUN counterpart stations are checked automatically in the archive index. Counterpart logs are not downloaded.</p><p>A matching submitted or reconstructed log in the shards passes this availability check. Log contents are not downloaded; OK applies only to this check.</p>${table(['Counterpart','Availability check','Source'],activityRows)}</section>`:'';
 return activity;
}
