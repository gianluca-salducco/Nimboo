import { parseBookRecommendation } from "@/lib/parseBookRecommendation";
import { BookRecommendation } from "@/lib/types";

const validBook: BookRecommendation = {
  title: "Il piccolo principe",
  author: "Antoine de Saint-Exupéry",
  isbn: "9788845292613",
  explanation: "Un libro che ti aiuterà a ritrovare la semplicità.",
  amazonUrl: "https://www.amazon.it/s?k=Il+piccolo+principe&tag=nimboo0e-21",
};

const validJson = JSON.stringify(validBook);

describe("parseBookRecommendation", () => {
  it("parses clean JSON", () => {
    expect(parseBookRecommendation(validJson)).toEqual(validBook);
  });

  it("parses JSON wrapped in ```json fences", () => {
    expect(parseBookRecommendation(`\`\`\`json\n${validJson}\n\`\`\``)).toEqual(validBook);
  });

  it("parses JSON wrapped in plain ``` fences", () => {
    expect(parseBookRecommendation(`\`\`\`\n${validJson}\n\`\`\``)).toEqual(validBook);
  });

  it("parses JSON with leading and trailing whitespace", () => {
    expect(parseBookRecommendation(`  \n  ${validJson}  \n  `)).toEqual(validBook);
  });

  it("parses JSON with ```json fences and extra whitespace", () => {
    expect(parseBookRecommendation(`\`\`\`json  \n${validJson}\n  \`\`\``)).toEqual(validBook);
  });

  it("throws with a clear message on invalid JSON", () => {
    expect(() => parseBookRecommendation("not json at all")).toThrow(
      "Risposta non valida da Claude"
    );
  });

  it("throws on an empty string", () => {
    expect(() => parseBookRecommendation("")).toThrow("Risposta non valida da Claude");
  });

  it("throws on JSON with only markdown fences and no content", () => {
    expect(() => parseBookRecommendation("```json\n```")).toThrow("Risposta non valida da Claude");
  });
});
