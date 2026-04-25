import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, tooManyRequests, LIMITS } from '@/lib/rate-limit'

// ─────────────────────────────────────────
// GET /api/public/display/find/[code]
// Résout un code à 4 chiffres → sessionId.
// Sans authentification.
// ─────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const ip    = getClientIp(req)
  const limit = await rateLimit(`display-find:${ip}`, LIMITS.publicLight)
  if (!limit.success) return tooManyRequests(limit)

  const { code } = await params

  if (!/^\d{4}$/.test(code)) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 400 })
  }

  const session = await db.Session.findOne({
    where:      { display_code: code },
    attributes: ['id', 'name', 'status'],
    raw:        true,
  }) as { id: string; name: string; status: string } | null

  if (!session) {
    return NextResponse.json({ error: 'Code introuvable' }, { status: 404 })
  }

  return NextResponse.json({
    sessionId:   session.id,
    sessionName: session.name,
    status:      session.status,
  })
}
