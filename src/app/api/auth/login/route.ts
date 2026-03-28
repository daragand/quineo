import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { comparePassword, signAccessToken, signRefreshToken, apiError } from '@/lib/auth'
import { rateLimit, getClientIp, tooManyRequests, LIMITS } from '@/lib/rate-limit'

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const ip    = getClientIp(req)
  const limit = rateLimit(`login:${ip}`, LIMITS.auth)
  if (!limit.success) return tooManyRequests(limit)

  try {
    const body   = await req.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) return apiError('Email ou mot de passe invalide')

    const { email, password } = parsed.data

    const user = await db.User.findOne({ where: { email, active: true } })
    if (!user) return apiError('Identifiants incorrects', 401)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = user.toJSON() as any
    const valid = await comparePassword(password, u.password_hash)
    if (!valid) return apiError('Identifiants incorrects', 401)

    const payload = {
      sub:            u.id,
      association_id: u.association_id,
      role:           u.role,
      email:          u.email,
    }

    const token        = signAccessToken(payload)
    const refreshToken = signRefreshToken({ sub: u.id })

    const res = NextResponse.json({
      token,
      user: {
        id:         u.id,
        email:      u.email,
        first_name: u.first_name,
        last_name:  u.last_name,
        role:       u.role,
      },
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   8 * 3600,
      path:     '/',
    })
    res.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   30 * 24 * 3600,
      path:     '/api/auth',
    })

    return res
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
