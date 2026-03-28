import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, comparePassword, hashPassword, apiError } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit, getClientIp, tooManyRequests } from '@/lib/rate-limit'

const Schema = z.object({
  current_password: z.string().min(1),
  new_password:     z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirm_password: z.string().min(1),
})

// ─────────────────────────────────────────
// POST /api/auth/change-password
// ─────────────────────────────────────────

export const POST = withAuth(async (req: NextRequest, { user }) => {
  // Rate limit : 5 tentatives / 15 min par IP
  const ip    = getClientIp(req)
  const limit = rateLimit(`change-pwd:${ip}`, { limit: 5, window: 900 })
  if (!limit.success) return tooManyRequests(limit)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError('Corps de requête invalide')
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Données invalides', 422)
  }

  const { current_password, new_password, confirm_password } = parsed.data

  if (new_password !== confirm_password) {
    return apiError('Les mots de passe ne correspondent pas', 422)
  }

  // Récupérer le hash actuel
  const dbUser = await db.User.findOne({
    where:      { id: user.sub, active: true },
    attributes: ['id', 'password_hash'],
  })
  if (!dbUser) return apiError('Utilisateur introuvable', 404)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { password_hash } = dbUser.toJSON() as any

  // Vérifier le mot de passe actuel
  const valid = await comparePassword(current_password, password_hash)
  if (!valid) return apiError('Mot de passe actuel incorrect', 401)

  // Vérifier que le nouveau mot de passe est différent
  const isSame = await comparePassword(new_password, password_hash)
  if (isSame) return apiError('Le nouveau mot de passe doit être différent de l\'actuel', 422)

  // Mettre à jour
  const newHash = await hashPassword(new_password)
  await dbUser.update({ password_hash: newHash })

  return NextResponse.json({ ok: true })
})
