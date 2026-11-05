export const creditKey=c=>JSON.stringify([c.group,c.entityKey,c.countingScope,c.scopeKey || 'ALL']);
export async function calculateImpact({data,indexes,derive,scoreEmpty,baselineScoring}) {
  const clone=structuredClone(data),removed=new Set(indexes),removedObjects=new Set(clone.qsos.filter((_,i)=>removed.has(i)));
  const key=q=>JSON.stringify([q.lineIndex,q.qsoNumber,q.id,q.ts,q.call,q.band,q.mode,q.exchSent,q.exchRcvd]);
  const removedKeys=new Set([...removedObjects].map(key));
  // Canonicalize detached session copies while preserving source event order.
  clone.qsos=clone.qsos.filter((_,i)=>!removed.has(i));
  const qtcs=Array.isArray(clone.qtcs) && clone.qtcs.length?clone.qtcs:(clone.events || []).filter(e=>e.isQtc || e.eventType==='QTC');
  const retained=new Map(clone.qsos.map(q=>[key(q),q]));
  const events=(clone.events || []).filter(e=>e.isQtc || e.eventType==='QTC' || !removedKeys.has(key(e))).map(e=>retained.get(key(e)) || e);
  const present=new Set(events.map(key));
  clone.events=[...events,...clone.qsos.filter(q=>!present.has(key(q))),...qtcs.filter(q=>!present.has(key(q)))];
  const hypothetical=clone.qsos.length?(await derive(clone))?.derived?.scoring:await scoreEmpty(qtcs);
  const before=baselineScoring,after=hypothetical;
  const beforeCredits=before?.multiplierCredits || [],afterKeys=new Set((after?.multiplierCredits || []).map(creditKey));
  const lost=before?.ruleId && before.ruleId===after?.ruleId && before?.multiplierModelSupported && after?.multiplierModelSupported?beforeCredits.filter(c=>!afterKeys.has(creditKey(c))):null;
  const sourceContacts=indexes.map(i=>data.qsos[i]).filter(Boolean);
  const earned=before?.multiplierModelSupported?beforeCredits.filter(c=>!c.isQtc && sourceContacts.some(q=>q.ts===c.timestamp && q.band===c.band && String(q.call).toUpperCase()===String(c.callsign).toUpperCase() && (q.qsoNumber==null || Number(q.qsoNumber)===Number(c.qsoNumber)))).length:null;
  const finite=s=>s?.supported && typeof s.computedScore==='number' && Number.isFinite(s.computedScore);
  const numeric=finite(before) && finite(after) && before.ruleId===after.ruleId;
  return {lostCredits:lost,earnedCredits:earned,scoreWithout:numeric?after.computedScore:null,
    creditLabel:lost?`${earned ?? 'Unknown'} first credits; ${lost.length} depend on sequence`:'Multiplier impact unavailable',
    label:numeric?`Hypothetical score without these contacts: ${after.computedScore.toLocaleString()}; difference ${(before.computedScore-after.computedScore).toLocaleString()}.`:'Hypothetical score unavailable for this scoring model or context.'};
}
