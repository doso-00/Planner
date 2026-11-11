# Modifiche al piano (fonte live: database della dashboard)

Il piano iniziale è `planner/seed/plan.json`. Da lì in poi lo stato vive nel database della dashboard;
qui resta traccia di ogni modifica fatta da Claude e del perché.

## 2026-11-11
- **Inglese:** EF SET 66/100 (C1). `t01` diventa inglese tecnico motorsport; `O02` diventa seconda lingua (spagnolo o tedesco). Aggiunto `b05` (certificato su LinkedIn e CV).
- **CV e LinkedIn:** aggiunti `b06` (CV v2, fatto) e `b07` (LinkedIn allineato, fatto). File in `cv/`.
- **Ruoli scelti (b02):** data engineer e strategist i più vicini; ufficiale di gara ACI per curiosità.
  - Esplorazione operazioni ridotta: `o01` resta come controllo di un'ora; `o02`–`o05` spostati in Fase 2 (si sbloccano solo se si sceglie quella strada).
  - Settimane 5-6 alla strategia: aggiunti `s01` (lezione), `s02` (mini-progetto pit stop con FastF1), `s03` (profilo strategist e annunci).
  - `p01` (corso ufficiali ACI) anticipato alle settimane 2-3: i corsi si fanno in inverno e Monza è vicina.

## 2026-11-11 (sera) — dashboard a task e automatismi
- Tolto il registro ore: l'avanzamento si misura sui task (i vecchi `logs` restano nel db, non mostrati).
- Nuovi in pagina: ritmo automatico, scheda "Prossimo task", lezioni con Claude dentro la pagina (`lessons/<taskId>`),
  sezione "Ultimo check-in di Claude" (`checkins/<data>`). Capabilities: db + sample.
- Attività pianificata "Check-in settimanale Rotta per il Paddock" (`trig_013dKXYUkHWFqpX72yCHRsw9`), ogni lunedì 8:47 Europe/Rome,
  prima esecuzione 16 nov 2026: sposta i task in ritardo, risponde all'inbox, scrive il check-in.
