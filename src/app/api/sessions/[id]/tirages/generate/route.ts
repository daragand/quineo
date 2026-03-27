import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { assocScope } from '@/lib/services/scope'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

const GenerateSchema = z.object({
  // Nombre de tirages à créer
  count: z.number().int().min(1).max(100),

  // Répartition des types — si absent, calculé automatiquement
  distribution: z.object({
    quine:        z.number().int().min(0),
    double_quine: z.number().int().min(0),
    carton_plein: z.number().int().min(0),
  }).optional(),

  // Comment répartir les lots entre les tirages
  // 'value_desc'  : lots les plus chers → carton_plein, intermédiaires → double_quine, moins chers → quine
  // 'even'        : lots répartis équitablement dans l'ordre
  lot_strategy: z.enum(['value_desc', 'even']).default('value_desc'),

  // Remplacer les tirages existants en draft, ou les ajouter à la suite
  replace_drafts: z.boolean().default(false),
})

type TirageType = 'quine' | 'double_quine' | 'carton_plein'

function buildTypeSequence(
  count: number,
  dist?: { quine: number; double_quine: number; carton_plein: number }
): TirageType[] {
  if (dist) {
    const seq: TirageType[] = [
      ...Array(dist.quine).fill('quine'),
      ...Array(dist.double_quine).fill('double_quine'),
      ...Array(dist.carton_plein).fill('carton_plein'),
    ]
    // Compléter si la somme ne correspond pas
    while (seq.length < count) seq.push('quine')
    return seq.slice(0, count)
  }

  // Auto : répartition équilibrée quine > double_quine > carton_plein
  const cp  = Math.max(1, Math.floor(count * 0.2))      // ~20% carton plein
  const dq  = Math.max(1, Math.floor(count * 0.3))      // ~30% double quine
  const q   = count - cp - dq                            // reste en quine
  return [
    ...Array(Math.max(0, q)).fill('quine'),
    ...Array(dq).fill('double_quine'),
    ...Array(cp).fill('carton_plein'),
  ] as TirageType[]
}

// POST /api/sessions/[id]/tirages/generate
export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const scope   = assocScope(ctx.user)
    const session = await db.Session.findOne({ where: { id, ...scope } })
    if (!session) return apiError('Session introuvable', 404)

    const body   = await req.json()
    const parsed = GenerateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    const { count, distribution, lot_strategy, replace_drafts } = parsed.data

    // Récupérer les lots disponibles (pending) de la session
    const lots = await db.Lot.findAll({
      where:   { session_id: id, status: 'pending' },
      order:   [['value', 'DESC'], ['order', 'ASC']],
      raw:     true,
    }) as unknown as Array<{ id: string; name: string; value: string | null; order: number }>

    // Séquence des types
    const typeSequence = buildTypeSequence(count, distribution)

    // Répartition des lots selon la stratégie
    // On veut assigner les lots aux tirages en tenant compte du type :
    // value_desc : lots les plus chers → carton_plein, puis double_quine, puis quine
    // even       : lots répartis dans l'ordre de création des tirages

    // Index des tirages par type (dans l'ordre de la séquence)
    const tirageIndicesByType: Record<TirageType, number[]> = {
      carton_plein:  typeSequence.map((t, i) => t === 'carton_plein'  ? i : -1).filter(i => i >= 0),
      double_quine:  typeSequence.map((t, i) => t === 'double_quine'  ? i : -1).filter(i => i >= 0),
      quine:         typeSequence.map((t, i) => t === 'quine'          ? i : -1).filter(i => i >= 0),
    }

    // Lots à assigner par index de tirage
    const lotsByTirageIndex: Map<number, typeof lots> = new Map(
      typeSequence.map((_, i) => [i, []])
    )

    if (lots.length > 0) {
      if (lot_strategy === 'value_desc') {
        // On trie les lots du plus cher au moins cher (déjà fait par order)
        // On les distribue : carton_plein en premier, puis double_quine, puis quine
        const priorityOrder = [
          ...tirageIndicesByType.carton_plein,
          ...tirageIndicesByType.double_quine,
          ...tirageIndicesByType.quine,
        ]
        // Répartir équitablement
        const lotsPerTirage = Math.floor(lots.length / count)
        const extra         = lots.length % count
        let lotIdx = 0
        priorityOrder.forEach((tirageIdx, i) => {
          const nb = lotsPerTirage + (i < extra ? 1 : 0)
          lotsByTirageIndex.set(tirageIdx, lots.slice(lotIdx, lotIdx + nb))
          lotIdx += nb
        })
      } else {
        // even : distribuer dans l'ordre séquentiel
        const lotsPerTirage = Math.floor(lots.length / count)
        const extra         = lots.length % count
        let lotIdx = 0
        typeSequence.forEach((_, i) => {
          const nb = lotsPerTirage + (i < extra ? 1 : 0)
          lotsByTirageIndex.set(i, lots.slice(lotIdx, lotIdx + nb))
          lotIdx += nb
        })
      }
    }

    // Supprimer les drafts existants si demandé
    let startOrder = 0
    if (replace_drafts) {
      await db.Tirage.destroy({ where: { session_id: id, status: 'draft' } })
    } else {
      const last = await db.Tirage.findOne({
        where: { session_id: id },
        order: [['order', 'DESC']],
        raw:   true,
      }) as { order: number } | null
      startOrder = (last?.order ?? -1) + 1
    }

    // Créer les tirages en transaction
    const created = await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
      const results = []
      for (let i = 0; i < typeSequence.length; i++) {
        const type  = typeSequence[i]
        const tirageLots = lotsByTirageIndex.get(i) ?? []

        const tirage = await db.Tirage.create(
          { session_id: id, type, order: startOrder + i, status: 'draft' },
          { transaction: t }
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tid = (tirage.toJSON() as any).id

        if (tirageLots.length > 0) {
          await db.TirageLot.bulkCreate(
            tirageLots.map((l, li) => ({ tirage_id: tid, lot_id: l.id, order: li })),
            { transaction: t }
          )
        }
        results.push({ ...tirage.toJSON(), lots: tirageLots })
      }
      return results
    })

    return NextResponse.json({
      tirages: created,
      summary: {
        total:        count,
        lots_used:    lots.length,
        distribution: {
          quine:        tirageIndicesByType.quine.length,
          double_quine: tirageIndicesByType.double_quine.length,
          carton_plein: tirageIndicesByType.carton_plein.length,
        },
      },
    }, { status: 201 })
  })
)
