import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WizardForm from "./WizardForm";
import { useRouter } from "next/navigation";

jest.mock("@/lib/recommendationStore", () => ({
  saveRecommendation: jest.fn(),
}));

import { saveRecommendation } from "@/lib/recommendationStore";
const mockSave = saveRecommendation as jest.Mock;

const Q1 = "Quali emozioni stai attraversando";
const Q2 = "Cosa senti di aver bisogno";
const Q3 = "Quanta energia hai per leggere";

test("step 1: shows first question, not second or third", () => {
  render(<WizardForm />);
  expect(screen.getByText(new RegExp(Q1))).toBeInTheDocument();
  expect(screen.queryByText(new RegExp(Q2))).not.toBeInTheDocument();
  expect(screen.queryByText(new RegExp(Q3))).not.toBeInTheDocument();
});

test("clicking Avanti with a valid answer shows step 2 question", () => {
  render(<WizardForm />);
  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, { target: { value: "Mi sento molto triste e stanco ultimamente" } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  expect(screen.getByText(new RegExp(Q2))).toBeInTheDocument();
  expect(screen.queryByText(new RegExp(Q1))).not.toBeInTheDocument();
});

test("progress indicator shows 'Passo 1 di 3' on load and updates as steps advance", () => {
  render(<WizardForm />);
  const progressRegion = screen.getByLabelText(/Passo 1 di 3/i);
  expect(progressRegion).toBeInTheDocument();

  const validAnswer = "Mi sento molto triste e stanco ultimamente";
  fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  expect(screen.getByLabelText(/Passo 2 di 3/i)).toBeInTheDocument();
});

test("button label changes to 'Trovami il libro' on the last step", () => {
  render(<WizardForm />);
  const validAnswer = "Mi sento molto triste e stanco ultimamente";

  // advance to step 2
  fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  // advance to step 3
  fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  expect(screen.getByRole("button", { name: /Trovami il libro/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^Avanti$/i })).not.toBeInTheDocument();
});

test("navigating back from step 2 restores the step-1 answer", () => {
  render(<WizardForm />);
  const answer1 = "Mi sento molto triste e stanco ultimamente";

  fireEvent.change(screen.getByRole("textbox"), { target: { value: answer1 } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));
  fireEvent.click(screen.getByRole("button", { name: /Indietro/i }));

  expect(screen.getByRole("textbox")).toHaveValue(answer1);
});

test("back button is hidden on step 1 and visible on step 2", () => {
  render(<WizardForm />);
  expect(screen.queryByRole("button", { name: /Indietro/i })).not.toBeInTheDocument();

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mi sento molto triste e stanco ultimamente" } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  expect(screen.getByRole("button", { name: /Indietro/i })).toBeInTheDocument();
});

test("advance button is disabled when answer has fewer than 10 characters", () => {
  render(<WizardForm />);
  const btn = screen.getByRole("button", { name: /Avanti/i });
  expect(btn).toBeDisabled();

  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, { target: { value: "troppo breve" } }); // 12 chars — should enable
  // first verify it enables at 12
  expect(btn).not.toBeDisabled();

  fireEvent.change(textarea, { target: { value: "corto" } }); // 5 chars — should disable
  expect(btn).toBeDisabled();
});

// --- Issue 18 ---

test("question text renders as h1 on step 0", () => {
  render(<WizardForm />);
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toHaveTextContent(new RegExp(Q1));
});

test("back button appears before the question h1 in DOM order", () => {
  render(<WizardForm />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mi sento molto triste e stanco ultimamente" } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  const backBtn = screen.getByRole("button", { name: /Indietro/i });
  const heading = screen.getByRole("heading", { level: 1 });

  expect(backBtn.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

test('"Come stai, adesso?" overline visible on step 0, hidden on step 1', () => {
  render(<WizardForm />);
  expect(screen.getByText("Come stai, adesso?")).toBeInTheDocument();

  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mi sento molto triste e stanco ultimamente" } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  expect(screen.queryByText("Come stai, adesso?")).not.toBeInTheDocument();
});

test("question text renders as h1 on step 1", () => {
  render(<WizardForm />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Mi sento molto triste e stanco ultimamente" } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toHaveTextContent(new RegExp(Q2));
});

// --- Issue 19: clickable progress dots ---

const advanceToStep = (step: number) => {
  const validAnswer = "Mi sento molto triste e stanco ultimamente";
  for (let i = 0; i < step; i++) {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
    fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));
  }
};

test("answers are preserved after clicking a completed dot", () => {
  render(<WizardForm />);
  const answer1 = "Mi sento molto triste e stanco ultimamente";
  const answer2 = "Ho bisogno di qualcosa di confortante e bello";

  fireEvent.change(screen.getByRole("textbox"), { target: { value: answer1 } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: answer2 } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  // now on step 2, go back to step 0 via dot
  fireEvent.click(screen.getByRole("button", { name: /Vai al passo 1/i }));
  expect(screen.getByRole("textbox")).toHaveValue(answer1);

  // advance again to step 1 — answer2 should still be there
  fireEvent.change(screen.getByRole("textbox"), { target: { value: answer1 } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));
  expect(screen.getByRole("textbox")).toHaveValue(answer2);
});

test("current and future dots are not interactive buttons", () => {
  render(<WizardForm />);
  advanceToStep(1); // now on step 1 (index 1)

  // dot 1 (current) and dot 2 (future) should not be buttons
  expect(screen.queryByRole("button", { name: /Vai al passo 2/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Vai al passo 3/i })).not.toBeInTheDocument();
  // dot 0 (completed) should be a button
  expect(screen.getByRole("button", { name: /Vai al passo 1/i })).toBeInTheDocument();
});

test("clicking a completed dot navigates back to that step", () => {
  render(<WizardForm />);
  advanceToStep(2);
  expect(screen.getByLabelText(/Passo 3 di 3/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /Vai al passo 1/i }));

  expect(screen.getByLabelText(/Passo 1 di 3/i)).toBeInTheDocument();
});

// --- Cycle E ---

const apiResponse = {
  title: "Il piccolo principe",
  author: "Antoine de Saint-Exupéry",
  isbn: "9788845292613",
  explanation: "Un libro perfetto.",
  amazonUrl: "https://www.amazon.it/s?k=Il+piccolo+principe",
};

const fillAndSubmit = () => {
  const validAnswer = "Mi sento molto triste e stanco ultimamente";

  fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
  fireEvent.click(screen.getByRole("button", { name: /Avanti/i }));

  fireEvent.change(screen.getByRole("textbox"), { target: { value: validAnswer } });
  fireEvent.click(screen.getByRole("button", { name: /Trovami il libro/i }));
};

test("calls saveRecommendation with API data before navigating", async () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(apiResponse),
  }) as jest.Mock;

  render(<WizardForm />);
  fillAndSubmit();

  await waitFor(() => {
    expect(mockSave).toHaveBeenCalledWith(apiResponse);
    expect(mockPush).toHaveBeenCalled();
  });

  const pushArg: string = mockPush.mock.calls[0][0];
  expect(pushArg).toBe("/recommendation");
  expect(mockSave.mock.invocationCallOrder[0]).toBeLessThan(
    mockPush.mock.invocationCallOrder[0]
  );
});
