import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // preinstalled globally

const PAGE = new URL('../planner/index.html', import.meta.url).href;
const MOCK = readFileSync(new URL('./mock-db.js', import.meta.url), 'utf8');
const PLAN = JSON.parse(readFileSync(new URL('../planner/seed/plan.json', import.meta.url)));

function seedFromPlan(overrides = {}, extra = {}) {
  const s = { 'settings/main': { ...PLAN.settings, ...overrides } };
  for (const t of PLAN.tasks) s['tasks/' + t.id] = t;
  for (const x of PLAN.scores) s['scores/' + x.id] = x;
  return { ...s, ...extra };
}

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser.close(); });

async function open({ seed = seedFromPlan(), today = '2026-11-10', noDb = false, noSample = false, width = 1200 } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(([seed, today, noDb, noSample]) => {
    window.__SEED__ = seed; window.__TODAY__ = today; window.__NO_DB__ = noDb; window.__NO_SAMPLE__ = noSample;
  }, [seed, today, noDb, noSample]);
  await page.addInitScript(MOCK);
  await page.goto(PAGE);
  page.errors = errors;
  return page;
}
const store = (page, path) => page.evaluate(p => window.__store.get(p), path);
const T = (o) => ({ phase: 1, track: 'dati', kind: 'studio', cost: 0, status: 'todo', ...o });
const SET = { startDate: '2026-11-10', weeklyHours: 7, budget: 300, chosenBranch: null };

test('weekOf clamps to 1..52', async () => {
  const page = await open();
  const r = await page.evaluate(() => [
    Planner.weekOf('2026-11-10', '2026-11-10'), Planner.weekOf('2026-11-10', '2026-11-17'),
    Planner.weekOf('2026-11-10', '2026-11-01'), Planner.weekOf('2026-11-10', '2028-01-01')]);
  assert.deepEqual(r, [1, 2, 1, 52]);
  await page.close();
});

test('pace: in linea, in anticipo, leggero ritardo, in ritardo', async () => {
  const page = await open();
  const r = await page.evaluate(([T, SET]) => {
    const mk = (o) => ({ phase: 1, track: 'dati', kind: 'studio', cost: 0, status: 'todo', ...o });
    const today = '2026-11-24'; // week 3
    const base = [mk({ id: 'a', week: 1, weekEnd: 1, status: 'done' }), mk({ id: 'b', week: 3, weekEnd: 3 })];
    const p = (ts) => Planner.pace(ts, SET, today).label;
    return [
      p(base),
      p([...base, mk({ id: 'c', week: 5, weekEnd: 5, status: 'done' })]),
      p([...base, mk({ id: 'd', week: 1, weekEnd: 2 })]),
      p([...base, mk({ id: 'd', week: 1, weekEnd: 2 }), mk({ id: 'e', week: 1, weekEnd: 1 }), mk({ id: 'f', week: 2, weekEnd: 2 })]),
      Planner.pace([...base, mk({ id: 'z', phase: 2, track: 'pista', week: 1, weekEnd: 1 })], SET, today).late,
    ];
  }, [null, SET]);
  assert.deepEqual(r, ['in linea', 'in anticipo', 'leggero ritardo', 'in ritardo', 0]);
  await page.close();
});

test('no hours log anymore', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  assert.equal(await page.locator('#log-form').count(), 0);
  assert.equal(await page.locator('#hours-week').count(), 0);
  assert.equal(page.errors.length, 0, page.errors.join('\n'));
  await page.close();
});

test('next task card shows oldest open task and marks it done', async () => {
  const page = await open();
  await page.waitForSelector('#next-task [data-next-id="b01"]');
  await page.fill('#next-note', 'Fatto: C1');
  await page.click('#next-done');
  await page.waitForFunction(() => window.__store.get('tasks/b01').status === 'done');
  assert.equal((await store(page, 'tasks/b01')).note, 'Fatto: C1');
  await page.waitForSelector('#next-task [data-next-id="b02"]');
  await page.close();
});

test('ticking a task in the week list writes status done', async () => {
  const page = await open();
  await page.check('#week-tasks [data-task-id="b02"] input.task-check');
  await page.waitForFunction(() => window.__store.get('tasks/b02').status === 'done');
  await page.close();
});

test('week KPI counts this week tasks', async () => {
  const page = await open({ seed: seedFromPlan({}, {}) });
  await page.waitForSelector('[data-task-id="b01"]');
  const txt = await page.textContent('#week-done');
  assert.match(txt, /^0$/);
  assert.match(await page.textContent('#week-total'), /\/ 7/); // b01-b04 + t01-t03 in seed at S1
  await page.close();
});

test('lesson: opens panel, streams text, saves turns, follow-up appends', async () => {
  const page = await open();
  await page.click('#lesson-open-b03');
  await page.waitForSelector('#lesson-panel:not([hidden])');
  await page.waitForFunction(() => document.querySelector('#lesson-body').textContent.includes('Testo della lezione'));
  await page.waitForFunction(() => (window.__store.get('lessons/b03') || {}).turns?.length === 2);
  const first = await page.evaluate(() => window.__sampleCalls[0]);
  assert.ok(JSON.stringify(first).includes("weekend di gara"), 'prompt includes lesson topic');
  await page.fill('#lesson-q', 'Chi decide la safety car?');
  await page.click('#lesson-ask');
  await page.waitForFunction(() => window.__store.get('lessons/b03').turns.length === 4);
  assert.equal((await store(page, 'lessons/b03')).turns[2].content, 'Chi decide la safety car?');
  await page.close();
});

test('saved lesson reopens without calling Claude', async () => {
  const seed = seedFromPlan({}, { 'lessons/b03': { taskId: 'b03', turns: [{ role: 'user', content: 'x' }, { role: 'assistant', content: 'Lezione salvata prima' }], updatedAt: '2026-11-10' } });
  const page = await open({ seed });
  await page.click('#lesson-open-b03');
  await page.waitForFunction(() => document.querySelector('#lesson-body').textContent.includes('Lezione salvata prima'));
  assert.equal(await page.evaluate(() => window.__sampleCalls.length), 0);
  await page.close();
});

test('no sample: no lesson buttons', async () => {
  const page = await open({ noSample: true });
  await page.waitForSelector('[data-task-id="b03"]');
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#lesson-open-b03').count(), 0);
  await page.close();
});

test('latest check-in is shown', async () => {
  const seed = seedFromPlan({}, {
    'checkins/2026-11-09': { date: '2026-11-09', week: 1, summary: 'Vecchio', moved: [], next: [] },
    'checkins/2026-11-16': { date: '2026-11-16', week: 2, summary: 'Settimana 1 chiusa bene', moved: [{ id: 'd01', title: 'Lezione X', from: 1, to: 2 }], next: ['Webinar MoTeC'] },
  });
  const page = await open({ seed });
  await page.waitForFunction(() => document.querySelector('#checkin').textContent.includes('Settimana 1 chiusa bene'));
  const t = await page.textContent('#checkin');
  assert.ok(t.includes('Lezione X') && t.includes('Webinar MoTeC') && !t.includes('Vecchio'));
  await page.close();
});

test('choosing a branch writes settings', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  await page.selectOption('#branch-select', 'dati');
  await page.waitForFunction(() => window.__store.get('settings/main').chosenBranch === 'dati');
  await page.close();
});

test('inbox message saved as nuovo', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  await page.fill('#inbox-text', 'Ciao');
  await page.click('#inbox-submit');
  await page.waitForFunction(() => [...window.__store.keys()].some(k => k.startsWith('inbox/')));
  await page.close();
});

test('no db shows read-only notice; empty db shows empty state', async () => {
  const a = await open({ noDb: true });
  await a.waitForSelector('#offline-note:not([hidden])', { timeout: 5000 });
  await a.close();
  const b = await open({ seed: {} });
  await b.waitForSelector('#empty-state:not([hidden])', { timeout: 5000 });
  await b.close();
});

test('no horizontal scroll at 400px, with a lesson open', async () => {
  const page = await open({ width: 400 });
  await page.click('#lesson-open-b03');
  await page.waitForSelector('#lesson-panel:not([hidden])');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(over <= 0, `overflow ${over}px`);
  await page.close();
});
