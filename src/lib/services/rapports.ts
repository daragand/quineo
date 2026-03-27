/**
 * Service rapports.
 * Sécurité : les statistiques sont filtrées via les sessions de l'association.
 * super_admin voit toutes les sessions sans restriction.
 */

import { QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { assocScope } from './scope'
import type { TokenPayload } from '@/lib/auth'

export interface SessionStat {
  id:           string
  name:         string
  date:         string | null
  cartonsMax:   number
  cartonsSold:  number
  recettes:     number
  participants: number
}

export interface MonthlyPoint {
  month: number
  total: number
}

export interface RapportsData {
  sessions:        SessionStat[]
  monthly:         MonthlyPoint[]
  associationName: string
  availableYears:  string[]
  currentYear:     string
}

const SESSION_STATS_SQL = (assocClause: string) => `
  SELECT
    s.id,
    s.name,
    s.date,
    s.max_cartons,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'sold')              AS cartons_sold,
    COUNT(DISTINCT c.participant_id)                                    AS participants,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0)   AS recettes
  FROM sessions s
  LEFT JOIN cartons c ON c.session_id = s.id
  LEFT JOIN paiement_cartons pc ON pc.carton_id = c.id
  LEFT JOIN paiements p ON p.id = pc.paiement_id
  ${assocClause}
  GROUP BY s.id
  ORDER BY s.date DESC NULLS LAST`

const MONTHLY_SQL = (assocClause: string) => `
  SELECT
    EXTRACT(MONTH FROM s.date) AS month,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total
  FROM sessions s
  LEFT JOIN cartons c ON c.session_id = s.id
  LEFT JOIN paiement_cartons pc ON pc.carton_id = c.id
  LEFT JOIN paiements p ON p.id = pc.paiement_id
  WHERE EXTRACT(YEAR FROM s.date) = :year ${assocClause ? 'AND ' + assocClause.replace('WHERE ', '') : ''}
  GROUP BY month`

export async function getRapportsData(user: TokenPayload, year?: string): Promise<RapportsData> {
  const scope           = assocScope(user)
  const isSuperAdmin    = user.role === 'super_admin'
  const assocWhereClause = isSuperAdmin ? '' : 'WHERE s.association_id = :assocId'
  const replacements     = isSuperAdmin ? {} : { assocId: user.association_id }

  const assoc = user.association_id
    ? await db.Association.findOne({
        where:      { id: user.association_id },
        attributes: ['name'],
        raw:        true,
      }) as { name: string } | null
    : null

  const rawStats = await db.sequelize.query<{
    id: string; name: string; date: string | null; max_cartons: number | null
    cartons_sold: string; participants: string; recettes: string
  }>(
    SESSION_STATS_SQL(assocWhereClause),
    { type: QueryTypes.SELECT, replacements },
  )

  const sessions: SessionStat[] = rawStats.map(r => ({
    id:           r.id,
    name:         r.name,
    date:         r.date,
    cartonsMax:   r.max_cartons ?? 0,
    cartonsSold:  parseInt(r.cartons_sold, 10),
    recettes:     parseFloat(r.recettes),
    participants: parseInt(r.participants, 10),
  }))

  const years = [...new Set(
    sessions.filter(s => s.date).map(s => new Date(s.date!).getFullYear().toString())
  )].sort((a, b) => parseInt(b) - parseInt(a))

  const currentYear = year ?? years[0] ?? String(new Date().getFullYear())

  const monthlyAssocClause = isSuperAdmin ? '' : 'AND s.association_id = :assocId'
  const rawMonthly = await db.sequelize.query<{ month: string; total: string }>(
    `SELECT
       EXTRACT(MONTH FROM s.date) AS month,
       COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total
     FROM sessions s
     LEFT JOIN cartons c ON c.session_id = s.id
     LEFT JOIN paiement_cartons pc ON pc.carton_id = c.id
     LEFT JOIN paiements p ON p.id = pc.paiement_id
     WHERE EXTRACT(YEAR FROM s.date) = :year ${monthlyAssocClause}
     GROUP BY month`,
    { type: QueryTypes.SELECT, replacements: { ...replacements, year: parseInt(currentYear) } },
  )

  return {
    sessions,
    monthly:         rawMonthly.map(r => ({ month: parseInt(r.month, 10), total: parseFloat(r.total) })),
    associationName: assoc?.name ?? 'Association',
    availableYears:  years.length > 0 ? years : [currentYear],
    currentYear,
  }
}
