import { QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { PaiementsClient } from './Client'
import type { PayMethod, PaiementStatus } from '@/types/session'

interface RawPaiement {
  id:            string
  amount:        string
  method:        string
  status:        string
  created_at:    string
  first_name:    string | null
  last_name:     string | null
  cartons_count: string
  session_name:  string | null
}

export default async function PaiementsPage() {
  const rows = await db.sequelize.query<RawPaiement>(
    `SELECT
       p.id,
       p.amount,
       p.method,
       p.status,
       p.created_at,
       part.first_name,
       part.last_name,
       COUNT(pc.id)  AS cartons_count,
       s.name        AS session_name
     FROM paiements p
     LEFT JOIN participants  part ON part.id = p.participant_id
     LEFT JOIN paiement_cartons pc ON pc.paiement_id = p.id
     LEFT JOIN cartons c ON c.id = pc.carton_id
     LEFT JOIN sessions s ON s.id = c.session_id
     GROUP BY p.id, part.first_name, part.last_name, s.name
     ORDER BY p.created_at DESC
     LIMIT 100`,
    { type: QueryTypes.SELECT },
  )

  const paiements = rows.map((r) => ({
    id:          r.id,
    ref:         `PAY-${r.id.slice(-6).toUpperCase()}`,
    participant: [r.first_name, r.last_name].filter(Boolean).join(' ') || 'Anonyme',
    session:     r.session_name ?? '—',
    cartons:     parseInt(r.cartons_count, 10),
    amount:      parseFloat(r.amount),
    method:      r.method as PayMethod,
    status:      r.status as PaiementStatus,
    date:        r.created_at,
  }))

  return <PaiementsClient initialPaiements={paiements} />
}
