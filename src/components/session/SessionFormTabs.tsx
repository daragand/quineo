'use client'

import { cn } from '@/lib/cn'

export interface TabDef {
  id: string
  label: string
  /** true = onglet rempli (dot vert) */
  filled?: boolean
}

interface SessionFormTabsProps {
  tabs: TabDef[]
  activeIndex: number
  onChange: (index: number) => void
}

export function SessionFormTabs({ tabs, activeIndex, onChange }: SessionFormTabsProps) {
  return (
    <div
      className="flex gap-[2px] rounded-[8px] p-[3px] mb-[20px] w-fit"
      role="tablist"
      aria-label="Étapes du formulaire"
      style={{ background: 'var(--color-bg)' }}
    >
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'flex items-center gap-[5px] rounded-[6px] px-[16px] py-[6px] font-bold whitespace-nowrap cursor-pointer transition-all duration-[150ms]',
              isActive
                ? 'shadow-[0_1px_3px_rgba(0,0,0,.08)]'
                : 'hover:opacity-80'
            )}
            style={{
              fontSize: 12,
              background: isActive ? 'var(--color-card)' : 'transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              border: 'none',
            }}
          >
            {/* Dot */}
            <span
              aria-hidden="true"
              className="rounded-full flex-shrink-0"
              style={{
                width: 7, height: 7,
                background: isActive && tab.filled
                  ? 'var(--color-qgreen)'
                  : isActive
                  ? 'var(--color-qblue)'
                  : 'var(--color-text-hint)',
                display: 'block',
              }}
            />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
