// Writes one JSON file per database document from planner/seed/plan.json,
// plus batch-*.json manifests (≤50 writes each) for ArtifactData "batch".
// Usage: node scripts/split-seed.mjs <outDir>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const out = resolve(process.argv[2] || 'seed-out');
const plan = JSON.parse(readFileSync(new URL('../planner/seed/plan.json', import.meta.url)));
const docs = [['settings', 'main', plan.settings],
  ...plan.scores.map(s => ['scores', s.id, s]),
  ...plan.tasks.map(t => ['tasks', t.id, { ...t, note: '', doneAt: null }])];
const writes = [];
for (const [col, id, data] of docs) {
  mkdirSync(join(out, col), { recursive: true });
  const f = join(out, col, id + '.json');
  writeFileSync(f, JSON.stringify(data));
  writes.push({ op: 'set', collection: col, doc_id: id, file_path: f });
}
for (let i = 0; i * 50 < writes.length; i++) writeFileSync(join(out, `batch-${i}.json`), JSON.stringify(writes.slice(i * 50, i * 50 + 50)));
console.log(`${writes.length} documents, ${Math.ceil(writes.length / 50)} batches in ${out}`);
