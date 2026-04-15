/** Layout minimal pour la vue participant — plein écran, sans AppShell ni footer. */
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1E2C', fontFamily: 'var(--font-body)' }}>
      {children}
    </div>
  )
}
