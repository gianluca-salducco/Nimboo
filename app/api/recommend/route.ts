import { NextRequest, NextResponse } from 'next/server'
import { getBookRecommendation } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { q1, q2, q3 } = body

    if (!q1 || !q2 || !q3) {
      return NextResponse.json(
        { error: 'Tutti e tre i campi sono obbligatori' },
        { status: 400 }
      )
    }

    const MAX_LENGTH = 1000
    if (q1.length > MAX_LENGTH || q2.length > MAX_LENGTH || q3.length > MAX_LENGTH) {
      return NextResponse.json(
        { error: 'Input troppo lungo. Massimo 1000 caratteri per campo.' },
        { status: 400 }
      )
    }

    const recommendation = await getBookRecommendation(q1, q2, q3)
    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('Errore nella raccomandazione:', error)
    return NextResponse.json(
      { error: 'Errore nel generare la raccomandazione' },
      { status: 500 }
    )
  }
}
