"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BookCard from "@/components/BookCard";
import HistoryList from "@/components/HistoryList";
import Logo from "@/components/Logo";
import { getHistory } from "@/lib/recommendationStore";
import type { BookRecommendation } from "@/lib/types";

export default function RecommendationPage() {
  const [recommendation, setRecommendation] = useState<
    BookRecommendation | null | undefined
  >(undefined);

  useEffect(() => {
    const history = getHistory();
    setRecommendation(history.length > 0 ? history[0] : null);
  }, []);

  if (recommendation === undefined) {
    return null;
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-body text-ink-muted">
          Nessuna raccomandazione trovata.
        </p>
        <Link href="/" className="font-body text-terracotta hover:underline">
          ← Torna alle domande
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-6 flex items-center border-b border-black/5">
        <Link href="/" aria-label="Torna alla home">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 px-6 py-16">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:items-start max-w-5xl mx-auto">
          <BookCard recommendation={recommendation} />
          <div className="mt-10 lg:mt-0">
            <div className="hidden lg:block">
              <HistoryList />
            </div>
            <details className="lg:hidden">
              <summary className="font-body text-ink-muted cursor-pointer mb-4">
                I tuoi consigli precedenti ↓
              </summary>
              <HistoryList />
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
