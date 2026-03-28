'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense }        from 'react'

function AnnuleContent() {
  const params     = useSearchParams()
  const paiementId = params.get('paiement_id')
  const isError    = params.get('error') === '1'

  return (
    <div className="min-h-screen flex items-center justify-center px-[16px]" style={{ background: 'var(--color-bg)' }}>
      <div
        className="rounded-[14px] px-[28px] py-[28px] max-w-[480px] w-full text-center"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        <div style={{ fontSize: 36, marginBottom: 16 }}>{isError ? '⚠️' : '↩️'}</div>

        <div className="font-bold" style={{ fontSize: 17, color: 'var(--color-text-primary)', marginBottom: 10 }}>
          {isError ? 'Une erreur est survenue' : 'Paiement annulé'}
        </div>

        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
          {isError
            ? 'Votre paiement n\'a pas pu être traité. Aucun montant n\'a été débité. Vous pouvez réessayer.'
            : 'Vous avez annulé le paiement. Vos cartons n\'ont pas été réservés. Vous pouvez reprendre votre commande à tout moment.'}
        </div>

        {paiementId && (
          <div className="mb-[20px]" style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
            Référence : <code style={{ color: 'var(--color-amber)' }}>{paiementId.slice(0, 8).toUpperCase()}</code>
          </div>
        )}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-block rounded-[9px] font-bold cursor-pointer transition-opacity duration-[150ms] hover:opacity-90"
          style={{
            padding:    '10px 28px',
            background: 'var(--color-amber)',
            color:      '#2C1500',
            border:     'none',
            fontFamily: 'var(--font-body)',
            fontSize:   14,
          }}
        >
          ← Retour à la boutique
        </button>
      </div>
    </div>
  )
}

export default function PaiementAnnulePage() {
  return (
    <Suspense>
      <AnnuleContent />
    </Suspense>
  )
}
