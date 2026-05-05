import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HistoryList from "@/components/HistoryList";
import { useRouter } from "next/navigation";

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

jest.mock("@/lib/recommendationStore", () => ({
  getHistory: jest.fn(),
}));

import { getHistory } from "@/lib/recommendationStore";
const mockGetHistory = getHistory as jest.Mock;

const makeRec = (title: string, author = "Test Author") => ({
  title,
  author,
  isbn: "9780000000000",
  explanation: "A test explanation.",
  amazonUrl: "https://www.amazon.it/s?k=test",
  savedAt: Date.now(),
});

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

// --- Cycle A ---

test("renders nothing when history is empty", () => {
  mockGetHistory.mockReturnValue([]);
  const { container } = render(<HistoryList />);
  expect(container.firstChild).toBeNull();
});

// --- Cycle B ---

test("shows heading when history has at least one entry", () => {
  mockGetHistory.mockReturnValue([makeRec("Il piccolo principe")]);
  render(<HistoryList />);
  expect(screen.getByText("I tuoi consigli di oggi")).toBeInTheDocument();
});

// --- Cycle C ---

test("each card shows title and author", () => {
  mockGetHistory.mockReturnValue([
    makeRec("Il piccolo principe", "Antoine de Saint-Exupéry"),
    makeRec("1984", "George Orwell"),
  ]);
  render(<HistoryList />);
  expect(screen.getByText("Il piccolo principe")).toBeInTheDocument();
  expect(screen.getByText("Antoine de Saint-Exupéry")).toBeInTheDocument();
  expect(screen.getByText("1984")).toBeInTheDocument();
  expect(screen.getByText("George Orwell")).toBeInTheDocument();
});

// --- Cycle D ---

test("clicking a card navigates to /recommendation with encoded data", () => {
  const rec = makeRec("Il nome della rosa", "Umberto Eco");
  mockGetHistory.mockReturnValue([rec]);
  render(<HistoryList />);

  fireEvent.click(screen.getByText("Il nome della rosa"));

  const expected = `/recommendation?data=${encodeURIComponent(JSON.stringify(rec))}`;
  expect(mockPush).toHaveBeenCalledWith(expected);
});
