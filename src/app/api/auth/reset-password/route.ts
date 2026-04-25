import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'
import { hashPassword, verifyResetToken, apiError } from '@/lib/auth'
import { rateLimit, getClientIp, tooManyRequests, LIMITS } from '@/lib/rate-limit'

const Schema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export async function POST(req: NextRequest) {
  const ip    = getClientIp(req)
  const limit = await rateLimit(`reset-pwd:${ip}`, LIMITS.auth)
  if (!limit.success) return tooManyRequests(limit)

  try {
    const body   = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Données invalides')
    }

    const { token, password } = parsed.data

    // Décoder sans vérifier pour obtenir l'userId
    const decoded = jwt.decode(token) as { sub?: string; type?: string } | null
    if (!decoded?.sub || decoded.type !== 'reset') {
      return apiError('Lien invalide ou expiré', 400)
    }

    const user = await db.User.findOne({ where: { id: decoded.sub, active: true } })
    if (!user) return apiError('Lien invalide ou expiré', 400)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user.toJSON() as any

    // Vérifier la signature avec le hash actuel (usage unique)
    try {
      verifyResetToken(token, u.password_hash)
    } catch {
      return apiError('Lien invalide ou expiré', 400)
    }

    const newHash = await hashPassword(password)
    await db.User.update(
      { password_hash: newHash },
      { where: { id: u.id } }
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/reset-password]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
