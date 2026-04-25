import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { signAccessToken, apiError } from '@/lib/auth'
import type { TokenPayload } from '@/lib/auth'
import { rateLimit, getClientIp, tooManyRequests, LIMITS } from '@/lib/rate-limit'

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'

// ─────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip    = getClientIp(req)
  const limit = await rateLimit(`refresh:${ip}`, LIMITS.refresh)
  if (!limit.success) return tooManyRequests(limit)

  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!refreshToken) return apiError('Refresh token manquant', 401)

    let payload: { sub: string }
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { sub: string }
    } catch {
      return apiError('Refresh token invalide ou expiré', 401)
    }

    const user = await db.User.findOne({ where: { id: payload.sub, active: true } })
    if (!user) return apiError('Utilisateur introuvable', 401)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user.toJSON() as any

    const tokenPayload: TokenPayload = {
      sub:            u.id,
      association_id: u.association_id,
      role:           u.role,
      email:          u.email,
    }

    const token = signAccessToken(tokenPayload)

    const res = NextResponse.json({ token })
    res.cookies.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   8 * 3600,
      path:     '/',
    })
    return res
  } catch (err) {
    console.error('[auth/refresh]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
