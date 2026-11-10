# Planner Motorsport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard interattiva (artifact claude.ai) con database condiviso, seminata con il piano di 12 mesi, che l'utente aggiorna e Claude legge/modifica.

**Architecture:** Un'unica pagina HTML (`planner/index.html`) senza librerie, che legge/scrive il `db` capability (collezioni `tasks`, `logs`, `scores`, `settings`, `inbox`). Il piano iniziale vive in `planner/seed/plan.json` (versionato) e viene caricato nel db con ArtifactData dopo la prima pubblicazione. Contenuti di riferimento statici (mappa ruoli, bussola) restano nella pagina.

**Tech Stack:** HTML/CSS/JS vanilla, node:test, Playwright (Chromium preinstallato) con un db finto in memoria.

**Spec:** `docs/superpowers/specs/2026-11-10-motorsport-planner-design.md`

## Global Constraints
- Lingua: italiano.
- Data di inizio: 2026-11-10 (settimana 1 = 10–16 nov 2026). Durata: 52 settimane.
- Obiettivo ore: 7 h/settimana (range utente 6–8).
- Tetto budget: 300 €. Costi Fase 0–1 = 0 €. Costi per ciascun ramo di Fase 2 ≤ 300 €.
- Strade di esplorazione (id): `dati`, `operazioni`, `pista`. Checkpoint di scelta: settimana 8.
- Pagina: niente librerie esterne; temi chiaro/scuro; funziona a 400 px; capabilities `{db:{}}`.

## Review Focus
1. db assente (`claude.use("db")` → null, es. pagina aperta fuori dal viewer): la pagina mostra il piano in sola lettura con un avviso, non resta vuota. → test in Task 2.
2. db vuoto (prima apertura, prima del seed): stato vuoto che spiega cosa apparirà. → test in Task 2.
3. Data odierna prima dell'inizio o dopo la settimana 52: settimana corrente limitata a 1..52. → test in Task 2 (`weekOf`).
4. Log con ore non valide (vuote, negative, >24): rifiutato con messaggio. → test in Task 2.
5. Ramo non ancora scelto: i compiti di Fase 2 appaiono come "da sbloccare al checkpoint", non nel conteggio della settimana. → test in Task 2.

---

### Task 1: Piano iniziale (seed) + validazione

**Files:**
- Create: `planner/seed/plan.json`, `tests/seed.test.mjs`, `package.json`

**Interfaces:**
- Produces: `plan.json` = `{ settings: {startDate, weeklyHours, budget, chosenBranch:null}, tasks: Task[], scores: Score[] }`
  - `Task = {id, phase:0|1|2|3, track:"base"|"dati"|"operazioni"|"pista"|"trasversale"|"candidature", week:number, weekEnd:number, title, detail, url|null, cost:number(€), kind:"studio"|"progetto"|"azione"|"checkpoint"|"lezione-claude", status:"todo"}`
  - `Score = {id: "dati"|"operazioni"|"pista", interest:0, energy:0, aptitude:0, market:0, note:""}`

- [ ] Step 1: test `seed.test.mjs`: id unici; campi obbligatori; `1 ≤ week ≤ weekEnd ≤ 52`; fasi 0–1 costo totale 0; per ogni ramo di fase 2 somma costi ≤ 300; esiste un `checkpoint` a settimana 4 e a settimana 8; ogni `url` inizia con `https://`; 3 score.
- [ ] Step 2: `node --test tests/` → FAIL (file mancante).
- [ ] Step 3: scrivere `plan.json` dai contenuti della spec.
- [ ] Step 4: `node --test tests/` → PASS.
- [ ] Step 5: commit.

### Task 2: Dashboard

**Files:**
- Create: `planner/index.html`, `tests/dashboard.test.mjs`, `tests/mock-db.js`

**Interfaces:**
- Consumes: forma dei documenti di Task 1 (collezioni `tasks`, `scores`, doc `settings/main`), più `logs/{id} = {date:"YYYY-MM-DD", hours:number, note, taskId|null, createdAt}` e `inbox/{id} = {text, createdAt, status:"nuovo"|"letto"|"risposto", reply:""}`.
- Produces: funzioni pure esposte su `window.Planner` per i test: `weekOf(startDate, today) -> 1..52`, `stats(tasks, logs, settings, today) -> {week, doneCount, total, hoursWeek, hoursTotal, spent, nextCheckpoint}`, `validHours(v) -> boolean`.
- Mock: `tests/mock-db.js` definisce `window.claude.use("db")` con un db in memoria (`collection().onSnapshot/doc().set/update/delete/add`) seminato da `window.__SEED__`.

- [ ] Step 1: test Playwright (file:// + mock): (a) con seed mostra "Settimana 1" il 2026-11-10 e i compiti della settimana; (b) click checkbox → `tasks/<id>.status == "done"` nel mock; (c) aggiunta log 2 h → ore settimana = 2; ore "abc"/-1/30 rifiutate; (d) messaggio inbox salvato con `status:"nuovo"`; (e) `use("db")` → null mostra avviso sola lettura; (f) db vuoto mostra stato vuoto; (g) `weekOf("2026-11-10","2026-11-01")==1`, `weekOf(...,"2028-01-01")==52`; (h) compiti fase 2 con `chosenBranch:null` non contano nella settimana; (i) nessuno scroll orizzontale a 400 px.
- [ ] Step 2: run → FAIL.
- [ ] Step 3: implementare la pagina (sezioni: riepilogo, roadmap, compiti, log, scorecard, mappa ruoli, bussola, budget, messaggi per Claude).
- [ ] Step 4: `node --test tests/` → PASS.
- [ ] Step 5: commit.

### Task 3: Pubblicazione, seed nel db, verifica, README

**Files:**
- Create: `scripts/split-seed.mjs` (scrive un JSON per documento in scratchpad), `README.md`

- [ ] Step 1: pubblicare `planner/index.html` con `capabilities: {db:{}}`.
- [ ] Step 2: `node scripts/split-seed.mjs <outdir>`; ArtifactData `batch` (≤50 per chiamata) per tasks, scores, settings/main.
- [ ] Step 3: ArtifactData `list` di `tasks` → numero = numero di task nel seed.
- [ ] Step 4: README (come funziona il writeback, link artifact); commit + push.
