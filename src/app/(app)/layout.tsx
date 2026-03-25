import { AppShell } from '@/components/layout/AppShell'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell associationName="Amis du Quartier">
      {children}
    </AppShell>
  )
}
