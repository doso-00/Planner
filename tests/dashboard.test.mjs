import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // preinstalled globally

const PAGE = new URL('../planner/index.html', import.meta.url).href;
const MOCK = readFileSync(new URL('./mock-db.js', import.meta.url), 'utf8');
const PLAN = JSON.parse(readFileSync(new URL('../planner/seed/plan.json', import.meta.url)));

function seedFromPlan(overrides = {}) {
  const s = { 'settings/main': { ...PLAN.settings, ...overrides } };
  for (const t of PLAN.tasks) s['tasks/' + t.id] = t;
  for (const x of PLAN.scores) s['scores/' + x.id] = x;
  return s;
}

let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser.close(); });

async function open({ seed = seedFromPlan(), today = '2026-11-10', noDb = false, width = 1200 } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.addInitScript(([seed, today, noDb]) => {
    window.__SEED__ = seed; window.__TODAY__ = today; window.__NO_DB__ = noDb;
  }, [seed, today, noDb]);
  await page.addInitScript(MOCK);
  await page.goto(PAGE);
  page.errors = errors;
  return page;
}
const store = (page, path) => page.evaluate(p => window.__store.get(p), path);

test('pure helpers', async () => {
  const page = await open();
  const r = await page.evaluate(() => [
    Planner.weekOf('2026-11-10', '2026-11-10'),
    Planner.weekOf('2026-11-10', '2026-11-17'),
    Planner.weekOf('2026-11-10', '2026-11-01'),
    Planner.weekOf('2026-11-10', '2028-01-01'),
    Planner.validHours('2'), Planner.validHours('1.5'), Planner.validHours(''),
    Planner.validHours('abc'), Planner.validHours('-1'), Planner.validHours('30'),
  ]);
  assert.deepEqual(r, [1, 2, 1, 52, true, true, false, false, false, false]);
  await page.close();
});

test('shows week 1 and this week tasks', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  assert.match(await page.textContent('#week-label'), /Settimana 1/);
  assert.ok(await page.isVisible('#week-tasks [data-task-id="b01"]'));
  assert.equal(page.errors.length, 0, page.errors.join('\n'));
  await page.close();
});

test('ticking a task writes status done', async () => {
  const page = await open();
  await page.check('#week-tasks [data-task-id="b01"] input.task-check');
  await page.waitForFunction(() => window.__store.get('tasks/b01').status === 'done');
  assert.match((await store(page, 'tasks/b01')).doneAt, /^\d{4}-\d{2}-\d{2}/);
  await page.close();
});

test('log entry adds hours; invalid hours rejected', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  for (const bad of ['abc', '-1', '30']) {
    await page.fill('#log-hours', bad);
    await page.click('#log-submit');
    assert.ok(await page.isVisible('#log-error'), bad);
  }
  await page.fill('#log-hours', '2');
  await page.fill('#log-note', 'Test EF SET fatto');
  await page.click('#log-submit');
  await page.waitForFunction(() => document.querySelector('#hours-week').textContent.trim().startsWith('2'));
  const logs = await page.evaluate(() => [...window.__store.entries()].filter(([k]) => k.startsWith('logs/')).map(([, v]) => v));
  assert.equal(logs.length, 1);
  assert.equal(logs[0].hours, 2);
  assert.equal(logs[0].date, '2026-11-10');
  await page.close();
});

test('inbox message saved as nuovo', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  await page.fill('#inbox-text', 'Mi interessano dati e timing');
  await page.click('#inbox-submit');
  await page.waitForFunction(() => [...window.__store.keys()].some(k => k.startsWith('inbox/')));
  const msg = await page.evaluate(() => [...window.__store.entries()].find(([k]) => k.startsWith('inbox/'))[1]);
  assert.equal(msg.status, 'nuovo');
  assert.equal(msg.text, 'Mi interessano dati e timing');
  await page.close();
});

test('no db shows read-only notice', async () => {
  const page = await open({ noDb: true });
  await page.waitForSelector('#offline-note:not([hidden])', { timeout: 5000 });
  await page.close();
});

test('empty db shows empty state', async () => {
  const page = await open({ seed: {} });
  await page.waitForSelector('#empty-state:not([hidden])', { timeout: 5000 });
  await page.close();
});

test('locked branch tasks do not count this week', async () => {
  const page = await open({ today: '2026-12-01' }); // week 4, D-tasks start week 9
  await page.waitForSelector('[data-task-id="d06"]');
  const s = await page.evaluate(() => Planner.stats(
    [{ id: 'a', phase: 2, track: 'dati', week: 1, weekEnd: 52, cost: 90, status: 'todo', kind: 'studio' },
     { id: 'b', phase: 1, track: 'dati', week: 1, weekEnd: 52, cost: 0, status: 'done', kind: 'studio' }],
    [], { startDate: '2026-11-10', weeklyHours: 7, budget: 300, chosenBranch: null }, '2026-12-01'));
  assert.equal(s.week, 4);
  assert.equal(s.total, 1);
  assert.equal(s.doneCount, 1);
  assert.equal(await page.locator('#week-tasks [data-task-id="D01"]').count(), 0);
  await page.close();
});

test('choosing a branch writes settings', async () => {
  const page = await open();
  await page.waitForSelector('[data-task-id="b01"]');
  await page.selectOption('#branch-select', 'dati');
  await page.waitForFunction(() => window.__store.get('settings/main').chosenBranch === 'dati');
  await page.close();
});

test('no horizontal scroll at 400px', async () => {
  const page = await open({ width: 400 });
  await page.waitForSelector('[data-task-id="b01"]');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(over <= 0, `overflow ${over}px`);
  await page.close();
});
