import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PlayClient from './PlayClient'

interface CartonData {
  id:            string
  serial_number: string
  grid:          number[][]
}

interface TirageData {
  id:           string
  type:         string
  status:       string
  lotName:      string | null
  drawnNumbers: number[]
}

interface PageData {
  session: {
    id:              string
    name:            string
    date:            string | null
    status:          string
    associationName: string
  }
  cartons:       CartonData[]
  activeTirage:  TirageData | null
}

export const metadata: Metadata = {
  title: 'Mes cartons — Quinova',
}

async function fetchData(paiementId: string): Promise<PageData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/public/play/${paiementId}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ paiement_id: string }>
}) {
  const { paiement_id } = await params
  const data = await fetchData(paiement_id)

  if (!data) notFound()

  return (
    <PlayClient
      paiementId={paiement_id}
      session={data.session}
      cartons={data.cartons}
      initialTirage={data.activeTirage}
    />
  )
}
