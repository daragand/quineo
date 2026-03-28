import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import DisplayClient from './DisplayClient'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function DisplayPage({ params }: Props) {
  const { sessionId } = await params

  // Vérifier que la session existe
  const session = await db.Session.findOne({
    where:      { id: sessionId },
    attributes: ['id', 'name', 'status'],
    raw:        true,
  }) as { id: string; name: string; status: string } | null

  if (!session) notFound()

  // Nombre total de lots (pour LotPanel "Lot n° X / Y")
  const totalLots = await db.Lot.count({ where: { session_id: sessionId } })

  // Tirage en cours (si existant)
  const rawTirage = await db.Tirage.findOne({
    where:   { session_id: sessionId, status: 'running' },
    include: [
      { model: db.DrawEvent, as: 'draw_events', attributes: ['number', 'sequence'] },
    ],
  })

  let initialState = null

  if (rawTirage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = rawTirage.toJSON() as any

    const tirageLots = await db.TirageLot.findAll({
      where:   { tirage_id: t.id },
      include: [{ model: db.Lot, as: 'lot', attributes: ['id', 'name', 'value', 'order', 'image_url'] }],
      order:   [['order', 'ASC']],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstLotRaw = tirageLots.length > 0 ? (tirageLots[0].toJSON() as any).lot : null

    initialState = {
      id:   t.id,
      type: t.type ?? 'quine',
      lot:  firstLotRaw
        ? {
            id:        firstLotRaw.id,
            name:      firstLotRaw.name,
            value:     firstLotRaw.value != null ? parseFloat(firstLotRaw.value) : null,
            order:     firstLotRaw.order ?? 0,
            image_url: firstLotRaw.image_url ?? null,
          }
        : null,
      drawEvents:  (t.draw_events ?? []) as Array<{ number: number; sequence: number }>,
      sessionName: session.name,
      totalLots,
    }
  }

  return (
    <DisplayClient
      sessionId={sessionId}
      sessionName={session.name}
      initialState={initialState}
      totalLots={totalLots}
    />
  )
}
