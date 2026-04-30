import * as React from 'react'
import { AnimatedIcon } from './AnimatedIcon'

export type BpToastVariant = 'info' | 'success' | 'error' | 'bell'

export interface BpToastProps {
  variant: BpToastVariant
  message: string
  visible: boolean
  onDismiss: () => void
  autoDismissMs?: number
}

const accentColor: Record<BpToastVariant, string> = {
  info:    'var(--bp-accent)',
  success: 'var(--bp-positive)',
  error:   'var(--bp-danger)',
  bell:    'var(--bp-warning)',
}

export function BpToast({ variant, message, visible, onDismiss, autoDismissMs = 4000 }: BpToastProps) {
  React.useEffect(() => {
    if (!visible) return
    const id = setTimeout(onDismiss, autoDismissMs)
    return () => clearTimeout(id)
  }, [visible, autoDismissMs, onDismiss])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: 'var(--bp-bg-surface)',
        border: '1px solid var(--bp-border)',
        borderLeft: `4px solid ${accentColor[variant]}`,
        borderRadius: 'var(--bp-radius-md)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 240,
        maxWidth: 360,
        fontFamily: 'var(--bp-font-ui)',
        color: 'var(--bp-text-primary)',
        fontSize: 14,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity var(--bp-duration-normal) var(--bp-easing-spring), transform var(--bp-duration-normal) var(--bp-easing-spring)`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {variant === 'bell' && <AnimatedIcon type="BellRing" size={16} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--bp-text-muted)',
          padding: 2,
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

// Hook for managing a single toast
export interface ToastState {
  message: string
  variant: BpToastVariant
  visible: boolean
}

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>({
    message: '',
    variant: 'info',
    visible: false,
  })

  const showToast = React.useCallback((message: string, variant: BpToastVariant = 'info') => {
    setToast({ message, variant, visible: true })
  }, [])

  const dismiss = React.useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  return { toast, showToast, dismiss }
}
