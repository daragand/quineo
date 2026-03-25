'use client'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface PartnerSlot {
  id: string
  /** URL de l'image si déjà uploadée */
  imageUrl?: string
  name?: string
}

interface PartnerSlotsProps {
  slots: PartnerSlot[]
  maxSlots?: number
  onAdd: (index: number) => void
  onRemove: (index: number) => void
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

export function PartnerSlots({
  slots,
  maxSlots = 6,
  onAdd,
  onRemove,
}: PartnerSlotsProps) {
  const filledCount = slots.filter((s) => s.imageUrl).length
  const totalSlots = Math.max(filledCount + 1, Math.min(maxSlots, slots.length + 1))

  return (
    <div
      className="grid gap-[8px]"
      style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      aria-label="Logos partenaires"
    >
      {Array.from({ length: totalSlots }).map((_, i) => {
        const slot = slots[i]
        const isFilled = !!slot?.imageUrl

        if (isFilled) {
          return (
            <div
              key={slot.id}
              className="relative rounded-[7px] overflow-hidden group"
              style={{
                height: 52,
                border: '.5px solid var(--color-border)',
                background: 'var(--color-card)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slot.imageUrl}
                alt={slot.name ?? `Partenaire ${i + 1}`}
                className="w-full h-full object-contain p-2"
              />
              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Supprimer ${slot.name ?? `partenaire ${i + 1}`}`}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[150ms] cursor-pointer"
                style={{
                  background: 'rgba(0,0,0,.45)',
                  border: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )
        }

        return (
          <button
            key={`empty-${i}`}
            type="button"
            onClick={() => onAdd(i)}
            aria-label="Ajouter un logo partenaire"
            className="flex flex-col items-center justify-center gap-[3px] rounded-[7px] cursor-pointer transition-all duration-[150ms] hover:border-[var(--color-qblue)] hover:bg-[var(--color-qblue-bg)]"
            style={{
              height: 52,
              background: 'var(--color-bg)',
              border: '.5px dashed var(--color-border)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="var(--color-text-hint)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 10, color: 'var(--color-text-hint)' }}>
              Ajouter un logo
            </span>
          </button>
        )
      })}
    </div>
  )
}
