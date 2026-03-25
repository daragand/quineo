import { cn } from '@/lib/cn'

// ─────────────────────────────────────────
// Variantes
// ─────────────────────────────────────────

type BadgeVariant =
  | 'active'      // session active — vert
  | 'running'     // tirage en cours — vert live
  | 'draft'       // brouillon — gris
  | 'closed'      // clôturée — rouge doux
  | 'cancelled'   // annulée — rouge
  | 'won'         // lot gagné — amber
  | 'pending'     // en attente — bleu
  | 'sold'        // carton vendu — vert
  | 'quine'       // type tirage — amber
  | 'dquine'      // double quine — violet
  | 'carton'      // carton plein — navy

const STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  active:    { bg: '#EAF3DE', color: '#27500A' },
  running:   { bg: '#EAF3DE', color: '#27500A' },
  draft:     { bg: '#f0f2f5', color: '#8a95a3' },
  closed:    { bg: '#f0f2f5', color: '#4a5568' },
  cancelled: { bg: '#FCEBEB', color: '#501313' },
  won:       { bg: '#FFF8EE', color: '#633806' },
  pending:   { bg: '#EEF4FC', color: '#0C447C' },
  sold:      { bg: '#EAF3DE', color: '#27500A' },
  quine:     { bg: '#FFF8EE', color: '#633806' },
  dquine:    { bg: '#EEEDFE', color: '#26215C' },
  carton:    { bg: '#e8eaf0', color: '#0b1220' },
}

const LABELS: Record<BadgeVariant, string> = {
  active:    'Active',
  running:   'En cours',
  draft:     'Brouillon',
  closed:    'Clôturée',
  cancelled: 'Annulée',
  won:       'Gagné',
  pending:   'En attente',
  sold:      'Vendu',
  quine:     'Quine',
  dquine:    'Double Quine',
  carton:    'Carton Plein',
}

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────

interface BadgeProps {
  variant: BadgeVariant
  /** Surcharge le label par défaut */
  children?: React.ReactNode
  className?: string
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function Badge({ variant, children, className }: BadgeProps) {
  const { bg, color } = STYLES[variant]

  return (
    <span
      className={cn('inline-flex items-center gap-1 font-bold uppercase tracking-[.06em]', className)}
      style={{
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 4,
        background: bg,
        color,
      }}
    >
      {/* Point live pour les statuts "en cours" */}
      {variant === 'running' && (
        <span
          aria-hidden="true"
          className="inline-block rounded-full flex-shrink-0"
          style={{ width: 5, height: 5, background: '#48BB78' }}
        />
      )}
      {children ?? LABELS[variant]}
    </span>
  )
}
