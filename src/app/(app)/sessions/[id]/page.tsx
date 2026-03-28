export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { QueryTypes } from 'sequelize'
import { getServerUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { ManageSessionClient } from './ManageClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManageSessionPage({ params }: Props) {
  const { id } = await params
  const user = await getServerUser()
  if (!user) notFound()

  const raw = await db.Session.findOne({
    where: { id, association_id: user.association_id },
    include: [
      { model: db.Lot,        as: 'lots',        order: [['order', 'ASC']] },
      { model: db.CartonPack, as: 'carton_packs', order: [['display_order', 'ASC']] },
    ],
  })

  if (!raw) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = raw.toJSON() as any

  // Cartons vendus
  const cartonCountRows = await db.sequelize.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM cartons WHERE session_id = :sid AND status = 'sold'`,
    { type: QueryTypes.SELECT, replacements: { sid: id } },
  )
  const cartonsSold = parseInt(cartonCountRows[0]?.count ?? '0', 10)

  // Recettes
  const revenueRows = await db.sequelize.query<{ total: string }>(
    `SELECT COALESCE(SUM(p.amount), 0) AS total
     FROM paiements p
     JOIN paiement_cartons pc ON pc.paiement_id = p.id
     JOIN cartons c ON c.id = pc.carton_id
     WHERE p.status = 'completed' AND c.session_id = :sid`,
    { type: QueryTypes.SELECT, replacements: { sid: id } },
  )
  const revenue = parseFloat(revenueRows[0]?.total ?? '0')

  return (
    <ManageSessionClient
      session={{
        id:           s.id,
        name:         s.name,
        date:         s.date ?? undefined,
        description:  s.description ?? undefined,
        max_cartons:  s.max_cartons ?? undefined,
        status:       s.status,
        display_code: s.display_code ?? undefined,
        cartonsSold,
        revenue,
        lots: (s.lots ?? []).map((l: any) => ({
          id:     l.id,
          name:   l.name,
          value:  l.value ?? undefined,
          status: l.status,
        })),
        packs: (s.carton_packs ?? []).map((p: any) => ({
          id:        p.id,
          label:     p.label,
          quantity:  p.quantity,
          price:     p.price,
          is_active: p.is_active,
        })),
      }}
    />
  )
}
