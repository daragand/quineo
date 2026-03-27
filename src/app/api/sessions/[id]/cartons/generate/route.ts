import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRole, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateBatch } from '@/lib/cartonGen'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

const GenerateSchema = z.object({
  count: z.number().int().min(1).max(5000),
})

// ─────────────────────────────────────────
// POST /api/sessions/[id]/cartons/generate
// ─────────────────────────────────────────

export const POST = withAuth(
  withRole(['admin', 'operator'], async (req: NextRequest, ctx: Ctx) => {
    const { id } = await ctx.params

    const session = await db.Session.findOne({
      where: { id, association_id: ctx.user.association_id },
    })
    if (!session) return apiError('Session introuvable', 404)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = session.toJSON() as any
    if (!['draft', 'open'].includes(s.status)) {
      return apiError('Impossible de générer des cartons pour une session en cours ou terminée')
    }

    const body   = await req.json()
    const parsed = GenerateSchema.safeParse(body)
    if (!parsed.success) return apiError(parsed.error.issues[0].message)

    // Trouver le dernier serial_number pour continuer la séquence
    const last = await db.Carton.findOne({
      where:  { session_id: id },
      order:  [['serial_number', 'DESC']],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lastSerial = last ? parseInt((last.toJSON() as any).serial_number.replace('C', ''), 10) : 0

    const batch = generateBatch(id, parsed.data.count, lastSerial + 1)
    await db.Carton.bulkCreate(batch, { validate: true })

    return NextResponse.json({ generated: parsed.data.count, start_serial: lastSerial + 1 }, { status: 201 })
  })
)
