/* Shared operating audit facade and CQWW residence checks. Public ID/API kept. */
(() => {
  'use strict';
  if(!globalThis.SH6OperatingAuditProfiles || !globalThis.SH6OperatingAuditEvidence || !globalThis.SH6OperatingAuditChanges || !globalThis.SH6OperatingAuditView) return;
  const MINUTE = 60000;
  const utc = v => new Date(v*MINUTE).toISOString().slice(0,16).replace('T',' ')+'Z';
  function applicable(meta = {}) {
    return !!globalThis.SH6OperatingAuditProfiles.identify(meta);
  }
  function build(qsos = [], meta = {}, rawText = '') {
    const model=globalThis.SH6OperatingAuditEvidence.prepare(qsos,meta,rawText);
    if(!model.checked) return model;
    return model.profile.kind==='changes'?globalThis.SH6OperatingAuditChanges.check(model):checkResidence(model);
  }
  function checkResidence(model) {
    const {entries,usable,invalid,xCount,findings,periods}=model;
    const unplacedEvidence=usable.length!==entries.length || model.unparsed>0;
    const seen=new Map(), multStatus=model.profile.multiplierBasis==='prefix'?prefixEligibility(model,unplacedEvidence):new Map();
    // Resolve newness against all earlier station contacts, not just signal 1.
    for (let i=0;model.profile.multiplierBasis!=='prefix' && i<usable.length;) {
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
    const partial=invalid.length>0 || xCount>0 || model.unparsed>0;
    for(const id of ['0','1']) {
      const own=usable.filter(e=>e.id===id);
      let current=null, tainted=partial;
      for(let i=0;i<own.length;) {
        let end=i+1;while(end<own.length && own[end].minute===own[i].minute) end++;
        const observed=own.slice(i,end);
        // Only a qualifying new multiplier can establish the MULT clock.
        // Keep doubtful contacts as findings, not phantom band-period starts.
        // Do not silently reassign their declared signal or modify the log.
        const group=id==='1'?observed.filter(item=>multStatus.get(item.index)):observed;
        if(group.length!==observed.length) tainted=true;
        if(!group.length) {i=end;continue;}
        if(new Set(group.map(e=>e.band)).size>1) {
          // Minute precision alone is not a user-facing finding. Keep the
          // uncertainty internally so later transitions are not overclaimed.
          model.status='Partial';
          current=null;tainted=true;i=end;continue;
        }
        const e=group[0];
        if(current && current.band!==e.band) {
          const early=current.start+10-e.minute;
          if(early>0) {
            findings.push({kind:tainted?'Review':'Timing',index:e.index,anchorIndex:current.index,minute:e.minute,id,band:e.band,start:current.start,allowed:current.start+10,detail:`${current.band} → ${e.band}: ${early} min early against observed period starting ${utc(current.start)}. Earliest next band: ${utc(current.start+10)}.${tainted?' Provisional: incomplete or earlier conflicting evidence.':''}`});
            tainted=true;
          }
          current=null;
        }
        if(!current) {current={id,band:e.band,start:e.minute,last:e.minute,index:e.index};periods.push(current);}
        current.last=e.minute;
        i=end;
      }
    }
    if(findings.some(f=>f.kind==='Review' || f.kind==='Multiplier')) model.status='Partial';
    return model;
  }
  // WPX 2009 uses one prefix multiplier for the entire contest, unlike CQWW's
  // countries/zones per band. Reuse the analysis core's resolved prefix without
  // mutating contacts or maintaining a second, subtly different prefix parser.
  function prefixEligibility(model,unplacedEvidence) {
    const seen=new Set(),status=new Map();
    let unknown=false;
    for(let i=0;i<model.usable.length;) {
      let end=i+1;while(end<model.usable.length && model.usable[end].minute===model.usable[i].minute) end++;
      const facts=model.usable.slice(i,end).map(e=>{
        const value=String(e.q.wpxPrefix || '').trim().toUpperCase();
        const prefix=/[A-Z]/.test(value) && /^[A-Z0-9]+\d$/.test(value) && !/\/(?:MM|AM)$/i.test(e.q.call || '')?value:null;
        return {e,prefix};
      });
      for(const {e,prefix} of facts) {
        const tied=facts.some(f=>f.e!==e && (f.prefix===prefix || !f.prefix));
        const eligible=!!prefix && !seen.has(prefix) && !unknown && !tied && !unplacedEvidence;
        status.set(e.index,eligible);
        if(e.id==='1' && !eligible) model.findings.push({kind:'Multiplier',index:e.index,minute:e.minute,id:e.id,band:e.band,detail:prefix && seen.has(prefix)
          ?'This prefix was already logged, including contacts on other bands. Review multiplier-signal eligibility under the 2009 WPX rules.'
          :tied?'Prefix first-worked order is ambiguous within this logged minute.'
            :'Cannot establish a new prefix: resolved prefix or earlier evidence is incomplete.'});
      }
      for(const {prefix} of facts) {if(prefix)seen.add(prefix);else unknown=true;}
      i=end;
    }
    return status;
  }
  const render=(...args)=>globalThis.SH6OperatingAuditView.render(...args);
  globalThis.SH6OperatingAudit={applicable,build,render};
  globalThis.SH6CqwwMsAudit=globalThis.SH6OperatingAudit;
})();
