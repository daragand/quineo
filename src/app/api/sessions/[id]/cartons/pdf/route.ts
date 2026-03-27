import { NextRequest, NextResponse } from 'next/server'
import { Op } from 'sequelize'
import { renderToBuffer } from '@react-pdf/renderer'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { CartonsPdfDocument } from '@/lib/cartonPdf'

type Ctx = { params: Promise<Record<string, string>>; user: import('@/lib/auth').TokenPayload }

// GET /api/sessions/[id]/cartons/pdf?ids=uuid1,uuid2
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
    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length) where.id = { [Op.in]: ids }
  }

  const rows = await db.Carton.findAll({
    where,
    attributes: ['id', 'serial_number', 'grid'],
    order:      [['serial_number', 'ASC']],
    raw:        true,
  }) as unknown as Array<{ id: string; serial_number: string; grid: number[][] }>

  if (rows.length === 0) return apiError('Aucun carton trouvé', 404)

  const cartons = rows.map((r) => ({
    id:     r.id,
    serial: r.serial_number,
    grid:   r.grid,
  }))

  const buffer = await renderToBuffer(
    CartonsPdfDocument({ cartons, sessionName: session.name })
  )

  const filename = `cartons-${session.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length':      String(buffer.byteLength),
    },
  })
})
