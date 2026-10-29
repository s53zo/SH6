/* Operating restrictions are deliberately independent of contest scoring. */
(() => {
  'use strict';
  const sources = {
    CQWW: ['https://cqww.com/rules/','https://cqww.com/rules/faq.htm','https://cqww.com/cabrillo.htm'],
    WPX: ['https://cqwpx.com/rules/','https://cqwpx.com/rules_faq.htm','https://cqwpx.com/cabrillo.htm']
  };
  // Every enabled edition is backed by the annual source inventory in
  // docs/operating-rules-editions.json; gaps are never inferred from neighbours.
  const existing = [
    {id:'cqww-ms',family:'CQWW',category:'M/S',firstYear:2000,lastYear:2026,kind:'residence',minutes:10,perStream:true,multiplierBasis:'country-zone',restriction:'Independent 10-minute clocks for RUN (0) and MULT (1).'},
    {id:'cqww-m2',family:'CQWW',category:'M/2',firstYear:2002,lastYear:2026,kind:'changes',limit:8,perStream:true,restriction:'Maximum 8 band changes per UTC clock hour, independently per declared signal.'},
    {id:'wpx-ms',family:'WPX',category:'M/S',firstYear:2010,lastYear:2026,kind:'changes',limit:10,perStream:false,restriction:'Maximum 10 band changes per UTC clock hour, station-wide.'},
    {id:'wpx-m2',family:'WPX',category:'M/2',firstYear:2003,lastYear:2026,kind:'changes',limit:8,perStream:true,restriction:'Maximum 8 band changes per UTC clock hour, independently per declared transmitter.'},
    {id:'wpx-ms',family:'WPX',category:'M/S',firstYear:2009,lastYear:2009,kind:'residence',minutes:10,perStream:true,multiplierBasis:'prefix',restriction:'2009 rules: independent 10-minute RUN/MULT clocks; MULT contacts must be new prefixes across the whole log.'}
  ];
  const fiveBands=['80M','40M','20M','15M','10M'];
  const additions=[];
  for(const [family,category,periods] of [
    ['WWRTTY','M/S',[[2007,2008,6],[2009,2026,8]]],
    ['WWRTTY','M/2',[[2007,2008,6],[2009,2026,8]]],
    ['WPXRTTY','M/S',[[2007,2008,6],[2009,2010,8],[2011,2026,10]]],
    ['WPXRTTY','M/2',[[2007,2008,6],[2009,2010,8],[2011,2011,10],[2012,2026,8]]]
  ]) for(const [firstYear,lastYear,limit] of periods) {
    const signalRoles=family==='WWRTTY' && category==='M/S',perStream=signalRoles || category==='M/2';
    additions.push({id:`${family.toLowerCase()}-${category==='M/S'?'ms':'m2'}`,family,category,firstYear,lastYear,kind:'changes',limit,perStream,signalRoles,modes:['RTTY'],bands:fiveBands,
      restriction:`Maximum ${limit} band changes per UTC clock hour, ${signalRoles?'independently for RUN (0) and MULT (1)':perStream?'independently per declared transmitter':'station-wide'}.`});
  }
  additions.push(
    {id:'arrldx-ms',family:'ARRLDX',category:'M/S',firstYear:2012,lastYear:2021,kind:'changes',limit:6,perStream:false,restriction:'2012–2021 rules: maximum 6 band changes per UTC clock hour, station-wide.'},
    {id:'arrldx-m2',family:'ARRLDX',category:'M/2',firstYear:2012,lastYear:2021,kind:'changes',limit:6,perStream:true,restriction:'Maximum 6 band changes per UTC clock hour, independently per declared transmitter.'},
    {id:'arrldx-ms',family:'ARRLDX',category:'M/S',firstYear:2022,lastYear:2026,kind:'changes',limit:10,perStream:false,restriction:'Maximum 10 band changes per UTC clock hour, station-wide.'},
    {id:'arrldx-m2',family:'ARRLDX',category:'M/2',firstYear:2022,lastYear:2026,kind:'changes',limit:6,perStream:true,restriction:'Maximum 6 band changes per UTC clock hour, independently per declared transmitter.'},
    {id:'euhfc-so',family:'EUHFC',category:'SO',firstYear:2010,lastYear:2026,years:[2010, 2012, 2013, 2014, 2016, 2017, 2018, 2020, 2025, 2026],kind:'changes',limit:10,perStream:false,modes:['CW','SSB','MIXED'],
      restriction:'Maximum 10 changes per UTC clock hour: band and mode together count as one change in Mixed; band changes in single-mode categories.'}
  );
  const profiles=Object.freeze([...existing,...additions].map(p=>Object.freeze({...p,
    modes:Object.freeze(p.modes || ['CW','SSB']),bands:Object.freeze(p.bands || ['160M',...fiveBands]),
    ...(p.years?{years:Object.freeze(p.years)}:{}),timestampPolicy:'UTC whole minutes',verified:'2026-10-29'})));
  const editionOverrides={
  "ARRLDX": {
    "2012": "https://web.archive.org/web/20120323050150id_/http://www.arrl.org/arrl-dx",
    "2013": "https://web.archive.org/web/20130308233859id_/http://www.arrl.org/arrl-dx",
    "2014": "https://web.archive.org/web/20140214013059id_/http://www.arrl.org/arrl-dx",
    "2015": "https://web.archive.org/web/20150110234939id_/http://www.arrl.org:80/arrl-dx",
    "2016": "https://web.archive.org/web/20160112184220id_/http://www.arrl.org/arrl-dx",
    "2017": "https://web.archive.org/web/20170104134129id_/http://www.arrl.org/arrl-dx",
    "2018": "https://web.archive.org/web/20180125152009id_/http://www.arrl.org:80/arrl-dx",
    "2019": "https://web.archive.org/web/20190102041600id_/http://www.arrl.org:80/arrl-dx/",
    "2020": "https://web.archive.org/web/20200107024027id_/http://www.arrl.org/arrl-dx",
    "2021": "https://web.archive.org/web/20210127003542id_/https://contests.arrl.org/ContestRules/DX-Rules.pdf",
    "2022": "https://web.archive.org/web/20220122072613id_/https://contests.arrl.org/ContestRules/DX-Rules.pdf",
    "2023": "https://web.archive.org/web/20230305174357id_/https://contests.arrl.org/ContestRules/DX-Rules.pdf",
    "2024": "https://web.archive.org/web/20240108111024id_/https://contests.arrl.org/ContestRules/DX-Rules.pdf",
    "2025": "https://web.archive.org/web/20250306095139id_/https://contests.arrl.org/ContestRules/DX-Rules.pdf",
    "2026": "https://contests.arrl.org/ContestRules/DX-Rules.pdf"
  },
  "EUHFC": {
    "2012": "https://web.archive.org/web/20120804233748/http://lea.hamradio.si/scc/euhf/euhfcrules.htm",
    "2014": "https://web.archive.org/web/20140413032800/http://lea.hamradio.si/scc/euhf/euhfcrules.htm",
    "2010": "https://web.archive.org/web/20100822134746/http://lea.hamradio.si/scc/euhf/euhfcrules.htm",
    "2013": "https://s5cc.eu/arhiv/scc_novice/2013_1.pdf",
    "2017": "https://web.archive.org/web/20170807180129id_/http://lea.hamradio.si/scc/euhf/euhfcrules_eng.pdf",
    "2018": "https://web.archive.org/web/20180110134202/http://lea.hamradio.si/scc/euhf/euhfcrules.htm",
    "2016": "https://web.archive.org/web/20170510044719/http://lea.hamradio.si/scc/euhf/euhfcrules.htm",
    "2020": "https://web.archive.org/web/20200809080530/http://lea.hamradio.si/scc/euhf/euhfcrules.htm",
    "2026": "https://euhf.s5cc.eu/rules/euhfc_rules_latest.pdf",
    "2025": "https://web.archive.org/web/20260420131149id_/https://euhf.s5cc.eu/rules/euhfc_rules_latest.pdf"
  }
};
  function editionSource(family,year) {
    if(editionOverrides[family]?.[year]) return editionOverrides[family][year];
    if(family==='WWRTTY') return `https://cqwwrtty.com/rules/CQWWRTTY_Rules_${year}.pdf`;
    if(family==='WPXRTTY') return `https://cqwpxrtty.com/rules/WPX_RTTY_Rules_${year}${year>=2014?'_en':''}.pdf`;

    return family==='CQWW'?`https://cqww.com/rules/${year}_rules_cqww.${year<2002?'htm':'pdf'}`:`https://cqwpx.com/rules/${year}_cqwpx_rules.pdf`;
  }
  function sectionFor(p,year) {
    if(p.family==='EUHFC') return year<2023?'9; all-band categories in 4':'9; category exemptions in 4';
    if(p.family==='ARRLDX') return year<2021?'3.4.4':'6.1; HF category definitions';
    if(p.family==='WWRTTY' || p.family==='WPXRTTY') return 'Multi-Operator categories: Single-Transmitter / Two-Transmitter';
    const number=p.category==='M/S'?'1':'2';
    if(p.family==='CQWW') return `${year<2008?'III.C':year<2012?'III.B':year===2012?'IV.B':'V.C'}.${number}`;
    if(year<2009) return `Categories 2(${number==='1'?'a':'b'})`;
    if(year===2016) return 'Multi-Operator Categories (official 2016 announcement); clock-hour interpretation: official FAQ';
    return year<2014?`V.D.${number==='1'?'a':'b'}`:`VI.C.${number}`;
  }
  function sourceMeta(meta={},rawText='') {
    if(!/^\s*START-OF-LOG:/im.test(rawText) || !/^\s*QSO:/im.test(rawText)) return meta;
    const header=key=>new RegExp(`^[\\t ]*${key}:[\\t ]*([^\\r\\n]*)`,'im').exec(rawText)?.[1]?.trim() || '';
    const contest=header('CONTEST') || meta.contestId;
    const euhfc=['EUHFC','EU-HF','EUROPEAN HF CHAMPIONSHIP'].includes(String(contest || '').trim().toUpperCase());
    // Read legacy CATEGORY locally for audits; do not change scoring metadata.
    // General metadata's first-QSO MODE/BAND fallback cannot establish an
    // EUHFC entry category, particularly for Mixed band/mode counting.
    return {...meta,contestId:contest,
      categoryOperator:header('CATEGORY-OPERATOR') || header('CATEGORY') || meta.categoryOperator,
      categoryMode:header('CATEGORY-MODE') || (euhfc?'':meta.categoryMode),
      categoryBand:header('CATEGORY-BAND') || (euhfc?'':meta.categoryBand),
      categoryPower:header('CATEGORY-POWER') || meta.categoryPower,
      categoryTransmitter:header('CATEGORY-TRANSMITTER') || meta.categoryTransmitter,
      categoryStation:header('CATEGORY-STATION') || meta.categoryStation};
  }
  function identify(meta = {}) {
    const contest=String(meta.contestId || '').trim().toUpperCase();
    const match=/^CQ-(WW|WPX)-(CW|SSB|RTTY)$/.exec(contest);
    const arrl=/^ARRL-DX-(CW|SSB|PHONE)$/.exec(contest);
    const euhfc=['EUHFC','EU-HF','EUROPEAN HF CHAMPIONSHIP'].includes(contest);
    if((!match && !arrl && !euhfc) || /DISTRIBUTED/i.test(meta.categoryStation || '')) return null;
    const op=String(meta.categoryOperator || meta.category || '').trim().toUpperCase();
    const tx=String(meta.categoryTransmitter || '').trim().toUpperCase();
    if(euhfc) {
      // CATEGORY-ASSISTED: UNLIMITED is spotting assistance, not the special
      // EUHFC SINGLE-OP-UNLIMITED category, so it must not disable this audit.
      if(!/^SINGLE-OP(?:\s|$)/.test(op) || tx && tx!=='ONE') return null;
      const legacyBand=/^SINGLE-OP\s+(ALL|\d+M)(?:\s|$)/.exec(op)?.[1];
      const band=String(meta.categoryBand || legacyBand || '').trim().toUpperCase();
      if(band && band!=='ALL') return null;
      const power=String(meta.categoryPower || /(?:^|\s)(QRP|LOW|HIGH)(?:\s|$)/.exec(op)?.[1] || '').toUpperCase();
      const mode=String(meta.categoryMode || /(?:^|\s)(CW|SSB|PH|MIXED)$/.exec(op)?.[1] || (power==='QRP'?'MIXED':'UNKNOWN')).trim().toUpperCase();
      return {contest,family:'EUHFC',mode:mode==='PH' || mode==='PHONE'?'SSB':mode,category:'SO',
        power};
    }
    const legacy=/^(M\/S|M\/2|MULTI-ONE|MULTI-SINGLE|MULTI-TWO)(?:\s|$)/.exec(op);
    const category=op==='MULTI-OP'?(tx==='ONE'?'M/S':tx==='TWO'?'M/2':null)
      :legacy?(/^(M\/2|MULTI-TWO)$/.test(legacy[1])?'M/2':'M/S'):null;
    if(!category) return null;
    // Conflicting explicit modern/legacy declarations are not guessed away.
    if(legacy && tx && tx!==(category==='M/S'?'ONE':'TWO')) return null;
    return {contest,family:arrl?'ARRLDX':match[2]==='RTTY'?(match[1]==='WW'?'WWRTTY':'WPXRTTY'):match[1]==='WW'?'CQWW':'WPX',mode:arrl?(arrl[1]==='PHONE'?'SSB':arrl[1]):match[2],category};
  }
  function resolve(meta,year) {
    const entry=identify(meta);
    if(!entry || !Number.isInteger(year)) return null;
    const p=profiles.find(p=>p.family===entry.family && p.category===entry.category && year>=p.firstYear && year<=p.lastYear && (!p.years || p.years.includes(year)) && p.modes.includes(entry.mode));
    if(!p || entry.family==='EUHFC' && entry.power==='QRP' && (year<2023 || entry.mode!=='MIXED')) return null;
    const extra=p.family==='CQWW' && p.kind==='residence' && year<2011?['https://cqww.com/history.htm']
      :p.family==='WPX' && year===2009 && p.kind==='residence'?['https://cqwpx.com/blog/survey-results-3-multi-single/']:[];
    const extraSources=p.family==='WWRTTY'?['https://cqwwrtty.com/cabrillo.htm']:p.family==='WPXRTTY'?['https://cqwpxrtty.com/cabrillo.htm']:[];
    const labels=p.family==='CQWW' || p.family==='WPX';
    const selectedSources=labels?[editionSource(p.family,year),...sources[p.family].slice(1),...extra]:[editionSource(p.family,year),...extraSources];
    const notes=p.family==='WPXRTTY' && year===2011 && p.category==='M/2'?['The archived 2011 rules explicitly specify 10 changes per transmitter; 2012 specifies 8. This audit follows the printed 2011 edition.']:[];
    if(p.signalRoles) notes.push('Band-change limits are checked independently for declared RUN/MULT signals. RTTY multiplier eligibility is outside this band-change check.');
    return Object.freeze({...p,countMode:p.family==='EUHFC' && entry.mode==='MIXED',notices:Object.freeze(notes),id:`${p.id}-${year}`,year,section:sectionFor(p,year),
      sources:Object.freeze(selectedSources),
      sourceLabels:Object.freeze(labels?[`${year} official rules`,'Official FAQ (current)','Cabrillo specification',...extra.map(()=> 'Historical interpretation')]:[`${year} official rules`,...extraSources.map(()=> 'Cabrillo specification')])});
  }
  function coverage(meta) {
    const entry=identify(meta);
    if(!entry) return '';
    return profiles.filter(p=>p.family===entry.family && p.category===entry.category)
      .sort((a,b)=>a.firstYear-b.firstYear).map(p=>p.years?p.years.join(', '):p.firstYear===p.lastYear?String(p.firstYear):`${p.firstYear}–${p.lastYear}`).join(', ');
  }
  globalThis.SH6OperatingAuditProfiles={profiles,identify,resolve,coverage,sourceMeta};
})();
