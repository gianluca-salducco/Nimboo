"use client";

import { useRouter } from "next/navigation";
import { getHistory, type StoredRecommendation } from "@/lib/recommendationStore";

export default function HistoryList() {
  const router = useRouter();
  const history = getHistory();
  if (history.length <= 1) return null;

  const handleCardClick = (rec: StoredRecommendation) => {
    const encoded = encodeURIComponent(JSON.stringify(rec));
    router.push(`/recommendation?data=${encoded}`);
  };

  return (
    <section className="px-6 pb-16 max-w-xl mx-auto w-full">
      <h2 className="font-display text-xl text-ink mb-4">I tuoi consigli di oggi</h2>
      <ul className="flex flex-col gap-3 max-h-72 overflow-y-auto">
        {history.map((rec, i) => (
          <li
            key={i}
            onClick={() => handleCardClick(rec)}
            className="flex items-center gap-4 p-3 rounded-xl border border-black/[0.08] bg-white/60 backdrop-blur-sm cursor-pointer hover:border-terracotta/40 transition-colors"
          >
            <CoverThumb isbn={rec.isbn} title={rec.title} />
            <div className="flex flex-col min-w-0">
              <span className="font-body font-medium text-ink text-sm truncate">{rec.title}</span>
              <span className="font-body text-ink-muted text-xs truncate">{rec.author}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoverThumb({ isbn, title }: { isbn: string; title: string }) {
  if (!isbn) return <TerracottaThumb title={title} />;
  return (
    <img
      src={`https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg`}
      alt={title}
      className="w-10 h-14 object-cover rounded flex-shrink-0"
      onError={(e) => {
        const target = e.currentTarget;
        target.style.display = "none";
        const placeholder = target.nextElementSibling as HTMLElement | null;
        if (placeholder) placeholder.style.display = "flex";
      }}
    />
  );
}

function TerracottaThumb({ title }: { title: string }) {
  return (
    <div className="w-10 h-14 rounded flex-shrink-0 bg-terracotta flex items-center justify-center">
      <span className="text-white text-[8px] font-body text-center leading-tight px-1 line-clamp-3">
        {title}
      </span>
    </div>
  );
}
