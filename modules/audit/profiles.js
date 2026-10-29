/* Operating restrictions are deliberately independent of contest scoring. */
(() => {
  'use strict';
  const sources = {
    CQWW: ['https://cqww.com/rules/','https://cqww.com/rules/faq.htm','https://cqww.com/cabrillo.htm'],
    WPX: ['https://cqwpx.com/rules/','https://cqwpx.com/rules_faq.htm','https://cqwpx.com/cabrillo.htm']
  };
  // Every enabled edition is backed by the annual source inventory in
  // docs/operating-rules-editions.json; gaps are never inferred from neighbours.
  const profiles = Object.freeze([
    {id:'cqww-ms',family:'CQWW',category:'M/S',firstYear:2000,lastYear:2026,kind:'residence',minutes:10,perStream:true,multiplierBasis:'country-zone',restriction:'Independent 10-minute clocks for RUN (0) and MULT (1).'},
    {id:'cqww-m2',family:'CQWW',category:'M/2',firstYear:2002,lastYear:2026,kind:'changes',limit:8,perStream:true,restriction:'Maximum 8 band changes per UTC clock hour, independently per declared signal.'},
    {id:'wpx-ms',family:'WPX',category:'M/S',firstYear:2010,lastYear:2026,kind:'changes',limit:10,perStream:false,restriction:'Maximum 10 band changes per UTC clock hour, station-wide.'},
    {id:'wpx-m2',family:'WPX',category:'M/2',firstYear:2003,lastYear:2026,kind:'changes',limit:8,perStream:true,restriction:'Maximum 8 band changes per UTC clock hour, independently per declared transmitter.'},
    {id:'wpx-ms',family:'WPX',category:'M/S',firstYear:2009,lastYear:2009,kind:'residence',minutes:10,perStream:true,multiplierBasis:'prefix',restriction:'2009 rules: independent 10-minute RUN/MULT clocks; MULT contacts must be new prefixes across the whole log.'}
  ].map(p=>Object.freeze({...p,modes:Object.freeze(['CW','SSB']),timestampPolicy:'UTC whole minutes',verified:'2026-10-29'})));
  function editionSource(family,year) {
    return family==='CQWW'?`https://cqww.com/rules/${year}_rules_cqww.${year<2002?'htm':'pdf'}`:`https://cqwpx.com/rules/${year}_cqwpx_rules.pdf`;
  }
  function sectionFor(p,year) {
    const number=p.category==='M/S'?'1':'2';
    if(p.family==='CQWW') return `${year<2008?'III.C':year<2012?'III.B':year===2012?'IV.B':'V.C'}.${number}`;
    if(year<2009) return `Categories 2(${number==='1'?'a':'b'})`;
    if(year===2016) return 'Multi-Operator Categories (official 2016 announcement); clock-hour interpretation: official FAQ';
    return year<2014?`V.D.${number==='1'?'a':'b'}`:`VI.C.${number}`;
  }
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
    if(!entry || !Number.isInteger(year)) return null;
    const p=profiles.find(p=>p.family===entry.family && p.category===entry.category && year>=p.firstYear && year<=p.lastYear);
    if(!p) return null;
    const extra=p.family==='CQWW' && p.kind==='residence' && year<2011?['https://cqww.com/history.htm']
      :p.family==='WPX' && year===2009 && p.kind==='residence'?['https://cqwpx.com/blog/survey-results-3-multi-single/']:[];
    return Object.freeze({...p,id:`${p.id}-${year}`,year,section:sectionFor(p,year),
      sources:Object.freeze([editionSource(p.family,year),...sources[p.family].slice(1),...extra]),
      sourceLabels:Object.freeze([`${year} official rules`,'Official FAQ (current)','Cabrillo specification',...extra.map(()=> 'Historical interpretation')])});
  }
  function coverage(meta) {
    const entry=identify(meta);
    if(!entry) return '';
    return profiles.filter(p=>p.family===entry.family && p.category===entry.category)
      .sort((a,b)=>a.firstYear-b.firstYear).map(p=>p.firstYear===p.lastYear?String(p.firstYear):`${p.firstYear}–${p.lastYear}`).join(', ');
  }
  globalThis.SH6OperatingAuditProfiles={profiles,identify,resolve,coverage};
})();
