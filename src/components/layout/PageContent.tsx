import { cn } from '@/lib/cn'

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * Zone de contenu principal scrollable.
 * Prend tout l'espace vertical restant après la Topbar.
 */
export function PageContent({ children, className }: PageContentProps) {
  return (
    <main
      className={cn('flex-1 overflow-y-auto min-h-0', className)}
      style={{ background: 'var(--color-bg)' }}
    >
      {children}
    </main>
  )
}
