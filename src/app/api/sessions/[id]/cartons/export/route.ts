import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// GET /api/sessions/[id]/cartons/export?ids=uuid1,uuid2
// Retourne un fichier CSV avec toutes les colonnes de la grille
export const GET = withAuth(async (req: NextRequest, ctx: Ctx) => {
  const { id } = await ctx.params

  const session = await db.Session.findOne({
    where:      { id, association_id: ctx.user.association_id },
    attributes: ['id', 'name'],
    raw:        true,
  }) as { id: string; name: string } | null
  if (!session) return apiError('Session introuvable', 404)

  const { searchParams } = new URL(req.url)
  const idsParam = searchParams.get('ids')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { session_id: id }
  if (idsParam) {
    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean)
    if (ids.length) where.id = { [Op.in]: ids }
  }

  const rows = await db.Carton.findAll({
    where,
    include: [{ model: db.Participant, as: 'participant', required: false }],
    order:   [['serial_number', 'ASC']],
  })

  // ── En-tête CSV ──
  const colHeaders = [
    'Réf.',
    'Statut',
    'Participant',
    'L1C1','L1C2','L1C3','L1C4','L1C5','L1C6','L1C7','L1C8','L1C9',
    'L2C1','L2C2','L2C3','L2C4','L2C5','L2C6','L2C7','L2C8','L2C9',
    'L3C1','L3C2','L3C3','L3C4','L3C5','L3C6','L3C7','L3C8','L3C9',
  ]

  const STATUS_FR: Record<string, string> = {
    available: 'Disponible',
    sold:      'Vendu',
    cancelled: 'Annulé',
  }

  const csvRows = rows.map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw  = r.toJSON() as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p    = raw.participant as any
    const name = p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : ''
    const grid: number[][] = raw.grid ?? [[],[],[]]
    const cells = [...(grid[0] ?? []), ...(grid[1] ?? []), ...(grid[2] ?? [])]
    return [raw.serial_number, STATUS_FR[raw.status] ?? raw.status, name, ...cells].join(',')
  })

  const filename = `cartons-${session.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`
  const csv = [colHeaders.join(','), ...csvRows].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
})
