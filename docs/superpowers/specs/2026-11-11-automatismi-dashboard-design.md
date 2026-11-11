# Dashboard: task invece di ore, automatismi — Design

Data: 2026-11-11 · approvato da Riccardo in chat.

## Perché
Il registro ore è attrito inutile: Riccardo vuole misurare l'avanzamento sui task e che la dashboard (e Claude)
lavorino da soli il più possibile.

## Cosa cambia
1. **Via le ore.** Tolti registro, grafico e KPI ore. I documenti `logs` restano nel db ma non si mostrano.
   KPI: task della settimana fatti · ritmo · completamento totale · budget.
2. **Ritmo automatico** (`pace`): arretrati = task attivi non fatti con `weekEnd < settimana corrente`.
   0 arretrati e almeno un task futuro già fatto → "in anticipo"; 0 → "in linea"; 1-2 → "leggero ritardo"; ≥3 → "in ritardo".
3. **Prossimo task**: il task attivo non fatto con `weekEnd`, poi `week`, poi id più bassi. Scheda in cima con
   pulsante Fatto e nota veloce.
4. **Check-in del lunedì**: attività pianificata ogni lunedì 8:47 Europe/Rome, sessione nuova. Legge il db, porta
   `weekEnd` dei task in ritardo alla settimana corrente (campi `movedFrom`, `movedAt`, non tocca `note`),
   risponde all'inbox, scrive `checkins/<YYYY-MM-DD>` = `{date, week, summary, moved:[{id,title,from,to}], next:[string]}`.
   Non cancella task, non segna fatto, non sceglie il ramo. La pagina mostra l'ultimo check-in.
5. **Lezioni nella pagina** (capability `sample`): sui task `lezione-claude` pulsante "Fai la lezione"; pannello unico
   con la lezione in streaming, domande di approfondimento, Stop. Salvate in `lessons/<taskId>` =
   `{taskId, turns:[{role,content}], updatedAt}`. Senza `sample` il pulsante non compare.

## Approcci scartati
- Lezione dentro la card del task: le card si ricostruiscono a ogni aggiornamento del db e perderebbero lo streaming.
- Check-in che modifica `note`: rischia di sovrascrivere le note di Riccardo.
