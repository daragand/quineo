import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Ctx = { params: Promise<{ slug: string }> }

// ─────────────────────────────────────────
// GET /api/public/sessions/[slug]
// slug = display_code à 4 chiffres
// Retourne les infos publiques de la session (packs + providers).
// Sans authentification.
// ─────────────────────────────────────────

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params

  let session: import('sequelize').Model | null
  try {
    session = await db.Session.findOne({
      where: { display_code: slug },
      include: [
        {
          model:      db.Association,
          as:         'association',
          attributes: ['id', 'name'],
          include: [
            {
              model:      db.PaymentProvider,
              as:         'payment_providers',
              where:      { active: true },
              required:   false,
              attributes: ['id', 'type', 'name'],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          ],
        },
        {
          model:      db.CartonPack,
          as:         'carton_packs',
          where:      { is_active: true },
          required:   false,
          attributes: ['id', 'label', 'quantity', 'price', 'max_per_person', 'display_order'],
        },
      ],
    })
  } catch (err) {
    console.error('[public sessions GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  if (!session) {
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session.toJSON() as any

  if (!['open', 'running'].includes(s.status)) {
    return NextResponse.json({ error: 'Les ventes sont fermées pour cette session' }, { status: 403 })
  }

  const availableCount = await db.Carton.count({
    where: { session_id: s.id, status: 'available' },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const packs = (s.carton_packs ?? [] as any[])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => (a.display_order ?? 999) - (b.display_order ?? 999))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      id:        p.id        as string,
      label:     p.label     as string,
      quantity:  p.quantity  as number,
      price:     parseFloat(p.price),
      unitPrice: parseFloat(p.price) / (p.quantity as number),
      maxPer:    (p.max_per_person as number | null) ?? null,
    }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers = (s.association?.payment_providers ?? [] as any[]).map((pp: any) => ({
    type: pp.type as string,
    name: pp.name as string,
  }))

  return NextResponse.json({
    id:                s.id           as string,
    display_code:      s.display_code as string,
    name:              s.name         as string,
    date:              (s.date        as string | null) ?? null,
    description:       (s.description as string | null) ?? null,
    status:            s.status       as string,
    max_cartons:       (s.max_cartons as number | null) ?? 50,
    available_cartons: availableCount,
    association:       { name: (s.association?.name as string) ?? '' },
    packs,
    providers,
  })
}
