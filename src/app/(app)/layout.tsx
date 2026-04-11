export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Op } from 'sequelize'
import { db } from '@/lib/db'
import { getServerUser } from '@/lib/auth-server'
import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'
import { MobileTopbar } from '@/components/layout/MobileTopbar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user    = await getServerUser()
  const assocId = user?.association_id

  const assoc = assocId
    ? await db.Association.findOne({
        where:      { id: assocId },
        attributes: ['name'],
        raw:        true,
      }) as { name: string } | null
    : null

  // Session active (running ou open) pour le lien de diffusion
  const activeSession = assocId
    ? await db.Session.findOne({
        where:      { association_id: assocId, status: { [Op.in]: ['running', 'open'] } },
        attributes: ['id', 'name', 'status'],
        order:      [['date', 'ASC']],
        raw:        true,
      }) as { id: string; name: string; status: string } | null
    : null

  const initiales = user?.email?.[0]?.toUpperCase() ?? 'U'

  const diffusionAction = activeSession ? (
    <Link
      href={`/display/${activeSession.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-[6px] font-bold rounded-[6px] px-[10px] py-[5px] transition-opacity hover:opacity-80"
      style={{
        fontSize:   11,
        background: activeSession.status === 'running' ? 'rgba(72,187,120,.15)' : 'var(--color-bg)',
        color:      activeSession.status === 'running' ? '#48BB78' : 'var(--color-text-secondary)',
        border:     `.5px solid ${activeSession.status === 'running' ? 'rgba(72,187,120,.4)' : 'var(--color-border)'}`,
      }}
      aria-label={`Ouvrir l'écran de diffusion pour ${activeSession.name}`}
    >
      {activeSession.status === 'running' && (
        <span
          aria-hidden="true"
          style={{
            display:      'inline-block',
            width:        6, height: 6,
            borderRadius: '50%',
            background:   '#48BB78',
            flexShrink:   0,
          }}
        />
      )}
      Diffusion
    </Link>
  ) : undefined

  return (
    <AppShell associationName={assoc?.name ?? 'Mon Association'}>
      {/* ── Topbar mobile (dark navy, home + titre + avatar) ── */}
      <MobileTopbar userInitiales={initiales} actions={diffusionAction} />

      {/* ── Topbar desktop ── */}
      <div className="hidden md:block">
        <Topbar userInitiales={initiales} actions={diffusionAction} />
      </div>

      {/* ── Contenu scrollable ── */}
      <div
        className="flex-1 overflow-y-auto p-[14px] md:p-[22px]"
        style={{ minHeight: 0 }}
      >
        {children}
      </div>

      {/* ── Navigation mobile basse (5 outils) ── */}
      <MobileBottomNav />
    </AppShell>
  )
}
