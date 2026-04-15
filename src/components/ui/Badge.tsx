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
  active:    { bg: '#D8F6F1', color: '#0A4D3B' },
  running:   { bg: '#D8F6F1', color: '#0A4D3B' },
  draft:     { bg: '#f0f2f5', color: '#9AB5C8' },
  closed:    { bg: '#f0f2f5', color: '#4A6880' },
  cancelled: { bg: '#FCEBEB', color: '#501313' },
  won:       { bg: '#FFF7D6', color: '#7A5000' },
  pending:   { bg: '#E5F3FA', color: '#2F72A0' },
  sold:      { bg: '#D8F6F1', color: '#0A4D3B' },
  quine:     { bg: '#E5F3FA', color: '#2F72A0' },
  dquine:    { bg: '#EEEDFE', color: '#26215C' },
  carton:    { bg: '#E5F3FA', color: '#0D1E2C' },
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
