import Link from 'next/link'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopbarProps {
  /** Titre simple OU breadcrumb, pas les deux */
  title?: string
  breadcrumb?: BreadcrumbItem[]
  /** Zone droite : boutons, meta, avatar */
  actions?: React.ReactNode
  /** Initiales de l'utilisateur connecté */
  userInitiales?: string
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function Topbar({
  title,
  breadcrumb,
  actions,
  userInitiales = 'U',
}: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between flex-shrink-0 px-[22px] h-topbar bg-card"
      style={{ borderBottom: '.5px solid var(--color-sep)' }}
    >
      {/* ── Gauche : titre ou breadcrumb ── */}
      <div className="flex items-center gap-2 min-w-0">
        {breadcrumb ? (
          <nav aria-label="Fil d'Ariane">
            <ol className="flex items-center gap-2">
              {breadcrumb.map((crumb, i) => {
                const isLast = i === breadcrumb.length - 1
                return (
                  <li key={i} className="flex items-center gap-2">
                    {i > 0 && (
                      <span
                        aria-hidden="true"
                        style={{ fontSize: 11, color: 'var(--color-text-hint)' }}
                      >
                        /
                      </span>
                    )}
                    {isLast ? (
                      <span
                        className="font-bold truncate"
                        style={{ fontSize: 14, color: 'var(--color-text-primary)' }}
                        aria-current="page"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href ?? '#'}
                        className="transition-colors duration-[150ms] hover:text-navy"
                        style={{ fontSize: 11, color: 'var(--color-text-muted)' }}
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        ) : (
          <h1
            className="font-bold truncate"
            style={{ fontSize: 15, color: 'var(--color-text-primary)' }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* ── Droite : actions + avatar ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}

        {/* Avatar utilisateur */}
        <div
          className="flex items-center justify-center flex-shrink-0 font-bold"
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--color-navy-mid)',
            fontSize: 11,
            color: '#85B7EB',
          }}
          aria-label={`Utilisateur connecté : ${userInitiales}`}
          role="img"
        >
          {userInitiales}
        </div>
      </div>
    </header>
  )
}
