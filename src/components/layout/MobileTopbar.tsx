'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon } from '@heroicons/react/24/solid'

// ─────────────────────────────────────────
// Mapping chemin → titre d'écran
// (vérifié par startsWith, ordre important : plus spécifique en premier)
// ─────────────────────────────────────────

const ROUTE_TITLES: [string, string][] = [
  ['/tirages',     'Tirage'],
  ['/tirage',      'Tirage'],
  ['/cartons',     'Cartons'],
  ['/lots',        'Lots'],
  ['/caisse',      'Caisse'],
  ['/sessions',    'Sessions'],
  ['/paiements',   'Paiements'],
  ['/rapports',    'Rapports'],
  ['/parametres',  'Paramètres'],
  ['/utilisateurs','Paramètres'],
  ['/dashboard',   'QUINEO'],
]

function getTitle(pathname: string): string {
  for (const [prefix, label] of ROUTE_TITLES) {
    if (pathname.startsWith(prefix)) return label
  }
  return 'QUINEO'
}

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

interface MobileTopbarProps {
  userInitiales?: string
  actions?: React.ReactNode
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function MobileTopbar({ userInitiales = 'U', actions }: MobileTopbarProps) {
  const pathname  = usePathname()
  const isDashboard = pathname === '/dashboard'
  const title     = getTitle(pathname)

  return (
    <header
      className="md:hidden flex items-center justify-between flex-shrink-0"
      style={{
        background: '#0a1120',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: 50,
        padding: '0 14px',
      }}
      aria-label="Barre de navigation mobile"
    >
      {/* ── Bouton Accueil ── */}
      <Link
        href="/dashboard"
        aria-label="Accueil"
        aria-current={isDashboard ? 'page' : undefined}
        style={{
          width: 38, height: 38,
          borderRadius: 10,
          background: isDashboard ? 'rgba(239,159,39,0.13)' : 'transparent',
          border: `1px solid ${isDashboard ? 'rgba(239,159,39,0.27)' : 'transparent'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: isDashboard ? 'var(--color-amber)' : 'rgba(255,255,255,0.38)',
        }}
      >
        <HomeIcon width={20} height={20} aria-hidden="true" />
      </Link>

      {/* ── Titre centré ── */}
      <div
        aria-live="polite"
        style={{
          fontSize:     isDashboard ? 16 : 15,
          fontWeight:   700,
          color:        isDashboard ? 'var(--color-amber)' : '#ffffff',
          letterSpacing: isDashboard ? '0.12em' : '0.03em',
          fontFamily:   isDashboard ? 'var(--font-display)' : 'var(--font-body)',
        }}
      >
        {title}
      </div>

      {/* ── Droite : actions + avatar ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        <div
          role="img"
          aria-label={`Utilisateur : ${userInitiales}`}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--color-navy-mid)',
            border: '2px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800,
            color: '#78AED0',
            flexShrink: 0,
          }}
        >
          {userInitiales}
        </div>
      </div>
    </header>
  )
}
