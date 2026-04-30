import * as React from 'react'
import { cn } from '@/lib/utils'
import { BpButton } from './BpButton'

export interface BpEmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function BpEmptyState({ icon, heading, subtext, action, className }: BpEmptyStateProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: 12,
        fontFamily: 'var(--bp-font-ui)',
      }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bp-text-muted)',
          }}
        >
          {icon}
        </div>
      )}
      <p
        style={{
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--bp-text-primary)',
          margin: 0,
        }}
      >
        {heading}
      </p>
      <p
        style={{
          fontSize: 14,
          color: 'var(--bp-text-secondary)',
          margin: 0,
          maxWidth: 320,
          lineHeight: '1.5',
        }}
      >
        {subtext}
      </p>
      {action && (
        <div style={{ marginTop: 8 }}>
          <BpButton variant="primary" onClick={action.onClick}>
            {action.label}
          </BpButton>
        </div>
      )}
    </div>
  )
}
