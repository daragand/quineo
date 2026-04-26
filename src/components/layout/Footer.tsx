import Link from 'next/link'

const LINKS = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/confidentialite',  label: 'Confidentialité' },
  { href: '/cgu',              label: 'CGU' },
  { href: '/contact',          label: 'Contact' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop:  '.5px solid var(--color-border, rgba(0,0,0,.1))',
        padding:    '16px 24px',
        background: 'var(--color-bg, #f4f5f9)',
      }}
    >
      <div
        className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3"
        style={{ fontSize: 11 }}
      >
        {/* Copyright */}
        <span style={{ color: 'var(--color-text-muted, #8a95a3)' }}>
          © {year} Quinova — plateforme de gestion de loto associatif
        </span>

        {/* Liens */}
        <nav aria-label="Liens légaux" className="flex items-center gap-4 flex-wrap">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{ color: 'var(--color-text-muted, #8a95a3)', textDecoration: 'none' }}
              className="hover:underline transition-opacity hover:opacity-80"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
