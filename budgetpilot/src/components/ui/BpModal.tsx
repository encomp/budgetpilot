import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import { animate } from 'motion'
import { getMotionConfig } from '@/lib/animation'
import { cn } from '@/lib/utils'

export interface BpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const maxWidths = { sm: 400, md: 560, lg: 720 }

function ModalContent({
  children,
  size = 'md',
  title,
  description,
  footer,
  onOpenChange,
}: Omit<BpModalProps, 'open'>) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const { duration, easing } = getMotionConfig()
    animate(el, { opacity: [0, 1], scale: [0.95, 1] }, { duration, easing })
  }, [])

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bp-bg-overlay)',
          zIndex: 9998,
        }}
      />
      <DialogPrimitive.Popup
        ref={ref}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: `min(calc(100vw - 2rem), ${maxWidths[size]}px)`,
          background: 'var(--bp-bg-surface)',
          border: '1px solid var(--bp-border)',
          borderRadius: 'var(--bp-radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          maxHeight: 'calc(100vh - 4rem)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '20px 20px 0',
            gap: 12,
          }}
        >
          <div>
            <DialogPrimitive.Title
              style={{
                fontFamily: 'var(--bp-font-ui)',
                fontWeight: 600,
                fontSize: 16,
                color: 'var(--bp-text-primary)',
                margin: 0,
              }}
            >
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description
                style={{
                  fontFamily: 'var(--bp-font-ui)',
                  fontSize: 13,
                  color: 'var(--bp-text-secondary)',
                  marginTop: 4,
                }}
              >
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--bp-text-muted)',
              padding: 4,
              borderRadius: 'var(--bp-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            onClick={() => onOpenChange(false)}
          >
            <XIcon size={16} />
          </DialogPrimitive.Close>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--bp-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

export function BpModal({ open, onOpenChange, ...rest }: BpModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {open && <ModalContent onOpenChange={onOpenChange} {...rest} />}
    </DialogPrimitive.Root>
  )
}
