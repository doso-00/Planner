# Automatismi dashboard — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-11-11-automatismi-dashboard-design.md`
**Goal:** dashboard a task (niente ore) con ritmo, prossimo task, check-in e lezioni in pagina.

## Global Constraints
- Capabilities: `{db:{}, sample:{}}`. Lingua italiano. Check-in: `CRON_TZ=Europe/Rome 47 8 * * 1`.

### Task 1: Pagina
Files: `planner/index.html`, `tests/mock-db.js`, `tests/dashboard.test.mjs`
- [ ] Test (RED): `Planner.pace` sui 4 casi; `#next-task` mostra b01 a S1 e `#next-done` scrive `done`;
      nessun `#log-form`; `#lesson-open-b03` apre `#lesson-panel`, testo mock visibile, `lessons/b03.turns.length==2`,
      domanda → 4; con `sample` null nessun pulsante lezione; `checkins/2026-11-16` mostrato in `#checkin`; 400 px senza scroll.
- [ ] Implementazione, test GREEN, commit.

### Task 2: Pubblicazione + check-in pianificato
- [ ] Ripubblicare con `capabilities {db:{}, sample:{}}`; leggere `tasks` dopo.
- [ ] Creare l'attività pianificata; changelog; commit + push.
