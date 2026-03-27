import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, signAccessToken, signRefreshToken, apiError } from '@/lib/auth'

const RegisterSchema = z.object({
  // Association
  assoc_name: z.string().min(2).max(120),
  // Admin
  first_name: z.string().min(1).max(60),
  last_name:  z.string().min(1).max(60),
  email:      z.string().email(),
  password:   z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Données invalides'
      return apiError(msg, 422)
    }

    const { assoc_name, first_name, last_name, email, password } = parsed.data

    // Vérifier unicité email
    const existing = await db.User.findOne({ where: { email } })
    if (existing) return apiError('Cette adresse e-mail est déjà utilisée', 409)

    const password_hash = await hashPassword(password)

    // Créer association + admin dans une transaction
    const result = await db.sequelize.transaction(async (t) => {
      const assoc = await db.Association.create(
        { name: assoc_name, active: true },
        { transaction: t }
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const av = (assoc as any).toJSON()

      const user = await db.User.create(
        {
          association_id: av.id,
          email,
          password_hash,
          first_name,
          last_name,
          role:   'admin',
          active: true,
        },
        { transaction: t }
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uv = (user as any).toJSON()

      return { assocId: av.id, userId: uv.id }
    })

    const payload = {
      sub:            result.userId,
      association_id: result.assocId,
      role:           'admin' as const,
      email,
    }

    const token        = signAccessToken(payload)
    const refreshToken = signRefreshToken({ sub: result.userId })

    const res = NextResponse.json({ ok: true }, { status: 201 })

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
    console.error('[auth/register]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
