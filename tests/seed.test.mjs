import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const plan = JSON.parse(readFileSync(new URL('../planner/seed/plan.json', import.meta.url)));
const REQ = ['id', 'phase', 'track', 'week', 'weekEnd', 'title', 'detail', 'cost', 'kind', 'status'];
const TRACKS = ['base', 'dati', 'operazioni', 'pista', 'trasversale', 'candidature'];
const KINDS = ['studio', 'progetto', 'azione', 'checkpoint', 'lezione-claude'];

test('settings', () => {
  assert.equal(plan.settings.startDate, '2026-11-10');
  assert.equal(plan.settings.weeklyHours, 7);
  assert.equal(plan.settings.budget, 300);
  assert.equal(plan.settings.chosenBranch, null);
});

test('task ids are unique and fields complete', () => {
  const ids = plan.tasks.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of plan.tasks) {
    for (const k of REQ) assert.ok(k in t, `${t.id} missing ${k}`);
    assert.ok([0, 1, 2, 3].includes(t.phase), t.id);
    assert.ok(TRACKS.includes(t.track), `${t.id} track ${t.track}`);
    assert.ok(KINDS.includes(t.kind), `${t.id} kind ${t.kind}`);
    assert.ok(1 <= t.week && t.week <= t.weekEnd && t.weekEnd <= 52, `${t.id} weeks`);
    assert.equal(t.status, 'todo');
    if (t.url !== null) assert.match(t.url, /^https:\/\//, t.id);
  }
});

test('exploration phases are free', () => {
  const cost = plan.tasks.filter(t => t.phase <= 1).reduce((s, t) => s + t.cost, 0);
  assert.equal(cost, 0);
});

test('each phase-2 branch fits the 300 € budget', () => {
  for (const b of ['dati', 'operazioni', 'pista']) {
    const c = plan.tasks.filter(t => t.phase === 2 && t.track === b).reduce((s, t) => s + t.cost, 0);
    assert.ok(c <= 300, `${b}: ${c}`);
    assert.ok(plan.tasks.some(t => t.phase === 2 && t.track === b), `${b} has tasks`);
  }
});

test('checkpoints at weeks 4 and 8', () => {
  const cps = plan.tasks.filter(t => t.kind === 'checkpoint').map(t => t.week);
  assert.ok(cps.includes(4));
  assert.ok(cps.includes(8));
});

test('three exploration scores', () => {
  assert.deepEqual(plan.scores.map(s => s.id).sort(), ['dati', 'operazioni', 'pista']);
});
