#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [baselineSource, specSource, coreSource] = await Promise.all([
  readFile(path.join(root, 'data', 'protected_scoring_baseline.json'), 'utf8'),
  readFile(path.join(root, 'data', 'contest_scoring_spec.json'), 'utf8'),
  readFile(path.join(root, 'modules', 'analysis', 'core.js'), 'utf8'),
]);

const baseline = JSON.parse(baselineSource);
const spec = JSON.parse(specSource);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const rules = new Map(spec.rule_sets.map((rule) => [rule.id, rule]));

const aliasStart = coreSource.indexOf('const SCORING_RULE_ALIASES');
const aliasBrace = coreSource.indexOf('{', aliasStart);
let depth = 0;
let aliasEnd = aliasBrace;
for (; aliasEnd < coreSource.length; aliasEnd += 1) {
  if (coreSource[aliasEnd] === '{') depth += 1;
  else if (coreSource[aliasEnd] === '}' && --depth === 0) {
    aliasEnd += 1;
    break;
  }
}
const aliases = Function(`"use strict"; return (${coreSource.slice(aliasBrace, aliasEnd)});`)();
const failures = [];

for (const [ruleId, expected] of Object.entries(baseline.rule_hashes)) {
  const rule = rules.get(ruleId);
  if (!rule) failures.push(`Protected rule ${ruleId} is missing.`);
  else if (hash(rule) !== expected) failures.push(`Protected rule ${ruleId} changed.`);
}
for (const [ruleId, expected] of Object.entries(baseline.alias_hashes)) {
  if (!aliases[ruleId]) failures.push(`Protected alias set ${ruleId} is missing.`);
  else if (hash(aliases[ruleId]) !== expected) failures.push(`Protected alias set ${ruleId} changed.`);
}

if (failures.length) {
  failures.forEach((failure) => console.error(`[protected-scoring] ${failure}`));
  process.exit(1);
}

console.log(`[protected-scoring] PASS: ${Object.keys(baseline.rule_hashes).length} rules and ${Object.keys(baseline.alias_hashes).length} alias sets match commit ${baseline.captured_from_commit}.`);
