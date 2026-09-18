import { deflateSync, Inflate } from '../../vendor/fflate-raw.js';

export const PERMALINK_V3_PREFIX = 'v3.';
export const PERMALINK_POSITIONAL_SCHEMA_VERSION = 3;

// Practical URL and decompression limits. Normal SH6 states are a few hundred
// bytes; these caps leave generous room for legitimate filters and metadata.
export const PERMALINK_V3_LIMITS = Object.freeze({
  encodedChars: 32768,
  compressedBytes: 24576,
  decompressedBytes: 131072,
  nestingDepth: 12,
  arrayLength: 64,
  stringLength: 4096,
  nodeCount: 4096,
  slotCount: 4,
  futureTopLevelFields: 8,
  inflateInputChunkBytes: 256
});

// v3 top-level tuple. Index 0 is the positional wire-schema version. The
// remaining indexes map to the existing v2 compact object. New optional fields
// may only be appended; decoders ignore a bounded number of safe trailing fields.
export const POSITIONAL_TOP_LEVEL_FIELDS = Object.freeze([
  'schemaVersion', // 0
  'am',            // 1 analysis mode
  'c',             // 2 compare count
  'cs',            // 3 compare score mode
  'mv',            // 4 multiplier overview tuple
  'mo',            // 5 multiplier opportunities tuple
  'sy',            // 6 synchronized scrolling
  'sk',            // 7 sticky compare headings
  'tr',            // 8 synchronized time range [start, end]
  'f',             // 9 compare-focus tuple
  'g',             // 10 global band filter
  'gr',            // 11 global radio filter
  'rh',            // 12 radio heatmap tuple
  'b',             // 13 break threshold
  'p',             // 14 passed-QSO window
  'z',             // 15 log page size
  'n',             // 16 log page
  'w',             // 17 compare window start
  'x',             // 18 compare window size
  'wp',            // 19 WPX column mode
  'py',            // 20 selected years
  'pm',            // 21 selected months
  'l',             // 22 log-filter tuple
  's'              // 23 slot tuples
]);

export const POSITIONAL_SLOT_FIELDS = Object.freeze([
  'i', // 0 slot ID
  'k', // 1 skipped empty slot flag
  'n', // 2 filename
  'z', // 3 byte size
  'o', // 4 source label
  'p', // 5 archive path
  'q', // 6 scoring-rule override
  't', // 7 source type (a/l)
  's', // 8 spot-settings tuple
  'r'  // 9 RBN-settings tuple
]);

const TOP_INDEX = Object.freeze({
  schemaVersion: 0,
  multiplierOverview: 4,
  multiplierOpportunities: 5,
  compareFocus: 9,
  radioHeat: 12,
  logFilters: 22,
  slots: 23
});

const MULTIPLIER_FIELDS = Object.freeze([
  'view', 'cumulativeBy', 'windowMinutes', 'mode', 'group', 'yScale'
]);
const TRADEOFF_FIELDS = Object.freeze([
  'at', 'lookbackMinutes', 'targetGroup', 'targetBand', 'targetMode',
  'targetScope', 'targetWeight', 'averagePoints', 'horizonMinutes'
]);
const SCENARIO_FIELDS = Object.freeze([
  'rate', 'averagePoints', 'targetAveragePoints', 'credits', 'targetQsos',
  'probability', 'searchMinutes', 'ordinaryBelgian', 'targetBelgian',
  'ordinaryDistanceBonus', 'targetDistanceBonus',
  'ordinaryThirdBandProbability', 'targetThirdBandProbability'
]);
const TRADEOFF_SLOT_IDS = Object.freeze(['A', 'B', 'C', 'D']);
const SCENARIO_IDS = Object.freeze(['run', 'sp', 'hunt']);
const OPPORTUNITY_FIELDS = Object.freeze(['r', 'w', 's', 'p', 'g', 'b', 'm', 'c', 'e', 't']);
const FOCUS_FIELDS = Object.freeze(['c', 'r', 'm', 'o', 'p', 'q', 'u', 'v', 's', 'w', 't']);
const RADIO_HEAT_FIELDS = Object.freeze(['m', 'a', 'b']);
const LOG_FILTER_FIELDS = Object.freeze([
  's', 'f', 'b', 'm', 'j', 'o', 'l', 't', 'c', 'k', 'q', 'i',
  'v', 'r', 'rd', 'y', 'h', 'u', 'd'
]);
const OPERATING_STYLE_FIELDS = Object.freeze(['b', 'r']);
const SPOT_FIELDS = Object.freeze(['w', 'b']);
const RBN_FIELDS = Object.freeze(['w', 'b', 'd']);
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const EXPLICIT_NULL = Object.freeze([]);
const MULTIPLIER_TRADEOFF_INDEX = MULTIPLIER_FIELDS.length;
const TRADEOFF_SCENARIOS_INDEX = TRADEOFF_FIELDS.length;
const LOG_FILTER_STYLE_INDEX = LOG_FILTER_FIELDS.indexOf('v');
const SLOT_SPOTS_INDEX = POSITIONAL_SLOT_FIELDS.indexOf('s');
const SLOT_RBN_INDEX = POSITIONAL_SLOT_FIELDS.indexOf('r');

function trimTuple(tuple) {
  let end = tuple.length;
  while (end > 0 && tuple[end - 1] === null) end -= 1;
  return end === tuple.length ? tuple : tuple.slice(0, end);
}

function encodeScalarValue(value) {
  return value === null ? EXPLICIT_NULL : value;
}

function assertKnownKeys(object, fields, label, ignored = []) {
  const known = new Set([...fields, ...ignored]);
  const unknown = Object.keys(object).filter((key) => !known.has(key));
  if (unknown.length) throw new TypeError(`${label} contains unsupported fields: ${unknown.join(', ')}`);
}

function scalarObjectToTuple(source, fields, label = 'positional object', ignored = []) {
  const object = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  assertKnownKeys(object, fields, label, ignored);
  return trimTuple(fields.map((key) => (
    Object.prototype.hasOwnProperty.call(object, key) ? encodeScalarValue(object[key]) : null
  )));
}

function isExplicitNull(value) {
  return Array.isArray(value) && value.length === 0;
}

function tupleToScalarObject(tuple, fields, label) {
  if (!Array.isArray(tuple)) throw new TypeError(`${label} must be a tuple`);
  const output = {};
  const count = Math.min(tuple.length, fields.length);
  for (let index = 0; index < count; index += 1) {
    const value = tuple[index];
    if (value === null || value === undefined) continue;
    output[fields[index]] = isExplicitNull(value) ? null : value;
  }
  return output;
}

function encodeMultiplierSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const tuple = scalarObjectToTuple(value, MULTIPLIER_FIELDS, 'multiplier settings', ['tradeoffBySlot']);
  if (value.tradeoffBySlot && typeof value.tradeoffBySlot === 'object') {
    assertKnownKeys(value.tradeoffBySlot, TRADEOFF_SLOT_IDS, 'multiplier slot map');
    const slots = TRADEOFF_SLOT_IDS.map((id) => {
      const entry = value.tradeoffBySlot[id];
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
      const settings = scalarObjectToTuple(entry, TRADEOFF_FIELDS, 'multiplier slot settings', ['scenarios']);
      if (entry.scenarios && typeof entry.scenarios === 'object') {
        assertKnownKeys(entry.scenarios, SCENARIO_IDS, 'multiplier scenario map');
        const scenarios = SCENARIO_IDS.map((strategy) => {
          const scenario = entry.scenarios[strategy];
          return scenario && typeof scenario === 'object' && !Array.isArray(scenario)
            ? scalarObjectToTuple(scenario, SCENARIO_FIELDS, 'multiplier scenario')
            : null;
        });
        settings[TRADEOFF_SCENARIOS_INDEX] = trimTuple(scenarios);
      }
      return trimTuple(settings);
    });
    tuple[MULTIPLIER_TRADEOFF_INDEX] = trimTuple(slots);
  }
  return trimTuple(tuple);
}

function decodeMultiplierSettings(tuple) {
  const output = tupleToScalarObject(tuple, MULTIPLIER_FIELDS, 'multiplier settings');
  const slotsTuple = tuple[MULTIPLIER_TRADEOFF_INDEX];
  if (slotsTuple !== null && slotsTuple !== undefined) {
    if (!Array.isArray(slotsTuple) || slotsTuple.length > TRADEOFF_SLOT_IDS.length) {
      throw new TypeError('multiplier slot settings are invalid');
    }
    const tradeoffBySlot = {};
    slotsTuple.forEach((entry, index) => {
      if (entry === null || entry === undefined) return;
      const settings = tupleToScalarObject(entry, TRADEOFF_FIELDS, 'multiplier slot settings');
      const scenariosTuple = entry[TRADEOFF_SCENARIOS_INDEX];
      if (scenariosTuple !== null && scenariosTuple !== undefined) {
        if (!Array.isArray(scenariosTuple) || scenariosTuple.length > SCENARIO_IDS.length) {
          throw new TypeError('multiplier scenarios are invalid');
        }
        const scenarios = {};
        scenariosTuple.forEach((scenario, scenarioIndex) => {
          if (scenario === null || scenario === undefined) return;
          scenarios[SCENARIO_IDS[scenarioIndex]] = tupleToScalarObject(
            scenario,
            SCENARIO_FIELDS,
            'multiplier scenario'
          );
        });
        settings.scenarios = scenarios;
      }
      tradeoffBySlot[TRADEOFF_SLOT_IDS[index]] = settings;
    });
    output.tradeoffBySlot = tradeoffBySlot;
  }
  return output;
}

function encodeLogFilters(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const tuple = scalarObjectToTuple(value, LOG_FILTER_FIELDS, 'log filters');
  if (value.v && typeof value.v === 'object' && !Array.isArray(value.v)) {
    tuple[LOG_FILTER_STYLE_INDEX] = scalarObjectToTuple(value.v, OPERATING_STYLE_FIELDS, 'operating-style filter');
  }
  return trimTuple(tuple);
}

function decodeLogFilters(tuple) {
  const output = tupleToScalarObject(tuple, LOG_FILTER_FIELDS, 'log filters');
  if (tuple[LOG_FILTER_STYLE_INDEX] !== null && tuple[LOG_FILTER_STYLE_INDEX] !== undefined) {
    output.v = tupleToScalarObject(tuple[LOG_FILTER_STYLE_INDEX], OPERATING_STYLE_FIELDS, 'operating-style filter');
  }
  return output;
}

function encodeSlot(slot) {
  // Values that the existing v2 inflater deterministically derives are omitted
  // from v3. This changes no restored session semantics and saves substantially
  // more than compressing repeated archive defaults.
  const canonical = { ...slot };
  delete canonical.x;
  delete canonical.b;
  const path = typeof canonical.p === 'string' ? canonical.p : '';
  const derivedName = path ? (path.split('/').pop() || '') : '';
  if (derivedName && canonical.n === derivedName) delete canonical.n;
  if ((path && canonical.o === 'Archive') || (!path && canonical.o === 'Local')) delete canonical.o;
  delete canonical.t;
  const tuple = scalarObjectToTuple(canonical, POSITIONAL_SLOT_FIELDS, 'slot');
  if (slot.s && typeof slot.s === 'object' && !Array.isArray(slot.s)) {
    tuple[SLOT_SPOTS_INDEX] = scalarObjectToTuple(slot.s, SPOT_FIELDS, 'spot settings');
  }
  if (slot.r && typeof slot.r === 'object' && !Array.isArray(slot.r)) {
    tuple[SLOT_RBN_INDEX] = scalarObjectToTuple(slot.r, RBN_FIELDS, 'RBN settings');
  }
  return trimTuple(tuple);
}

function decodeSlot(tuple) {
  const slot = tupleToScalarObject(tuple, POSITIONAL_SLOT_FIELDS, 'slot');
  if (tuple[SLOT_SPOTS_INDEX] !== null && tuple[SLOT_SPOTS_INDEX] !== undefined) {
    slot.s = tupleToScalarObject(tuple[SLOT_SPOTS_INDEX], SPOT_FIELDS, 'spot settings');
  }
  if (tuple[SLOT_RBN_INDEX] !== null && tuple[SLOT_RBN_INDEX] !== undefined) {
    slot.r = tupleToScalarObject(tuple[SLOT_RBN_INDEX], RBN_FIELDS, 'RBN settings');
  }
  return slot;
}

function setTupleField(tuple, index, value) {
  while (tuple.length <= index) tuple.push(null);
  tuple[index] = value;
}

export function compactStateToPositional(compact) {
  if (!compact || typeof compact !== 'object' || Array.isArray(compact) || Number(compact.v) !== 2) {
    throw new TypeError('A v2 compact session object is required');
  }
  assertKnownKeys(compact, POSITIONAL_TOP_LEVEL_FIELDS.slice(1), 'compact session', ['v']);
  const tuple = [PERMALINK_POSITIONAL_SCHEMA_VERSION];
  const directFields = POSITIONAL_TOP_LEVEL_FIELDS.slice(1);
  directFields.forEach((key, offset) => {
    if (!Object.prototype.hasOwnProperty.call(compact, key)) return;
    setTupleField(tuple, offset + 1, encodeScalarValue(compact[key]));
  });

  if (compact.mv && typeof compact.mv === 'object') setTupleField(tuple, TOP_INDEX.multiplierOverview, encodeMultiplierSettings(compact.mv));
  if (compact.mo && typeof compact.mo === 'object') setTupleField(tuple, TOP_INDEX.multiplierOpportunities, scalarObjectToTuple(compact.mo, OPPORTUNITY_FIELDS, 'multiplier opportunities'));
  if (compact.f && typeof compact.f === 'object') setTupleField(tuple, TOP_INDEX.compareFocus, scalarObjectToTuple(compact.f, FOCUS_FIELDS, 'compare focus'));
  if (compact.rh && typeof compact.rh === 'object') setTupleField(tuple, TOP_INDEX.radioHeat, scalarObjectToTuple(compact.rh, RADIO_HEAT_FIELDS, 'radio heatmap'));
  if (compact.l && typeof compact.l === 'object') setTupleField(tuple, TOP_INDEX.logFilters, encodeLogFilters(compact.l));
  if (Array.isArray(compact.s)) {
    if (compact.s.length > PERMALINK_V3_LIMITS.slotCount) throw new RangeError('too many permalink slots');
    setTupleField(tuple, TOP_INDEX.slots, compact.s.map(encodeSlot));
  }
  const positional = trimTuple(tuple);
  validatePositionalPayload(positional);
  return positional;
}

export function positionalToCompactState(tuple) {
  validatePositionalPayload(tuple);
  if (tuple[TOP_INDEX.schemaVersion] !== PERMALINK_POSITIONAL_SCHEMA_VERSION) return null;
  const compact = { v: 2 };
  const directFields = POSITIONAL_TOP_LEVEL_FIELDS.slice(1);
  const count = Math.min(tuple.length - 1, directFields.length);
  for (let offset = 0; offset < count; offset += 1) {
    const value = tuple[offset + 1];
    if (value === null || value === undefined) continue;
    compact[directFields[offset]] = isExplicitNull(value) ? null : value;
  }

  if (tuple[TOP_INDEX.multiplierOverview] !== null && tuple[TOP_INDEX.multiplierOverview] !== undefined) compact.mv = decodeMultiplierSettings(tuple[TOP_INDEX.multiplierOverview]);
  if (tuple[TOP_INDEX.multiplierOpportunities] !== null && tuple[TOP_INDEX.multiplierOpportunities] !== undefined) compact.mo = tupleToScalarObject(tuple[TOP_INDEX.multiplierOpportunities], OPPORTUNITY_FIELDS, 'multiplier opportunities');
  if (tuple[TOP_INDEX.compareFocus] !== null && tuple[TOP_INDEX.compareFocus] !== undefined) compact.f = tupleToScalarObject(tuple[TOP_INDEX.compareFocus], FOCUS_FIELDS, 'compare focus');
  if (tuple[TOP_INDEX.radioHeat] !== null && tuple[TOP_INDEX.radioHeat] !== undefined) compact.rh = tupleToScalarObject(tuple[TOP_INDEX.radioHeat], RADIO_HEAT_FIELDS, 'radio heatmap');
  if (tuple[TOP_INDEX.logFilters] !== null && tuple[TOP_INDEX.logFilters] !== undefined) compact.l = decodeLogFilters(tuple[TOP_INDEX.logFilters]);
  if (tuple[TOP_INDEX.slots] !== null && tuple[TOP_INDEX.slots] !== undefined) {
    if (!Array.isArray(tuple[TOP_INDEX.slots]) || tuple[TOP_INDEX.slots].length > PERMALINK_V3_LIMITS.slotCount) {
      throw new TypeError('slot list is invalid');
    }
    const seen = new Set();
    compact.s = tuple[TOP_INDEX.slots].map((slotTuple) => {
      const slot = decodeSlot(slotTuple);
      const id = typeof slot.i === 'string' ? slot.i.toUpperCase() : '';
      if (!TRADEOFF_SLOT_IDS.includes(id) || seen.has(id)) throw new TypeError('slot ID is invalid');
      seen.add(id);
      slot.i = id;
      return slot;
    });
  }
  return compact;
}

function validateTuple(value, maximumLength, label) {
  if (!Array.isArray(value) || value.length > maximumLength) throw new TypeError(`${label} is invalid`);
}

function validateOptional(tuple, index, validator) {
  const value = tuple[index];
  if (value === null || value === undefined) return;
  validator(value);
}

function validateString(value, label) {
  if (typeof value !== 'string') throw new TypeError(`${label} must be a string`);
}

function validateNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${label} must be a number`);
}

function validatePrimitiveOrExplicitNull(value, label) {
  if (isExplicitNull(value)) return;
  if (!['string', 'number', 'boolean'].includes(typeof value)) throw new TypeError(`${label} must be a scalar value`);
}

function validateStringOrExplicitNull(value, label) {
  if (isExplicitNull(value)) return;
  validateString(value, label);
}

function validateStringList(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) throw new TypeError(`${label} must be a string list`);
}

function validateNumberList(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'number' || !Number.isFinite(item))) {
    throw new TypeError(`${label} must be a number list`);
  }
}

function validateRange(value, label) {
  if (!Array.isArray(value) || value.length !== 2) throw new TypeError(`${label} must be a two-number range`);
  value.forEach((item) => validateNumber(item, label));
}

function validateScalarTuple(tuple, fields, validators, label) {
  validateTuple(tuple, fields.length, label);
  fields.forEach((field, index) => {
    const validator = validators[index];
    if (validator) validateOptional(tuple, index, (value) => validator(value, `${label}.${field}`));
  });
}

function validateMultiplierTuple(tuple) {
  validateTuple(tuple, MULTIPLIER_TRADEOFF_INDEX + 1, 'multiplier settings');
  const string = validateString;
  const number = validateNumber;
  [string, string, number, validateStringOrExplicitNull, validateStringOrExplicitNull, number].forEach((validator, index) => {
    validateOptional(tuple, index, (value) => validator(value, `multiplier settings.${MULTIPLIER_FIELDS[index]}`));
  });
  validateOptional(tuple, MULTIPLIER_TRADEOFF_INDEX, (slotSettings) => {
    validateTuple(slotSettings, TRADEOFF_SLOT_IDS.length, 'multiplier slot list');
    slotSettings.forEach((settings, slotIndex) => {
      if (settings === null) return;
      validateTuple(settings, TRADEOFF_SCENARIOS_INDEX + 1, `multiplier slot ${TRADEOFF_SLOT_IDS[slotIndex]}`);
      TRADEOFF_FIELDS.forEach((field, index) => {
        validateOptional(settings, index, (value) => validatePrimitiveOrExplicitNull(value, `multiplier slot.${field}`));
      });
      validateOptional(settings, TRADEOFF_SCENARIOS_INDEX, (scenarios) => {
        validateTuple(scenarios, SCENARIO_IDS.length, 'multiplier scenarios');
        scenarios.forEach((scenario, scenarioIndex) => {
          if (scenario === null) return;
          validateTuple(scenario, SCENARIO_FIELDS.length, `multiplier ${SCENARIO_IDS[scenarioIndex]} scenario`);
          SCENARIO_FIELDS.forEach((field, index) => {
            validateOptional(scenario, index, (value) => validatePrimitiveOrExplicitNull(value, `multiplier scenario.${field}`));
          });
        });
      });
    });
  });
}

function validateLogFilterTuple(tuple) {
  validateTuple(tuple, LOG_FILTER_FIELDS.length, 'log filters');
  const stringIndexes = new Set([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11]);
  stringIndexes.forEach((index) => validateOptional(tuple, index, (value) => validateString(value, `log filters.${LOG_FILTER_FIELDS[index]}`)));
  validateOptional(tuple, 6, (value) => validateNumber(value, 'log filters.l'));
  validateOptional(tuple, LOG_FILTER_STYLE_INDEX, (style) => validateScalarTuple(
    style,
    OPERATING_STYLE_FIELDS,
    [validateString, validateString],
    'operating-style filter'
  ));
  [13, 15, 16, 17, 18].forEach((index) => validateOptional(tuple, index, (value) => validateRange(value, `log filters.${LOG_FILTER_FIELDS[index]}`)));
  validateOptional(tuple, 14, (value) => validateNumber(value, 'log filters.rd'));
}

function validateSlotTuple(tuple) {
  validateTuple(tuple, POSITIONAL_SLOT_FIELDS.length, 'slot');
  validateOptional(tuple, 0, (value) => validateString(value, 'slot ID'));
  validateOptional(tuple, 1, (value) => validateNumber(value, 'slot skipped flag'));
  [2, 4, 5, 6, 7].forEach((index) => validateOptional(tuple, index, (value) => validateString(value, `slot.${POSITIONAL_SLOT_FIELDS[index]}`)));
  validateOptional(tuple, 3, (value) => validateNumber(value, 'slot size'));
  validateOptional(tuple, SLOT_SPOTS_INDEX, (spots) => validateScalarTuple(
    spots,
    SPOT_FIELDS,
    [validateNumber, validateStringList],
    'spot settings'
  ));
  validateOptional(tuple, SLOT_RBN_INDEX, (rbn) => validateScalarTuple(
    rbn,
    RBN_FIELDS,
    [validateNumber, validateStringList, validateStringList],
    'RBN settings'
  ));
}

function validateKnownV3Schema(tuple) {
  validateOptional(tuple, 1, (value) => validateString(value, 'analysis mode'));
  validateOptional(tuple, 2, (value) => validateNumber(value, 'compare count'));
  validateOptional(tuple, 3, (value) => validateString(value, 'compare score mode'));
  validateOptional(tuple, TOP_INDEX.multiplierOverview, validateMultiplierTuple);
  validateOptional(tuple, TOP_INDEX.multiplierOpportunities, (value) => validateScalarTuple(
    value,
    OPPORTUNITY_FIELDS,
    [validateString, validateNumber, validateString, validateString, validateString, validateString, validateString, validateString, validateString, validateString],
    'multiplier opportunities'
  ));
  validateOptional(tuple, 6, (value) => validateNumber(value, 'synchronized scrolling'));
  validateOptional(tuple, 7, (value) => validateNumber(value, 'sticky headings'));
  validateOptional(tuple, 8, (value) => validateRange(value, 'synchronized time range'));
  validateOptional(tuple, TOP_INDEX.compareFocus, (focus) => validateScalarTuple(
    focus,
    FOCUS_FIELDS,
    FOCUS_FIELDS.map(() => validateStringList),
    'compare focus'
  ));
  validateOptional(tuple, 10, (value) => validateString(value, 'global band filter'));
  validateOptional(tuple, 11, (value) => validateString(value, 'global Radio filter'));
  validateOptional(tuple, TOP_INDEX.radioHeat, (heat) => validateScalarTuple(
    heat,
    RADIO_HEAT_FIELDS,
    RADIO_HEAT_FIELDS.map(() => validateString),
    'radio heatmap'
  ));
  [13, 14, 15, 16, 17, 18].forEach((index) => validateOptional(tuple, index, (value) => validateNumber(value, POSITIONAL_TOP_LEVEL_FIELDS[index])));
  validateOptional(tuple, 19, (value) => validateString(value, 'WPX column mode'));
  validateOptional(tuple, 20, (value) => validateNumberList(value, 'selected years'));
  validateOptional(tuple, 21, (value) => validateNumberList(value, 'selected months'));
  validateOptional(tuple, TOP_INDEX.logFilters, validateLogFilterTuple);
  validateOptional(tuple, TOP_INDEX.slots, (slots) => {
    validateTuple(slots, PERMALINK_V3_LIMITS.slotCount, 'slot list');
    slots.forEach(validateSlotTuple);
  });
}

export function validatePositionalPayload(value) {
  const limits = PERMALINK_V3_LIMITS;
  let nodes = 0;
  const visit = (node, depth) => {
    nodes += 1;
    if (nodes > limits.nodeCount) throw new RangeError('permalink contains too many values');
    if (depth > limits.nestingDepth) throw new RangeError('permalink nesting is too deep');
    if (node === null || typeof node === 'boolean') return;
    if (typeof node === 'number') {
      if (!Number.isFinite(node)) throw new TypeError('permalink contains a non-finite number');
      return;
    }
    if (typeof node === 'string') {
      if (node.length > limits.stringLength) throw new RangeError('permalink string is too long');
      return;
    }
    if (!Array.isArray(node)) throw new TypeError('positional permalink may contain only arrays and scalar values');
    if (node.length > limits.arrayLength) throw new RangeError('permalink collection is too large');
    node.forEach((entry) => visit(entry, depth + 1));
  };
  visit(value, 0);
  if (!Array.isArray(value)) throw new TypeError('positional permalink root must be a tuple');
  if (value.length > POSITIONAL_TOP_LEVEL_FIELDS.length + limits.futureTopLevelFields) {
    throw new RangeError('positional permalink has too many top-level fields');
  }
  if (value[TOP_INDEX.schemaVersion] === PERMALINK_POSITIONAL_SCHEMA_VERSION) validateKnownV3Schema(value);
  return true;
}

export function bytesToBase64Url(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('Uint8Array required');
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const hasB = index + 1 < bytes.length;
    const hasC = index + 2 < bytes.length;
    const b = hasB ? bytes[index + 1] : 0;
    const c = hasC ? bytes[index + 2] : 0;
    output += BASE64URL_ALPHABET[a >> 2];
    output += BASE64URL_ALPHABET[((a & 3) << 4) | (b >> 4)];
    if (hasB) output += BASE64URL_ALPHABET[((b & 15) << 2) | (c >> 6)];
    if (hasC) output += BASE64URL_ALPHABET[c & 63];
  }
  return output;
}

export function base64UrlToBytes(value) {
  const input = String(value || '');
  if (!input || input.length > PERMALINK_V3_LIMITS.encodedChars || !/^[A-Za-z0-9_-]+$/.test(input)) {
    throw new TypeError('invalid Base64URL data');
  }
  const remainder = input.length % 4;
  if (remainder === 1) throw new TypeError('invalid Base64URL length');
  const byteLength = Math.floor((input.length * 6) / 8);
  if (byteLength > PERMALINK_V3_LIMITS.compressedBytes) throw new RangeError('compressed permalink is too large');
  const output = new Uint8Array(byteLength);
  let buffer = 0;
  let bits = 0;
  let offset = 0;
  for (const char of input) {
    const digit = BASE64URL_ALPHABET.indexOf(char);
    if (digit < 0) throw new TypeError('invalid Base64URL data');
    buffer = (buffer << 6) | digit;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[offset] = (buffer >> bits) & 255;
      offset += 1;
      buffer &= (1 << bits) - 1;
    }
  }
  if (buffer !== 0 || offset !== byteLength) throw new TypeError('non-canonical Base64URL data');
  return output;
}

function inflateRawBounded(compressed) {
  if (!(compressed instanceof Uint8Array) || !compressed.length) throw new TypeError('compressed permalink is empty');
  if (compressed.length > PERMALINK_V3_LIMITS.compressedBytes) throw new RangeError('compressed permalink is too large');
  const chunks = [];
  let total = 0;
  let ended = false;
  const stream = new Inflate((chunk, final) => {
    total += chunk.length;
    if (total > PERMALINK_V3_LIMITS.decompressedBytes) throw new RangeError('decompressed permalink is too large');
    if (chunk.length) chunks.push(chunk.slice());
    if (final) ended = true;
  });
  const inputChunkSize = PERMALINK_V3_LIMITS.inflateInputChunkBytes;
  for (let offset = 0; offset < compressed.length; offset += inputChunkSize) {
    const end = Math.min(compressed.length, offset + inputChunkSize);
    stream.push(compressed.subarray(offset, end), end === compressed.length);
  }
  if (!ended) throw new TypeError('incomplete DEFLATE stream');
  const output = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, offset);
    offset += chunk.length;
  });
  return output;
}

export function encodeV3State(compact) {
  const positional = compactStateToPositional(compact);
  const json = JSON.stringify(positional);
  const utf8 = new TextEncoder().encode(json);
  if (utf8.length > PERMALINK_V3_LIMITS.decompressedBytes) throw new RangeError('positional permalink is too large');
  const compressed = deflateSync(utf8, { level: 9, mem: 8 });
  if (compressed.length > PERMALINK_V3_LIMITS.compressedBytes) throw new RangeError('compressed permalink is too large');
  const state = `${PERMALINK_V3_PREFIX}${bytesToBase64Url(compressed)}`;
  if (state.length - PERMALINK_V3_PREFIX.length > PERMALINK_V3_LIMITS.encodedChars) {
    throw new RangeError('encoded permalink is too large');
  }
  return state;
}

export function decodeV3State(state) {
  try {
    const encoded = String(state || '');
    if (!encoded.startsWith(PERMALINK_V3_PREFIX)) return null;
    const compressed = base64UrlToBytes(encoded.slice(PERMALINK_V3_PREFIX.length));
    const bytes = inflateRawBounded(compressed);
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const positional = JSON.parse(json);
    return positionalToCompactState(positional);
  } catch (error) {
    return null;
  }
}

export function inspectV3Encoding(compact) {
  const positional = compactStateToPositional(compact);
  const positionalJson = JSON.stringify(positional);
  const positionalBytes = new TextEncoder().encode(positionalJson);
  const compressed = deflateSync(positionalBytes, { level: 9, mem: 8 });
  return {
    positional,
    positionalJson,
    positionalJsonBytes: positionalBytes.length,
    compressedBytes: compressed.length,
    state: `${PERMALINK_V3_PREFIX}${bytesToBase64Url(compressed)}`
  };
}
