'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import {
  Squares2X2Icon,
  CalendarDaysIcon,
  SquaresPlusIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid'
import { cn } from '@/lib/cn'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  badge?: string | number
}

type NavSection = {
  title: string
  items: NavItem[]
}

// ─────────────────────────────────────────
// Navigation configs par variant
// ─────────────────────────────────────────

const NAV_ADMIN: NavSection[] = [
  {
    title: 'Navigation',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
      { label: 'Sessions',  href: '/sessions',  icon: CalendarDaysIcon },
      { label: 'Lots',      href: '/lots',      icon: SquaresPlusIcon },
      { label: 'Tirages',   href: '/tirages',   icon: TrophyIcon },
      { label: 'Cartons',   href: '/cartons',   icon: ClipboardDocumentListIcon },
    ],
  },
  {
    title: 'Ventes',
    items: [
      { label: 'Caisse',    href: '/caisse',    icon: CreditCardIcon },
      { label: 'Paiements', href: '/paiements', icon: BanknotesIcon },
      { label: 'Rapports',  href: '/rapports',  icon: ChartBarIcon },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { label: 'Paramètres',  href: '/parametres',  icon: Cog6ToothIcon },
      { label: 'Utilisateurs', href: '/utilisateurs', icon: UsersIcon },
    ],
  },
]

const NAV_CAISSE: NavSection[] = [
  {
    title: 'Caisse',
    items: [
      { label: 'Vente cartons',  href: '/caisse',            icon: CreditCardIcon },
      { label: 'Cartons vendus', href: '/caisse/vendus',     icon: ClipboardDocumentListIcon },
      { label: 'Participants',   href: '/caisse/participants', icon: UserIcon },
    ],
  },
  {
    title: 'Session',
    items: [
      { label: 'Tirage en cours', href: '/tirage', icon: ClockIcon },
    ],
  },
]

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

interface SidebarProps {
  variant?: 'admin' | 'caisse'
  associationName?: string
  /** Caisse uniquement */
  caisse?: {
    animateurName: string
    animateurInitiales: string
    cartonsVendus: number
    cartonsRestants: number
  }
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function Sidebar({
  variant = 'admin',
  associationName = 'Mon association',
  caisse,
}: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/me', { method: 'DELETE' })
    router.push('/login')
    router.refresh()
  }
  const nav = variant === 'caisse' ? NAV_CAISSE : NAV_ADMIN

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href)

  return (
    <aside
      className="hidden md:flex w-sidebar flex-shrink-0 flex-col h-full overflow-y-auto"
      style={{ background: 'var(--color-navy)' }}
      aria-label="Navigation principale"
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0 font-display text-[15px]"
          style={{
            width: 25, height: 25,
            borderRadius: 5,
            background: 'var(--color-amber)',
            color: '#412402',
          }}
          aria-hidden="true"
        >
          Q
        </div>
        <div>
          <div
            className="font-display text-white leading-none tracking-[.04em]"
            style={{ fontSize: 17 }}
          >
            Quineo
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginTop: 1 }}>
            {associationName}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-1" aria-label="Menu">
        {nav.map((section) => (
          <div key={section.title}>
            {/* Titre de section */}
            <div
              className="px-2 font-bold uppercase tracking-[.14em]"
              style={{
                fontSize: 9,
                color: 'rgba(255,255,255,.2)',
                paddingTop: 9, paddingBottom: 3,
              }}
              aria-hidden="true"
            >
              {section.title}
            </div>

            {/* Items */}
            {section.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 font-bold transition-colors duration-[150ms]',
                    'mx-[5px] my-px rounded-[5px]',
                    active
                      ? 'text-white'
                      : 'hover:text-white/80'
                  )}
                  style={{
                    fontSize: 11,
                    padding: '6px 9px',
                    color: active ? 'white' : 'rgba(255,255,255,.48)',
                    background: active ? 'var(--color-navy-mid)' : undefined,
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    icon={item.icon}
                    size={14}
                    decorative={true}
                    className={cn(
                      'transition-opacity duration-[150ms]',
                      active ? 'opacity-100' : 'opacity-60'
                    )}
                  />
                  <span>{item.label}</span>

                  {item.badge !== undefined && (
                    <span
                      className="ml-auto font-bold"
                      style={{
                        fontSize: 10,
                        background: 'rgba(239,159,39,.2)',
                        color: 'var(--color-amber)',
                        padding: '1px 7px',
                        borderRadius: 10,
                      }}
                      aria-label={`${item.badge} éléments`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Pied : stats caisse ── */}
      {variant === 'caisse' && caisse && (
        <div className="px-2 pb-2 flex flex-col gap-1">
          <div
            className="rounded-[6px] px-[10px] py-[7px]"
            style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.06)' }}
          >
            <div className="font-display text-white" style={{ fontSize: 20 }}>
              {caisse.cartonsVendus}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>cartons vendus</div>
          </div>
          <div
            className="rounded-[6px] px-[10px] py-[7px]"
            style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.06)' }}
          >
            <div className="font-display text-white" style={{ fontSize: 20 }}>
              {caisse.cartonsRestants}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)' }}>cartons restants</div>
          </div>

          {/* Profil animateur */}
          <div
            className="flex items-center gap-2 rounded-[6px] px-[9px] py-[7px] mt-1 mb-1"
            style={{
              background: 'rgba(239,159,39,.12)',
              border: '1px solid rgba(239,159,39,.2)',
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0 font-bold"
              style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'var(--color-navy-mid)',
                fontSize: 10, color: '#85B7EB',
              }}
              aria-hidden="true"
            >
              {caisse.animateurInitiales}
            </div>
            <div>
              <div className="font-bold text-white" style={{ fontSize: 11 }}>
                {caisse.animateurName}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)' }}>Animateur</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pied : plan (admin) ── */}
      {variant === 'admin' && (
        <div className="mx-2 mb-2 flex flex-col gap-2">
          <div
            className="rounded-[6px] px-[9px] py-[7px]"
            style={{
              background: 'rgba(239,159,39,.12)',
              border: '1px solid rgba(239,159,39,.2)',
            }}
          >
            <div
              className="font-bold uppercase tracking-[.12em]"
              style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', marginBottom: 2 }}
            >
              Plan actuel
            </div>
            <div className="font-bold" style={{ fontSize: 13, color: 'var(--color-amber)' }}>
              Pro
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>
              Renouv. 15 avr. 2026
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full rounded-[5px] font-bold transition-colors duration-[150ms] hover:bg-white/5"
            style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', padding: '6px 9px', marginBottom: 4 }}
          >
            <ArrowRightStartOnRectangleIcon width={14} height={14} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      )}
    </aside>
  )
}
