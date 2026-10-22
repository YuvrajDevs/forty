import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATALOG, GROUPS, planChaptersFrom, psalmToVulgate } from './catalog.ts';

const read = (file: string) => readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8');
const arr = (src: string, name: string) => {
  const head = `${name}: BookMeta[] = `;
  const i = src.indexOf(head) + head.length;
  return JSON.parse(src.slice(i, src.indexOf(';\n', i)));
};
const meta = read('translations-meta.ts');
const T = { web: arr(read('books.ts'), 'BOOKS'), kjv: arr(meta, 'KJV_BOOKS'), drc: arr(meta, 'DRC_BOOKS') };

test('every plan has a unique id, a title and a known group', () => {
  assert.equal(new Set(CATALOG.map((p) => p.id)).size, CATALOG.length);
  for (const p of CATALOG) {
    assert.ok(p.title && p.blurb);
    assert.ok(GROUPS.includes(p.group));
  }
});

test('every plan resolves to real chapters in the translations it is offered for', () => {
  for (const p of CATALOG) {
    const catholic = p.group === 'Catholic books';
    for (const t of ['web', 'kjv', 'drc'] as const) {
      const ch = planChaptersFrom(p, T[t], t);
      if (catholic && t !== 'drc') assert.equal(ch.length, 0, `${p.id} should be empty in ${t}`);
      else assert.ok(ch.length > 0, `${p.id} is empty in ${t}`);
    }
  }
});

test('chapter counts match the plan definitions', () => {
  const count = (id: string, t: 'web' | 'drc' = 'web') => planChaptersFrom(CATALOG.find((p) => p.id === id)!, T[t], t).length;
  assert.equal(count('sermon-on-the-mount'), 3);
  assert.equal(count('proverbs'), 31);
  assert.equal(count('luke-acts'), 52);
  assert.equal(count('psalms-hard-days'), 10);
});

test('Psalms convert to the Vulgate numbering for the Douay-Rheims', () => {
  assert.deepEqual(psalmToVulgate(23), [22]);
  assert.deepEqual(psalmToVulgate(51), [50]);
  assert.deepEqual(psalmToVulgate(116), [114, 115]);
  assert.deepEqual(psalmToVulgate(150), [150]);
  const hard = CATALOG.find((p) => p.id === 'psalms-hard-days')!;
  assert.ok(planChaptersFrom(hard, T.drc, 'drc').some((c) => c.chapter === 22));
});
