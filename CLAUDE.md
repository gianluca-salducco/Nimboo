# Nimboo — CLAUDE.md

---

## Stato attuale

> Aggiorna questa sezione ad ogni sessione di lavoro.

- **Fase:** MVP completo e testato in locale — flusso end-to-end funzionante
- **Landing page:** `index.html` live con waitlist via Brevo/Sendinblue
- **Completato:**
  - Struttura cartelle, config (Next.js 14, Tailwind, TypeScript)
  - `QuestionForm.tsx` — 3 domande, validazione (min 10 caratteri), loading state con 3 messaggi rotativi, spinner, gestione errori
  - `BookCard.tsx` — copertina via Open Library, fallback terracotta, spiegazione, CTA Amazon, dicitura affiliazione
  - `Logo.tsx` — SVG inline
  - `Footer.tsx` — copyright + link privacy policy e cookie policy
  - `lib/claude.ts` — integrazione Anthropic SDK con pulizia blocchi markdown prima del JSON.parse
  - `app/api/recommend/route.ts` — API route collegata a Claude
  - `app/recommendation/page.tsx` — schermata raccomandazione
  - `app/layout.tsx` — font Google, Footer globale
- **Prossimo step:** deploy su Vercel + compliance legale (privacy/cookie policy via iubenda)

## To do (prossime sessioni)

- [ ] **Deploy su Vercel** — aggiungere `ANTHROPIC_API_KEY` e `NEXT_PUBLIC_AMAZON_TAG` nelle variabili d'ambiente di Vercel, poi `vercel deploy`
- [ ] **Compliance legale** — obbligatoria prima del lancio pubblico:
  - Creare privacy policy e cookie policy su [iubenda.com](https://www.iubenda.com) (hanno il modulo Amazon Associates incluso)
  - Aggiornare i link nel `Footer.tsx` (`/privacy` e `/cookie`) con gli URL reali di iubenda
  - Valutare se servono pagine interne `/privacy` e `/cookie` o redirect agli URL iubenda
- [ ] **Redesign flusso domande** — homepage con CTA "Inizia" e domande mostrate in sequenza una alla volta (wizard step-by-step), non tutte insieme
- [ ] **Cronologia consigli** — salvare i consigli ricevuti nella sessione del browser (sessionStorage), visibili all'utente senza login; la lista sparisce alla chiusura del browser. Nota: va rivalutata la decisione "Non usare localStorage" — sessionStorage è diverso (dura solo la sessione) ed è accettabile
- [ ] **Fix copertina libro** — la copertina via Open Library non viene mai mostrata; indagare e risolvere (potrebbe essere ISBN errato restituito da Claude, o URL dell'immagine che ritorna 404 silenzioso)

---

## Decisioni prese

> Decisioni già prese — non riaprirle a meno di una scelta consapevole.

- Il prodotto raccomanda **un solo libro** per sessione, non liste
- Nessun sistema di login nel MVP
- Lingua interfaccia: **italiano**
- Modello AI: `claude-sonnet-4-5` (o superiore)
- L'output dell'API Claude deve essere **JSON puro** — nessun testo extra, nessun markdown
- Il bottone CTA è sempre **terracotta** (`#C4633A`), mai grigio o neutro
- Nessun salvataggio delle risposte utente nel MVP (stateless)
- Font caricati via `<link>` Google Fonts nel layout (non `next/font/google`) per evitare errori di rete al build time
- La raccomandazione viene passata tra le schermate via URL search params (`/recommendation?data=<encoded_json>`)

---

## Sicurezza

- **Spending limit Anthropic** — impostare un limite mensile su `console.anthropic.com` → Billing per bloccare abusi in caso di attacco
- **Validazione lunghezza input** — `route.ts` rifiuta richieste con campi superiori a 1000 caratteri (status 400), per limitare il costo per token di ogni chiamata
- **Variabili d'ambiente** — `ANTHROPIC_API_KEY` non ha prefisso `NEXT_PUBLIC_`, non viene mai esposta al browser
- **Rate limiting** — da aggiungere dopo il deploy quando il volume reale è noto; soluzione consigliata: `@upstash/ratelimit` con Redis Upstash (piano gratuito disponibile)
- **CAPTCHA** — non necessario per l'MVP; valutare Cloudflare Turnstile se si notano abusi

## Non fare (per ora)

- Non aggiungere autenticazione utente
- Non costruire cronologia delle raccomandazioni
- Non usare `localStorage` per persistere dati
- Non mostrare più di un libro per risposta

---

## Cos'è Nimboo

Nimboo è un'app web che raccomanda **un singolo libro** in base allo stato emotivo dell'utente in quel momento. Non si basa su generi, autori preferiti o cronologia di lettura: parte da come l'utente si sente _adesso_.

**Tagline:** "Il libro giusto per come ti senti."

---

## Obiettivo MVP

Costruire un flusso end-to-end funzionante:

1. L'utente risponde a 3 domande sul proprio stato emotivo (testo libero)
2. Claude analizza le risposte e raccomanda un solo libro
3. L'utente vede copertina, titolo, autore, spiegazione personalizzata e link affiliato Amazon

---

## Stack tecnico

| Layer              | Tecnologia                                 |
| ------------------ | ------------------------------------------ |
| Frontend + routing | Next.js 14 (App Router)                    |
| Styling            | Tailwind CSS                               |
| AI                 | Anthropic Claude API (`claude-sonnet-4-5`) |
| Deploy             | Vercel                                     |
| Monetizzazione     | Amazon Associates (link affiliato)         |

---

## Struttura cartelle

```
nimboo/
├── app/
│   ├── page.tsx                  # Schermata 1 — Le 3 domande
│   ├── recommendation/
│   │   └── page.tsx              # Schermata 2 — Raccomandazione
│   ├── api/
│   │   └── recommend/
│   │       └── route.ts          # API route — chiama Claude
│   └── layout.tsx
├── components/
│   ├── QuestionForm.tsx
│   └── BookCard.tsx
├── lib/
│   └── claude.ts                 # Wrapper Anthropic SDK
└── .env.local
```

---

## Le 3 domande (testo esatto)

1. _"Quali emozioni stai attraversando in questo periodo? Un libro potrebbe aiutarti a viverle meglio."_
2. _"Cosa senti di aver bisogno dalla prossima lettura?"_
3. _"Quanta energia hai per leggere — vuoi qualcosa di leggero o sei pronto a immergerti in qualcosa di impegnativo?"_

Validazione: tutti e 3 i campi obbligatori, minimo 10 caratteri ciascuno.

---

## Flusso utente

```
Schermata 1 (Domande)
  → Utente compila 3 textarea
  → Click "Trovami il libro"
  → Loading state (3-5 sec)

Schermata 2 (Raccomandazione)
  → Copertina libro (Open Library Covers API)
  → Titolo + Autore
  → Spiegazione personalizzata (generata da Claude)
  → CTA: "Compralo su Amazon" (link affiliato)
  → Link secondario: "← Ricomincia"
```

---

## API Route `/api/recommend`

**Input (POST):**

```json
{
  "q1": "Mi sento sopraffatto dal lavoro, ansioso",
  "q2": "Ho bisogno di evasione e leggerezza",
  "q3": "Ho poca energia, voglio qualcosa di leggero"
}
```

**Output:**

```json
{
  "title": "Il piccolo principe",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "9788845292613",
  "explanation": "In questo momento hai bisogno di rallentare...",
  "amazonUrl": "https://www.amazon.it/s?k=Il+piccolo+principe&tag=TUOTAG-21"
}
```

---

## Prompt Claude

```
Sei un consulente letterario empatico e colto.
Il tuo compito è raccomandare UN SOLO libro a una persona
basandoti sul suo stato emotivo.

Rispondi SOLO in formato JSON valido, senza testo aggiuntivo.

Stato emotivo dell'utente:
- Emozioni che sta vivendo: {{q1}}
- Cosa cerca dalla lettura: {{q2}}
- Livello di energia: {{q3}}

Restituisci questo JSON:
{
  "title": "Titolo esatto del libro",
  "author": "Nome Cognome autore",
  "isbn": "ISBN-13 se lo conosci, altrimenti stringa vuota",
  "explanation": "3-4 frasi in italiano, tono caldo e personale...",
  "amazonUrl": "https://www.amazon.it/s?k=TITOLO+AUTORE&tag=TUOTAG-21"
}

Regole:
- Scegli libri che esistono davvero
- Preferisci libri disponibili in italiano
- Se il libro ha un'edizione italiana, usa il titolo ufficiale pubblicato in Italia — mai tradurre letteralmente il titolo originale
- Varia il genere in base allo stato emotivo
- Non raccomandare sempre i soliti classici — sii originale
- L'explanation deve sembrare scritta da un amico che ti conosce bene
- Prima di rispondere, verifica internamente che titolo, autore e ISBN si riferiscano tutti allo stesso libro
```

---

## Copertina libro

Usa l'API gratuita di Open Library:

```
https://covers.openlibrary.org/b/isbn/{{ISBN}}-L.jpg
```

Se l'ISBN è vuoto o la copertina non esiste: placeholder con sfondo terracotta (`#C4633A`) e titolo centrato.

---

## Variabili d'ambiente (`.env.local`)

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_AMAZON_TAG=nimboo0e-21
```

---

## Design — palette e font

| Token          | Valore    | Utilizzo           |
| -------------- | --------- | ------------------ |
| `--cream`      | `#FAF7F2` | Sfondo pagine      |
| `--ink`        | `#1C1814` | Testo principale   |
| `--terracotta` | `#C4633A` | CTA, accenti       |
| `--sage`       | `#7A9E8A` | Accento secondario |
| `--amber`      | `#D4963A` | Accento terziario  |

**Font display:** Playfair Display (titoli, tono editoriale)
**Font body:** DM Sans (testo corrente, leggibile)

---

## Schermata 1 — Le domande

- Header con logo Nimboo (SVG inline)
- Titolo: _"Come stai, adesso?"_ — Playfair Display, grande
- Sottotitolo: _"Rispondimi liberamente. Troverò il libro giusto per te."_
- 3 textarea con label sopra (le domande)
- Bottone CTA terracotta: "Trovami il libro"
- Validazione: tutti e 3 i campi, minimo 10 caratteri

---

## Schermata 2 — Raccomandazione

- Header con logo
- Testo introduttivo: _"Il tuo libro per adesso è"_ (DM Sans, muted)
- Copertina libro (grande, border-radius, shadow leggera)
- Titolo libro (Playfair Display, grande)
- Autore (DM Sans, muted)
- Spiegazione (DM Sans, testo lungo, leggero)
- Bottone primario terracotta: "Compralo su Amazon →"
- Link secondario: "← Ricomincia"

---

## Loading state

Schermata intermedia mentre Claude elabora:

- Logo Nimboo
- Testo animato che cambia ogni 2 secondi:
  - "Sto leggendo le tue emozioni…"
  - "Sto cercando tra migliaia di libri…"
  - "Ho trovato quello giusto per te."
- Spinner o pulse in terracotta

---

## Monetizzazione — Amazon Associates

```
https://www.amazon.it/s?k=TITOLO+AUTORE&tag=TUO-TAG-21
```

Per iscriversi: [programma-affiliazione.amazon.it](https://programma-affiliazione.amazon.it)
Sostituire `TUO-TAG-21` con il proprio tag una volta approvato.

---

## Roadmap post-MVP

| Fase      | Quando      | Cosa                                              |
| --------- | ----------- | ------------------------------------------------- |
| MVP       | Ora         | Flusso core funzionante                           |
| Freemium  | 500+ utenti | 1 consiglio/mese gratis, Pro illimitato 3–5€/mese |
| Community | Anno 2      | Utenti aggiungono libri + emozioni associate      |
| B2B       | Anno 2+     | Librerie ed editori                               |

---

## Note per Claude

- Il tono del prodotto è **caldo, empatico, editoriale** — non tech, non freddo
- La lingua dell'interfaccia è **italiano**
- Il modello da usare nelle API call è `claude-sonnet-4-5` (o superiore)
- L'output del prompt deve essere **JSON puro** — nessun testo extra, nessun markdown
- Claude a volte restituisce il JSON avvolto in ` ```json ``` `: `lib/claude.ts` già gestisce questo caso con una pulizia regex prima del `JSON.parse` — non rimuovere quella logica
- Nimboo ha già una landing page live (`index.html`) con waitlist via Brevo/Sendinblue
- **Al termine di ogni sessione**, suggerisci eventuali aggiornamenti a questo file (decisioni prese, cose da non fare, stato attuale) prima di chiudere
