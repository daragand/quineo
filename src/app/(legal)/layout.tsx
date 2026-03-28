import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}
    >
      {/* Header minimal */}
      <header
        className="flex items-center justify-between"
        style={{
          padding:    '14px 24px',
          background: 'var(--color-navy)',
          borderBottom: 'none',
        }}
      >
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              justifyContent: 'center',
              width:        26, height: 26,
              background:   'var(--color-amber)',
              borderRadius: 6,
              fontWeight:   900,
              fontSize:     14,
              color:        'var(--color-amber-dark)',
            }}
          >
            Q
          </span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-.01em' }}>
            quineo
          </span>
        </Link>

        <Link
          href="/"
          style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, textDecoration: 'none' }}
          className="hover:opacity-80"
        >
          ← Retour
        </Link>
      </header>

      {/* Contenu */}
      <main className="flex-1" style={{ padding: '40px 24px' }}>
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
