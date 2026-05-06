import { renderHook, act } from "@testing-library/react";
import { useRecommendationWizard } from "@/hooks/useRecommendationWizard";

jest.mock("@/lib/recommendationStore", () => ({ saveRecommendation: jest.fn() }));

const advanceTo = (
  result: ReturnType<typeof renderHook<ReturnType<typeof useRecommendationWizard>, unknown>>["result"],
  step: number
) => {
  for (let i = 0; i < step; i++) {
    act(() => { result.current.handleChange(`risposta abbastanza lunga ${i}`); });
    act(() => { result.current.handleAdvance(); });
  }
};

test("goToStep with index >= currentStep is a no-op", () => {
  const { result } = renderHook(() => useRecommendationWizard());
  advanceTo(result, 1);
  expect(result.current.currentStep).toBe(1);

  act(() => { result.current.goToStep(1); }); // same step
  expect(result.current.currentStep).toBe(1);

  act(() => { result.current.goToStep(2); }); // future step
  expect(result.current.currentStep).toBe(1);
});

test("goToStep preserves all answers", () => {
  const { result } = renderHook(() => useRecommendationWizard());
  advanceTo(result, 2);
  const expectedAnswers = [...result.current.answers];

  act(() => { result.current.goToStep(0); });

  expect(result.current.answers).toEqual(expectedAnswers);
});

test("goToStep navigates to an earlier step", () => {
  const { result } = renderHook(() => useRecommendationWizard());
  advanceTo(result, 2);
  expect(result.current.currentStep).toBe(2);

  act(() => { result.current.goToStep(0); });

  expect(result.current.currentStep).toBe(0);
});
