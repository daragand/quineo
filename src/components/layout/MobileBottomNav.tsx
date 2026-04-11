'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import {
  TrophyIcon,
  ClipboardDocumentListIcon,
  SquaresPlusIcon,
  CreditCardIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid'

// ─────────────────────────────────────────
// Les 5 outils principaux de la barre mobile
// ─────────────────────────────────────────

const NAV_MOBILE = [
  { label: 'Tirage',     href: '/tirages',    icon: TrophyIcon },
  { label: 'Cartons',    href: '/cartons',    icon: ClipboardDocumentListIcon },
  { label: 'Lots',       href: '/lots',       icon: SquaresPlusIcon },
  { label: 'Caisse',     href: '/caisse',     icon: CreditCardIcon },
  { label: 'Paramètres', href: '/parametres', icon: Cog6ToothIcon },
] as const

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden flex-shrink-0 flex items-start"
      style={{
        background: 'var(--color-navy)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '10px 0 18px',
      }}
      aria-label="Navigation principale"
    >
      {NAV_MOBILE.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center"
            style={{
              flex: 1,
              gap: 3,
              padding: '2px 0',
              color: active ? 'var(--color-amber)' : 'rgba(255,255,255,0.3)',
              position: 'relative',
              textDecoration: 'none',
            }}
            aria-current={active ? 'page' : undefined}
          >
            {/* Indicateur top */}
            {active && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -10,
                  width: 16,
                  height: 2,
                  background: 'var(--color-amber)',
                  borderRadius: 1,
                }}
              />
            )}

            <Icon icon={item.icon} size={21} decorative />

            <span
              style={{
                fontSize: 9,
                fontWeight: active ? 700 : 400,
                fontFamily: 'var(--font-body)',
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
