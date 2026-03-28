import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, apiError, comparePassword } from '@/lib/auth'
import { db } from '@/lib/db'

// ─────────────────────────────────────────
// POST /api/auth/verify-password
// Vérifie le mot de passe du user connecté sans émettre de nouveau token.
// Utilisé pour débloquer la modification de champs sensibles.
// ─────────────────────────────────────────

const Schema = z.object({
  password: z.string().min(1),
})

export const POST = withAuth(async (req: NextRequest, { user }) => {
  const body   = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return apiError('Mot de passe requis')

  const dbUser = await db.User.findOne({
    where:      { id: user.sub, active: true },
    attributes: ['password_hash'],
  })
  if (!dbUser) return apiError('Utilisateur introuvable', 404)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hash  = (dbUser.toJSON() as any).password_hash as string
  const valid = await comparePassword(parsed.data.password, hash)

  if (!valid) return apiError('Mot de passe incorrect', 401)

  return NextResponse.json({ ok: true })
})
