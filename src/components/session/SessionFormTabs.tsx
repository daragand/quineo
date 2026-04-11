'use client'

import { useRef, useEffect, useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const activeTab = tabs[activeIndex]

  return (
    <>
      {/* ── Mobile : dropdown ── */}
      <div ref={ref} className="md:hidden relative z-50 mb-[20px]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full rounded-[8px] px-[14px] py-[10px] font-bold cursor-pointer"
          style={{
            fontSize: 13,
            background: 'var(--color-bg)',
            border: '.5px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <span className="flex items-center gap-[8px]">
            <span
              aria-hidden="true"
              className="rounded-full flex-shrink-0"
              style={{
                width: 7, height: 7,
                background: activeTab.filled ? 'var(--color-qgreen)' : 'var(--color-qblue)',
                display: 'block',
              }}
            />
            {activeTab.label}
            <span style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
              {activeIndex + 1} / {tabs.length}
            </span>
          </span>
          <svg
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            aria-hidden="true"
            style={{
              transition: 'transform 150ms',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute left-0 right-0 rounded-[8px] overflow-hidden"
            style={{
              top: 'calc(100% + 4px)',
              background: 'var(--color-card)',
              border: '.5px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,.10)',
              zIndex: 50,
            }}
          >
            {tabs.map((tab, i) => {
              const isActive = i === activeIndex
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { onChange(i); setOpen(false) }}
                  className="flex items-center gap-[10px] w-full px-[14px] py-[11px] font-bold cursor-pointer transition-colors duration-[100ms] hover:bg-[var(--color-bg)]"
                  style={{
                    fontSize: 13,
                    background: isActive ? 'var(--color-qblue-bg)' : 'transparent',
                    color: isActive ? 'var(--color-qblue-text)' : 'var(--color-text-primary)',
                    borderBottom: i < tabs.length - 1 ? '.5px solid var(--color-sep)' : 'none',
                    textAlign: 'left',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: 7, height: 7,
                      background: isActive
                        ? (tab.filled ? 'var(--color-qgreen)' : 'var(--color-qblue)')
                        : 'var(--color-text-hint)',
                      display: 'block',
                    }}
                  />
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Desktop : pills ── */}
      <div
        className="hidden md:flex gap-[2px] rounded-[8px] p-[3px] mb-[20px] w-fit"
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
    </>
  )
}
