import Link from 'next/link'
import { QueryTypes } from 'sequelize'
import { db } from '@/lib/db'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SessionTable } from '@/components/dashboard/SessionTable'
import { LotsPanel } from '@/components/dashboard/LotsPanel'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import type { SessionStatus, TirageType } from '@/types/session'

// ─────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────

interface RawSession {
  id: string
  name: string
  date: string | null
  status: string
  max_cartons: number | null
  association_id: string
}

interface RawLot {
  id: string
  name: string
  value: string | null
  status: string
}

interface RawProvider {
  name: string
  type: string
  active: boolean
}

interface RawAuditLog {
  id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}

interface RawTirage {
  id: string
  lot?: { name: string; order: number } | null
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function relativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1)  return 'à l\'instant'
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

function auditToActivity(log: RawAuditLog) {
  const action = log.action
  let variant: 'success' | 'info' | 'warning' = 'info'
  let text = action

  if (action.includes('SOLD') || action.includes('TIRAGE_COMPLETED') || action.includes('WIN')) {
    variant = 'success'
  } else if (action.includes('WARN') || action.includes('QUOTA')) {
    variant = 'warning'
  }

  // Enrichissement si details disponibles
  const d = log.details
  if (d && typeof d === 'object') {
    if (d.participant_name) {
      text = `<strong style="color:var(--color-text-primary);font-weight:700;">${d.participant_name}</strong> — ${action.toLowerCase().replace(/_/g, ' ')}`
    } else {
      text = action.replace(/_/g, ' ').toLowerCase()
    }
  } else {
    text = action.replace(/_/g, ' ').toLowerCase()
  }

  return { id: log.id, variant, text, time: relativeTime(log.created_at) }
}

// ─────────────────────────────────────────
// Page (Server Component)
// ─────────────────────────────────────────

export default async function DashboardPage() {

  // 1. Sessions récentes
  const rawSessions = await db.Session.findAll({
    attributes: ['id', 'name', 'date', 'status', 'max_cartons', 'association_id'],
    order: [['date', 'DESC']],
    limit: 4,
    raw: true,
  }) as unknown as RawSession[]

  // 2. Cartons vendus par session
  const cartonCounts = await db.sequelize.query<{ session_id: string; count: string }>(
    `SELECT session_id, COUNT(*) AS count FROM cartons WHERE status = 'sold' GROUP BY session_id`,
    { type: QueryTypes.SELECT },
  )
  const cartonMap = new Map(cartonCounts.map(r => [r.session_id, parseInt(r.count, 10)]))

  // 3. Session de référence (running en priorité, sinon la plus récente)
  const refSession = rawSessions.find(s => s.status === 'running') ?? rawSessions[0] ?? null

  // 4. Lots de la session de référence
  const rawLots = refSession
    ? await db.Lot.findAll({
        where: { session_id: refSession.id },
        attributes: ['id', 'name', 'value', 'status'],
        order: [['order', 'ASC']],
        limit: 5,
        raw: true,
      }) as unknown as RawLot[]
    : []

  // 5. Tirage en cours
  const activeTirage = refSession
    ? await db.Tirage.findOne({
        where: { session_id: refSession.id, status: 'running' },
        include: [{ model: db.Lot, as: 'lot', attributes: ['name', 'order'] }],
      }) as unknown as RawTirage | null
    : null

  const drawEventsCount = activeTirage
    ? await db.DrawEvent.count({ where: { tirage_id: activeTirage.id } })
    : 0

  // 6. Providers de paiement de l'association de référence
  const rawProviders = refSession
    ? await db.PaymentProvider.findAll({
        where: { association_id: refSession.association_id },
        attributes: ['name', 'type', 'active'],
        raw: true,
      }) as unknown as RawProvider[]
    : []

  // 7. Recettes session de référence
  const revenueRows = refSession
    ? await db.sequelize.query<{ total: string }>(
        `SELECT COALESCE(SUM(p.amount), 0) AS total
         FROM paiements p
         JOIN paiement_cartons pc ON pc.paiement_id = p.id
         JOIN cartons c ON c.id = pc.carton_id
         WHERE c.session_id = :sessionId AND p.status = 'completed'`,
        { type: QueryTypes.SELECT, replacements: { sessionId: refSession.id } },
      )
    : [{ total: '0' }]
  const revenue = parseFloat(revenueRows[0]?.total ?? '0')

  // 8. Activité récente (audit logs)
  const rawLogs = await db.AuditLog.findAll({
    order: [['created_at', 'DESC']],
    limit: 5,
    raw: true,
  }) as unknown as RawAuditLog[]

  // ── Calculs métriques ──────────────────
  const cartonsSold = refSession ? (cartonMap.get(refSession.id) ?? 0) : 0
  const cartonsMax  = refSession?.max_cartons ?? 0
  const cartonsProgress = cartonsMax > 0 ? Math.round((cartonsSold / cartonsMax) * 100) : 0
  const lotsWon   = rawLots.filter(l => l.status === 'drawn').length
  const lotsTotal = rawLots.length

  // ── Mise en forme pour les composants ──
  const sessions = rawSessions.map(s => ({
    id: s.id,
    name: s.name,
    date: s.date ?? undefined,
    cartonsSold: cartonMap.get(s.id) ?? 0,
    cartonsMax: s.max_cartons ?? 0,
    status: s.status as SessionStatus,
  }))

  const lots = rawLots.map(l => ({
    id: l.id,
    name: l.name,
    value: l.value != null ? parseFloat(l.value) : undefined,
    tirageType: 'quine' as TirageType, // champ non présent en base — valeur par défaut
    status: l.status as 'pending' | 'drawn' | 'cancelled',
  }))

  const providers = rawProviders.map(p => ({
    name: p.name,
    sub: p.type.charAt(0).toUpperCase() + p.type.slice(1),
    active: p.active,
  }))

  const activity = rawLogs.map(auditToActivity)

  // ─────────────────────────────────────────
  // Rendu
  // ─────────────────────────────────────────

  return (
    <div className="flex flex-col gap-[14px]">

      {/* ── Métriques ── */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>

        <MetricCard
          label="Cartons vendus"
          value={cartonsMax > 0 ? String(cartonsSold) : '—'}
          progress={cartonsMax > 0 ? cartonsProgress : undefined}
          sub={cartonsMax > 0
            ? `${cartonsProgress} % sur ${cartonsMax} max`
            : 'Aucun max défini'}
        />

        <MetricCard
          label="Recettes session"
          value={revenue > 0 ? `${revenue.toLocaleString('fr-FR')} €` : '0 €'}
        />

        <MetricCard
          label="Lots attribués"
          value={lotsTotal > 0 ? `${lotsWon} / ${lotsTotal}` : '—'}
          sub={lotsTotal > 0 ? `${lotsTotal - lotsWon} lots restants` : 'Aucun lot'}
        />

        <MetricCard label="Tirage en cours" value="">
          {activeTirage?.lot ? (
            <>
              <div className="flex items-center gap-[7px] mt-[5px]">
                <span
                  aria-hidden="true"
                  className="rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: '#48BB78', display: 'block' }}
                />
                <span
                  className="font-bold"
                  style={{ fontSize: 12, color: 'var(--color-text-primary)' }}
                >
                  {activeTirage.lot.name}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginTop: 4 }}>
                {drawEventsCount} numéros tirés / 90
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--color-text-hint)', marginTop: 5 }}>
              Aucun tirage actif
            </div>
          )}
        </MetricCard>

      </div>

      {/* ── Deux colonnes ── */}
      <div className="grid gap-[12px]" style={{ gridTemplateColumns: '1.5fr 1fr' }}>

        {/* Sessions */}
        <Card
          title="Sessions récentes"
          headerRight={
            <Link
              href="/sessions"
              className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
              style={{ fontSize: 11, color: 'var(--color-qblue)' }}
            >
              Voir tout →
            </Link>
          }
        >
          {sessions.length > 0
            ? <SessionTable rows={sessions} />
            : <p style={{ fontSize: 11, color: 'var(--color-text-hint)', padding: '8px 0' }}>Aucune session.</p>
          }
        </Card>

        {/* Colonne droite */}
        <div className="flex flex-col gap-[12px]">

          <Card
            title="Lots — session active"
            headerRight={
              <Link
                href="/lots"
                className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
                style={{ fontSize: 11, color: 'var(--color-qblue)' }}
              >
                Gérer →
              </Link>
            }
          >
            <LotsPanel lots={lots} />
          </Card>

          <Card title="Activité récente">
            <ActivityFeed items={activity} />
          </Card>

        </div>
      </div>

      {/* ── Providers ── */}
      <Card
        title="Providers de paiement actifs"
        headerRight={
          <Link
            href="/parametres/providers"
            className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
            style={{ fontSize: 11, color: 'var(--color-qblue)' }}
          >
            Configurer →
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-[10px]">
          {providers.length === 0 ? (
            <p style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Aucun provider configuré.</p>
          ) : providers.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-[6px] rounded-[6px] px-[13px] py-[7px]"
              style={{
                background: 'var(--color-bg)',
                border: '.5px solid var(--color-border)',
              }}
            >
              <span
                aria-hidden="true"
                className="rounded-full flex-shrink-0"
                style={{
                  width: 7, height: 7,
                  background: p.active ? '#48BB78' : '#CBD5E0',
                  display: 'block',
                }}
              />
              <span
                className="font-bold"
                style={{
                  fontSize: 11,
                  color: p.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: p.active ? 'var(--color-text-secondary)' : 'var(--color-text-hint)',
                }}
              >
                {p.sub}
              </span>
            </div>
          ))}

          <Button variant="secondary" size="sm">
            + Ajouter un provider
          </Button>
        </div>
      </Card>

    </div>
  )
}
