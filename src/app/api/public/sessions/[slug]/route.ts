import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Ctx = { params: Promise<{ slug: string }> }

// ─────────────────────────────────────────
// GET /api/public/sessions/[slug]
// Données publiques d'une session (sans auth)
// ─────────────────────────────────────────

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params

  const session = await db.Session.findOne({
    where:   { name: slug },   // le slug est le name normalisé — à affiner avec une colonne slug dédiée
    include: [
      {
        model:    db.CartonPack,
        as:       'carton_packs',
        where:    { is_active: true },
        required: false,
        order:    [['display_order', 'ASC']],
      },
      { model: db.Association, as: 'association', attributes: ['name'] },
    ],
  })

  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session.toJSON() as any

  // N'exposer que si la session est ouverte aux ventes
  if (!['open', 'running'].includes(s.status)) {
    return NextResponse.json({ error: 'Les ventes ne sont pas ouvertes' }, { status: 403 })
  }

  // Compter les cartons restants
  const cartonsDisponibles = await db.Carton.count({
    where: { session_id: s.id, status: 'available' },
  })

  return NextResponse.json({
    session: {
      id:           s.id,
      name:         s.name,
      date:         s.date,
      status:       s.status,
      max_cartons:  s.max_cartons,
      association:  s.association?.name,
      carton_packs: s.carton_packs,
    },
    cartons_disponibles: cartonsDisponibles,
  })
}
