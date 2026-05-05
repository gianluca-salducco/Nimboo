import Link from 'next/link'
import BookCard from '@/components/BookCard'
import Logo from '@/components/Logo'

interface BookRecommendation {
  title: string
  author: string
  isbn: string
  explanation: string
  amazonUrl: string
}

export default function RecommendationPage({
  searchParams,
}: {
  searchParams: { data?: string }
}) {
  let recommendation: BookRecommendation | null = null

  try {
    if (searchParams.data) {
      recommendation = JSON.parse(decodeURIComponent(searchParams.data))
    }
  } catch {
    // dati non validi
  }

  if (!recommendation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-body text-ink-muted">Nessuna raccomandazione trovata.</p>
        <Link href="/" className="font-body text-terracotta hover:underline">
          ← Torna alle domande
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-6 flex items-center border-b border-black/5">
        <Link href="/" aria-label="Torna alla home">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <BookCard recommendation={recommendation} />
      </main>
    </div>
  )
}
