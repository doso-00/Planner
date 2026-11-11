# Rotta per il Paddock

Planner di 52 settimane per entrare nel motorsport (auto), partendo da un profilo da data analyst (SQL, AWS).

**Dashboard:** https://claude.ai/artifact/REXrVnciBkGJ9fauPCGGYV (privata, la apre solo il proprietario)

## Come funziona il writeback
- Nella pagina spunti i task (con una nota se vuoi), fai le lezioni con Claude, compili la scorecard e scrivi in "Messaggi per Claude".
- Ogni lunedì alle 8:47 un check-in automatico di Claude sposta i task in ritardo, risponde ai messaggi e lascia un riepilogo.
- Tutto viene salvato nel database della pagina (collezioni `tasks`, `scores`, `inbox`, `lessons`, `checkins`, documento `settings/main`).
- In una sessione Claude legge quel database e lo aggiorna: aggiunge o sposta compiti, attiva il ramo scelto,
  risponde ai messaggi (campo `reply`, stato `risposto`).
- Per riprendere da un'altra conversazione basta incollare il link della dashboard e chiedere di leggere i progressi.

## Struttura
- `planner/index.html`: la dashboard (HTML/CSS/JS senza librerie): prossimo task, ritmo, lezioni con Claude in pagina, check-in del lunedì.
- `planner/seed/plan.json`: il piano iniziale (fasi, compiti, costi, checkpoint).
- `scripts/split-seed.mjs`: prepara i documenti per caricare il piano nel database.
- `docs/superpowers/specs/`: il progetto. `docs/superpowers/plans/`: il piano di implementazione.
- `tests/`: validazione del piano e test della dashboard con un database finto (`npm test`).
