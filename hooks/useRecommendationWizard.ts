"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveRecommendation } from "@/lib/recommendationStore";
import { MIN_ANSWER_LENGTH } from "@/lib/validation";

export const QUESTIONS = [
  {
    label:
      "Quali emozioni stai attraversando in questo periodo? Un libro potrebbe aiutarti a viverle meglio.",
    placeholder: "Scrivimi come ti senti…",
  },
  {
    label: "Cosa senti di aver bisogno dalla prossima lettura?",
    placeholder: "Cosa stai cercando in un libro…",
  },
  {
    label:
      "Quanta energia hai per leggere — vuoi qualcosa di leggero o sei pronto a immergerti in qualcosa di impegnativo?",
    placeholder: "Leggero e veloce, oppure denso e profondo…",
  },
];

export const LOADING_MESSAGES = [
  "Sto leggendo le tue emozioni…",
  "Sto cercando tra migliaia di libri…",
  "Ho trovato quello giusto per te.",
];

export type WizardState = {
  currentStep: number;
  answers: string[];
  loading: boolean;
  loadingIdx: number;
  error: string | null;
  isLastStep: boolean;
  canAdvance: boolean;
  currentAnswer: string;
  handleChange: (value: string) => void;
  handleAdvance: () => Promise<void>;
  handleBack: () => void;
};

export function useRecommendationWizard(): WizardState {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentAnswer = answers[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const canAdvance = currentAnswer.length >= MIN_ANSWER_LENGTH;

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingIdx((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleChange = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentStep] = value;
      return next;
    });
  };

  const handleAdvance = async () => {
    if (!canAdvance) return;

    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      return;
    }

    setLoading(true);
    setLoadingIdx(0);
    setError(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1: answers[0],
          q2: answers[1],
          q3: answers[2],
        }),
      });
      if (!res.ok) throw new Error("Errore nella risposta del server");
      const data = await res.json();
      saveRecommendation(data);
      router.push("/recommendation");
    } catch {
      setError("Qualcosa è andato storto. Riprova tra poco.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
  };

  return {
    currentStep,
    answers,
    loading,
    loadingIdx,
    error,
    isLastStep,
    canAdvance,
    currentAnswer,
    handleChange,
    handleAdvance,
    handleBack,
  };
}
