(function initSh6AnalysisCore(globalScope) {
  'use strict';

  const ANALYSIS_MODE_CONTESTER = 'contester';
  const ANALYSIS_MODE_DXER = 'dxer';
  const ANALYSIS_MODE_DEFAULT = ANALYSIS_MODE_CONTESTER;
  const DUPE_WINDOW_MS = 15 * 60 * 1000;
  const SCORING_UNKNOWN_WARNING = 'Rules for this contest are unknown. Showing logged points only if available.';
  const SCORING_UNKNOWN_WARNING_DXER = 'Scoring rules are unavailable. Showing logged points only.';

  const BAND_DEFS = [
    { label: '2190M', min: 0.1357, max: 0.1378 },
    { label: '630M', min: 0.472, max: 0.479 },
    { label: '560M', min: 0.5, max: 0.51 },
    { label: '160M', min: 1.8, max: 2.0 },
    { label: '80M', min: 3.4, max: 4.0 },
    { label: '60M', min: 5.0, max: 5.5 },
    { label: '40M', min: 6.9, max: 7.5 },
    { label: '30M', min: 10.0, max: 10.2 },
    { label: '20M', min: 13.9, max: 15.0 },
    { label: '17M', min: 18.0, max: 18.2 },
    { label: '15M', min: 20.8, max: 22.0 },
    { label: '12M', min: 24.8, max: 25.0 },
    { label: '10M', min: 27.9, max: 29.8 },
    { label: '8M', min: 40.0, max: 45.0 },
    { label: '6M', min: 50.0, max: 54.0 },
    { label: '5M', min: 54.0, max: 70.0 },
    { label: '4M', min: 70.0, max: 71.0 },
    { label: '2M', min: 144.0, max: 148.0 },
    { label: '1.25M', min: 222.0, max: 225.0 },
    { label: '70CM', min: 420.0, max: 450.0 },
    { label: '33CM', min: 902.0, max: 928.0 },
    { label: '23CM', min: 1240.0, max: 1300.0 },
    { label: '13CM', min: 2300.0, max: 2450.0 },
    { label: '9CM', min: 3300.0, max: 3500.0 },
    { label: '6CM', min: 5650.0, max: 5925.0 },
    { label: '3CM', min: 10000.0, max: 10500.0 },
    { label: '1.25CM', min: 24000.0, max: 24250.0 },
    { label: '6MM', min: 47000.0, max: 47200.0 },
    { label: '4MM', min: 75500.0, max: 81000.0 },
    { label: '2.5MM', min: 122000.0, max: 123000.0 },
    { label: '2MM', min: 134000.0, max: 141000.0 },
    { label: '1MM', min: 241000.0, max: 250000.0 }
  ];
  const BAND_LABELS = new Set(BAND_DEFS.map((b) => b.label));
  const BAND_ORDER_INDEX = new Map(BAND_DEFS.map((b, idx) => [b.label, idx]));
  const METER_TOKEN_MAP = new Map();
  BAND_DEFS.forEach((band) => {
    const match = band.label.match(/^(\d+(?:\.\d+)?)(M)$/i);
    if (!match) return;
    const num = match[1];
    const norm = String(parseFloat(num));
    METER_TOKEN_MAP.set(num, band.label);
    METER_TOKEN_MAP.set(norm, band.label);
  });
  const SUPPORTED_BANDS = new Set([...BAND_LABELS, 'LIGHT']);

  const MODE_DIGITAL = new Set([
    'FT8', 'FT4', 'RTTY', 'PSK', 'PSK31', 'DATA', 'DIGI', 'MFSK',
    'JT65', 'JT9', 'OLIVIA', 'FSK', 'FSK441', 'AMTOR'
  ]);
  const MODE_PHONE = new Set(['SSB', 'USB', 'LSB', 'AM', 'FM', 'PH', 'PHONE']);
  // Official Alessandro Volta RTTY exchange-points table (rev. 2004, still
  // linked by the organizer's November 2025 rules).
  const VOLTA_ZONE_POINTS = [[2,14,10,13,16,18,22,20,25,30,36,37,39,21,22,19,20,17,11,25,29,29,22,22,16,28,25,31,39,35,14,36,25,29,34,39,40,47,44,15],[14,2,15,8,7,16,16,12,16,23,24,30,30,12,14,16,19,20,19,19,25,31,26,30,28,35,35,40,50,50,25,47,14,21,21,28,33,36,37,6],[10,15,2,8,11,9,13,14,18,21,28,28,30,26,28,27,29,27,21,32,37,39,32,31,24,37,33,40,43,35,11,32,29,35,35,42,48,50,52,20],[13,8,8,2,3,8,10,8,12,18,22,25,27,19,21,23,26,26,22,26,33,37,32,34,30,40,38,44,52,44,20,40,21,28,26,33,40,41,44,14],[16,7,11,3,2,9,9,6,10,17,20,24,25,18,20,22,26,26,24,35,32,38,33,35,31,41,40,45,54,46,22,41,19,27,24,31,38,39,42,13],[18,16,9,8,9,2,4,7,10,12,19,19,21,27,29,31,34,33,29,34,40,46,40,40,33,46,42,49,47,38,17,32,28,36,30,37,44,43,48,22],[22,16,13,10,9,4,2,4,6,8,15,15,17,26,29,31,35,36,33,33,40,47,42,44,38,50,46,53,49,40,22,34,26,34,26,33,40,38,44,22],[20,12,14,8,6,7,4,2,5,11,15,18,19,22,24,27,31,32,30,29,35,42,38,42,37,47,46,51,54,44,24,38,21,30,23,30,38,36,41,18],[25,16,18,12,10,10,6,5,2,8,10,14,15,23,25,29,33,35,34,29,35,43,41,45,41,50,50,55,52,45,28,38,21,30,20,27,35,32,38,21],[30,23,21,18,17,12,8,11,8,2,9,7,9,31,33,37,41,43,41,36,42,51,49,52,45,50,52,54,44,37,28,31,28,36,24,29,38,31,38,29],[36,24,28,22,20,19,15,15,10,9,2,9,7,26,28,33,36,41,43,30,34,42,45,51,52,49,55,49,42,41,37,35,22,29,16,20,28,23,29,27],[37,30,28,25,24,19,15,18,14,7,9,2,3,35,37,41,45,49,48,39,42,49,53,58,50,52,52,48,37,33,32,27,31,37,34,27,33,27,33,34],[39,30,30,27,25,21,17,19,15,9,7,3,2,33,35,40,43,48,49,37,39,46,50,56,53,50,52,46,37,34,35,29,29,34,21,24,30,24,30,34],[21,12,26,19,18,27,26,22,23,31,26,35,33,2,3,6,10,14,18,7,14,21,19,25,27,27,30,32,42,49,34,55,5,10,15,19,21,26,26,6],[22,14,28,21,20,29,29,24,25,33,28,37,35,3,2,5,9,13,18,6,11,18,17,23,27,25,29,30,39,47,36,54,6,7,15,18,19,25,24,8],[19,16,27,23,22,31,31,27,29,37,33,41,40,6,5,2,4,8,13,6,10,15,12,18,22,21,24,26,36,42,33,49,10,9,20,21,21,27,25,9],[20,19,29,26,26,34,35,31,33,41,36,45,43,10,9,4,2,5,12,7,8,12,8,14,19,17,20,22,32,38,32,45,14,10,22,22,20,27,23,12],[17,20,27,26,26,33,36,32,35,43,41,49,48,14,13,8,5,2,7,12,12,12,6,11,14,15,16,20,30,35,29,40,18,15,27,28,24,31,27,14],[11,19,21,22,24,29,33,30,34,41,43,48,49,18,18,13,12,7,2,18,19,16,10,10,9,16,15,20,30,32,21,36,23,21,33,34,30,38,33,16],[25,19,32,26,35,34,33,29,29,36,30,39,37,7,6,6,7,12,18,2,6,14,14,20,26,21,26,25,34,43,39,49,8,3,15,16,15,22,20,12],[29,25,37,33,32,40,40,35,35,42,34,42,39,14,11,10,8,12,19,6,2,9,11,17,24,16,21,20,28,37,40,43,14,6,18,16,11,19,15,19],[29,31,39,37,38,46,47,42,43,51,42,49,46,21,18,15,12,12,16,14,9,2,6,10,18,7,13,11,21,29,36,35,22,14,26,22,15,22,16,24],[22,26,32,32,33,40,42,38,41,49,45,53,50,19,17,12,8,6,10,14,11,6,2,6,13,8,12,14,24,30,31,37,22,16,29,26,21,28,22,20],[22,30,31,34,35,40,44,42,45,52,51,58,56,25,23,18,14,11,10,20,17,10,6,2,8,6,6,10,20,24,26,30,28,22,35,33,25,32,25,25],[16,28,24,30,31,33,38,37,41,45,52,50,53,27,27,22,19,14,9,26,24,18,13,8,2,13,9,15,23,30,18,27,32,28,41,40,33,40,33,25],[28,35,37,40,41,46,50,47,50,50,49,52,50,27,25,21,17,15,16,21,16,7,8,6,13,2,6,5,16,22,31,29,29,21,33,29,21,27,20,29],[25,35,33,38,40,42,46,46,50,52,55,52,52,30,29,24,20,16,15,26,21,13,12,6,9,6,2,7,15,18,25,25,34,27,40,35,27,32,26,30],[31,40,40,44,45,49,53,51,55,54,49,48,46,32,30,26,22,20,20,25,20,11,14,10,15,5,7,2,10,17,31,24,34,25,36,30,22,26,19,34],[39,50,43,52,54,47,49,54,52,44,42,37,37,42,39,36,32,30,30,34,28,21,24,20,23,16,15,10,2,9,15,32,42,33,39,31,24,24,20,44],[35,50,35,44,46,38,40,44,45,37,41,33,34,49,47,42,38,35,32,43,37,29,30,24,30,22,18,17,9,2,24,7,51,42,47,40,33,32,29,48],[14,25,11,20,22,17,22,24,28,28,37,32,35,34,36,33,32,29,21,39,40,36,31,26,18,31,25,31,15,24,2,22,39,42,46,53,52,56,51,28],[36,47,32,40,41,32,34,38,38,31,35,27,29,55,54,49,45,40,36,49,43,35,37,30,27,29,25,24,32,7,22,2,57,48,47,42,38,34,33,50],[25,14,29,21,19,28,26,21,21,28,22,31,29,5,6,10,14,18,23,8,14,22,22,28,32,29,34,34,42,51,39,57,2,9,10,14,18,22,23,10],[29,21,35,28,27,36,34,30,30,36,29,37,34,10,7,9,10,15,21,3,6,14,16,22,28,21,27,25,33,42,42,48,9,2,13,12,12,18,16,16],[34,21,35,26,24,30,26,23,20,24,16,34,21,15,15,20,22,27,33,15,18,26,29,35,41,33,40,36,39,47,46,47,10,13,2,7,15,15,19,20],[39,28,42,33,31,37,33,30,27,29,20,27,24,19,18,21,22,28,34,16,16,22,26,33,40,29,35,30,31,40,53,42,14,12,7,2,8,8,11,24],[40,33,48,40,38,44,40,38,35,38,28,33,30,21,19,21,20,24,30,15,11,15,21,25,33,21,27,22,24,33,52,38,18,12,15,8,2,7,5,28],[47,36,50,41,39,43,38,36,32,31,23,27,24,26,25,27,27,31,38,22,19,22,28,32,40,27,32,26,24,32,56,34,22,18,15,8,7,2,6,32],[44,37,52,44,42,48,44,41,38,38,29,33,30,26,24,25,23,27,33,20,15,16,22,25,33,20,26,19,20,29,51,33,23,16,19,11,5,6,2,32],[15,6,20,14,13,22,22,18,21,29,27,34,34,6,8,9,12,14,16,12,19,24,20,25,25,29,30,34,44,48,28,50,10,16,20,24,28,32,32,2]];
  const ARI_DX_PROVINCES = new Set('AL AT BI CN GE IM NO SP SV TO VB VC AO BG BS CO CR LC LO MB MI MN PV SO VA BL PD RO TV VE VI VR BZ TN GO PN TS UD BO FC FE MO PC PR RA RE RN AR FI GR LI LU MS PI PO PT SI AN AP AQ CH FM MC PE PU TE BA BR BT FG LE MT TA AV BN CB CE CS CZ IS KR NA PZ RC SA VV FR LT PG RI RM TR VT AG CL CT EN ME PA RG SR TP CA CI NU OG OR OT SS SU VS'.split(' '));
  const UBA_PSK63_SECTIONS = new Set('AAA CLR HCC MTT OST TOR ACC CPN HOB MWV PHI TRA ALT CRD HRT NBT RAC TRC ARA DNZ IPR NLB RAF TWS ARC DRC KSD NMR RAM UBA ATH DST KTK NNV RAT VHF ATO EKO LGE NOK RBO WLD BDX ERA LIR NOL RCA WRA BLW GBN LLV OBR RCN WRC BRC GBX LUS ODE REM WTO BSE GDV LVN ONZ RST BTS GNT MCL ORA RSX BXE GTM MLB OSA SNW ZLB CDZ HAC MNS OSB TLS ZLZ ZTM'.split(' '));
  const UBA_EU_DXCC_COUNTRIES = new Set('CYPRUS|CROATIA|MALTA|PORTUGAL|MADEIRA ISLANDS|AZORES|GERMANY|SPAIN|BALEARIC ISLANDS|CANARY ISLANDS|IRELAND|ESTONIA|FRANCE|GUADELOUPE|MARTINIQUE|REUNION ISLAND|FRENCH GUIANA|HUNGARY|ITALY|SARDINIA|LUXEMBOURG|LITHUANIA|BULGARIA|AUSTRIA|FINLAND|ALAND ISLANDS|MARKET REEF|CZECH REPUBLIC|SLOVAK REPUBLIC|DENMARK|NETHERLANDS|SLOVENIA|SWEDEN|POLAND|GREECE|DODECANESE|CRETE|MOUNT ATHOS|CORSICA|LATVIA|ROMANIA'.split('|'));
  const UBA_EU_DXCC_PREFIXES = new Set('5B 9A 9H CT CT3 CU DL EA EA6 EA8 EI ES F FG FM FR FY HA I IS LX LY LZ OE OH OH0 OJ0 OK OM OZ PA S5 SM SP SV SV5 SV9 SV/A TK YL YO'.split(' '));
  const UKSMG_2027_COMMITTEE_CALLS = new Set('G5KW G4IFX EA5NW G3OIL SA4BKD M1ABK G0GCQ G4FVP G8FXM G0VUH G3XDV'.split(' '));
  const SP_DX_PROVINCES = new Set('B C D F G J K L M O P R S U W Z'.split(' '));
  const SPDX_RTTY_POVIATS = new Set('AB AC AG AK AL AN AP AQ AS AU AW BA BB BC BE BF BG BH BI BJ BL BM BN BO BP BQ BR BS BT BU BW BY BZ CE CH CI CJ CL CM CN CO CR CS CT CU CW CY CZ DA DE DG DL DP DT DY DZ EA EB EC ED EG EK EL EM EN ER ET EY EZ GA GB GC GD GE GF GG GH GI GJ GK GL GM GN GO GP GQ GR GS GT GU GV GW GX GY GZ HA HR IA ID IK IL IM IN IR IT IW IY IZ JA JC JE JG JL JM JR JS JW JZ KA KB KC KD KE KF KG KH KI KJ KK KL KM KN KO KP KQ KR KS KT KU KV KW KX KY KZ LA LB LC LE LF LG LH LI LJ LK LL LM LN LO LP LQ LS LT LU LV LW LX LY LZ MA MB MC ME MF MH MI ML MM MN MO MQ MR MS MW MY MZ NA NC ND NF NG NI NL NM NN NO NQ NS NT NV NW NY OA OB OC OD OE OF OG OH OI OJ OK OL OM ON OO OP OQ OR OS OT OU OV OW OX OY OZ PA PB PC PD PE PF PG PH PI PJ PK PL PM PN PO PP PQ PR PT PU PV PW PX PY PZ RA RB RC RD RE RJ RK RM RN RO RP RS RU RW RX RY RZ SA SB SC SD SE SF SG SH SI SJ SK SL SM SN SO SP SQ SR SS ST SU SV SW SX SY TA TB TC TE TG TH TK TL TM TN TO TR TS TU TW TY TZ UC UD UG UK UL UM UN UP US UT UW WA WB WC WD WE WF WG WH WI WJ WK WL WM WN WO WP WQ WR WS WT WU WW WX WY WZ YA YD YN YR YS YT YW ZA ZB ZC ZE ZF ZG ZL ZM ZN ZO ZP ZQ ZR ZS ZT ZV ZW ZX ZY'.split(' '));
  const UKR_CHAMP_2026_OBLASTS = new Set('CH CN CR DN DO HA HE HM IF KI KO KV LU LV MY OD PO RI SU TE VI VO ZA ZH ZP'.split(' '));
  const UKEIDX_2026_DISTRICTS = new Set('AB AL AN AR BA BB BD BH BL BM BN BR BS CA CB CE CF CH CK CL CM CN CO CR CT CV CW DA DD DE DG DH DL DN DO DR DT DU DW DY EC EH EL EN EX FE FK FY GA GL GS GU GY HA HD HG HP HR HS HU HX IG IM IP IV JE KA KD KE KI KT KW KY LA LD LE LF LH LI LL LN LO LP LS LT LU MA ME MK ML MO MR MT NE NG NL NN NP NK NW OF OL OX PA PE PH PL PO PR RG RH RM RO SA SD SE SG SI SK SL SM SN SO SP SR SS ST SW SY TA TD TF TI TN TQ TR TS TW TY UB WA WC WD WF WI WL WM WN WR WS WT WV WX YO ZE'.split(' '));
  const UKEIDX_COUNTRIES = new Set(['IRELAND', 'ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN IRELAND', 'ISLE OF MAN', 'JERSEY', 'GUERNSEY', 'UNITED KINGDOM']);
  const RDRC_RUSSIAN_AREAS = new Set('SP LO KL AR NO VO NV PS MU KA KO MA MO OR LP TV SM YR KS TL VR TB RA IV VL KU KG BR BO VG KR KM RK RO SE AO AD DO LU ZP HE KC ST SO CN IN DA KB NN SA PE SR UL KI TA MR MD UD CU PM OB BA CB SV HM YN TN KN TO OM NS KE AL GA KK IR HA TU HK EA SL MG AM CK PK BU YA ZK KT AN FJ'.split(' '));
  const YO_DX_COUNTIES = new Set('AR CS HD TM BU IF CT BR GL TL VN AB BH BN CJ SM SJ MM BV CV HR MS SB AG DJ GJ MH OT VL BC BT IS NT SV VS BZ CL DB GR IL PH TR'.split(' '));
  const YU_DX_COUNTIES = new Set('BGD BOR BRA JAB JBB JBN KMO KOL KOS KPO MAC MOR NIS PCI PEC PIR POD POM PRI RAN RAS SBB SBN SBT SRM SUM TOP ZAJ ZBB ZLA'.split(' '));
  const XE_RTTY_2026_STATES = new Set('AGS BC BCS CAM CHS CHH COA COL CDMX EMX DGO GTO GRO HGO JAL MIC MOR NAY NL OAX PUE QRO QTR SLP SIN SON TAB TMS TLX VER YUC ZAC'.split(' '));

  function isRomanianStation(call, countryKey) {
    return String(countryKey || '').toUpperCase() === 'ROMANIA' || /^(?:YO|YP|YQ|YR)/.test(String(call || '').toUpperCase());
  }

  function isSerbianStation(call, countryKey) {
    return String(countryKey || '').toUpperCase() === 'SERBIA' || /^(?:YU|YT)/.test(String(call || '').toUpperCase());
  }

  function isMexicanStation(call, countryKey) {
    return String(countryKey || '').toUpperCase() === 'MEXICO' || /^(?:XE|XF|4[ABC])/.test(String(call || '').toUpperCase());
  }

  function isUkeidxStation(call, countryKey) {
    if (UKEIDX_COUNTRIES.has(String(countryKey || '').toUpperCase())) return true;
    return /^(?:EI|2[DEGIJMUW]|[GM][DGIJMUW]?)/.test(String(call || '').toUpperCase());
  }

  const SCORING_RULE_ALIASES = Object.freeze({
    cqww: ['CQWW', 'CQ-WW', 'CQ WW', 'CQ WORLD WIDE'],
    cqwpx: ['CQWPX', 'CQ-WPX', 'CQ WPX'],
    cqwwrtty: ['CQWWRTTY', 'CQ-WW-RTTY', 'CQ WW RTTY'],
    cqwpxrtty: ['CQWPXRTTY', 'CQ-WPX-RTTY', 'CQ WPX RTTY'],
    cq160: ['CQ160', 'CQ 160', 'CQ-160'],
    cq_vhf: ['CQVHF', 'CQ-VHF', 'CQ WW VHF', 'CQ WORLD WIDE VHF'],
    ww_digi: ['WWDIGI', 'WW-DIGI', 'WW DIGI', 'WORLD WIDE DIGI DX'],
    ft8_dx: ['FT8-DX', 'FT8 DX', 'FT8DX'],
    jarl_ww_rtty: ['JARL-WW-RTTY', 'JARL WW RTTY', 'JARTS-WW-RTTY', 'JARTS WW RTTY'],
    ft_challenge: ['FT-CHALLENGE', 'FT CHALLENGE', 'INTERNATIONAL FT CHALLENGE'],
    jidx_cw: ['JIDX-CW', 'JIDX CW', 'JIDXCW'],
    jidx_ssb: ['JIDX-SSB', 'JIDX SSB', 'JIDX-PH', 'JIDX PHONE', 'JIDXSSB'],
    ig_ry_ww_rtty: ['IG-RY', 'IG-RTTY', 'IG-RY-WW-RTTY', 'IG-RY WW RTTY', 'IG-WW-RY'],
    oceania_dx_cw: ['OCEANIA-DX-CW', 'OCEANIA DX CW', 'OCDX-CW', 'OCDX CW'],
    oceania_dx_ssb: ['OCEANIA-DX-SSB', 'OCEANIA DX SSB', 'OCEANIA-DX-PH', 'OCDX-SSB', 'OCDX PHONE'],
    gacw_wwsa_legacy: ['GACW', 'WWSA', 'WWSA-CW', 'WWSA CW'],
    ha_dx_2026: ['HA-DX', 'HA DX', 'HADX'],
    helvetia_2026: ['HELVETIA', 'HELVETIA-CONTEST', 'HELVETIA CONTEST'],
    holyland_2025: ['HOLYLAND', 'HOLYLAND-DX', 'HOLYLAND DX', 'WWHC'],
    naqp_cw_2026: ['NAQP-CW', 'NAQP CW'],
    naqp_ssb_2026: ['NAQP-SSB', 'NAQP SSB', 'NAQP-PH', 'NAQP PHONE'],
    naqp_rtty_2026: ['NAQP-RTTY', 'NAQP RTTY'],
    rac_canada_2026: ['RAC-CANADA-DAY', 'RAC CANADA DAY', 'CANADA-DAY', 'CANADA DAY', 'RAC-CANADA-WINTER', 'RAC CANADA WINTER', 'CANADA-WINTER', 'CANADA WINTER'],
    pacc_2026: ['PACC', 'PACC-CONTEST', 'PACC CONTEST'],
    ari_dx_2026: ['ARI-DX', 'ARI DX', 'ARI-INTERNATIONAL-DX', 'ARI INTERNATIONAL DX'],
    aegean_rtty_legacy: ['AEGEAN-RTTY', 'AEGEAN RTTY'],
    aegean_vhf_legacy: ['AEGEAN-VHF', 'AEGEAN VHF'],
    africa_all_mode_dx_2026: ['AF-ALL-MODE-DX', 'AFRICA-DX', 'AFRICA ALL MODE DX'],
    agb_party_latest: ['AGB-PARTY', 'AGB PARTY'],
    ap_sprint_2026: ['AP-SPRINT', 'ASIA-PACIFIC-SPRINT', 'ASIA PACIFIC SPRINT'],
    ari_sections_2026: ['ARI-SEZ', 'ARI SEZ', 'CONTEST-SEZIONI-ARI', 'CONTEST SEZIONI ARI'],
    avhfc_legacy: ['AVHFC', 'ARAUCARIA-VHF', 'ARAUCARIA VHF'],
    baltic_2026: ['BALTIC', 'BALTIC-CONTEST', 'BALTIC CONTEST'],
    basso_ferrarese_legacy: ['BASSO-FERRARESE', 'BASSO FERRARESE', 'ARI-BASFER', 'ARI BASFER'],
    bdm_ww_rtty_legacy: ['BDM-WW-RTTY', 'BDM WW RTTY', 'BDM-RTTY', 'BDM RTTY'],
    california_qso_party_2026: ['CA-QSO-PARTY', 'CALIFORNIA-QSO-PARTY', 'CALIFORNIA QSO PARTY', 'CQP'],
    cis_qpsk63_dx_legacy: ['CIS-QPSK63-DX', 'CIS QPSK63 DX', 'CIS-DX-QPSK63', 'CIS DX QPSK63'],
    cq_m_2025: ['CQ-M', 'CQ M', 'CQM', 'CQ-M-CONTEST', 'CQ M CONTEST'],
    cqmm_dx_2026: ['CWJF-MM', 'CWJF MM', 'CQMM-DX', 'CQMM DX', 'CQMMDX'],
    dig_qso_party_2025: ['DIG-QSO-PARTY', 'DIG QSO PARTY', 'DIG-PA', 'DIG PA', 'DIG-CW', 'DIG-SSB'],
    darc_xmas_2025: ['DARC-XMAS', 'DARC XMAS', 'XMAS'],
    eu_psk_dx_2026: ['EU-PSK-DX', 'EU PSK DX'],
    es_open_hf_2026: ['ES-OPEN', 'ES-OPEN-HF', 'ES OPEN HF'],
    hsc_2026: ['HSC', 'HSC-CW', 'HSC CW'],
    inorc_2025: ['INORC', 'INORC-CONTEST', 'INORC CONTEST'],
    kcj_2026: ['KCJ', 'KCJ-CONTEST', 'KCJ CONTEST'],
    iota_2026: ['IOTA', 'RSGB-IOTA', 'RSGB IOTA'],
    marconi_memorial_hf_2026: ['MARCONI-MEMORIAL', 'MARCONI MEMORIAL', 'MMC-HF', 'MMC HF'],
    gdbage_dx_legacy: ['GDBAGE-DX-TEST', 'GDBAGE DX TEST'],
    lz_dx_2025: ['LZ-DX', 'LZ DX', 'LZDX'],
    ny_qso_party_2025: ['NY-QSO-PARTY', 'NY QSO PARTY', 'NYQP'],
    ok_dx_rtty_2026: ['OK-DX-RTTY', 'OK DX RTTY', 'OKRTTY'],
    portugal_day_2026: ['PORTUGAL-DAY', 'PORTUGAL DAY', 'PORTUGAL=DAY', 'PDC'],
    pears_vhf_2026: ['PEARS-VHF-UHF', 'PEARS VHF UHF', 'PEARS'],
    popov_memorial_2026: ['RADIO-POPOV', 'POPOV-MEMORIAL', 'POPOV MEMORIAL'],
    popov_vhf_2026: ['POPOV-VHF', 'POPOV VHF'],
    russian_160m_2025: ['RADIO-160', 'RUSSIAN-160M', 'RUSSIAN 160M', 'RUSSIAN-160M-DX'],
    russian_ww_rtty_2026: ['RADIO-WW-RTTY', 'RUSSIAN-WW-RTTY', 'RUSSIAN WW RTTY', 'RUS-WW-RTTY'],
    wia_remembrance_2026: ['WIA-REMEMBRANCE', 'REMEMBRANCE-DAY', 'REMEMBRANCE DAY', 'RD-CONTEST'],
    international_naval_2025: ['RNARS', 'RNARS-CW', 'INTERNATIONAL-NAVAL', 'INTERNATIONAL NAVAL', 'INC'],
    rsgb_160m_2026: ['RSGB-160', 'RSGB-1.8MHZ', 'RSGB 1.8MHZ', 'RSGB-160M'],
    rsgb_low_power_2026: ['RSGB-LOW-POWER', 'RSGB LOW POWER', 'RSGB-ILPC', 'RSGB-QRP'],
    rsgb_nfd_2026: ['RSGB-NFD', 'RSGB NFD', 'RSGB-CW-FD', 'RSGB CW FIELD DAY'],
    rsgb_ssb_fd_2026: ['RSGB-SSB-FD', 'RSGB SSB FD', 'RSGB-SSB-FIELD-DAY'],
    sac_2026: ['SAC-CW', 'SAC-SSB'],
    sarl_hf_2026: ['SARL-HF-CW', 'SARL-HF-PHONE', 'SARL-HF-DIGITAL'],
    sarl_vhf_2026: ['SARL-VHF', 'SARL-VHF-DIGITAL', 'SARL-VHF-UHF-FM'],
    sarl_youth_2026: ['SARL-YOUTH-SPRINT', 'SARL-YOUTH-QSO-PARTY'],
    sarl_yl_2026: ['SARL-YL-SPRINT', 'SARL-YL-QSO-PARTY'],
    sartg_rtty_2026: ['SARTG', 'SARTG RTTY', 'SARTG-RTTY'],
    un_dx_2026: ['UN-DX', 'UNDX'],
    volta_rtty_2026: ['VOLTA-RTTY', 'VOLTA RTTY'],
    uba_psk63_2026: ['UBA-PSK63-PREFIX', 'UBA PSK63 PREFIX'],
    uksmg_summer_2027: ['UKSMG', 'UKSMG-SUMMER-ES', 'UKSMG SUMMER ES'],
    makrothen_rtty_2026: ['TMC-RTTY', 'MAKROTHEN', 'MAKROTHEN-RTTY', 'MAKROTHEN RTTY'],
    sp_dx_2026: ['SP-DX', 'SPDX', 'SPDX CONTEST', 'SP DX CONTEST'],
    sp_dx_rtty_2026: ['SP DX RTTY', 'SP-DX-RTTY', 'SPDX-RTTY'],
    trc_dx_2025: ['TRC-DX', 'TRC DX'],
    uba_dx_2026: ['UBA', 'UBA-CW', 'UBA-SSB', 'UBA-DX', 'UBA DX', 'UBA-DX-CW', 'UBA-DX-SSB'],
    ukr_champ_rtty_2026: ['UKR-CHAMP-RTTY'],
    ukeicc_80m_2026_27: ['UKEICC-80M', 'UKEICC-80MCW', 'UKEICC-80MSSB'],
    ukeidx_2026: ['UKEIDX', 'UKEIDX-CW', 'UKEIDX-SSB', 'UK/EI-DX-CW', 'UK/EI-DX-SSB'],
    rus_ww_digi_2026: ['RUS-WW-DIGI', 'RU-WW-DIGI'],
    rus_ww_mm_2026: ['RUS-WW-MM', 'RU-WW-MM'],
    rus_ww_psk_2027: ['RUS-WW-PSK', 'RU-WW-PSK'],
    wia_vhf_2026: ['WIA-VHF-UHF', 'WIA VHF UHF', 'WIA-FIELD-DAY'],
    yo_dx_2026: ['YODX', 'YO-DX', 'YO DX', 'YO-DX-HF'],
    yu_dx_2026: ['YUDX', 'YU-DX', 'YU DX', 'YUDXC'],
    xe_rtty_2026: ['XE-RTTY', 'XE RTTY', 'FMRE-RTTY', 'MEXICO-RTTY'],
    aadx: ['AADX', 'ALL ASIAN', 'ALL-ASIAN', 'ALL ASIAN DX'],
    cwops_cwt: ['CWOPS', 'CW-OPS', 'CW OPS', 'CWT'],
    wfd: ['WFD', 'WINTER FIELD DAY', 'WINTER-FIELD-DAY'],
    bartg_hf_rtty: ['BARTG-RTTY', 'BARTG RTTY', 'BARTG HF RTTY', 'BARTG-HF-RTTY'],
    bartg_sprint: ['BARTG-SPRINT', 'BARTG SPRINT', 'BARTG JANUARY SPRINT'],
    iaru_hf: ['IARU-HF', 'IARU HF', 'IARU HF WORLD CHAMPIONSHIP'],
    ea_rtty: ['EARTTY', 'EA-RTTY', 'EA RTTY'],
    wae: ['WAE', 'WORKED ALL EUROPE'],
    darc_fieldday: ['DARC FIELDDAY', 'DARC FIELD DAY'],
    darc_wag: ['DARC WAG', 'WAG CONTEST'],
    ref: ['COUPE DU REF', 'REF CONTEST'],
    eudx: ['EU DX', 'EUDX', 'EU DX CONTEST'],
    euhfc: ['EUHFC', 'EUROPEAN HF CHAMPIONSHIP'],
    eu_vhf_bundle: ['IARU REGION 1 VHF', 'EU VHF', 'ALPE ADRIA'],
    ww_pmc: ['WW PMC', 'WORLDWIDE PEACE MESSENGER'],
    zrs_kvp: ['ZRS KVP'],
    ok_om_dx: ['OK OM DX', 'OK-OM DX', 'OK DX', 'OM DX'],
    rdxc: ['RDXC', 'RUSSIAN DX'],
    rf_championship_cw: ['RF CHAMPIONSHIP CW', 'CHAMPIONSHIP OF RUSSIA CW'],
    ham_spirit: ['HAM SPIRIT'],
    rcc_cup: ['RCC CUP'],
    rda: ['RDA CONTEST', 'RUSSIAN DISTRICT AWARD'],
    rrtc: ['RRTC', 'RUSSIAN RADIO TEAM CHAMPIONSHIP'],
    yuri_gagarin: ['YURI GAGARIN', 'GAGARIN'],
    wed_minitest_40m: ['WEDNESDAY MINITEST 40M', 'WED MINI 40M'],
    wed_minitest_80m: ['WEDNESDAY MINITEST 80M', 'WED MINI 80M'],
    wrtc_2022: ['WRTC 2022', 'WRTC Italy'],
    wrtc_2026: ['WRTC', 'WRTC 2026', 'WRTC UK'],
    arrl_family_bundle: ['ARRL']
  });
  const SCORING_PHASE1_RULES = new Set([
    'cqww',
    'cqwpx',
    'cqwwrtty',
    'cqwpxrtty',
    'cq160',
    'cq_vhf',
    'ww_digi',
    'ft8_dx',
    'jarl_ww_rtty',
    'ft_challenge',
    'jidx_cw',
    'jidx_ssb',
    'ig_ry_ww_rtty',
    'oceania_dx_cw',
    'oceania_dx_ssb',
    'gacw_wwsa_legacy',
    'ha_dx_2026',
    'helvetia_2026',
    'holyland_2025',
    'naqp_cw_2026',
    'naqp_ssb_2026',
    'naqp_rtty_2026',
    'rac_canada_2026',
    'pacc_2026',
    'ari_dx_2026',
    'aegean_rtty_legacy',
    'aegean_vhf_legacy',
    'africa_all_mode_dx_2026',
    'agb_party_latest',
    'ap_sprint_2026',
    'ari_sections_2026',
    'avhfc_legacy',
    'baltic_2026',
    'basso_ferrarese_legacy',
    'bdm_ww_rtty_legacy',
    'california_qso_party_2026',
    'cis_qpsk63_dx_legacy',
    'cq_m_2025',
    'cqmm_dx_2026',
    'dig_qso_party_2025',
    'darc_xmas_2025',
    'eu_psk_dx_2026',
    'es_open_hf_2026',
    'hsc_2026',
    'inorc_2025',
    'kcj_2026',
    'iota_2026',
    'marconi_memorial_hf_2026',
    'gdbage_dx_legacy',
    'lz_dx_2025',
    'ny_qso_party_2025',
    'ok_dx_rtty_2026',
    'portugal_day_2026',
    'pears_vhf_2026',
    'popov_memorial_2026',
    'popov_vhf_2026',
    'russian_160m_2025',
    'russian_ww_rtty_2026',
    'wia_remembrance_2026',
    'international_naval_2025',
    'rsgb_160m_2026',
    'rsgb_low_power_2026',
    'rsgb_nfd_2026',
    'rsgb_ssb_fd_2026',
    'sac_2026',
    'sarl_hf_2026',
    'sarl_vhf_2026',
    'sarl_youth_2026',
    'sarl_yl_2026',
    'sartg_rtty_2026',
    'un_dx_2026',
    'volta_rtty_2026',
    'uba_psk63_2026',
    'uksmg_summer_2027',
    'makrothen_rtty_2026',
    'sp_dx_2026',
    'sp_dx_rtty_2026',
    'trc_dx_2025',
    'uba_dx_2026',
    'ukr_champ_rtty_2026',
    'ukeicc_80m_2026_27',
    'ukeidx_2026',
    'rus_ww_digi_2026',
    'rus_ww_mm_2026',
    'rus_ww_psk_2027',
    'wia_vhf_2026',
    'yo_dx_2026',
    'yu_dx_2026',
    'xe_rtty_2026',
    'aadx',
    'cwops_cwt',
    'wfd',
    'bartg_hf_rtty',
    'bartg_sprint',
    'iaru_hf',
    'ea_rtty',
    'wae',
    'ref',
    'eudx',
    'euhfc',
    'zrs_kvp',
    'rdxc',
    'rf_championship_cw',
    'ham_spirit',
    'rcc_cup',
    'rrtc',
    'yuri_gagarin',
    'wrtc_2022',
    'wrtc_2026'
  ]);
  const SCORING_PHASE2_RULES = new Set([
    'darc_fieldday',
    'darc_wag',
    'ww_pmc',
    'ok_om_dx',
    'rda',
    'wed_minitest_40m',
    'wed_minitest_80m'
  ]);
  const US_STATE_CODES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC'
  ]);
  const VE_AREA_CODES = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']);
  const CQP_STATE_CODES = new Set('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
  const CQP_COUNTIES = new Set('ALAM ALPI AMAD BUTT CALA COLU CCOS DELN ELDO FRES GLEN HUMB IMPE INYO KERN KING LAKE LANG MADE MARN MARP MEND MERC MODO MONO MONT NAPA NEVA ORAN PLAC PLUM RIVE SACR SBEN SBER SDIE SFRA SHAS SIER SISK SJOS SLOU SMAT SBAR SCLA SCRU SOLA SONO STAN SUTT TEHA TRIN TULA TUOL VENT YOLO YUBA'.split(' '));
  const NYQP_COUNTIES = new Set('ALB ALL BRX BRM CAT CAY CHA CHE CGO CLI COL COR DEL DUT ERI ESS FRA FUL GEN GRE HAM HER JEF KIN LEW LIV MAD MON MTG NAS NEW NIA ONE ONO ONT ORA ORL OSW OTS PUT QUE REN RIC ROC SAR SCH SCO SCU SEN STL STE SUF SUL TIO TOM ULS WAR WAS WAY WES WYO YAT'.split(' '));
  const PORTABLE_CALL_SUFFIXES = new Set(['P', 'M', 'MM', 'AM', 'QRP']);
  const SLASH_AREA_TOKEN_RE = /^[A-Z]{1,2}\d{1,2}$/;
  const KG4_US_CALL_RE = /^KG4[A-Z]{1,3}$/;
  const KG4_GITMO_RE = /^KG4[A-Z]{2}$/;
  const WPX_IGNORE_SUFFIXES = new Set(['A', 'E', 'J', 'P', 'M', 'MM', 'AM', 'QRP', 'QRPP']);

  const scoringIndexCache = new WeakMap();
  const ctyPrefixIndexCache = new WeakMap();
  const masterSetCache = new WeakMap();
  const callsignGridMapCache = new WeakMap();
  let activeAnalysisEnv = null;

  function makeEmptyAnalysisEnv() {
    return {
      ctyTable: [],
      ctyPrefixIndex: null,
      prefixCache: new Map(),
      countryPrefixMap: null,
      masterSet: null,
      scoringSpec: null,
      scoringRuleMap: new Map(),
      scoringRuleByFolder: new Map(),
      scoringAliasMap: new Map(),
      scoringStatus: 'pending',
      scoringError: '',
      scoringSource: '',
      analysisMode: ANALYSIS_MODE_DEFAULT,
      callsignGridCache: new Map(),
      operatingStyleSpotAnchors: []
    };
  }

  function normalizeAnalysisMode(value) {
    return value === ANALYSIS_MODE_DXER ? ANALYSIS_MODE_DXER : ANALYSIS_MODE_CONTESTER;
  }

  function normalizeCall(call) {
    return (call || '').trim().toUpperCase();
  }

  function bandOrderIndex(band) {
    const key = (band || '').toUpperCase();
    if (BAND_ORDER_INDEX.has(key)) return BAND_ORDER_INDEX.get(key);
    const num = parseFloat(key);
    if (Number.isFinite(num)) return 1000 + num;
    return 9999;
  }

  function sortBands(list) {
    return (list || []).slice().sort((a, b) => {
      const ai = bandOrderIndex(a);
      const bi = bandOrderIndex(b);
      if (ai !== bi) return ai - bi;
      return String(a || '').localeCompare(String(b || ''));
    });
  }

  function formatBandLabel(band) {
    if (!band) return '';
    const raw = String(band).trim();
    if (!raw) return '';
    if (raw === 'All' || raw === 'ALL') return 'All';
    const key = raw.toUpperCase();
    if (BAND_LABELS.has(key) || key === 'LIGHT') return key.toLowerCase();
    return raw;
  }

  function bandLabelFromNumberToken(token) {
    if (!token) return '';
    const key = String(token).trim();
    if (!key) return '';
    const direct = METER_TOKEN_MAP.get(key);
    if (direct) return direct;
    const norm = String(parseFloat(key));
    return METER_TOKEN_MAP.get(norm) || '';
  }

  function parseBandFromFreq(freqMHz) {
    if (!Number.isFinite(freqMHz)) return '';
    for (const band of BAND_DEFS) {
      if (freqMHz >= band.min && freqMHz < band.max) return band.label;
    }
    return '';
  }

  function normalizeBandToken(raw) {
    if (!raw) return '';
    const cleaned = String(raw).trim();
    if (!cleaned) return '';
    let token = cleaned.toLowerCase().replace(/\s+/g, '');
    token = token
      .replace(/meters?|metres?/g, 'm')
      .replace(/centimeters?|centimetres?/g, 'cm')
      .replace(/millimeters?|millimetres?/g, 'mm');
    let match = token.match(/^(\d+(?:\.\d+)?)(mm|cm|m)$/);
    if (match) {
      const num = String(parseFloat(match[1]));
      return `${num}${match[2]}`.toUpperCase();
    }
    match = token.match(/^(\d+(?:\.\d+)?)g(?:hz)?$/);
    if (match) {
      const ghz = parseFloat(match[1]);
      if (Number.isFinite(ghz)) {
        const band = parseBandFromFreq(ghz * 1000);
        return band || `${match[1]}G`.toUpperCase();
      }
    }
    if (/^\d+(\.\d+)?$/.test(token)) {
      const fromToken = bandLabelFromNumberToken(token);
      if (fromToken) return fromToken;
      const num = parseFloat(token);
      if (!Number.isFinite(num)) return '';
      const mhz = num >= 1000 ? num / 1000 : num;
      const band = parseBandFromFreq(mhz);
      return band || String(num).toUpperCase();
    }
    return cleaned.toUpperCase();
  }

  function normalizeBand(rawBand, freq) {
    const band = normalizeBandToken(rawBand);
    if (band) return band;
    if (Number.isFinite(freq)) return parseBandFromFreq(freq);
    return '';
  }

  function normalizeMode(mode) {
    return (mode || '').trim().toUpperCase();
  }

  function modeBucket(mode) {
    const m = normalizeMode(mode);
    if (m === 'CW') return 'CW';
    if (MODE_PHONE.has(m)) return 'Phone';
    if (MODE_DIGITAL.has(m)) return 'Digital';
    return 'Digital';
  }

  function dateKeyFromTs(ts) {
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    return y * 10000 + m * 100 + day;
  }

  function monthKeyFromTs(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  function yearKeyFromTs(ts) {
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    return String(d.getUTCFullYear());
  }

  function buildCountryMonthBuckets(qsos, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const monthKey = monthKeyFromTs(q.ts);
      if (!monthKey) return;
      if (!map.has(q.country)) {
        map.set(q.country, { total: 0, months: new Map() });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.months.set(monthKey, (buckets.months.get(monthKey) || 0) + 1);
    });
    return map;
  }

  function buildZoneMonthBuckets(qsos, field, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const fieldName = field === 'itu' ? 'ituZone' : 'cqZone';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      const zone = Number.isFinite(q[fieldName]) ? q[fieldName] : null;
      if (!zone || q.ts == null) return;
      const monthKey = monthKeyFromTs(q.ts);
      if (!monthKey) return;
      if (!map.has(zone)) {
        map.set(zone, { total: 0, months: new Map(), countries: new Set() });
      }
      const buckets = map.get(zone);
      buckets.total += 1;
      buckets.months.set(monthKey, (buckets.months.get(monthKey) || 0) + 1);
      if (q.country) buckets.countries.add(q.country);
    });
    return map;
  }

  function buildCountryYearBuckets(qsos, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      if (q.country == null || q.ts == null) return;
      const yearKey = yearKeyFromTs(q.ts);
      if (!yearKey) return;
      if (!map.has(q.country)) {
        map.set(q.country, { total: 0, years: new Map() });
      }
      const buckets = map.get(q.country);
      buckets.total += 1;
      buckets.years.set(yearKey, (buckets.years.get(yearKey) || 0) + 1);
    });
    return map;
  }

  function buildZoneYearBuckets(qsos, field, bandFilter) {
    const map = new Map();
    const bandKey = bandFilter ? normalizeBandToken(bandFilter) : '';
    const fieldName = field === 'itu' ? 'ituZone' : 'cqZone';
    qsos.forEach((q) => {
      const qBand = q.band ? normalizeBandToken(q.band) : '';
      if (bandKey && qBand !== bandKey) return;
      const zone = Number.isFinite(q[fieldName]) ? q[fieldName] : null;
      if (!zone || q.ts == null) return;
      const yearKey = yearKeyFromTs(q.ts);
      if (!yearKey) return;
      if (!map.has(zone)) {
        map.set(zone, { total: 0, years: new Map(), countries: new Set() });
      }
      const buckets = map.get(zone);
      buckets.total += 1;
      buckets.years.set(yearKey, (buckets.years.get(yearKey) || 0) + 1);
      if (q.country) buckets.countries.add(q.country);
    });
    return map;
  }

  function computeBreakSummary(minutesMap, threshold) {
    const minutes = Array.from(minutesMap.keys()).sort((a, b) => a - b);
    if (!minutes.length) return { totalBreakMin: 0, breaks: [] };
    const breaks = [];
    let totalBreakMin = 0;
    for (let i = 1; i < minutes.length; i += 1) {
      const gap = minutes[i] - minutes[i - 1];
      if (gap > threshold) {
        const len = gap - 1;
        totalBreakMin += len;
        breaks.push({ start: minutes[i - 1] + 1, end: minutes[i] - 1, minutes: len });
      }
    }
    return { totalBreakMin, breaks };
  }

  function clampNumber(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  function medianNumber(values) {
    const list = (values || []).filter((value) => Number.isFinite(value)).slice().sort((a, b) => a - b);
    if (!list.length) return null;
    const mid = Math.floor(list.length / 2);
    return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
  }

  function exportOperatingStyleFrequencies(freqMap) {
    return Array.from((freqMap instanceof Map ? freqMap : new Map()).entries())
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, 3)
      .map(([freqKey, count]) => ({ freq: freqKey / 1000, count }));
  }

  function normalizeOperatingStyleSpotAnchors(anchors) {
    if (!Array.isArray(anchors)) return [];
    const out = [];
    anchors.forEach((raw) => {
      if (!raw || typeof raw !== 'object') return;
      const direction = String(raw.direction || raw.kind || 'ofUs').trim().toLowerCase();
      if (direction && direction !== 'ofus') return;
      const source = String(raw.source || '').trim().toLowerCase() === 'rbn' ? 'rbn' : 'spots';
      const ts = Number(raw.ts);
      const freqMHz = Number(raw.freqMHz ?? raw.freq);
      const band = normalizeBand(raw.band, Number.isFinite(freqMHz) ? freqMHz : null) || '';
      if (!Number.isFinite(ts) || !band) return;
      out.push({
        ts,
        band,
        freqMHz: Number.isFinite(freqMHz) ? freqMHz : null,
        source,
        mode: modeBucket(raw.txMode || raw.tx_mode || raw.mode || ''),
        spotter: normalizeCall(raw.spotter || raw.spotterCall || raw.de || raw.by || ''),
        confidence: source === 'rbn' ? 1 : 0.6
      });
    });
    return out.sort((a, b) => a.ts - b.ts);
  }

  function estimateOperatingStyleRadiusKhz(freqs, mode) {
    const unique = Array.from(new Set((freqs || []).filter((value) => Number.isFinite(value)))).sort((a, b) => a - b);
    const diffs = [];
    for (let i = 1; i < unique.length; i += 1) {
      const deltaKhz = (unique[i] - unique[i - 1]) * 1000;
      if (deltaKhz > 0.01) diffs.push(deltaKhz);
    }
    const medianStepKhz = medianNumber(diffs);
    const isPhone = mode === 'Phone';
    const minRadiusKhz = isPhone ? 2.5 : 1;
    const maxRadiusKhz = isPhone ? 4 : 2;
    const candidateKhz = Number.isFinite(medianStepKhz) ? medianStepKhz : minRadiusKhz;
    return clampNumber(candidateKhz, minRadiusKhz, maxRadiusKhz);
  }

  function buildOperatingStyleSummary(qsos) {
    const spotAnchors = normalizeOperatingStyleSpotAnchors(activeAnalysisEnv?.operatingStyleSpotAnchors || []);
    const meta = {
      windowRadiusQsos: 20,
      minClusterCount: 4,
      dominanceShareMin: 0.35,
      cabrilloRunWindowMaxMinutes: 10,
      inbandReturnRadiusQsos: 10,
      activeRunGapQsos: 40,
      activeRunGapMaxMinutes: 10,
      activeRunSeedHaloMinutes: 10,
      spotAnchorRadiusQsos: 10,
      rbnAnchorRadiusQsos: 1,
      rbnMicroAnchorRadiusQsos: 1,
      rbnMicroActiveRunGapQsos: 24,
      spotAnchorMaxGapMinutes: 15,
      rbnMicroAnchorMaxGapMinutes: 5,
      rbnMicroAnchorWindowMinutes: 3,
      rbnMicroAnchorFreqRadiusKhz: 2,
      rbnMicroAnchorLocalRadiusQsos: 12,
      rbnMicroAnchorMinLocalQsos: 2,
      rbnMicroAnchorMinSpots: 3,
      rbnMicroAnchorMinSpotters: 3,
      rbnAnchorsRequirePreliminaryRun: true,
      spotAnchoringUsed: false,
      spotAnchorCount: 0,
      spotAnchorCountsBySource: { spots: 0, rbn: 0, rbnMicro: 0 }
    };
    const buckets = new Map();
    let excludedQsoCount = 0;
    (qsos || []).forEach((q, index) => {
      if (!q || q.isQtc) return;
      if (!Number.isFinite(q.ts) || !Number.isFinite(q.freq)) {
        excludedQsoCount += 1;
        return;
      }
      const band = normalizeBand(q.band, q.freq) || 'unknown';
      const mode = modeBucket(q.mode);
      const key = `${band}|${mode}`;
      if (!buckets.has(key)) buckets.set(key, { band, mode, items: [] });
      buckets.get(key).items.push({ q, index });
    });
    const bandMap = new Map();
    const allOperatingItems = [];
    const ensureBand = (band) => {
      if (!bandMap.has(band)) {
        bandMap.set(band, {
          band,
          qsos: 0,
          runQsos: 0,
          inbandQsos: 0,
          searchQsos: 0,
          offbandSpQsos: 0,
          spQsos: 0,
          runPct: 0,
          inbandPct: 0,
          searchPct: 0,
          inbandPctOfSp: 0,
          searchPctOfSp: 0,
          offbandSpPctOfSp: 0,
          spPct: 0,
          topRunFrequencies: [],
          modeBreakdown: [],
          _runFreqs: new Map()
        });
      }
      return bandMap.get(band);
    };

    buckets.forEach((bucket) => {
      const list = bucket.items.slice().sort((a, b) => (
        (a.q.ts - b.q.ts)
        || ((a.q.qsoNumber || 0) - (b.q.qsoNumber || 0))
        || (a.index - b.index)
      ));
      const radiusKhz = estimateOperatingStyleRadiusKhz(list.map((entry) => entry.q.freq), bucket.mode);
      const radiusMHz = radiusKhz / 1000;
      const modeEntry = {
        mode: bucket.mode,
        qsos: list.length,
        runQsos: 0,
        inbandQsos: 0,
        searchQsos: 0,
        offbandSpQsos: 0,
        spQsos: 0,
        runPct: 0,
        inbandPct: 0,
        searchPct: 0,
        inbandPctOfSp: 0,
        searchPctOfSp: 0,
        offbandSpPctOfSp: 0,
        spPct: 0,
        clusterRadiusKhz: radiusKhz,
        topRunFrequencies: []
      };
      const modeRunFreqs = new Map();
      const bandEntry = ensureBand(bucket.band);
      const analysis = new Array(list.length);
      const cabrilloWindowMaxMs = meta.cabrilloRunWindowMaxMinutes * 60000;
      const countSupport = (centerFreq, positions) => {
        let count = 0;
        positions.forEach((k) => {
          if (Math.abs(list[k].q.freq - centerFreq) <= radiusMHz + 1e-9) count += 1;
        });
        return count;
      };

      for (let i = 0; i < list.length; i += 1) {
        const lo = Math.max(0, i - meta.windowRadiusQsos);
        const hi = Math.min(list.length - 1, i + meta.windowRadiusQsos);
        const currentTs = Number(list[i].q.ts);
        const windowPositions = [];
        for (let k = lo; k <= hi; k += 1) {
          if (Math.abs(Number(list[k].q.ts) - currentTs) <= cabrilloWindowMaxMs) windowPositions.push(k);
        }
        let bestFreq = null;
        let bestCount = 0;
        let bestDistance = Infinity;
        windowPositions.forEach((j) => {
          const center = list[j].q.freq;
          const count = countSupport(center, windowPositions);
          const distance = Math.abs(list[i].q.freq - center);
          if (count > bestCount || (count === bestCount && distance < bestDistance)) {
            bestFreq = center;
            bestCount = count;
            bestDistance = distance;
          }
        });
        const windowSize = windowPositions.length;
        const dominance = windowSize ? (bestCount / windowSize) : 0;
        const centeredRunActive = bestCount >= meta.minClusterCount && dominance >= meta.dominanceShareMin;
        const centeredOnRun = centeredRunActive && Math.abs(list[i].q.freq - bestFreq) <= radiusMHz + 1e-9;
        let streakLo = i;
        while (streakLo > 0 && Math.abs(list[streakLo - 1].q.freq - list[i].q.freq) <= radiusMHz + 1e-9) streakLo -= 1;
        let streakHi = i;
        while (streakHi + 1 < list.length && Math.abs(list[streakHi + 1].q.freq - list[i].q.freq) <= radiusMHz + 1e-9) streakHi += 1;
        const streakSpanMs = Number(list[streakHi].q.ts) - Number(list[streakLo].q.ts);
        analysis[i] = {
          centeredRunActive,
          centeredOnRun,
          dominantRunFreq: Number.isFinite(bestFreq) ? bestFreq : null,
          streakRunSupported: (streakHi - streakLo + 1) >= meta.minClusterCount && streakSpanMs <= cabrilloWindowMaxMs
        };
      }

      const bucketItems = [];
      for (let i = 0; i < list.length; i += 1) {
        let hasPrevCenteredRun = false;
        for (let j = i - 1; j >= Math.max(0, i - meta.inbandReturnRadiusQsos); j -= 1) {
          if (analysis[j].centeredOnRun) {
            hasPrevCenteredRun = true;
            break;
          }
        }
        let hasNextCenteredRun = false;
        for (let j = i + 1; j <= Math.min(list.length - 1, i + meta.inbandReturnRadiusQsos); j += 1) {
          if (analysis[j].centeredOnRun) {
            hasNextCenteredRun = true;
            break;
          }
        }
        const hasRunReturn = hasPrevCenteredRun && hasNextCenteredRun;
        const transitionRun = analysis[i].streakRunSupported && !hasRunReturn;
        const q = list[i].q;
        q.operatingStyleBand = bucket.band;
        q.operatingStyleMode = bucket.mode;
        bucketItems.push({
          q,
          index: list[i].index,
          band: bucket.band,
          mode: bucket.mode,
          modeEntry,
          bandEntry,
          modeRunFreqs,
          preliminaryRun: analysis[i].centeredOnRun || transitionRun,
          runFreq: analysis[i].centeredOnRun ? analysis[i].dominantRunFreq : q.freq,
          candidateRunFreq: analysis[i].dominantRunFreq
        });
      }
      allOperatingItems.push(...bucketItems);
      modeEntry.qsos = list.length;
      bandEntry.modeBreakdown.push(modeEntry);
    });

    const itemsByBand = new Map();
    allOperatingItems.forEach((entry) => {
      if (!itemsByBand.has(entry.band)) itemsByBand.set(entry.band, []);
      itemsByBand.get(entry.band).push(entry);
    });
    const activeRunRangesByBand = new Map();
    const activeRunSeedTimesByBand = new Map();
    itemsByBand.forEach((items, band) => {
      const ordered = items.slice().sort((a, b) => (
        (a.q.ts - b.q.ts)
        || ((a.q.qsoNumber || 0) - (b.q.qsoNumber || 0))
        || (a.index - b.index)
      ));
      const seedPositions = [];
      ordered.forEach((entry, pos) => {
        entry.bandPosition = pos;
        if (entry.preliminaryRun) seedPositions.push({ pos, source: 'cabrillo' });
      });
      const nearestPositionForTs = (ts, predicate = null, maxDelta = Infinity) => {
        let lo = 0;
        let hi = ordered.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (Number(ordered[mid].q.ts) < ts) lo = mid + 1;
          else hi = mid;
        }
        let bestPos = -1;
        let bestDelta = Infinity;
        const consider = (pos) => {
          if (pos < 0 || pos >= ordered.length) return false;
          const delta = Math.abs(Number(ordered[pos].q.ts) - ts);
          if (delta > maxDelta) return false;
          if (typeof predicate === 'function' && !predicate(ordered[pos])) return true;
          if (delta < bestDelta) {
            bestPos = pos;
            bestDelta = delta;
          }
          return true;
        };
        for (let pos = lo - 1; pos >= 0; pos -= 1) {
          if (!consider(pos)) break;
        }
        for (let pos = lo; pos < ordered.length; pos += 1) {
          if (!consider(pos)) break;
        }
        return bestPos >= 0 ? { entry: ordered[bestPos], pos: bestPos, delta: bestDelta } : null;
      };
      const anchorsForBand = spotAnchors.filter((anchor) => anchor.band === band);
      const rbnAnchorsForBand = anchorsForBand
        .filter((anchor) => (
          anchor.source === 'rbn'
          && anchor.mode === 'CW'
          && Number.isFinite(anchor.freqMHz)
        ))
        .sort((a, b) => a.ts - b.ts);
      const isNearAnchorFreq = (entry, anchor, radiusMHz) => (
        entry
        && entry.mode === 'CW'
        && Number.isFinite(anchor?.freqMHz)
        && Number.isFinite(entry.q?.freq)
        && Math.abs(entry.q.freq - anchor.freqMHz) <= radiusMHz + 1e-9
      );
      const lowerBoundRbnAnchorTs = (ts) => {
        let lo = 0;
        let hi = rbnAnchorsForBand.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (rbnAnchorsForBand[mid].ts < ts) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      };
      const hasStrongRbnCluster = (anchor) => {
        const windowMs = meta.rbnMicroAnchorWindowMinutes * 60000;
        const radiusMHz = meta.rbnMicroAnchorFreqRadiusKhz / 1000;
        const endTs = anchor.ts + windowMs;
        let idx = lowerBoundRbnAnchorTs(anchor.ts - windowMs);
        let spotCount = 0;
        const spotters = new Set();
        for (; idx < rbnAnchorsForBand.length; idx += 1) {
          const candidate = rbnAnchorsForBand[idx];
          if (candidate.ts > endTs) break;
          if (Math.abs(candidate.freqMHz - anchor.freqMHz) > radiusMHz + 1e-9) continue;
          spotCount += 1;
          if (candidate.spotter) spotters.add(candidate.spotter);
        }
        return spotCount >= meta.rbnMicroAnchorMinSpots
          && spotters.size >= meta.rbnMicroAnchorMinSpotters;
      };
      const hasRbnMicroSupport = (anchor, pos) => {
        if (!Number.isFinite(anchor?.freqMHz)) return false;
        const radiusMHz = meta.rbnMicroAnchorFreqRadiusKhz / 1000;
        const lo = Math.max(0, pos - meta.rbnMicroAnchorLocalRadiusQsos);
        const hi = Math.min(ordered.length - 1, pos + meta.rbnMicroAnchorLocalRadiusQsos);
        let localCount = 0;
        for (let idx = lo; idx <= hi; idx += 1) {
          if (isNearAnchorFreq(ordered[idx], anchor, radiusMHz)) localCount += 1;
        }
        if (localCount >= meta.rbnMicroAnchorMinLocalQsos) return true;
        return localCount > 0 && hasStrongRbnCluster(anchor);
      };
      const addedMicroSeeds = new Set();
      anchorsForBand.forEach((anchor) => {
        const maxGapMs = meta.spotAnchorMaxGapMinutes * 60000;
        const best = nearestPositionForTs(
          anchor.ts,
          anchor.source === 'rbn' ? (entry) => entry.mode === 'CW' : null,
          maxGapMs
        );
        if (!best) return;
        let seedSource = anchor.source;
        let seedPos = best.pos;
        if (anchor.source === 'rbn' && meta.rbnAnchorsRequirePreliminaryRun) {
          const corroboratingRun = nearestPositionForTs(
            anchor.ts,
            (entry) => entry.mode === 'CW' && entry.preliminaryRun,
            maxGapMs
          );
          if (!corroboratingRun) {
            const radiusMHz = meta.rbnMicroAnchorFreqRadiusKhz / 1000;
            const microMaxGapMs = meta.rbnMicroAnchorMaxGapMinutes * 60000;
            const microBest = nearestPositionForTs(
              anchor.ts,
              (entry) => isNearAnchorFreq(entry, anchor, radiusMHz),
              microMaxGapMs
            );
            if (!microBest || !hasRbnMicroSupport(anchor, microBest.pos)) return;
            seedSource = 'rbnMicro';
            seedPos = microBest.pos;
            const seedKey = `${seedSource}:${seedPos}`;
            if (addedMicroSeeds.has(seedKey)) return;
            addedMicroSeeds.add(seedKey);
          }
        }
        seedPositions.push({ pos: seedPos, source: seedSource });
        meta.spotAnchoringUsed = true;
        meta.spotAnchorCount += 1;
        meta.spotAnchorCountsBySource[seedSource] = (meta.spotAnchorCountsBySource[seedSource] || 0) + 1;
      });
      const ranges = [];
      seedPositions
        .sort((a, b) => a.pos - b.pos)
        .forEach((seed) => {
          const radius = seed.source === 'cabrillo'
            ? 0
            : (seed.source === 'rbn'
              ? meta.rbnAnchorRadiusQsos
              : (seed.source === 'rbnMicro' ? meta.rbnMicroAnchorRadiusQsos : meta.spotAnchorRadiusQsos));
          const seedTs = Number(ordered[seed.pos]?.q?.ts);
          const radiusMaxMs = meta.activeRunGapMaxMinutes * 60000;
          let start = Math.max(0, seed.pos - radius);
          let end = Math.min(ordered.length - 1, seed.pos + radius);
          while (
            start < seed.pos
            && Number.isFinite(seedTs)
            && (seedTs - Number(ordered[start]?.q?.ts)) > radiusMaxMs
          ) {
            start += 1;
          }
          while (
            end > seed.pos
            && Number.isFinite(seedTs)
            && (Number(ordered[end]?.q?.ts) - seedTs) > radiusMaxMs
          ) {
            end -= 1;
          }
          const last = ranges[ranges.length - 1];
          const gapLimit = last && (seed.source === 'rbnMicro' || last.source === 'rbnMicro')
            ? meta.rbnMicroActiveRunGapQsos
            : meta.activeRunGapQsos;
          const gapStartTs = last ? Number(ordered[last.end]?.q?.ts) : null;
          const gapEndTs = Number(ordered[start]?.q?.ts);
          const gapWithinTime = Number.isFinite(gapStartTs)
            && Number.isFinite(gapEndTs)
            && (gapEndTs - gapStartTs) <= meta.activeRunGapMaxMinutes * 60000;
          if (last && start - last.end <= gapLimit && gapWithinTime) {
            last.end = Math.max(last.end, end);
            if (seed.source === 'rbnMicro') last.source = 'rbnMicro';
          } else {
            ranges.push({ start, end, source: seed.source });
          }
        });
      activeRunRangesByBand.set(band, ranges);
      activeRunSeedTimesByBand.set(
        band,
        seedPositions
          .map((seed) => Number(ordered[seed.pos]?.q?.ts))
          .filter(Number.isFinite)
          .sort((a, b) => a - b)
      );
    });
    const isActiveRunPosition = (entry) => {
      const ranges = activeRunRangesByBand.get(entry.band) || [];
      return ranges.some((range) => entry.bandPosition >= range.start && entry.bandPosition <= range.end);
    };
    const hasActiveRunSeedWithinHalo = (entry) => {
      const seedTimes = activeRunSeedTimesByBand.get(entry.band) || [];
      const ts = Number(entry.q?.ts);
      if (!seedTimes.length || !Number.isFinite(ts)) return false;
      const maxDelta = meta.activeRunSeedHaloMinutes * 60000;
      let lo = 0;
      let hi = seedTimes.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (seedTimes[mid] < ts) lo = mid + 1;
        else hi = mid;
      }
      return lo > 0 && (ts - seedTimes[lo - 1]) <= maxDelta;
    };

    allOperatingItems.forEach((entry) => {
      const role = entry.preliminaryRun ? 'RUN' : ((isActiveRunPosition(entry) || hasActiveRunSeedWithinHalo(entry)) ? 'INBAND' : 'SEARCH');
      const q = entry.q;
      const { bandEntry, modeEntry, modeRunFreqs } = entry;
      q.operatingStyleRole = role;
      q.operatingStyleRunFreq = role === 'RUN' ? entry.runFreq : entry.candidateRunFreq;
      bandEntry.qsos += 1;
      if (role === 'RUN') {
        bandEntry.runQsos += 1;
        modeEntry.runQsos += 1;
        const runFreq = Number.isFinite(q.operatingStyleRunFreq) ? q.operatingStyleRunFreq : q.freq;
        const freqKey = Math.round(runFreq * 1000);
        bandEntry._runFreqs.set(freqKey, (bandEntry._runFreqs.get(freqKey) || 0) + 1);
        modeRunFreqs.set(freqKey, (modeRunFreqs.get(freqKey) || 0) + 1);
      } else if (role === 'INBAND') {
        bandEntry.inbandQsos += 1;
        modeEntry.inbandQsos += 1;
      } else {
        bandEntry.searchQsos += 1;
        bandEntry.offbandSpQsos += 1;
        modeEntry.searchQsos += 1;
        modeEntry.offbandSpQsos += 1;
      }
    });

    buckets.forEach((bucket) => {
      const modeEntry = ensureBand(bucket.band).modeBreakdown.find((entry) => entry.mode === bucket.mode);
      if (!modeEntry) return;
      modeEntry.spQsos = modeEntry.inbandQsos + modeEntry.searchQsos;
      if (modeEntry.qsos) {
        modeEntry.runPct = (modeEntry.runQsos / modeEntry.qsos) * 100;
        modeEntry.inbandPct = (modeEntry.inbandQsos / modeEntry.qsos) * 100;
        modeEntry.searchPct = (modeEntry.searchQsos / modeEntry.qsos) * 100;
        modeEntry.spPct = (modeEntry.spQsos / modeEntry.qsos) * 100;
      }
      if (modeEntry.spQsos) {
        modeEntry.inbandPctOfSp = (modeEntry.inbandQsos / modeEntry.spQsos) * 100;
        modeEntry.searchPctOfSp = (modeEntry.searchQsos / modeEntry.spQsos) * 100;
        modeEntry.offbandSpPctOfSp = modeEntry.searchPctOfSp;
      }
      modeEntry.topRunFrequencies = exportOperatingStyleFrequencies(
        allOperatingItems
          .filter((entry) => entry.band === bucket.band && entry.mode === bucket.mode && entry.q.operatingStyleRole === 'RUN')
          .reduce((map, entry) => {
            const runFreq = Number.isFinite(entry.q.operatingStyleRunFreq) ? entry.q.operatingStyleRunFreq : entry.q.freq;
            const freqKey = Math.round(runFreq * 1000);
            map.set(freqKey, (map.get(freqKey) || 0) + 1);
            return map;
          }, new Map())
      );
    });

    const modeOrder = new Map([['CW', 0], ['Phone', 1], ['Digital', 2]]);
    const bands = Array.from(bandMap.values()).map((entry) => {
      entry.spQsos = entry.inbandQsos + entry.searchQsos;
      entry.offbandSpQsos = entry.searchQsos;
      if (entry.qsos) {
        entry.runPct = (entry.runQsos / entry.qsos) * 100;
        entry.inbandPct = (entry.inbandQsos / entry.qsos) * 100;
        entry.searchPct = (entry.searchQsos / entry.qsos) * 100;
        entry.spPct = (entry.spQsos / entry.qsos) * 100;
      }
      if (entry.spQsos) {
        entry.inbandPctOfSp = (entry.inbandQsos / entry.spQsos) * 100;
        entry.searchPctOfSp = (entry.searchQsos / entry.spQsos) * 100;
        entry.offbandSpPctOfSp = entry.searchPctOfSp;
      }
      entry.modeBreakdown.sort((a, b) => {
        const ai = modeOrder.has(a.mode) ? modeOrder.get(a.mode) : 99;
        const bi = modeOrder.has(b.mode) ? modeOrder.get(b.mode) : 99;
        if (ai !== bi) return ai - bi;
        return String(a.mode || '').localeCompare(String(b.mode || ''));
      });
      entry.topRunFrequencies = exportOperatingStyleFrequencies(entry._runFreqs);
      delete entry._runFreqs;
      return entry;
    }).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return String(a.band || '').localeCompare(String(b.band || ''));
    });

    const totals = bands.reduce((acc, entry) => {
      acc.qsos += entry.qsos;
      acc.runQsos += entry.runQsos;
      acc.inbandQsos += entry.inbandQsos;
      acc.searchQsos += entry.searchQsos;
      return acc;
    }, {
      band: 'All',
      qsos: 0,
      runQsos: 0,
      inbandQsos: 0,
      searchQsos: 0,
      offbandSpQsos: 0,
      spQsos: 0,
      runPct: 0,
      inbandPct: 0,
      searchPct: 0,
      inbandPctOfSp: 0,
      searchPctOfSp: 0,
      offbandSpPctOfSp: 0,
      spPct: 0,
      topRunFrequencies: [],
      modeBreakdown: []
    });
    totals.spQsos = totals.inbandQsos + totals.searchQsos;
    totals.offbandSpQsos = totals.searchQsos;
    if (totals.qsos) {
      totals.runPct = (totals.runQsos / totals.qsos) * 100;
      totals.inbandPct = (totals.inbandQsos / totals.qsos) * 100;
      totals.searchPct = (totals.searchQsos / totals.qsos) * 100;
      totals.spPct = (totals.spQsos / totals.qsos) * 100;
    }
    if (totals.spQsos) {
      totals.inbandPctOfSp = (totals.inbandQsos / totals.spQsos) * 100;
      totals.searchPctOfSp = (totals.searchQsos / totals.spQsos) * 100;
      totals.offbandSpPctOfSp = totals.searchPctOfSp;
    }

    return {
      meta,
      analyzedQsoCount: totals.qsos,
      excludedQsoCount,
      bands,
      totals
    };
  }

  function gridToLatLon(grid) {
    if (!grid || grid.length < 4) return null;
    const g = grid.trim().toUpperCase();
    const A = 'A'.charCodeAt(0);
    const R = 'R'.charCodeAt(0);
    const X = 'X'.charCodeAt(0);
    const lonField = g.charCodeAt(0);
    const latField = g.charCodeAt(1);
    if (lonField < A || lonField > R || latField < A || latField > R) return null;
    const lonSquare = parseInt(g[2], 10);
    const latSquare = parseInt(g[3], 10);
    if (!Number.isFinite(lonSquare) || !Number.isFinite(latSquare)) return null;
    const lon = (lonField - A) * 20 - 180 + lonSquare * 2;
    const lat = (latField - A) * 10 - 90 + latSquare * 1;
    if (g.length >= 6) {
      const lonSub = g.charCodeAt(4);
      const latSub = g.charCodeAt(5);
      if (lonSub < A || lonSub > X || latSub < A || latSub > X) return null;
      const lonMin = (lonSub - A) * (5 / 60) + (2.5 / 60);
      const latMin = (latSub - A) * (2.5 / 60) + (1.25 / 60);
      return { lat: lat + latMin, lon: lon + lonMin };
    }
    return { lat: lat + 0.5, lon: lon + 1 };
  }

  function latLonToField(lat, lon) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const fieldLon = Math.floor((lon + 180) / 20);
    const fieldLat = Math.floor((lat + 90) / 10);
    if (fieldLon < 0 || fieldLon > 17 || fieldLat < 0 || fieldLat > 17) return null;
    const A = 'A'.charCodeAt(0);
    return String.fromCharCode(A + fieldLon) + String.fromCharCode(A + fieldLat);
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function haversineKmWithRadius(lat1, lon1, lat2, lon2, radiusKm) {
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Number(radiusKm) * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function bearingDeg(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    const brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }

  function firstNonNull(...vals) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }

  function parseZone(val) {
    const n = parseInt((val ?? '').toString().trim(), 10);
    return Number.isFinite(n) ? n : null;
  }

  function classifyCallStructure(call) {
    const m = String(call || '').match(/^([A-Z]+)(\d+)([A-Z]+)$/);
    if (!m) return 'other';
    const pre = m[1].length;
    const digits = m[2].length;
    const suf = m[3].length;
    return `${pre}x${suf}d${digits}`;
  }

  function parseOperatorsList(raw) {
    if (!raw) return [];
    const tokens = String(raw)
      .split(/[,;]+/)
      .flatMap((chunk) => chunk.split(/\s+/))
      .map((t) => t.trim())
      .filter(Boolean);
    const out = [];
    const seen = new Set();
    tokens.forEach((t) => {
      const norm = normalizeCall(t);
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      out.push(norm);
    });
    return out;
  }

  function deriveStationCallsign(qsos) {
    for (const q of qsos || []) {
      const r = q.raw || {};
      const call = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      const normalized = normalizeCall(call);
      if (normalized) return normalized;
    }
    return null;
  }

  function isMaidenheadGrid(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    return /^[A-R]{2}\d{2}([A-X]{2})?$/.test(t);
  }

  function normalizeLookupGrid(raw) {
    if (!raw) return null;
    const t = String(raw).trim().toUpperCase();
    if (!t) return null;
    if (t.length >= 6 && /^[A-R]{2}\d{2}[A-X]{2}/.test(t)) return t.slice(0, 6);
    if (t.length >= 4 && /^[A-R]{2}\d{2}/.test(t)) return t.slice(0, 4);
    return null;
  }

  function getCallsignGrid(call) {
    const key = normalizeCall(call);
    if (!key) return null;
    const cache = activeAnalysisEnv?.callsignGridCache;
    if (!(cache instanceof Map) || !cache.has(key)) return null;
    return cache.get(key) || null;
  }

  function deriveStation(qsos) {
    for (const q of qsos || []) {
      const r = q.raw || {};
      const grids = [
        r.MY_GRIDSQUARE,
        r.STATION_LOC,
        r.GRID,
        r['GRID-LOCATOR'],
        r['HQ-GRID-LOCATOR']
      ].filter((g) => g !== undefined && g !== null && g !== '');
      for (const g of grids) {
        const loc = gridToLatLon(g);
        if (loc) return { lat: loc.lat, lon: loc.lon, source: 'grid', value: g };
      }
      if (r.MY_LAT && r.MY_LON) {
        const lat = parseFloat(r.MY_LAT);
        const lon = parseFloat(r.MY_LON);
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, source: 'latlon', value: `${lat},${lon}` };
      }
    }
    const stationCall = deriveStationCallsign(qsos);
    if (stationCall) {
      const lookupGrid = getCallsignGrid(stationCall);
      if (lookupGrid) {
        const loc = gridToLatLon(lookupGrid);
        if (loc) return { lat: loc.lat, lon: loc.lon, source: 'lookup', value: lookupGrid };
      }
      const prefix = lookupPrefix(stationCall);
      if (prefix && prefix.lat != null && prefix.lon != null) {
        return { lat: prefix.lat, lon: prefix.lon, source: 'cty', value: stationCall };
      }
    }
    return null;
  }

  function deriveRemoteLatLon(q, prefix) {
    if (q.grid) {
      const loc = gridToLatLon(q.grid);
      if (loc) return loc;
    }
    if (q.call) {
      const lookupGrid = getCallsignGrid(q.call);
      if (lookupGrid) {
        const loc = gridToLatLon(lookupGrid);
        if (loc) return loc;
      }
    }
    if (prefix && prefix.lat != null && prefix.lon != null) {
      return { lat: prefix.lat, lon: prefix.lon };
    }
    return null;
  }

  function makeDistanceSummary() {
    let count = 0;
    let sum = 0;
    let min = null;
    let max = null;
    const histogram = new Map();
    return {
      add(d, band) {
        if (!Number.isFinite(d)) return;
        count += 1;
        sum += d;
        if (min == null || d < min) min = d;
        if (max == null || d > max) max = d;
        const bucket = Math.floor(d / 1000) * 1000;
        if (!histogram.has(bucket)) histogram.set(bucket, { count: 0, bands: new Map() });
        const entry = histogram.get(bucket);
        entry.count += 1;
        if (band) entry.bands.set(band, (entry.bands.get(band) || 0) + 1);
      },
      export() {
        const buckets = Array.from(histogram.entries()).sort((a, b) => a[0] - b[0]).map(([start, data]) => ({
          range: `${start}-${start + 999}`,
          count: data.count,
          bands: data.bands
        }));
        return {
          count,
          avg: count ? sum / count : null,
          min,
          max,
          buckets
        };
      }
    };
  }

  function makeHeadingSummary() {
    const sectors = new Map();
    return {
      add(b, band) {
        if (!Number.isFinite(b)) return;
        const bucket = Math.floor(b / 10) * 10;
        if (!sectors.has(bucket)) {
          sectors.set(bucket, { count: 0, bands: new Map() });
        }
        const entry = sectors.get(bucket);
        entry.count += 1;
        if (band) entry.bands.set(band, (entry.bands.get(band) || 0) + 1);
      },
      export() {
        return Array.from(sectors.entries()).sort((a, b) => a[0] - b[0]).map(([start, data]) => ({
          sector: `${String(start).padStart(3, '0')} - ${String(start + 9).padStart(3, '0')}`,
          start,
          count: data.count,
          bands: data.bands
        }));
      }
    };
  }

  function parseDateTime(dateStr, timeStr) {
    const d = (dateStr || '').trim().replace(/\D/g, '');
    const t = (timeStr || '').trim().replace(/\D/g, '');
    if (d.length !== 8) return null;
    const year = parseInt(d.slice(0, 4), 10);
    const month = parseInt(d.slice(4, 6), 10) - 1;
    const day = parseInt(d.slice(6, 8), 10);
    let hh = 0;
    let mm = 0;
    let ss = 0;
    if (t.length >= 2) hh = parseInt(t.slice(0, 2), 10) || 0;
    if (t.length >= 4) mm = parseInt(t.slice(2, 4), 10) || 0;
    if (t.length >= 6) ss = parseInt(t.slice(4, 6), 10) || 0;
    const ts = Date.UTC(year, month, day, hh, mm, ss);
    return Number.isNaN(ts) ? null : ts;
  }

  function normalizeCabrilloMode(mode) {
    const m = normalizeMode(mode);
    if (m === 'RY' || m === 'RTTY') return 'RTTY';
    if (m === 'PH') return 'SSB';
    return m;
  }

  function isCallsignToken(token) {
    if (!token) return false;
    const t = token.trim().toUpperCase();
    if (isMaidenheadGrid(t)) return false;
    return /[A-Z]/.test(t) && /\d/.test(t);
  }

  function isLikelyRstToken(token) {
    if (!token) return false;
    const t = String(token).trim().toUpperCase();
    if (!t) return false;
    if (/^[1-5]\d{1,2}$/.test(t)) return true;
    if (/^(5NN|5NNN)$/.test(t)) return true;
    if (/^5NN[+-]?\d*$/.test(t)) return true;
    return false;
  }

  function parseCabrilloFreqToken(token) {
    const raw = (token || '').trim();
    if (!raw) return { freqMHz: null, band: '' };
    const upper = raw.toUpperCase();
    if (upper === 'LIGHT') return { freqMHz: null, band: 'LIGHT' };

    const ghzMatch = upper.match(/^(\d+(?:\.\d+)?)\s*G(?:HZ)?$/);
    if (ghzMatch) {
      const ghz = parseFloat(ghzMatch[1]);
      if (Number.isFinite(ghz)) {
        const mhz = ghz * 1000;
        const band = parseBandFromFreq(mhz) || `${ghzMatch[1]}G`.toUpperCase();
        return { freqMHz: mhz, band };
      }
    }

    const mhzMatch = upper.match(/^(\d+(?:\.\d+)?)\s*M(?:HZ)?$/);
    if (mhzMatch) {
      const mhz = parseFloat(mhzMatch[1]);
      if (Number.isFinite(mhz)) {
        const band = parseBandFromFreq(mhz) || normalizeBandToken(raw);
        return { freqMHz: mhz, band };
      }
    }

    if (/^\d+(\.\d+)?$/.test(upper)) {
      const bandToken = bandLabelFromNumberToken(upper);
      if (bandToken) return { freqMHz: null, band: bandToken };
      const num = parseFloat(upper);
      if (!Number.isFinite(num)) return { freqMHz: null, band: '' };
      const mhz = num >= 1000 ? num / 1000 : num;
      const band = parseBandFromFreq(mhz) || String(num).toUpperCase();
      return { freqMHz: mhz, band };
    }

    return { freqMHz: null, band: normalizeBandToken(raw) };
  }

  function normalizeCabrilloHeaderValue(value) {
    if (Array.isArray(value)) return value.join(' ');
    return value;
  }

  function shouldParseCabrilloTxId(header) {
    const tx = String(normalizeCabrilloHeaderValue(header?.['CATEGORY-TRANSMITTER'] || '') || '').toUpperCase();
    const op = String(normalizeCabrilloHeaderValue(header?.['CATEGORY-OPERATOR'] || '') || '').toUpperCase();
    if (tx && tx !== 'ONE' && tx !== 'SINGLE') return true;
    if (op.includes('MULTI')) return true;
    return false;
  }

  function parseCabrillo(text) {
    const lines = String(text || '').split(/\r\n|\n|\r/);
    const header = {};
    const qsos = [];
    const qtcs = [];
    const parseQsoTokens = (tokens, lineIndex, rawLine) => {
      if (tokens.length < 8) return;
      const freqInfo = parseCabrilloFreqToken(tokens[0]);
      const freqMHz = freqInfo.freqMHz;
      const mode = normalizeCabrilloMode(tokens[1]);
      const date = tokens[2] || '';
      const time = tokens[3] || '';
      const myCall = tokens[4] || '';
      let txId = null;
      const working = tokens.slice();
      if (working.length >= 9 && /^\d$/.test(working[working.length - 1]) && shouldParseCabrilloTxId(header)) {
        txId = working.pop();
      }

      const isVhfGrid = working.length >= 8
        && isMaidenheadGrid(working[5])
        && isCallsignToken(working[6])
        && isMaidenheadGrid(working[7]);

      if (isVhfGrid) {
        const sentGrid = working[5] || '';
        const call = working[6] || '';
        const rcvdTokens = working.slice(7).map((t) => t.trim()).filter(Boolean);
        const exchSent = sentGrid;
        const exchRcvd = rcvdTokens.join(' ').trim();
        const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
        qsos.push({
          QSO_DATE: date,
          TIME_ON: time,
          BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: '',
          RST_RCVD: '',
          STX_STRING: exchSent,
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: sentGrid,
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall,
          IS_QTC: false,
          EVENT_TYPE: 'QSO',
          LINE_INDEX: lineIndex,
          RAW_LINE: rawLine,
          TX_ID: txId
        });
        return;
      }

      const hasLegacyNoSentExchange = working.length >= 8
        && isCallsignToken(working[5])
        && isLikelyRstToken(working[6])
        && isLikelyRstToken(working[7]);

      if (hasLegacyNoSentExchange) {
        const call = working[5] || '';
        const rstSent = working[6] || '';
        const rstRcvd = working[7] || '';
        const exchRcvd = working.slice(8).join(' ').trim();
        const rcvdTokens = working.slice(8).map((t) => t.trim()).filter(Boolean);
        const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
        qsos.push({
          QSO_DATE: date,
          TIME_ON: time,
          BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
          MODE: mode,
          CALL: call,
          FREQ: freqMHz,
          RST_SENT: rstSent,
          RST_RCVD: rstRcvd,
          STX_STRING: '',
          SRX_STRING: exchRcvd,
          MY_GRIDSQUARE: '',
          GRIDSQUARE: rcvdGrid,
          OPERATOR: myCall,
          IS_QTC: false,
          EVENT_TYPE: 'QSO',
          LINE_INDEX: lineIndex,
          RAW_LINE: rawLine,
          TX_ID: txId
        });
        return;
      }

      if (working.length < 9) return;
      const rstSent = working[5] || '';
      const rest = working.slice(6);
      let dxIndex = -1;
      for (let i = 0; i < rest.length; i += 1) {
        if (!isCallsignToken(rest[i])) continue;
        if (i + 1 < rest.length && isLikelyRstToken(rest[i + 1])) {
          dxIndex = i;
          break;
        }
        if (dxIndex === -1) dxIndex = i;
      }
      if (dxIndex === -1 || dxIndex + 1 >= rest.length) {
        dxIndex = Math.max(0, Math.min(1, rest.length - 2));
      }
      const exchSent = rest.slice(0, dxIndex).join(' ').trim();
      const call = rest[dxIndex] || '';
      const rstRcvd = rest[dxIndex + 1] || '';
      const exchRcvd = rest.slice(dxIndex + 2).join(' ').trim();
      const sentTokens = rest.slice(0, dxIndex).map((t) => t.trim()).filter(Boolean);
      const rcvdTokens = rest.slice(dxIndex + 2).map((t) => t.trim()).filter(Boolean);
      const sentGrid = sentTokens.find((t) => isMaidenheadGrid(t));
      const rcvdGrid = rcvdTokens.find((t) => isMaidenheadGrid(t));
      qsos.push({
        QSO_DATE: date,
        TIME_ON: time,
        BAND: freqInfo.band || (freqMHz ? parseBandFromFreq(freqMHz) : ''),
        MODE: mode,
        CALL: call,
        FREQ: freqMHz,
        RST_SENT: rstSent,
        RST_RCVD: rstRcvd,
        STX_STRING: exchSent,
        SRX_STRING: exchRcvd,
        MY_GRIDSQUARE: sentGrid,
        GRIDSQUARE: rcvdGrid,
        OPERATOR: myCall,
        IS_QTC: false,
        EVENT_TYPE: 'QSO',
        LINE_INDEX: lineIndex,
        RAW_LINE: rawLine,
        TX_ID: txId
      });
    };

    const parseQtcTokens = (tokens, lineIndex, rawLine) => {
      const freqInfo = parseCabrilloFreqToken(tokens[0]);
      const groupRaw = String(tokens[5] || '').trim();
      const groupMatch = groupRaw.match(/^(\d+)\/(\d+)$/);
      const receiver = normalizeCall(tokens[4]);
      const transmitter = normalizeCall(tokens[6]);
      const reportedCall = normalizeCall(tokens[8]);
      const required = [tokens[0], tokens[1], tokens[2], tokens[3], receiver, groupRaw, transmitter, tokens[7], reportedCall, tokens[9]];
      const parseErrors = [];
      if (required.some((value) => !String(value || '').trim())) parseErrors.push('missing_required_field');
      if (!groupMatch) parseErrors.push('invalid_qtc_group');
      const seriesNumber = groupMatch ? parseInt(groupMatch[1], 10) : null;
      const seriesSize = groupMatch ? parseInt(groupMatch[2], 10) : null;
      if (groupMatch && (!Number.isFinite(seriesNumber) || seriesNumber < 1 || !Number.isFinite(seriesSize) || seriesSize < 1 || seriesSize > 10)) {
        parseErrors.push('invalid_qtc_group_range');
      }
      const date = String(tokens[2] || '').trim();
      const mode = normalizeCabrilloMode(tokens[1]);
      const band = freqInfo.band || (freqInfo.freqMHz ? parseBandFromFreq(freqInfo.freqMHz) : '');
      const seriesId = [mode, receiver, transmitter, groupRaw].join('|');
      qtcs.push({
        QSO_DATE: date,
        TIME_ON: String(tokens[3] || '').trim(),
        BAND: band,
        MODE: mode,
        FREQ: freqInfo.freqMHz,
        RECEIVER: receiver,
        TRANSMITTER: transmitter,
        QTC_GROUP: groupRaw,
        QTC_SERIES_NUMBER: seriesNumber,
        QTC_SERIES_SIZE: seriesSize,
        REPORTED_TIME: String(tokens[7] || '').trim(),
        REPORTED_CALL: reportedCall,
        REPORTED_SERIAL: String(tokens[9] || '').trim(),
        SERIES_ID: seriesId,
        PARSE_STATUS: parseErrors.length ? 'malformed' : 'valid',
        PARSE_ERRORS: parseErrors,
        IS_QTC: true,
        EVENT_TYPE: 'QTC',
        LINE_INDEX: lineIndex,
        RAW_LINE: rawLine
      });
    };

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^QSO:/i.test(trimmed)) {
        parseQsoTokens(trimmed.replace(/^QSO:\s*/i, '').split(/\s+/), lineIndex, trimmed);
      } else if (/^QTC:/i.test(trimmed)) {
        parseQtcTokens(trimmed.replace(/^QTC:\s*/i, '').split(/\s+/), lineIndex, trimmed);
      } else {
        const idx = trimmed.indexOf(':');
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim().toUpperCase();
        const value = trimmed.slice(idx + 1).trim();
        if (!key) return;
        if (header[key] == null) header[key] = value;
        else if (Array.isArray(header[key])) header[key].push(value);
        else header[key] = [header[key], value];
      }
    });

    return { header, qsos, qtcs };
  }

  function parseAdif(text) {
    const records = [];
    const parts = String(text || '').split(/<eor>/i);
    for (const raw of parts) {
      const rec = {};
      let i = 0;
      while (i < raw.length) {
        const lt = raw.indexOf('<', i);
        if (lt === -1) break;
        const gt = raw.indexOf('>', lt);
        if (gt === -1) break;
        const header = raw.slice(lt + 1, gt);
        const [namePart, restPart] = header.split(':');
        const name = (namePart || '').trim().toUpperCase();
        const lenStr = (restPart || '').split(/[>:]/)[0];
        const len = parseInt(lenStr, 10);
        if (!name || !Number.isFinite(len) || len <= 0) {
          i = gt + 1;
          continue;
        }
        const value = raw.substr(gt + 1, len);
        rec[name] = value.trim();
        i = gt + 1 + len;
      }
      if (Object.keys(rec).length > 0) records.push(rec);
    }
    return records;
  }

  function parseCbf(text) {
    const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith(';'));
    const qsos = [];
    for (const line of lines) {
      const cleaned = line.replace(/(\d),(?=\d)/g, '$1.');
      const parts = cleaned.split(/[\t;]+/).map((p) => p.trim());
      if (parts.length < 5) continue;
      const fields = parts.length >= 5 ? parts : line.split(',').map((p) => p.trim());
      const [date, time, call, bandOrFreq, mode, rstSent, rstRcvd, exchSent, exchRcvd, operator, grid, cqz, ituz] = fields;
      const freqInfo = parseCabrilloFreqToken(bandOrFreq);
      const band = freqInfo.band || normalizeBandToken(bandOrFreq);
      const freq = Number.isFinite(freqInfo.freqMHz) ? freqInfo.freqMHz : null;
      qsos.push({
        DATE: date,
        TIME: time,
        BAND: band,
        MODE: mode,
        CALL: call,
        FREQ: freq,
        RST_SENT: rstSent,
        RST_RCVD: rstRcvd,
        EXCH_SENT: exchSent,
        EXCH_RCVD: exchRcvd,
        OPERATOR: operator,
        GRIDSQUARE: grid,
        CQZ: cqz,
        ITUZ: ituz
      });
    }
    return qsos;
  }

  function parseLogFile(text, filename) {
    const lower = String(filename || '').toLowerCase();
    if (lower.endsWith('.log') || lower.endsWith('.cbr') || /START-OF-LOG:/i.test(text) || /^QSO:/im.test(text)) {
      const cab = parseCabrillo(text);
      const metaRaw = cab.header || {};
      const meta = {};
      Object.keys(metaRaw).forEach((key) => {
        meta[key] = normalizeCabrilloHeaderValue(metaRaw[key]);
      });
      const sharedRaw = {
        STATION_CALLSIGN: meta.CALLSIGN || meta.CALL || null,
        CONTEST: meta.CONTEST || null,
        CATEGORY_OPERATOR: meta['CATEGORY-OPERATOR'] || null,
        CATEGORY_ASSISTED: meta['CATEGORY-ASSISTED'] || null,
        CATEGORY_POWER: meta['CATEGORY-POWER'] || null,
        CATEGORY_BAND: meta['CATEGORY-BAND'] || null,
        CATEGORY_MODE: meta['CATEGORY-MODE'] || null,
        CATEGORY_TRANSMITTER: meta['CATEGORY-TRANSMITTER'] || null,
        CATEGORY_STATION: meta['CATEGORY-STATION'] || null,
        CLUB: meta.CLUB || null,
        SOFTWARE: meta['CREATED-BY'] || null,
        CLAIMED_SCORE: meta['CLAIMED-SCORE'] || meta['CLAIMED-SCORE:'] || null,
        OPERATORS: meta.OPERATORS || null,
        GRID: meta['GRID-LOCATOR'] || meta['HQ-GRID-LOCATOR'] || null,
        MY_GRIDSQUARE: meta['GRID-LOCATOR'] || meta['HQ-GRID-LOCATOR'] || null,
        LOCATION: meta.LOCATION || null
      };
      const qsos = cab.qsos.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || sharedRaw.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX),
        points: parseInt(firstNonNull(r.POINTS), 10),
        srx: firstNonNull(r.SRX_STRING, r.SRX),
        stx: firstNonNull(r.STX_STRING, r.STX),
        isQtc: false,
        eventType: 'QSO',
        lineIndex: Number.isFinite(r.LINE_INDEX) ? r.LINE_INDEX : null,
        rawLine: r.RAW_LINE || '',
        raw: Object.assign({}, sharedRaw, r)
      }));
      const stationCall = normalizeCall(sharedRaw.STATION_CALLSIGN);
      const qtcs = (cab.qtcs || []).map((r, idx) => {
        const receiver = normalizeCall(r.RECEIVER);
        const transmitter = normalizeCall(r.TRANSMITTER);
        const direction = stationCall && receiver === stationCall
          ? 'received'
          : (stationCall && transmitter === stationCall ? 'sent' : 'ambiguous');
        const partner = direction === 'received'
          ? transmitter
          : (direction === 'sent' ? receiver : (transmitter || receiver));
        return {
          id: `qtc-${idx}`,
          qtcNumber: idx + 1,
          call: partner,
          partner,
          receiver,
          transmitter,
          direction,
          seriesGroup: r.QTC_GROUP || '',
          seriesNumber: Number.isFinite(r.QTC_SERIES_NUMBER) ? r.QTC_SERIES_NUMBER : null,
          seriesSize: Number.isFinite(r.QTC_SERIES_SIZE) ? r.QTC_SERIES_SIZE : null,
          seriesId: r.SERIES_ID || '',
          reportedTime: r.REPORTED_TIME || '',
          reportedCall: normalizeCall(r.REPORTED_CALL),
          reportedSerial: r.REPORTED_SERIAL || '',
          parseStatus: r.PARSE_STATUS || 'malformed',
          parseErrors: Array.isArray(r.PARSE_ERRORS) ? r.PARSE_ERRORS.slice() : [],
          validationWarnings: [],
          band: normalizeBand(r.BAND, r.FREQ),
          mode: normalizeMode(r.MODE),
          freq: r.FREQ ? parseFloat(r.FREQ) : null,
          time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
          ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
          op: stationCall,
          isQtc: true,
          eventType: 'QTC',
          lineIndex: Number.isFinite(r.LINE_INDEX) ? r.LINE_INDEX : null,
          rawLine: r.RAW_LINE || '',
          raw: Object.assign({}, sharedRaw, r)
        };
      });
      const events = [...qsos, ...qtcs].sort((a, b) => {
        const lineA = Number.isFinite(a?.lineIndex) ? a.lineIndex : Number.MAX_SAFE_INTEGER;
        const lineB = Number.isFinite(b?.lineIndex) ? b.lineIndex : Number.MAX_SAFE_INTEGER;
        return lineA - lineB;
      });
      return { type: 'CABRILLO', qsos, qtcs, events };
    }
    if (lower.endsWith('.adi') || lower.endsWith('.adif') || /<eoh>/i.test(text) || /<eor>/i.test(text)) {
      const adifRecords = parseAdif(text);
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX, r.APP_N1MM_EXCHANGE1),
        points: parseInt(firstNonNull(r.APP_N1MM_POINTS, r.QSO_PTS, r.QSO_POINTS, r.POINTS), 10),
        srx: firstNonNull(r.SRX_STRING, r.SRX),
        stx: firstNonNull(r.STX_STRING, r.STX),
        comment: r.COMMENT || r.NOTES,
        raw: r
      }));
      return { type: 'ADIF', qsos, qtcs: [], events: qsos.slice() };
    }
    if (lower.endsWith('.cbf')) {
      const cbfRecords = parseCbf(text);
      const qsos = cbfRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, null),
        mode: normalizeMode(r.MODE),
        freq: null,
        time: `${(r.DATE || '').trim()} ${(r.TIME || '').trim()}`,
        ts: parseDateTime(r.DATE, r.TIME),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        grid: r.GRIDSQUARE,
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.EXCH_SENT, r.STX),
        exchRcvd: firstNonNull(r.EXCH_RCVD, r.SRX),
        points: parseInt(firstNonNull(r.POINTS), 10),
        srx: firstNonNull(r.EXCH_RCVD, r.SRX),
        stx: firstNonNull(r.EXCH_SENT, r.STX),
        comment: r.COMMENT || r.NOTES,
        raw: r
      }));
      return { type: 'CBF', qsos, qtcs: [], events: qsos.slice() };
    }
    const adifRecords = parseAdif(text);
    if (adifRecords.length) {
      const qsos = adifRecords.map((r, idx) => ({
        id: idx,
        qsoNumber: idx + 1,
        call: normalizeCall(r.CALL),
        band: normalizeBand(r.BAND, r.FREQ ? parseFloat(r.FREQ) : null),
        mode: normalizeMode(r.MODE),
        freq: r.FREQ ? parseFloat(r.FREQ) : null,
        time: `${(r.QSO_DATE || '').trim()} ${(r.TIME_ON || '').trim()}`,
        ts: parseDateTime(r.QSO_DATE, r.TIME_ON),
        op: normalizeCall(r.OPERATOR || r.STATION_CALLSIGN),
        rstSent: r.RST_SENT,
        rstRcvd: r.RST_RCVD,
        exchSent: firstNonNull(r.STX_STRING, r.STX),
        exchRcvd: firstNonNull(r.SRX_STRING, r.SRX, r.APP_N1MM_EXCHANGE1),
        points: parseInt(firstNonNull(r.APP_N1MM_POINTS, r.QSO_PTS, r.QSO_POINTS, r.POINTS), 10),
        raw: r
      }));
      return { type: 'ADIF', qsos, qtcs: [], events: qsos.slice() };
    }
    return { type: 'unknown', qsos: [], qtcs: [], events: [] };
  }

  function parseCtyDat(text) {
    if (!text || /<html|<body/i.test(text)) return [];
    const lines = String(text).split(/\r?\n/);
    const entries = [];
    const parseToken = (tok, base, isPrimary) => {
      const cleaned = tok.replace(/[:\s]+$/g, '');
      const m = cleaned.match(/^(=)?([^(\[\s]+)(?:\((\d+)\))?(?:\[(\d+)\])?$/);
      if (!m) return null;
      const [, exactMark, bodyRaw, cqOverride, ituOverride] = m;
      const body = bodyRaw.replace(/^\*+/, '');
      if (!body) return null;
      return {
        prefix: body.toUpperCase(),
        exact: exactMark === '=',
        primary: Boolean(isPrimary),
        country: base.country,
        cqZone: cqOverride ? parseInt(cqOverride, 10) : base.cqZone,
        ituZone: ituOverride ? parseInt(ituOverride, 10) : base.ituZone,
        continent: base.continent,
        lat: base.lat,
        lon: base.lon,
        tz: base.tz
      };
    };

    let buffer = '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      buffer += (buffer ? ' ' : '') + line;
      while (buffer.includes(';')) {
        const [entryChunk, restChunk] = buffer.split(/;\s*/, 2);
        buffer = restChunk || '';
        const entryLine = entryChunk.trim();
        if (!entryLine) continue;
        const fields = entryLine.split(':');
        if (fields.length < 8) continue;
        const [name, cqZone, ituZone, continent, lat, lon, tz, ...restFields] = fields;
        const prefixBlock = restFields.join(':').replace(/;+$/, '');
        const prefixes = prefixBlock.split(/[, \t]+/).filter(Boolean);
        const lonVal = parseFloat(lon);
        const base = {
          country: name,
          cqZone: parseInt(cqZone, 10) || null,
          ituZone: parseInt(ituZone, 10) || null,
          continent: (continent || '').trim() || null,
          lat: parseFloat(lat) || null,
          lon: Number.isFinite(lonVal) ? -lonVal : null,
          tz: parseFloat(tz) || null
        };
        let primarySet = false;
        for (const p of prefixes) {
          const parsed = parseToken(p.trim(), base, !primarySet);
          if (parsed) {
            entries.push(parsed);
            if (!primarySet) primarySet = true;
          }
        }
      }
    }

    const sorted = entries.sort((a, b) => {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      return b.prefix.length - a.prefix.length;
    });
    if (sorted.length > 0) return sorted;

    const looseEntries = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const firstColon = line.indexOf(':');
      if (firstColon === -1) continue;
      const countryFields = line.split(':');
      if (countryFields.length < 7) continue;
      const [name, cqZone, ituZone, continent, lat, lon, tz, restFields] = countryFields;
      const suffix = restFields ? restFields.split(/[;,]/) : [];
      const lonVal = parseFloat(lon);
      const base = {
        country: name,
        cqZone: parseInt(cqZone, 10) || null,
        ituZone: parseInt(ituZone, 10) || null,
        continent: (continent || '').trim() || null,
        lat: parseFloat(lat) || null,
        lon: Number.isFinite(lonVal) ? -lonVal : null,
        tz: parseFloat(tz) || null
      };
      let primarySet = false;
      for (const t of suffix) {
        const parsed = parseToken(t.trim(), base, !primarySet);
        if (parsed) {
          looseEntries.push(parsed);
          if (!primarySet) primarySet = true;
        }
      }
    }
    return looseEntries.sort((a, b) => {
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      return b.prefix.length - a.prefix.length;
    });
  }

  function baseCall(call) {
    if (!call) return '';
    const parts = call.split('/');
    if (parts.length === 1) return call;
    const suffix = parts[parts.length - 1];
    if (PORTABLE_CALL_SUFFIXES.has(suffix)) return parts[0];
    const cand = parts.reduce((best, p) => (p.length > best.length ? p : best), '');
    return cand || call;
  }

  function parseMasterDta(text) {
    let data = text;
    if (typeof text !== 'string') {
      try {
        data = new TextDecoder('utf-8').decode(text);
      } catch (e) {
        data = '';
      }
    }
    const set = new Set();
    const lines = String(data || '').split(/\r?\n/);
    for (const line of lines) {
      const cleaned = line.replace(/\0/g, '').trim();
      const call = normalizeCall(cleaned);
      if (call) {
        set.add(call);
        const base = baseCall(call);
        if (base) set.add(base);
      }
    }
    if (set.size < 1000) {
      let scan = data;
      if (typeof text !== 'string') {
        try {
          scan = new TextDecoder('latin1').decode(text);
        } catch (e) {
          scan = data;
        }
      }
      const re = /[A-Z0-9/]{3,12}/g;
      let m;
      while ((m = re.exec(scan)) !== null) {
        const token = m[0];
        if (!/^\w/.test(token)) continue;
        if (!/[0-9]/.test(token)) continue;
        const call = normalizeCall(token);
        if (call) {
          set.add(call);
          const base = baseCall(call);
          if (base) set.add(base);
        }
      }
    }
    return set;
  }

  function extractWpxPrefix(part) {
    if (!part) return '';
    const text = normalizeCall(part).replace(/[^A-Z0-9]/g, '');
    if (!text) return '';
    const lastDigitIndex = text.search(/\d(?!.*\d)/);
    if (lastDigitIndex >= 0) {
      if (lastDigitIndex === 0) {
        const leading = text.match(/^(\d+[A-Z]+)/);
        if (leading) return leading[1];
      }
      return text.slice(0, lastDigitIndex + 1);
    }
    const letters = text.replace(/[^A-Z]/g, '');
    if (!letters) return '';
    if (letters.length >= 2) return `${letters.slice(0, 2)}0`;
    return `${letters[0]}0`;
  }

  function wpxPrefix(call) {
    const norm = normalizeCall(call);
    if (!norm) return '';
    const parts = norm.split('/').filter(Boolean);
    const base = baseCall(norm) || norm;
    let candidate = '';
    let candidateHasDigit = false;
    for (const part of parts) {
      if (!part || part === base) continue;
      if (WPX_IGNORE_SUFFIXES.has(part)) continue;
      if (!/[A-Z]/.test(part)) continue;
      const hasDigit = /\d/.test(part);
      if (!candidate || (hasDigit && !candidateHasDigit)) {
        candidate = part;
        candidateHasDigit = hasDigit;
        if (candidateHasDigit) break;
      }
    }
    return extractWpxPrefix(candidate || base || parts[0] || norm);
  }

  function findPrefixEntry(key) {
    if (!activeAnalysisEnv?.ctyTable || !key) return null;
    const index = activeAnalysisEnv.ctyPrefixIndex;
    if (!(index?.exact instanceof Map) || !(index?.prefix instanceof Map)) {
      for (const entry of activeAnalysisEnv.ctyTable) {
        if (entry.exact) {
          if (key === entry.prefix) return entry;
        } else if (key.startsWith(entry.prefix)) {
          return entry;
        }
      }
      return null;
    }

    let match = index.exact.get(key) || null;
    for (let length = 1; length <= key.length; length += 1) {
      const candidate = index.prefix.get(key.slice(0, length));
      if (candidate && (!match || candidate.order < match.order)) match = candidate;
    }
    return match?.entry || null;
  }

  function getUnitedStatesEntry() {
    if (!activeAnalysisEnv?.ctyTable) return null;
    return activeAnalysisEnv.ctyTable.find((entry) => !entry.exact && entry.country === 'United States' && entry.prefix === 'K') || null;
  }

  function isLikelyUsKg4Call(key) {
    if (!key) return false;
    const base = key.split('/')[0] || key;
    if (!KG4_US_CALL_RE.test(base)) return false;
    return !KG4_GITMO_RE.test(base);
  }

  function lookupPrefix(call) {
    if (!activeAnalysisEnv?.ctyTable || !call) return null;
    const key = normalizeCall(call);
    if (!key) return null;
    if (activeAnalysisEnv.prefixCache.has(key)) return activeAnalysisEnv.prefixCache.get(key);

    let found = findPrefixEntry(key);
    if (key.includes('/')) {
      const fullExact = Boolean(found && found.exact && found.prefix === key);
      if (!fullExact) {
        const parts = key.split('/').filter(Boolean);
        const suffix = parts[parts.length - 1] || '';
        if (SLASH_AREA_TOKEN_RE.test(suffix) && !PORTABLE_CALL_SUFFIXES.has(suffix)) {
          const suffixHit = findPrefixEntry(suffix);
          if (suffixHit) found = suffixHit;
        }
        const base = baseCall(key);
        const baseHit = base && base !== key ? findPrefixEntry(base) : null;
        if (baseHit && baseHit.exact) found = baseHit;
      }
    }

    if (found && found.country === 'Guantanamo Bay' && found.prefix === 'KG4' && isLikelyUsKg4Call(key)) {
      const usEntry = getUnitedStatesEntry();
      if (usEntry) found = usEntry;
    }

    if (activeAnalysisEnv.prefixCache.size > 10000) activeAnalysisEnv.prefixCache.clear();
    activeAnalysisEnv.prefixCache.set(key, found);
    return found;
  }

  function buildCountryPrefixMap() {
    if (activeAnalysisEnv?.countryPrefixMap instanceof Map) return activeAnalysisEnv.countryPrefixMap;
    const map = new Map();
    if (!activeAnalysisEnv?.ctyTable) return map;
    for (const entry of activeAnalysisEnv.ctyTable) {
      if (!entry.country || !entry.prefix || !entry.primary) continue;
      if (!map.has(entry.country)) map.set(entry.country, entry.prefix);
    }
    for (const entry of activeAnalysisEnv.ctyTable) {
      if (!entry.country || !entry.prefix) continue;
      if (map.has(entry.country)) continue;
      const current = map.get(entry.country);
      if (!current || entry.prefix.length < current.length) {
        map.set(entry.country, entry.prefix);
      }
    }
    if (activeAnalysisEnv) activeAnalysisEnv.countryPrefixMap = map;
    return map;
  }

  function normalizeContinent(code) {
    const raw = (code || '').trim().toUpperCase();
    if (!raw) return '';
    if (raw === 'NA' || raw === 'SA' || raw === 'EU' || raw === 'AF' || raw === 'AS' || raw === 'OC') return raw;
    const words = raw.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(Boolean);
    if (raw.includes('AMERICA')) {
      if (raw.includes('SOUTH') || words.includes('S')) return 'SA';
      if (raw.includes('NORTH') || words.includes('N')) return 'NA';
      return 'NA';
    }
    if (raw.includes('EUROPE')) return 'EU';
    if (raw.includes('AFRICA')) return 'AF';
    if (raw.includes('ASIA')) return 'AS';
    if (raw.includes('OCEANIA') || raw.includes('AUSTRALIA')) return 'OC';
    const match = raw.match(/[A-Z]{2}/);
    return match ? match[0] : '';
  }

  function markDupes(qsos, analysisMode = ANALYSIS_MODE_CONTESTER) {
    const seen = new Map();
    const dupes = [];
    const isDxer = analysisMode === ANALYSIS_MODE_DXER;
    for (const q of qsos || []) {
      if (!q.call) {
        q.isDupe = false;
        continue;
      }
      const call = q.call;
      const band = q.band || '';
      const key = `${call}|${band}`;
      if (isDxer) {
        const lastTs = seen.get(key);
        if (Number.isFinite(q.ts) && Number.isFinite(lastTs) && (q.ts - lastTs) <= DUPE_WINDOW_MS && (q.ts - lastTs) >= 0) {
          q.isDupe = true;
          dupes.push(q);
        } else {
          q.isDupe = false;
        }
        if (Number.isFinite(q.ts)) seen.set(key, q.ts);
        continue;
      }
      const mode = q.mode || '';
      const strictKey = `${key}|${mode}`;
      if (seen.has(strictKey)) {
        q.isDupe = true;
        dupes.push(q);
      } else {
        q.isDupe = false;
        seen.set(strictKey, true);
      }
    }
    return dupes;
  }

  function deriveContestMeta(qsos) {
    const meta = {
      stationCallsign: null,
      contestId: null,
      category: null,
      categoryOperator: null,
      categoryMode: null,
      categoryBand: null,
      categoryPower: null,
      categoryTransmitter: null,
      categoryStation: null,
      claimedScore: null,
      club: null,
      software: null,
      operators: null
    };
    for (const q of qsos || []) {
      const r = q.raw || {};
      if (!meta.stationCallsign) meta.stationCallsign = firstNonNull(r.STATION_CALLSIGN, r.OPERATOR, q.op);
      if (!meta.contestId) meta.contestId = firstNonNull(r.CONTEST_ID, r.CONTEST_NAME, r.CONTEST);
      if (!meta.category) meta.category = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY, r.CATEGORY_OVERLAY);
      if (!meta.categoryOperator) meta.categoryOperator = firstNonNull(r.CATEGORY_OPERATOR, r.CATEGORY);
      if (!meta.categoryMode) meta.categoryMode = firstNonNull(r.CATEGORY_MODE, r.MODE);
      if (!meta.categoryBand) meta.categoryBand = firstNonNull(r.CATEGORY_BAND, r.BAND);
      if (!meta.categoryPower) meta.categoryPower = firstNonNull(r.CATEGORY_POWER);
      if (!meta.categoryTransmitter) meta.categoryTransmitter = firstNonNull(r.CATEGORY_TRANSMITTER);
      if (!meta.categoryStation) meta.categoryStation = firstNonNull(r.CATEGORY_STATION);
      if (meta.claimedScore == null) meta.claimedScore = firstNonNull(r.CLAIMED_SCORE, r.CLAIMED, r.APP_N1MM_CLAIMED_SCORE);
      if (!meta.club) meta.club = firstNonNull(r.CLUB, r.APP_N1MM_CLUB);
      if (!meta.software) meta.software = firstNonNull(r.APP_N1MM_N1MMVERSION, r.SW_VERSION, r.SOFTWARE);
      if (!meta.operators) meta.operators = firstNonNull(r.OPERATORS);
      if (meta.stationCallsign && meta.contestId && meta.category) break;
    }
    return meta;
  }

  function normalizeContestKey(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, '').trim();
  }

  function normalizeScoringRuleOverride(value) {
    const key = normalizeContestKey(value);
    if (key === 'WRTC2022' || key === 'WRTC2022ITALY' || key === 'WRTCITALY' || key === 'WRTC_2022') return 'wrtc_2022';
    if (key === 'WRTC' || key === 'WRTC2026' || key === 'WRTC2026UK' || key === 'WRTC_2026') return 'wrtc_2026';
    return '';
  }

  function isWrtcScoringRuleId(ruleId) {
    return ruleId === 'wrtc_2022' || ruleId === 'wrtc_2026';
  }

  function getWrtcScoringRuleLabel(ruleId) {
    if (ruleId === 'wrtc_2022') return 'WRTC 2022';
    if (ruleId === 'wrtc_2026') return 'WRTC 2026';
    return 'WRTC';
  }

  function isIaruHfContestMeta(contestMeta) {
    const key = normalizeContestKey(contestMeta?.contestId || '');
    if (!key) return false;
    if (!key.includes('IARU')) return false;
    return key.includes('HF') || key.includes('CHAMPIONSHIP') || key.includes('WORLDCHAMPIONSHIP');
  }

  function isWrtcScoringCandidate(contestMeta) {
    if (!isIaruHfContestMeta(contestMeta)) return false;
    const operator = String(contestMeta?.categoryOperator || contestMeta?.category || '').toUpperCase();
    const transmitter = String(contestMeta?.categoryTransmitter || '').toUpperCase();
    const power = String(contestMeta?.categoryPower || '').toUpperCase();
    const category = `${operator} ${transmitter} ${power} ${String(contestMeta?.category || '').toUpperCase()}`;
    const isMulti = operator.includes('MULTI') || /\bM\/?2\b/.test(category) || category.includes('MULTI-TWO');
    const isTwoTx = transmitter === 'TWO' || /\bM\/?2\b/.test(category) || category.includes('MULTI-TWO');
    const isLowPower = power === 'LOW' || power === 'LP' || category.includes('LOW') || /\bLP\b/.test(category);
    return isMulti && isTwoTx && isLowPower;
  }

  function parseClaimedScoreNumber(value) {
    if (value == null || value === '') return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const normalized = raw.replace(/,/g, '');
    const num = Number(normalized.replace(/[^\d.\-]/g, ''));
    if (!Number.isFinite(num)) return null;
    return Math.round(num);
  }

  function getArchiveFolderFromPath(path) {
    const raw = String(path || '').trim();
    if (!raw) return '';
    const clean = raw.replace(/^\/+|\/+$/g, '');
    if (!clean) return '';
    return (clean.split('/')[0] || '').trim();
  }

  function addScoringAlias(aliasMap, alias, ruleId, bias = 0) {
    const key = normalizeContestKey(alias);
    if (!key || !ruleId) return;
    const list = aliasMap.get(key) || [];
    list.push({ ruleId, score: key.length + bias });
    aliasMap.set(key, list);
  }

  function pickBestAliasCandidate(candidates) {
    if (!Array.isArray(candidates) || !candidates.length) return null;
    return candidates.slice().sort((a, b) => {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return String(a.ruleId || '').localeCompare(String(b.ruleId || ''));
    })[0] || null;
  }

  function buildScoringIndexes(spec) {
    const byId = new Map();
    const byFolder = new Map();
    const aliasMap = new Map();
    const list = Array.isArray(spec?.rule_sets) ? spec.rule_sets : [];
    list.forEach((rule) => {
      if (!rule || !rule.id) return;
      byId.set(rule.id, rule);
      if (rule.archive_folder) {
        byFolder.set(normalizeContestKey(rule.archive_folder), rule.id);
      }
      addScoringAlias(aliasMap, rule.id, rule.id, 70);
      addScoringAlias(aliasMap, rule.archive_folder, rule.id, 80);
      addScoringAlias(aliasMap, rule.name, rule.id, 10);
      if (Array.isArray(rule.aliases)) {
        rule.aliases.forEach((alias) => addScoringAlias(aliasMap, alias, rule.id, 90));
      }
      const builtIn = SCORING_RULE_ALIASES[rule.id];
      if (Array.isArray(builtIn)) {
        builtIn.forEach((alias) => addScoringAlias(aliasMap, alias, rule.id, 100));
      }
      if (Array.isArray(rule?.subevents)) {
        rule.subevents.forEach((sub) => {
          if (!sub) return;
          addScoringAlias(aliasMap, sub.id, rule.id, 50);
          if (Array.isArray(sub.slug_patterns)) {
            sub.slug_patterns.forEach((pattern) => addScoringAlias(aliasMap, pattern, rule.id, 60));
          }
        });
      }
    });
    return { byId, byFolder, aliasMap };
  }

  function resolveRuleIdByContestName(contestIdRaw) {
    const key = normalizeContestKey(contestIdRaw);
    if (!key) return null;
    const aliasMap = activeAnalysisEnv?.scoringAliasMap instanceof Map ? activeAnalysisEnv.scoringAliasMap : new Map();
    if (aliasMap.has(key)) {
      const best = pickBestAliasCandidate(aliasMap.get(key));
      return best ? best.ruleId : null;
    }
    let winner = null;
    aliasMap.forEach((candidates, alias) => {
      if (!alias) return;
      if (!key.includes(alias) && !alias.includes(key)) return;
      const best = pickBestAliasCandidate(candidates);
      if (!best) return;
      const matchScore = (best.score || 0) + Math.min(alias.length, key.length);
      if (!winner || matchScore > winner.score) {
        winner = { ruleId: best.ruleId, score: matchScore };
      }
    });
    return winner ? winner.ruleId : null;
  }

  function getConfidenceLabel(rule) {
    const raw = String(rule?.confidence || '').trim().toLowerCase();
    if (raw === 'high') return 'high';
    if (raw.startsWith('medium')) return 'medium';
    if (raw === 'low') return 'low';
    return 'unknown';
  }

  function resolveArrlSubevent(rule, contestIdRaw) {
    if (!rule || !Array.isArray(rule.subevents)) return null;
    const key = normalizeContestKey(contestIdRaw);
    if (!key) return null;
    let winner = null;
    rule.subevents.forEach((sub) => {
      const patterns = Array.isArray(sub?.slug_patterns) ? sub.slug_patterns : [];
      patterns.forEach((pattern) => {
        const patternKey = normalizeContestKey(pattern);
        if (!patternKey) return;
        if (!key.includes(patternKey) && !patternKey.includes(key)) return;
        const score = patternKey.length;
        if (!winner || score > winner.score) {
          winner = { subevent: sub, score };
        }
      });
    });
    return winner ? winner.subevent : null;
  }

  function resolveEuVhfModel(rule, contestIdRaw) {
    const key = normalizeContestKey(contestIdRaw);
    if (!key || !Array.isArray(rule?.subevent_models)) return null;
    if (key.includes('ALPEADRIA')) return rule.subevent_models.find((m) => m.model_id === 'distance_times_multipliers') || null;
    if (key.includes('MICROWAVE') || key.includes('MARATON') || key.includes('SHF')) {
      return rule.subevent_models.find((m) => m.model_id === 'band_weighted_distance') || null;
    }
    if (key.includes('IARU') || key.includes('REGION1') || key.includes('VHF')) {
      return rule.subevent_models.find((m) => m.model_id === 'distance_only') || null;
    }
    return null;
  }

  function resolveContestRuleSet(contestMeta, context = {}) {
    const byId = activeAnalysisEnv?.scoringRuleMap;
    const byFolder = activeAnalysisEnv?.scoringRuleByFolder;
    if (!(byId instanceof Map) || byId.size === 0 || !(byFolder instanceof Map)) {
      const failed = activeAnalysisEnv?.scoringStatus === 'error';
      return {
        supported: false,
        reason: failed ? 'spec_error' : 'spec_unavailable',
        warning: failed
          ? 'Scoring rules failed to load. Showing logged points only if available.'
          : 'Scoring rules are still loading. Please retry in a moment.',
        assumptions: failed
          ? [activeAnalysisEnv?.scoringError ? `Scoring spec load error: ${activeAnalysisEnv.scoringError}` : 'Scoring spec load failed.']
          : ['Scoring spec file is not loaded in runtime yet.'],
        detectionMethod: 'none'
      };
    }
    const scoringOverride = normalizeScoringRuleOverride(context?.scoringRuleOverride);
    if (isWrtcScoringRuleId(scoringOverride) && isWrtcScoringCandidate(contestMeta)) {
      const overrideRule = byId.get(scoringOverride);
      if (overrideRule) {
        const label = getWrtcScoringRuleLabel(scoringOverride);
        return {
          supported: true,
          rule: overrideRule,
          ruleId: overrideRule.id,
          confidence: getConfidenceLabel(overrideRule),
          detectionMethod: 'user_override',
          detectionValue: label,
          assumptions: [`User selected ${label} scoring for an IARU HF M/2 Low Power log.`],
          bundle: null
        };
      }
    }
    const archivePath = context?.logFile?.path || context?.sourcePath || '';
    const folder = getArchiveFolderFromPath(archivePath);
    const contestRaw = String(contestMeta?.contestId || '').trim();
    const bundleHint = `${contestRaw} ${archivePath}`.trim();
    const folderKey = normalizeContestKey(folder);
    let ruleId = folderKey ? byFolder.get(folderKey) : null;
    let detectionMethod = ruleId ? 'archive_folder' : 'contest_id_alias';
    if (!ruleId) ruleId = resolveRuleIdByContestName(contestRaw);
    if (String(context?.scoringRuleOverride || '').trim().toLowerCase() === 'standard'
      && isWrtcScoringRuleId(ruleId)
      && isWrtcScoringCandidate(contestMeta)) {
      ruleId = resolveRuleIdByContestName(contestRaw);
      if (isWrtcScoringRuleId(ruleId)) ruleId = null;
      detectionMethod = ruleId ? 'contest_id_alias' : 'contest_id_alias';
    }
    const rule = ruleId ? byId.get(ruleId) : null;
    if (!rule) {
      return {
        supported: false,
        reason: 'unknown_rule',
        warning: activeAnalysisEnv?.analysisMode === ANALYSIS_MODE_DXER ? SCORING_UNKNOWN_WARNING_DXER : SCORING_UNKNOWN_WARNING,
        assumptions: ['No matching scoring rule set found for this log.'],
        detectionMethod,
        detectionValue: contestRaw || folder || ''
      };
    }
    let bundle = null;
    const assumptions = [];
    if (rule.bundle === true && rule.id === 'arrl_family_bundle') {
      const subevent = resolveArrlSubevent(rule, bundleHint);
      if (subevent) {
        bundle = { type: 'arrl', subeventId: subevent.id, subevent };
      } else {
        assumptions.push('ARRL bundle matched but exact subevent slug was not detected.');
      }
    }
    if (rule.bundle === true && rule.id === 'eu_vhf_bundle') {
      const model = resolveEuVhfModel(rule, bundleHint);
      if (model) {
        bundle = { type: 'eu_vhf', subeventModelId: model.model_id, subeventModel: model };
      } else {
        assumptions.push('EU VHF bundle matched but subevent model could not be inferred from contest name.');
      }
    }
    return {
      supported: true,
      rule,
      ruleId: rule.id,
      confidence: getConfidenceLabel(rule),
      detectionMethod,
      detectionValue: detectionMethod === 'archive_folder' ? folder : contestRaw,
      assumptions,
      bundle
    };
  }

  function computeLoggedPointsTotal(qsos) {
    return (qsos || []).reduce((sum, q) => (Number.isFinite(q?.points) ? sum + q.points : sum), 0);
  }

  function normalizeCountryName(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
  }

  function hasCountryToken(country, tokens) {
    const key = normalizeCountryName(country);
    if (!key) return false;
    return tokens.some((token) => key.includes(token));
  }

  function isCountryUs(country) {
    return hasCountryToken(country, ['UNITED STATES', 'USA', 'K ', 'W ']);
  }

  function isCountryVe(country) {
    return hasCountryToken(country, ['CANADA']);
  }

  function isCountryUsOrVe(country) {
    return isCountryUs(country) || isCountryVe(country);
  }

  function bartgCallAreaPrefix(country) {
    if (isCountryUs(country)) return 'W';
    if (isCountryVe(country)) return 'VE';
    if (hasCountryToken(country, ['JAPAN'])) return 'JA';
    if (hasCountryToken(country, ['AUSTRALIA'])) return 'VK';
    return '';
  }

  function jarlRttyCallArea(call, country) {
    if (hasCountryToken(country, ['OGASAWARA', 'BONIN', 'VOLCANO', 'MINAMI TORISHIMA', 'MARCUS'])) return '';
    const areaPrefix = bartgCallAreaPrefix(country);
    if (!areaPrefix) return '';
    const norm = normalizeCall(call);
    const parts = norm.split('/').filter(Boolean);
    const main = baseCall(norm) || norm;
    const designators = parts.filter((part) => part !== main && !['MM'].includes(part));
    if (designators.length) {
      const digitMatches = designators.join('').match(/\d/g);
      const digit = digitMatches?.at(-1) || '0';
      return `${areaPrefix}${digit}`;
    }
    const prefix = wpxPrefix(main);
    const digits = prefix.match(/\d/g);
    return `${areaPrefix}${digits?.at(-1) || '0'}`;
  }

  function isPaccDutch(country, call) {
    return hasCountryToken(country, ['NETHERLANDS']) || /^(?:PA|PB|PC|PD|PE|PF|PG|PH|PI)/.test(String(call || '').toUpperCase());
  }

  function isAriDxItalian(country, call) {
    const normalizedCall = String(call || '').toUpperCase();
    if (/^(?:IG9|IH9)/.test(normalizedCall)) return false;
    return hasCountryToken(country, ['ITALY', 'SICILY', 'SARDINIA']) || /^I[A-Z0-9]/.test(normalizedCall);
  }

  function isAriSectionsStation(country, call) {
    const normalizedCall = baseCall(String(call || '').toUpperCase()) || String(call || '').toUpperCase();
    if (!hasCountryToken(country, ['ITALY', 'SICILY', 'SARDINIA'])) return false;
    if (/^IQ[A-Z0-9]/.test(normalizedCall)) return true;
    if (/^I(?:I|O|P|R|Y)/.test(normalizedCall)) return false;
    return /^I(?:[A-HJ-NP-Z])?\d[A-Z]/.test(normalizedCall);
  }

  function isBalticContestStation(country, call) {
    return hasCountryToken(country, ['ESTONIA', 'LATVIA', 'LITHUANIA']) || /^(?:ES|YL|LY)/.test(String(call || '').toUpperCase());
  }

  function isBalticContestExcludedCountry(country) {
    return hasCountryToken(country, ['RUSSIA', 'RUSSIAN FEDERATION', 'BELARUS']);
  }

  function cqpExchangeQths(tokens) {
    return [...new Set((tokens || []).map((token) => String(token || '').toUpperCase())
      .filter((token) => CQP_COUNTIES.has(token) || CQP_STATE_CODES.has(token) || VE_AREA_CODES.has(token) || token === 'DX'))];
  }

  function paccCallArea(call, country) {
    const normalizedCall = String(call || '').toUpperCase();
    const countryKey = normalizeCountryName(country);
    const labels = [
      [['UNITED STATES', 'ALASKA'], 'W'],
      [['CANADA'], 'VE'],
      [['JAPAN'], 'JA'],
      [['CHILE'], 'CE'],
      [['ARGENTINA'], 'LU'],
      [['BRAZIL'], 'PY'],
      [['AUSTRALIA'], 'VK'],
      [['SOUTH AFRICA'], 'ZS'],
      [['NEW ZEALAND'], 'ZL']
    ];
    let label = labels.find(([countries]) => countries.some((name) => countryKey.includes(name)))?.[1] || '';
    if (hasCountryToken(country, ['ASIATIC RUSSIA'])) label = 'UA';
    if (!label) return '';

    const parts = normalizedCall.split('/').filter(Boolean);
    const trailingArea = parts.length > 1 && /^\d$/.test(parts.at(-1)) ? parts.at(-1) : '';
    const reciprocalPrefix = parts.length > 1 && /^\D{1,3}\d$/.test(parts[0]) ? parts[0] : '';
    let digit = trailingArea || reciprocalPrefix.match(/\d/)?.[0] || '';
    if (!digit) digit = normalizedCall.match(/\d/)?.[0] || '';
    if (!digit) return '';

    if (label === 'VE') {
      const designator = trailingArea ? '' : (reciprocalPrefix || normalizedCall).match(/(?:VO|VY|VE|VA|CG|XK)\d/)?.[0] || '';
      if (/^VO/.test(designator)) label = 'VO';
      else if (/^VY/.test(designator)) label = 'VY';
    }
    if (label === 'UA' && !['8', '9', '0'].includes(digit)) return '';
    return `${label}${digit}`;
  }

  function isCountryRu(country) {
    return hasCountryToken(country, ['RUSSIA', 'RUSSIAN FEDERATION']);
  }

  function isCountryJa(country) {
    return hasCountryToken(country, [
      'JAPAN', 'OGASAWARA', 'BONIN', 'MINAMI TORISHIMA', 'MINAMITORISHIMA',
      'MARCUS', 'OKINO TORISHIMA', 'OKINOTORISHIMA'
    ]);
  }

  function isCountryFrench(country) {
    return hasCountryToken(country, ['FRANCE']);
  }

  function isCountryDl(country) {
    return hasCountryToken(country, ['GERMANY', 'FEDERAL REPUBLIC OF GERMANY']);
  }

  function isCountryEa(country) {
    return hasCountryToken(country, ['SPAIN', 'BALEARIC', 'CANARY', 'CEUTA', 'MELILLA']);
  }

  function isCountryEs(country, call) {
    return hasCountryToken(country, ['ESTONIA']) || /^ES[0-9]/.test(String(call || '').toUpperCase());
  }

  function isApSprintIdentity(callValue, countryValue) {
    const call = normalizeCall(callValue);
    const country = normalizeCountryName(countryValue);
    if (/^UA0/.test(call) && !/^UA9/.test(call)) return true;
    if (/^VK[1-9]/.test(call) && !/^VK9[XY]/.test(call)) return true;
    if (/^ZL[1-6]/.test(call)) return true;
    const countries = new Set([
      'FIJI', 'TIMOR-LESTE', 'EAST TIMOR', 'SPRATLY ISLANDS', 'WEST MALAYSIA', 'EAST MALAYSIA',
      'SINGAPORE', 'TAIWAN', 'PRATAS ISLAND', 'CHINA', 'SCARBOROUGH REEF', 'NAURU', 'PHILIPPINES',
      'NEW CALEDONIA', 'CHESTERFIELD ISLANDS', 'WALLIS AND FUTUNA ISLANDS', 'SOLOMON ISLANDS',
      'REPUBLIC OF KOREA', 'SOUTH KOREA', 'THAILAND', 'JAPAN', 'OGASAWARA', 'BONIN',
      'MINAMI TORISHIMA', 'MARCUS ISLAND', 'GUAM', 'WAKE ISLAND', 'MARIANA ISLANDS',
      'PAPUA NEW GUINEA', 'TUVALU', 'WESTERN KIRIBATI', 'BANABA ISLAND', 'PALAU',
      'FEDERATED STATES OF MICRONESIA', 'MICRONESIA', 'MARSHALL ISLANDS', 'BRUNEI',
      'HONG KONG', 'CAMBODIA', 'VIETNAM', 'MACAO', 'INDONESIA', 'VANUATU', 'NEW ZEALAND'
    ]);
    return countries.has(country);
  }

  function isPortableStation(contestMeta, stationCall) {
    const cat = String(contestMeta?.categoryStation || '').toUpperCase();
    const call = String(stationCall || '').toUpperCase();
    if (cat.includes('PORTABLE')) return true;
    if (cat === 'MOBILE') return true;
    if (call.includes('/P') || call.includes('/M') || call.includes('/MM')) return true;
    return false;
  }

  function extractExchangeTokens(q) {
    const raw = firstNonNull(
      q?.exchRcvd,
      q?.srx,
      q?.raw?.SRX_STRING,
      q?.raw?.EXCH_RCVD,
      q?.raw?.STATE,
      q?.raw?.SECTION,
      q?.raw?.RDA,
      q?.raw?.DOK,
      q?.raw?.EXCHANGE
    );
    if (!raw) return [];
    return String(raw).toUpperCase().split(/[\s,;:/]+/).map((t) => t.trim()).filter(Boolean);
  }

  function extractWVeQth(tokens) {
    for (const token of tokens) {
      if (US_STATE_CODES.has(token)) return token;
      if (VE_AREA_CODES.has(token)) return token;
    }
    return '';
  }

  function extractDokToken(tokens) {
    return tokens.find((token) => /^[A-Z]{1,3}\d{1,3}$/.test(token)) || '';
  }

  function extractEuRegionToken(tokens) {
    return tokens.find((token) => /^[A-Z]{1,3}\d{1,3}$/.test(token)) || '';
  }

  function extractRdaToken(tokens) {
    return tokens.find((token) => /^[A-Z]{2}\d{2,3}$/.test(token)) || '';
  }

  function extractRccNumber(tokens) {
    return tokens.find((token) => /^\d{1,4}$/.test(token)) || '';
  }

  function extractSerialToken(tokens) {
    return tokens.find((token) => /^\d{1,4}$/.test(token)) || '';
  }

  function extractRefDepartmentToken(tokens) {
    return tokens.find((token) => /^\d{2}[A-Z]?$/.test(token)) || '';
  }

  function extractTeamCode(tokens) {
    return tokens.find((token) => /^[A-Z]{2}\d{1,2}$/.test(token)) || '';
  }

  function extractYearToken(tokens) {
    return tokens.find((token) => /^(19|20)\d{2}$/.test(token)) || '';
  }

  function extractRegionToken(tokens) {
    return tokens.find((token) => /^[A-Z]{2,4}$/.test(token)) || '';
  }

  function extractSentExchangeTokens(q) {
    const raw = firstNonNull(q?.exchSent, q?.stx, q?.raw?.STX_STRING, q?.raw?.EXCH_SENT);
    if (!raw) return [];
    return String(raw).toUpperCase().split(/[\s,;:/]+/).map((t) => t.trim()).filter(Boolean);
  }

  function modeKeyForScoring(mode) {
    const bucket = modeBucket(mode);
    if (bucket === 'CW') return 'CW';
    if (bucket === 'Phone') return 'SSB';
    return 'DIG';
  }

  function lookupBandCoefficient(map, bandNorm) {
    if (!map || typeof map !== 'object') return 1;
    const key = String(bandNorm || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const val = Number(map[key]);
      return Number.isFinite(val) ? val : 1;
    }
    if (Object.prototype.hasOwnProperty.call(map, bandNorm)) {
      const val = Number(map[bandNorm]);
      return Number.isFinite(val) ? val : 1;
    }
    return 1;
  }

  function hfBandGroupKey(bandNorm) {
    const band = String(bandNorm || '').toUpperCase();
    if (band === '160M' || band === '80M' || band === '40M') return 'LOW';
    if (band === '20M' || band === '15M' || band === '10M') return 'HIGH';
    return band || 'OTHER';
  }

  function buildStationScoringProfile(qsos, contestMeta) {
    const stationCall = normalizeCall(contestMeta?.stationCallsign || deriveStationCallsign(qsos));
    const stationPrefix = stationCall ? lookupPrefix(stationCall) : null;
    const stationCountry = contestMeta?.stationCountry || stationPrefix?.country || '';
    const stationContinent = normalizeContinent(contestMeta?.stationContinent || stationPrefix?.continent || '');
    let stationSentEuRegion = '';
    let stationHasSentExchangeTokens = false;
    let stationIsCqpCalifornia = false;
    let stationIsNyqpNy = false;
    let stationIota = '';
    let stationIsTrcMember = false;
    for (const q of (qsos || [])) {
      const sentTokens = extractSentExchangeTokens(q);
      if (!sentTokens.length) continue;
      stationHasSentExchangeTokens = true;
      if (sentTokens.some((token) => /^\d+TRC$/.test(token) || token === 'TRC')) stationIsTrcMember = true;
      if (!stationIota) stationIota = sentTokens.find((token) => /^(?:AF|AN|AS|EU|NA|OC|SA)-\d{3}$/.test(token)) || '';
      if (cqpExchangeQths(sentTokens).some((value) => CQP_COUNTIES.has(value))) stationIsCqpCalifornia = true;
      if (sentTokens.some((value) => NYQP_COUNTIES.has(String(value || '').toUpperCase()))) stationIsNyqpNy = true;
      const euRegion = extractEuRegionToken(sentTokens);
      if (euRegion) {
        stationSentEuRegion = euRegion;
        break;
      }
    }
    return {
      stationCall,
      stationPrefixToken: stationPrefix?.prefix || '',
      stationCountry,
      stationCountryKey: normalizeCountryName(stationCountry),
      stationContinent,
      stationIota,
      stationCqZone: contestMeta?.stationCqZone ?? stationPrefix?.cqZone ?? null,
      stationItuZone: contestMeta?.stationItuZone ?? stationPrefix?.ituZone ?? null,
      stationIsEu: stationContinent === 'EU',
      stationIsNa: stationContinent === 'NA',
      stationIsRu: isCountryRu(stationCountry),
      stationIsFrench: isCountryFrench(stationCountry),
      stationIsDl: isCountryDl(stationCountry),
      stationIsEa: isCountryEa(stationCountry),
      stationIsPaccDutch: isPaccDutch(stationCountry, stationCall),
      stationIsAriDxItalian: isAriDxItalian(stationCountry, stationCall),
      stationIsJa: isCountryJa(stationCountry),
      stationIsMaritime: /\/MM$/.test(stationCall),
      stationOperatorCategory: String(contestMeta?.categoryOperator || '').toUpperCase(),
      stationCategoryMode: String(contestMeta?.categoryMode || '').toUpperCase(),
      stationCategoryPower: String(contestMeta?.categoryPower || '').toUpperCase(),
      stationCategoryTransmitter: String(contestMeta?.categoryTransmitter || '').toUpperCase(),
      stationIsMultiOperator: /MULTI/.test(String(contestMeta?.categoryOperator || '').toUpperCase()),
      stationIsOceania: stationContinent === 'OC',
      stationIsNaqpNa: stationContinent === 'NA' || hasCountryToken(stationCountry, ['HAWAII']),
      stationIsWVe: isCountryUsOrVe(stationCountry),
      stationSentEuRegion,
      stationHasSentExchangeTokens,
      stationIsEuExchangeMember: Boolean(stationSentEuRegion),
      stationIsCqpCalifornia,
      stationIsNyqpNy,
      stationIsTrcMember,
      stationPortable: isPortableStation(contestMeta, stationCall)
    };
  }

  function makeScoringRuntime(station) {
    return {
      station,
      callContacts: new Map(),
      callBandModes: new Map(),
      zoneBandSeen: new Set(),
      rfSubjectSeen: new Set(),
      scoringDuplicateSeen: new Set(),
      unknownWhen: new Set(),
      unknownMultiplier: new Set()
    };
  }

  function buildQsoScoringFacts(q, station, runtime) {
    const call = normalizeCall(q?.call);
    const prefix = call ? lookupPrefix(call) : null;
    const qCountry = q?.country || prefix?.country || '';
    const qCountryKey = normalizeCountryName(qCountry);
    const qContinent = normalizeContinent(q?.continent || prefix?.continent || '');
    const qCqZone = q?.cqZone != null ? q.cqZone : (prefix?.cqZone || null);
    const qItuZone = q?.ituZone != null ? q.ituZone : (prefix?.ituZone || null);
    const sameCountry = Boolean(station.stationCountryKey && qCountryKey && station.stationCountryKey === qCountryKey);
    const sameContinent = Boolean(station.stationContinent && qContinent && station.stationContinent === qContinent);
    const exchangeTokens = extractExchangeTokens(q);
    const exchangeSentTokens = extractSentExchangeTokens(q);
    const bandNorm = normalizeBandToken(q?.band);
    const modeKey = modeKeyForScoring(q?.mode);
    const bandModeKey = `${bandNorm}|${modeKey}`;
    const seenCount = runtime.callContacts.get(call) || 0;
    const seenBandModes = runtime.callBandModes.get(call) || new Set();
    const zoneBandKey = (qCqZone != null && bandNorm) ? `${bandNorm}|${qCqZone}` : '';
    const rfSubject = exchangeTokens[0] || '';
    const qPrefixToken = prefix?.prefix || '';
    const exchangeEuRegion = extractEuRegionToken(exchangeTokens);
    const exchangeIota = exchangeTokens.find((token) => /^(?:AF|AN|AS|EU|NA|OC|SA)-\d{3}$/.test(token)) || '';
    return {
      q,
      call,
      validQso: Boolean(call),
      qCountry,
      qCountryKey,
      qPrefixToken: String(qPrefixToken || '').toUpperCase(),
      qContinent,
      qCqZone,
      qItuZone,
      qIsEu: qContinent === 'EU',
      qIsNa: qContinent === 'NA',
      qIsNaqpNa: qContinent === 'NA' || hasCountryToken(qCountry, ['HAWAII']),
      qIsRu: isCountryRu(qCountry),
      qIsFrench: isCountryFrench(qCountry),
      qIsDl: isCountryDl(qCountry),
      qIsEa: isCountryEa(qCountry),
      qIsPaccDutch: isPaccDutch(qCountry, call),
      qIsAriDxItalian: isAriDxItalian(qCountry, call),
      qIsJa: isCountryJa(qCountry),
      qIsWVe: isCountryUsOrVe(qCountry),
      sameCountry,
      sameContinent,
      differentContinent: Boolean(station.stationContinent && qContinent && station.stationContinent !== qContinent),
      differentCqZone: qCqZone != null && station.stationCqZone != null && Number(qCqZone) !== Number(station.stationCqZone),
      differentItuZone: qItuZone != null && station.stationItuZone != null && Number(qItuZone) !== Number(station.stationItuZone),
      exchangeTokens,
      exchangeSentTokens,
      hasExchangeTokens: exchangeTokens.length > 0,
      exchangePrimary: exchangeTokens[0] || '',
      exchangeSentPrimary: exchangeSentTokens[0] || '',
      exchangeWVeQth: extractWVeQth(exchangeTokens),
      exchangeDok: extractDokToken(exchangeTokens),
      exchangeEuRegion,
      exchangeIota,
      qIsEuExchangeMember: Boolean(exchangeEuRegion),
      exchangeSerial: extractSerialToken(exchangeTokens),
      exchangeSentSerial: extractSerialToken(exchangeSentTokens),
      exchangeRefDepartment: extractRefDepartmentToken(exchangeTokens),
      exchangeRda: extractRdaToken(exchangeTokens),
      exchangeRccNumber: extractRccNumber(exchangeTokens),
      exchangeTeamCode: extractTeamCode(exchangeTokens),
      exchangeYear: extractYearToken(exchangeTokens),
      exchangeRegion: extractRegionToken(exchangeTokens),
      isIaruHqOrOfficial: Boolean(exchangeTokens[0]) && !/^\d+$/.test(exchangeTokens[0]),
      bandNorm,
      modeKey,
      bandModeKey,
      isQtc: Boolean(q?.isQtc),
      isSatellite: bandNorm === 'LIGHT' || normalizeMode(q?.mode).includes('SAT'),
      isMaritime: /\/MM/.test(call),
      qPortable: /\/P|\/M/.test(call),
      wpx: q?.wpxPrefix || wpxPrefix(call),
      samePrefix: Boolean(station.stationPrefixToken && qPrefixToken && station.stationPrefixToken === qPrefixToken),
      seenCount,
      isNewBandModeForCall: Boolean(call) && !seenBandModes.has(bandModeKey),
      isNewZoneOnBand: Boolean(zoneBandKey) && !runtime.zoneBandSeen.has(zoneBandKey),
      zoneBandKey,
      rfSubject,
      isNewRfSubject: Boolean(rfSubject) && !runtime.rfSubjectSeen.has(rfSubject),
      isRccMember: /RCC|RC\d{1,3}/.test(exchangeTokens.join(' ')),
      isRrtcTeam: /^[A-Z]{2}\d{1,2}$/.test(exchangeTokens[0] || '')
    };
  }

  function markScoringRuntime(facts, runtime) {
    if (!facts.call) return;
    runtime.callContacts.set(facts.call, facts.seenCount + 1);
    const set = runtime.callBandModes.get(facts.call) || new Set();
    set.add(facts.bandModeKey);
    runtime.callBandModes.set(facts.call, set);
    if (facts.zoneBandKey) runtime.zoneBandSeen.add(facts.zoneBandKey);
    if (facts.rfSubject) runtime.rfSubjectSeen.add(facts.rfSubject);
  }

  function evaluateScoringCondition(when, facts, runtime, assumptions) {
    const stationIsEuForExchangeRules = runtime.station.stationHasSentExchangeTokens
      ? runtime.station.stationIsEuExchangeMember
      : runtime.station.stationIsEu;
    const qIsEuForExchangeRules = facts.hasExchangeTokens ? facts.qIsEuExchangeMember : facts.qIsEu;
    switch (when) {
      case 'any_valid_qso':
      case 'valid_qso':
        return facts.validQso;
      case 'valid_qtc_sent_or_received':
        return facts.validQso && facts.isQtc;
      case 'same_country':
        return facts.sameCountry;
      case 'same_continent':
        return facts.sameContinent;
      case 'same_country_same_prefix':
        return facts.sameCountry && facts.samePrefix;
      case 'same_country_different_prefix_or_same_continent_different_country':
        return (facts.sameCountry && !facts.samePrefix) || (facts.sameContinent && !facts.sameCountry);
      case 'same_continent_different_country':
      case 'different_country_same_continent':
        return facts.sameContinent && !facts.sameCountry;
      case 'same_continent_different_itu_zone':
        return facts.sameContinent && !facts.sameCountry && facts.differentItuZone;
      case 'same_itu_zone':
        return facts.qItuZone != null && runtime.station.stationItuZone != null && !facts.differentItuZone;
      case 'same_continent_different_itu_zone_iaru':
        return facts.sameContinent && facts.differentItuZone;
      case 'different_continent_different_itu_zone':
        return facts.differentContinent && facts.differentItuZone;
      case 'iaru_hq_or_official_station':
        return facts.isIaruHqOrOfficial;
      case 'different_continent':
        return facts.differentContinent;
      case 'qso_with_europe':
        return facts.validQso && facts.qIsEu;
      case 'qso_outside_europe':
        return facts.validQso && !facts.qIsEu;
      case 'qso_cw_with_europe':
        return facts.validQso && facts.modeKey === 'CW' && facts.qIsEu;
      case 'qso_cw_outside_europe':
        return facts.validQso && facts.modeKey === 'CW' && !facts.qIsEu;
      case 'qso_ssb_with_europe':
        return facts.validQso && facts.modeKey === 'SSB' && facts.qIsEu;
      case 'qso_ssb_outside_europe':
        return facts.validQso && facts.modeKey === 'SSB' && !facts.qIsEu;
      case 'different_continent_and_zone':
        return facts.differentContinent && facts.differentCqZone;
      case 'non_eu_same_country':
        return !stationIsEuForExchangeRules && facts.sameCountry;
      case 'non_eu_other_country_same_continent':
        return !stationIsEuForExchangeRules && facts.sameContinent && !facts.sameCountry;
      case 'non_eu_other_continent':
        return !stationIsEuForExchangeRules && facts.differentContinent;
      case 'same_continent_non_member':
        return facts.sameContinent && !facts.sameCountry && !facts.isRccMember;
      case 'different_continent_non_member':
        return facts.differentContinent && !facts.isRccMember;
      case 'non_eu_to_eu':
        return !stationIsEuForExchangeRules && qIsEuForExchangeRules;
      case 'eu_to_eu_other_country':
      case 'eu_or_east_med_to_eu_or_east_med':
        return stationIsEuForExchangeRules && qIsEuForExchangeRules && !facts.sameCountry;
      case 'eu_to_own_country':
        return stationIsEuForExchangeRules && qIsEuForExchangeRules && facts.sameCountry;
      case 'eu_to_non_eu_same_continent':
        return stationIsEuForExchangeRules && !qIsEuForExchangeRules && facts.sameContinent;
      case 'eu_to_other_continent':
      case 'eu_or_east_med_to_other_continent':
        return stationIsEuForExchangeRules && facts.differentContinent;
      case 'ru_to_ru_same_continent':
        return runtime.station.stationIsRu && facts.qIsRu && facts.sameContinent;
      case 'ru_to_ru_other_continent':
        return runtime.station.stationIsRu && facts.qIsRu && facts.differentContinent;
      case 'ru_to_other_country_same_continent':
        return runtime.station.stationIsRu && !facts.qIsRu && facts.sameContinent;
      case 'ru_to_other_continent':
        return runtime.station.stationIsRu && facts.differentContinent;
      case 'non_ru_same_country':
        return !runtime.station.stationIsRu && facts.sameCountry;
      case 'non_ru_same_continent_other_country':
        return !runtime.station.stationIsRu && facts.sameContinent && !facts.sameCountry;
      case 'non_ru_other_continent':
        return !runtime.station.stationIsRu && facts.differentContinent;
      case 'non_ru_to_ru':
        return !runtime.station.stationIsRu && facts.qIsRu;
      case 'fixed_eu':
        return !runtime.station.stationPortable && runtime.station.stationIsEu;
      case 'fixed_outside_eu':
        return !runtime.station.stationPortable && !runtime.station.stationIsEu;
      case 'portable_eu':
        return runtime.station.stationPortable && runtime.station.stationIsEu;
      case 'portable_outside_eu':
        return runtime.station.stationPortable && !runtime.station.stationIsEu;
      case 'fixed_to_fixed':
        return !runtime.station.stationPortable && !facts.qPortable;
      case 'dl_station_working_dl':
        return runtime.station.stationIsDl && facts.qIsDl;
      case 'dl_station_working_europe_non_dl':
        return runtime.station.stationIsDl && facts.qIsEu && !facts.qIsDl;
      case 'dl_station_working_dx':
        return runtime.station.stationIsDl && !facts.qIsEu;
      case 'non_dl_station_any_valid_qso':
        return !runtime.station.stationIsDl && facts.validQso;
      case 'french_station_to_foreign_same_continent':
        return runtime.station.stationIsFrench && !facts.qIsFrench && facts.sameContinent;
      case 'french_station_to_foreign_other_continent':
        return runtime.station.stationIsFrench && !facts.qIsFrench && facts.differentContinent;
      case 'french_station_to_french_same_continent':
        return runtime.station.stationIsFrench && facts.qIsFrench && facts.sameContinent;
      case 'french_station_to_french_other_continent':
        return runtime.station.stationIsFrench && facts.qIsFrench && facts.differentContinent;
      case 'non_french_station_to_french_same_continent':
        return !runtime.station.stationIsFrench && facts.qIsFrench && facts.sameContinent;
      case 'non_french_station_to_french_other_continent':
        return !runtime.station.stationIsFrench && facts.qIsFrench && facts.differentContinent;
      case 'same_p150_country':
        return facts.sameCountry;
      case 'with_rcc_member_station':
        return facts.isRccMember;
      case 'with_rrtc_team_station':
        return facts.isRrtcTeam;
      case 'with_non_team_same_itu_zone':
        return !facts.isRrtcTeam && !facts.differentItuZone;
      case 'with_non_team_different_itu_zone':
        return !facts.isRrtcTeam && facts.differentItuZone;
      case 'special_station_ok5o':
        return facts.call === 'OK5O';
      case 'iss_rs0iss':
        return facts.call === 'RS0ISS';
      case 'maritime_mobile':
        return facts.isMaritime;
      case 'satellite_qso':
        return facts.isSatellite;
      case 'first_contact_with_callsign':
        return facts.seenCount === 0;
      case 'second_contact_with_callsign_new_band_or_mode':
        return facts.seenCount === 1 && facts.isNewBandModeForCall;
      case 'third_contact_with_callsign_new_band_or_mode':
        return facts.seenCount === 2 && facts.isNewBandModeForCall;
      case 'new_zone_on_band':
        return facts.isNewZoneOnBand;
      case 'new_rf_subject_once_contest':
        return facts.isNewRfSubject;
      case 'other_pairs':
        return facts.validQso;
      default:
        if (!runtime.unknownWhen.has(when)) {
          runtime.unknownWhen.add(when);
          assumptions.add(`Unhandled scoring condition: ${when}`);
        }
        return false;
    }
  }

  function pointsFromConditionRules(rules, facts, runtime, assumptions) {
    if (!Array.isArray(rules)) return null;
    for (const row of rules) {
      const points = Number(row?.points);
      if (!Number.isFinite(points)) continue;
      if (!evaluateScoringCondition(String(row?.when || ''), facts, runtime, assumptions)) continue;
      return points;
    }
    return null;
  }

  function resolveScoringDuplicatePolicy(rule) {
    const key = String(firstNonNull(rule?.duplicate_policy, rule?.qso_points?.duplicate_policy) || '').trim().toLowerCase();
    if (key === 'include_all_dupes' || key === 'include_dupes') return 'include_all_dupes';
    if (key === 'call_per_band_exact_mode_15min') return 'call_per_band_exact_mode_15min';
    if (key === 'call_per_band_exact_mode_3min') return 'call_per_band_exact_mode_3min';
    if (key === 'call_per_band_sent_received_grid_2hours') return 'call_per_band_sent_received_grid_2hours';
    if (key === 'call_per_band_mode_group_hour') return 'call_per_band_mode_group_hour';
    if (key === 'call_per_band') return 'call_per_band';
    if (key === 'call_per_band_mode_group') return 'call_per_band_mode_group';
    if (key === 'call_per_band_mode_group_per_received_qth') return 'call_per_band_mode_group_per_received_qth';
    if (key === 'call_per_band_category_mode') return 'call_per_band_category_mode';
    if (key === 'call_per_band_per_sent_grid') return 'call_per_band_per_sent_grid';
    if (key === 'call_per_band_analog_digital_session_per_received_grid') return 'call_per_band_analog_digital_session_per_received_grid';
    if (key === 'call_per_session') return 'call_per_session';
    if (key === 'call_per_mode_session') return 'call_per_mode_session';
    if (key === 'call_per_band_mode_group_3hours') return 'call_per_band_mode_group_3hours';
    if (key === 'call_per_band_ukr_champ_round') return 'call_per_band_ukr_champ_round';
    if (key === 'naval_member_once_nonmember_include') return 'naval_member_once_nonmember_include';
    return 'exclude_all_dupes';
  }

  function firstGrid4Token(values) {
    for (const value of (values || [])) {
      const match = String(value || '').toUpperCase().match(/[A-R]{2}\d{2}/);
      if (match) return match[0];
    }
    return '';
  }

  function firstGrid6Token(values) {
    for (const value of (values || [])) {
      const match = String(value || '').toUpperCase().match(/[A-R]{2}\d{2}[A-X]{2}/);
      if (match) return match[0];
    }
    return '';
  }

  function receivedGrid4(facts) {
    return firstGrid4Token([facts?.q?.grid, ...(facts?.exchangeTokens || [])]);
  }

  function sentGrid4(facts) {
    return firstGrid4Token([
      facts?.q?.myGrid,
      facts?.q?.raw?.MY_GRIDSQUARE,
      ...(facts?.exchangeSentTokens || [])
    ]);
  }

  function avhfcLocator(values) {
    for (const value of (values || [])) {
      const first = String(value || '').split(',')[0].trim().toUpperCase();
      const match = first.match(/^[A-R]{2}\d{2}(?:[A-X]{2})?/);
      if (!match) continue;
      const locator = match[0];
      return locator.length === 4 ? `${locator}55AA` : locator.slice(0, 6);
    }
    return '';
  }

  const CIS_QPSK63_PREFIX_FRAGMENTS = [
    'RI1AN', '4J', '4K', 'EK', 'ER', 'EV', 'EU', 'EW', 'EX', 'EY', 'EZ',
    'UK', 'UJ', 'UL', 'UM', 'UN', 'UO', 'UP', 'UQ', 'EM', 'EN', 'EO', 'U', 'R'
  ];
  const KCJ_PREFECTURE_CODES = new Set([
    'AC', 'AM', 'AT', 'CB', 'EH', 'FI', 'FO', 'FS', 'GF', 'GM', 'HD', 'HG', 'HS', 'HY', 'IB', 'IK',
    'IR', 'IS', 'IT', 'KA', 'KC', 'KG', 'KK', 'KM', 'KN', 'KR', 'KT', 'ME', 'MG', 'MT', 'MZ', 'NI',
    'NM', 'NN', 'NR', 'NS', 'OG', 'OH', 'OM', 'ON', 'OS', 'OT', 'OY', 'RM', 'SB', 'SC', 'SG', 'SI',
    'SN', 'SO', 'ST', 'SY', 'TC', 'TG', 'TK', 'TS', 'TT', 'TY', 'WK', 'YG', 'YM', 'YN'
  ]);
  const LZ_DX_DISTRICTS = new Set('BU BL VN VT VD VR GA DO KA KD LV MN PA PK PL PD RZ RS SS SL SM SF SO SZ TA HA SN YA'.split(' '));
  const PORTUGAL_DAY_AREAS = new Set('AV BJ BR BG CB CO EV FR GD LR LX PG PT SR ST VC VR VS CAL CMB FU MC PS PM PTS RB SCM STM SV AH CA SCG VL PV CV HT LJF LJP MD SCF SRP LG ND PD PO RG FC VP'.split(' '));
  const SAC_SCANDINAVIAN_COUNTRIES = new Set(['ALAND ISLANDS', 'DENMARK', 'FAROE ISLANDS', 'FINLAND', 'GREENLAND', 'ICELAND', 'JAN MAYEN', 'MARKET REEF', 'NORWAY', 'SVALBARD', 'SWEDEN']);

  function sacIsScandinavian(call, countryKey) {
    if (SAC_SCANDINAVIAN_COUNTRIES.has(String(countryKey || ''))) return true;
    return /^(?:5P|5Q|7S|8S|JW|JX|L[A-N]|O[F-I]|OJ0|O[U-Y]|S[A-M]|TF)/.test(String(call || '').toUpperCase().replace(/^[^A-Z0-9]+/, ''));
  }

  function sacScandinavianArea(call, countryKey) {
    if (!sacIsScandinavian(call, countryKey)) return '';
    const parts = String(call || '').toUpperCase().split('/').filter(Boolean);
    const prefixPart = parts.find((part) => /^(?:5P|5Q|7S|8S|JW|JX|L[A-N]|O[F-I]|OJ|O[U-Y]|S[A-M]|TF)/.test(part)) || '';
    const suffix = prefixPart.match(/^(?:5P|5Q|7S|8S|JW|JX|L[A-N]|O[F-I]|OJ|O[U-Y]|S[A-M]|TF)(.*)$/)?.[1] || '';
    const digit = suffix.match(/\d/)?.[0] || '0';
    return `${String(countryKey || prefixPart.replace(/\d.*$/, '') || 'SCANDINAVIA')}|${digit}`;
  }

  function sarlHfArea(call) {
    const value = String(call || '').toUpperCase();
    const zs = value.match(/(?:^|\/)(?:ZS|ZR|ZU)([1-6])/)?.[1];
    if (zs) return zs;
    if (/^(?:V5)/.test(value)) return '7';
    if (/^(?:3DA|7P|7Q|9J|C9|A2|D2|Z2|ZD7|ZD9|ZS7|ZS8|FR|3B8|5R|FH|D6)/.test(value)) return '8';
    return '9';
  }

  function sarlVhfCountryEligible(call, countryKey) {
    if (/^(?:ZS|ZR|ZU|V5|A2|Z2|C9|7P|3DA)/.test(String(call || '').toUpperCase())) return true;
    return ['SOUTH AFRICA', 'NAMIBIA', 'BOTSWANA', 'ZIMBABWE', 'MOZAMBIQUE', 'LESOTHO', 'ESWATINI', 'SWAZILAND'].includes(String(countryKey || ''));
  }

  function sarlExchangeAge(tokens) {
    const token = (tokens || []).find((value) => /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 120 && !['59', '599'].includes(value));
    return token ? Number(token) : NaN;
  }

  function sartgCallArea(call, countryKey) {
    const normalized = String(call || '').toUpperCase();
    let prefix = '';
    if (countryKey === 'JAPAN' || /^J[A-S]/.test(normalized)) prefix = 'JA';
    else if (countryKey === 'CANADA' || /^(?:V[A-GO-Y])/.test(normalized)) prefix = 'VE';
    else if (countryKey === 'AUSTRALIA' || /^VK/.test(normalized)) prefix = 'VK';
    else if (['UNITED STATES', 'ALASKA', 'HAWAII'].includes(countryKey) || /^(?:[AKNW])/.test(normalized)) prefix = 'W';
    if (!prefix) return '';
    const digit = normalized.match(/\/([0-9])$/)?.[1] || normalized.match(/\d(?=[^\d]*$)/)?.[0] || '';
    return digit ? `${prefix}${digit}` : '';
  }

  function voltaCallArea(call, countryKey) {
    const normalized = String(call || '').toUpperCase();
    let prefix = '';
    if (countryKey === 'JAPAN' || /^J[A-S]/.test(normalized)) prefix = 'JA';
    else if (countryKey === 'CANADA' || /^(?:V[A-GO-Y])/.test(normalized)) prefix = 'VE';
    else if (countryKey === 'AUSTRALIA' || /^VK/.test(normalized)) prefix = 'VK';
    else if (countryKey === 'NEW ZEALAND' || /^ZL/.test(normalized)) prefix = 'ZL';
    else if (['UNITED STATES', 'ALASKA', 'HAWAII'].includes(countryKey) || /^(?:[AKNW])/.test(normalized)) prefix = 'W';
    if (!prefix) return '';
    const digit = normalized.match(/\/([0-9])$/)?.[1] || normalized.match(/\d(?=[^\d]*$)/)?.[0] || '';
    return digit ? `${prefix}${digit}` : '';
  }

  function voltaExchangeNumbers(tokens) {
    const values = (tokens || [])
      .filter((token) => /^\d+$/.test(String(token || '')) && !['59', '599'].includes(String(token)))
      .map(Number);
    const zone = values.at(-1);
    const serial = values.at(-2);
    return {
      zone: Number.isFinite(zone) && zone >= 1 && zone <= 40 ? zone : NaN,
      serial: Number.isFinite(serial) && serial > 0 ? serial : NaN
    };
  }

  function isRecoveredCisQpsk63Call(call, prefix) {
    const normalized = String(call || '').trim().toUpperCase();
    if (normalized.slice(0, 4) === 'R1AN' || normalized.includes('RI1AN')) return false;
    const prefix2 = String(prefix || wpxPrefix(normalized)).slice(0, 2);
    return !!prefix2 && CIS_QPSK63_PREFIX_FRAGMENTS.some((candidate) => prefix2.includes(candidate));
  }

  function isRecoveredCisMobile(call) {
    return /\/(?:M|MM)$/i.test(String(call || '').trim());
  }

  function cqMRussianTerritory(call, countryKey) {
    const normalized = String(call || '').trim().toUpperCase();
    const parts = normalized.match(/([0-9])([A-Z])/);
    if (!parts || !/(?:RUSSIA|KALININGRAD)/.test(String(countryKey || ''))) return String(countryKey || '');
    const digit = parts[1];
    const suffix = parts[2];
    if (digit === '1' && suffix === 'N') return 'R150:R1N';
    if (digit === '5' && ['S', 'P', 'U', 'W', 'Y'].includes(suffix)) return `R150:R4${suffix}`;
    if (['6', '7'].includes(digit)) {
      const map = { Z: 'R9Z', I: 'R6I', E: 'R6E', P: 'R6P', Q: 'R6Q', W: 'R6W', Y: 'R6Y' };
      if (map[suffix]) return `R150:${map[suffix]}`;
    }
    if (['8', '9'].includes(digit)) {
      const map = { W: 'R9W', X: 'R9X', M: 'R9Z' };
      if (map[suffix]) return `R150:${map[suffix]}`;
    }
    if (digit === '0' && ['O', 'Q', 'W', 'Y'].includes(suffix)) return `R150:R0${suffix}`;
    return String(countryKey || '');
  }

  function digQsoPartySchedule(q) {
    const ts = Number(q?.ts);
    if (!Number.isFinite(ts)) return { eligible: false, missingTimestamp: true };
    const date = new Date(ts);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDay();
    const dayOfMonth = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const frequency = Number(q?.freq);
    const rawMode = String(q?.mode || '').toUpperCase();
    const phone = ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
    const cw = rawMode === 'CW';
    const isSecondSaturday = day === 6 && dayOfMonth >= 8 && dayOfMonth <= 14;
    const isSecondSunday = day === 0 && dayOfMonth >= 9 && dayOfMonth <= 15;
    const highSegments = month === 3
      ? [[14.125, 14.3], [21.151, 21.45], [28.32, 28.7]]
      : [[14, 14.06], [21, 21.07], [28, 28.07]];
    const lowSegments = month === 3
      ? (hour >= 7 && hour < 9 ? [[3.6, 3.65], [3.7, 3.8]] : [[7.06, 7.1], [7.13, 7.2]])
      : (hour >= 7 && hour < 9 ? [[3.51, 3.56]] : [[7, 7.04]]);
    const modeEligible = month === 3 ? phone : month === 4 && cw;
    const segments = isSecondSaturday && hour >= 12 && hour < 17
      ? highSegments
      : isSecondSunday && hour >= 7 && hour < 11
        ? lowSegments : [];
    return {
      eligible: modeEligible && Number.isFinite(frequency)
        && segments.some((range) => frequency >= range[0] && frequency <= range[1]),
      missingTimestamp: false
    };
  }

  function isScoringDuplicate(duplicatePolicy, q, facts, runtime) {
    if (duplicatePolicy === 'include_all_dupes') return false;
    if (duplicatePolicy === 'call_per_band_sent_received_grid_2hours') {
      const key = `${facts.bandNorm || 'UNKNOWN'}|${sentGrid4(facts) || 'UNKNOWN'}|${receivedGrid4(facts) || 'UNKNOWN'}|${facts.call}`;
      const ts = Number(q?.ts);
      if (!runtime.scoringDuplicateLastTimestamp) runtime.scoringDuplicateLastTimestamp = new Map();
      const previous = runtime.scoringDuplicateLastTimestamp.get(key);
      const duplicate = Number.isFinite(previous) && (!Number.isFinite(ts) || ts - previous < 2 * 60 * 60 * 1000);
      if (facts.call && !duplicate && Number.isFinite(ts)) runtime.scoringDuplicateLastTimestamp.set(key, ts);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_band_exact_mode_3min') {
      const exactMode = String(q?.submode || q?.raw?.SUBMODE || q?.mode || '').trim().toUpperCase() || facts.modeKey;
      const key = `${facts.bandNorm || 'UNKNOWN'}|${exactMode}|${facts.call}`;
      const ts = Number(q?.ts);
      if (!runtime.scoringDuplicateLastTimestamp) runtime.scoringDuplicateLastTimestamp = new Map();
      const previousCallTs = runtime.scoringDuplicateLastTimestamp.get(facts.call);
      const repeatedCombination = runtime.scoringDuplicateSeen.has(key);
      const tooSoon = Number.isFinite(ts) && Number.isFinite(previousCallTs) && ts - previousCallTs < 3 * 60 * 1000;
      const duplicate = repeatedCombination || tooSoon;
      if (facts.call && !duplicate) {
        runtime.scoringDuplicateSeen.add(key);
        if (Number.isFinite(ts)) runtime.scoringDuplicateLastTimestamp.set(facts.call, ts);
      }
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_band_ukr_champ_round') {
      const ts = Number(q?.ts);
      const round = Number.isFinite(ts) ? Math.floor((ts - Date.UTC(2026, 2, 7, 17)) / (30 * 60 * 1000)) : `ROW-${q?.qsoNumber || ''}`;
      const key = `${round}|${facts.bandNorm || 'UNKNOWN'}|${facts.call}`;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_band_exact_mode_15min') {
      const ts = Number(q?.ts);
      const period = Number.isFinite(ts) ? Math.floor(ts / (15 * 60 * 1000)) : `ROW-${q?.qsoNumber || ''}`;
      const exactMode = String(q?.mode || '').trim().toUpperCase() || facts.modeKey;
      const key = `${facts.bandNorm || 'UNKNOWN'}|${exactMode}|${period}|${facts.call}`;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_band_mode_group_hour') {
      const ts = Number(q?.ts);
      const period = Number.isFinite(ts) ? Math.floor(ts / (60 * 60 * 1000)) : `ROW-${q?.qsoNumber || ''}`;
      const key = `${facts.bandNorm || 'UNKNOWN'}|${facts.modeKey}|${period}|${facts.call}`;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_band_analog_digital_session_per_received_grid') {
      const ts = Number(q?.ts);
      const session = Number.isFinite(ts) && ts >= Date.UTC(2026, 0, 10, 14) ? 'S2' : 'S1';
      const rawMode = String(q?.mode || '').toUpperCase();
      const modeGroup = MODE_DIGITAL.has(rawMode) || rawMode === 'RY' ? 'DIGITAL' : 'ANALOG';
      const gridIdentity = /\/R$/.test(facts.call) ? (receivedGrid4(facts) || 'UNKNOWN') : 'FIXED';
      const key = `${session}|${facts.bandNorm || 'UNKNOWN'}|${modeGroup}|${gridIdentity}|${facts.call}`;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_session') {
      const ts = Number(q?.ts);
      const session = Number.isFinite(ts) && ts >= Date.UTC(2026, 2, 22, 2) ? 'S2' : 'S1';
      const key = `${session}|${facts.call}`;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_mode_session') {
      const ts = Number(q?.ts);
      const session = Number.isFinite(ts) && ts >= Date.UTC(2025, 11, 19, 19) ? 'S2' : 'S1';
      const key = `${session}|${facts.modeKey}|${facts.call}`;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (duplicatePolicy === 'call_per_band_mode_group_3hours') {
      const groupedMode = facts.modeKey === 'CW' || facts.modeKey === 'DIG' ? 'CW' : 'PHONE';
      const key = `${facts.bandNorm || 'UNKNOWN'}|${groupedMode}|${facts.call}`;
      const ts = Number(q?.ts);
      const previous = runtime.scoringDuplicateLastTimestamp?.get(key);
      const duplicate = Number.isFinite(ts) && Number.isFinite(previous) && ts - previous < 3 * 60 * 60 * 1000;
      if (!runtime.scoringDuplicateLastTimestamp) runtime.scoringDuplicateLastTimestamp = new Map();
      if (facts.call && Number.isFinite(ts) && !duplicate) runtime.scoringDuplicateLastTimestamp.set(key, ts);
      return duplicate;
    }
    if (duplicatePolicy === 'naval_member_once_nonmember_include') {
      const navalExchange = facts.exchangeTokens.find((token) => /^(?:CA|FN|IN|MA|MF|MI|RN|YO|PN|GR)\d+$/i.test(token));
      if (!navalExchange) return false;
      const key = facts.call;
      const duplicate = runtime.scoringDuplicateSeen.has(key);
      if (facts.call) runtime.scoringDuplicateSeen.add(key);
      return duplicate;
    }
    if (!['call_per_band', 'call_per_band_mode_group', 'call_per_band_mode_group_per_received_qth', 'call_per_band_category_mode', 'call_per_band_per_sent_grid'].includes(duplicatePolicy)) return Boolean(q?.isDupe);
    const identity = duplicatePolicy === 'call_per_band_per_sent_grid'
      ? (sentGrid4(facts) || 'FIXED')
      : duplicatePolicy === 'call_per_band_mode_group_per_received_qth'
        ? `${facts.modeKey}|${cqpExchangeQths(facts.exchangeTokens).join('+') || 'UNKNOWN'}`
        : duplicatePolicy === 'call_per_band_mode_group'
        ? facts.modeKey
        : duplicatePolicy === 'call_per_band_category_mode' && /MIX/.test(runtime.station.stationCategoryMode || '')
          ? facts.modeKey : '';
    const key = `${facts.bandNorm || 'UNKNOWN'}|${identity}|${facts.call}`;
    const duplicate = runtime.scoringDuplicateSeen.has(key);
    if (facts.call) runtime.scoringDuplicateSeen.add(key);
    return duplicate;
  }

  function resolveMultiplierCreditPolicy(rule) {
    if (rule?.multipliers?.credit_on_zero_point_valid_qso === true) return 'valid_qso_allow_zero_points';
    const key = String(rule?.multipliers?.credit_policy || '').trim().toLowerCase();
    if (key === 'valid_qso_allow_zero_points' || key === 'valid_qso_zero_points' || key === 'valid_qso_allow_zero_point') {
      return 'valid_qso_allow_zero_points';
    }
    if (key === 'valid_qso_allow_duplicates') return 'valid_qso_allow_duplicates';
    return 'positive_points_non_dupe';
  }

  function resolveQsoPointValue(qsoPointsRule, facts, station, assumptions) {
    if (!qsoPointsRule) return Number.isFinite(facts.q?.points) ? facts.q.points : 0;
    if (typeof qsoPointsRule === 'number') return qsoPointsRule;
    if (Number.isFinite(Number(qsoPointsRule?.fixed))) return Number(qsoPointsRule.fixed);

    const matrices = Array.isArray(qsoPointsRule?.matrix) ? qsoPointsRule.matrix : [];
    for (const entry of matrices) {
      const when = Array.isArray(entry?.when) ? entry.when : [entry?.when];
      const passes = when.filter(Boolean).every((cond) => evaluateScoringCondition(cond, facts, { station }, assumptions));
      if (!passes) continue;
      const value = Number(entry?.points);
      if (Number.isFinite(value)) return value;
    }

    const byContinent = qsoPointsRule?.by_continent;
    if (byContinent && typeof byContinent === 'object') {
      const key = facts.qContinent || '';
      const value = Number(byContinent[key] ?? byContinent.default);
      if (Number.isFinite(value)) return value;
    }
    return Number.isFinite(facts.q?.points) ? facts.q.points : 0;
  }

  function computeRuleQsoPoints(rule, qsos, station, assumptions) {
    const runtime = makeScoringRuntime(station);
    runtime.ruleId = String(rule?.id || '');
    const model = String(rule?.qso_points?.model || '').trim();
    const duplicatePolicy = resolveScoringDuplicatePolicy(rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const duplicateByIndex = new Array((qsos || []).length).fill(false);
    const uniqueCalls = new Set();
    let qsoPointsTotal = 0;
    let weightedQsoPointsTotal = 0;
    let qsoCount = 0;
    let positiveQsoCount = 0;
    let qtcCount = 0;
    let matrixBasePoints = 0;
    let newZoneBonus = 0;
    let newRegionBonus = 0;
    let avhfcDistanceBonus = 0;
    let ubaBelgianQsoCount = 0;
    let ubaBelgianQsoPoints = 0;
    let ubaValidQsoCount = 0;
    const sarlHfBandsByCall = new Map();
    const modePoints = { CW: 0, SSB: 0, DIG: 0 };
    const bandPoints = {};
    const bandQsoCounts = {};
    const scoringTimeEligibleByIndex = new Array((qsos || []).length).fill(true);
    const scoringTimePolicy = String(rule?.qso_points?.scoring_time_policy || '');
    const appliesThirtyMinutePolicy = scoringTimePolicy === 'first_24_operating_hours_with_30_minute_breaks';
    const appliesSingleOpSixtyMinutePolicy = scoringTimePolicy === 'single_op_first_24_operating_hours_with_60_minute_breaks'
      && !station.stationIsMultiOperator;
    const appliesSingleOpNaqpPolicy = scoringTimePolicy === 'single_op_first_10_operating_hours_with_31_minute_qso_gaps'
      && !station.stationIsMultiOperator;
    const appliesSingleOpCqpPolicy = scoringTimePolicy === 'single_op_first_24_operating_hours_with_15_minute_breaks'
      && !station.stationIsMultiOperator;
    if (appliesThirtyMinutePolicy || appliesSingleOpSixtyMinutePolicy || appliesSingleOpNaqpPolicy || appliesSingleOpCqpPolicy) {
      scoringTimeEligibleByIndex.fill(false);
      const timed = (qsos || []).map((q, idx) => ({ idx, ts: Number(q?.ts) }))
        .filter((item) => Number.isFinite(item.ts))
        .sort((a, b) => a.ts - b.ts || a.idx - b.idx);
      let accumulatedOperatingMs = 0;
      let previousTs = null;
      const qualifyingBreakMs = appliesSingleOpSixtyMinutePolicy
        ? 60 * 60 * 1000
        : appliesSingleOpNaqpPolicy ? 31 * 60 * 1000 : appliesSingleOpCqpPolicy ? 15 * 60 * 1000 : 30 * 60 * 1000;
      const operatingLimitMs = appliesSingleOpNaqpPolicy ? 10 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      timed.forEach((item) => {
        if (previousTs != null) {
          const gap = Math.max(0, item.ts - previousTs);
          if (gap < qualifyingBreakMs) accumulatedOperatingMs += gap;
        }
        scoringTimeEligibleByIndex[item.idx] = accumulatedOperatingMs <= operatingLimitMs;
        previousTs = item.ts;
      });
      if (timed.length !== (qsos || []).length) {
        assumptions.add('Missing QSO timestamp for an operating-time-limited contest; the affected QSO scored zero rather than guessing its eligibility.');
      }
    }
    const handledTableModels = new Set([
      'table_by_geography',
      'table_by_portable_status_and_geography',
      'table_by_station_region',
      'table_by_station_region_and_geography',
      'table_by_eu_membership_and_geography',
      'table_by_region_pairing',
      'table_by_country_prefix_continent',
      'table_by_ru_status_and_geography',
      'table_by_ru_non_ru',
      'table_by_station_type_and_itu_relation',
      'table_with_member_bonus'
    ]);
    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      const isDuplicate = isScoringDuplicate(duplicatePolicy, q, facts, runtime);
      duplicateByIndex[idx] = isDuplicate;
      if (facts.call && (!isDuplicate || scoreDuplicates)) uniqueCalls.add(facts.call);
      if (isDuplicate && !scoreDuplicates) {
        pointsByIndex[idx] = 0;
        return;
      }
      let points = null;
      if (facts.isQtc && model !== 'qso_and_qtc_units') {
        points = 0;
      } else if (handledTableModels.has(model)) {
        points = pointsFromConditionRules(rule?.qso_points?.rules, facts, runtime, assumptions);
      } else if (model === 'table_by_geography_and_band_group') {
        const groups = rule?.qso_points?.band_groups || {};
        const isLowBand = ['160M', '80M', '40M'].includes(facts.bandNorm);
        const low = groups.low_bands_40_80_160 || groups.low_bands_40_80 || null;
        const high = groups.high_bands_10_15_20 || null;
        const table = isLowBand ? low : high;
        if (table) {
          if (facts.differentContinent) points = Number(table.different_continent);
          else if (facts.sameCountry) points = Number(table.same_country);
          else if (facts.sameContinent) {
            if (facts.qIsNa && station.stationIsNa && Number.isFinite(Number(table.na_intra_continent_exception))) {
              points = Number(table.na_intra_continent_exception);
            } else {
              points = Number(table.same_continent_different_country);
            }
          }
        }
      } else if (model === 'table_by_band_group') {
        const groups = rule?.qso_points?.band_groups || {};
        if (['160M', '80M', '40M'].includes(facts.bandNorm)) points = Number(groups['160_80_40']);
        else points = Number(groups['20_15_10']);
      } else if (model === 'table_by_band') {
        const bandPoints = rule?.qso_points?.band_points || {};
        points = Number(bandPoints[facts.bandNorm] ?? bandPoints[String(facts.bandNorm || '').toLowerCase()] ?? 0);
      } else if (model === 'distance_3000km_steps') {
        const eligibleBands = new Set((rule?.qso_points?.eligible_bands || []).map((band) => String(band).toUpperCase()));
        const eligibleModes = new Set((rule?.qso_points?.eligible_modes || []).map((mode) => String(mode).toUpperCase()));
        const mode = String(q?.mode || '').toUpperCase();
        const distance = Number(q?.distance);
        if ((eligibleBands.size && !eligibleBands.has(facts.bandNorm)) || (eligibleModes.size && !eligibleModes.has(mode))) {
          points = 0;
        } else if (Number.isFinite(distance) && distance >= 0) {
          points = 1 + Math.floor(Math.ceil(distance) / 3000);
        } else if (!receivedGrid4(facts) && Number.isFinite(Number(rule?.qso_points?.missing_grid_base_points))) {
          points = Number(rule.qso_points.missing_grid_base_points);
        } else {
          points = 0;
          assumptions.add('Missing locator distance for a WW Digi QSO; scored zero rather than guessing.');
        }
      } else if (model === 'aadx_2025') {
        const eligibleBands = new Set(['160M', '80M', '40M', '20M', '15M', '10M']);
        const bandFactor = facts.bandNorm === '160M' ? 3 : (facts.bandNorm === '80M' || facts.bandNorm === '10M' ? 2 : 1);
        const stationIsAsia = station.stationContinent === 'AS';
        const workedIsAsia = facts.qContinent === 'AS';
        const stationIsMaritime = /\/MM$/.test(station.stationCall || '');
        if (!eligibleBands.has(facts.bandNorm) || facts.sameCountry) points = 0;
        else if (stationIsMaritime) points = workedIsAsia ? bandFactor : 0;
        else if (stationIsAsia) points = (workedIsAsia || facts.isMaritime) ? bandFactor : bandFactor * 3;
        else points = (workedIsAsia || facts.isMaritime) ? bandFactor : 0;
      } else if (model === 'ea_rtty_2026') {
        if (!facts.validQso) points = 0;
        else if (station.stationIsEa) points = facts.qIsEa ? 2 : 1;
        else points = facts.qIsEa ? 3 : 1;
      } else if (model === 'jidx_2025') {
        const bandPoints = { '160M': 4, '80M': 2, '40M': 1, '20M': 1, '15M': 1, '10M': 2 };
        const exchange = Number.parseInt(facts.exchangePrimary, 10);
        const stationEligible = station.stationIsJa
          ? (!facts.qIsJa || facts.isMaritime)
          : facts.qIsJa;
        const exchangeValid = station.stationIsJa
          ? Number.isFinite(exchange) && exchange >= 1 && exchange <= 40
          : Number.isFinite(exchange) && exchange >= 1 && exchange <= 50;
        points = stationEligible && exchangeValid ? Number(bandPoints[facts.bandNorm] || 0) : 0;
      } else if (model === 'oceania_dx_2026') {
        const bandPoints = { '160M': 20, '80M': 10, '40M': 5, '20M': 1, '15M': 2, '10M': 3 };
        const eligible = station.stationIsOceania || facts.qContinent === 'OC';
        points = eligible ? Number(bandPoints[facts.bandNorm] || 0) : 0;
      } else if (model === 'gacw_wwsa_recovered') {
        if (!facts.qCountryKey || !station.stationCountryKey) points = 0;
        else if (facts.qCountryKey === station.stationCountryKey) points = 0;
        else if (facts.qContinent === station.stationContinent) points = 1;
        else points = facts.qContinent === 'SA' ? 5 : 3;
      } else if (model === 'ha_dx_2026') {
        const mobile = /\/(?:AM|MM)$/.test(facts.call || '');
        const workedHungarian = facts.qCountryKey === 'HUNGARY' || /^(?:HA|HG)/.test(facts.call || '');
        if (!facts.hasExchangeTokens) points = 0;
        else if (mobile) points = 2;
        else if (workedHungarian) points = 10;
        else points = facts.sameContinent ? 2 : (facts.differentContinent ? 5 : 0);
      } else if (model === 'helvetia_2026') {
        const workedSwiss = facts.qCountryKey === 'SWITZERLAND';
        const cantons = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const validExchange = workedSwiss ? cantons.has(exchange) : /^\d{3,}$/.test(exchange);
        if (!validExchange) points = 0;
        else if (workedSwiss) points = 10;
        else points = facts.sameContinent ? 1 : (facts.differentContinent ? 3 : 0);
      } else if (model === 'holyland_2025') {
        const stationIsraeli = station.stationCountryKey === 'ISRAEL' || /^(?:4X|4Z)/.test(station.stationCall || '');
        const workedIsraeli = facts.qCountryKey === 'ISRAEL' || /^(?:4X|4Z)/.test(facts.call || '');
        const maritime = /\/MM$/.test(facts.call || '');
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const validExchange = workedIsraeli ? /^[A-Z]\d{2}[A-Z]{2}$/.test(exchange) : /^\d{3,}$/.test(exchange);
        if (!validExchange) points = 0;
        else if (maritime) points = 4;
        else if (stationIsraeli) points = workedIsraeli ? 1 : (facts.qContinent === 'AS' ? 2 : 8);
        else if (workedIsraeli) points = 8;
        else if (facts.sameCountry) points = 1;
        else points = facts.sameContinent ? 2 : (facts.differentContinent ? 4 : 0);
      } else if (model === 'naqp_2026') {
        const tokens = facts.exchangeTokens;
        const qth = String(tokens.at(-1) || '').toUpperCase();
        const usEntity = ['UNITED STATES', 'ALASKA', 'HAWAII'].includes(facts.qCountryKey);
        const canadianEntity = facts.qCountryKey === 'CANADA';
        const validLocation = usEntity
          ? US_STATE_CODES.has(qth)
          : canadianEntity ? VE_AREA_CODES.has(qth) : Boolean(qth);
        const validExchange = facts.qIsNaqpNa ? tokens.length >= 2 && validLocation : tokens.length >= 1;
        const powerEligible = !/(?:HIGH|HP)/.test(station.stationCategoryPower || '');
        let bandLockEligible = true;
        if (station.stationIsMultiOperator) {
          const txId = String(q?.raw?.TX_ID ?? '');
          if (!txId) {
            assumptions.add('NAQP M2 QSO lacks Cabrillo transmitter ID; the 10-minute band lock could not be verified for that QSO.');
          } else {
            runtime.naqpTxBands ||= new Map();
            const prior = runtime.naqpTxBands.get(txId);
            const ts = Number(q?.ts);
            if (!prior || prior.band === facts.bandNorm) {
              if (!prior) runtime.naqpTxBands.set(txId, { band: facts.bandNorm, since: ts });
            } else if (Number.isFinite(ts) && Number.isFinite(prior.since) && ts - prior.since >= 10 * 60 * 1000) {
              runtime.naqpTxBands.set(txId, { band: facts.bandNorm, since: ts });
            } else {
              bandLockEligible = false;
            }
          }
        }
        points = powerEligible && bandLockEligible && validExchange && (station.stationIsNaqpNa || facts.qIsNaqpNa) ? 1 : 0;
      } else if (model === 'rac_canada_2026') {
        const official = new Set(['VA2RAC', 'VA3RAC', 'VE1RAC', 'VE3RHQ', 'VE4RAC', 'VE5RAC', 'VE6RAC', 'VE7RAC', 'VE8RAC', 'VE9RAC', 'VO1RAC', 'VO2RAC', 'VY0RAC', 'VY1RAC', 'VY2RAC']);
        const call = facts.call || '';
        const canadian = facts.qCountryKey === 'CANADA' || /^(?:VA|VE|VO|VY)/.test(call);
        const ve0 = /^VE0/.test(call);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const validExchange = canadian && !ve0 ? VE_AREA_CODES.has(exchange) : /^\d+$/.test(exchange);
        let operationallyEligible = true;
        const isMost = station.stationIsMultiOperator && /(?:ONE|SINGLE)/.test(station.stationCategoryTransmitter || '');
        if (isMost) {
          const txId = String(q?.raw?.TX_ID ?? '');
          if (!txId) {
            assumptions.add('RAC MOST QSO lacks Cabrillo transmitter ID; 10-minute band and multiplier-station restrictions could not be verified.');
          } else {
            runtime.racTxBands ||= new Map();
            const prior = runtime.racTxBands.get(txId);
            const ts = Number(q?.ts);
            if (!prior || prior.band === facts.bandNorm) {
              if (!prior) runtime.racTxBands.set(txId, { band: facts.bandNorm, since: ts });
            } else if (Number.isFinite(ts) && Number.isFinite(prior.since) && ts - prior.since >= 10 * 60 * 1000) {
              runtime.racTxBands.set(txId, { band: facts.bandNorm, since: ts });
            } else {
              operationallyEligible = false;
            }
            if (txId === '1') {
              runtime.racMultiplierSeen ||= new Set();
              const multiplierKey = canadian && !ve0 && VE_AREA_CODES.has(exchange)
                ? `${facts.bandNorm}|${facts.modeKey}|${exchange}` : '';
              if (!multiplierKey || runtime.racMultiplierSeen.has(multiplierKey)) operationallyEligible = false;
            }
          }
        }
        points = validExchange && operationallyEligible ? (official.has(call) ? 20 : (canadian ? 10 : 2)) : 0;
        if (points > 0 && canadian && !ve0 && VE_AREA_CODES.has(exchange)) {
          runtime.racMultiplierSeen ||= new Set();
          runtime.racMultiplierSeen.add(`${facts.bandNorm}|${facts.modeKey}|${exchange}`);
        }
      } else if (model === 'pacc_2026') {
        const provinces = new Set(['DR', 'FL', 'FR', 'GD', 'GR', 'LB', 'NB', 'NH', 'OV', 'UT', 'ZH', 'ZL']);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const workedExchangeValid = facts.qIsPaccDutch ? provinces.has(exchange) : /^\d+$/.test(exchange);
        const reciprocalEligible = station.stationIsPaccDutch || facts.qIsPaccDutch;
        points = reciprocalEligible && workedExchangeValid ? 1 : 0;
      } else if (model === 'ari_dx_2026') {
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeValid = facts.qIsAriDxItalian ? ARI_DX_PROVINCES.has(exchange) : /^\d+$/.test(exchange);
        if (!exchangeValid || (station.stationIsAriDxItalian && facts.qIsAriDxItalian)) points = 0;
        else if (!station.stationIsAriDxItalian && facts.qIsAriDxItalian) points = 10;
        else if (facts.sameCountry) points = 0;
        else points = facts.sameContinent ? 1 : (facts.differentContinent ? 3 : 0);
      } else if (model === 'aegean_rtty_recovered') {
        const sameContinent = facts.sameContinent;
        const sameContinentPoints = { '160M': 3, '80M': 3, '40M': 3, '20M': 1, '15M': 1, '10M': 1 };
        const crossContinentPoints = { '80M': 6, '40M': 6, '20M': 2, '15M': 2, '10M': 2 };
        points = !station.stationCountryKey || !facts.qCountryKey
          ? 0 : Number((sameContinent ? sameContinentPoints : crossContinentPoints)[facts.bandNorm] || 0);
        if (/\/QRP/i.test(facts.call || '')) points *= 2;
        if (/^SV(?:5|8|9)/.test(facts.call || '')) points *= 3;
      } else if (model === 'aegean_vhf_recovered') {
        const sent = sentGrid4(facts);
        const received = receivedGrid4(facts);
        const distance = Number(q?.distance);
        if (!sent || !received) points = 0;
        else if (sent === received) points = 1;
        else if (Number.isFinite(distance) && distance >= 0) points = Math.ceil(distance);
        else {
          points = 0;
          assumptions.add('Missing locator distance for an AEGEAN-VHF compatibility QSO; scored zero rather than guessing.');
        }
      } else if (model === 'agb_party_latest') {
        const rawMode = String(q?.mode || '').toUpperCase();
        const ftMode = rawMode === 'FT4' || rawMode === 'FT8';
        const exchange = String(firstNonNull(q?.exchRcvd, q?.srx, q?.raw?.SRX_STRING, q?.raw?.EXCH_RCVD) || '').trim().toUpperCase();
        const member = /(?:A|\/A?|-A?)(\d{1,4})$/.test(exchange);
        const validExchange = ftMode || /^\d+(?:(?:A|\/A?|-A?)\d{1,4})?$/.test(exchange);
        if (!validExchange || !station.stationContinent || !facts.qContinent) points = 0;
        else if (ftMode) points = 1;
        else if (member) points = 5;
        else points = facts.qContinent === station.stationContinent ? 1 : 3;
      } else if (model === 'ap_sprint_2026') {
        const ts = Number(q?.ts);
        const date = Number.isFinite(ts) ? new Date(ts) : null;
        const month = date ? date.getUTCMonth() + 1 : 0;
        const rawMode = String(q?.mode || '').toUpperCase();
        const isPhone = ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const scheduleEligible = month === 2
          ? rawMode === 'CW' && ['40M', '20M'].includes(facts.bandNorm)
          : month === 6
            ? isPhone && ['20M', '15M'].includes(facts.bandNorm)
            : month === 10 && rawMode === 'CW' && ['20M', '15M'].includes(facts.bandNorm);
        const serialValid = /^\d+$/.test(String(facts.exchangePrimary || ''));
        const stationAp = isApSprintIdentity(station.stationCall, station.stationCountryKey);
        const workedAp = isApSprintIdentity(facts.call, facts.qCountryKey);
        points = scheduleEligible && serialValid && (stationAp || workedAp) ? 1 : 0;
        if (!date) assumptions.add('Missing AP Sprint QSO timestamp; edition-specific band and mode eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'ari_sections_2026') {
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const stationEligible = isAriSectionsStation(station.stationCountry, station.stationCall);
        const workedEligible = isAriSectionsStation(facts.qCountry, facts.call);
        const pointsByBand = { '160M': 3, '80M': 2, '40M': 1, '20M': 2, '15M': 3, '10M': 4 };
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW'
          || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode)
          || (['RY', 'RTTY'].includes(rawMode) && facts.bandNorm !== '160M');
        points = stationEligible && workedEligible && modeEligible && /^[A-HJ-NP-Z]\d{2}$/.test(exchange)
          ? Number(pointsByBand[facts.bandNorm] || 0) : 0;
      } else if (model === 'avhfc_recovered') {
        points = facts.bandNorm === '6M' ? 1 : (facts.bandNorm === '2M' ? 2 : 0);
      } else if (model === 'baltic_2026') {
        const stationBaltic = isBalticContestStation(station.stationCountry, station.stationCall);
        const workedBaltic = isBalticContestStation(facts.qCountry, facts.call);
        const excluded = isBalticContestExcludedCountry(station.stationCountry) || isBalticContestExcludedCountry(facts.qCountry);
        const serialValid = /^\d+$/.test(String(facts.exchangePrimary || ''));
        const rawMode = String(q?.mode || '').toUpperCase();
        const frequency = Number(q?.freq);
        const modeFrequencyEligible = rawMode === 'CW'
          ? Number.isFinite(frequency) && frequency >= 3.51 && frequency <= 3.6
          : ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode)
            && Number.isFinite(frequency) && frequency >= 3.6 && frequency <= 3.75;
        if (excluded || !serialValid || !modeFrequencyEligible || !station.stationContinent || !facts.qContinent) points = 0;
        else if (stationBaltic) points = station.stationContinent === facts.qContinent ? 1 : 2;
        else if (workedBaltic) points = station.stationContinent === 'EU' ? 10 : 20;
        else points = 1;
      } else if (model === 'basso_ferrarese_recovered') {
        const jollyCalls = new Set(['IQ4FF', 'I4JEE', 'IZ4OSH', 'IK4RDP', 'IZ4ISC', 'IZ4SJI']);
        points = ['40M', '20M'].includes(facts.bandNorm) ? (jollyCalls.has(facts.call) ? 100 : 1) : 0;
      } else if (model === 'bdm_ww_rtty_recovered') {
        points = station.stationContinent && facts.qContinent
          ? (station.stationContinent === facts.qContinent ? 5 : 10) : 0;
      } else if (model === 'california_qso_party_2026') {
        const qths = cqpExchangeQths(facts.exchangeTokens);
        const hasSerial = facts.exchangeTokens.some((token) => /^\d+$/.test(String(token || '')));
        const workedCalifornia = qths.some((value) => CQP_COUNTIES.has(value));
        const workedUs = facts.qCountryKey === 'UNITED STATES' || CQP_STATE_CODES.has(qths[0]);
        const workedCanada = facts.qCountryKey === 'CANADA' || qths.some((value) => VE_AREA_CODES.has(value));
        const qthValid = workedCalifornia
          || (workedUs && qths.some((value) => CQP_STATE_CODES.has(value)))
          || (workedCanada && qths.some((value) => VE_AREA_CODES.has(value)))
          || qths.includes('DX');
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const reciprocalEligible = station.stationIsCqpCalifornia || workedCalifornia;
        points = reciprocalEligible && hasSerial && qthValid && modeEligible ? 3 : 0;
      } else if (model === 'cis_qpsk63_dx_recovered') {
        points = facts.bandNorm === 'OTHER' || !facts.call || isRecoveredCisMobile(facts.call)
          ? 0 : (isRecoveredCisQpsk63Call(facts.call, facts.wpx) ? 3 : 1);
      } else if (model === 'cq_m_2025') {
        const stationContinent = ['EU', 'AS'].includes(station.stationContinent) ? 'EURASIA' : station.stationContinent;
        const workedContinent = ['EU', 'AS'].includes(facts.qContinent) ? 'EURASIA' : facts.qContinent;
        const serialValid = /^\d+$/.test(String(facts.exchangePrimary || ''));
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        if (!serialValid || !modeEligible || !stationContinent || (!workedContinent && !facts.isMaritime)) points = 0;
        else if (facts.isMaritime) points = 3;
        else points = stationContinent === workedContinent ? 2 : 3;
      } else if (model === 'cqmm_dx_2026') {
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeValid = /^(?:AF|AS|EU|NA|OC|SA)[CMQY]?$/.test(exchange);
        const rawMode = String(q?.mode || '').toUpperCase();
        if (!exchangeValid || rawMode !== 'CW' || !station.stationContinent || (!facts.qContinent && !facts.isMaritime)) points = 0;
        else if (/[CMQY]$/.test(exchange)) points = 10;
        else if (facts.isMaritime) points = 3;
        else if (facts.sameCountry) points = 1;
        else if (facts.sameContinent) points = ['80M', '40M'].includes(facts.bandNorm) ? 4 : 2;
        else points = ['80M', '40M'].includes(facts.bandNorm) ? 6 : 3;
      } else if (model === 'dig_qso_party_2025') {
        const schedule = digQsoPartySchedule(q);
        if (schedule.missingTimestamp) assumptions.add('Missing DIG QSO Party timestamp; contest-part schedule eligibility could not be established, so the QSO scored zero.');
        const member = Number.parseInt(String(facts.exchangePrimary || ''), 10);
        points = schedule.eligible && facts.qCountryKey ? (Number.isFinite(member) && member > 0 ? 10 : 1) : 0;
      } else if (model === 'darc_xmas_2025') {
        const ts = Number(q?.ts);
        const date = Number.isFinite(ts) ? new Date(ts) : null;
        const minute = date ? date.getUTCHours() * 60 + date.getUTCMinutes() : -1;
        const scheduleEligible = Boolean(date)
          && date.getUTCMonth() === 11 && date.getUTCDate() === 26
          && minute >= 8 * 60 + 30 && minute < 11 * 60;
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeEligible = facts.qIsDl ? (exchange === 'NM' || /^[A-Z]\d{2}$/.test(exchange)) : /^\d+$/.test(exchange);
        points = scheduleEligible && modeEligible && ['80M', '40M'].includes(facts.bandNorm) && exchangeEligible ? 1 : 0;
        if (!date) assumptions.add('Missing DARC Christmas Contest timestamp; the fixed 26 December contest window could not be established, so the QSO scored zero.');
      } else if (model === 'eu_psk_dx_2026') {
        const ts = Number(q?.ts);
        const date = Number.isFinite(ts) ? new Date(ts) : null;
        const windows = {
          2025: [Date.UTC(2025, 4, 17, 12), Date.UTC(2025, 4, 18, 12)],
          2026: [Date.UTC(2026, 4, 16, 12), Date.UTC(2026, 4, 17, 12)],
          2027: [Date.UTC(2027, 4, 15, 12), Date.UTC(2027, 4, 16, 12)],
          2028: [Date.UTC(2028, 4, 20, 12), Date.UTC(2028, 4, 21, 12)],
          2029: [Date.UTC(2029, 4, 19, 12), Date.UTC(2029, 4, 20, 12)]
        };
        const window = date ? windows[date.getUTCFullYear()] : null;
        const scheduleEligible = Boolean(window) && ts >= window[0] && ts < window[1];
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = ['PM', 'PSK63', 'BPSK63'].includes(rawMode);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeEligible = facts.qIsEu ? /^[A-Z]{4,8}$/.test(exchange) : /^\d+$/.test(exchange);
        if (!scheduleEligible || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !exchangeEligible) points = 0;
        else if (facts.isMaritime) points = 3;
        else if (!station.stationContinent || !facts.qContinent) points = 0;
        else if (station.stationContinent !== 'EU' && facts.qIsEu) points = 5;
        else if (facts.sameCountry) points = 1;
        else if (facts.sameContinent) points = 2;
        else points = 3;
        if (!date) assumptions.add('Missing EU PSK DX timestamp; the published edition window could not be established, so the QSO scored zero.');
      } else if (model === 'es_open_hf_2026') {
        const ts = Number(q?.ts);
        const date = Number.isFinite(ts) ? new Date(ts) : null;
        const minute = date ? date.getUTCHours() * 60 + date.getUTCMinutes() : -1;
        const scheduleEligible = Boolean(date) && date.getUTCFullYear() === 2026
          && date.getUTCMonth() === 3 && date.getUTCDate() === 18 && minute >= 300 && minute < 540;
        const rawMode = String(q?.mode || '').toUpperCase();
        const cw = rawMode === 'CW';
        const phone = ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const stationEs = isCountryEs(station.stationCountry, station.stationCall);
        const workedEs = isCountryEs(facts.qCountry, facts.call);
        const excludedCountry = isBalticContestExcludedCountry(station.stationCountry) || isBalticContestExcludedCountry(facts.qCountry);
        const reciprocalEligible = stationEs || workedEs;
        points = scheduleEligible && ['80M', '40M'].includes(facts.bandNorm) && (cw || phone)
          && /^\d+$/.test(String(facts.exchangePrimary || '')) && reciprocalEligible && !excludedCountry
          ? (cw ? 2 : 1) : 0;
        if (!date) assumptions.add('Missing ES Open HF timestamp; the hour-tour and contest-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'hsc_2026') {
        const ts = Number(q?.ts);
        const date = Number.isFinite(ts) ? new Date(ts) : null;
        const minute = date ? date.getUTCHours() * 60 + date.getUTCMinutes() : -1;
        const dateEligible = Boolean(date) && date.getUTCFullYear() === 2026
          && ((date.getUTCMonth() === 1 && date.getUTCDate() === 22) || (date.getUTCMonth() === 10 && date.getUTCDate() === 1));
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const member = /^\d+$/.test(exchange) && Number(exchange) > 0;
        const nonmember = exchange === 'NM';
        points = dateEligible && minute >= 840 && minute < 1020 && String(q?.mode || '').toUpperCase() === 'CW'
          && ['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) && (member || nonmember)
          ? (member ? 5 : 2) : 0;
        if (!date) assumptions.add('Missing HSC Contest timestamp; the February/November 2026 session could not be established, so the QSO scored zero.');
      } else if (model === 'inorc_2025') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2025, 11, 6, 14) && ts < Date.UTC(2025, 11, 7, 14);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const member = /^[A-Z]+\d+$/.test(exchange);
        const independent = /^\d+$/.test(exchange);
        points = inWindow && String(q?.mode || '').toUpperCase() === 'CW'
          && ['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) && (member || independent)
          ? (member ? 10 : 1) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing INORC Contest timestamp; the 2025 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'kcj_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 7, 15, 12) && ts < Date.UTC(2026, 7, 16, 12);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeValid = facts.qIsJa ? KCJ_PREFECTURE_CODES.has(exchange) : /^\d{1,2}$/.test(exchange) && Number(exchange) >= 1 && Number(exchange) <= 40;
        const stationJa = isCountryJa(station.stationCountry);
        points = inWindow && String(q?.mode || '').toUpperCase() === 'CW'
          && ['160M', '80M', '40M', '20M', '15M', '10M', '6M'].includes(facts.bandNorm) && exchangeValid
          ? (stationJa ? (facts.qIsJa ? 1 : 2) : (facts.qIsJa ? 2 : 1)) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing KCJ Contest timestamp; the 2026 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'iota_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 6, 25, 12) && ts < Date.UTC(2026, 6, 26, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const serialValid = Boolean(facts.exchangeTokens.find((token) => /^\d+$/.test(token)));
        const stationIsland = Boolean(station.stationIota);
        const workedIsland = Boolean(facts.exchangeIota);
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !serialValid) points = 0;
        else if (stationIsland) points = workedIsland && facts.exchangeIota !== station.stationIota ? 15 : 5;
        else points = workedIsland ? 15 : 2;
        if (!Number.isFinite(ts)) assumptions.add('Missing IOTA Contest timestamp; the 2026 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'marconi_memorial_hf_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 6, 4, 14) && ts < Date.UTC(2026, 6, 5, 14);
        points = inWindow && String(q?.mode || '').toUpperCase() === 'CW'
          && ['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          && /^\d+$/.test(String(facts.exchangePrimary || '')) && facts.qCountryKey ? 1 : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing Marconi Memorial HF timestamp; the 2026 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'gdbage_dx_recovered') {
        points = facts.qCountryKey ? (facts.bandNorm === '80M' ? 3 : 2) : 0;
      } else if (model === 'lz_dx_2025') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2025, 10, 22, 12) && ts < Date.UTC(2025, 10, 23, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const stationLz = /^(?:BULGARIA|LZ)$/.test(station.stationCountryKey) || /^LZ/.test(station.stationCall || '');
        const workedLz = /^(?:BULGARIA|LZ)$/.test(facts.qCountryKey) || /^LZ/.test(facts.call);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeValid = workedLz ? LZ_DX_DISTRICTS.has(exchange)
          : /^\d{1,2}$/.test(exchange) && Number(exchange) >= 1 && Number(exchange) <= 90;
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !exchangeValid) points = 0;
        else if (workedLz) points = stationLz ? 1 : 10;
        else if (!station.stationContinent || !facts.qContinent) points = 0;
        else points = station.stationContinent === facts.qContinent ? 1 : 3;
        if (!Number.isFinite(ts)) assumptions.add('Missing LZ DX timestamp; the 2025 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'ny_qso_party_2025') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2025, 9, 18, 14) && ts < Date.UTC(2025, 9, 19, 2);
        const workedCounty = facts.exchangeTokens.find((token) => NYQP_COUNTIES.has(String(token || '').toUpperCase()));
        const exchangeValid = station.stationIsNyqpNy
          ? facts.exchangeTokens.some((token) => NYQP_COUNTIES.has(token) || CQP_STATE_CODES.has(token) || VE_AREA_CODES.has(token) || token === 'DX')
          : Boolean(workedCounty);
        const rawMode = String(q?.mode || '').toUpperCase();
        const phone = MODE_PHONE.has(rawMode);
        const cw = rawMode === 'CW';
        const digital = MODE_DIGITAL.has(rawMode) || rawMode === 'RY';
        points = inWindow && facts.bandNorm !== 'OTHER' && !['30M', '17M', '12M'].includes(facts.bandNorm)
          && exchangeValid && (phone || cw || digital) ? (digital ? 3 : cw ? 2 : 1) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing New York QSO Party timestamp; the 2025 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'ok_dx_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 11, 19, 0) && ts < Date.UTC(2026, 11, 20, 0);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const factor = ['40M', '80M'].includes(facts.bandNorm) ? 3 : ['20M', '15M', '10M'].includes(facts.bandNorm) ? 1 : 0;
        points = inWindow && String(q?.mode || '').toUpperCase() === 'RTTY' && factor
          && /^\d{1,2}$/.test(exchange) && Number(exchange) >= 1 && Number(exchange) <= 40
          && station.stationContinent && facts.qContinent ? factor * (station.stationContinent === facts.qContinent ? 1 : 2) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing OK DX RTTY timestamp; the 2026 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'portugal_day_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 5, 13, 12) && ts < Date.UTC(2026, 5, 14, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || MODE_PHONE.has(rawMode);
        const stationPt = hasCountryToken(station.stationCountry, ['PORTUGAL', 'AZORES', 'MADEIRA'])
          || /^(?:CQ|CR|CS|CT|CU)/.test(station.stationCall || '');
        const workedPt = hasCountryToken(facts.qCountry, ['PORTUGAL', 'AZORES', 'MADEIRA'])
          || /^(?:CQ|CR|CS|CT|CU)/.test(facts.call);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const exchangeValid = workedPt ? PORTUGAL_DAY_AREAS.has(exchange) : /^\d+$/.test(exchange) && Number(exchange) > 0;
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !exchangeValid) points = 0;
        else if (stationPt && workedPt) points = 5;
        else if (stationPt) points = 1;
        else if (workedPt) points = 10;
        else if (!station.stationContinent || !facts.qContinent) points = 0;
        else points = station.stationContinent === facts.qContinent ? 1 : 2;
        if (!Number.isFinite(ts)) assumptions.add('Missing Portugal Day Contest timestamp; the 2026 contest window could not be established, so the QSO scored zero.');
      } else if (model === 'pears_vhf_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 0, 9, 16) && ts < Date.UTC(2026, 0, 11, 12);
        const eligibleBand = ['6M', '4M', '2M', '70CM', '23CM'].includes(facts.bandNorm);
        const stationEligible = /^(?:ZS|ZR|ZU|V5|A2|Z2|C9|7P|3DA)/.test(station.stationCall || '');
        const workedEligible = /^(?:ZS|ZR|ZU|V5|A2|Z2|C9|7P|3DA)/.test(facts.call);
        const sentGrid = sentGrid4(facts);
        const receivedGrid = receivedGrid4(facts);
        const distance = Number(q?.distance);
        if (!inWindow || !eligibleBand || !stationEligible || !workedEligible || !sentGrid || !receivedGrid || !Number.isFinite(distance) || distance < 0) points = 0;
        else points = Math.max(1, Math.floor(distance));
        if (!Number.isFinite(ts)) assumptions.add('Missing PEARS timestamp; session and 2026-window eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid || !Number.isFinite(distance)) && inWindow) assumptions.add('Missing PEARS locator or derived distance; the QSO scored zero rather than guessing.');
      } else if (model === 'popov_memorial_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 2, 21, 5) && ts < Date.UTC(2026, 2, 21, 9);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || MODE_PHONE.has(rawMode);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        points = inWindow && modeEligible && ['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          && /^\d{2,3}$/.test(exchange) ? Number(exchange) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing Popov Memorial timestamp; the 2026 four-hour window could not be established, so the QSO scored zero.');
      } else if (model === 'popov_vhf_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 2, 21, 15) && ts < Date.UTC(2026, 2, 21, 18))
          || (ts >= Date.UTC(2026, 2, 22, 2) && ts < Date.UTC(2026, 2, 22, 5)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || MODE_PHONE.has(rawMode);
        const sentGrid = firstGrid6Token([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const receivedGrid = firstGrid6Token([q?.grid, ...(facts.exchangeTokens || [])]);
        const serialValid = facts.exchangeTokens.some((token) => /^\d+$/.test(String(token || ''))
          && Number(token) > 0 && !['59', '599'].includes(String(token)));
        const distance = Number(q?.distance);
        if (!inWindow || facts.bandNorm !== '2M' || !modeEligible || !sentGrid || !receivedGrid || !serialValid) points = 0;
        else if (sentGrid === receivedGrid) points = 4;
        else points = Number.isFinite(distance) && distance >= 0 ? Math.floor(distance) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing Popov VHF timestamp; round eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid || (!Number.isFinite(distance) && sentGrid !== receivedGrid)) && inWindow) assumptions.add('Missing Popov VHF locator or derived distance; the QSO scored zero rather than guessing.');
      } else if (model === 'russian_160m_2025') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2025, 11, 19, 17) && ts < Date.UTC(2025, 11, 19, 21);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || MODE_PHONE.has(rawMode);
        const sentGrid = sentGrid4(facts);
        const receivedGrid = receivedGrid4(facts);
        const distance = Number(q?.distance);
        if (!inWindow || facts.bandNorm !== '160M' || !modeEligible || !sentGrid || !receivedGrid || !Number.isFinite(distance) || distance < 0) points = 0;
        else {
          const distancePoints = 10 + Math.max(0, Math.ceil(distance / 500) - 1);
          points = facts.modeKey === 'SSB' ? distancePoints * 2 : distancePoints;
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing Russian 160m timestamp; round and 2025-window eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid || !Number.isFinite(distance)) && inWindow) assumptions.add('Missing Russian 160m locator or derived distance; the QSO scored zero rather than guessing.');
      } else if (model === 'russian_ww_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 8, 5, 12) && ts < Date.UTC(2026, 8, 6, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'RTTY' || rawMode === 'RY';
        const workedRussian = facts.qIsRu || /^(?:RI1FJ|RI1AN)/.test(facts.call);
        const stationRussian = station.stationIsRu || /^(?:RI1FJ|RI1AN)/.test(station.stationCall || '');
        const maritime = /\/MM$/.test(facts.call);
        const oblast = facts.exchangeTokens.find((token) => /^[A-Z]{2}$/.test(token)) || '';
        const serial = facts.exchangeTokens.find((token) => /^\d{1,4}$/.test(token) && !['45', '599'].includes(token)) || '';
        const exchangeValid = workedRussian ? Boolean(oblast) : Boolean(serial);
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !exchangeValid) points = 0;
        else if (maritime) points = 5;
        else if (stationRussian) {
          if (workedRussian) points = facts.sameContinent ? 2 : 5;
          else points = facts.sameContinent ? 3 : 5;
        } else if (workedRussian) points = 10;
        else if (facts.sameCountry) points = 2;
        else points = facts.sameContinent ? 3 : 5;
        if (!Number.isFinite(ts)) assumptions.add('Missing Russian WW RTTY timestamp; 2026-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'wia_remembrance_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 7, 15, 3) && ts < Date.UTC(2026, 7, 16, 3);
        const stationCall = String(station.stationCall || '').toUpperCase();
        const stationEligible = /^(?:VK|VL|ZL|P2)/.test(stationCall);
        const workedEligible = /^(?:VK|VL|ZL|P2)/.test(facts.call);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || rawMode === 'RTTY' || rawMode === 'RY' || MODE_PHONE.has(rawMode);
        const years = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token)) || '';
        const excludedBand = ['30M', '17M', '12M'].includes(facts.bandNorm);
        if (!inWindow || !stationEligible || !workedEligible || !modeEligible || excludedBand || !years) points = 0;
        else {
          const doubleBaseBands = new Set(['160M', '23CM', '13CM', '9CM', '6CM', '3CM', '1.25CM', '6MM', '4MM', '2.5MM', '2MM', '1MM']);
          points = doubleBaseBands.has(facts.bandNorm) ? 2 : 1;
          if (facts.modeKey === 'CW' || facts.modeKey === 'DIG') points *= 2;
          let offsetMinutes = 600;
          if (/^(?:VK|VL)6/.test(stationCall)) offsetMinutes = 480;
          else if (/^(?:VK|VL)(?:5|8)/.test(stationCall)) offsetMinutes = 570;
          else if (/^ZL/.test(stationCall)) offsetMinutes = 720;
          const local = new Date(ts + offsetMinutes * 60000);
          const localMinutes = local.getUTCHours() * 60 + local.getUTCMinutes();
          if (localMinutes >= 60 && localMinutes < 360) points *= 3;
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing WIA Remembrance Day timestamp; contest-window, repeat, and local-time bonus eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'international_naval_2025') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2025, 11, 13, 16) && ts < Date.UTC(2025, 11, 14, 16);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || MODE_PHONE.has(rawMode);
        const navalExchange = facts.exchangeTokens.find((token) => /^(?:CA|FN|IN|MA|MF|MI|RN|YO|PN|GR)\d+$/i.test(token));
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        points = inWindow && modeEligible && ['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          && (navalExchange || serial) ? (navalExchange ? 10 : 1) : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing International Naval Contest timestamp; 2025-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'rsgb_160m_2026') {
        const ts = Number(q?.ts);
        const february = Number.isFinite(ts) && ts >= Date.UTC(2026, 1, 14, 20) && ts < Date.UTC(2026, 1, 14, 23);
        const november = Number.isFinite(ts) && ts >= Date.UTC(2026, 10, 21, 20) && ts < Date.UTC(2026, 10, 21, 23);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || (february && MODE_PHONE.has(rawMode));
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const workedUk = hasCountryToken(facts.qCountry, ['ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN IRELAND', 'GUERNSEY', 'JERSEY', 'ISLE OF MAN', 'UNITED KINGDOM']);
        const district = facts.exchangeTokens.find((token) => /^[A-Z]{2}$/.test(token));
        points = (february || november) && facts.bandNorm === '160M' && modeEligible && serial && (!workedUk || district) ? 2 : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing RSGB 1.8 MHz timestamp; 2026 event and mode eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'rsgb_low_power_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 6, 19, 9) && ts < Date.UTC(2026, 6, 19, 12))
          || (ts >= Date.UTC(2026, 6, 19, 13) && ts < Date.UTC(2026, 6, 19, 16)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['599'].includes(token));
        const powerToken = facts.exchangeTokens.find((token) => /^(?:\d+W\d*|QRO)$/i.test(token));
        let power = NaN;
        if (powerToken && powerToken !== 'QRO') power = Number(powerToken.replace('W', '.'));
        const freq = Number(q?.freq);
        const frequencyEligible = !Number.isFinite(freq) || (freq >= 3.51 && freq <= 3.58) || (freq >= 7 && freq <= 7.04) || (freq >= 14 && freq <= 14.06);
        if (!inWindow || rawMode !== 'CW' || !['80M', '40M', '20M'].includes(facts.bandNorm) || !frequencyEligible || !serial || !powerToken) points = 0;
        else if (Number.isFinite(power) && power > 0 && power <= 10) points = /\/(?:P|M)$/.test(facts.call) ? 15 : 10;
        else points = 5;
        if (!Number.isFinite(ts)) assumptions.add('Missing RSGB Low Power timestamp; 2026 session eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'rsgb_nfd_2026' || model === 'rsgb_ssb_fd_2026') {
        const ts = Number(q?.ts);
        const cwEvent = model === 'rsgb_nfd_2026';
        const inWindow = Number.isFinite(ts) && (cwEvent
          ? ts >= Date.UTC(2026, 5, 6, 15) && ts < Date.UTC(2026, 5, 7, 15)
          : ts >= Date.UTC(2026, 8, 5, 13) && ts < Date.UTC(2026, 8, 6, 13));
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = cwEvent ? rawMode === 'CW' : ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const bands = cwEvent ? ['160M', '80M', '40M', '20M', '15M', '10M'] : ['80M', '40M', '20M', '15M', '10M'];
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        if (!inWindow || !modeEligible || !bands.includes(facts.bandNorm) || !serial || !facts.qContinent) points = 0;
        else if (!station.stationPortable && !facts.qPortable) points = 0;
        else {
          points = facts.qPortable ? (facts.qContinent === 'EU' ? 4 : 6) : (facts.qContinent === 'EU' ? 2 : 3);
          if (cwEvent && facts.bandNorm === '160M') points *= 2;
        }
        if (!Number.isFinite(ts)) assumptions.add(`Missing RSGB ${cwEvent ? 'CW NFD' : 'SSB Field Day'} timestamp; 2026-window eligibility could not be established, so the QSO scored zero.`);
      } else if (model === 'sac_2026') {
        const ts = Number(q?.ts);
        const rawMode = String(q?.mode || '').toUpperCase();
        const cw = rawMode === 'CW';
        const ssb = ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const inWindow = Number.isFinite(ts) && (cw
          ? ts >= Date.UTC(2026, 8, 19, 12) && ts < Date.UTC(2026, 8, 20, 12)
          : ssb && ts >= Date.UTC(2026, 9, 10, 12) && ts < Date.UTC(2026, 9, 11, 12));
        const freq = Number(q?.freq);
        const frequencyEligible = !Number.isFinite(freq) || (cw
          ? (freq >= 3.51 && freq <= 3.56) || (freq >= 7 && freq <= 7.04) || (freq >= 14 && freq <= 14.06) || (freq >= 21 && freq <= 21.07) || (freq >= 28 && freq <= 28.07)
          : (freq >= 3.6 && freq <= 3.65) || (freq >= 3.7 && freq <= 3.8) || (freq >= 7.06 && freq <= 7.1) || (freq >= 7.13 && freq <= 7.2) || (freq >= 14.125 && freq <= 14.3) || (freq >= 21.151 && freq <= 21.45) || (freq >= 28.32 && freq <= 29));
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const stationScandinavian = sacIsScandinavian(station.stationCall, station.stationCountryKey);
        const workedScandinavian = sacIsScandinavian(facts.call, facts.qCountryKey);
        const entrantExcluded = /^(?:RUSSIA|KALININGRAD|BELARUS)$/.test(station.stationCountryKey || '');
        if (!inWindow || !frequencyEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !serial || entrantExcluded) points = 0;
        else if (stationScandinavian) points = workedScandinavian ? 0 : (facts.qContinent === 'EU' ? 2 : 3);
        else if (!workedScandinavian) points = 0;
        else points = station.stationContinent !== 'EU' && ['80M', '40M'].includes(facts.bandNorm) ? 3 : 1;
        if (!Number.isFinite(ts)) assumptions.add('Missing SAC timestamp; 2026 CW/SSB event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'sarl_hf_2026') {
        const ts = Number(q?.ts);
        const rawMode = String(q?.mode || '').toUpperCase();
        const phone = ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const digital = ['FT4', 'FT8'].includes(rawMode);
        const eventEligible = Number.isFinite(ts) && ((phone && ts >= Date.UTC(2026, 7, 2, 14) && ts < Date.UTC(2026, 7, 2, 17))
          || (digital && ts >= Date.UTC(2026, 7, 9, 13) && ts < Date.UTC(2026, 7, 9, 16))
          || (rawMode === 'CW' && ts >= Date.UTC(2026, 7, 23, 14) && ts < Date.UTC(2026, 7, 23, 17)));
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const freq = Number(q?.freq);
        const frequencyEligible = !Number.isFinite(freq) || (phone
          ? (freq >= 3.603 && freq <= 3.65) || (freq >= 3.7 && freq <= 3.8) || (freq >= 7.063 && freq <= 7.1) || (freq >= 7.13 && freq <= 7.2) || (freq >= 14.125 && freq <= 14.35)
          : rawMode === 'CW' ? (freq >= 3.51 && freq <= 3.56) || (freq >= 7 && freq <= 7.04) || (freq >= 14.02 && freq <= 14.03) : true);
        points = eventEligible && frequencyEligible && ['80M', '40M', '20M'].includes(facts.bandNorm) && serial ? 1 : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing SARL HF timestamp; 2026 event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'sarl_vhf_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 5, 13, 10) && ts < Date.UTC(2026, 5, 13, 13))
          || (ts >= Date.UTC(2026, 9, 31, 10) && ts < Date.UTC(2026, 9, 31, 13)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const sentGrid = firstGrid6Token([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const receivedGrid = firstGrid6Token([q?.grid, ...(facts.exchangeTokens || [])]);
        const distance = Number(q?.distance);
        const geographyEligible = sarlVhfCountryEligible(station.stationCall, station.stationCountryKey) && sarlVhfCountryEligible(facts.call, facts.qCountryKey);
        if (!inWindow || rawMode !== 'FM' || !['6M', '2M', '70CM'].includes(facts.bandNorm) || !sentGrid || !receivedGrid || !geographyEligible || !Number.isFinite(distance) || distance < 0) points = 0;
        else points = Math.max(1, Math.floor(distance));
        if ((!sentGrid || !receivedGrid || !Number.isFinite(distance)) && inWindow) assumptions.add('Missing SARL VHF/UHF locator or derived distance; the QSO scored zero rather than guessing.');
      } else if (model === 'sarl_youth_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 5, 16, 12) && ts < Date.UTC(2026, 5, 16, 13))
          || (ts >= Date.UTC(2026, 7, 15, 12) && ts < Date.UTC(2026, 7, 15, 13)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const freq = Number(q?.freq);
        const frequencyEligible = !Number.isFinite(freq) || (rawMode === 'CW' ? freq >= 7 && freq <= 7.04 : (freq >= 7.063 && freq <= 7.1) || (freq >= 7.13 && freq <= 7.2));
        const sentAge = sarlExchangeAge(facts.exchangeSentTokens);
        const receivedAge = sarlExchangeAge(facts.exchangeTokens);
        if (!inWindow || facts.bandNorm !== '40M' || !modeEligible || !frequencyEligible || !Number.isFinite(sentAge) || !Number.isFinite(receivedAge)) points = 0;
        else if (sentAge <= 26 && receivedAge <= 26) points = 5;
        else if (sentAge <= 26 || receivedAge <= 26) points = 3;
        else points = 1;
      } else if (model === 'sarl_yl_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 2, 7, 14) && ts < Date.UTC(2026, 2, 7, 15))
          || (ts >= Date.UTC(2026, 7, 9, 14) && ts < Date.UTC(2026, 7, 9, 15)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const freq = Number(q?.freq);
        const frequencyEligible = !Number.isFinite(freq) || (rawMode === 'CW' ? freq >= 7 && freq <= 7.04 : (freq >= 7.063 && freq <= 7.1) || (freq >= 7.13 && freq <= 7.2));
        const sentGender = facts.exchangeSentTokens.find((token) => token === 'YL' || token === 'OM') || '';
        const receivedGender = facts.exchangeTokens.find((token) => token === 'YL' || token === 'OM') || '';
        const stationRsa = /^(?:ZS|ZR|ZU)/.test(station.stationCall || '') || station.stationCountryKey === 'SOUTH AFRICA';
        const workedRsa = /^(?:ZS|ZR|ZU)/.test(facts.call || '') || facts.qCountryKey === 'SOUTH AFRICA';
        if (!inWindow || facts.bandNorm !== '40M' || !modeEligible || !frequencyEligible || !sentGender || !receivedGender) points = 0;
        else if (stationRsa !== workedRsa && sentGender === 'YL' && receivedGender === 'YL') points = 10;
        else if (stationRsa !== workedRsa && (sentGender === 'YL' || receivedGender === 'YL')) points = 7;
        else if (sentGender === 'YL' && receivedGender === 'YL') points = 6;
        else if (sentGender === 'YL' || receivedGender === 'YL') points = 3;
        else points = 2;
      } else if (model === 'sartg_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 7, 15, 0) && ts < Date.UTC(2026, 7, 15, 8))
          || (ts >= Date.UTC(2026, 7, 15, 16) && ts < Date.UTC(2026, 7, 16, 0))
          || (ts >= Date.UTC(2026, 7, 16, 8) && ts < Date.UTC(2026, 7, 16, 16)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        if (!inWindow || !['RTTY', 'RY'].includes(rawMode) || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !serial || !facts.qCountryKey || !station.stationCountryKey) points = 0;
        else if (facts.qCountryKey === station.stationCountryKey) points = 5;
        else points = facts.qContinent === station.stationContinent ? 10 : 15;
        if (!Number.isFinite(ts)) assumptions.add('Missing SARTG RTTY timestamp; 2026 operating-period eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'un_dx_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 4, 16, 6) && ts < Date.UTC(2026, 4, 16, 21);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const stationKazakhstan = station.stationCountryKey === 'KAZAKHSTAN' || /^UN/.test(station.stationCall || '');
        const workedKazakhstan = facts.qCountryKey === 'KAZAKHSTAN' || /^UN/.test(facts.call || '');
        const kda = facts.exchangeTokens.find((token) => /^[A-Z]\d{2}$/.test(token));
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangeEligible = workedKazakhstan ? Boolean(kda) : Boolean(serial);
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !exchangeEligible || !facts.qCountryKey || !station.stationCountryKey) points = 0;
        else if (workedKazakhstan) points = 10;
        else if (facts.qCountryKey === station.stationCountryKey) points = stationKazakhstan ? 10 : 2;
        else points = facts.qContinent === station.stationContinent ? 3 : 5;
        if (!Number.isFinite(ts)) assumptions.add('Missing UN DX timestamp; 2026 contest-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'volta_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 4, 9, 12) && ts < Date.UTC(2026, 4, 10, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const sentZone = voltaExchangeNumbers(facts.exchangeSentTokens).zone;
        const receivedExchange = voltaExchangeNumbers(facts.exchangeTokens);
        const receivedZone = receivedExchange.zone;
        const serial = receivedExchange.serial;
        const stationArea = voltaCallArea(station.stationCall, station.stationCountryKey);
        const workedArea = voltaCallArea(facts.call, facts.qCountryKey);
        const sameInvalidIdentity = facts.sameCountry && (!stationArea || !workedArea || stationArea === workedArea);
        if (!inWindow || !['RTTY', 'RY'].includes(rawMode) || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !serial || !Number.isFinite(sentZone) || !Number.isFinite(receivedZone) || sameInvalidIdentity
          || !facts.qCountryKey || !station.stationCountryKey) points = 0;
        else {
          const base = Number(VOLTA_ZONE_POINTS[sentZone - 1]?.[receivedZone - 1] || 0);
          points = base * (facts.differentContinent && ['80M', '10M'].includes(facts.bandNorm) ? 2 : 1);
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing VOLTA RTTY timestamp; 2026 contest-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'uba_psk63_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 0, 10, 12) && ts < Date.UTC(2026, 0, 11, 12);
        const exactMode = String(q?.submode || q?.raw?.SUBMODE || q?.mode || '').toUpperCase();
        const modeEligible = exactMode === 'BPSK63' || exactMode === 'PSK63';
        const workedBelgian = facts.qCountryKey === 'BELGIUM' || /^O[N-T]|^ON\//.test(facts.call || '');
        const excludedCountry = ['RUSSIA', 'BELARUS', 'BELARUS (EUROPEAN)'].includes(facts.qCountryKey);
        const section = facts.exchangeTokens.find((token) => UBA_PSK63_SECTIONS.has(token) || token === 'XXX') || '';
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangeEligible = workedBelgian ? Boolean(section) : Boolean(serial);
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || excludedCountry || !exchangeEligible || !facts.wpx) points = 0;
        else points = 1;
        if (!Number.isFinite(ts)) assumptions.add('Missing UBA PSK63 timestamp; 2026 contest-window eligibility could not be established, so the QSO scored zero.');
        if (!modeEligible && ['DG', 'DIG', 'DATA'].includes(exactMode)) assumptions.add('Generic digital mode does not prove BPSK63 for UBA PSK63; the QSO scored zero rather than guessing the submode.');
      } else if (model === 'uksmg_summer_2027') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2027, 5, 19, 13) && ts < Date.UTC(2027, 5, 20, 13);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = ['CW', 'SSB', 'USB', 'LSB', 'PH', 'PHONE', 'FM', 'AM', 'SSTV', 'RTTY', 'RY'].includes(rawMode);
        const sentGrid = firstGrid6Token([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const receivedGrid = firstGrid6Token([q?.grid, ...(facts.exchangeTokens || [])]);
        const receivedGridIndex = facts.exchangeTokens.findIndex((token) => /^[A-R]{2}\d{2}(?:[A-X]{2})?$/.test(token));
        const serial = (receivedGridIndex >= 0 ? facts.exchangeTokens.slice(0, receivedGridIndex) : [])
          .find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const distance = Number(q?.distance);
        if (!inWindow || facts.bandNorm !== '6M' || !modeEligible || !sentGrid || !receivedGrid || !serial || !Number.isFinite(distance) || distance < 0 || /\/AM$/.test(facts.call || '')) points = 0;
        else points = sentGrid === receivedGrid ? 1 : Math.max(1, Math.ceil(distance));
        if (!Number.isFinite(ts)) assumptions.add('Missing UKSMG timestamp; 2027 contest-window eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid || !Number.isFinite(distance)) && inWindow) assumptions.add('Missing UKSMG locator or derived distance; the QSO scored zero rather than guessing.');
      } else if (model === 'makrothen_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ((ts >= Date.UTC(2026, 9, 10, 0) && ts < Date.UTC(2026, 9, 10, 8))
          || (ts >= Date.UTC(2026, 9, 10, 16) && ts < Date.UTC(2026, 9, 11, 0))
          || (ts >= Date.UTC(2026, 9, 11, 8) && ts < Date.UTC(2026, 9, 11, 16)));
        const rawMode = String(q?.mode || '').toUpperCase();
        const sentGrid = firstGrid4Token([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const receivedGrid = firstGrid4Token([q?.grid, ...(facts.exchangeTokens || [])]);
        if (!inWindow || !['RTTY', 'RY'].includes(rawMode) || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !sentGrid || !receivedGrid) points = 0;
        else if (sentGrid === receivedGrid) points = 100;
        else {
          const sentLocation = gridToLatLon(sentGrid);
          const receivedLocation = gridToLatLon(receivedGrid);
          const distance = sentLocation && receivedLocation
            ? Math.floor(haversineKmWithRadius(sentLocation.lat, sentLocation.lon, receivedLocation.lat, receivedLocation.lon, 6378.16))
            : NaN;
          const bandFactor = facts.bandNorm === '80M' ? 2 : facts.bandNorm === '40M' ? 1.5 : 1;
          points = Number.isFinite(distance) ? Math.floor(distance * bandFactor) : 0;
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing Makrothen timestamp; 2026 operating-period eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid) && inWindow) assumptions.add('Missing Makrothen four-character locator; the QSO scored zero rather than guessing.');
      } else if (model === 'sp_dx_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 3, 4, 15) && ts < Date.UTC(2026, 3, 5, 15);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const stationPolish = station.stationCountryKey === 'POLAND' || /^(?:3Z|HF|SN|SO|SP|SQ)/.test(station.stationCall || '');
        const workedPolish = facts.qCountryKey === 'POLAND' || /^(?:3Z|HF|SN|SO|SP|SQ)/.test(facts.call || '');
        const province = facts.exchangeTokens.find((token) => SP_DX_PROVINCES.has(token)) || '';
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangeEligible = workedPolish ? Boolean(province) : Boolean(serial);
        if (!inWindow || !modeEligible || !['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm) || !exchangeEligible) points = 0;
        else if (stationPolish) points = workedPolish ? 0 : (facts.qContinent === 'EU' ? 1 : 3);
        else points = workedPolish ? 3 : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing SP DX timestamp; 2026 contest-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'sp_dx_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 3, 25, 12) && ts < Date.UTC(2026, 3, 26, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const workedPolish = facts.qCountryKey === 'POLAND' || /^(?:3Z|HF|SN|SO|SP|SQ|SR)/.test(facts.call || '');
        const excluded = ['RUSSIA', 'BELARUS', 'BELARUS (EUROPEAN)'].includes(facts.qCountryKey)
          || /^(?:UA|EW)/.test(facts.call || '');
        const poviat = facts.exchangeTokens.find((token) => SPDX_RTTY_POVIATS.has(token)) || '';
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangeEligible = workedPolish ? Boolean(poviat) : Boolean(serial);
        if (!inWindow || !['RTTY', 'RY'].includes(rawMode) || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || excluded || !exchangeEligible || !station.stationCountryKey || !facts.qCountryKey) points = 0;
        else if (facts.sameCountry) points = 2;
        else points = facts.qContinent === station.stationContinent ? 5 : 10;
        if (!Number.isFinite(ts)) assumptions.add('Missing SP DX RTTY timestamp; 2026 contest-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'trc_dx_2025') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2025, 9, 4, 6) && ts < Date.UTC(2025, 9, 5, 18);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const receivedMember = facts.exchangeTokens.some((token) => /^\d+TRC$/.test(token));
        const receivedSerial = facts.exchangeTokens.some((token) => /^\d+(?:TRC)?$/.test(token) && Number.parseInt(token, 10) > 0 && !['59', '599'].includes(token));
        const sentMember = facts.exchangeSentTokens.some((token) => /^\d+TRC$/.test(token));
        const sentSerial = facts.exchangeSentTokens.some((token) => /^\d+(?:TRC)?$/.test(token) && Number.parseInt(token, 10) > 0 && !['59', '599'].includes(token));
        const sentExchangeEligible = station.stationIsTrcMember ? sentMember : sentSerial && !sentMember;
        if (!inWindow || !modeEligible || !['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !station.stationCountryKey || !facts.qCountryKey || !receivedSerial || !sentExchangeEligible) points = 0;
        else if (receivedMember) points = station.stationIsTrcMember ? 1 : 10;
        else points = facts.qContinent === station.stationContinent ? 1 : 2;
        if (!Number.isFinite(ts)) assumptions.add('Missing TRC DX timestamp; 2025 contest-window eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'uba_dx_2026') {
        const ts = Number(q?.ts);
        const rawMode = String(q?.mode || '').toUpperCase();
        const ssbWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 0, 31, 13) && ts < Date.UTC(2026, 1, 1, 13);
        const cwWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 1, 28, 13) && ts < Date.UTC(2026, 2, 1, 13);
        const modeEligible = (cwWindow && rawMode === 'CW') || (ssbWindow && ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode));
        const stationBelgian = station.stationCountryKey === 'BELGIUM' || /^(?:ON|OO|OP|OQ|OR|OS|OT)/.test(station.stationCall || '');
        const workedBelgian = facts.qCountryKey === 'BELGIUM' || /^(?:ON|OO|OP|OQ|OR|OS|OT)/.test(facts.call || '');
        const excluded = ['RUSSIA', 'BELARUS', 'BELARUS (EUROPEAN)'].includes(facts.qCountryKey);
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const section = facts.exchangeTokens.find((token) => UBA_PSK63_SECTIONS.has(token) || token === 'XXX') || '';
        const sentSection = facts.exchangeSentTokens.find((token) => UBA_PSK63_SECTIONS.has(token) || token === 'XXX') || '';
        const exchangeEligible = Boolean(serial) && (!workedBelgian || Boolean(section));
        const sentExchangeEligible = Boolean(sentSerial) && (!stationBelgian || Boolean(sentSection));
        const workedEuDxcc = UBA_EU_DXCC_PREFIXES.has(facts.qPrefixToken) || UBA_EU_DXCC_COUNTRIES.has(facts.qCountryKey);
        if (!modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || excluded || !exchangeEligible || !sentExchangeEligible || !station.stationCountryKey || !facts.qCountryKey) points = 0;
        else if (stationBelgian) points = workedBelgian ? 1 : (workedEuDxcc ? 2 : 3);
        else points = workedBelgian ? 10 : (workedEuDxcc ? 3 : 1);
        if (!Number.isFinite(ts)) assumptions.add('Missing UBA DX timestamp; 2026 CW/SSB event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'ukr_champ_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 2, 7, 17) && ts < Date.UTC(2026, 2, 7, 19);
        const rawMode = String(q?.mode || '').toUpperCase();
        const stationUkrainian = station.stationCountryKey === 'UKRAINE' || /^(?:EM|EN|EO|UR|US|UT|UU|UV|UW|UX|UY|UZ)/.test(station.stationCall || '');
        const workedUkrainian = facts.qCountryKey === 'UKRAINE' || /^(?:EM|EN|EO|UR|US|UT|UU|UV|UW|UX|UY|UZ)/.test(facts.call || '');
        const oblast = facts.exchangeTokens.find((token) => UKR_CHAMP_2026_OBLASTS.has(token)) || '';
        const sentOblast = facts.exchangeSentTokens.find((token) => UKR_CHAMP_2026_OBLASTS.has(token)) || '';
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0) || '';
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0) || '';
        points = inWindow && ['RTTY', 'RY'].includes(rawMode) && ['80M', '40M'].includes(facts.bandNorm)
          && stationUkrainian && workedUkrainian && oblast && sentOblast && serial && sentSerial ? 2 : 0;
        if (!Number.isFinite(ts)) assumptions.add('Missing Ukrainian RTTY Championship timestamp; 2026 round eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'ukeicc_80m_2026_27') {
        const ts = Number(q?.ts);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeGroup = rawMode === 'CW' ? 'CW' : (['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode) ? 'SSB' : '');
        const eventDates = {
          '2026-09-02': 'SSB', '2026-09-30': 'CW', '2026-10-07': 'SSB', '2026-10-28': 'CW',
          '2026-11-04': 'SSB', '2026-11-25': 'CW', '2027-01-06': 'SSB', '2027-01-27': 'CW',
          '2027-02-03': 'SSB', '2027-02-24': 'CW', '2027-03-03': 'SSB', '2027-03-31': 'CW',
          '2027-04-07': 'SSB', '2027-04-28': 'CW'
        };
        const dateKey = Number.isFinite(ts) ? new Date(ts).toISOString().slice(0, 10) : '';
        const eventMode = eventDates[dateKey] || '';
        const dateStart = dateKey ? Date.parse(`${dateKey}T20:00:00Z`) : NaN;
        const inWindow = Number.isFinite(ts) && Number.isFinite(dateStart) && ts >= dateStart && ts < dateStart + 60 * 60 * 1000;
        const sentGrid = firstGrid6Token([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const receivedGrid = firstGrid6Token([q?.grid, ...(facts.exchangeTokens || [])]);
        const bonusCall = facts.call === 'EI5G' || /^G(?:[DGIJMUW])?5GEI$/.test(facts.call || '');
        const distance = Number(q?.distance);
        if (!inWindow || modeGroup !== eventMode || facts.bandNorm !== '80M' || !sentGrid || !receivedGrid || !Number.isFinite(distance) || distance < 0) points = 0;
        else if (bonusCall) points = 15;
        else points = Math.min(10, Math.max(1, Math.ceil(distance / 500)));
        if (!Number.isFinite(ts)) assumptions.add('Missing UKEICC 80 m timestamp; 2026-27 event eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid || !Number.isFinite(distance)) && inWindow) assumptions.add('Missing UKEICC six-character locator or derived distance; the QSO scored zero rather than guessing.');
        if (points > 0 && !bonusCall) assumptions.add('UKEICC Low Power/QRP cross-log multipliers are unavailable in a single Cabrillo log; SH6 reports official base distance points only.');
      } else if (model === 'ukeidx_2026') {
        const ts = Number(q?.ts);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeGroup = rawMode === 'CW' ? 'CW' : (['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode) ? 'SSB' : '');
        const cwWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 3, 25, 12) && ts < Date.UTC(2026, 3, 26, 12);
        const ssbWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 9, 31, 12) && ts < Date.UTC(2026, 10, 1, 12);
        const eventEligible = (cwWindow && modeGroup === 'CW') || (ssbWindow && modeGroup === 'SSB');
        const frequency = Number(q?.freq);
        const frequencyEligible = !Number.isFinite(frequency)
          || (facts.bandNorm === '80M' && (modeGroup === 'CW' ? frequency >= 3.51 && frequency <= 3.56 : (frequency >= 3.6 && frequency <= 3.65) || (frequency >= 3.7 && frequency <= 3.8)))
          || facts.bandNorm === '40M'
          || (facts.bandNorm === '20M' && (modeGroup === 'CW' ? frequency >= 14 && frequency <= 14.06 : frequency >= 14.125 && frequency <= 14.3))
          || facts.bandNorm === '15M' || facts.bandNorm === '10M';
        const stationUkEi = isUkeidxStation(station.stationCall, station.stationCountryKey);
        const workedUkEi = isUkeidxStation(facts.call, facts.qCountryKey);
        const receivedSerial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && !['59', '599'].includes(token));
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && !['59', '599'].includes(token));
        const receivedDistrict = facts.exchangeTokens.find((token) => UKEIDX_2026_DISTRICTS.has(token)) || '';
        const sentDistrict = facts.exchangeSentTokens.find((token) => UKEIDX_2026_DISTRICTS.has(token)) || '';
        const exchangesEligible = receivedSerial !== undefined && sentSerial !== undefined
          && (!workedUkEi || Boolean(receivedDistrict)) && (!stationUkEi || Boolean(sentDistrict));
        if (!eventEligible || !frequencyEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !exchangesEligible || !station.stationContinent || !facts.qContinent) points = 0;
        else {
          const lowBandFactor = ['80M', '40M'].includes(facts.bandNorm) ? 2 : 1;
          let base;
          if (stationUkEi) base = facts.qContinent === 'EU' ? 2 : 4;
          else if (station.stationContinent === 'EU') base = workedUkEi ? 2 : (facts.qContinent === 'EU' ? 1 : 2);
          else base = workedUkEi ? 4 : (facts.qContinent === 'EU' ? 2 : 1);
          const utcHour = Number.isFinite(ts) ? new Date(ts).getUTCHours() : -1;
          const ukNightFactor = stationUkEi && utcHour >= 1 && utcHour < 5 ? 2 : 1;
          points = base * lowBandFactor * ukNightFactor;
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing UK/EI DX timestamp; 2026 event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'rus_ww_digi_2026' || model === 'rus_ww_mm_2026' || model === 'rus_ww_psk_2027') {
        const ts = Number(q?.ts);
        const exactMode = String(q?.submode || q?.raw?.SUBMODE || q?.mode || '').toUpperCase();
        const isDigi = model === 'rus_ww_digi_2026';
        const isMm = model === 'rus_ww_mm_2026';
        const inWindow = Number.isFinite(ts) && (isDigi
          ? ts >= Date.UTC(2026, 9, 3, 12) && ts < Date.UTC(2026, 9, 4, 12)
          : isMm
            ? ts >= Date.UTC(2026, 9, 31, 12) && ts < Date.UTC(2026, 10, 1, 12)
            : ts >= Date.UTC(2027, 1, 20, 12) && ts < Date.UTC(2027, 1, 21, 12));
        const rttyMode = ['RY', 'RTTY', 'RTTY45'].includes(exactMode);
        const psk63Mode = ['PM', 'BPSK63', 'PSK63'].includes(exactMode);
        const pskMode = ['PS', 'BPSK31', 'PSK31', 'PM', 'BPSK63', 'PSK63', 'PO', 'BPSK125', 'PSK125'].includes(exactMode);
        const phoneMode = ['PH', 'SSB', 'USB', 'LSB', 'PHONE'].includes(exactMode);
        const modeEligible = isDigi ? (rttyMode || psk63Mode) : isMm ? (rttyMode || psk63Mode || exactMode === 'CW' || phoneMode) : pskMode;
        const stationRussian = station.stationIsRu || /^(?:RI1AN|R1FJ)/.test(station.stationCall || '');
        const workedRussian = facts.qIsRu || /^(?:RI1AN|R1FJ)/.test(facts.call || '');
        const receivedArea = facts.exchangeTokens.find((token) => RDRC_RUSSIAN_AREAS.has(token)) || '';
        const sentArea = facts.exchangeSentTokens.find((token) => RDRC_RUSSIAN_AREAS.has(token)) || '';
        const receivedSerial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangesEligible = (workedRussian ? Boolean(receivedArea) : Boolean(receivedSerial))
          && (stationRussian ? Boolean(sentArea) : Boolean(sentSerial));
        if (!inWindow || !modeEligible || !['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !exchangesEligible || !station.stationCountryKey || !facts.qCountryKey) points = 0;
        else {
          const base = isDigi && /\/QRP$/.test(facts.call || '') ? 5 : facts.sameCountry ? 1 : facts.sameContinent ? 3 : 5;
          points = base * (['160M', '80M', '40M'].includes(facts.bandNorm) ? 2 : 1);
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing RDRC Russian WW timestamp; edition eligibility could not be established, so the QSO scored zero.');
        if (!modeEligible && ['DG', 'DIG', 'DATA'].includes(exactMode)) assumptions.add('Generic digital mode does not identify the exact RDRC contest submode; the QSO scored zero rather than guessing.');
      } else if (model === 'wia_vhf_2026') {
        const ts = Number(q?.ts);
        const stationIsVk6 = /^(?:V[KIL]6|VK6)/.test(station.stationCall || '');
        const windows = [
          [Date.UTC(2026, 0, 3, stationIsVk6 ? 3 : 1), Date.UTC(2026, 0, 4, stationIsVk6 ? 3 : 1)],
          [Date.UTC(2026, 5, 20, stationIsVk6 ? 3 : 1), Date.UTC(2026, 5, 21, stationIsVk6 ? 3 : 1)],
          [Date.UTC(2026, 8, 19, stationIsVk6 ? 4 : 1), Date.UTC(2026, 8, 20, stationIsVk6 ? 4 : 1)]
        ];
        const inWindow = Number.isFinite(ts) && windows.some(([start, end]) => ts >= start && ts < end);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE', 'AM', 'FM', 'RTTY', 'RY', 'DIG', 'DG', 'DATA', 'FT4', 'FT8'].includes(rawMode);
        const sentGrid = firstGrid6Token([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const receivedGrid = firstGrid6Token([q?.grid, ...(facts.exchangeTokens || [])]);
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const receivedSerial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const distance = Number(q?.distance);
        const factors = { '6M': 1.7, '2M': 1, '70CM': 2.7, '23CM': 3.7, '13CM': 4.4, '9CM': 5.4, '6CM': 6.4, '3CM': 7.4, '1.25CM': 10, '6MM': 10, '4MM': 10, '2.5MM': 10, '2MM': 10, '1MM': 10 };
        const factor = factors[facts.bandNorm];
        if (!inWindow || !modeEligible || !factor || !sentGrid || !receivedGrid || !sentSerial || !receivedSerial
          || sentGrid === receivedGrid || !Number.isFinite(distance) || distance < 0) points = 0;
        else {
          const distanceUnits = ['6M', '2M', '70CM'].includes(facts.bandNorm) && distance > 700
            ? 700 + (distance - 700) / 100 : distance;
          points = Math.ceil(distanceUnits * factor);
        }
        if (!Number.isFinite(ts)) assumptions.add('Missing WIA VHF/UHF timestamp; 2026 field-day eligibility could not be established, so the QSO scored zero.');
        if ((!sentGrid || !receivedGrid || !Number.isFinite(distance)) && inWindow) assumptions.add('Missing WIA VHF/UHF six-character locator or derived distance; the QSO scored zero rather than guessing.');
      } else if (model === 'yo_dx_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 7, 22, 12) && ts < Date.UTC(2026, 7, 23, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const stationRomanian = isRomanianStation(station.stationCall, station.stationCountryKey);
        const workedRomanian = isRomanianStation(facts.call, facts.qCountryKey);
        const workedMm = /\/MM$/.test(facts.call || '');
        const receivedCounty = facts.exchangeTokens.find((token) => YO_DX_COUNTIES.has(token)) || '';
        const sentCounty = facts.exchangeSentTokens.find((token) => YO_DX_COUNTIES.has(token)) || '';
        const receivedSerial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangesEligible = (workedRomanian ? Boolean(receivedCounty) : Boolean(receivedSerial))
          && (stationRomanian ? Boolean(sentCounty) : Boolean(sentSerial));
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !exchangesEligible || !station.stationCountryKey || !facts.qCountryKey) points = 0;
        else if (workedMm) points = 4;
        else if (stationRomanian) points = workedRomanian ? 0 : (facts.qContinent === 'EU' ? 4 : 8);
        else if (workedRomanian) points = 8;
        else if (facts.sameCountry) points = 1;
        else points = facts.sameContinent ? 2 : 4;
        if (!Number.isFinite(ts)) assumptions.add('Missing YO DX timestamp; 2026 event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'yu_dx_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 8, 26, 12) && ts < Date.UTC(2026, 8, 27, 12);
        const rawMode = String(q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const stationSerbian = isSerbianStation(station.stationCall, station.stationCountryKey);
        const workedSerbian = isSerbianStation(facts.call, facts.qCountryKey);
        const receivedCounty = facts.exchangeTokens.find((token) => YU_DX_COUNTIES.has(token)) || '';
        const sentCounty = facts.exchangeSentTokens.find((token) => YU_DX_COUNTIES.has(token)) || '';
        const receivedSerial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangesEligible = (workedSerbian ? Boolean(receivedCounty) : Boolean(receivedSerial))
          && (stationSerbian ? Boolean(sentCounty) : Boolean(sentSerial));
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !exchangesEligible || !station.stationCountryKey || !facts.qCountryKey) points = 0;
        else if (workedSerbian) points = stationSerbian ? 1 : 10;
        else if (facts.sameCountry) points = 1;
        else points = facts.sameContinent ? 2 : 4;
        if (!Number.isFinite(ts)) assumptions.add('Missing YU DX timestamp; 2026 event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'xe_rtty_2026') {
        const ts = Number(q?.ts);
        const inWindow = Number.isFinite(ts) && ts >= Date.UTC(2026, 1, 7, 12) && ts < Date.UTC(2026, 1, 9, 0);
        const exactMode = String(q?.submode || q?.raw?.SUBMODE || q?.mode || '').toUpperCase();
        const modeEligible = ['RTTY', 'RY', 'RTTY45'].includes(exactMode);
        const stationMexican = isMexicanStation(station.stationCall, station.stationCountryKey);
        const workedMexican = isMexicanStation(facts.call, facts.qCountryKey);
        const receivedState = facts.exchangeTokens.find((token) => XE_RTTY_2026_STATES.has(token)) || '';
        const sentState = facts.exchangeSentTokens.find((token) => XE_RTTY_2026_STATES.has(token)) || '';
        const receivedSerial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const sentSerial = facts.exchangeSentTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        const exchangesEligible = (workedMexican ? Boolean(receivedState) : Boolean(receivedSerial))
          && (stationMexican ? Boolean(sentState) : Boolean(sentSerial));
        if (!inWindow || !modeEligible || !['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || !exchangesEligible || !station.stationCountryKey || !facts.qCountryKey) points = 0;
        else if (workedMexican) points = 4;
        else points = facts.sameCountry ? 2 : 3;
        if (!Number.isFinite(ts)) assumptions.add('Missing XE RTTY timestamp; 2026 event eligibility could not be established, so the QSO scored zero.');
      } else if (model === 'by_mode') {
        const rows = Array.isArray(rule?.qso_points?.rules) ? rule.qso_points.rules : [];
        const key = normalizeMode(q?.mode);
        const row = rows.find((r) => normalizeMode(r?.mode) === key) || rows.find((r) => modeKeyForScoring(r?.mode) === facts.modeKey);
        points = Number(row?.points);
      } else if (model === 'fixed') {
        points = Number(rule?.qso_points?.rules?.[0]?.points);
      } else if (model === 'qso_and_qtc_units') {
        points = facts.validQso && q?.isScoringEligible !== false ? 1 : 0;
        if (facts.isQtc && points > 0) qtcCount += 1;
      } else if (model === 'zone_matrix_plus_bonuses') {
        const base = facts.validQso ? (facts.differentContinent && facts.differentCqZone ? 2 : 1) : 0;
        points = base;
        matrixBasePoints += base;
        const bonuses = Array.isArray(rule?.qso_points?.bonuses) ? rule.qso_points.bonuses : [];
        bonuses.forEach((bonus) => {
          if (!evaluateScoringCondition(String(bonus?.when || ''), facts, runtime, assumptions)) return;
          const b = Number(bonus?.points);
          if (!Number.isFinite(b)) return;
          points += b;
          if (String(bonus.when) === 'new_zone_on_band') newZoneBonus += b;
          else newRegionBonus += b;
        });
      } else if (model === 'progressive_per_callsign_plus_geography_bonus') {
        const base = pointsFromConditionRules(rule?.qso_points?.rules, facts, runtime, assumptions);
        const modeCoefficients = rule?.qso_points?.mode_coefficients || {};
        const modeCoeff = Number(modeCoefficients[facts.modeKey] ?? 1);
        points = Number.isFinite(base) ? (base * modeCoeff) : null;
        const bonuses = Array.isArray(rule?.qso_points?.geography_bonus) ? rule.qso_points.geography_bonus : [];
        bonuses.forEach((row) => {
          if (!evaluateScoringCondition(String(row?.when || ''), facts, runtime, assumptions)) return;
          const b = Number(row?.bonus);
          if (!Number.isFinite(b)) return;
          points = (Number.isFinite(points) ? points : 0) + b;
        });
      } else if (model === 'base_points_with_band_and_mode_coefficients') {
        const base = pointsFromConditionRules(rule?.qso_points?.base_rules, facts, runtime, assumptions);
        const bandCoeff = lookupBandCoefficient(rule?.qso_points?.band_coefficients, facts.bandNorm);
        const modeCoeffs = rule?.qso_points?.mode_coefficients || {};
        const modeCoeff = Number(modeCoeffs[facts.modeKey] ?? 1);
        points = Number.isFinite(base) ? (base * bandCoeff * modeCoeff) : null;
      }
      const excludedBands = new Set((rule?.qso_points?.excluded_bands || []).map((band) => String(band).toUpperCase()));
      const excludedModes = new Set((rule?.qso_points?.excluded_modes || []).map((mode) => String(mode).toUpperCase()));
      const eligibleBands = new Set((rule?.qso_points?.eligible_bands || []).map((band) => String(band).toUpperCase()));
      const eligibleModes = new Set((rule?.qso_points?.eligible_modes || []).map((mode) => String(mode).toUpperCase()));
      const eligibleModeGroups = new Set((rule?.qso_points?.eligible_mode_groups || []).map((mode) => String(mode).toUpperCase()));
      const rawMode = String(q?.mode || '').toUpperCase();
      const requiredExchangePattern = String(rule?.qso_points?.required_received_exchange_pattern || '');
      let receivedExchangePatternEligible = true;
      if (requiredExchangePattern) {
        try {
          receivedExchangePatternEligible = new RegExp(requiredExchangePattern).test(facts.exchangePrimary);
        } catch (err) {
          receivedExchangePatternEligible = false;
          assumptions.add(`Invalid received-exchange validation pattern for ${rule?.name || rule?.id || 'contest'}; scored zero rather than guessing.`);
        }
      }
      const frequencyRanges = rule?.qso_points?.eligible_frequency_ranges_mhz;
      const bandFrequencyRange = frequencyRanges && typeof frequencyRanges === 'object'
        ? frequencyRanges[facts.bandNorm]
        : null;
      let frequencyEligible = true;
      if (Array.isArray(bandFrequencyRange) && bandFrequencyRange.length >= 2) {
        const frequency = Number.isFinite(q?.freq) ? Number(q.freq) : NaN;
        const min = Number(bandFrequencyRange[0]);
        const max = Number(bandFrequencyRange[1]);
        frequencyEligible = Number.isFinite(frequency) && Number.isFinite(min) && Number.isFinite(max)
          && frequency >= min && frequency <= max;
        if (!Number.isFinite(frequency)) assumptions.add(`Missing exact frequency for ${rule?.name || rule?.id || 'contest'} QSO; scored zero rather than guessing.`);
      }
      const frequencySegments = rule?.qso_points?.eligible_frequency_segments_mhz;
      const bandFrequencySegments = frequencySegments && typeof frequencySegments === 'object'
        ? frequencySegments[facts.bandNorm]
        : null;
      if (Array.isArray(bandFrequencySegments) && bandFrequencySegments.length) {
        const frequency = Number.isFinite(q?.freq) ? Number(q.freq) : NaN;
        frequencyEligible = Number.isFinite(frequency) && bandFrequencySegments.some((segment) => (
          Array.isArray(segment) && segment.length >= 2
          && frequency >= Number(segment[0]) && frequency <= Number(segment[1])
        ));
        if (!Number.isFinite(frequency)) assumptions.add(`Missing exact frequency for ${rule?.name || rule?.id || 'contest'} QSO; scored zero rather than guessing.`);
      }
      const excludedFrequencyRanges = Array.isArray(rule?.qso_points?.excluded_frequency_ranges_mhz)
        ? rule.qso_points.excluded_frequency_ranges_mhz
        : [];
      const frequency = Number.isFinite(q?.freq) ? Number(q.freq) : NaN;
      const inExcludedFrequencyRange = Number.isFinite(frequency) && excludedFrequencyRanges.some((range) => (
        Array.isArray(range) && range.length >= 2 && frequency >= Number(range[0]) && frequency <= Number(range[1])
      ));
      if (excludedBands.has(facts.bandNorm)
        || excludedModes.has(rawMode)
        || (eligibleBands.size && !eligibleBands.has(facts.bandNorm))
        || (eligibleModes.size && !eligibleModes.has(rawMode))
        || (eligibleModeGroups.size && !eligibleModeGroups.has(facts.modeKey))
        || !scoringTimeEligibleByIndex[idx]
        || !receivedExchangePatternEligible
        || (rule?.qso_points?.require_received_exchange === true && !facts.hasExchangeTokens)
        || !frequencyEligible
        || inExcludedFrequencyRange
        || (rule?.qso_points?.exclude_satellite && facts.isSatellite)) {
        points = 0;
      }
      if (!Number.isFinite(points)) {
        if (!model) assumptions.add('Missing qso_points.model, using logged points fallback.');
        else assumptions.add(`Scoring model fallback used for ${model}.`);
        points = Number.isFinite(q?.points) ? q.points : 0;
      }
      pointsByIndex[idx] = points;
      if (String(rule?.id || '') === 'uba_dx_2026' && points > 0) {
        const workedBelgian = facts.qCountryKey === 'BELGIUM' || /^(?:ON|OO|OP|OQ|OR|OS|OT)/.test(facts.call || '');
        ubaValidQsoCount += 1;
        if (workedBelgian) {
          ubaBelgianQsoCount += 1;
          ubaBelgianQsoPoints += points;
        }
      }
      qsoPointsTotal += points;
      weightedQsoPointsTotal += points;
      if (!facts.isQtc && facts.validQso) qsoCount += 1;
      if (!facts.isQtc && facts.validQso && points > 0) positiveQsoCount += 1;
      modePoints[facts.modeKey] = (modePoints[facts.modeKey] || 0) + points;
      const bandKey = facts.bandNorm || 'UNKNOWN';
      bandPoints[bandKey] = (bandPoints[bandKey] || 0) + points;
      if (String(rule?.id || '') === 'sarl_hf_2026' && points > 0 && facts.call) {
        const bands = sarlHfBandsByCall.get(facts.call) || new Set();
        bands.add(facts.bandNorm);
        sarlHfBandsByCall.set(facts.call, bands);
      }
      if (String(rule?.id || '') === 'avhfc_legacy' && points > 0) {
        const sent = avhfcLocator([q?.myGrid, q?.raw?.MY_GRIDSQUARE, ...(facts.exchangeSentTokens || [])]);
        const received = avhfcLocator([q?.grid, ...(facts.exchangeTokens || [])]);
        if (sent && received) {
          if (sent === received) avhfcDistanceBonus += 1;
          else if (Number.isFinite(Number(q?.distance)) && Number(q.distance) >= 0) avhfcDistanceBonus += Math.floor(Number(q.distance));
          else assumptions.add('Missing locator distance for an AVHFC compatibility QSO; its distance bonus was scored zero rather than guessed.');
        }
      }
      if (String(rule?.id || '') === 'aegean_vhf_legacy' && !facts.isQtc) {
        bandQsoCounts[bandKey] = (bandQsoCounts[bandKey] || 0) + 1;
      }
      markScoringRuntime(facts, runtime);
    });
    return {
      pointsByIndex,
      duplicateByIndex,
      qsoPointsTotal,
      weightedQsoPointsTotal,
      qsoCount,
      positiveQsoCount,
      qtcCount,
      modePoints,
      uniqueCallCount: uniqueCalls.size,
      matrixBasePoints,
      newZoneBonus,
      newRegionBonus
      ,
      bandPoints,
      bandQsoCounts,
      avhfcDistanceBonus,
      ubaBelgianQsoCount,
      ubaBelgianQsoPoints,
      ubaValidQsoCount,
      sarlHfTriBandBonus: [...sarlHfBandsByCall.values()].filter((bands) => bands.size >= 3).length * 2
    };
  }

  function getMultiplierValue(group, facts, station, runtime, assumptions) {
    switch (group) {
      case 'country':
      case 'country_for_ru_entries':
      case 'dxcc_country':
      case 'dxcc_entities_for_french_entries':
      case 'dl_station_uses_country_entities':
      case 'wae_country_or_dxcc_set_by_station_region':
        return facts.qCountryKey || '';
      case 'dxcc_country_excluding_iaru_hq':
        return facts.isIaruHqOrOfficial ? '' : (facts.qCountryKey || '');
      case 'cq_zone':
        return facts.qCqZone != null ? String(facts.qCqZone) : '';
      case 'cq_zone_except_own':
        if (facts.qCqZone == null || station.stationCqZone == null) return '';
        return Number(facts.qCqZone) === Number(station.stationCqZone) ? '' : String(facts.qCqZone);
      case 'itu_zone':
        return facts.qItuZone != null ? String(facts.qItuZone) : '';
      case 'itu_zone_excluding_iaru_hq':
        return facts.isIaruHqOrOfficial || facts.qItuZone == null ? '' : String(facts.qItuZone);
      case 'itu_zone_plus_locator_sector': {
        const grid = String(facts.q?.grid || '').slice(0, 2).toUpperCase();
        return facts.qItuZone != null ? `${facts.qItuZone}|${grid}` : '';
      }
      case 'w_ve_qth':
      case 'us_states_dc':
      case 've_provinces_areas':
        return facts.exchangeWVeQth || '';
      case 'wpx_prefix':
        return facts.wpx || '';
      case 'prefix_within_zone':
        return (facts.wpx && facts.qCqZone != null) ? `${facts.wpx}|${facts.qCqZone}` : '';
      case 'ok_district':
      case 'om_district':
      case 'non_dl_station_uses_dok_districts':
        return facts.exchangeDok || '';
      case 'rda_district':
      case 'russian_oblast':
        return facts.exchangeRda || '';
      case 'rcc_number':
        return facts.exchangeRccNumber || '';
      case 'rrtc_team_code':
        return facts.exchangeTeamCode || '';
      case 'iaru_hq_or_official':
        return facts.isIaruHqOrOfficial ? (facts.exchangePrimary || '') : '';
      case 'special_station_abbreviation':
      case 'departments_and_special_prefixes':
        return facts.exchangeRefDepartment || facts.exchangeRegion || facts.exchangePrimary || '';
      case 'eu_region_code':
        return facts.exchangeEuRegion || '';
      case 'unique_year_number_exchange':
        return facts.exchangeYear || facts.exchangeSerial || facts.exchangeSentSerial || '';
      case 'unique_callsign':
        return facts.call || '';
      case 'sent_received_grid_path4': {
        const received = receivedGrid4(facts);
        if (!received) return '';
        const sent = sentGrid4(facts);
        return sent ? `${sent}|${received}` : received;
      }
      case 'grid_field2':
        return receivedGrid4(facts).slice(0, 2);
      case 'aegean_vhf_grid4':
        return receivedGrid4(facts);
      case 'africa_dx_entity':
        if (facts.qContinent !== 'AF' || /\/(?:AM|MM)$/.test(facts.call || '')) return '';
        return facts.qCountryKey || '';
      case 'agb_member_number': {
        const q = facts.q || {};
        const exchange = String(firstNonNull(q.exchRcvd, q.srx, q.raw?.SRX_STRING, q.raw?.EXCH_RCVD) || '').trim().toUpperCase();
        return exchange.match(/(?:A|\/A?|-A?)(\d{1,4})$/)?.[1] || '';
      }
      case 'ap_sprint_wpx':
        return facts.wpx || '';
      case 'ari_section_asc': {
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        return /^[A-HJ-NP-Z]\d{2}$/.test(exchange) ? exchange : '';
      }
      case 'avhfc_locator':
        return avhfcLocator([facts.q?.grid, ...(facts.exchangeTokens || [])]);
      case 'basso_ferrarese_jolly': {
        const jollyCalls = new Set(['IQ4FF', 'I4JEE', 'IZ4OSH', 'IK4RDP', 'IZ4ISC', 'IZ4SJI']);
        if (!jollyCalls.has(facts.call) || !['40M', '20M'].includes(facts.bandNorm)) return '';
        return `${facts.call}|${facts.q?.qsoNumber || facts.seenCount}`;
      }
      case 'cqp_location': {
        const qths = cqpExchangeQths(facts.exchangeTokens);
        const rawMode = String(facts.q?.mode || '').toUpperCase();
        const modeEligible = rawMode === 'CW' || ['SSB', 'PH', 'PHONE', 'USB', 'LSB'].includes(rawMode);
        const serialValid = facts.exchangeTokens.some((token) => /^\d+$/.test(String(token || '')));
        if (!serialValid || !modeEligible || !['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)) return [];
        if (station.stationIsCqpCalifornia) {
          if (qths.some((value) => CQP_COUNTIES.has(value))) return ['CA'];
          return qths.filter((value) => CQP_STATE_CODES.has(value) || VE_AREA_CODES.has(value));
        }
        return qths.filter((value) => CQP_COUNTIES.has(value));
      }
      case 'cis_qpsk63_exchange': {
        const exchange = String(facts.exchangePrimary || '').trim();
        return facts.bandNorm === 'OTHER' || isRecoveredCisMobile(facts.call) || !exchange || exchange.includes('0000')
          ? '' : exchange;
      }
      case 'cq_m_r150_territory':
        if (facts.isMaritime) return '';
        return cqMRussianTerritory(facts.call, facts.qCountryKey);
      case 'cqmm_dx_mixed': {
        const values = [];
        if (facts.qCountryKey) values.push(`DXCC:${facts.qCountryKey}`);
        if (facts.qContinent === 'SA' && facts.wpx) values.push(`SA-WPX:${facts.bandNorm}:${facts.wpx}`);
        return values;
      }
      case 'dig_qso_party_mixed': {
        const values = [];
        const member = Number.parseInt(String(facts.exchangePrimary || ''), 10);
        if (Number.isFinite(member) && member > 0) values.push(`DIG:${member}`);
        if (facts.qCountryKey) values.push(`DXCC:${facts.bandNorm}:${facts.qCountryKey}`);
        return values;
      }
      case 'darc_xmas_mixed': {
        const values = [];
        if (facts.wpx) values.push(`WPX:${facts.wpx}`);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        if (facts.qIsDl && /^[A-Z]\d{2}$/.test(exchange)) values.push(`DOK:${exchange}`);
        return values;
      }
      case 'eu_psk_dx_mixed': {
        if (facts.isMaritime) return [];
        const values = facts.qCountryKey ? [`DXCC:${facts.qCountryKey}`] : [];
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        if (facts.qIsEu && /^[A-Z]{4,8}$/.test(exchange)) values.push(`EUAREA:${exchange}`);
        return values;
      }
      case 'es_open_call_area': {
        if (!isCountryEs(facts.qCountry, facts.call)) return '';
        const worked = String(facts.call || '').match(/^ES([0-9])/i)?.[1] || '';
        const own = String(station.stationCall || '').match(/^ES([0-9])/i)?.[1] || '';
        return worked && worked !== own ? `ES${worked}` : '';
      }
      case 'hsc_dxcc':
        return facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '';
      case 'inorc_member_call':
        return /^[A-Z]+\d+$/.test(String(facts.exchangePrimary || '').toUpperCase()) ? facts.call : '';
      case 'kcj_prefecture_or_zone': {
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const stationJa = isCountryJa(station.stationCountry);
        if (facts.qIsJa) return KCJ_PREFECTURE_CODES.has(exchange) ? `PREF:${exchange}` : '';
        return stationJa && /^\d{1,2}$/.test(exchange) && Number(exchange) >= 1 && Number(exchange) <= 40
          ? `CQZ:${Number(exchange)}` : '';
      }
      case 'iota_reference':
        return facts.exchangeIota || '';
      case 'marconi_memorial_dxcc':
        return facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '';
      case 'gdbage_indonesian_wpx':
        return /^(?:Y[B-H]|7[A-I]|8[A-I]|P[K-O]|JZ)/.test(facts.call) ? (facts.wpx || '') : '';
      case 'lz_dx_mixed': {
        const stationLz = /^(?:BULGARIA|LZ)$/.test(station.stationCountryKey) || /^LZ/.test(station.stationCall || '');
        const workedLz = /^(?:BULGARIA|LZ)$/.test(facts.qCountryKey) || /^LZ/.test(facts.call);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        if (workedLz) return LZ_DX_DISTRICTS.has(exchange) ? `DISTRICT:${exchange}` : [];
        if (!/^\d{1,2}$/.test(exchange) || Number(exchange) < 1 || Number(exchange) > 90) return [];
        const values = [`ITU:${Number(exchange)}`];
        if (stationLz && facts.qCountryKey) values.push(`DXCC:${facts.qCountryKey}`);
        return values;
      }
      case 'nyqp_location': {
        const tokens = facts.exchangeTokens.map((token) => String(token || '').toUpperCase());
        const county = tokens.find((token) => NYQP_COUNTIES.has(token)) || '';
        if (!station.stationIsNyqpNy) return county ? `COUNTY:${county}` : [];
        if (county) return [`COUNTY:${county}`, 'STATE:NY'];
        const location = tokens.find((token) => CQP_STATE_CODES.has(token) || VE_AREA_CODES.has(token)) || '';
        return location ? `${CQP_STATE_CODES.has(location) ? 'STATE' : 'PROVINCE'}:${location}` : [];
      }
      case 'ok_dx_rtty_mixed': {
        if (!facts.qCountryKey) return [];
        const values = [`DXCC:${facts.qCountryKey}`];
        const stationOk = hasCountryToken(station.stationCountry, ['CZECH REPUBLIC', 'CZECHIA']) || /^(?:OK|OL)/.test(station.stationCall || '');
        const workedOk = hasCountryToken(facts.qCountry, ['CZECH REPUBLIC', 'CZECHIA']) || /^(?:OK|OL)/.test(facts.call);
        if (!stationOk && workedOk) values.push(`OKCALL:${facts.call}`);
        return values;
      }
      case 'portugal_day_weighted': {
        const values = facts.qCountryKey ? [`DXCC:${facts.qCountryKey}`] : [];
        const workedPt = hasCountryToken(facts.qCountry, ['PORTUGAL', 'AZORES', 'MADEIRA'])
          || /^(?:CQ|CR|CS|CT|CU)/.test(facts.call);
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        if (workedPt && PORTUGAL_DAY_AREAS.has(exchange)) {
          for (let weight = 1; weight <= 5; weight += 1) values.push(`PTAREA:${exchange}:${weight}`);
        }
        return values;
      }
      case 'pears_grid4':
        return receivedGrid4(facts);
      case 'russian_160m_entity':
        return facts.qCountryKey || '';
      case 'russian_160m_oblast': {
        const region = String(firstNonNull(facts.q?.region, facts.q?.state, facts.q?.raw?.STATE) || '').trim().toUpperCase();
        return /^(?:RUSSIA|KALININGRAD)/.test(String(facts.qCountryKey || '')) && /^[A-Z]{2}$/.test(region) ? region : '';
      }
      case 'russian_ww_rtty_entity':
        return /\/MM$/.test(facts.call || '') ? '' : (facts.qCountryKey || '');
      case 'russian_ww_rtty_oblast': {
        if (/\/MM$/.test(facts.call || '')) return '';
        const workedRussian = facts.qIsRu || /^(?:RI1FJ|RI1AN)/.test(facts.call || '');
        return workedRussian ? (facts.exchangeTokens.find((token) => /^[A-Z]{2}$/.test(token)) || '') : '';
      }
      case 'international_naval_member':
        return facts.exchangeTokens.some((token) => /^(?:CA|FN|IN|MA|MF|MI|RN|YO|PN|GR)\d+$/i.test(token)) ? facts.call : '';
      case 'rsgb_160m_bonus': {
        const workedUk = hasCountryToken(facts.qCountry, ['ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN IRELAND', 'GUERNSEY', 'JERSEY', 'ISLE OF MAN', 'UNITED KINGDOM']);
        const district = facts.exchangeTokens.find((token) => /^[A-Z]{2}$/.test(token));
        const identity = workedUk ? (district ? `DISTRICT:${district}` : '') : (facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '');
        return identity ? [1, 2, 3, 4, 5].map((n) => `${identity}|BONUS${n}`) : [];
      }
      case 'ukeidx_dxcc_or_district': {
        const workedUkEi = isUkeidxStation(facts.call, facts.qCountryKey);
        if (workedUkEi) {
          const district = facts.exchangeTokens.find((token) => UKEIDX_2026_DISTRICTS.has(token)) || '';
          return district ? `DISTRICT:${district}` : '';
        }
        return facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '';
      }
      case 'rdrc_rus_ww_dxcc_and_area': {
        const exactMode = String(facts.q?.submode || facts.q?.raw?.SUBMODE || facts.q?.mode || '').toUpperCase();
        let mode = '';
        if (['RY', 'RTTY', 'RTTY45'].includes(exactMode)) mode = 'RY';
        else if (['PM', 'BPSK63', 'PSK63'].includes(exactMode)) mode = 'PM';
        else if (['PS', 'BPSK31', 'PSK31'].includes(exactMode)) mode = 'PS';
        else if (['PO', 'BPSK125', 'PSK125'].includes(exactMode)) mode = 'PO';
        else if (exactMode === 'CW') mode = 'CW';
        else if (['PH', 'SSB', 'USB', 'LSB', 'PHONE'].includes(exactMode)) mode = 'PH';
        const modePrefix = runtime.ruleId === 'rus_ww_psk_2027' ? '' : `${mode}:`;
        const values = facts.qCountryKey ? [`${modePrefix}DXCC:${facts.qCountryKey}`] : [];
        const workedRussian = facts.qIsRu || /^(?:RI1AN|R1FJ)/.test(facts.call || '');
        const area = facts.exchangeTokens.find((token) => RDRC_RUSSIAN_AREAS.has(token)) || '';
        if (workedRussian && area) values.push(`${modePrefix}AREA:${area}`);
        return values;
      }
      case 'yo_dx_dxcc': {
        if (/\/MM$/.test(facts.call || '') || !facts.qCountryKey) return '';
        const stationRomanian = isRomanianStation(station.stationCall, station.stationCountryKey);
        const workedRomanian = isRomanianStation(facts.call, facts.qCountryKey);
        return stationRomanian && workedRomanian ? '' : facts.qCountryKey;
      }
      case 'yo_dx_county': {
        if (isRomanianStation(station.stationCall, station.stationCountryKey)
          || !isRomanianStation(facts.call, facts.qCountryKey) || /\/MM$/.test(facts.call || '')) return '';
        return facts.exchangeTokens.find((token) => YO_DX_COUNTIES.has(token)) || '';
      }
      case 'yu_dx_dxcc': {
        if (!facts.qCountryKey) return '';
        return isSerbianStation(station.stationCall, station.stationCountryKey) && isSerbianStation(facts.call, facts.qCountryKey)
          ? '' : facts.qCountryKey;
      }
      case 'yu_dx_county': {
        if (isSerbianStation(station.stationCall, station.stationCountryKey)
          || !isSerbianStation(facts.call, facts.qCountryKey)) return '';
        return facts.exchangeTokens.find((token) => YU_DX_COUNTIES.has(token)) || '';
      }
      case 'xe_rtty_state_or_dxcc': {
        if (isMexicanStation(facts.call, facts.qCountryKey)) {
          const state = facts.exchangeTokens.find((token) => XE_RTTY_2026_STATES.has(token)) || '';
          return state ? `STATE:${state}` : '';
        }
        return facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '';
      }
      case 'rsgb_field_day_dxcc': {
        const ts = Number(facts.q?.ts);
        const cwEvent = runtime?.ruleId === 'rsgb_nfd_2026';
        const inWindow = Number.isFinite(ts) && (cwEvent
          ? ts >= Date.UTC(2026, 5, 6, 15) && ts < Date.UTC(2026, 5, 7, 15)
          : ts >= Date.UTC(2026, 8, 5, 13) && ts < Date.UTC(2026, 8, 6, 13));
        const rawMode = String(facts.q?.mode || '').toUpperCase();
        const modeEligible = cwEvent ? rawMode === 'CW' : ['SSB', 'USB', 'LSB', 'PH', 'PHONE'].includes(rawMode);
        const bands = cwEvent ? ['160M', '80M', '40M', '20M', '15M', '10M'] : ['80M', '40M', '20M', '15M', '10M'];
        const serial = facts.exchangeTokens.find((token) => /^\d+$/.test(token) && Number(token) > 0 && !['59', '599'].includes(token));
        return inWindow && modeEligible && bands.includes(facts.bandNorm) && serial ? (facts.qCountryKey || '') : '';
      }
      case 'sac_multiplier': {
        const stationScandinavian = sacIsScandinavian(station.stationCall, station.stationCountryKey);
        if (stationScandinavian) return sacIsScandinavian(facts.call, facts.qCountryKey) ? '' : (facts.qCountryKey || '');
        return sacScandinavianArea(facts.call, facts.qCountryKey);
      }
      case 'sarl_hf_area':
        return sarlHfArea(facts.call);
      case 'sarl_vhf_grid':
        return receivedGrid4(facts);
      case 'sartg_entity_and_call_area': {
        const values = facts.qCountryKey ? [`DXCC:${facts.qCountryKey}`] : [];
        const area = sartgCallArea(facts.call, facts.qCountryKey);
        if (area) values.push(`AREA:${area}`);
        return values;
      }
      case 'volta_multipliers': {
        const area = voltaCallArea(facts.call, facts.qCountryKey);
        const identity = area ? `AREA:${area}` : (facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '');
        if (!identity) return [];
        const values = [`BAND:${facts.bandNorm}:${identity}`];
        if (facts.differentContinent) {
          const key = `volta-four-band:${identity}`;
          const bands = runtime[key] || new Set();
          const before = bands.size;
          bands.add(facts.bandNorm);
          runtime[key] = bands;
          if (before < 4 && bands.size === 4) values.push(`FOUR-BAND:${identity}`);
        }
        return values;
      }
      case 'uba_psk63_prefix_and_section': {
        const values = facts.wpx ? [`WPX:${facts.wpx}`] : [];
        const workedBelgian = facts.qCountryKey === 'BELGIUM' || /^O[N-T]|^ON\//.test(facts.call || '');
        const section = facts.exchangeTokens.find((token) => UBA_PSK63_SECTIONS.has(token)) || '';
        if (workedBelgian && section) values.push(`UBA:${section}`);
        return values;
      }
      case 'uksmg_dxcc':
        return facts.qCountryKey || '';
      case 'uksmg_grid':
        return firstGrid6Token([facts.q?.grid, ...(facts.exchangeTokens || [])]);
      case 'uksmg_member': {
        const gridIndex = facts.exchangeTokens.findIndex((token) => /^[A-R]{2}\d{2}(?:[A-X]{2})?$/.test(token));
        if (gridIndex < 0) return '';
        const member = facts.exchangeTokens.slice(gridIndex + 1).find((token) => /^\d+$/.test(token) && Number(token) > 0);
        return member ? String(Number(member)) : '';
      }
      case 'uksmg_committee':
        return UKSMG_2027_COMMITTEE_CALLS.has(facts.call) ? facts.call : '';
      case 'sp_dx_multiplier': {
        const stationPolish = station.stationCountryKey === 'POLAND' || /^(?:3Z|HF|SN|SO|SP|SQ)/.test(station.stationCall || '');
        const workedPolish = facts.qCountryKey === 'POLAND' || /^(?:3Z|HF|SN|SO|SP|SQ)/.test(facts.call || '');
        if (stationPolish) return workedPolish ? '' : (facts.qCountryKey || '');
        return workedPolish ? (facts.exchangeTokens.find((token) => SP_DX_PROVINCES.has(token)) || '') : '';
      }
      case 'sp_dx_rtty_country':
        return facts.qCountryKey && !['RUSSIA', 'BELARUS', 'BELARUS (EUROPEAN)'].includes(facts.qCountryKey)
          && !/^(?:UA|EW)/.test(facts.call || '') ? `BAND:${facts.bandNorm}:DXCC:${facts.qCountryKey}` : '';
      case 'sp_dx_rtty_poviat': {
        const workedPolish = facts.qCountryKey === 'POLAND' || /^(?:3Z|HF|SN|SO|SP|SQ|SR)/.test(facts.call || '');
        const poviat = facts.exchangeTokens.find((token) => SPDX_RTTY_POVIATS.has(token)) || '';
        return workedPolish && poviat ? `BAND:${facts.bandNorm}:POVIAT:${poviat}` : '';
      }
      case 'sp_dx_rtty_continent':
        return ['AF', 'AS', 'EU', 'NA', 'OC', 'SA'].includes(facts.qContinent) ? facts.qContinent : '';
      case 'trc_dx_dxcc':
        return facts.qCountryKey || '';
      case 'trc_dx_member_dxcc':
        return facts.exchangeTokens.some((token) => /^\d+TRC$/.test(token)) ? (facts.qCountryKey || '') : '';
      case 'uba_dx_multiplier': {
        const stationBelgian = station.stationCountryKey === 'BELGIUM' || /^(?:ON|OO|OP|OQ|OR|OS|OT)/.test(station.stationCall || '');
        if (stationBelgian) return facts.qCountryKey || '';
        const workedBelgian = facts.qCountryKey === 'BELGIUM' || /^(?:ON|OO|OP|OQ|OR|OS|OT)/.test(facts.call || '');
        const values = [];
        if (workedBelgian) {
          const section = facts.exchangeTokens.find((token) => UBA_PSK63_SECTIONS.has(token)) || '';
          if (section) values.push(`UBA:${section}`);
          if (facts.wpx) values.push(`PREFIX:${facts.wpx}`);
        }
        if (UBA_EU_DXCC_PREFIXES.has(facts.qPrefixToken) || UBA_EU_DXCC_COUNTRIES.has(facts.qCountryKey)) {
          values.push(`EU:${facts.qCountryKey || facts.qPrefixToken}`);
        }
        return values;
      }
      case 'ukr_champ_2026_oblast': {
        const ts = Number(facts.q?.ts);
        const round = Number.isFinite(ts) ? Math.floor((ts - Date.UTC(2026, 2, 7, 17)) / (30 * 60 * 1000)) + 1 : 0;
        const oblast = facts.exchangeTokens.find((token) => UKR_CHAMP_2026_OBLASTS.has(token)) || '';
        return round >= 1 && round <= 4 && oblast ? `ROUND:${round}|BAND:${facts.bandNorm}|OBLAST:${oblast}` : '';
      }
      case 'un_dx_entity_and_kda': {
        const values = facts.qCountryKey ? [`DXCC:${facts.qCountryKey}`] : [];
        const workedKazakhstan = facts.qCountryKey === 'KAZAKHSTAN' || /^UN/.test(facts.call || '');
        const kda = facts.exchangeTokens.find((token) => /^[A-Z]\d{2}$/.test(token));
        if (workedKazakhstan && kda) values.push(`KDA:${kda}`);
        return values;
      }
      case 'aadx_entity_or_asian_wpx':
        if (facts.isMaritime) return '';
        if (station.stationContinent === 'AS') return facts.qCountryKey || '';
        return facts.qContinent === 'AS' ? (facts.wpx || '') : '';
      case 'bartg_dxcc_country':
        return facts.qCountryKey || '';
      case 'bartg_call_area': {
        const prefix = bartgCallAreaPrefix(facts.qCountry);
        const digit = String(facts.wpx || facts.call || '').match(/\d/)?.[0] || '';
        return prefix && digit ? `${prefix}${digit}` : '';
      }
      case 'bartg_continent':
        return facts.qContinent || '';
      case 'jarl_rtty_entity_or_call_area': {
        if (facts.isMaritime) return '';
        return jarlRttyCallArea(facts.call, facts.qCountry) || facts.qCountryKey || '';
      }
      case 'jidx_dxcc_for_ja':
        if (!station.stationIsJa || facts.isMaritime || facts.qIsJa) return '';
        return facts.qCountryKey || '';
      case 'jidx_cq_zone_for_ja': {
        if (!station.stationIsJa) return '';
        const zone = Number.parseInt(facts.exchangePrimary, 10);
        return Number.isFinite(zone) && zone >= 1 && zone <= 40 ? String(zone) : '';
      }
      case 'jidx_prefecture_for_dx': {
        if (station.stationIsJa || !facts.qIsJa) return '';
        const prefecture = Number.parseInt(facts.exchangePrimary, 10);
        return Number.isFinite(prefecture) && prefecture >= 1 && prefecture <= 50
          ? String(prefecture).padStart(2, '0') : '';
      }
      case 'gacw_cq_zone': {
        if (!['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || facts.modeKey !== 'CW' || facts.isMaritime || /\/M$/i.test(facts.call || '')) return '';
        const zone = Number.parseInt(facts.exchangePrimary, 10);
        return Number.isFinite(zone) && zone >= 1 && zone <= 40 ? String(zone) : '';
      }
      case 'gacw_dxcc_entity':
        if (!['160M', '80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)
          || facts.modeKey !== 'CW' || facts.isMaritime || /\/M$/i.test(facts.call || '')) return '';
        return facts.qCountryKey || '';
      case 'ha_dx_county_or_country': {
        if (/\/(?:AM|MM)$/.test(facts.call || '')) return '';
        const workedHungarian = facts.qCountryKey === 'HUNGARY' || /^(?:HA|HG)/.test(facts.call || '');
        if (!workedHungarian) return facts.qCountryKey || '';
        const counties = new Set(['BA', 'BE', 'BN', 'BO', 'BP', 'CS', 'FE', 'GY', 'HB', 'HE', 'SZ', 'KO', 'NG', 'PE', 'SO', 'SA', 'TO', 'VA', 'VE', 'ZA']);
        const county = String(facts.exchangePrimary || '').toUpperCase();
        return counties.has(county) ? county : '';
      }
      case 'helvetia_canton': {
        if (facts.qCountryKey !== 'SWITZERLAND') return '';
        const cantons = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);
        const canton = String(facts.exchangePrimary || '').toUpperCase();
        return cantons.has(canton) ? canton : '';
      }
      case 'helvetia_dxcc_country': {
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        if (facts.qCountryKey === 'SWITZERLAND') {
          const cantons = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);
          return cantons.has(exchange) ? facts.qCountryKey : '';
        }
        return /^\d{3,}$/.test(exchange) ? (facts.qCountryKey || '') : '';
      }
      case 'holyland_area': {
        if (/\/MM$/.test(facts.call || '')) return '';
        const workedIsraeli = facts.qCountryKey === 'ISRAEL' || /^(?:4X|4Z)/.test(facts.call || '');
        const area = String(facts.exchangePrimary || '').toUpperCase();
        return workedIsraeli && /^[A-Z]\d{2}[A-Z]{2}$/.test(area) ? area : '';
      }
      case 'holyland_dxcc_country': {
        if (/\/MM$/.test(facts.call || '')) return '';
        const workedIsraeli = facts.qCountryKey === 'ISRAEL' || /^(?:4X|4Z)/.test(facts.call || '');
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const validExchange = workedIsraeli ? /^[A-Z]\d{2}[A-Z]{2}$/.test(exchange) : /^\d{3,}$/.test(exchange);
        return validExchange ? (facts.qCountryKey || '') : '';
      }
      case 'naqp_location': {
        if (!facts.qIsNaqpNa || /\/(?:MM|AM)$/.test(facts.call || '')) return '';
        const qth = String(facts.exchangeTokens.at(-1) || '').toUpperCase();
        if (['UNITED STATES', 'ALASKA', 'HAWAII'].includes(facts.qCountryKey)) return US_STATE_CODES.has(qth) ? qth : '';
        if (facts.qCountryKey === 'CANADA') return VE_AREA_CODES.has(qth) ? qth : '';
        return qth && qth !== 'DX' ? (facts.qCountryKey || qth) : '';
      }
      case 'rac_canadian_province': {
        const canadian = facts.qCountryKey === 'CANADA' || /^(?:VA|VE|VO|VY)/.test(facts.call || '');
        if (!canadian || /^VE0/.test(facts.call || '')) return '';
        const province = String(facts.exchangePrimary || '').toUpperCase();
        return VE_AREA_CODES.has(province) ? province : '';
      }
      case 'pacc_province_or_entity': {
        if (!station.stationIsPaccDutch) {
          if (!facts.qIsPaccDutch) return '';
          const province = String(facts.exchangePrimary || '').toUpperCase();
          return ['DR', 'FL', 'FR', 'GD', 'GR', 'LB', 'NB', 'NH', 'OV', 'UT', 'ZH', 'ZL'].includes(province)
            ? `PROVINCE:${province}` : '';
        }
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        const validExchange = facts.qIsPaccDutch
          ? ['DR', 'FL', 'FR', 'GD', 'GR', 'LB', 'NB', 'NH', 'OV', 'UT', 'ZH', 'ZL'].includes(exchange)
          : /^\d+$/.test(exchange);
        if (!validExchange) return '';
        const callArea = paccCallArea(facts.call, facts.qCountry);
        return callArea ? `AREA:${callArea}` : (facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '');
      }
      case 'ari_dx_province_or_country': {
        if (!['80M', '40M', '20M', '15M', '10M'].includes(facts.bandNorm)) return '';
        const rawMode = String(facts.q?.mode || '').toUpperCase();
        if (!(facts.modeKey === 'CW' || facts.modeKey === 'SSB' || ['RTTY', 'RY'].includes(rawMode))) return '';
        const exchange = String(facts.exchangePrimary || '').toUpperCase();
        if (facts.qIsAriDxItalian) {
          if (station.stationIsAriDxItalian || !ARI_DX_PROVINCES.has(exchange)) return '';
          return `PROVINCE:${exchange}`;
        }
        return /^\d+$/.test(exchange) && facts.qCountryKey ? `DXCC:${facts.qCountryKey}` : '';
      }
      default:
        if (!runtime.unknownMultiplier.has(group)) {
          runtime.unknownMultiplier.add(group);
          assumptions.add(`Unhandled multiplier group: ${group}`);
        }
        return '';
    }
  }

  function multiplierEntityLabel(group, value, facts) {
    if ([
      'country', 'country_for_ru_entries', 'dxcc_country',
      'dxcc_entities_for_french_entries', 'dl_station_uses_country_entities',
      'wae_country_or_dxcc_set_by_station_region', 'dxcc_country_excluding_iaru_hq'
    ].includes(group)) {
      return String(facts?.qCountry || value || '');
    }
    if (group === 'cq_zone' || group === 'cq_zone_except_own') return `CQ zone ${value}`;
    if (group === 'itu_zone' || group === 'itu_zone_excluding_iaru_hq') return `ITU zone ${value}`;
    return String(value || '').replace(/\|/g, ' / ');
  }

  function multiplierValues(group, facts, station, runtime, assumptions) {
    const raw = getMultiplierValue(group, facts, station, runtime, assumptions);
    return (Array.isArray(raw) ? raw : [raw]).map((value) => String(value || '')).filter(Boolean);
  }

  function multiplierPerspective(rule, station, model, effectiveGroups, effectiveScope) {
    let stationPerspective = 'common';
    if (rule?.id === 'darc_wag') stationPerspective = station?.stationIsDl ? 'dl' : 'non_dl';
    else if (rule?.id === 'ref') stationPerspective = station?.stationIsFrench ? 'french' : 'non_french';
    else if (rule?.id === 'rda') stationPerspective = station?.stationIsRu ? 'ru' : 'non_ru';
    else if (rule?.id === 'ok_om_dx') {
      if (station?.stationCountryKey === 'CZECH REPUBLIC') stationPerspective = 'ok';
      else if (station?.stationCountryKey === 'SLOVAK REPUBLIC') stationPerspective = 'om';
      else stationPerspective = 'dx';
    }
    else if (rule?.id === 'aadx') stationPerspective = station?.stationContinent === 'AS' ? 'asian' : 'non_asian';
    else if (rule?.id === 'jidx_cw' || rule?.id === 'jidx_ssb') stationPerspective = station?.stationIsJa ? 'ja' : 'dx';
    else if (rule?.id === 'oceania_dx_cw' || rule?.id === 'oceania_dx_ssb') stationPerspective = station?.stationIsOceania ? 'oceania' : 'dx';
    return {
      ruleId: String(rule?.id || ''),
      model,
      countingScope: effectiveScope,
      groups: effectiveGroups.slice(),
      stationPerspective,
      compatibilityKey: [rule?.id || '', model, effectiveScope, stationPerspective, effectiveGroups.join(',')].join('|')
    };
  }

  function computeRuleMultipliers(rule, qsos, station, pointState, assumptions) {
    const model = String(rule?.multipliers?.model || '');
    const configuredGroups = Array.isArray(rule?.multipliers?.groups) ? rule.multipliers.groups : [];
    const configuredScope = String(rule?.multipliers?.counting_scope || 'once_total');
    const multiplierCreditPolicy = resolveMultiplierCreditPolicy(rule);
    const bandWeights = rule?.multipliers?.band_weights || {};
    let effectiveGroups = configuredGroups.slice();
    let effectiveScope = configuredScope;

    if (model === 'station_dependent_group') {
      if (rule?.id === 'darc_wag') {
        effectiveGroups = [station.stationIsDl ? 'dl_station_uses_country_entities' : 'non_dl_station_uses_dok_districts'];
        if (!station.stationIsDl) {
          effectiveScope = 'once_total';
          assumptions.add('Applied non-DL WAG multiplier scope override: once_total.');
        }
      } else if (rule?.id === 'ref') {
        effectiveGroups = station.stationIsFrench
          ? ['departments_and_special_prefixes', 'dxcc_entities_for_french_entries']
          : ['departments_and_special_prefixes'];
      }
    }
    if (rule?.id === 'darc_fieldday') {
      effectiveScope = 'per_hf_band_group';
      assumptions.add('Applied DARC Fieldday multiplier scope override: high/low HF band groups.');
    }

    const runtime = makeScoringRuntime(station);
    runtime.ruleId = String(rule?.id || '');
    const perGroup = new Map();
    const groupCounts = {};
    const bandMultiplierCounts = {};
    let weightedTotal = 0;
    const credits = [];
    const rejections = [];
    const modeMultiplierSets = { CW: new Set(), SSB: new Set(), DIG: new Set() };

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (facts.isQtc) return;
      const pointValue = Number(pointState?.pointsByIndex?.[idx]);
      const scoringDuplicate = Array.isArray(pointState?.duplicateByIndex)
        ? Boolean(pointState.duplicateByIndex[idx])
        : Boolean(q?.isDupe);
      const eligible = multiplierCreditPolicy === 'valid_qso_allow_duplicates'
        ? (facts.validQso && (!Number.isFinite(pointValue) || pointValue >= 0))
        : multiplierCreditPolicy === 'valid_qso_allow_zero_points'
        ? (!scoringDuplicate && facts.validQso && (!Number.isFinite(pointValue) || pointValue >= 0))
        : (!scoringDuplicate && Number.isFinite(pointValue) && pointValue > 0);
      if (!eligible) {
        let reason = 'ineligible_qso';
        if (scoringDuplicate) reason = 'duplicate_qso';
        else if (!facts.validQso) reason = 'invalid_qso';
        else if (Number.isFinite(pointValue) && pointValue <= 0) reason = 'non_positive_points';
        effectiveGroups.forEach((group) => {
          multiplierValues(group, facts, station, runtime, assumptions).forEach((value) => {
            rejections.push({
              ruleId: String(rule?.id || ''), group, entityKey: value,
              entityLabel: multiplierEntityLabel(group, value, facts),
              countingScope: effectiveScope, band: facts.bandNorm || 'UNKNOWN',
              mode: facts.modeKey || 'UNKNOWN', qsoIndex: idx,
              qsoNumber: Number(q?.qsoNumber || idx + 1), callsign: facts.call || '',
              timestamp: Number.isFinite(Number(q?.ts)) ? Number(q.ts) : null, validQso: Boolean(facts.validQso),
              duplicate: scoringDuplicate, pointValue: Number.isFinite(pointValue) ? pointValue : null,
              exchangeValue: value, reason, source: 'scoring_engine'
            });
          });
        });
        markScoringRuntime(facts, runtime);
        return;
      }
      effectiveGroups.forEach((group) => {
        multiplierValues(group, facts, station, runtime, assumptions).forEach((value) => {
          let scopeKey = 'ALL';
          if (effectiveScope === 'per_mode') scopeKey = facts.modeKey || 'UNKNOWN';
          if (effectiveScope === 'per_band') scopeKey = facts.bandNorm || 'UNKNOWN';
          if (effectiveScope === 'per_band_per_mode') scopeKey = `${facts.bandNorm || 'UNKNOWN'}|${facts.modeKey}`;
          if (effectiveScope === 'per_hf_band_group') scopeKey = hfBandGroupKey(facts.bandNorm);
          if (effectiveScope === 'bartg_hf_mixed' && group !== 'bartg_continent') scopeKey = facts.bandNorm || 'UNKNOWN';
          const uniqueKey = `${scopeKey}|${value}`;
          const set = perGroup.get(group) || new Set();
          if (set.has(uniqueKey)) {
            rejections.push({
              ruleId: String(rule?.id || ''), group, entityKey: value,
              entityLabel: multiplierEntityLabel(group, value, facts), countingScope: effectiveScope, scopeKey,
              band: facts.bandNorm || 'UNKNOWN', mode: facts.modeKey || 'UNKNOWN', qsoIndex: idx,
              qsoNumber: Number(q?.qsoNumber || idx + 1), callsign: facts.call || '',
              timestamp: Number.isFinite(Number(q?.ts)) ? Number(q.ts) : null, validQso: Boolean(facts.validQso),
              duplicate: scoringDuplicate, pointValue: Number.isFinite(pointValue) ? pointValue : null,
              exchangeValue: value, reason: 'already_credited', source: 'scoring_engine'
            });
            return;
          }
          set.add(uniqueKey);
          perGroup.set(group, set);
          groupCounts[group] = (groupCounts[group] || 0) + 1;
          if (effectiveScope === 'per_band' || effectiveScope === 'per_hf_band_group') bandMultiplierCounts[scopeKey] = (bandMultiplierCounts[scopeKey] || 0) + 1;
          modeMultiplierSets[facts.modeKey].add(uniqueKey);
          const configuredWeight = model === 'weighted_mults' && effectiveScope === 'per_band' ? lookupBandCoefficient(bandWeights, facts.bandNorm) : 1;
          const weight = Number.isFinite(configuredWeight) ? configuredWeight : 1;
          weightedTotal += weight;
          credits.push({
            ruleId: String(rule?.id || ''), group, entityKey: value,
            entityLabel: multiplierEntityLabel(group, value, facts), countingScope: effectiveScope, scopeKey,
            band: facts.bandNorm || 'UNKNOWN', mode: facts.modeKey || 'UNKNOWN', rawCredit: 1, weight, weightedCredit: weight,
            qsoIndex: idx, qsoNumber: Number(q?.qsoNumber || idx + 1), callsign: facts.call || '',
            timestamp: Number.isFinite(Number(q?.ts)) ? Number(q.ts) : null, validQso: Boolean(facts.validQso),
            duplicate: scoringDuplicate, isQtc: false, exchangeValue: value, source: 'scoring_engine', multiplierCreditPolicy
          });
        });
      });
      markScoringRuntime(facts, runtime);
    });

    const total = Object.values(groupCounts).reduce((acc, n) => acc + (Number(n) || 0), 0);
    let multiplierTotal = total;
    if (model === 'single_group') multiplierTotal = Number(groupCounts[effectiveGroups[0]] || 0);
    if (model === 'none_multiplicative') multiplierTotal = 0;
    if (model === 'weighted_mults') multiplierTotal = weightedTotal > 0 ? weightedTotal : total;
    if (model === 'bartg_product_factors') {
      multiplierTotal = Number(groupCounts.bartg_dxcc_country || 0) + Number(groupCounts.bartg_call_area || 0);
    }
    const minimumTotal = Number(rule?.multipliers?.minimum_total);
    if (Number.isFinite(minimumTotal) && multiplierTotal < minimumTotal) multiplierTotal = minimumTotal;
    const maximumTotal = Number(rule?.multipliers?.maximum_total);
    if (Number.isFinite(maximumTotal) && multiplierTotal > maximumTotal) multiplierTotal = maximumTotal;

    return {
      groupCounts,
      rawTotal: total,
      total: multiplierTotal,
      weightedTotal: weightedTotal > 0 ? weightedTotal : multiplierTotal,
      bandMultiplierCounts,
      credits,
      rejections,
      perspective: multiplierPerspective(rule, station, model, effectiveGroups, effectiveScope),
      supported: model !== 'none_multiplicative' && effectiveGroups.length > 0,
      modeCounts: {
        CW: modeMultiplierSets.CW.size,
        SSB: modeMultiplierSets.SSB.size,
        DIG: modeMultiplierSets.DIG.size
      }
    };
  }

  function evalNumericExpression(expression, vars) {
    const safe = String(expression || '').replace(/[^A-Za-z0-9_+\-*/().\s]/g, ' ');
    const replaced = safe.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
      const val = Number(vars[name]);
      return Number.isFinite(val) ? String(val) : '0';
    });
    try {
      const out = Function(`"use strict"; return (${replaced});`)();
      return Number.isFinite(out) ? Math.round(out) : null;
    } catch (err) {
      return null;
    }
  }

  function evaluateRuleFormula(rule, pointState, multState, station, assumptions) {
    const vars = {
      qso_points_total: pointState.qsoPointsTotal || 0,
      weighted_qso_points_total: pointState.weightedQsoPointsTotal || pointState.qsoPointsTotal || 0,
      qso_count: pointState.qsoCount || 0,
      qtc_count: pointState.qtcCount || 0,
      cw_points: pointState.modePoints?.CW || 0,
      ssb_points: pointState.modePoints?.SSB || 0,
      multipliers_total: multState.total || 0,
      weighted_multiplier_sum: multState.weightedTotal || multState.total || 0,
      cq_zone_mults: multState.groupCounts?.cq_zone || 0,
      country_mults:
        (multState.groupCounts?.country || 0)
        + (multState.groupCounts?.dxcc_country || 0)
        + (multState.groupCounts?.country_for_ru_entries || 0),
      w_ve_qth_mults:
        (multState.groupCounts?.w_ve_qth || 0)
        + (multState.groupCounts?.us_states_dc || 0)
        + (multState.groupCounts?.ve_provinces_areas || 0),
      wpx_prefix_mults: multState.groupCounts?.wpx_prefix || 0,
      eu_region_mults: multState.groupCounts?.eu_region_code || 0,
      oblast_mults: multState.groupCounts?.russian_oblast || 0,
      rda_mults: multState.groupCounts?.rda_district || 0,
      cw_mults: multState.modeCounts?.CW || 0,
      ssb_mults: multState.modeCounts?.SSB || 0,
      unique_callsigns: multState.groupCounts?.unique_callsign || pointState.uniqueCallCount || 0,
      section_mults:
        (multState.groupCounts?.us_states_dc || 0)
        + (multState.groupCounts?.ve_provinces_areas || 0)
        + (multState.groupCounts?.w_ve_qth || 0),
      bartg_multiplier_total:
        (multState.groupCounts?.bartg_dxcc_country || 0)
        + (multState.groupCounts?.bartg_call_area || 0),
      continent_mults: multState.groupCounts?.bartg_continent || 0,
      matrix_base_points: pointState.matrixBasePoints || 0,
      new_zone_bonus: pointState.newZoneBonus || 0,
      new_region_bonus: pointState.newRegionBonus || 0
      ,
      operator_qrp_bonus: /\/QRP/i.test(station.stationCall || '') ? 20 : 0
    };
    if (String(rule?.id || '') === 'volta_rtty_2026') {
      assumptions.add('Applied current VOLTA RTTY valid-QSO-count × exchange-points × multipliers formula.');
      return Math.round(Number(pointState?.positiveQsoCount || 0) * Number(pointState?.qsoPointsTotal || 0) * Number(multState?.total || 0));
    }
    if (String(rule?.id || '') === 'uksmg_summer_2027') {
      const regular = Number(multState?.groupCounts?.uksmg_dxcc || 0)
        + Number(multState?.groupCounts?.uksmg_grid || 0)
        + Number(multState?.groupCounts?.uksmg_member || 0);
      const committee = Number(multState?.groupCounts?.uksmg_committee || 0);
      assumptions.add('Applied current UKSMG Summer Es distance plus 500-point regular and 1,000-point committee bonuses.');
      return Math.round(Number(pointState?.qsoPointsTotal || 0) + regular * 500 + committee * 1000);
    }
    if (String(rule?.id || '') === 'sp_dx_rtty_2026') {
      const countriesAndPoviats = Number(multState?.groupCounts?.sp_dx_rtty_country || 0)
        + Number(multState?.groupCounts?.sp_dx_rtty_poviat || 0);
      const continents = Math.min(6, Number(multState?.groupCounts?.sp_dx_rtty_continent || 0));
      assumptions.add('Applied current SP DX RTTY points × per-band countries/poviats × worked continents formula.');
      return Math.round(Number(pointState?.qsoPointsTotal || 0) * countriesAndPoviats * continents);
    }
    if (String(rule?.id || '') === 'uba_dx_2026') {
      const stationBelgian = station.stationCountryKey === 'BELGIUM' || /^(?:ON|OO|OP|OQ|OR|OS|OT)/.test(station.stationCall || '');
      const validCount = Number(pointState?.ubaValidQsoCount || 0);
      const belgianCount = Number(pointState?.ubaBelgianQsoCount || 0);
      const belgianPoints = Number(pointState?.ubaBelgianQsoPoints || 0);
      const bonus = !stationBelgian && validCount > 0 ? Math.round(belgianPoints * belgianCount / validCount) : 0;
      assumptions.add(`Applied current UBA DX outside-Belgium percentage bonus (${bonus} points) before multiplying the final QSO-point total.`);
      return Math.round((Number(pointState?.qsoPointsTotal || 0) + bonus) * Number(multState?.total || 0));
    }
    if (String(rule?.id || '') === 'ukr_champ_rtty_2026') {
      assumptions.add('Applied current Ukrainian RTTY Championship two-point QSOs plus five points per new oblast on each band in each round.');
      return Math.round(Number(pointState?.qsoPointsTotal || 0) + Number(multState?.total || 0) * 5);
    }
    if (String(rule?.id || '') === 'euhfc') {
      const bandPoints = pointState?.bandPoints || {};
      const bandMults = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandMults)]);
      let bandwiseScore = 0;
      bands.forEach((band) => {
        const pts = Number(bandPoints[band] || 0);
        const mults = Number(bandMults[band] || 0);
        if (!Number.isFinite(pts) || !Number.isFinite(mults) || pts <= 0 || mults <= 0) return;
        bandwiseScore += (pts * mults);
      });
      if (bandwiseScore > 0) {
        assumptions.add('Applied EUHFC band-wise score formula override.');
        return Math.round(bandwiseScore);
      }
    }
    if (String(rule?.id || '') === 'aegean_vhf_legacy') {
      const bandPoints = pointState?.bandPoints || {};
      const bandQsoCounts = pointState?.bandQsoCounts || {};
      const bandMults = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandQsoCounts), ...Object.keys(bandMults)]);
      let bandwiseScore = 0;
      bands.forEach((band) => {
        const points = Number(bandPoints[band] || 0);
        const qsos = Number(bandQsoCounts[band] || 0);
        const mults = Number(bandMults[band] || 0);
        if (!Number.isFinite(points) || !Number.isFinite(qsos) || !Number.isFinite(mults)) return;
        bandwiseScore += qsos * points * mults;
      });
      assumptions.add('Applied fixture-backed AEGEAN-VHF recovered band-wise formula.');
      return Math.round(bandwiseScore);
    }
    if (String(rule?.id || '') === 'avhfc_legacy') {
      const bandPoints = pointState?.bandPoints || {};
      const bandMults = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandMults)]);
      let score = Number(pointState?.avhfcDistanceBonus || 0);
      bands.forEach((band) => {
        score += Number(bandPoints[band] || 0) * Number(bandMults[band] || 0);
      });
      assumptions.add('Applied fixture-backed AVHFC recovered band-wise grid formula and whole-kilometre distance bonuses.');
      return Math.round(score);
    }
    if (String(rule?.id || '') === 'sarl_vhf_2026') {
      const bandPoints = pointState?.bandPoints || {};
      const bandMults = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandMults)]);
      let score = 0;
      bands.forEach((band) => { score += Number(bandPoints[band] || 0) * Number(bandMults[band] || 0); });
      assumptions.add('Applied current SARL VHF/UHF per-band distance-points times unique-grid formula.');
      return Math.round(score);
    }
    if (String(rule?.id || '') === 'sarl_hf_2026') {
      assumptions.add('Applied current SARL HF additive area and three-band bonuses.');
      return Math.round(Number(pointState?.qsoPointsTotal || 0) + Number(multState?.total || 0) * 2 + Number(pointState?.sarlHfTriBandBonus || 0));
    }
    if (String(rule?.id || '') === 'basso_ferrarese_legacy') {
      const bandPoints = pointState?.bandPoints || {};
      const bandJollyCounts = multState?.bandMultiplierCounts || {};
      const bands = new Set([...Object.keys(bandPoints), ...Object.keys(bandJollyCounts)]);
      let score = 0;
      bands.forEach((band) => {
        const points = Number(bandPoints[band] || 0);
        const jolly = Number(bandJollyCounts[band] || 0);
        score += points * (jolly > 0 ? jolly * 100 : 1);
      });
      assumptions.add('Applied fixture-backed BASSO-FERRARESE recovered per-band Jolly formula.');
      return Math.round(score);
    }
    const formulaRaw = String(rule?.formula || '').trim();
    if (!formulaRaw) {
      if (String(rule?.multipliers?.model || '') === 'none_multiplicative') {
        return (vars.matrix_base_points + vars.new_zone_bonus + vars.new_region_bonus);
      }
      if (vars.multipliers_total > 0) return vars.qso_points_total * vars.multipliers_total;
      return vars.qso_points_total;
    }
    let expression = formulaRaw;
    if (formulaRaw.includes(';')) {
      const parts = formulaRaw.split(';').map((p) => p.trim()).filter(Boolean);
      const selected = station.stationIsRu
        ? (parts.find((p) => p.toLowerCase().includes('ru_score')) || parts[parts.length - 1])
        : (parts.find((p) => p.toLowerCase().includes('non_ru_score')) || parts[0]);
      expression = selected || formulaRaw;
    }
    if (expression.includes('=')) expression = expression.split('=').slice(1).join('=').trim();
    const score = evalNumericExpression(expression, vars);
    if (score == null) {
      assumptions.add(`Formula evaluation fallback used: ${formulaRaw}`);
      if (vars.multipliers_total > 0) return vars.qso_points_total * vars.multipliers_total;
      return vars.qso_points_total;
    }
    return score;
  }

  function scoreFromRule(rule, qsos, contestMeta, assumptions) {
    const station = buildStationScoringProfile(qsos, contestMeta);
    const pointState = computeRuleQsoPoints(rule, qsos, station, assumptions);
    const multState = computeRuleMultipliers(rule, qsos, station, pointState, assumptions);
    const computedScore = evaluateRuleFormula(rule, pointState, multState, station, assumptions);
    if (String(rule?.id || '') === 'wae') {
      const claimed = parseClaimedScoreNumber(contestMeta?.claimedScore);
      if (Number.isFinite(claimed) && claimed > 0 && Number(pointState?.qtcCount || 0) === 0 && computedScore < (claimed * 0.8)) {
        assumptions.add('No QTC records found in this WAE log; claimed score may include QTC traffic omitted from the archive file.');
      }
    }
    return { station, pointState, multState, computedScore };
  }

  function arlVhfBandFactor(bandNorm) {
    switch (String(bandNorm || '').toUpperCase()) {
      case '6M':
      case '2M':
        return 1;
      case '1.25M':
      case '70CM':
        return 2;
      case '33CM':
      case '23CM':
        return 4;
      default:
        return 8;
    }
  }

  function euVhfBandFactor(bandNorm) {
    switch (String(bandNorm || '').toUpperCase()) {
      case '6M':
      case '4M':
      case '2M':
        return 1;
      case '1.25M':
      case '70CM':
        return 2;
      case '33CM':
      case '23CM':
        return 3;
      default:
        return 4;
    }
  }

  function firstGrid4FromFacts(facts) {
    const direct = String(facts?.q?.grid || '').toUpperCase();
    if (/^[A-R]{2}\d{2}/.test(direct)) return direct.slice(0, 4);
    for (const token of (facts?.exchangeTokens || [])) {
      if (/^[A-R]{2}\d{2}/.test(token)) return token.slice(0, 4);
    }
    return '';
  }

  function scoreArrlBundle(resolved, qsos, contestMeta, assumptions) {
    const subeventId = String(resolved?.bundle?.subeventId || '');
    const station = buildStationScoringProfile(qsos, contestMeta);
    const runtime = makeScoringRuntime(station);
    const duplicatePolicy = resolveScoringDuplicatePolicy(resolved?.rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multOnce = new Set();
    const multPerBand = new Set();
    const multPerMode = { CW: new Set(), SSB: new Set(), DIG: new Set() };
    const uniqueCalls = new Set();
    let qsoPointsTotal = 0;
    let multiplierTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (q?.isDupe && !scoreDuplicates) return;
      if (!facts.validQso) {
        markScoringRuntime(facts, runtime);
        return;
      }
      uniqueCalls.add(facts.call);
      const distance = Number(q?.distance);
      let points = 0;
      if (subeventId === 'arrl_dx') {
        points = 3;
        const multVal = station.stationIsWVe ? facts.qCountryKey : (facts.exchangeWVeQth || facts.qCountryKey);
        if (multVal) multPerBand.add(`${facts.bandNorm}|${multVal}`);
      } else if (subeventId === 'arrl_sweepstakes') {
        points = 2;
        const multVal = facts.exchangeWVeQth || facts.exchangeRegion;
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_10m') {
        points = facts.modeKey === 'CW' ? 4 : 2;
        const baseVals = [facts.exchangeWVeQth, facts.qCountryKey, facts.qItuZone != null ? String(facts.qItuZone) : ''].filter(Boolean);
        baseVals.forEach((value) => multPerMode[facts.modeKey].add(value));
      } else if (subeventId === 'arrl_160m') {
        points = (station.stationIsWVe && facts.qIsWVe) ? 2 : 5;
        const multVal = station.stationIsWVe ? (facts.exchangeWVeQth || facts.qCountryKey) : (facts.exchangeWVeQth || '');
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_rtty_roundup') {
        points = 1;
        const multVal = facts.exchangeWVeQth || facts.qCountryKey;
        if (multVal) multOnce.add(multVal);
      } else if (subeventId === 'arrl_intl_digital') {
        const bonus = Number.isFinite(distance) ? Math.max(1, Math.ceil(distance / 500)) : 1;
        points = 1 + bonus;
      } else if (subeventId === 'arrl_vhf_jan_jun_sep') {
        points = arlVhfBandFactor(facts.bandNorm);
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else if (subeventId === 'arrl_222_up_distance') {
        points = Number.isFinite(distance) ? Math.round(distance * arlVhfBandFactor(facts.bandNorm)) : 0;
      } else if (subeventId === 'arrl_10ghz_up') {
        points = Number.isFinite(distance) ? Math.round(distance * arlVhfBandFactor(facts.bandNorm)) : 0;
      } else if (subeventId === 'arrl_eme') {
        points = 100;
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else {
        points = Number.isFinite(q?.points) ? q.points : 0;
        assumptions.add('ARRL subevent fallback to logged points because subevent pattern was not matched.');
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      markScoringRuntime(facts, runtime);
    });

    if (subeventId === 'arrl_dx') multiplierTotal = multPerBand.size;
    else if (subeventId === 'arrl_10m') multiplierTotal = multPerMode.CW.size + multPerMode.SSB.size + multPerMode.DIG.size;
    else if (subeventId === 'arrl_vhf_jan_jun_sep' || subeventId === 'arrl_eme') multiplierTotal = multPerBand.size;
    else multiplierTotal = multOnce.size;

    let computedScore = null;
    if (subeventId === 'arrl_intl_digital' || subeventId === 'arrl_222_up_distance') {
      computedScore = qsoPointsTotal;
    } else if (subeventId === 'arrl_10ghz_up') {
      computedScore = qsoPointsTotal + (uniqueCalls.size * 100);
      assumptions.add('ARRL 10 GHz bonus uses heuristic +100 per unique call.');
    } else if (multiplierTotal > 0) {
      computedScore = qsoPointsTotal * multiplierTotal;
    } else {
      computedScore = qsoPointsTotal;
    }

    assumptions.add('ARRL bundle scorer uses heuristic interpretation from bundled rules metadata.');
    return { qsoPointsTotal, multiplierTotal, computedScore, pointsByIndex };
  }

  function scoreEuVhfBundle(resolved, qsos, contestMeta, assumptions) {
    const modelId = String(resolved?.bundle?.subeventModelId || '');
    const station = buildStationScoringProfile(qsos, contestMeta);
    const runtime = makeScoringRuntime(station);
    const duplicatePolicy = resolveScoringDuplicatePolicy(resolved?.rule);
    const scoreDuplicates = duplicatePolicy === 'include_all_dupes';
    const pointsByIndex = new Array((qsos || []).length).fill(0);
    const multPerBand = new Set();
    let qsoPointsTotal = 0;

    (qsos || []).forEach((q, idx) => {
      const facts = buildQsoScoringFacts(q, station, runtime);
      if (q?.isDupe && !scoreDuplicates) return;
      const distance = Number(q?.distance);
      let points = 0;
      if (modelId === 'distance_only') {
        points = Number.isFinite(distance) ? Math.max(0, Math.round(distance)) : 0;
      } else if (modelId === 'distance_times_multipliers') {
        points = Number.isFinite(distance) ? Math.max(1, Math.round(distance)) : 1;
        const grid4 = firstGrid4FromFacts(facts);
        if (grid4) multPerBand.add(`${facts.bandNorm}|${grid4}`);
      } else if (modelId === 'band_weighted_distance') {
        points = Number.isFinite(distance) ? Math.max(0, Math.round(distance * euVhfBandFactor(facts.bandNorm))) : 0;
      } else {
        points = Number.isFinite(q?.points) ? q.points : 0;
        assumptions.add('EU VHF bundle fallback to logged points because no subevent model matched.');
      }
      pointsByIndex[idx] = points;
      qsoPointsTotal += points;
      markScoringRuntime(facts, runtime);
    });

    const multiplierTotal = multPerBand.size;
    let computedScore = qsoPointsTotal;
    if (modelId === 'distance_times_multipliers') {
      computedScore = multiplierTotal > 0 ? (qsoPointsTotal * multiplierTotal) : qsoPointsTotal;
    }
    assumptions.add('EU VHF bundle scorer uses heuristic interpretation from bundled model hints.');
    return { qsoPointsTotal, multiplierTotal, computedScore, pointsByIndex };
  }

  function computeContestScoringSummary(qsos, contestMeta, context = {}) {
    const loggedPointsTotal = computeLoggedPointsTotal(qsos);
    const claimedScoreHeader = parseClaimedScoreNumber(contestMeta?.claimedScore);
    const resolved = resolveContestRuleSet(contestMeta, context);
    const ruleSpecVersion = String(activeAnalysisEnv?.scoringSpec?.spec_version || '');
    const ruleSpecSource = String(activeAnalysisEnv?.scoringSource || '');
    const duplicatePolicy = resolved?.rule ? resolveScoringDuplicatePolicy(resolved.rule) : '';
    const multiplierCreditPolicy = resolved?.rule ? resolveMultiplierCreditPolicy(resolved.rule) : '';
    const ruleReferenceUrl = Array.isArray(resolved?.rule?.official_rules_urls) && resolved.rule.official_rules_urls.length
      ? String(resolved.rule.official_rules_urls[0] || '')
      : '';
    const activeScoringRuleOverride = isWrtcScoringRuleId(resolved.ruleId) && resolved.detectionMethod === 'user_override'
      ? String(resolved.ruleId || '')
      : '';
    if (!resolved.supported) {
      return {
        supported: false,
        confidence: 'unknown',
        warning: resolved.warning || (activeAnalysisEnv?.analysisMode === ANALYSIS_MODE_DXER ? SCORING_UNKNOWN_WARNING_DXER : SCORING_UNKNOWN_WARNING),
        assumptions: Array.isArray(resolved.assumptions) ? resolved.assumptions : [],
        detectionMethod: resolved.detectionMethod || 'none',
        scoringRuleOverride: '',
        detectionValue: resolved.detectionValue || '',
        ruleId: null,
        ruleName: activeAnalysisEnv?.analysisMode === ANALYSIS_MODE_DXER ? 'Unknown rules' : 'Unknown contest',
        claimedScoreHeader,
        loggedPointsTotal,
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
        computedQsoPointsTotal: null,
        computedMultiplierTotal: null,
        computedRawMultiplierTotal: null,
        multiplierModelSupported: false,
        multiplierCredits: [],
        multiplierRejections: [],
        multiplierPerspective: null,
        computedScore: null,
        scoreDeltaAbs: null,
        scoreDeltaPct: null,
        effectivePointsSource: loggedPointsTotal > 0 ? 'logged' : 'none',
        bundle: null,
        computedPointsByIndex: []
      };
    }
    const assumptions = new Set(Array.isArray(resolved.assumptions) ? resolved.assumptions : []);
    if (resolved.rule?.bundle === true) {
      let bundleScore = null;
      if (resolved.bundle?.type === 'arrl') {
        bundleScore = scoreArrlBundle(resolved, qsos, contestMeta, assumptions);
      } else if (resolved.bundle?.type === 'eu_vhf') {
        bundleScore = scoreEuVhfBundle(resolved, qsos, contestMeta, assumptions);
      } else {
        assumptions.add('Bundle matched but subevent was not detected. Logged points fallback is used.');
      }
      const computedScore = Number.isFinite(bundleScore?.computedScore) ? Math.round(bundleScore.computedScore) : null;
      const deltaAbs = (computedScore != null && Number.isFinite(claimedScoreHeader)) ? computedScore - claimedScoreHeader : null;
      const deltaPct = (deltaAbs != null && Number.isFinite(claimedScoreHeader) && claimedScoreHeader !== 0)
        ? (deltaAbs / claimedScoreHeader) * 100
        : null;
      return {
        supported: true,
        confidence: resolved.confidence || 'unknown',
        warning: '',
        assumptions: Array.from(assumptions),
        detectionMethod: resolved.detectionMethod || '',
        scoringRuleOverride: activeScoringRuleOverride,
        detectionValue: resolved.detectionValue || '',
        ruleId: resolved.ruleId || '',
        ruleName: resolved.rule?.name || resolved.ruleId || '',
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: Number.isFinite(bundleScore?.qsoPointsTotal) ? Math.round(bundleScore.qsoPointsTotal) : null,
        computedMultiplierTotal: Number.isFinite(bundleScore?.multiplierTotal) ? Number(bundleScore.multiplierTotal) : null,
        computedRawMultiplierTotal: null,
        multiplierModelSupported: false,
        multiplierCredits: [],
        multiplierRejections: [],
        multiplierPerspective: null,
        computedScore,
        scoreDeltaAbs: deltaAbs,
        scoreDeltaPct: deltaPct,
        effectivePointsSource: computedScore != null ? 'computed' : (loggedPointsTotal > 0 ? 'logged' : 'none'),
        bundle: resolved.bundle || null,
        computedPointsByIndex: Array.isArray(bundleScore?.pointsByIndex) ? bundleScore.pointsByIndex : []
      };
    }
    const ruleId = String(resolved.ruleId || '');
    const inPhase1 = SCORING_PHASE1_RULES.has(ruleId);
    const inPhase2 = SCORING_PHASE2_RULES.has(ruleId);
    if (!inPhase1 && !inPhase2) {
      assumptions.add(`Scorer for ${resolved.ruleId} is not enabled in current rollout.`);
      return {
        supported: true,
        confidence: resolved.confidence || 'unknown',
        warning: '',
        assumptions: Array.from(assumptions),
        detectionMethod: resolved.detectionMethod || '',
        scoringRuleOverride: activeScoringRuleOverride,
        detectionValue: resolved.detectionValue || '',
        ruleId: resolved.ruleId || '',
        ruleName: resolved.rule?.name || resolved.ruleId || '',
        ruleSpecVersion,
        ruleSpecSource,
        ruleReferenceUrl,
        duplicatePolicy,
        multiplierCreditPolicy,
        claimedScoreHeader,
        loggedPointsTotal,
        computedQsoPointsTotal: null,
        computedMultiplierTotal: null,
        computedRawMultiplierTotal: null,
        multiplierModelSupported: false,
        multiplierCredits: [],
        multiplierRejections: [],
        multiplierPerspective: null,
        computedScore: null,
        scoreDeltaAbs: null,
        scoreDeltaPct: null,
        effectivePointsSource: loggedPointsTotal > 0 ? 'logged' : 'none',
        bundle: resolved.bundle || null,
        computedPointsByIndex: []
      };
    }
    if (inPhase2) assumptions.add('Medium-confidence scorer active: validate assumptions against yearly published rules.');
    const scored = scoreFromRule(resolved.rule, qsos, contestMeta, assumptions);
    const scoreIsComplete = String(resolved.rule?.score_completeness || 'complete') === 'complete';
    if (!scoreIsComplete) assumptions.add(String(resolved.rule?.incomplete_score_reason || 'Final score is unavailable because this rule computes QSO points only and requires data outside the uploaded log.'));
    const computedScore = scoreIsComplete && Number.isFinite(scored.computedScore) ? Math.round(scored.computedScore) : null;
    const deltaAbs = (computedScore != null && Number.isFinite(claimedScoreHeader)) ? computedScore - claimedScoreHeader : null;
    const deltaPct = (deltaAbs != null && Number.isFinite(claimedScoreHeader) && claimedScoreHeader !== 0)
      ? (deltaAbs / claimedScoreHeader) * 100
      : null;
    return {
      supported: true,
      confidence: resolved.confidence || 'unknown',
      warning: '',
      assumptions: Array.from(assumptions),
      detectionMethod: resolved.detectionMethod || '',
      scoringRuleOverride: activeScoringRuleOverride,
      detectionValue: resolved.detectionValue || '',
      ruleId: resolved.ruleId || '',
      ruleName: resolved.rule?.name || resolved.ruleId || '',
      ruleSpecVersion,
      ruleSpecSource,
      ruleReferenceUrl,
      duplicatePolicy,
      multiplierCreditPolicy,
      claimedScoreHeader,
      loggedPointsTotal,
      computedQsoCount: Number(scored.pointState.qsoCount || 0),
      computedQtcCount: Number(scored.pointState.qtcCount || 0),
      computedQsoPointsTotal: Math.round(scored.pointState.qsoPointsTotal || 0),
      computedMultiplierTotal: Number(scored.multState.total || 0),
      computedRawMultiplierTotal: Number(scored.multState.rawTotal || 0),
      multiplierModelSupported: Boolean(scored.multState.supported),
      multiplierCredits: Array.isArray(scored.multState.credits) ? scored.multState.credits : [],
      multiplierRejections: Array.isArray(scored.multState.rejections) ? scored.multState.rejections : [],
      multiplierPerspective: scored.multState.perspective || null,
      computedScore,
      scoreDeltaAbs: deltaAbs,
      scoreDeltaPct: deltaPct,
      effectivePointsSource: Number.isFinite(scored.pointState.qsoPointsTotal) ? 'computed' : (loggedPointsTotal > 0 ? 'logged' : 'none'),
      bundle: resolved.bundle || null,
      computedPointsByIndex: Array.isArray(scored.pointState.pointsByIndex) ? scored.pointState.pointsByIndex : []
    };
  }

  function toCallsignGridMap(resources = {}) {
    if (resources.callsignGridCache instanceof Map) {
      return resources.callsignGridCache;
    }
    const entries = Array.isArray(resources.callsignGridEntries) ? resources.callsignGridEntries : [];
    const cached = callsignGridMapCache.get(entries);
    if (cached) return cached;
    const map = new Map();
    entries.forEach((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) return;
      const key = normalizeCall(entry[0]);
      if (!key) return;
      map.set(key, normalizeLookupGrid(entry[1]));
    });
    callsignGridMapCache.set(entries, map);
    return map;
  }

  function toMasterSet(resources = {}) {
    if (resources.masterSet instanceof Set) return resources.masterSet;
    const calls = Array.isArray(resources.masterCalls) ? resources.masterCalls : [];
    const cached = masterSetCache.get(calls);
    if (cached) return cached;
    const set = new Set(calls.map((call) => normalizeCall(call)).filter(Boolean));
    masterSetCache.set(calls, set);
    return set;
  }

  function buildCtyPrefixIndex(ctyTable) {
    if (!Array.isArray(ctyTable) || ctyTable.length === 0) return null;
    const cached = ctyPrefixIndexCache.get(ctyTable);
    if (cached) return cached;
    const index = { exact: new Map(), prefix: new Map() };
    ctyTable.forEach((entry, order) => {
      const prefix = String(entry?.prefix || '');
      if (!prefix) return;
      const target = entry.exact ? index.exact : index.prefix;
      if (!target.has(prefix)) target.set(prefix, { entry, order });
    });
    ctyPrefixIndexCache.set(ctyTable, index);
    return index;
  }

  function buildAnalysisEnv(resources = {}) {
    const env = makeEmptyAnalysisEnv();
    env.ctyTable = Array.isArray(resources.ctyTable) ? resources.ctyTable : [];
    env.ctyPrefixIndex = buildCtyPrefixIndex(env.ctyTable);
    env.masterSet = toMasterSet(resources);
    env.analysisMode = normalizeAnalysisMode(resources.analysisMode || ANALYSIS_MODE_DEFAULT);
    env.scoringSpec = resources.scoringSpec && typeof resources.scoringSpec === 'object' ? resources.scoringSpec : null;
    env.scoringSource = String(resources.scoringSource || '');
    env.scoringError = String(resources.scoringError || '');
    env.scoringStatus = env.scoringSpec ? 'ok' : (resources.scoringStatus === 'error' ? 'error' : 'pending');
    env.callsignGridCache = toCallsignGridMap(resources);
    env.operatingStyleSpotAnchors = normalizeOperatingStyleSpotAnchors(resources.operatingStyleSpotAnchors);
    if (env.scoringSpec) {
      let indexes = scoringIndexCache.get(env.scoringSpec);
      if (!indexes) {
        indexes = buildScoringIndexes(env.scoringSpec);
        scoringIndexCache.set(env.scoringSpec, indexes);
      }
      env.scoringRuleMap = indexes.byId;
      env.scoringRuleByFolder = indexes.byFolder;
      env.scoringAliasMap = indexes.aliasMap;
    }
    return env;
  }

  function withAnalysisEnv(resources, fn) {
    const previous = activeAnalysisEnv;
    activeAnalysisEnv = buildAnalysisEnv(resources);
    try {
      return fn();
    } finally {
      activeAnalysisEnv = previous;
    }
  }

  function isWaeContestMeta(contestMeta) {
    return /(?:^|[^A-Z])WAE(?:DC)?(?:[^A-Z]|$)|WORKED\s+ALL\s+EUROPE/i.test(String(contestMeta?.contestId || ''));
  }

  function isWaeRttyContestMeta(contestMeta) {
    const text = `${contestMeta?.contestId || ''} ${contestMeta?.mode || ''}`.toUpperCase();
    return isWaeContestMeta(contestMeta) && /RTTY|DIGI|RY/.test(text);
  }

  function qtcContinentForCall(call) {
    const prefix = call ? lookupPrefix(call) : null;
    return normalizeContinent(prefix?.continent || '');
  }

  function buildQtcAnalysis(qtcs, qsos, contestMeta) {
    const items = Array.isArray(qtcs) ? qtcs : [];
    const seriesMap = new Map();
    const pairMap = new Map();
    const partnerMap = new Map();
    const payloadMap = new Map();
    const hourMap = new Map();
    const bandMap = new Map();
    const modeMap = new Map();
    const warningCounts = new Map();
    const wae = isWaeContestMeta(contestMeta);
    const rtty = isWaeRttyContestMeta(contestMeta);
    const addWarning = (item, code) => {
      if (item.validationWarnings.includes(code)) return;
      item.validationWarnings.push(code);
      warningCounts.set(code, (warningCounts.get(code) || 0) + 1);
    };

    items.forEach((item) => {
      item.validationWarnings = Array.from(new Set(Array.isArray(item.parseErrors) ? item.parseErrors : []));
      item.validationWarnings.forEach((code) => {
        warningCounts.set(code, (warningCounts.get(code) || 0) + 1);
      });
      item.receiverContinent = qtcContinentForCall(item.receiver);
      item.transmitterContinent = qtcContinentForCall(item.transmitter);
      item.reportedContinent = qtcContinentForCall(item.reportedCall);
      item.isScoringEligible = item.parseStatus === 'valid';
      if (item.direction === 'ambiguous') addWarning(item, 'ambiguous_direction');
      if (item.receiver && item.reportedCall && item.receiver === item.reportedCall) addWarning(item, 'returned_to_reported_station');
      if (wae && rtty && item.receiverContinent && item.transmitterContinent && item.receiverContinent === item.transmitterContinent) {
        addWarning(item, 'rtty_same_continent');
      }
      if (wae && !rtty && item.receiverContinent && item.transmitterContinent
        && (item.receiverContinent !== 'EU' || item.transmitterContinent === 'EU')) {
        addWarning(item, 'cw_ssb_invalid_direction');
      }

      const seriesId = item.seriesId || `unidentified|${item.id}`;
      if (!seriesMap.has(seriesId)) {
        seriesMap.set(seriesId, {
          seriesId,
          receiver: item.receiver,
          transmitter: item.transmitter,
          partner: item.partner,
          direction: item.direction,
          seriesGroup: item.seriesGroup,
          seriesNumber: item.seriesNumber,
          announcedSize: item.seriesSize,
          band: item.band,
          mode: item.mode,
          firstTs: item.ts,
          lastTs: item.ts,
          items: [],
          warnings: []
        });
      }
      const series = seriesMap.get(seriesId);
      series.items.push(item);
      if (Number.isFinite(item.ts)) {
        if (!Number.isFinite(series.firstTs) || item.ts < series.firstTs) series.firstTs = item.ts;
        if (!Number.isFinite(series.lastTs) || item.ts > series.lastTs) series.lastTs = item.ts;
      }

      const pairKey = [item.receiver, item.transmitter].filter(Boolean).sort().join('|') || 'unknown';
      pairMap.set(pairKey, (pairMap.get(pairKey) || 0) + 1);
      const partnerKey = item.partner || 'Unknown';
      if (!partnerMap.has(partnerKey)) {
        partnerMap.set(partnerKey, {
          partner: partnerKey,
          directions: new Set(),
          series: new Set(),
          units: 0,
          bands: new Set(),
          firstTs: item.ts,
          lastTs: item.ts,
          warningCount: 0
        });
      }
      const partner = partnerMap.get(partnerKey);
      partner.directions.add(item.direction || 'ambiguous');
      partner.series.add(seriesId);
      partner.units += 1;
      if (item.band) partner.bands.add(item.band);
      if (Number.isFinite(item.ts)) {
        if (!Number.isFinite(partner.firstTs) || item.ts < partner.firstTs) partner.firstTs = item.ts;
        if (!Number.isFinite(partner.lastTs) || item.ts > partner.lastTs) partner.lastTs = item.ts;
      }

      const payloadKey = [item.transmitter, item.raw?.QSO_DATE || '', item.reportedTime, item.reportedCall, item.reportedSerial].join('|');
      if (payloadMap.has(payloadKey)) {
        addWarning(item, 'duplicate_reported_qso');
        const first = payloadMap.get(payloadKey);
        addWarning(first, 'duplicate_reported_qso');
      } else {
        payloadMap.set(payloadKey, item);
      }

      if (Number.isFinite(item.ts)) {
        const hour = Math.floor(item.ts / 3600000);
        if (!hourMap.has(hour)) hourMap.set(hour, { hour, units: 0, series: new Set(), sent: 0, received: 0 });
        const bucket = hourMap.get(hour);
        bucket.units += 1;
        bucket.series.add(seriesId);
        if (item.direction === 'sent') bucket.sent += 1;
        if (item.direction === 'received') bucket.received += 1;
      }
      if (item.band) bandMap.set(item.band, (bandMap.get(item.band) || 0) + 1);
      if (item.mode) modeMap.set(item.mode, (modeMap.get(item.mode) || 0) + 1);
    });

    const series = Array.from(seriesMap.values()).map((entry) => {
      entry.observedSize = entry.items.length;
      if (Number.isFinite(entry.announcedSize) && entry.announcedSize !== entry.observedSize) {
        entry.warnings.push('announced_size_mismatch');
        entry.items.forEach((item) => addWarning(item, 'announced_size_mismatch'));
      }
      entry.items.forEach((item) => {
        entry.warnings.push(...item.validationWarnings);
      });
      entry.warnings = Array.from(new Set(entry.warnings));
      return entry;
    }).sort((a, b) => (a.firstTs || 0) - (b.firstTs || 0) || a.seriesId.localeCompare(b.seriesId));

    pairMap.forEach((count, pairKey) => {
      if (count <= 10) return;
      items.filter((item) => [item.receiver, item.transmitter].filter(Boolean).sort().join('|') === pairKey)
        .forEach((item) => addWarning(item, 'pair_quota_exceeded'));
    });
    series.forEach((entry) => {
      entry.warnings = Array.from(new Set(entry.items.flatMap((item) => item.validationWarnings)));
    });
    partnerMap.forEach((partner) => {
      partner.warningCount = items.filter((item) => item.partner === partner.partner && item.validationWarnings.length).length;
    });

    const validUnits = items.filter((item) => item.isScoringEligible).length;
    const validQsoUnits = (Array.isArray(qsos) ? qsos : []).filter((qso) => !qso?.isDupe && qso?.call).length;
    const sent = items.filter((item) => item.direction === 'sent').length;
    const received = items.filter((item) => item.direction === 'received').length;
    const fullSeries = series.filter((entry) => entry.observedSize === 10 && entry.announcedSize === 10).length;
    const sortedSizes = series.map((entry) => entry.observedSize).sort((a, b) => a - b);
    const medianSeriesSize = sortedSizes.length
      ? (sortedSizes.length % 2
        ? sortedSizes[Math.floor(sortedSizes.length / 2)]
        : (sortedSizes[(sortedSizes.length / 2) - 1] + sortedSizes[sortedSizes.length / 2]) / 2)
      : 0;
    const activeMinutes = new Set(items.filter((item) => Number.isFinite(item.ts)).map((item) => Math.floor(item.ts / 60000))).size;
    return {
      supported: wae,
      isRtty: rtty,
      items,
      series,
      partners: Array.from(partnerMap.values()).map((entry) => ({
        partner: entry.partner,
        direction: Array.from(entry.directions).sort().join(' / '),
        seriesCount: entry.series.size,
        units: entry.units,
        averageSeriesSize: entry.series.size ? entry.units / entry.series.size : 0,
        bands: sortBands(Array.from(entry.bands)),
        firstTs: entry.firstTs,
        lastTs: entry.lastTs,
        quotaUsed: entry.units,
        warningCount: entry.warningCount
      })).sort((a, b) => b.units - a.units || a.partner.localeCompare(b.partner)),
      timeline: Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour).map((entry) => ({
        hour: entry.hour,
        units: entry.units,
        series: entry.series.size,
        sent: entry.sent,
        received: entry.received
      })),
      bandSummary: Array.from(bandMap.entries()).map(([band, units]) => ({ band, units })).sort((a, b) => bandOrderIndex(a.band) - bandOrderIndex(b.band)),
      modeSummary: Array.from(modeMap.entries()).map(([mode, units]) => ({ mode, units })).sort((a, b) => a.mode.localeCompare(b.mode)),
      warnings: Array.from(warningCounts.entries()).map(([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)),
      overview: {
        units: items.length,
        validUnits,
        malformedUnits: items.length - validUnits,
        sent,
        received,
        seriesCount: series.length,
        qtcPoints: validUnits,
        qsoCount: Array.isArray(qsos) ? qsos.length : 0,
        qtcToQsoRatio: qsos?.length ? items.length / qsos.length : 0,
        pointUnitShare: (validUnits + validQsoUnits) ? validUnits / (validUnits + validQsoUnits) : 0,
        uniquePartners: partnerMap.size,
        averageSeriesSize: series.length ? items.length / series.length : 0,
        medianSeriesSize,
        fullSeries,
        fullSeriesPct: series.length ? fullSeries / series.length : 0,
        warningUnits: items.filter((item) => item.validationWarnings.length).length,
        activeMinutes,
        unitsPerActiveMinute: activeMinutes ? items.length / activeMinutes : 0
      }
    };
  }

  function buildDerivedInternal(qsos, context = {}) {
    if (!qsos) return null;
    const qtcs = Array.isArray(context?.qtcs) ? context.qtcs : [];
    const activityEvents = Array.isArray(context?.events) ? context.events : [...qsos, ...qtcs];
    const dupes = markDupes(qsos, context.analysisMode || activeAnalysisEnv?.analysisMode || ANALYSIS_MODE_DEFAULT);
    const calls = new Set();
    const bands = new Map();
    const bandModes = new Map();
    const countries = new Map();
    const continents = new Map();
    const cqZones = new Map();
    const hours = new Map();
    const minutes = new Map();
    const tenMinutes = new Map();
    const countriesByMonth = new Map();
    const cqZonesByMonth = new Map();
    const ituZonesByMonth = new Map();
    const countriesByYear = new Map();
    const cqZonesByYear = new Map();
    const ituZonesByYear = new Map();
    const wpxPrefixes = new Map();
    const wpxPrefixGroups = new Map();
    const callsignLengths = new Map();
    const notInMasterCalls = new Map();
    const allCalls = new Map();
    const hoursCountries = new Map();
    const bandHourCountry = new Map();
    const ops = new Map();
    const structures = new Map();
    const ituZones = new Map();
    const distanceSummary = makeDistanceSummary();
    const headingSummary = makeHeadingSummary();
    const headingByHour = new Map();
    const freqBins = new Map();
    const operatorMinuteBuckets = new Map();
    const operatorTimeRanges = new Map();
    let hasPerQsoOperator = false;
    const possibleErrors = [];
    const comments = new Set();
    const fields = new Map();
    let minTs = null;
    let maxTs = null;
    let totalPoints = 0;

    const station = deriveStation(qsos);
    const contestMeta = deriveContestMeta(qsos);
    const qtc = buildQtcAnalysis(qtcs, qsos, contestMeta);
    const countryPrefixMap = buildCountryPrefixMap();
    const callMetaCache = new Map();

    qsos.forEach((q) => {
      if (q.call) calls.add(q.call);
      if (typeof q.ts === 'number') {
        if (minTs === null || q.ts < minTs) minTs = q.ts;
        if (maxTs === null || q.ts > maxTs) maxTs = q.ts;
      }
      const bandKey = (SUPPORTED_BANDS.has(q.band)
        ? q.band
        : normalizeBand(q.band, Number.isFinite(q.freq) ? q.freq : null)) || 'unknown';
      if (bandKey && bandKey !== q.band) q.band = bandKey;
      if (!bands.has(bandKey)) {
        bands.set(bandKey, { qsos: 0, uniques: new Set(), dupes: 0 });
      }
      const b = bands.get(bandKey);
      b.qsos += 1;
      if (q.isDupe) b.dupes += 1;
      if (q.call) b.uniques.add(q.call);

      if (!bandModes.has(bandKey)) {
        bandModes.set(bandKey, { band: bandKey, cw: 0, digital: 0, phone: 0, all: 0, points: 0, countries: new Set() });
      }
      const bm = bandModes.get(bandKey);
      const bucket = modeBucket(q.mode);
      if (bucket === 'CW') bm.cw += 1;
      if (bucket === 'Digital') bm.digital += 1;
      if (bucket === 'Phone') bm.phone += 1;
      bm.all += 1;

      const loggedCq = parseZone(q.raw?.CQZ ?? q.raw?.CQ_ZONE);
      const loggedItu = parseZone(q.raw?.ITUZ ?? q.raw?.ITU_ZONE);
      if (loggedCq != null) q.cqZone = loggedCq;
      if (loggedItu != null) q.ituZone = loggedItu;

      let callMeta = q.call ? callMetaCache.get(q.call) : null;
      if (!callMeta && q.call) {
        if (callMetaCache.size >= 25000) callMetaCache.clear();
        const callKey = normalizeCall(q.call);
        callMeta = {
          base: baseCall(callKey),
          callKey,
          prefix: lookupPrefix(q.call),
          structure: classifyCallStructure(q.call),
          wpx: wpxPrefix(q.call)
        };
        callMetaCache.set(q.call, callMeta);
      }
      const prefix = callMeta?.prefix || null;
      const wpx = callMeta?.wpx || '';
      if (wpx) q.wpxPrefix = wpx;
      if (prefix) {
        const cont = normalizeContinent(prefix.continent);
        q.country = prefix.country;
        if (q.cqZone == null) q.cqZone = prefix.cqZone;
        if (q.ituZone == null) q.ituZone = prefix.ituZone;
        q.continent = cont;
        q.prefix = prefix.prefix;
        if (prefix.country) {
          if (!countries.has(prefix.country)) {
            countries.set(prefix.country, {
              qsos: 0,
              uniques: new Set(),
              bands: new Set(),
              bandCounts: new Map(),
              cw: 0,
              digital: 0,
              phone: 0,
              firstTs: q.ts,
              lastTs: q.ts,
              continent: cont || null,
              distSum: 0,
              distCount: 0
            });
          }
          const c = countries.get(prefix.country);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) {
            c.bands.add(q.band);
            c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          }
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
          bm.countries.add(prefix.country);
          if (typeof q.ts === 'number') {
            if (c.firstTs == null || q.ts < c.firstTs) c.firstTs = q.ts;
            if (c.lastTs == null || q.ts > c.lastTs) c.lastTs = q.ts;
          }
        }
        if (cont) {
          if (!continents.has(cont)) {
            continents.set(cont, { qsos: 0, uniques: new Set(), bandCounts: new Map(), cw: 0, digital: 0, phone: 0 });
          }
          const c = continents.get(cont);
          c.qsos += 1;
          if (q.call) c.uniques.add(q.call);
          if (q.band) c.bandCounts.set(q.band, (c.bandCounts.get(q.band) || 0) + 1);
          if (bucket === 'CW') c.cw += 1;
          if (bucket === 'Digital') c.digital += 1;
          if (bucket === 'Phone') c.phone += 1;
        }
      }

      if (q.cqZone) {
        if (!cqZones.has(q.cqZone)) cqZones.set(q.cqZone, { qsos: 0, countries: new Set(), bandCounts: new Map() });
        const z = cqZones.get(q.cqZone);
        z.qsos += 1;
        if (q.country) z.countries.add(q.country);
        if (q.band) z.bandCounts.set(q.band, (z.bandCounts.get(q.band) || 0) + 1);
      }
      if (q.ituZone) {
        if (!ituZones.has(q.ituZone)) ituZones.set(q.ituZone, { qsos: 0, countries: new Set(), bandCounts: new Map() });
        const z = ituZones.get(q.ituZone);
        z.qsos += 1;
        if (q.country) z.countries.add(q.country);
        if (q.band) z.bandCounts.set(q.band, (z.bandCounts.get(q.band) || 0) + 1);
      }

      if (activeAnalysisEnv?.masterSet && activeAnalysisEnv.masterSet.size > 0) {
        const callKey = callMeta?.callKey || '';
        const base = callMeta?.base || '';
        q.inMaster = (callKey && activeAnalysisEnv.masterSet.has(callKey)) || (base && activeAnalysisEnv.masterSet.has(base));
        if (!q.inMaster && q.call) {
          if (!notInMasterCalls.has(q.call)) notInMasterCalls.set(q.call, { qsos: 0, firstTs: q.ts, lastTs: q.ts });
          const n = notInMasterCalls.get(q.call);
          n.qsos += 1;
          if (typeof q.ts === 'number') {
            if (n.firstTs == null || q.ts < n.firstTs) n.firstTs = q.ts;
            if (n.lastTs == null || q.ts > n.lastTs) n.lastTs = q.ts;
          }
        }
      }

      if (typeof q.ts === 'number' && !q.isDupe) {
        const hourBucket = Math.floor(q.ts / 3600000);
        if (!hours.has(hourBucket)) hours.set(hourBucket, { qsos: 0, byBand: new Map() });
        const h = hours.get(hourBucket);
        h.qsos += 1;
        if (!h.byBand.has(bandKey)) h.byBand.set(bandKey, 0);
        h.byBand.set(bandKey, h.byBand.get(bandKey) + 1);

        const minuteBucket = Math.floor(q.ts / 60000);
        if (!minutes.has(minuteBucket)) minutes.set(minuteBucket, { qsos: 0 });
        minutes.get(minuteBucket).qsos += 1;

        const op = normalizeCall(q.op);
        const explicitOp = normalizeCall(q.raw?.OPERATOR);
        if (explicitOp) {
          hasPerQsoOperator = true;
        }
        if (op) {
          if (!operatorMinuteBuckets.has(op)) operatorMinuteBuckets.set(op, new Map());
          const opMinutes = operatorMinuteBuckets.get(op);
          if (!opMinutes.has(minuteBucket)) opMinutes.set(minuteBucket, 0);
          opMinutes.set(minuteBucket, opMinutes.get(minuteBucket) + 1);
          if (!operatorTimeRanges.has(op)) operatorTimeRanges.set(op, { minTs: q.ts, maxTs: q.ts });
          else {
            const opRange = operatorTimeRanges.get(op);
            if (Number.isFinite(q.ts) && q.ts < opRange.minTs) opRange.minTs = q.ts;
            if (Number.isFinite(q.ts) && q.ts > opRange.maxTs) opRange.maxTs = q.ts;
          }
        }

        const tenBucket = Math.floor(q.ts / (60000 * 10));
        if (!tenMinutes.has(tenBucket)) tenMinutes.set(tenBucket, { qsos: 0 });
        tenMinutes.get(tenBucket).qsos += 1;

        if (q.country) {
          if (!hoursCountries.has(hourBucket)) hoursCountries.set(hourBucket, new Map());
          const hc = hoursCountries.get(hourBucket);
          hc.set(q.country, (hc.get(q.country) || 0) + 1);

          if (!bandHourCountry.has(bandKey)) bandHourCountry.set(bandKey, new Map());
          const bandMap = bandHourCountry.get(bandKey);
          if (!bandMap.has(hourBucket)) bandMap.set(hourBucket, new Map());
          const bhc = bandMap.get(hourBucket);
          bhc.set(q.country, (bhc.get(q.country) || 0) + 1);
        }
      }

      if (wpx) {
        if (!wpxPrefixes.has(wpx)) wpxPrefixes.set(wpx, { qsos: 0, uniques: new Set() });
        const p = wpxPrefixes.get(wpx);
        p.qsos += 1;
        if (q.call) p.uniques.add(q.call);

        const countryKey = prefix?.country || 'Unknown';
        if (!wpxPrefixGroups.has(countryKey)) {
          wpxPrefixGroups.set(countryKey, {
            country: countryKey,
            continent: prefix?.continent || '',
            id: prefix?.country ? (countryPrefixMap.get(prefix.country) || '') : '',
            prefixes: new Set()
          });
        }
        wpxPrefixGroups.get(countryKey).prefixes.add(wpx);
      }

      if (q.call) {
        const len = q.call.length;
        if (!callsignLengths.has(len)) callsignLengths.set(len, { callsigns: new Set(), qsos: 0 });
        const lenEntry = callsignLengths.get(len);
        lenEntry.qsos += 1;
        lenEntry.callsigns.add(q.call);
        const struct = callMeta?.structure || classifyCallStructure(q.call);
        if (!structures.has(struct)) structures.set(struct, { callsigns: new Set(), qsos: 0, example: q.call });
        const structEntry = structures.get(struct);
        structEntry.qsos += 1;
        structEntry.callsigns.add(q.call);
        if (!structEntry.example) structEntry.example = q.call;
      }

      if (q.call) {
        if (!allCalls.has(q.call)) allCalls.set(q.call, { qsos: 0, bands: new Set(), bandCounts: new Map(), firstTs: q.ts, lastTs: q.ts });
        const a = allCalls.get(q.call);
        a.qsos += 1;
        if (q.band) {
          a.bands.add(q.band);
          a.bandCounts.set(q.band, (a.bandCounts.get(q.band) || 0) + 1);
        }
        if (typeof q.ts === 'number') {
          if (a.firstTs == null || q.ts < a.firstTs) a.firstTs = q.ts;
          if (a.lastTs == null || q.ts > a.lastTs) a.lastTs = q.ts;
        }
      }

      if (q.op) {
        if (!ops.has(q.op)) ops.set(q.op, { qsos: 0, uniques: new Set() });
        const o = ops.get(q.op);
        o.qsos += 1;
        if (q.call) o.uniques.add(q.call);
      }

      if (station && station.lat != null && station.lon != null) {
        const remote = deriveRemoteLatLon(q, prefix);
        if (remote) {
          const dist = haversineKm(station.lat, station.lon, remote.lat, remote.lon);
          const brng = bearingDeg(station.lat, station.lon, remote.lat, remote.lon);
          q.distance = dist;
          q.bearing = brng;
          distanceSummary.add(dist, q.band);
          headingSummary.add(brng, q.band);
          if (q.country && countries.has(q.country)) {
            const c = countries.get(q.country);
            c.distSum += dist;
            c.distCount += 1;
          }
          if (typeof q.ts === 'number') {
            const hourBucket = Math.floor(q.ts / 3600000);
            if (!headingByHour.has(hourBucket)) headingByHour.set(hourBucket, new Map());
            const hb = headingByHour.get(hourBucket);
            const sector = Math.floor(brng / 30) * 30;
            hb.set(sector, (hb.get(sector) || 0) + 1);
          }
        }
      }

      const comment = q.raw?.COMMENT || q.raw?.NOTES;
      if (comment) comments.add(comment);

      if (q.grid && q.grid.length >= 2) {
        const field = q.grid.slice(0, 2).toUpperCase();
        fields.set(field, (fields.get(field) || 0) + 1);
      } else {
        const remote = deriveRemoteLatLon(q, prefix);
        if (remote) {
          const field = latLonToField(remote.lat, remote.lon);
          if (field) fields.set(field, (fields.get(field) || 0) + 1);
        }
      }

      const freqBand = Number.isFinite(q.freq) ? parseBandFromFreq(q.freq) : null;
      if (!q.call) possibleErrors.push({ reason: 'Missing callsign', q });
      else if ((callMeta?.structure || classifyCallStructure(q.call)) === 'other') possibleErrors.push({ reason: 'Unrecognized callsign pattern', q });
      if (!prefix) possibleErrors.push({ reason: 'Prefix not found in cty.dat', q });
      if (q.ts == null) possibleErrors.push({ reason: 'Invalid/missing time', q });
      if (q.band && !SUPPORTED_BANDS.has(q.band)) {
        const bandLabel = formatBandLabel(q.band) || q.band;
        possibleErrors.push({ reason: `Unexpected band value "${bandLabel}"`, q });
      }
      if (Number.isFinite(q.freq)) {
        if (!freqBand) {
          possibleErrors.push({ reason: `Frequency ${q.freq} MHz is outside supported bands`, q });
        } else if (q.band && q.band !== freqBand) {
          possibleErrors.push({ reason: `Band/freq mismatch: band ${formatBandLabel(q.band)}, freq ${q.freq} MHz (${formatBandLabel(freqBand)})`, q });
        }
        const bin = Math.floor(q.freq * 10) / 10;
        freqBins.set(bin, (freqBins.get(bin) || 0) + 1);
      }
      if (prefix) {
        if (prefix.cqZone && loggedCq != null && loggedCq !== prefix.cqZone) {
          possibleErrors.push({ reason: `CQ zone mismatch: logged ${loggedCq}, prefix ${prefix.cqZone}`, q });
        }
        if (prefix.ituZone && loggedItu != null && loggedItu !== prefix.ituZone) {
          possibleErrors.push({ reason: `ITU zone mismatch: logged ${loggedItu}, prefix ${prefix.ituZone}`, q });
        }
      }
    });

    const bandSummary = [];
    bands.forEach((v, k) => {
      bandSummary.push({ band: k, qsos: v.qsos, dupes: v.dupes, uniques: v.uniques.size });
    });
    bandSummary.sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return (a.band || '').localeCompare(b.band || '');
    });

    const bandModeSummary = Array.from(bandModes.values()).map((b) => ({
      band: b.band,
      cw: b.cw,
      digital: b.digital,
      phone: b.phone,
      all: b.all,
      countries: b.countries.size,
      points: b.points
    })).sort((a, b) => {
      const ai = bandOrderIndex(a.band);
      const bi = bandOrderIndex(b.band);
      if (ai !== bi) return ai - bi;
      return a.band.localeCompare(b.band);
    });

    const countrySummary = [];
    countries.forEach((v, k) => {
      countrySummary.push({
        country: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bands: sortBands(Array.from(v.bands)),
        bandCounts: v.bandCounts,
        cw: v.cw,
        digital: v.digital,
        phone: v.phone,
        continent: v.continent,
        distanceAvg: v.distCount ? v.distSum / v.distCount : null,
        prefixCode: countryPrefixMap.get(k) || '',
        firstTs: v.firstTs,
        lastTs: v.lastTs
      });
    });
    const continentOrder = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC'];
    countrySummary.sort((a, b) => {
      const ai = continentOrder.indexOf((a.continent || '').toUpperCase());
      const bi = continentOrder.indexOf((b.continent || '').toUpperCase());
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (a.prefixCode || a.country).localeCompare(b.prefixCode || b.country);
    });

    const continentSummary = [];
    continents.forEach((v, k) => {
      continentSummary.push({
        continent: k,
        qsos: v.qsos,
        uniques: v.uniques.size,
        bandCounts: v.bandCounts,
        cw: v.cw,
        digital: v.digital,
        phone: v.phone
      });
    });
    continentSummary.sort((a, b) => {
      const ai = continentOrder.indexOf((a.continent || '').toUpperCase());
      const bi = continentOrder.indexOf((b.continent || '').toUpperCase());
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return (a.continent || '').localeCompare(b.continent || '');
    });

    const cqZoneSummary = [];
    cqZones.forEach((v, k) => {
      cqZoneSummary.push({ cqZone: k, qsos: v.qsos, countries: v.countries.size, bandCounts: v.bandCounts });
    });
    cqZoneSummary.sort((a, b) => a.cqZone - b.cqZone);

    const ituZoneSummary = [];
    ituZones.forEach((v, k) => {
      ituZoneSummary.push({ ituZone: k, qsos: v.qsos, countries: v.countries.size, bandCounts: v.bandCounts });
    });
    ituZoneSummary.sort((a, b) => a.ituZone - b.ituZone);

    const hourSeries = Array.from(hours.entries()).sort((a, b) => a[0] - b[0]).map(([hour, v]) => {
      const bandsObj = {};
      v.byBand.forEach((count, band) => {
        bandsObj[band] = count;
      });
      return { hour, qsos: v.qsos, bands: bandsObj };
    });

    const minuteSeries = Array.from(minutes.entries()).sort((a, b) => a[0] - b[0]).map(([minute, v]) => ({ minute, qsos: v.qsos }));
    const activityMinutes = new Map();
    let activityMinTs = minTs;
    let activityMaxTs = maxTs;
    activityEvents.forEach((event) => {
      if (!Number.isFinite(event?.ts)) return;
      if (!Number.isFinite(activityMinTs) || event.ts < activityMinTs) activityMinTs = event.ts;
      if (!Number.isFinite(activityMaxTs) || event.ts > activityMaxTs) activityMaxTs = event.ts;
      const minute = Math.floor(event.ts / 60000);
      if (!activityMinutes.has(minute)) activityMinutes.set(minute, { qsos: 0, qtcs: 0, events: 0 });
      const bucket = activityMinutes.get(minute);
      bucket.events += 1;
      if (event.isQtc) bucket.qtcs += 1;
      else bucket.qsos += 1;
    });
    const activityMinuteSeries = Array.from(activityMinutes.entries()).sort((a, b) => a[0] - b[0]).map(([minute, value]) => ({ minute, ...value }));
    const breakSummary = computeBreakSummary(activityMinutes, 60);
    const tenMinuteSeries = Array.from(tenMinutes.entries()).sort((a, b) => a[0] - b[0]).map(([bucket, v]) => ({ bucket, qsos: v.qsos }));

    const prefixSummary = [];
    wpxPrefixes.forEach((v, k) => {
      prefixSummary.push({ prefix: k, qsos: v.qsos, uniques: v.uniques.size });
    });
    prefixSummary.sort((a, b) => b.qsos - a.qsos || a.prefix.localeCompare(b.prefix));

    const callsignLengthSummary = Array.from(callsignLengths.entries()).map(([len, info]) => ({
      len,
      callsigns: info.callsigns.size,
      qsos: info.qsos
    })).sort((a, b) => a.len - b.len);

    const notInMasterList = Array.from(notInMasterCalls.entries()).map(([call, info]) => ({
      call,
      qsos: info.qsos,
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => b.qsos - a.qsos || a.call.localeCompare(b.call));

    const allCallsList = Array.from(allCalls.entries()).map(([call, info]) => ({
      call,
      qsos: info.qsos,
      bands: Array.from(info.bands).sort(),
      bandCounts: info.bandCounts,
      firstTs: info.firstTs,
      lastTs: info.lastTs
    })).sort((a, b) => a.call.localeCompare(b.call));

    const callCountMap = new Map();
    allCalls.forEach((info, call) => callCountMap.set(call, info.qsos));
    qsos.forEach((q) => {
      if (!q || !q.call) return;
      q.callCount = callCountMap.get(q.call) || 0;
    });

    let operatorsSummary = Array.from(ops.entries()).map(([op, info]) => ({
      op,
      qsos: info.qsos,
      uniques: info.uniques.size
    })).sort((a, b) => b.qsos - a.qsos || a.op.localeCompare(b.op));
    const headerOperators = parseOperatorsList(contestMeta?.operators);
    if (headerOperators.length) {
      const stationNorm = normalizeCall(contestMeta?.stationCallsign || '');
      const opKeys = Array.from(ops.keys()).map((op) => normalizeCall(op)).filter(Boolean);
      const onlyStation = opKeys.length === 0 || (opKeys.length === 1 && stationNorm && opKeys[0] === stationNorm);
      if (onlyStation) {
        operatorsSummary = headerOperators.map((op) => ({ op, qsos: 0, uniques: 0 }));
      }
    }

    const countryMonthBuckets = buildCountryMonthBuckets(qsos);
    const cqZoneMonthBuckets = buildZoneMonthBuckets(qsos, 'cq');
    const ituZoneMonthBuckets = buildZoneMonthBuckets(qsos, 'itu');
    const countryYearBuckets = buildCountryYearBuckets(qsos);
    const cqZoneYearBuckets = buildZoneYearBuckets(qsos, 'cq');
    const ituZoneYearBuckets = buildZoneYearBuckets(qsos, 'itu');
    const monthColumns = new Set();
    const yearColumns = new Set();
    for (const [, data] of countryMonthBuckets.entries()) {
      for (const key of data.months.keys()) monthColumns.add(key);
    }
    for (const [zone, data] of cqZoneMonthBuckets.entries()) {
      cqZonesByMonth.set(zone, data);
      for (const key of data.months.keys()) monthColumns.add(key);
    }
    for (const [zone, data] of ituZoneMonthBuckets.entries()) {
      ituZonesByMonth.set(zone, data);
      for (const key of data.months.keys()) monthColumns.add(key);
    }
    for (const [country, data] of countryMonthBuckets.entries()) countriesByMonth.set(country, data);
    for (const [zone, data] of cqZoneYearBuckets.entries()) {
      cqZonesByYear.set(zone, data);
      for (const key of data.years.keys()) yearColumns.add(key);
    }
    for (const [zone, data] of ituZoneYearBuckets.entries()) {
      ituZonesByYear.set(zone, data);
      for (const key of data.years.keys()) yearColumns.add(key);
    }
    for (const [country, data] of countryYearBuckets.entries()) {
      countriesByYear.set(country, data);
      for (const key of data.years.keys()) yearColumns.add(key);
    }

    const structureSummary = Array.from(structures.entries()).map(([struct, info]) => ({
      struct,
      example: info.example,
      callsigns: info.callsigns.size,
      qsos: info.qsos
    })).sort((a, b) => b.qsos - a.qsos || a.struct.localeCompare(b.struct));

    const headingByHourSeries = Array.from(headingByHour.entries()).sort((a, b) => a[0] - b[0]).map(([hour, m]) => ({
      hour,
      sectors: Array.from(m.entries()).sort((a, b) => a[0] - b[0]).map(([sector, count]) => ({ sector, count }))
    }));

    const frequencySummary = Array.from(freqBins.entries()).sort((a, b) => a[0] - b[0]).map(([freq, count]) => ({ freq, count }));
    const fieldsSummary = Array.from(fields.entries()).map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count || a.field.localeCompare(b.field));

    const scoringEvents = activityEvents.length ? activityEvents : qsos;
    const scoring = computeContestScoringSummary(scoringEvents, contestMeta, {
      logFile: context?.logFile || null,
      sourcePath: context?.sourcePath || '',
      scoringRuleOverride: context?.scoringRuleOverride || ''
    });
    const computedPointByEvent = new Map();
    if (scoring?.effectivePointsSource === 'computed' && Array.isArray(scoring.computedPointsByIndex)) {
      scoringEvents.forEach((event, idx) => computedPointByEvent.set(event, Number(scoring.computedPointsByIndex[idx]) || 0));
    }
    const effectivePointsByIndex = qsos.map((q) => (
      computedPointByEvent.has(q) ? computedPointByEvent.get(q) : (Number.isFinite(q?.points) ? q.points : 0)
    ));
    const hourPoints = new Map();
    const minutePoints = new Map();
    qsos.forEach((q, idx) => {
      if (!Number.isFinite(q?.ts) || q?.isDupe) return;
      const points = Number(effectivePointsByIndex[idx] || 0);
      if (!Number.isFinite(points)) return;
      const hourBucket = Math.floor(q.ts / 3600000);
      const minuteBucket = Math.floor(q.ts / 60000);
      hourPoints.set(hourBucket, (hourPoints.get(hourBucket) || 0) + points);
      minutePoints.set(minuteBucket, (minutePoints.get(minuteBucket) || 0) + points);
    });
    const hourPointSeries = Array.from(hourPoints.entries()).sort((a, b) => a[0] - b[0]).map(([hour, points]) => ({ hour, points }));
    const minutePointSeries = Array.from(minutePoints.entries()).sort((a, b) => a[0] - b[0]).map(([minute, points]) => ({ minute, points }));
    const effectivePointsTotal = effectivePointsByIndex.reduce((sum, p) => sum + (Number.isFinite(p) ? p : 0), 0);
    const effectivePointsByBand = new Map();
    qsos.forEach((q, idx) => {
      const points = Number(effectivePointsByIndex[idx] || 0);
      if (!Number.isFinite(points)) return;
      const bandKey = normalizeBand(q?.band, Number.isFinite(q?.freq) ? q.freq : null) || 'unknown';
      effectivePointsByBand.set(bandKey, (effectivePointsByBand.get(bandKey) || 0) + points);
    });
    bandModeSummary.forEach((entry) => {
      entry.points = effectivePointsByBand.get(entry.band) || 0;
    });
    totalPoints = effectivePointsTotal;
    const monthColumnList = Array.from(monthColumns).sort((a, b) => a.localeCompare(b));
    const yearColumnList = Array.from(yearColumns).sort((a, b) => Number(a) - Number(b));
    const operatingStyle = buildOperatingStyleSummary(qsos);

    return {
      dupes,
      countriesByYear,
      countriesByMonth,
      cqZonesByYear,
      cqZonesByMonth,
      ituZonesByYear,
      ituZonesByMonth,
      yearColumns: yearColumnList,
      monthColumns: monthColumnList,
      uniqueCallsCount: calls.size,
      bandSummary,
      bandModeSummary,
      countrySummary,
      continentSummary,
      cqZoneSummary,
      ituZoneSummary,
      hourSeries,
      minuteSeries,
      activityMinuteSeries,
      hourPointSeries,
      minutePointSeries,
      tenMinuteSeries,
      prefixSummary,
      prefixGroups: wpxPrefixGroups,
      callsignLengthSummary,
      notInMasterList,
      allCallsList,
      hoursCountries,
      bandHourCountry,
      operatorsSummary,
      structureSummary,
      distanceSummary: distanceSummary.export(),
      headingSummary: headingSummary.export(),
      headingByHourSeries,
      frequencySummary,
      fieldsSummary,
      operatorBreakData: Array.from(operatorMinuteBuckets.entries()).map(([op, minuteBuckets]) => {
        const range = operatorTimeRanges.get(op) || {};
        return {
          op,
          minutes: Array.from(minuteBuckets.keys()).sort((a, b) => a - b),
          minTs: Number.isFinite(range.minTs) ? range.minTs : null,
          maxTs: Number.isFinite(range.maxTs) ? range.maxTs : null
        };
      }),
      station,
      contestMeta,
      scoring,
      qtc,
      hasPerQsoOperator,
      comments: Array.from(comments),
      possibleErrors,
      timeRange: { minTs: activityMinTs, maxTs: activityMaxTs },
      breakSummary,
      operatingStyle,
      totalPoints,
      effectivePointsTotal
    };
  }

  function buildDerived(qsos, context = {}, resources = {}) {
    return withAnalysisEnv(resources, () => buildDerivedInternal(qsos, context));
  }

  function analyzeLogText(text, filename, context = {}, resources = {}) {
    return withAnalysisEnv(resources, () => {
      const qsoData = parseLogFile(text, filename);
      const derived = buildDerivedInternal(qsoData.qsos, {
        ...context,
        qtcs: qsoData.qtcs,
        events: qsoData.events
      });
      return { qsoData, derived };
    });
  }

  function deriveLog(qsoData, context = {}, resources = {}) {
    return withAnalysisEnv(resources, () => {
      const safeData = qsoData && typeof qsoData === 'object'
        ? Object.assign({}, qsoData, {
          qsos: Array.isArray(qsoData.qsos) ? qsoData.qsos : [],
          qtcs: Array.isArray(qsoData.qtcs) ? qsoData.qtcs : [],
          events: Array.isArray(qsoData.events) ? qsoData.events : []
        })
        : { type: 'unknown', qsos: [], qtcs: [], events: [] };
      const derived = buildDerivedInternal(safeData.qsos, {
        ...context,
        qtcs: safeData.qtcs,
        events: safeData.events.length ? safeData.events : [...safeData.qsos, ...safeData.qtcs]
      });
      return { qsoData: safeData, derived };
    });
  }

  const api = {
    parseCtyDat,
    parseMasterDta,
    parseLogFile,
    parseCabrillo,
    parseCabrilloFreqToken,
    normalizeScoringRuleOverride,
    isWrtcScoringRuleId,
    getWrtcScoringRuleLabel,
    isWrtcScoringCandidate,
    parseClaimedScoreNumber,
    getArchiveFolderFromPath,
    buildScoringIndexes,
    normalizeCountryName,
    computeRuleQsoPoints: (rule, qsos, station, assumptions, resources = {}) => (
      withAnalysisEnv(resources, () => computeRuleQsoPoints(rule, qsos, station, assumptions))
    ),
    computeRuleMultipliers: (rule, qsos, station, pointState, assumptions, resources = {}) => (
      withAnalysisEnv(resources, () => computeRuleMultipliers(rule, qsos, station, pointState, assumptions))
    ),
    evaluateRuleFormula: (rule, pointState, multState, station, assumptions, resources = {}) => (
      withAnalysisEnv(resources, () => evaluateRuleFormula(rule, pointState, multState, station, assumptions))
    ),
    resolveContestRuleSet: (contestMeta, context = {}, resources = {}) => (
      withAnalysisEnv(resources, () => resolveContestRuleSet(contestMeta, context))
    ),
    computeContestScoringSummary: (qsos, contestMeta, context = {}, resources = {}) => (
      withAnalysisEnv(resources, () => computeContestScoringSummary(qsos, contestMeta, context))
    ),
    buildQtcAnalysis: (qtcs, qsos, contestMeta, resources = {}) => (
      withAnalysisEnv(resources, () => buildQtcAnalysis(qtcs, qsos, contestMeta))
    ),
    buildDerived,
    analyzeLogText,
    deriveLog
  };

  const existing = globalScope && typeof globalScope.SH6AnalysisCore === 'object' && globalScope.SH6AnalysisCore
    ? globalScope.SH6AnalysisCore
    : {};
  globalScope.SH6AnalysisCore = Object.assign({}, existing, api);
})(typeof globalThis !== 'undefined' ? globalThis : self);
