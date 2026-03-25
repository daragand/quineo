import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SessionTable } from '@/components/dashboard/SessionTable'
import { LotsPanel } from '@/components/dashboard/LotsPanel'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

// ─────────────────────────────────────────
// Données statiques de démonstration
// ─────────────────────────────────────────

const SESSIONS = [
  { id: '1', name: 'Grand Loto Printemps 2025', date: '2025-03-22', cartonsSold: 347, cartonsMax: 500, status: 'running' as const },
  { id: '2', name: 'Loto Noël 2024',            date: '2024-12-14', cartonsSold: 482, cartonsMax: 500, status: 'closed'  as const },
  { id: '3', name: 'Loto Automne 2024',          date: '2024-10-05', cartonsSold: 310, cartonsMax: 500, status: 'closed'  as const },
  { id: '4', name: 'Loto Été 2025',              date: '2025-07-12', cartonsSold: 0,   cartonsMax: 500, status: 'draft'   as const },
]

const LOTS = [
  { id: 'l1', name: 'TV 55" 4K OLED',    value: 800, tirageType: 'carton_plein' as const, status: 'drawn'   as const },
  { id: 'l2', name: 'Séjour Spa 2 pers.', value: 350, tirageType: 'double_quine' as const, status: 'drawn'   as const },
  { id: 'l3', name: 'Robot Cuiseur Pro',  value: 400, tirageType: 'quine'        as const, status: 'pending' as const },
]

const ACTIVITY = [
  {
    id: 'a1',
    variant: 'success' as const,
    text: '<strong style="color:var(--color-text-primary);font-weight:700;">Sophie M.</strong> — quine confirmé, lot n°2 attribué',
    time: 'il y a 3 min',
  },
  {
    id: 'a2',
    variant: 'info' as const,
    text: 'Tirage lot n°3 démarré — <strong style="color:var(--color-text-primary);font-weight:700;">23 numéros</strong> tirés',
    time: 'il y a 8 min',
  },
  {
    id: 'a3',
    variant: 'warning' as const,
    text: '<strong style="color:var(--color-text-primary);font-weight:700;">12 cartons</strong> vendus en ligne (lot de 4)',
    time: 'il y a 22 min',
  },
]

const PROVIDERS = [
  { name: 'SumUp',     sub: 'En ligne + Terminal', active: true },
  { name: 'Espèces',   sub: 'Sur place',           active: true },
  { name: 'HelloAsso', sub: 'Non configuré',       active: false },
  { name: 'Stripe',    sub: 'Non configuré',       active: false },
]

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-[14px]">

      {/* ── Métriques ── */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>

        <MetricCard
          label="Cartons vendus"
          value="347"
          progress={69}
          sub="69 % sur 500 max — plan Pro"
        />

        <MetricCard
          label="Recettes session"
          value="1 041 €"
          badge={{ text: '+14 % vs dernière session', variant: 'green' }}
        />

        <MetricCard
          label="Lots attribués"
          value="2 / 8"
          sub="6 lots restants"
        />

        <MetricCard label="Tirage en cours" value="">
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
              Lot n°3 actif
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-text-hint)', marginTop: 4 }}>
            23 numéros tirés / 90
          </div>
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
          <SessionTable rows={SESSIONS} />
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
            <LotsPanel lots={LOTS} />
          </Card>

          <Card title="Activité récente">
            <ActivityFeed items={ACTIVITY} />
          </Card>

        </div>
      </div>

      {/* ── Providers ── */}
      <Card
        title="Providers de paiement actifs"
        headerRight={
          <Link
            href="/settings/providers"
            className="font-bold hover:opacity-70 transition-opacity duration-[100ms]"
            style={{ fontSize: 11, color: 'var(--color-qblue)' }}
          >
            Configurer →
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-[10px]">
          {PROVIDERS.map((p) => (
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
