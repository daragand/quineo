'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

// ─────────────────────────────────────────
// Styles par variante
// ─────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, {
  bg: string
  border: string
  icon: string
  title: string
  desc: string
  Icon: React.ComponentType<{ style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>
}> = {
  success: {
    bg:     'var(--color-qgreen-bg)',
    border: '#97C459',
    icon:   '#48BB78',
    title:  'var(--color-qgreen-text)',
    desc:   'var(--color-qgreen-text)',
    Icon:   CheckCircleIcon,
  },
  error: {
    bg:     'var(--color-qred-bg)',
    border: '#F09595',
    icon:   '#E24B4A',
    title:  'var(--color-qred)',
    desc:   'var(--color-qred)',
    Icon:   ExclamationCircleIcon,
  },
  warning: {
    bg:     'var(--color-orange-bg)',
    border: 'var(--color-amber)',
    icon:   'var(--color-amber)',
    title:  'var(--color-orange)',
    desc:   'var(--color-orange)',
    Icon:   ExclamationTriangleIcon,
  },
  info: {
    bg:     'var(--color-qblue-bg)',
    border: 'rgba(24,95,165,.3)',
    icon:   'var(--color-qblue)',
    title:  'var(--color-qblue)',
    desc:   'var(--color-qblue)',
    Icon:   InformationCircleIcon,
  },
}

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const duration = toast.duration ?? 4000

    setToasts(prev => [...prev, { ...toast, id }])

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─────────────────────────────────────────
// Région (portail bas-droite)
// ─────────────────────────────────────────

function ToastRegion({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-live="assertive"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 360, width: '100%' }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────
// Item individuel
// ─────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const s = VARIANT_STYLES[toast.variant]
  const { Icon } = s

  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-[9px] px-[13px] py-[11px] pointer-events-auto shadow-md')}
      style={{
        background: s.bg,
        border: `.5px solid ${s.border}`,
      }}
    >
      <Icon
        aria-hidden
        style={{ width: 16, height: 16, color: s.icon, flexShrink: 0, marginTop: 1 }}
      />

      <div className="flex-1 min-w-0">
        <div
          className="font-bold leading-snug"
          style={{ fontSize: 12, color: s.title }}
        >
          {toast.title}
        </div>
        {toast.description && (
          <div
            className="mt-[2px] leading-snug"
            style={{ fontSize: 11, color: s.desc, opacity: 0.85 }}
          >
            {toast.description}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="flex-shrink-0 rounded transition-opacity duration-[100ms] hover:opacity-60 cursor-pointer"
        style={{ background: 'transparent', border: 'none', padding: 2 }}
      >
        <XMarkIcon aria-hidden style={{ width: 12, height: 12, color: s.icon }} />
      </button>
    </div>
  )
}
