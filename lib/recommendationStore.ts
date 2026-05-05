import type { BookRecommendation } from "./claude";

export interface StoredRecommendation extends BookRecommendation {
  savedAt: number;
}

const STORAGE_KEY = "nimboo_history";
const MAX_ITEMS = 10;

export function getHistory(): StoredRecommendation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredRecommendation[];
  } catch {
    return [];
  }
}

export function saveRecommendation(rec: BookRecommendation): void {
  try {
    const history = getHistory();
    const entry: StoredRecommendation = { ...rec, savedAt: Date.now() };
    const updated = [entry, ...history].slice(0, MAX_ITEMS);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // silent
  }
}

export function clearHistory(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}
