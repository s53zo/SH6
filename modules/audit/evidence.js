(() => {
  'use strict';
  const BANDS=Object.freeze(['160M','80M','40M','20M','15M','10M']);
  function minuteOf(q) {
    if(!Number.isFinite(q?.ts) || Math.abs(q.ts)>8640000000000000) return null;
    const date=String(q.raw?.QSO_DATE || '').replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3');
    const time=String(q.raw?.TIME_ON || '');
    if(date || time) {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}(?:\d{2})?$/.test(time)
        || Number(time.slice(0,2))>23 || Number(time.slice(2,4))>59 || Number(time.slice(4) || 0)>59) return null;
      const parsed=Date.parse(`${date}T${time.slice(0,2)}:${time.slice(2,4)}:00Z`);
      if(!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0,10)!==date) return null;
    }
    return Math.floor(q.ts/60000);
  }
  const validBand=b=>BANDS.includes(b);
  const modeKey=value=>({PH:'SSB',PHONE:'SSB',RY:'RTTY'}[String(value || '').toUpperCase()] || String(value || '').toUpperCase());
  function declaredId(q,cabrillo) {
    const explicit=q?.txId ?? q?.raw?.TX_ID;
    if(explicit!=null && String(explicit).trim()!=='') return String(explicit).trim();
    // Legacy Cabrillo headers may leave TX_ID unparsed. Read only the standard
    // CQ line shape; do not consume or rewrite exchanges in the source parser.
    const tokens=String(q?.rawLine || q?.raw?.RAW_LINE || '').trim().split(/\s+/);
    return cabrillo && tokens.length===12 && /^QSO:$/i.test(tokens[0]) && /^[01]$/.test(tokens[11])?tokens[11]:'';
  }
  function prepare(qsos=[],meta={},rawText='') {
    meta=globalThis.SH6OperatingAuditProfiles.sourceMeta(meta,rawText);
    if(!/^\s*START-OF-LOG:/im.test(rawText)
      && ['EUHFC','EU-HF','EUROPEAN HF CHAMPIONSHIP'].includes(String(meta.contestId || '').trim().toUpperCase())
      && qsos.some(q=>q.raw?.MODE!=null)) {
      // Apply the same distinction to parsed ADIF: MODE describes a contact;
      // only a category field (or a legacy category declaration) defines entry.
      meta={...meta,categoryMode:qsos.find(q=>q.raw?.CATEGORY_MODE)?.raw.CATEGORY_MODE || ''};
    }
    const detected=globalThis.SH6OperatingAuditProfiles.identify(meta);
    const model={applicable:!!detected,detected,findings:[],periods:[],hours:[],notices:[],checked:false,total:qsos.length,status:'Not applicable'};
    if(!detected) return model;
    if(!['CW','SSB','RTTY','MIXED'].includes(detected.mode)) {
      model.status='Insufficient evidence';
      model.notices.push('A declared CW, SSB or MIXED category mode is required; contact modes do not establish the entry category.');
      return model;
    }
    const cabrillo=/^\s*START-OF-LOG:/im.test(rawText);
    const entries=qsos.map((q,index)=>({q,index,minute:minuteOf(q),band:String(q?.band || '').toUpperCase(),mode:modeKey(q?.mode),id:declaredId(q,cabrillo)}));
    model.entries=entries;
    const years=[...new Set(entries.filter(e=>e.minute!=null).map(e=>new Date(e.minute*60000).getUTCFullYear()))];
    model.year=years.length===1?years[0]:null;
    model.profile=globalThis.SH6OperatingAuditProfiles.resolve(meta,model.year);
    if(!model.profile) {
      model.status=years.length?'Unsupported edition':'Insufficient evidence';
      if(detected.family==='EUHFC' && model.year===2022) {
        model.notices.push('EUHFC 2022 was cancelled. Its planned rules are not applied to logs.');
        return model;
      }
      model.notices.push(years.length?`This log’s edition is not supported; no compliance result is available. Verified editions for this category: ${globalThis.SH6OperatingAuditProfiles.coverage(meta)}.`:'No reliable timestamps establish the log edition; no timing audit can be performed.');
      return model;
    }
    const p=model.profile;
    model.notices.push(...(p.notices || []));
    if(p.perStream && !cabrillo) {
      model.status='Insufficient evidence';
      model.notices.push('A Cabrillo source with declared signal IDs is required. ADIF physical radio numbers and inferred operating styles are not stream assignments.');
      return model;
    }
    const bandOK=e=>p.bands.includes(e.band);
    const modeOK=e=>detected.mode==='MIXED'?['CW','SSB'].includes(e.mode):e.mode===detected.mode;
    model.invalid=entries.filter(e=>e.minute==null || !bandOK(e) || !modeOK(e) || p.perStream && !/^[01]$/.test(e.id));
    for(const e of model.invalid) model.findings.push({kind:'Data',index:e.index,minute:e.minute,id:e.id,band:e.band,detail:'Missing or invalid timestamp, contest band/mode, or required declared signal ID. Affected timing is uncertain.'});
    model.usable=entries.filter(e=>e.minute!=null && bandOK(e) && modeOK(e)).sort((a,b)=>a.minute-b.minute || a.index-b.index);
    model.start=entries.reduce((n,e)=>e.minute==null?n:Math.min(n,e.minute),Infinity);
    model.end=entries.reduce((n,e)=>e.minute==null?n:Math.max(n,e.minute+1),-Infinity);
    model.excluded=[];
    for(const line of String(rawText).split(/\r\n|\n|\r/)) {
      if(!/^\s*X-QSO:/i.test(line)) continue;
      const tokens=line.trim().split(/\s+/),date=tokens[3] || '',time=tokens[4] || '';
      const ts=/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{4}$/.test(time)?Date.parse(`${date}T${time.slice(0,2)}:${time.slice(2)}:00Z`):NaN;
      const valid=Number.isFinite(ts) && new Date(ts).toISOString().slice(0,10)===date;
      model.excluded.push({minute:valid?ts/60000:null,id:tokens.length===12 && /^[01]$/.test(tokens[11])?tokens[11]:''});
    }
    model.xCount=model.excluded.length;
    // Raw records skipped by the existing parser cannot silently become a
    // complete sequence. They are an unknown-time barrier, not new score data.
    model.unparsed=cabrillo?Math.max(0,(String(rawText).match(/^\s*QSO:/gim)||[]).length-qsos.length):0;
    model.coverage=entries.length?100*(entries.length-model.invalid.length)/entries.length:0;
    model.hasUnknownTime=entries.some(e=>e.minute==null) || model.unparsed>0 || model.excluded.some(e=>e.minute==null);
    if(model.unparsed) model.notices.push(`${model.unparsed} raw QSO records were not parsed. Hourly sequences may be incomplete.`);
    if(model.xCount) model.notices.push(`${model.xCount} X-QSO records are excluded from scoring. Their affected timing is uncertain; exclusion is not proof of permitted transmission.`);
    model.notices.push('Logged-contact audit, not a compliance certificate. Unlogged transmissions, CQ solicitation, simultaneous signals and hardware interlocks cannot be established.');
    model.checked=true;
    model.status=model.invalid.length || model.xCount || model.unparsed?'Partial':'Checked logged evidence';
    return model;
  }
  globalThis.SH6OperatingAuditEvidence={BANDS,minuteOf,validBand,prepare};
})();
