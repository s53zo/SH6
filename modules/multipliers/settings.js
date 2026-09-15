// Only small, recognized controls belong in sessions; never serialize analytical caches.
export function normalizeMultiplierSettings(input) {
  const source = input && typeof input === 'object' ? input : {};
  const output = {};
  const scalar = (from, to, key) => {
    if (!Object.hasOwn(from, key)) return;
    const value = from[key];
    if (typeof value === 'string') to[key] = value.slice(0, 160);
    else if (typeof value === 'number' && Number.isFinite(value)) to[key] = value;
    else if (typeof value === 'boolean') to[key] = value;
    else if (value === null) to[key] = null;
  };
  if (['hourly', 'rate', 'cumulative', 'breakdown', 'timeline', 'efficiency', 'tradeoff', 'undated'].includes(source.view)) output.view = source.view;
  if (['total', 'band', 'group'].includes(source.cumulativeBy)) output.cumulativeBy = source.cumulativeBy;
  if ([15, 30, 60].includes(Number(source.windowMinutes))) output.windowMinutes = Number(source.windowMinutes);
  for (const key of ['mode', 'group']) scalar(source, output, key);
  for (const [key, min, max] of [['yScale', 0.1, 4]]) {
    const value = Number(source[key]);
    if (Number.isFinite(value) && value >= min && value <= max) output[key] = value;
  }
  const slots = {};
  for (const id of ['A', 'B', 'C', 'D']) {
    const entry = source.tradeoffBySlot?.[id];
    if (!entry || typeof entry !== 'object') continue;
    const settings = {};
    for (const key of ['at', 'lookbackMinutes', 'targetGroup', 'targetBand', 'targetMode', 'targetScope', 'targetWeight', 'averagePoints', 'horizonMinutes']) scalar(entry, settings, key);
    if (Object.hasOwn(settings, 'at') && !Number.isFinite(new Date(Number(settings.at)).getTime())) delete settings.at;
    if (Object.hasOwn(settings, 'lookbackMinutes') && (!Number.isFinite(Number(settings.lookbackMinutes)) || Number(settings.lookbackMinutes) < 1 || Number(settings.lookbackMinutes) > 120)) delete settings.lookbackMinutes;
    const scenarios = {};
    for (const strategy of ['run', 'sp', 'hunt']) {
      const value = entry.scenarios?.[strategy];
      if (!value || typeof value !== 'object') continue;
      const scenario = {};
      for (const key of ['rate', 'averagePoints', 'targetAveragePoints', 'credits', 'targetQsos', 'probability', 'searchMinutes', 'ordinaryBelgian', 'targetBelgian', 'ordinaryDistanceBonus', 'targetDistanceBonus', 'ordinaryThirdBandProbability', 'targetThirdBandProbability']) scalar(value, scenario, key);
      scenarios[strategy] = scenario;
    }
    if (Object.keys(scenarios).length) settings.scenarios = scenarios;
    slots[id] = settings;
  }
  if (Object.keys(slots).length) output.tradeoffBySlot = slots;
  return output;
}
