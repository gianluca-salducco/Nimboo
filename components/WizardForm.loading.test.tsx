import React from "react";
import { render, screen } from "@testing-library/react";
import WizardForm from "./WizardForm";

jest.mock("@/lib/recommendationStore", () => ({
  saveRecommendation: jest.fn(),
}));

jest.mock("@/hooks/useRecommendationWizard", () => ({
  ...jest.requireActual("@/hooks/useRecommendationWizard"),
  useRecommendationWizard: jest.fn(() => ({
    currentStep: 0,
    loading: true,
    loadingIdx: 0,
    error: null,
    isLastStep: false,
    canAdvance: false,
    currentAnswer: "",
    handleChange: jest.fn(),
    handleAdvance: jest.fn(),
    handleBack: jest.fn(),
    goToStep: jest.fn(),
  })),
}));

test("loading screen shows first loading message", () => {
  render(<WizardForm />);
  expect(screen.getByText("Sto leggendo le tue emozioni…")).toBeInTheDocument();
});

test("loading screen shows the message for the current loadingIdx", () => {
  const { useRecommendationWizard } = jest.requireMock("@/hooks/useRecommendationWizard");
  useRecommendationWizard.mockReturnValue({
    currentStep: 0, loading: true, loadingIdx: 1, error: null,
    isLastStep: false, canAdvance: false, currentAnswer: "",
    handleChange: jest.fn(), handleAdvance: jest.fn(), handleBack: jest.fn(), goToStep: jest.fn(),
  });
  render(<WizardForm />);
  expect(screen.getByText("Sto cercando tra migliaia di libri…")).toBeInTheDocument();
});

test("loading screen has an ambient animation element", () => {
  render(<WizardForm />);
  expect(screen.getByTestId("ambient-animation")).toBeInTheDocument();
});

test("loading screen has no generic spinning border indicator", () => {
  const { container } = render(<WizardForm />);
  expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
});

test("loading screen does not render the wizard step UI", () => {
  render(<WizardForm />);
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Avanti/i })).not.toBeInTheDocument();
});
