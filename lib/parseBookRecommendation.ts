import { BookRecommendation } from "./types";

export function parseBookRecommendation(raw: string): BookRecommendation {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned) as BookRecommendation;
  } catch {
    throw new Error(`Risposta non valida da Claude: ${cleaned.slice(0, 120)}`);
  }
}
