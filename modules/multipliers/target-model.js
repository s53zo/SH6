import { multiplierMode } from './overview-model.js';

const token = (value) => String(value ?? '').trim().toUpperCase();
const knownBands = ['2190M', '630M', '160M', '80M', '60M', '40M', '30M', '20M', '17M', '15M', '12M', '10M', '6M', '4M', '2M', '1.25M', '70CM', '33CM', '23CM', '13CM', '9CM', '6CM', '3CM', '1.25CM', '6MM', '4MM', '2.5MM', '2MM', '1MM'];

// Canonical scoring scopes, never copied from an unrelated historical credit.
export function multiplierTargetScope(scope, group, band, mode) {
  if (scope === 'per_band') return band;
  if (scope === 'per_mode') return mode;
  if (scope === 'per_band_per_mode') return `${band}|${mode}`;
  if (scope === 'per_hf_band_group') return ['160M', '80M', '40M'].includes(band) ? 'LOW' : ['20M', '15M', '10M'].includes(band) ? 'HIGH' : band;
  if (scope === 'bartg_hf_mixed') return group === 'bartg_continent' ? 'ALL' : band;
  if (['once', 'once_total', 'once_total_or_rule_defined'].includes(scope)) return 'ALL';
  return null;
}

export function resolveMultiplierTarget(source, settings, at, filters = {}) {
  const descriptor = source.scoring.analyticalMetadata?.targetDescriptors;
  const unavailable = (reason) => ({ supported: false, reason });
  if (!descriptor) return unavailable('The scorer has not supplied multiplier-target descriptors. Reload this log to obtain rule-aware targets.');
  const groups = descriptor.groups.map((group) => group.id);
  const group = settings.targetGroup || filters.group || groups[0];
  if (!groups.includes(group)) return unavailable('This multiplier type is not a scoring target for the selected contest and station perspective.');
  const bands = (descriptor.bands?.map(token) || knownBands).filter((band) => !(descriptor.excludedBands || []).map(token).includes(band));
  const modes = descriptor.modes ? [...new Set(descriptor.modes.map(multiplierMode))] : ['CW', 'SSB', 'DIG'];
  const historical = source.dated.find((event) => event.ts <= at && bands.includes(event.band) && modes.includes(event.mode));
  const band = token(settings.targetBand || filters.band || historical?.band || bands[0]);
  const mode = multiplierMode(settings.targetMode || filters.mode || historical?.mode || modes[0]);
  if (!bands.includes(band)) return unavailable('The target band is not supported by the implemented contest band definition.');
  if (!modes.includes(mode)) return unavailable('The target mode is not supported by the implemented contest mode definition.');
  const countingScope = descriptor.countingScope;
  const scopeKey = multiplierTargetScope(countingScope, group, band, mode);
  if (!scopeKey) return unavailable(`The ${countingScope} target scope has no canonical analytical resolver.`);
  const weightEntry = Object.entries(descriptor.bandWeights || {}).find(([key]) => token(key) === band);
  const weight = weightEntry ? Number(weightEntry[1]) : 1;
  if (!Number.isFinite(weight) || weight <= 0) return unavailable('No valid scoring weight is available for this target band.');
  const capacity = descriptor.groups.find((item) => item.id === group).capacity;
  const prior = (source.scoring.multiplierCredits || []).filter((credit) => credit.group === group && credit.scopeKey === scopeKey && credit.timestamp != null && credit.timestamp <= at);
  const used = new Set(prior.map((credit) => credit.entityKey)).size;
  const remaining = capacity == null ? null : Math.max(0, capacity - used);
  return { supported: true, target: { group, band, mode, countingScope, scopeKey, weight, capacity, remaining }, groups, bands, modes,
    limitation: descriptor.limitation,
    eligibilityKnown: Boolean(descriptor.bands && descriptor.modes),
    correctedLegacySettings: Boolean((settings.targetScope && settings.targetScope !== scopeKey) || (settings.targetWeight != null && Number(settings.targetWeight) !== weight)) };
}
