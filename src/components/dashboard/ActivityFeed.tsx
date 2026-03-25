// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type ActivityVariant = 'success' | 'info' | 'warning'

interface ActivityItem {
  id: string
  variant: ActivityVariant
  /** HTML minimal autorisé: <strong> uniquement */
  text: string
  /** Ex: "il y a 3 min" */
  time: string
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

// ─────────────────────────────────────────
// Icônes et styles par variant
// ─────────────────────────────────────────

const VARIANT_STYLES: Record<ActivityVariant, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'var(--color-qgreen-bg)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8l4 4 6-6" stroke="var(--color-qgreen)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  info: {
    bg: 'var(--color-qblue-bg)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="var(--color-qblue)" strokeWidth="1.5" />
        <path d="M8 5v3l2 2" stroke="var(--color-qblue)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    bg: 'var(--color-orange-bg)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.4" />
        <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" stroke="var(--color-amber)" strokeWidth="1.3" />
      </svg>
    ),
  },
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p style={{ fontSize: 11, color: 'var(--color-text-hint)', padding: '8px 0' }}>
        Aucune activité récente.
      </p>
    )
  }

  return (
    <ul className="list-none m-0 p-0">
      {items.map((item, i) => {
        const s = VARIANT_STYLES[item.variant]
        return (
          <li
            key={item.id}
            className="flex items-start gap-[9px] py-[7px]"
            style={{ borderTop: i === 0 ? 'none' : '.5px solid var(--color-sep)' }}
          >
            {/* Icône circulaire */}
            <div
              aria-hidden="true"
              className="flex-shrink-0 rounded-full flex items-center justify-center mt-[1px]"
              style={{ width: 27, height: 27, background: s.bg }}
            >
              {s.icon}
            </div>

            {/* Texte */}
            <p
              className="flex-1 min-w-0 leading-[1.5]"
              style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: item.text }}
            />

            {/* Heure */}
            <span
              className="flex-shrink-0 whitespace-nowrap"
              style={{ fontSize: 10, color: 'var(--color-text-hint)' }}
            >
              {item.time}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
