# Planner Motorsport — Design

Data: 2026-11-10

## Intento (il perché)
Entrare nel motorsport (auto), guadagnare di più e viaggiare di più.
Non diventare "uno che scrive codice": capire quali competenze rendono **la persona** utile
in un mondo dove l'AI scrive codice. Il planner è lo strumento con cui faremo il percorso insieme:
l'utente inserisce progressi, Claude li legge e modifica il piano (writeback).

## Profilo di partenza
- Data analyst in consulenza: SQL quotidiano, AWS da poco.
- Laurea triennale Ingegneria Informatica (Politecnico); non a suo agio a scrivere codice da solo.
- Inglese ~B2.
- Non sa ancora quale ruolo vuole → **esplora e poi sceglie** (scelta utente).
- Disponibile a lavorare in Italia + estero.
- 6-8 ore/settimana → piano ~12 mesi.
- Budget corsi/certificazioni < 300 € nei primi 12 mesi.

## Obiettivi
- Mappa ruoli del motorsport auto (vari generi) con fit rispetto al profilo.
- Piano a fasi con tempistiche, checkpoint e scorecard di decisione.
- Risorse gratuite/economiche verificate; dove conviene, Claude fa da tutor (lezioni in chat).
- Dashboard interattiva con writeback bidirezionale.

## Non-obiettivi
- Non è un corso di programmazione. Il codice si fa *con* l'AI, solo dove serve al portfolio.
- Non è un job board aggiornato in tempo reale (gli annunci si controllano nelle sessioni).

## Anti-obiettivi (fallimento anche se "funziona")
- Piano troppo carico per 6-8 h/sett → abbandono.
- Spendere il budget prima di aver scelto la strada.
- Una dashboard bella ma che Claude non può leggere/modificare.

## Approcci considerati (contenuto)
- A. Ponte dati diretto — scartato dall'utente: troppo presto per scegliere.
- **B. Esplora poi scegli (scelto):** 8 settimane, 3 strade provate con compiti concreti, poi scelta guidata da scorecard.
- C. Solo operazioni/viaggio — scartato: rinuncia al vantaggio SQL/AWS senza averlo provato.

## Approcci considerati (strumento)
- **Artifact claude.ai con database condiviso (scelto, scelta di Claude):** pagina interattiva; l'utente spunta/registra,
  Claude legge e scrive con ArtifactData. Writeback nativo, funziona da telefono.
- Google Sheets: familiare per un analyst, ma dashboard povera.
- JSON nel repo GitHub: Claude lo modifica, ma l'utente non può aggiornarlo comodamente.
Il sorgente della pagina viene comunque versionato nel repo.

## Struttura del piano

### Fase 0 — Setup (settimana 1)
Baseline: test inglese gratuito (EF SET), CV/LinkedIn audit, lettura mappa ruoli, primo log ore.

### Fase 1 — Esplorazione (settimane 1-8), 3 strade
Ogni strada: un po' di teoria, un mini-progetto concreto, una conversazione con chi fa quel lavoro,
autovalutazione (interesse, energia, attitudine, mercato, 1-5).
1. **Dati & performance** (sett. 2-4): basi telemetria e dinamica veicolo (Claude tutor + webinar gratuiti HP Academy),
   MoTeC i2 Standard gratuito con dati di esempio, mini-progetto FastF1 (confronto giri, codice scritto con l'AI).
2. **Operazioni & logistica** (sett. 5-6): analisi di 10 annunci team/travel coordinator, mini-progetto
   "pianifica la trasferta di un team a un weekend di gara" (budget, voli, hotel, camion, timeline).
3. **Pista, timing & gara** (sett. 7-8): iscrizione al corso ufficiali di gara ACI (Automobile Club provinciale),
   andare a una gara, mini-progetto SQL sui dati di cronometraggio pubblici del WEC (Al Kamel).
Trasversali: inglese tecnico (podcast/video motorsport), 1 contatto LinkedIn a settimana.
**Checkpoint 1 (sett. 4)** e **Checkpoint 2 (sett. 8): scelta della strada principale.**

### Fase 2 — Specializzazione (mesi 3-7), si attiva un ramo
- Ramo Dati: HP Academy Professional Motorsport Data Analysis (~98-197 $), AWS Data Engineer Associate (150 $),
  portfolio di 3 progetti, basi vehicle dynamics.
- Ramo Operazioni: project management (corso gratuito in audit/economico), inglese verso C1, servizi come ufficiale,
  esperienza logistica in eventi.
- Ramo Pista/Timing: licenza ufficiale ACI + servizi, progetto live-timing, candidature spontanee a fornitori timing/servizi.
Checkpoint 3 (mese 5), Checkpoint 4 (mese 7: portfolio pronto).

### Fase 3 — Candidature & network (mesi 8-12)
CV motorsport, portfolio, eventi (Autosport International gennaio, Motor Valley Fest, PMW Expo),
candidature mirate Italia + estero. Checkpoint 5 (mese 12): colloqui/offerta.

### Budget
Tetto 300 €. Spesa solo in Fase 2, dopo la scelta (es. Ramo Dati: HP Academy in sconto + esame AWS ≈ 230-250 €).

## "Bussola": cosa rende utile una persona con l'AI
Sezione della dashboard: conoscenza del dominio (capire l'auto e la gara), trasformare dati in decisioni,
comunicazione sotto pressione con ingegneri/piloti, affidabilità e organizzazione, inglese,
presenza fisica in pista, saper usare l'AI e verificare ciò che produce.

## Dashboard (pagina)
- Intestazione: settimana corrente, % completamento, ore registrate vs obiettivo, prossimo checkpoint.
- Roadmap a fasi (timeline) con checkpoint.
- Compiti della settimana / fase: checkbox, risorsa con link, costo, nota.
- Log progressi: data, ore, nota (cosa ho fatto, cosa è stato difficile).
- Scorecard delle 3 strade (slider 1-5) → raccomandazione al checkpoint.
- Mappa ruoli (tabella con fit, viaggi, stipendio indicativo, fonte).
- Budget speso vs 300 €.
- Note per Claude: campo dove l'utente lascia domande/richieste che Claude legge.

## Dati (database dell'artifact)
- `tasks`: id, fase, strada/ramo, settimana, titolo, descrizione, risorsa (url), costo, stato, data completamento, nota, autore.
- `logs`: data, ore, nota, task collegato.
- `scores`: strada, interesse, energia, attitudine, mercato, nota.
- `settings`: data di inizio, ramo scelto, obiettivo ore/sett.
- `inbox`: messaggi dell'utente per Claude, con stato letto/risposto.
Il piano iniziale è seminato da Claude via ArtifactData; Claude lo modifica nelle sessioni successive.

## Scelte lasciate al builder
Stile visivo, ordinamento compiti, grafici (ore per settimana, completamento per fase).
