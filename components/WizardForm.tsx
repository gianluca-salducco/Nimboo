"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { saveRecommendation } from "@/lib/recommendationStore";

const QUESTIONS = [
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

const LOADING_MESSAGES = [
  "Sto leggendo le tue emozioni…",
  "Sto cercando tra migliaia di libri…",
  "Ho trovato quello giusto per te.",
];

export default function WizardForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentAnswer = answers[currentStep];
  const isLastStep = currentStep === QUESTIONS.length - 1;
  const canAdvance = currentAnswer.length >= 10;

  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentStep]);

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
      const encoded = encodeURIComponent(JSON.stringify(data));
      router.push(`/recommendation?data=${encoded}`);
    } catch {
      setError("Qualcosa è andato storto. Riprova tra poco.");
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
  };

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
          {currentStep === 0 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl text-ink mb-3 leading-tight">
                Come stai, adesso?
              </h1>
              <p className="font-body text-ink-muted text-lg mb-8 leading-relaxed">
                Rispondimi liberamente. Troverò il libro giusto per te.
              </p>
            </>
          )}

          <ProgressDots total={QUESTIONS.length} current={currentStep} />

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-medium text-ink-soft leading-snug">
                {QUESTIONS[currentStep].label}
              </label>
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

            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="font-body text-sm text-ink-muted hover:text-ink transition-colors text-left"
              >
                ← Indietro
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-2" aria-label={`Passo ${current + 1} di ${total}`}>
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
