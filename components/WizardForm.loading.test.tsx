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

test("loading screen does not render the wizard step UI", () => {
  render(<WizardForm />);
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Avanti/i })).not.toBeInTheDocument();
});
