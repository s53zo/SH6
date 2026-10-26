/* CQWW functional signal audit. Never changes parsed contacts or scoring. */
(() => {
  'use strict';
  const MINUTE = 60000;
  const BANDS = new Set(['160M','80M','40M','20M','15M','10M']);
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const utc = v => new Date(v*MINUTE).toISOString().slice(0,16).replace('T',' ')+'Z';
  function applicable(meta = {}) {
    const contest = String(meta.contestId || '').toUpperCase();
    const op = String(meta.categoryOperator || meta.category || '').toUpperCase();
    const tx = String(meta.categoryTransmitter || '').toUpperCase();
    return /^CQ-WW-(CW|SSB)$/.test(contest) && !/DISTRIBUTED/i.test(meta.categoryStation || '')
      && ((op==='MULTI-OP' && tx==='ONE') || /^(M\/S|MULTI-ONE|MULTI-SINGLE)(?:\s|$)/.test(op));
  }
  function build(qsos = [], meta = {}, rawText = '') {
    const findings=[], periods=[], notices=[];
    const model={applicable:applicable(meta),findings,periods,notices,checked:false,total:qsos.length};
    if (!model.applicable) return model;
    const years=[...new Set(qsos.filter(q=>Number.isFinite(q.ts)).map(q=>new Date(q.ts).getUTCFullYear()))];
    if (years.length!==1 || years[0]!==2026) {
      notices.push('Timing and multiplier checks are currently verified against the 2026 rules only. This log’s edition is not supported; no compliance result is available.');
      return model;
    }
    // ADIF radio numbers are physical identifiers, not Cabrillo RUN/MULT roles.
    if (!/^START-OF-LOG:/im.test(rawText)) {
      notices.push('A Cabrillo source with declared functional signal IDs is required. ADIF radio numbers and inferred operating styles are not RUN/MULT assignments.');
      return model;
    }
    const xCount=(rawText.match(/^\s*X-QSO:/gim)||[]).length;
    if (xCount) notices.push(`${xCount} X-QSO records are excluded from scoring. Their timing implications require review; all timing findings are provisional.`);
    const entries=qsos.map((q,index)=>({q,index,minute:Math.floor(q.ts/MINUTE),id:String(q.txId ?? q.raw?.TX_ID ?? '').trim(),band:String(q.band || '').toUpperCase()}));
    const invalid=entries.filter(e=>!Number.isFinite(e.q.ts) || !BANDS.has(e.band) || !['0','1'].includes(e.id));
    for (const e of invalid) findings.push({kind:'Data',index:e.index,minute:Number.isFinite(e.minute)?e.minute:null,id:e.id,band:e.band,detail:'Missing/invalid timestamp, contest band or functional signal ID. Timing coverage is incomplete.'});
    const usable=entries.filter(e=>Number.isFinite(e.q.ts) && BANDS.has(e.band)).sort((a,b)=>a.minute-b.minute || a.index-b.index);
    const unplacedEvidence=entries.some(e=>!Number.isFinite(e.q.ts) || !BANDS.has(e.band));
    const seen=new Map(), multStatus=new Map();
    // Resolve newness against all earlier station contacts, not just signal 1.
    for (let i=0;i<usable.length;) {
      let end=i+1;while(end<usable.length && usable[end].minute===usable[i].minute) end++;
      const group=usable.slice(i,end), facts=[];
      for (const e of group) {
        if (!seen.has(e.band)) seen.set(e.band,{countries:new Set(),zones:new Set(),unknownCountry:false,unknownZone:false});
        const s=seen.get(e.band), mm=/\/MM$/i.test(e.q.call || '');
        const country=!mm && e.q.country && !/^(unknown|unresolved)$/i.test(e.q.country)?String(e.q.country):null;
        const z=Number(e.q.raw?.CQZ ?? e.q.raw?.CQ_ZONE ?? e.q.exchRcvd ?? e.q.raw?.SRX_STRING ?? e.q.cqZone);
        const zone=Number.isInteger(z) && z>=1 && z<=40?z:null;
        const freshCountry=country && !s.countries.has(country) && !s.unknownCountry;
        const freshZone=zone && !s.zones.has(zone) && !s.unknownZone;
        facts.push({e,country,zone,mm,freshCountry,freshZone});
      }
      for (const f of facts) {
        const {e,country,zone,mm,freshCountry,freshZone}=f,s=seen.get(e.band);
        const countryTied=facts.some(g=>g!==f && g.e.band===e.band && (country===g.country || !g.country && !g.mm));
        const zoneTied=facts.some(g=>g!==f && g.e.band===e.band && (zone===g.zone || !g.zone));
        const tied=Boolean(freshCountry && countryTied || freshZone && zoneTied);
        const eligible=Boolean((freshCountry && !countryTied || freshZone && !zoneTied) && !unplacedEvidence);
        multStatus.set(e.index,eligible);
        if(e.id==='1' && !eligible) {
          const oldCountry=mm || (country && s.countries.has(country));
          const oldZone=zone && s.zones.has(zone);
          findings.push({kind:'Multiplier',index:e.index,minute:e.minute,id:e.id,band:e.band,detail:oldCountry && oldZone
            ? 'No new country or zone on this band in the earlier logged contacts. Review multiplier-signal eligibility; adjudicated credit may differ.'
            : tied?'Multiplier first-worked order is ambiguous within this logged minute.'
              :'Cannot establish a new multiplier: country/zone data or earlier evidence is incomplete.'});
        }
      }
      for(const f of facts) {
        const s=seen.get(f.e.band);
        if(f.country) s.countries.add(f.country);else if(!f.mm) s.unknownCountry=true;
        if(f.zone) s.zones.add(f.zone);else s.unknownZone=true;
      }
      i=end;
    }
    const partial=invalid.length>0 || xCount>0;
    for(const id of ['0','1']) {
      const own=usable.filter(e=>e.id===id);
      let current=null, tainted=partial;
      for(let i=0;i<own.length;) {
        let end=i+1;while(end<own.length && own[end].minute===own[i].minute) end++;
        const group=own.slice(i,end);
        if(new Set(group.map(e=>e.band)).size>1) {
          // Minute precision alone is not a user-facing finding. Keep the
          // uncertainty internally so later transitions are not overclaimed.
          current=null;tainted=true;i=end;continue;
        }
        const e=group[0];
        if(current && current.band!==e.band) {
          const early=current.start+10-e.minute;
          if(early>0) {
            findings.push({kind:tainted?'Review':'Timing',index:e.index,minute:e.minute,id,band:e.band,start:current.start,allowed:current.start+10,detail:`${current.band} → ${e.band}: ${early} min early against observed period starting ${utc(current.start)}. Earliest next band: ${utc(current.start+10)}.${tainted?' Provisional: incomplete or earlier conflicting evidence.':''}`});
            tainted=true;
          }
          current=null;
        }
        if(id==='1' && group.some(item=>!multStatus.get(item.index))) tainted=true;
        if(!current) {current={id,band:e.band,start:e.minute,last:e.minute,index:e.index};periods.push(current);}
        current.last=e.minute;
        i=end;
      }
    }
    model.checked=true;
    model.coverage=entries.length?100*(entries.length-invalid.length)/entries.length:0;
    model.xCount=xCount;
    notices.push('Logged-contact audit, not a compliance certificate. CQing, unlogged transmissions, actual signal overlap and same-band interlock compliance cannot be proved from QSO timestamps.');
    return model;
  }
  const table=(headers,rows)=>`<div class="table-wrap"><table class="mtc"><thead><tr class="thc">${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  function render(model,qsos=[],slot='A') {
    if(!model.applicable) return '<p>This log is not CQWW CW/SSB Multi-Single.</p>';
    const notes=model.notices.map(t=>`<p class="state-warning">${esc(t)}</p>`).join('');
    if(!model.checked) return notes;
    const groups=['Timing','Multiplier','Data','Review'];
    const counts=groups.map(k=>`${k}: ${model.findings.filter(f=>f.kind===k).length}`).join(' · ');
    const link=(f,text,extra='')=>`<button class="cqww-ms-qso ${extra}" data-slot="${esc(slot)}" data-index="${f.index}" type="button" title="Open log context: 15 minutes before and after">${esc(text)}</button>`;
    const findings=model.findings.map(f=>[esc(f.kind),f.minute==null?'—':esc(utc(f.minute)),esc(f.id==='0'?'RUN (0)':f.id==='1'?'MULT (1)':f.id||'Missing'),esc(f.band),link(f,`${qsos[f.index]?.call || 'QSO'} #${f.index+1}`),link(f,f.detail,'cqww-ms-case')]);
    const first=model.periods.length?Math.min(...model.periods.map(p=>p.start)):0;
    const last=model.periods.length?Math.max(...model.periods.map(p=>Math.max(p.last+1,p.start+10))):first+1;
    const lane=id=>`<div class="cqww-ms-lane"><b>${id==='0'?'RUN (0)':'MULT (1)'}</b><div class="cqww-ms-track" role="img" aria-label="${id==='0'?'RUN':'Multiplier'} observed band periods and ten-minute locks">${model.periods.filter(p=>p.id===id).map(p=>`<span class="cqww-ms-lock" style="left:${100*(p.start-first)/(last-first)}%;width:${100*10/(last-first)}%" title="${esc(`${p.band}: ${utc(p.start)}; earliest next band ${utc(p.start+10)}`)}">${esc(p.band)}</span>`).join('')}</div></div>`;
    return `<section class="cqww-ms-audit"><p>Full-log audit · 2026 CQWW rules · ${model.total} QSOs · ${model.coverage.toFixed(1)}% usable signal/timing data. Display filters do not restrict this audit.</p><p>${esc(counts)}. ${model.findings.length?'Review the evidence below.':'No displayed findings; this is not proof of compliance.'}</p>${notes}
      <h3>Independent ten-minute locks</h3><p>${esc(utc(first))} → ${esc(utc(last))}. Brackets mark ten minutes from each observed band-period start; hover for exact UTC times.</p>${lane('0')}${lane('1')}
      <h3>Findings</h3>${findings.length?table(['Type','UTC','Signal','Band','QSO','Evidence'],findings):'<p>No findings.</p>'}
      <details><summary>Band periods and earliest next-band times</summary>${table(['Signal','Band','First QSO UTC','Earliest next band UTC'],model.periods.map(p=>[p.id==='0'?'RUN (0)':'MULT (1)',esc(p.band),esc(utc(p.start)),esc(utc(p.start+10))]))}</details>
      <details class="report-more"><summary>More</summary><p>Signal IDs are declared Cabrillo functions, not physical radios or inferred RUN/S&amp;P classifications. Same-minute order, X-QSO and findings after uncertain transitions require review. Multiplier newness is evaluated across both signals; unresolved lookups are never treated as a definite new multiplier. No contacts or scores are changed.</p><p><a href="https://cqww.com/rules/">2026 rules</a> · <a href="https://cqww.com/rules/faq.htm">Official M/S FAQ</a></p></details></section>`;
  }
  globalThis.SH6CqwwMsAudit={applicable,build,render};
})();
