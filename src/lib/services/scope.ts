/**
 * scope.ts — Dérive la clause WHERE association à partir du TokenPayload.
 *
 * Règle de sécurité :
 *  - null / undefined  → throw (jamais de fuite silencieuse vers "tout voir")
 *  - super_admin       → {} (aucun filtre, accès total)
 *  - tout autre rôle   → { association_id: user.association_id }
 *
 * Utilisation :
 *   const where = assocScope(user)          // dans un service
 *   const where = await assocScopeServer()  // dans un Server Component
 */

import type { TokenPayload } from '@/lib/auth'

export class UnauthenticatedError extends Error {
  constructor() { super('Non authentifié') }
}

/**
 * Retourne la clause WHERE à appliquer sur toute requête multi-tenant.
 * Lance UnauthenticatedError si l'utilisateur est absent.
 */
export function assocScope(user: TokenPayload | null): { association_id?: string } {
  if (!user) throw new UnauthenticatedError()
  if (user.role === 'super_admin') return {}
  return { association_id: user.association_id }
}
