import { Sidebar } from '@/components/layout/Sidebar'

interface AppShellProps {
  children: React.ReactNode
  associationName?: string
  sidebarVariant?: 'admin' | 'caisse'
  caisseProps?: React.ComponentProps<typeof Sidebar>['caisse']
}

/**
 * Layout principal de l'application.
 * Sidebar fixe à gauche + zone main scrollable à droite.
 * Jamais de position:fixed — tout en flow normal (flex h-screen).
 */
export function AppShell({
  children,
  associationName,
  sidebarVariant = 'admin',
  caisseProps,
}: AppShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        variant={sidebarVariant}
        associationName={associationName}
        caisse={caisseProps}
      />

      {/* Zone principale : colonne flex (topbar fixe + contenu scrollable) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}
