import { db } from '@/lib/db'
import { BoutiqueClient, type SessionPublicData } from './BoutiqueClient'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

// ─────────────────────────────────────────
// Composants internes
// ─────────────────────────────────────────

function QuinovaLogo() {
  return (
    <div className="flex items-center gap-[8px]">
      <div
        aria-hidden="true"
        className="rounded-[5px] flex items-center justify-center font-display"
        style={{ width: 28, height: 28, background: 'var(--color-amber)', fontSize: 17, color: '#412402' }}
      >
        Q
      </div>
      <span
        className="font-bold uppercase tracking-[.06em]"
        style={{ fontSize: 13, color: 'var(--color-text-primary)' }}
      >
        Quinova
      </span>
    </div>
  )
}

function TopBar({ name, code }: { name?: string; code?: string }) {
  return (
    <div
      className="flex items-center justify-between px-[20px] py-[10px] sticky top-0 z-10"
      style={{ background: 'var(--color-card)', borderBottom: '.5px solid var(--color-sep)' }}
    >
      <QuinovaLogo />
      {name && (
        <div className="flex items-center gap-[8px]">
          {code && (
            <span
              className="font-bold rounded-[4px] px-[8px] py-[2px]"
              style={{ fontSize: 11, color: 'var(--color-text-secondary)', background: 'var(--color-bg)', letterSpacing: '.08em', fontFamily: 'monospace' }}
            >
              {code}
            </span>
          )}
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {name}
          </span>
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
        Paiement sécurisé
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Page (Server Component)
// ─────────────────────────────────────────

export default async function SessionBoutiquePage({ params }: Props) {
  const { slug } = await params

  // Charger la session depuis la DB directement (server component)
  let sessionData: SessionPublicData | null = null
  let errorMessage: string | null = null

  try {
    const session = await db.Session.findOne({
      where: { display_code: slug },
      include: [
        {
          model:      db.Association,
          as:         'association',
          attributes: ['id', 'name', 'require_birth_date'],
          include: [
            {
              model:      db.PaymentProvider,
              as:         'payment_providers',
              where:      { active: true },
              required:   false,
              attributes: ['id', 'type', 'name'],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          ],
        },
        {
          model:      db.CartonPack,
          as:         'carton_packs',
          where:      { is_active: true },
          required:   false,
          attributes: ['id', 'label', 'quantity', 'price', 'max_per_person', 'display_order'],
        },
      ],
    })

    if (!session) {
      errorMessage = 'Session introuvable. Vérifiez le code communiqué par l\'organisateur.'
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = session.toJSON() as any

      if (!['open', 'running'].includes(s.status as string)) {
        errorMessage = 'Les ventes sont fermées pour cette session.'
      } else {
        const availableCount = await db.Carton.count({
          where: { session_id: s.id as string, status: 'available' },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const packs = (s.carton_packs ?? [] as any[])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .sort((a: any, b: any) => (a.display_order ?? 999) - (b.display_order ?? 999))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => ({
            id:        p.id        as string,
            label:     p.label     as string,
            qty:       p.quantity  as number,
            price:     parseFloat(p.price),
            unitPrice: parseFloat(p.price) / (p.quantity as number),
            maxPer:    (p.max_per_person as number | null) ?? null,
          }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const providers = (s.association?.payment_providers ?? [] as any[]).map((pp: any) => ({
          type: pp.type as string,
          name: pp.name as string,
        }))

        sessionData = {
          id:                s.id           as string,
          display_code:      s.display_code as string,
          name:              s.name         as string,
          date:              (s.date        as string | null) ?? null,
          description:       (s.description as string | null) ?? null,
          status:            s.status       as string,
          max_cartons:       (s.max_cartons as number | null) ?? 50,
          available_cartons: availableCount,
          association:        { name: (s.association?.name as string) ?? '' },
          packs,
          providers,
          require_birth_date: (s.association?.require_birth_date as boolean) ?? false,
        }
      }
    }
  } catch (err) {
    console.error('[boutique page]', err)
    errorMessage = 'Erreur serveur, veuillez réessayer.'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <TopBar
        name={sessionData?.name}
        code={sessionData?.display_code}
      />

      <div
        className="mx-auto px-[16px] py-[24px]"
        style={{ maxWidth: 680 }}
      >
        {errorMessage ? (
          /* ── Erreur ── */
          <div className="text-center py-[48px]">
            <div
              aria-hidden="true"
              className="mx-auto rounded-full flex items-center justify-center mb-[16px]"
              style={{ width: 56, height: 56, background: 'var(--color-qred-bg)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="var(--color-qred)" strokeWidth="1.5"/>
                <path d="M12 7v5M12 16v1" stroke="var(--color-qred)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="font-bold mb-[8px]" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>
              Session introuvable
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 340, margin: '0 auto 20px' }}>
              {errorMessage}
            </p>
            <a
              href="/display"
              className="inline-block rounded-[8px] font-bold transition-opacity hover:opacity-80"
              style={{ padding: '9px 20px', background: 'var(--color-amber)', color: '#5C3A00', fontSize: 13, textDecoration: 'none' }}
            >
              Trouver une session →
            </a>
          </div>
        ) : sessionData ? (
          /* ── Boutique ── */
          <>
            {/* En-tête session */}
            <div
              className="rounded-[10px] px-[16px] py-[12px] mb-[20px]"
              style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
            >
              <div className="font-bold" style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
                {sessionData.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {sessionData.association.name}
                {sessionData.date && (
                  <> · {new Date(sessionData.date).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}</>
                )}
                {sessionData.available_cartons > 0 && (
                  <> · <span style={{ color: 'var(--color-qgreen-text)', fontWeight: 600 }}>
                    {sessionData.available_cartons} carton{sessionData.available_cartons > 1 ? 's' : ''} disponible{sessionData.available_cartons > 1 ? 's' : ''}
                  </span></>
                )}
              </div>
            </div>

            <BoutiqueClient session={sessionData} />
          </>
        ) : null}
      </div>
    </div>
  )
}
