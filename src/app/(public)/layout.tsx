/**
 * Layout public — pas d'AppShell, pas de sidebar.
 * Utilisé pour /s/[slug] (achat de cartons).
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg">
      {children}
    </div>
  )
}
