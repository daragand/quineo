/**
 * Service paiements.
 * Sécurité : les paiements n'ont pas de association_id direct.
 * Le filtrage passe par les sessions de l'association : paiement → carton → session → association.
 */

import { QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'
import type { PaymentMethod, PaiementStatus } from '@/types/session'

export interface PaiementRow {
  id:          string
  ref:         string
  participant: string
  session:     string
  cartons:     number
  amount:      number
  method:      PaymentMethod
  status:      PaiementStatus
  date:        string
}

export async function listPaiements(user: TokenPayload): Promise<PaiementRow[]> {
  const scope = assocScope(user)

  // Récupère les IDs de sessions de l'association
  const sessions = await db.Session.findAll({
    where:      scope,
    attributes: ['id'],
    raw:        true,
  }) as unknown as Array<{ id: string }>

  if (sessions.length === 0) return []

  const sessionIds = sessions.map(s => s.id)

  const rows = await db.sequelize.query<{
    id:            string
    amount:        string
    method:        string
    status:        string
    created_at:    string
    first_name:    string | null
    last_name:     string | null
    cartons_count: string
    session_name:  string | null
  }>(
    `SELECT
       p.id,
       p.amount,
       p.method,
       p.status,
       p.created_at,
       part.first_name,
       part.last_name,
       COUNT(pc.carton_id)  AS cartons_count,
       s.name               AS session_name
     FROM paiements p
     LEFT JOIN participants     part ON part.id = p.participant_id
     LEFT JOIN paiement_cartons pc   ON pc.paiement_id = p.id
     LEFT JOIN cartons          c    ON c.id = pc.carton_id
     LEFT JOIN sessions         s    ON s.id = c.session_id
     WHERE s.id IN (:sessionIds) OR (c.id IS NULL AND p.id IS NOT NULL)
     GROUP BY p.id, part.first_name, part.last_name, s.name
     ORDER BY p.created_at DESC
     LIMIT 100`,
    { type: QueryTypes.SELECT, replacements: { sessionIds } },
  )

  return rows.map(r => ({
    id:          r.id,
    ref:         `PAY-${r.id.slice(-6).toUpperCase()}`,
    participant: [r.first_name, r.last_name].filter(Boolean).join(' ') || 'Anonyme',
    session:     r.session_name ?? '—',
    cartons:     parseInt(r.cartons_count, 10),
    amount:      parseFloat(r.amount),
    method:      r.method as PaymentMethod,
    status:      r.status as PaiementStatus,
    date:        r.created_at,
  }))
}
