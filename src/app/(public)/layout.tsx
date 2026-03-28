/**
 * Layout public — pas d'AppShell, pas de sidebar.
 * Utilisé pour /s/[slug] (achat de cartons).
 */
import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  )
}
