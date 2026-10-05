/* Completed-QSO evidence estimates activity; it does not measure TX/RX duration. */
(() => {
  'use strict';
  const MINUTE = 60000;
  const LABELS = { RUN: 'RUN', INBAND: 'INBAND S&P', SEARCH: 'Off-band S&P', MIXED: 'Mixed activity', UNKNOWN: 'Unclassified time', BREAK: 'Break time' };
  const normalizeGap = (value) => Math.max(1, Math.min(15, Math.round(Number(value) || 5)));
  const roleOf = (q) => !q.isQtc && Number.isFinite(q.freq) && ['RUN', 'INBAND', 'SEARCH'].includes(q.operatingStyleRole) ? q.operatingStyleRole : 'UNKNOWN';
  function radioOf(q, meta) {
    const explicit = q.radioId ?? q.txId ?? q.raw?.TX_ID ?? q.raw?.TRANSMITTER_ID ?? q.raw?.RADIO_ID ?? q.raw?.RADIO;
    if (explicit !== null && explicit !== undefined && explicit !== '') return String(explicit);
    // The existing Cabrillo parser intentionally consumes TX tails only for
    // multi-op logs. Read the unambiguous standard CQWW single-op tail solely
    // as supporting evidence, leaving parsed exchanges and scoring unchanged.
    const tokens = String(q.rawLine || '').trim().split(/\s+/);
    if (/CQ[- ]?WW|CQ-WW/i.test(meta.contestId || '') && tokens.length === 12 && tokens[0] === 'QSO:' && /^(0|1)$/.test(tokens[11])) return tokens[11];
    return null;
  }
  function build(qsos, meta = {}, options = {}) {
    const gap = normalizeGap(options.gapMinutes);
    const threshold = Math.max(2, Number(options.breakThreshold) || 15);
    const valid = (qsos || []).filter((q) => Number.isFinite(q?.ts)).slice().sort((a,b) => a.ts-b.ts || (a.qsoNumber || 0)-(b.qsoNumber || 0));
    const empty = { available: false, gap, threshold, rows: [], bands: [], hours: [], periods: [], sessions: [], dualMinutes: 0, missingTime: (qsos || []).length-valid.length };
    if (!valid.length) return empty;
    const first = Math.floor(valid[0].ts/MINUTE), last = Math.floor(valid[valid.length-1].ts/MINUTE);
    // Refuse pathological multi-year minute grids instead of blocking the UI.
    if (last-first > 1100000) return { ...empty, reason: 'Observation interval exceeds two years. Select a shorter period.' };
    const minutes = new Map(), streams = new Map();
    const add = (minute, band, role) => {
      if (!minutes.has(minute)) minutes.set(minute, new Map());
      const bands = minutes.get(minute);
      if (!bands.has(band)) bands.set(band, new Set());
      bands.get(band).add(role);
    };
    for (const q of valid) {
      const minute = Math.floor(q.ts/MINUTE), role = roleOf(q), band = q.band || 'Unknown';
      add(minute, band, role);
      if (q.isQtc) continue;
      const key = `${band}|${q.mode || ''}`;
      if (!streams.has(key)) streams.set(key, []);
      streams.get(key).push(q);
    }
    for (const stream of streams.values()) {
      for (let i=1; i<stream.length; i++) {
        const a=stream[i-1], b=stream[i], role=roleOf(a);
        if (role==='UNKNOWN' || role!==roleOf(b) || b.ts-a.ts>gap*MINUTE) continue;
        // A change of RUN frequency is a transition, not evidence of continued CQing.
        const radius = /SSB|PHONE/i.test(a.mode || '') ? .004 : .002;
        if (role==='RUN' && Math.abs(a.freq-b.freq)>radius+1e-9) continue;
        for (let m=Math.floor(a.ts/MINUTE)+1; m<Math.floor(b.ts/MINUTE); m++) add(m,a.band || 'Unknown',role);
      }
    }
    const occupied=Array.from(new Set(valid.map(q=>Math.floor(q.ts/MINUTE))));
    const breaks=new Set();
    for (let i=1; i<occupied.length; i++) {
      if (occupied[i]-occupied[i-1]>threshold) {
        for(let m=occupied[i-1]+1;m<occupied[i];m++) breaks.add(m);
      }
    }
    const totals=Object.fromEntries(Object.keys(LABELS).map(k=>[k,0]));
    const bandTotals=new Map(), hours=new Map(), states=[];
    const stateRole=(roles)=>roles.size===1 ? [...roles][0] : 'MIXED';
    for(let m=first;m<=last;m++) {
      const bands=minutes.get(m) || new Map(), roles=new Set();
      const runBands=[];
      for(const [band,set] of bands) {
        set.forEach(r=>roles.add(r));
        if (!bandTotals.has(band)) bandTotals.set(band,Object.fromEntries(Object.keys(LABELS).map(k=>[k,0])));
        if (!breaks.has(m)) bandTotals.get(band)[stateRole(set)]++;
        if(set.size===1 && set.has('RUN')) runBands.push(band);
      }
      const role=breaks.has(m)?'BREAK':roles.size?stateRole(roles):'UNKNOWN';
      totals[role]++;
      const hour=Math.floor(m/60)*60;
      if(!hours.has(hour)) hours.set(hour,{minute:hour,...Object.fromEntries(Object.keys(LABELS).map(k=>[k,0]))});
      hours.get(hour)[role]++;
      states.push({minute:m,role,runBands:role==='RUN'?runBands.sort():[]});
    }
    const periods=[], active=new Map();
    const lowerBound = ts => {
      let lo=0,hi=valid.length;
      while(lo<hi){const mid=(lo+hi)>>1;if(valid[mid].ts<ts)lo=mid+1;else hi=mid;}
      return lo;
    };
    const category=String(meta.categoryOperator || meta.category || '').toUpperCase();
    const operatorKind=category.includes('MULTI') || /^M[\/ ]?[12MS]/.test(category)?'multi':category.includes('SINGLE') || /^SO\b/.test(category)?'single':'unknown';
    const finish=(key,segment)=>{
      if(segment.end-segment.start+1<3) return;
      const supporting=valid.slice(lowerBound(segment.start*MINUTE),lowerBound((segment.end+1)*MINUTE)).filter(q=>!q.isQtc && q.operatingStyleRole==='RUN' && segment.bands.includes(q.band));
      const counts=segment.bands.map(band=>supporting.filter(q=>q.band===band));
      if(counts.some(list=>list.length<4 || list[list.length-1].ts-list[0].ts<2*MINUTE)) return;
      // Require a stable frequency for at least 80% of evidence on each band.
      if(counts.some(list=>{
        const frequencies=list.map(q=>q.freq).sort((a,b)=>a-b);
        let j=0,max=0;
        for(let i=0;i<frequencies.length;i++) {
          while(frequencies[i]-frequencies[j]>.004+1e-9) j++;
          max=Math.max(max,i-j+1);
        }
        return max/list.length<.8;
      })) return;
      let switches=0;
      for(let i=1;i<supporting.length;i++) if(supporting[i].band!==supporting[i-1].band) switches++;
      if(switches<4) return;
      const radios=Array.from(new Set(supporting.map(q=>radioOf(q,meta)).filter(v=>v!==null))).sort();
      periods.push({start:segment.start*MINUTE,end:(segment.end+1)*MINUTE,minutes:segment.end-segment.start+1,bands:segment.bands,qsos:supporting.length,counts:counts.map(list=>list.length),rate:supporting.length*60/(segment.end-segment.start+1),switches,radios,label:operatorKind==='single'?'Possible 2BSIQ':'Dual RUN',operatorKind});
    };
    for(const state of states) {
      const keys=new Set();
      for(let i=0;i<state.runBands.length;i++) for(let j=i+1;j<state.runBands.length;j++) {
        const bands=[state.runBands[i],state.runBands[j]], key=bands.join('|');
        keys.add(key);
        if(active.has(key)) active.get(key).end=state.minute;
        else active.set(key,{start:state.minute,end:state.minute,bands});
      }
      for(const [key,segment] of active) if(!keys.has(key)){finish(key,segment);active.delete(key);}
    }
    for(const [key,segment] of active) finish(key,segment);
    periods.sort((a,b)=>a.start-b.start || a.end-b.end);
    const dual=new Set(), dualBands=new Map();
    periods.forEach(p=>{for(let m=p.start/MINUTE;m<p.end/MINUTE;m++) {
      dual.add(m);
      if(!dualBands.has(m)) dualBands.set(m,new Set());
      p.bands.forEach(band=>dualBands.get(m).add(band));
    }});
    const dualLabel=operatorKind==='single'?'Possible 2BSIQ (subset of RUN)':'Dual RUN (subset of RUN)';
    const dualRow=(n,qsos,total)=>({role:'DUAL',label:dualLabel,subset:true,minutes:n,pct:total?n*100/total:0,qsos,rate:n?qsos*60/n:null});
    hours.forEach(h=>{h.DUAL=0;});
    dual.forEach(m=>{hours.get(Math.floor(m/60)*60).DUAL++;});
    // Preserve chronological placement: composition totals cannot locate activity in time.
    hours.forEach(h=>{h.timeline=[];});
    states.forEach(s=>{
      const h=hours.get(Math.floor(s.minute/60)*60), offset=s.minute-h.minute;
      const role=s.role==='RUN' && dual.has(s.minute)?'DUAL':s.role;
      const previous=h.timeline[h.timeline.length-1];
      if(previous && previous.role===role && previous.offset+previous.minutes===offset) previous.minutes++;
      else h.timeline.push({role,offset,minutes:1});
    });
    // Session grouping does not manufacture dual-RUN minutes across transitions.
    const sessions=[];
    for(const period of periods) {
      const previous=sessions[sessions.length-1];
      const distance=previous?(period.start-previous.end)/MINUTE:Infinity;
      const continued=previous && (distance<=0 || (distance<=gap
        && previous.segments.some(p=>p.end===previous.end && p.bands.some(b=>period.bands.includes(b)))
        && states.slice(previous.end/MINUTE-first,period.start/MINUTE-first).every(s=>s.role==='RUN')));
      if(continued) {previous.segments.push(period);previous.end=Math.max(previous.end,period.end);}
      else sessions.push({start:period.start,end:period.end,segments:[period],label:period.label});
    }
    sessions.forEach(session=>{
      const evidenceMinutes=new Set();
      session.segments.forEach(p=>{for(let m=p.start/MINUTE;m<p.end/MINUTE;m++) evidenceMinutes.add(m);});
      session.minutes=evidenceMinutes.size;
      session.spanMinutes=(session.end-session.start)/MINUTE;
      session.transitionMinutes=session.spanMinutes-session.minutes;
      session.bands=Array.from(new Set(session.segments.flatMap(p=>p.bands))).sort();
      session.radios=Array.from(new Set(session.segments.flatMap(p=>p.radios))).sort();
      session.qsos=valid.slice(lowerBound(session.start),lowerBound(session.end)).filter(q=>!q.isQtc && evidenceMinutes.has(Math.floor(q.ts/MINUTE)) && dualBands.get(Math.floor(q.ts/MINUTE))?.has(q.band)).length;
      session.rate=session.qsos*60/session.minutes;
    });
    const makeRows=(values,counts,total)=>Object.entries(LABELS).map(([role,label])=>({role,label,minutes:values[role] || 0,pct:total?(values[role] || 0)*100/total:0,qsos:counts[role] || 0,rate:values[role]>0 && ['RUN','INBAND','SEARCH'].includes(role)?(counts[role] || 0)*60/values[role]:null}));
    const counts={RUN:0,INBAND:0,SEARCH:0,UNKNOWN:0};
    // Rate numerators must match the exclusive elapsed-time denominator.
    const stateByMinute=new Map(states.map(s=>[s.minute,s.role]));
    valid.filter(q=>!q.isQtc).forEach(q=>{const role=stateByMinute.get(Math.floor(q.ts/MINUTE));counts[role]=(counts[role] || 0)+1;});
    const dualQsos=valid.filter(q=>!q.isQtc && dual.has(Math.floor(q.ts/MINUTE))).length;
    return {available:true,gap,threshold,start:first*MINUTE,end:(last+1)*MINUTE,elapsedMinutes:last-first+1,rows:makeRows(totals,counts,last-first+1),dualRow:dualRow(dual.size,dualQsos,last-first+1),bands:Array.from(bandTotals,([band,values])=>{
      const count={RUN:0,INBAND:0,SEARCH:0,UNKNOWN:0};
      valid.filter(q=>!q.isQtc && (q.band || 'Unknown')===band).forEach(q=>{const set=minutes.get(Math.floor(q.ts/MINUTE))?.get(band);const role=set?stateRole(set):'UNKNOWN';count[role]=(count[role] || 0)+1;});
      const total=Object.values(values).reduce((a,b)=>a+b,0);
      let overlap=0;dualBands.forEach(bands=>{if(bands.has(band))overlap++;});
      const dualCount=valid.filter(q=>!q.isQtc && (q.band || 'Unknown')===band && dualBands.get(Math.floor(q.ts/MINUTE))?.has(band)).length;
      return {band,minutes:total,rows:makeRows(values,count,total),dualRow:dualRow(overlap,dualCount,total)};
    }),hours:Array.from(hours.values()),states,periods,sessions,dualMinutes:dual.size,operatorKind,missingTime:empty.missingTime};
  }
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v).toFixed(1).replace(/\.0$/,'');
  const utc=ts=>new Date(ts).toISOString().slice(0,16).replace('T',' ')+'Z';
  const table=(heads,rows)=>`<div class="table-wrap"><table class="mtc operating-time-table"><thead><tr class="thc">${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${i%2?'td0':'td1'}">${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  function controls(gap=5) { return `<div class="operating-time-controls no-print"><label>Maximum activity gap: <input type="range" class="operating-time-gap" min="1" max="15" step="1" value="${normalizeGap(gap)}"> <output class="operating-time-gap-value">${normalizeGap(gap)}</output> minutes</label></div><p data-report-note data-note-title="Activity gap">The gap limit bridges nearby same-style QSOs. Style changes and unsupported gaps remain unclassified. The separate break threshold identifies breaks.</p>`; }
  function notes(model,{compact=false}={}) {
    if(!model.available) return '';
    const sp=model.rows.filter(r=>['INBAND','SEARCH'].includes(r.role)).reduce((n,r)=>n+r.minutes,0);
    return `<p>Estimated elapsed time: ${num(model.elapsedMinutes)} min (${utc(model.start)} to ${utc(model.end)}, end exclusive). S&amp;P subtotal: ${num(sp)} min. Activity gap: ${model.gap} min; break threshold: ${model.threshold} min. Completed contacts provide minute-resolution activity estimates, including the first and last occupied minutes. RUN already includes its dual-RUN subset.</p>${compact?'':`
      <p>Rates count contacts in the corresponding category’s minutes, including duplicates. Mixed activity retains its own contacts. QTCs are unclassified and interrupt breaks. Records without time excluded: ${model.missingTime}.</p>
      ${model.operatorKind==='single'?'<p>2BSIQ: one operator synchronizes exchanges on two RUN bands, transmitting one signal at a time. <a href="https://www.qsl.net/ct1boh/2bsiq/" target="_blank" rel="noopener">CT1BOH explanation</a>.</p>':'<p>Dual RUN indicates concurrent RUN activity on different bands, not a single-operator technique.</p>'}`}`;
  }
  function render(model,{compact=false,slot='A',showNotes=true}={}) {
    if(!model.available) return `<p>${esc(model.reason || 'No timed activity available for time analysis.')}</p>`;
    const withSubset=(rows,subset)=>rows.flatMap(r=>r.role==='RUN'?[r,subset]:[r]);
    const summary=table(['Estimated elapsed-time category','Minutes','Time %',...(compact?[]:['QSOs in these minutes','QSOs/hour'])],withSubset(model.rows,model.dualRow).map(r=>[esc(r.subset?'↳ '+r.label:r.label),num(r.minutes),num(r.pct)+'%',...(compact?[]:[num(r.qsos),r.rate==null?'—':num(r.rate)])]));
    const missingNotice=model.missingTime?`<p class="state-warning">${model.missingTime} records without time excluded from this estimate.</p>`:'';
    const note=showNotes?`<details class="operating-analysis-details"><summary>Analysis details</summary>${notes(model,{compact})}</details>`:'';
    if(compact) return `<section class="operating-time-summary"><h3>Operating-style time</h3>${summary}${missingNotice}${note}</section>`;
    const chartLabels={RUN:'RUN (other)',DUAL:model.dualRow.label,...Object.fromEntries(Object.entries(LABELS).filter(([k])=>k!=='RUN'))};
    const blockLabels={RUN:'RUN',DUAL:model.operatorKind==='single'?'2BSIQ':'Dual RUN',INBAND:'INBAND',SEARCH:'S&P',MIXED:'Mixed',UNKNOWN:'Unclassified',BREAK:'Break'};
    const bars=model.hours.map(h=>{
      const ranges=h.timeline.map(r=>{
        const from=utc((h.minute+r.offset)*MINUTE),to=utc((h.minute+r.offset+r.minutes)*MINUTE);
        const label=`${chartLabels[r.role]}: ${from} to ${to} (exclusive), ${r.minutes} min`;
        return `<span class="operating-time-block operating-time-${r.role.toLowerCase()}" style="left:${r.offset/60*100}%;width:${r.minutes/60*100}%" title="${esc(label)}"><span class="operating-time-block-label">${esc(blockLabels[r.role])}</span></span>`;
      }).join('');
      return `<div class="operating-time-hour"><span>${esc(utc(h.minute*MINUTE))}</span><div class="operating-time-stack" role="img" aria-label="${esc(utc(h.minute*MINUTE)+': '+h.timeline.map(r=>`${chartLabels[r.role]} minute ${r.offset}–${r.offset+r.minutes}`).join(', '))}">${ranges}<span class="operating-time-minute-grid" aria-hidden="true"></span></div><button type="button" class="operating-time-drill no-print" data-slot="${esc(slot)}" data-start="${h.minute*MINUTE}" data-end="${(h.minute+60)*MINUTE}" aria-label="Show QSOs for ${esc(utc(h.minute*MINUTE))}">QSOs</button></div>`;
    }).join('');
    const bandRows=model.bands.flatMap(b=>withSubset(b.rows,b.dualRow).filter(r=>r.minutes).map(r=>[esc(b.band),esc(r.subset?'↳ '+r.label:r.label),num(r.minutes),num(r.pct)+'%',num(r.qsos),r.rate==null?'—':num(r.rate)]));
    return `<section class="operating-time-summary"><h3>Operating-style time</h3>${summary}${missingNotice}
      <h3>Hourly operating-style timeline</h3><div class="operating-time-legend">${Object.keys(chartLabels).map(k=>`<span><i class="operating-time-${k.toLowerCase()}"></i>${esc(chartLabels[k])}</span>`).join('')}</div><p data-report-note data-note-title="Timeline key">Thin lines mark minutes; stronger lines mark five minutes. Hover blocks for UTC intervals. Blank areas are outside the observed log span.</p><div class="operating-time-hour operating-time-ruler" aria-hidden="true"><span>Minute within hour</span><div class="operating-time-axis"><span>00</span><span>15</span><span>30</span><span>45</span><span>60</span></div><span class="operating-time-ruler-spacer no-print"></span></div>${bars}
      <details><summary>Per-band activity minutes</summary><p>Band minutes overlap and may exceed elapsed station time. Each band minute is counted once. Subset rows are included in RUN.</p>${table(['Band','Style','Activity min','Band time %','QSOs','QSOs/hour'],bandRows)}</details>
      ${note}</section>`;
  }
  function csv(model) {
    const rows=[['Section','Band/style','From UTC','To UTC exclusive','Minutes','Time percent','QSOs','QSOs/hour','Evidence'],['settings','Maximum activity gap','','',model.gap],['settings','Break threshold','','',model.threshold]];
    model.rows.forEach(r=>rows.push(['elapsed',r.label,model.start?utc(model.start):'',model.end?utc(model.end):'',r.minutes,r.pct,r.qsos,r.rate]));
    if(model.dualRow) {const r=model.dualRow;rows.push(['elapsed subset',r.label,utc(model.start),utc(model.end),r.minutes,r.pct,r.qsos,r.rate,'Already included in RUN']);}
    model.bands.forEach(b=>b.rows.forEach(r=>rows.push(['band',`${b.band} ${r.label}`,'','',r.minutes,r.pct,r.qsos,r.rate])));
    model.bands.forEach(b=>{const r=b.dualRow;rows.push(['band subset',`${b.band} ${r.label}`,'','',r.minutes,r.pct,r.qsos,r.rate,'Already included in band RUN']);});
    model.hours.forEach(h=>Object.keys(LABELS).forEach(k=>rows.push(['hourly',LABELS[k],utc(h.minute*MINUTE),utc((h.minute+60)*MINUTE),h[k]])));
    model.hours.forEach(h=>rows.push(['hourly subset',model.dualRow.label,utc(h.minute*MINUTE),utc((h.minute+60)*MINUTE),h.DUAL,'','','','Already included in hourly RUN']));
    model.sessions.forEach(s=>rows.push(['dual RUN session',s.bands.join(' + '),utc(s.start),utc(s.end),s.minutes,'',s.qsos,s.rate,`${s.label}; ${s.spanMinutes} span minutes; ${s.transitionMinutes} transition minutes; ${s.segments.length} band-pair segments; radio IDs: ${s.radios.join(', ') || 'unavailable'}`]));
    model.periods.forEach(p=>rows.push(['dual RUN',p.bands.join(' + '),utc(p.start),utc(p.end),p.minutes,'',p.qsos,p.rate,`${p.label}; ${p.switches} alternations; radio IDs: ${p.radios.join(', ') || 'unavailable'}`]));
    return rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  }
  globalThis.SH6OperatingTime={build,render,notes,controls,csv,normalizeGap};
})();
