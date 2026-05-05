# PRD — Nimboo v1.1: Wizard Flow, Cronologia Sessione e Fix Copertina

---

## Problem Statement

Dopo il lancio dell'MVP, tre frizioni principali riducono la qualità dell'esperienza utente:

1. **Flusso domande a pagina unica**: le tre textarea vengono mostrate tutte insieme. L'utente si trova davanti a un modulo da compilare, non a una conversazione. Il tono empatico del prodotto ("Come stai, adesso?") stride con la UI da form tradizionale.
2. **Nessuna memoria della sessione**: ogni volta che l'utente clicca "Ricomincia", la raccomandazione precedente scompare. Chi vuole confrontare due consigli deve ricominciare da zero senza modo di recuperare quello ricevuto prima.
3. **Copertina libro mai visibile**: le immagini di Open Library Covers ritornano silenziosamente un 404 per molti ISBN, e il componente attuale non lo rileva prima di tentare il render. L'utente vede il placeholder terracotta quasi sempre, anche quando la copertina esiste.

---

## Solution

- Sostituire il form a tre textarea con un **wizard step-by-step**: una domanda alla volta, con indicatore di progresso e navigazione indietro.
- Introdurre un **layer di cronologia basato su sessionStorage**: le raccomandazioni ricevute nella sessione corrente vengono salvate e mostrate nella home dopo il primo utilizzo.
- Riscrivere la logica di caricamento della copertina con un **resolver che verifica l'URL prima del render**, mostrando il placeholder solo quando la cover è effettivamente assente.

---

## User Stories

1. Come utente, voglio vedere le domande una alla volta, così da potermi concentrare su ciascuna risposta senza sentirmi sopraffatto.
2. Come utente, voglio un indicatore visivo del mio progresso (es. "Domanda 1 di 3"), così da sapere quanto manca al risultato.
3. Come utente, voglio poter tornare alla domanda precedente prima di inviare, così da correggere una risposta senza ricominciare dall'inizio.
4. Come utente, voglio che il bottone "Avanti" sia disabilitato finché non ho scritto almeno 10 caratteri, così da capire immediatamente che devo rispondere prima di procedere.
5. Come utente, voglio che la domanda corrente sia chiaramente evidenziata e le precedenti non visibili, così da non essere distratto.
6. Come utente, voglio che l'animazione di transizione tra un passo e l'altro sia fluida e coerente con il tono caldo del prodotto.
7. Come utente, voglio che dopo aver ricevuto una raccomandazione e aver cliccato "Ricomincia", veda un elenco dei libri consigliati in questa sessione, così da poter confrontare più consigli.
8. Come utente, voglio che la cronologia mostri titolo e autore di ogni libro consigliato, così da riconoscerli a colpo d'occhio.
9. Come utente, voglio poter cliccare su un libro nella cronologia e rivederne la scheda completa con spiegazione e link Amazon, così da non perdere un consiglio ricevuto in precedenza.
10. Come utente, voglio che la cronologia sparisca automaticamente quando chiudo il browser, così da non trovare dati di sessioni precedenti in una nuova visita.
11. Come utente, voglio vedere la copertina del libro consigliato quando esiste, così da avere un'esperienza visiva più ricca e immediata.
12. Come utente, voglio che il placeholder terracotta appaia solo quando la copertina non è disponibile, non come stato predefinito.
13. Come utente, voglio che il caricamento della copertina non blocchi il render della scheda libro, così da vedere subito titolo, autore e spiegazione.
14. Come utente, voglio che se la copertina impiega troppo a caricarsi, il placeholder venga mostrato al suo posto, così da non vedere un'area vuota.
15. Come utente che usa il telefono, voglio che il wizard sia ottimizzato per schermi piccoli — un campo per volta è più comodo da compilare su mobile.
16. Come utente che usa il telefono, voglio che la cronologia sia scorrevole verticalmente senza elementi sovrapposti.
17. Come utente, voglio che anche durante il wizard il loading state mostri i messaggi animati già esistenti, così da mantenere la coerenza dell'esperienza.
18. Come utente, voglio che se torno alla home mentre sono a metà wizard, lo stato venga resettato, così da ricominciare da capo senza dati residui.

---

## Implementation Decisions

### Modulo 1 — `WizardForm` (sostituisce `QuestionForm`)

- Componente client con stato interno: `currentStep` (0, 1, 2), `answers` (array di 3 stringhe), `loading`, `error`.
- Ogni step mostra una sola domanda (la stessa label già usata in `QuestionForm`) con la sua textarea.
- Indicatore progresso: tre pallini o barra lineare — step completati in terracotta, step corrente bordato terracotta, step futuri in grigio.
- Navigazione: pulsante "Avanti" (disabilitato se < 10 caratteri), pulsante "← Indietro" dal secondo step in poi.
- Al terzo step, "Avanti" diventa "Trovami il libro" — stessa CTA dell'attuale form.
- Al submit, comportamento identico all'attuale: POST a `/api/recommend`, loading state, redirect a `/recommendation`.
- `QuestionForm` viene rimosso e `WizardForm` prende il suo posto in `app/page.tsx`.

### Modulo 2 — `RecommendationStore` (servizio puro)

- Modulo TypeScript in `lib/recommendationStore.ts`, senza dipendenze React.
- Interfaccia pubblica:
  - `saveRecommendation(rec: BookRecommendation): void`
  - `getHistory(): StoredRecommendation[]`
  - `clearHistory(): void`
- `StoredRecommendation` estende `BookRecommendation` con un campo `savedAt: number` (timestamp Unix).
- Utilizza `sessionStorage` con chiave fissa `nimboo_history`.
- I metodi fanno try/catch su ogni accesso a `sessionStorage` per gestire ambienti senza storage (SSR, privacy mode).
- `saveRecommendation` legge la lista esistente, prepende il nuovo elemento, riscrive — limite massimo di 10 elementi (FIFO).
- Il salvataggio viene chiamato in `QuestionForm` (poi `WizardForm`) subito dopo il redirect a `/recommendation`, passando i dati già ricevuti dall'API.

### Modulo 3 — `HistoryList` (componente UI)

- Componente client in `components/HistoryList.tsx`.
- Al mount legge `RecommendationStore.getHistory()`.
- Se la lista è vuota, non renderizza nulla (il componente non occupa spazio).
- Se la lista ha almeno un elemento, mostra un titolo (es. "I tuoi consigli di oggi") e una lista di card compatte: copertina miniatura (o placeholder terracotta), titolo, autore.
- Click su una card: naviga a `/recommendation?data=<encoded_json>` con i dati del libro selezionato — riutilizza la pagina già esistente.
- Inserito in `app/page.tsx` sotto il `WizardForm`.

### Modulo 4 — `CoverResolver` (logica copertina)

- Nuovo hook `useCoverUrl(isbn: string): { url: string | null; status: 'loading' | 'ready' | 'error' }` in `lib/useCoverUrl.ts`.
- Al mount lancia un `fetch` HEAD verso l'URL Open Library per verificare che la risorsa esista e non sia un redirect a un'immagine placeholder (`no-store, no-cache`).
- Se la risposta è 200 e il `Content-Type` è `image/*`, imposta `url` e `status: 'ready'`.
- Se la risposta è 404, o se `isbn` è stringa vuota, imposta `url: null` e `status: 'error'`.
- `CoverImage` in `BookCard.tsx` usa `useCoverUrl` al posto della costruzione diretta dell'URL. Durante `loading` mostra un placeholder animato (pulse), a `error` mostra `CoverPlaceholder`.
- Timeout di 3 secondi: se la verifica non completa entro 3s, fallisce silenziosamente su `CoverPlaceholder`.

### Routing e stato condiviso

- La raccomandazione continua a essere passata via URL search params (`/recommendation?data=...`) — nessun cambiamento al contratto esistente.
- `RecommendationStore.saveRecommendation` viene chiamato dal lato client prima del redirect, non dall'API route, per mantenere la separazione tra server e client.

---

## Testing Decisions

**Cosa rende un buon test in questo progetto**: i test devono verificare il comportamento osservabile dall'esterno del modulo — input → output — senza accedere agli internals. Non testare dettagli implementativi (quale chiave sessionStorage viene usata, quanti `JSON.parse` vengono chiamati).

### Modulo da testare: `RecommendationStore`

È il candidato ideale per unit test perché:
- È puro TypeScript, nessuna dipendenza React.
- Ha un'interfaccia piccola e stabile.
- Il comportamento è interamente determinato dagli input e dallo stato di sessionStorage.

**Test da scrivere:**
- `saveRecommendation` aggiunge un elemento recuperabile con `getHistory`.
- `getHistory` restituisce lista vuota se sessionStorage è vuoto.
- `saveRecommendation` chiamata più volte produce una lista ordinata dal più recente al più vecchio.
- Dopo 10 salvataggi, l'undicesimo rimuove il più vecchio (FIFO cap).
- `clearHistory` svuota la lista.
- I metodi non lanciano eccezioni se sessionStorage non è disponibile (simulare con mock che lancia `SecurityError`).

**Setup**: usare `jest` con `jest-environment-jsdom` (già compatibile con il toolchain Next.js/TypeScript). Mock di `sessionStorage` tramite `jest.spyOn(window, 'sessionStorage', 'get')`.

---

## Out of Scope

- Login o autenticazione utente.
- Persistenza dei consigli tra sessioni diverse (localStorage, database, account utente).
- Mostrare più di un libro per raccomandazione.
- Funzionalità di condivisione del consiglio (link, social).
- Rate limiting (da aggiungere dopo il deploy, quando il volume reale è noto).
- Compliance legale (privacy/cookie policy) — prerequisito separato per il lancio pubblico.
- Deploy su Vercel — prerequisito separato, non dipende da queste feature.

---

## Further Notes

- Il wizard non deve perdere le risposte già date quando l'utente naviga indietro tra i passi — `answers` va mantenuto nello stato per l'intera sessione del componente.
- La cronologia in sessionStorage non è considerata "dato personale" ai fini GDPR in questo contesto (nessun identifier, nessuna trasmissione a server), ma è bene citarlo nella privacy policy che verrà creata su iubenda.
- `useCoverUrl` deve girare solo lato client — aggiungere il guard `typeof window !== 'undefined'` se necessario, dato che `BookCard` potrebbe essere renderizzato server-side in futuro.
- Il modello Claude usato nelle API call rimane `claude-sonnet-4-5` — nessuna modifica a `lib/claude.ts` prevista in questa release.
