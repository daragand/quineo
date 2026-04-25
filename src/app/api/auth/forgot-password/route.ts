import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { signResetToken, apiError } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/mailer'
import { rateLimit, getClientIp, tooManyRequests, LIMITS } from '@/lib/rate-limit'

const Schema = z.object({
  email: z.string().email(),
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quineo.fr'

export async function POST(req: NextRequest) {
  const ip    = getClientIp(req)
  const limit = await rateLimit(`forgot-pwd:${ip}`, LIMITS.auth)
  if (!limit.success) return tooManyRequests(limit)

  try {
    const body   = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return apiError('Adresse e-mail invalide')

    const { email } = parsed.data

    // Réponse identique que l'utilisateur existe ou non (anti-énumération)
    const user = await db.User.findOne({ where: { email, active: true } })
    if (!user) {
      return NextResponse.json({ ok: true })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user.toJSON() as any

    const token    = signResetToken(u.id, u.password_hash)
    const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`

    await sendPasswordResetEmail({
      to:        u.email,
      firstName: u.first_name ?? '',
      resetUrl,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/forgot-password]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
