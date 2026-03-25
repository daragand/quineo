import { NextRequest, NextResponse } from 'next/server'
import { withAuth, apiError } from '@/lib/auth'
import { db } from '@/lib/db'

export const GET = withAuth(async (_req: NextRequest, { user }) => {
  try {
    const u = await db.User.findByPk(user.sub, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'association_id'],
    })
    if (!u) return apiError('Utilisateur introuvable', 404)
    return NextResponse.json({ user: u })
  } catch (err) {
    console.error('[auth/me]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
})

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('token')
  res.cookies.delete('refresh_token')
  return res
}
