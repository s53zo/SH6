/* Operating restrictions are deliberately independent of contest scoring. */
(() => {
  'use strict';
  const sources = {
    CQWW: ['https://cqww.com/rules/','https://cqww.com/rules/faq.htm','https://cqww.com/cabrillo.htm'],
    WPX: ['https://cqwpx.com/rules/','https://cqwpx.com/rules_faq.htm','https://cqwpx.com/cabrillo.htm']
  };
  const profiles = Object.freeze([
    {id:'cqww-ms-2026',family:'CQWW',category:'M/S',year:2026,kind:'residence',minutes:10,perStream:true,section:'V.C.1; Multi-Single FAQ',restriction:'Independent 10-minute clocks for RUN (0) and MULT (1).'},
    {id:'cqww-m2-2026',family:'CQWW',category:'M/2',year:2026,kind:'changes',limit:8,perStream:true,section:'V.C.2; Multi-Two FAQ',restriction:'Maximum 8 band changes per UTC clock hour, independently per declared signal.'},
    {id:'wpx-ms-2026',family:'WPX',category:'M/S',year:2026,kind:'changes',limit:10,perStream:false,section:'VI.C.1; Multi-Operator FAQ',restriction:'Maximum 10 band changes per UTC clock hour, station-wide.'},
    {id:'wpx-m2-2026',family:'WPX',category:'M/2',year:2026,kind:'changes',limit:8,perStream:true,section:'VI.C.2; Multi-Operator FAQ',restriction:'Maximum 8 band changes per UTC clock hour, independently per declared transmitter.'}
  ].map(p=>Object.freeze({...p,modes:Object.freeze(['CW','SSB']),timestampPolicy:'UTC whole minutes',sources:Object.freeze(sources[p.family]),verified:'2026-10-29'})));
  function identify(meta = {}) {
    const contest=String(meta.contestId || '').trim().toUpperCase();
    const match=/^CQ-(WW|WPX)-(CW|SSB)$/.exec(contest);
    if(!match || /DISTRIBUTED/i.test(meta.categoryStation || '')) return null;
    const op=String(meta.categoryOperator || meta.category || '').trim().toUpperCase();
    const tx=String(meta.categoryTransmitter || '').trim().toUpperCase();
    const legacy=/^(M\/S|M\/2|MULTI-ONE|MULTI-SINGLE|MULTI-TWO)(?:\s|$)/.exec(op);
    const category=op==='MULTI-OP'?(tx==='ONE'?'M/S':tx==='TWO'?'M/2':null)
      :legacy?(/^(M\/2|MULTI-TWO)$/.test(legacy[1])?'M/2':'M/S'):null;
    if(!category) return null;
    // Conflicting explicit modern/legacy declarations are not guessed away.
    if(legacy && tx && tx!==(category==='M/S'?'ONE':'TWO')) return null;
    return {contest,family:match[1]==='WW'?'CQWW':'WPX',mode:match[2],category};
  }
  function resolve(meta,year) {
    const entry=identify(meta);
    return entry?profiles.find(p=>p.family===entry.family && p.category===entry.category && p.year===year) || null:null;
  }
  globalThis.SH6OperatingAuditProfiles={profiles,identify,resolve};
})();
