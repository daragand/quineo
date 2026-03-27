/**
 * Service utilisateurs.
 * Sécurité : filtrés par association via assocScope.
 */

import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'
import type { UserRole } from '@/types/session'

export interface UserRow {
  id:        string
  name:      string
  email:     string
  role:      UserRole
  updatedAt: string | null
  active:    boolean
}

export async function listUsers(user: TokenPayload): Promise<UserRow[]> {
  const scope = assocScope(user)

  const raw = await db.User.findAll({
    where:      scope,
    attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'active', 'updated_at'],
    order:      [['created_at', 'ASC']],
    raw:        true,
  }) as unknown as Array<{
    id: string; first_name: string | null; last_name: string | null
    email: string; role: string; active: boolean; updated_at: string
  }>

  return raw.map(u => ({
    id:        u.id,
    name:      [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
    email:     u.email,
    role:      u.role as UserRole,
    updatedAt: u.updated_at ?? null,
    active:    u.active,
  }))
}
