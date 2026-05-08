"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    goToStep,
  } = useRecommendationWizard();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
        <Logo />
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-2xl md:text-3xl text-ink text-center"
          >
            {LOADING_MESSAGES[loadingIdx]}
          </motion.p>
        </AnimatePresence>
        <div data-testid="ambient-animation" className="ambient-pulse" />
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
          <ProgressDots total={QUESTIONS.length} current={currentStep} onStepClick={goToStep} />

          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="font-body text-sm text-ink-muted hover:text-ink transition-colors text-left mt-6"
            >
              ← Indietro
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mt-8 flex flex-col gap-6"
            >
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
                  className="w-full border-b border-black/10 bg-cream/80 backdrop-blur-sm px-4 py-3 font-display text-ink leading-relaxed placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none transition-all"
                />
              </div>

              {error && <p className="text-sm text-red-500 font-body">{error}</p>}

              <button
                onClick={handleAdvance}
                disabled={!canAdvance}
                className="w-full py-4 rounded-full bg-terracotta text-white font-body font-medium text-lg transition-all hover:bg-terracotta-light hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-[var(--shadow-terracotta)]"
              >
                {isLastStep ? "Trovami il libro" : "Avanti"}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ProgressDots({
  total,
  current,
  onStepClick,
}: {
  total: number;
  current: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="flex justify-center gap-2" aria-label={`Passo ${current + 1} di ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < current;
        const baseClass = "w-2.5 h-2.5 rounded-full transition-all";
        const colorClass = isCompleted
          ? "bg-terracotta"
          : i === current
            ? "border-2 border-terracotta bg-transparent"
            : "bg-black/15";

        if (isCompleted && onStepClick) {
          return (
            <button
              key={i}
              aria-label={`Vai al passo ${i + 1}`}
              onClick={() => onStepClick(i)}
              className={`${baseClass} ${colorClass} cursor-pointer hover:scale-125`}
            />
          );
        }

        return (
          <div
            key={i}
            className={`${baseClass} ${colorClass} cursor-default`}
          />
        );
      })}
    </div>
  );
}
