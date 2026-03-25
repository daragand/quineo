import { db } from '@/lib/db'
import { UtilisateursClient } from './Client'
import type { UserRole } from '@/types/session'

export default async function UtilisateursPage() {
  const rawUsers = await db.User.findAll({
    attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'active', 'updated_at'],
    order: [['created_at', 'ASC']],
    raw: true,
  }) as unknown as Array<{
    id: string; first_name: string | null; last_name: string | null
    email: string; role: string; active: boolean; updated_at: string
  }>

  const users = rawUsers.map(u => ({
    id:        u.id,
    name:      [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
    email:     u.email,
    role:      u.role as UserRole,
    updatedAt: u.updated_at ?? null,
    active:    u.active,
  }))

  return <UtilisateursClient initialUsers={users} />
}
