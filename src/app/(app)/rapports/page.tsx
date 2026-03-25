import { QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { RapportsClient } from './Client'

interface RawSessionStat {
  id:           string
  name:         string
  date:         string | null
  max_cartons:  number | null
  cartons_sold: string
  participants: string
  recettes:     string
}

interface RawMonthly {
  month: string
  total: string
}

export default async function RapportsPage() {
  // Statistiques par session
  const sessionStats = await db.sequelize.query<RawSessionStat>(
    `SELECT
       s.id,
       s.name,
       s.date,
       s.max_cartons,
       COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'sold')         AS cartons_sold,
       COUNT(DISTINCT c.participant_id)                               AS participants,
       COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS recettes
     FROM sessions s
     LEFT JOIN cartons c ON c.session_id = s.id
     LEFT JOIN paiement_cartons pc ON pc.carton_id = c.id
     LEFT JOIN paiements p ON p.id = pc.paiement_id
     GROUP BY s.id
     ORDER BY s.date DESC NULLS LAST`,
    { type: QueryTypes.SELECT },
  )

  const sessions = sessionStats.map(r => ({
    id:           r.id,
    name:         r.name,
    date:         r.date,
    cartonsMax:   r.max_cartons ?? 0,
    cartonsSold:  parseInt(r.cartons_sold, 10),
    recettes:     parseFloat(r.recettes),
    participants: parseInt(r.participants, 10),
  }))

  // Années disponibles
  const years = [...new Set(
    sessions
      .filter(s => s.date)
      .map(s => new Date(s.date!).getFullYear().toString())
  )].sort((a, b) => parseInt(b) - parseInt(a))

  const currentYear = years[0] ?? String(new Date().getFullYear())

  // Données mensuelles pour l'année courante
  const monthly = await db.sequelize.query<RawMonthly>(
    `SELECT
       EXTRACT(MONTH FROM s.date) AS month,
       COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total
     FROM sessions s
     LEFT JOIN cartons c ON c.session_id = s.id
     LEFT JOIN paiement_cartons pc ON pc.carton_id = c.id
     LEFT JOIN paiements p ON p.id = pc.paiement_id
     WHERE EXTRACT(YEAR FROM s.date) = :year
     GROUP BY month`,
    { type: QueryTypes.SELECT, replacements: { year: parseInt(currentYear) } },
  )

  const monthlyData = monthly.map(r => ({
    month: parseInt(r.month, 10),
    total: parseFloat(r.total),
  }))

  // Nom de l'association (première en base)
  const association = await db.Association.findOne({
    attributes: ['name'],
    order: [['created_at', 'ASC']],
    raw: true,
  }) as { name: string } | null

  return (
    <RapportsClient
      sessions={sessions}
      monthly={monthlyData}
      associationName={association?.name ?? 'Association'}
      availableYears={years.length > 0 ? years : [currentYear]}
    />
  )
}
