import { render, screen } from "@testing-library/react";
import BookCard from "@/components/BookCard";
import * as useCoverUrlModule from "@/lib/useCoverUrl";

const RECOMMENDATION = {
  title: "Il piccolo principe",
  author: "Antoine de Saint-Exupéry",
  isbn: "9788845292613",
  explanation: "Un libro per te.",
  amazonUrl: "https://www.amazon.it/s?k=piccolo+principe&tag=nimboo0e-21",
};

function mockCoverUrl(partial: Partial<useCoverUrlModule.CoverUrlResult>) {
  jest.spyOn(useCoverUrlModule, "useCoverUrl").mockReturnValue({
    url: null,
    status: "loading",
    ...partial,
  });
}

afterEach(() => jest.restoreAllMocks());

// Cycle 8 — pulse placeholder during loading
test("shows animated pulse placeholder while cover is loading", () => {
  mockCoverUrl({ status: "loading" });
  render(<BookCard recommendation={RECOMMENDATION} />);
  expect(screen.getByTestId("cover-loading")).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

// Cycle 9 — img when ready
test("shows verified cover image when ready", () => {
  const url = `https://covers.openlibrary.org/b/isbn/${RECOMMENDATION.isbn}-L.jpg`;
  mockCoverUrl({ status: "ready", url });
  render(<BookCard recommendation={RECOMMENDATION} />);
  const img = screen.getByRole("img");
  expect(img).toHaveAttribute("src", url);
  expect(screen.queryByTestId("cover-loading")).not.toBeInTheDocument();
  expect(screen.queryByTestId("cover-placeholder")).not.toBeInTheDocument();
});

// Cycle 10 — placeholder on error
test("shows terracotta placeholder when cover is unavailable", () => {
  mockCoverUrl({ status: "error", url: null });
  render(<BookCard recommendation={RECOMMENDATION} />);
  expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByTestId("cover-loading")).not.toBeInTheDocument();
});

// Issue 24: shadow token
test("Amazon CTA link uses the --shadow-terracotta CSS token", () => {
  mockCoverUrl({ status: "loading" });
  render(<BookCard recommendation={RECOMMENDATION} />);
  const link = screen.getByRole("link", { name: /compralo su amazon/i });
  expect(link.className).toContain("shadow-[var(--shadow-terracotta)]");
  expect(link.className).not.toContain("rgba(196,99,58");
});

// Title, author, explanation and CTA are always visible regardless of cover status
test("renders title, author, explanation and CTA immediately regardless of cover status", () => {
  mockCoverUrl({ status: "loading" });
  render(<BookCard recommendation={RECOMMENDATION} />);
  expect(screen.getByText(RECOMMENDATION.title)).toBeInTheDocument();
  expect(screen.getByText(RECOMMENDATION.author)).toBeInTheDocument();
  expect(screen.getByText(RECOMMENDATION.explanation)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /compralo su amazon/i })).toBeInTheDocument();
});
