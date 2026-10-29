(() => {
  'use strict';
  // Minimum changes required to visit every band in an unordered minute and
  // end on `end`. Duplicate QSOs do not impose an invented within-minute order.
  function minimumStep(previous,bands,end) {
    if(bands.length===1) return previous==null || previous===end?0:1;
    if(previous==null) return bands.length-1;
    return bands.includes(previous) && previous!==end?bands.length-1:bands.length;
  }
  function check(model) {
    const p=model.profile;
    // A band+mode pair is one state: changing both simultaneously is one
    // transition. For single-mode categories the original band counter remains.
    const all=p.countMode?p.bands.flatMap(b=>['CW','SSB'].map(m=>`${b} ${m}`)):p.bands;
    const stateOf=e=>p.countMode?`${e.band} ${e.mode}`:e.band;
    const changeLabel=p.countMode?'band/mode':'band';
    const ids=p.perStream?['0','1']:['station'];
    const rows=[];
    for(const id of ids) {
      const valid=model.usable.filter(e=>!p.perStream || e.id===id);
      const barriers=[...model.invalid,...model.excluded].filter(e=>!p.perStream || !/^[01]$/.test(e.id) || e.id===id);
      const byMinute=new Map();
      for(const e of valid) {if(!byMinute.has(e.minute)) byMinute.set(e.minute,[]);byMinute.get(e.minute).push(e);}
      let previous=new Map([[null,0]]),hour=null,row=null,barrierIndex=0,lastMinute=null,lastIndex=null;
      const placedBarriers=barriers.filter(e=>e.minute!=null).sort((a,b)=>a.minute-b.minute);
      for(const [minute,group] of [...byMinute].sort((a,b)=>a[0]-b[0])) {
        const nextHour=Math.floor(minute/60)*60;
        if(nextHour!==hour) {
          hour=nextHour;
          previous=new Map([...previous.keys()].map(b=>[b,0]));
          if(model.hasUnknownTime) previous=new Map(all.map(b=>[b,0]));
          row={hour,id,limit:p.limit,count:0,uncertain:model.hasUnknownTime || previous.size>1,sequence:[],finding:false};
          rows.push(row);
        }
        let interrupted=false,barrierAtMinute=false;
        while(barrierIndex<placedBarriers.length && placedBarriers[barrierIndex].minute<=minute) {
          const barrier=placedBarriers[barrierIndex++];
          // An excluded/unknown contact before the first ordinary contact is
          // still an unknown prior band, including at a clock-hour boundary.
          if(lastMinute==null || barrier.minute>=lastMinute) interrupted=true;
          if(barrier.minute===minute) barrierAtMinute=true;
        }
        if(interrupted) {
          const cost=Math.min(...previous.values());
          previous=new Map(all.map(b=>[b,cost]));row.uncertain=true;
        }
        const bands=[...new Set(group.map(stateOf))].sort();
        const next=new Map();
        for(const end of bands) next.set(end,Math.min(...[...previous].map(([before,cost])=>cost+minimumStep(before,bands,end))));
        const count=Math.min(...next.values()),ambiguous=bands.length>1;
        const previousBands=[...previous.keys()].filter(Boolean);
        if(ambiguous) row.uncertain=true;
        if(count!==row.count || ambiguous || row.sequence.length===0 || interrupted) {
          row.sequence.push({minute,index:group[0].index,indexes:group.map(e=>e.index),bands,from:previousBands,count,ambiguous,interrupted,previousIndex:lastIndex});
        }
        row.count=count;
        if(count>p.limit && !row.finding) {
          model.findings.push({kind:'Changes',index:group[0].index,minute,id,band:bands.join(' / '),hour,priorIndex:lastIndex,minimum:row.uncertain || ambiguous,detail:`${row.uncertain?'At least ':''}${count} ${changeLabel} changes in UTC hour ${new Date(hour*60000).toISOString().slice(0,13).replace('T',' ')}:00; allowance ${p.limit}. ${row.uncertain?'By this minute the minimum exceeds the allowance; the exact first excess contact may be earlier.':'This contact establishes the change above the allowance.'} See the hour’s preceding band sequence.`});
          row.finding=true;
        }
        // A same-minute excluded/unknown record might occur after the known
        // contact. Its outgoing band cannot be assumed at the next boundary.
        previous=barrierAtMinute?new Map(all.map(b=>[b,count])):next;
        lastMinute=minute;lastIndex=bands.length===1 && !barrierAtMinute?group[0].index:null;
      }
      // Flag hours containing barriers even when no later ordinary QSO causes
      // a DP reset. An empty/zero stream must not look checked by omission.
      for(const b of placedBarriers) {
        const h=Math.floor(b.minute/60)*60;
        let own=rows.find(r=>r.id===id && r.hour===h);
        if(!own) {own={hour:h,id,limit:p.limit,count:0,uncertain:true,sequence:[],finding:false};rows.push(own);}
        own.uncertain=true;
      }
    }
    for(const row of rows) row.status=row.count>row.limit?(row.uncertain?'Over limit (minimum)':'Over limit'):row.uncertain?'Uncertain':row.count===row.limit?'At limit':'Within logged limit';
    model.hours=rows.sort((a,b)=>a.hour-b.hour || a.id.localeCompare(b.id));
    if(model.hours.some(h=>h.uncertain)) {
      model.status='Partial';
      model.notices.push('Uncertain hours show a minimum, not an exact count. No within-limit conclusion is made for incomplete or unordered evidence.');
    }
    if(!model.hours.length) model.status='Insufficient evidence';
    return model;
  }
  globalThis.SH6OperatingAuditChanges={check,minimumStep};
})();
