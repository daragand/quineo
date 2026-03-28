import { Footer } from '@/components/layout/Footer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="flex-1 flex items-center justify-center" style={{ padding: '24px 16px' }}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
