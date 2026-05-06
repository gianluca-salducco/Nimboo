"use client";

import { useRef, useEffect } from "react";
import Logo from "@/components/Logo";
import {
  useRecommendationWizard,
  QUESTIONS,
  LOADING_MESSAGES,
} from "@/hooks/useRecommendationWizard";

export default function WizardForm() {
  const {
    currentStep,
    loading,
    loadingIdx,
    error,
    isLastStep,
    canAdvance,
    currentAnswer,
    handleChange,
    handleAdvance,
    handleBack,
  } = useRecommendationWizard();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
        <Logo />
        <p
          key={loadingIdx}
          className="font-display text-2xl md:text-3xl text-ink text-center animate-pulse"
        >
          {LOADING_MESSAGES[loadingIdx]}
        </p>
        <div className="w-8 h-8 rounded-full border-[3px] border-terracotta border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-6 border-b border-black/5">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <ProgressDots total={QUESTIONS.length} current={currentStep} />

          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="font-body text-sm text-ink-muted hover:text-ink transition-colors text-left mt-6"
            >
              ← Indietro
            </button>
          )}

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {currentStep === 0 && (
                <p className="font-body text-sm font-medium text-ink-muted uppercase tracking-widest">
                  Come stai, adesso?
                </p>
              )}
              <h1 className="font-display text-2xl md:text-3xl text-ink leading-tight">
                {QUESTIONS[currentStep].label}
              </h1>
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={(e) => handleChange(e.target.value)}
                rows={4}
                placeholder={QUESTIONS[currentStep].placeholder}
                className="w-full rounded-xl border border-black/10 bg-white/60 px-4 py-3 font-body text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none transition-all"
              />
            </div>

            {error && <p className="text-sm text-red-500 font-body">{error}</p>}

            <button
              onClick={handleAdvance}
              disabled={!canAdvance}
              className="w-full py-4 rounded-full bg-terracotta text-white font-body font-medium text-lg transition-all hover:bg-terracotta-light hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-[0_4px_24px_rgba(196,99,58,0.3)]"
            >
              {isLastStep ? "Trovami il libro" : "Avanti"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`Passo ${current + 1} di ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            i < current
              ? "bg-terracotta"
              : i === current
                ? "border-2 border-terracotta bg-transparent"
                : "bg-black/15"
          }`}
        />
      ))}
    </div>
  );
}
