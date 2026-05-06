'use client'

import Link from 'next/link'
import { useCoverUrl } from '@/lib/useCoverUrl'
import type { BookRecommendation } from '@/lib/types'

export default function BookCard({ recommendation }: { recommendation: BookRecommendation }) {
  const { title, author, isbn, explanation, amazonUrl } = recommendation
  const { url, status } = useCoverUrl(isbn)

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 text-center">
      <p className="font-body text-ink-muted text-base">Il tuo libro per adesso è</p>

      <div className="flex-shrink-0">
        {status === 'loading' && <CoverLoading />}
        {status === 'ready' && url && <CoverImage url={url} title={title} />}
        {status === 'error' && <CoverPlaceholder title={title} />}
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">{title}</h1>
        <p className="font-body text-ink-muted text-lg">{author}</p>
      </div>

      <p className="font-body text-ink-soft text-base leading-relaxed max-w-md">{explanation}</p>

      <div className="flex flex-col items-center gap-4 w-full">
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-sm py-4 rounded-full bg-terracotta text-white font-body font-medium text-lg text-center transition-all hover:bg-terracotta-light hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_24px_rgba(196,99,58,0.3)]"
        >
          Compralo su Amazon →
        </a>
        <p className="font-body text-xs text-ink-muted/70 text-center max-w-xs leading-relaxed">
          In qualità di Affiliato Amazon, ricevo un guadagno dagli acquisti idonei.
        </p>
        <Link
          href="/"
          className="font-body text-ink-muted text-sm hover:text-terracotta transition-colors"
        >
          ← Ricomincia
        </Link>
      </div>
    </div>
  )
}

function CoverLoading() {
  return (
    <div
      data-testid="cover-loading"
      className="w-44 h-64 rounded-xl shadow-xl bg-terracotta/20 animate-pulse"
    />
  )
}

function CoverImage({ url, title }: { url: string; title: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Copertina di ${title}`}
      className="w-44 h-64 object-cover rounded-xl shadow-xl"
    />
  )
}

function CoverPlaceholder({ title }: { title: string }) {
  return (
    <div
      data-testid="cover-placeholder"
      className="w-44 h-64 bg-terracotta rounded-xl shadow-xl flex items-center justify-center p-6"
    >
      <p className="font-display text-white text-center text-lg leading-snug">{title}</p>
    </div>
  )
}
