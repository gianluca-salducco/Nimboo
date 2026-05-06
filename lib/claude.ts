import Anthropic from "@anthropic-ai/sdk";
import { BookRecommendation } from "./types";
import { parseBookRecommendation } from "./parseBookRecommendation";

export type { BookRecommendation };
export { parseBookRecommendation };

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getBookRecommendation(
  q1: string,
  q2: string,
  q3: string,
): Promise<BookRecommendation> {
  const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG || "nimboo0e-21";

  const prompt = `Sei un consulente letterario empatico e colto.
Il tuo compito è raccomandare UN SOLO libro a una persona
basandoti sul suo stato emotivo.

Rispondi SOLO in formato JSON valido, senza testo aggiuntivo.

Stato emotivo dell'utente:
- Emozioni che sta vivendo: ${q1}
- Cosa cerca dalla lettura: ${q2}
- Livello di energia: ${q3}

Restituisci questo JSON:
{
  "title": "Titolo esatto del libro",
  "author": "Nome Cognome autore",
  "isbn": "ISBN-13 se lo conosci, altrimenti stringa vuota",
  "explanation": "3-4 frasi in italiano, tono caldo e personale, spiega perché questo libro è giusto per questa persona in questo momento",
  "amazonUrl": "https://www.amazon.it/s?k=TITOLO+AUTORE&tag=${amazonTag}"
}

Regole:
- Scegli libri che esistono davvero
- Preferisci libri disponibili in italiano
- Se il libro ha un'edizione italiana, usa il titolo ufficiale pubblicato in Italia — mai tradurre letteralmente il titolo originale
- Varia il genere in base allo stato emotivo
- Non raccomandare sempre i soliti classici — sii originale
- L'explanation deve sembrare scritta da un amico che ti conosce bene
- Prima di rispondere, verifica internamente che titolo, autore e ISBN si riferiscano tutti allo stesso libro`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Risposta inattesa da Claude");
  }

  return parseBookRecommendation(content.text);
}
