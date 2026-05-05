'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

const LOADING_MESSAGES = [
  'Sto leggendo le tue emozioni…',
  'Sto cercando tra migliaia di libri…',
  'Ho trovato quello giusto per te.',
]

export default function QuestionForm() {
  const router = useRouter()
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingIdx, setLoadingIdx] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const isValid = q1.length >= 10 && q2.length >= 10 && q3.length >= 10

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingIdx((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev))
    }, 2000)
    return () => clearInterval(interval)
  }, [loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setLoadingIdx(0)
    setError(null)

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q1, q2, q3 }),
      })

      if (!res.ok) throw new Error('Errore nella risposta del server')

      const data = await res.json()
      const encoded = encodeURIComponent(JSON.stringify(data))
      router.push(`/recommendation?data=${encoded}`)
    } catch {
      setError('Qualcosa è andato storto. Riprova tra poco.')
      setLoading(false)
    }
  }

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
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-6 border-b border-black/5">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <h1 className="font-display text-4xl md:text-5xl text-ink mb-3 leading-tight">
            Come stai, adesso?
          </h1>
          <p className="font-body text-ink-muted text-lg mb-12 leading-relaxed">
            Rispondimi liberamente. Troverò il libro giusto per te.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <Field
              label="Quali emozioni stai attraversando in questo periodo? Un libro potrebbe aiutarti a viverle meglio."
              value={q1}
              onChange={setQ1}
              placeholder="Scrivimi come ti senti…"
            />
            <Field
              label="Cosa senti di aver bisogno dalla prossima lettura?"
              value={q2}
              onChange={setQ2}
              placeholder="Cosa stai cercando in un libro…"
            />
            <Field
              label="Quanta energia hai per leggere — vuoi qualcosa di leggero o sei pronto a immergerti in qualcosa di impegnativo?"
              value={q3}
              onChange={setQ3}
              placeholder="Leggero e veloce, oppure denso e profondo…"
            />

            {error && <p className="text-sm text-red-500 font-body">{error}</p>}

            <button
              type="submit"
              disabled={!isValid}
              className="w-full py-4 rounded-full bg-terracotta text-white font-body font-medium text-lg transition-all hover:bg-terracotta-light hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-[0_4px_24px_rgba(196,99,58,0.3)]"
            >
              Trovami il libro
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-body text-sm font-medium text-ink-soft leading-snug">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 bg-white/60 px-4 py-3 font-body text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terracotta/30 resize-none transition-all"
      />
    </div>
  )
}
