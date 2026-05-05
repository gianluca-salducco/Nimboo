import { saveRecommendation, getHistory, clearHistory } from "./recommendationStore";
import type { BookRecommendation } from "./claude";

const makeRec = (title: string): BookRecommendation => ({
  title,
  author: "Test Author",
  isbn: "9780000000000",
  explanation: "A test explanation.",
  amazonUrl: "https://www.amazon.it/s?k=test",
});

beforeEach(() => {
  sessionStorage.clear();
});

test("getHistory returns [] when storage is empty", () => {
  expect(getHistory()).toEqual([]);
});

test("saveRecommendation adds an element retrievable via getHistory", () => {
  const rec = makeRec("Il piccolo principe");
  saveRecommendation(rec);
  const history = getHistory();
  expect(history).toHaveLength(1);
  expect(history[0].title).toBe("Il piccolo principe");
  expect(typeof history[0].savedAt).toBe("number");
});

test("multiple saves produce list ordered newest-first", () => {
  saveRecommendation(makeRec("Primo"));
  saveRecommendation(makeRec("Secondo"));
  saveRecommendation(makeRec("Terzo"));
  const history = getHistory();
  expect(history[0].title).toBe("Terzo");
  expect(history[1].title).toBe("Secondo");
  expect(history[2].title).toBe("Primo");
});

test("clearHistory empties the list", () => {
  saveRecommendation(makeRec("Il nome della rosa"));
  saveRecommendation(makeRec("1984"));
  clearHistory();
  expect(getHistory()).toEqual([]);
});

test("no method throws when sessionStorage throws SecurityError", () => {
  const error = new DOMException("Access denied", "SecurityError");
  jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw error; });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw error; });
  jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw error; });

  expect(() => getHistory()).not.toThrow();
  expect(() => saveRecommendation(makeRec("Qualsiasi libro"))).not.toThrow();
  expect(() => clearHistory()).not.toThrow();

  jest.restoreAllMocks();
});

test("11th save evicts the oldest (FIFO cap of 10)", () => {
  for (let i = 1; i <= 10; i++) {
    saveRecommendation(makeRec(`Libro ${i}`));
  }
  saveRecommendation(makeRec("Libro 11"));
  const history = getHistory();
  expect(history).toHaveLength(10);
  expect(history[0].title).toBe("Libro 11");
  expect(history[9].title).toBe("Libro 2");
});
