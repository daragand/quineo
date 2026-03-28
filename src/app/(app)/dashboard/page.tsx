import Link from 'next/link'
import { getServerUser } from '@/lib/auth-server'
import { getDashboardData } from '@/lib/services/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SessionTable } from '@/components/dashboard/SessionTable'
import { LotsPanel } from '@/components/dashboard/LotsPanel'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default async function DashboardPage() {
  const user = await getServerUser()
  const data = user ? await getDashboardData(user) : null

  const sessions     = data?.sessions     ?? []
  const lots         = data?.lots         ?? []
  const providers    = data?.providers    ?? []
  const activity     = data?.activity     ?? []
  const activeTirage = data?.activeTirage ?? null
  const revenue      = data?.revenue      ?? 0
  const cartonsSold  = data?.cartonsSold  ?? 0
  const cartonsMax   = data?.cartonsMax   ?? 0
  const cartonsProgress = cartonsMax > 0 ? Math.round((cartonsSold / cartonsMax) * 100) : 0
  const lotsWon      = lots.filter(l => l.status === 'drawn').length
  const lotsTotal    = lots.length

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
                <span className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                  {activeTirage.lot.name}
                </span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginTop: 4 }}>
                {activeTirage.drawEventsCount} numéros tirés / 90
              </div>
              <Link href="/tirage"
                className="inline-block font-bold mt-[8px] transition-opacity hover:opacity-70"
                style={{ fontSize: 11, color: 'var(--color-qblue)' }}>
                Reprendre →
              </Link>
            </>
          ) : (
            <div className="mt-[6px]">
              <div style={{ fontSize: 12, color: 'var(--color-text-hint)', marginBottom: 8 }}>
                Aucun tirage actif
              </div>
              <Link href="/tirage"
                className="inline-block font-bold rounded-[7px] px-[14px] py-[6px] transition-opacity hover:opacity-90"
                style={{ fontSize: 12, background: 'var(--color-amber)', color: '#2C1500' }}>
                Lancer le jeu →
              </Link>
            </div>
          )}
        </MetricCard>

      </div>

      {/* ── Deux colonnes ── */}
      <div className="grid gap-[12px]" style={{ gridTemplateColumns: '1.5fr 1fr' }}>

        <Card
          title="Sessions récentes"
          headerRight={
            <Link href="/sessions" className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
              style={{ fontSize: 11, color: 'var(--color-qblue)' }}>
              Voir tout →
            </Link>
          }
        >
          {sessions.length > 0
            ? <SessionTable rows={sessions} />
            : <p style={{ fontSize: 11, color: 'var(--color-text-hint)', padding: '8px 0' }}>Aucune session.</p>
          }
        </Card>

        <div className="flex flex-col gap-[12px]">
          <Card
            title="Lots — session active"
            headerRight={
              <Link href="/lots" className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
                style={{ fontSize: 11, color: 'var(--color-qblue)' }}>
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
          <Link href="/parametres/providers" className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
            style={{ fontSize: 11, color: 'var(--color-qblue)' }}>
            Configurer →
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-[10px]">
          {providers.length === 0 ? (
            <p style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Aucun provider configuré.</p>
          ) : providers.map((p) => (
            <div key={p.name} className="flex items-center gap-[6px] rounded-[6px] px-[13px] py-[7px]"
              style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-border)' }}>
              <span aria-hidden="true" className="rounded-full flex-shrink-0"
                style={{ width: 7, height: 7, background: p.active ? '#48BB78' : '#CBD5E0', display: 'block' }} />
              <span className="font-bold"
                style={{ fontSize: 11, color: p.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {p.name}
              </span>
              <span style={{ fontSize: 10, color: p.active ? 'var(--color-text-secondary)' : 'var(--color-text-hint)' }}>
                {p.sub}
              </span>
            </div>
          ))}
          <Button variant="secondary" size="sm">+ Ajouter un provider</Button>
        </div>
      </Card>

    </div>
  )
}
