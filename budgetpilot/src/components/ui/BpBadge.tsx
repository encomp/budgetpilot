import * as React from 'react'
import { cn } from '@/lib/utils'

export type BpBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'csv' | 'manual'

export interface BpBadgeProps {
  variant?: BpBadgeVariant
  children?: React.ReactNode
  className?: string
}

const variantStyles: Record<BpBadgeVariant, React.CSSProperties> = {
  default:  { background: 'var(--bp-accent-muted)',    color: 'var(--bp-accent)' },
  success:  { background: 'var(--bp-positive-muted)',  color: 'var(--bp-positive)' },
  warning:  { background: 'var(--bp-warning-muted)',   color: 'var(--bp-warning)' },
  danger:   { background: 'var(--bp-danger-muted)',    color: 'var(--bp-danger)' },
  muted:    { background: 'var(--bp-bg-surface-alt)',  color: 'var(--bp-text-muted)' },
  csv:      { background: 'var(--bp-warning-muted)',   color: 'var(--bp-warning)' },
  manual:   { background: 'var(--bp-accent-muted)',    color: 'var(--bp-accent)' },
}

const fixedLabel: Partial<Record<BpBadgeVariant, string>> = {
  csv: 'CSV',
  manual: 'Manual',
}

export function BpBadge({ variant = 'default', children, className }: BpBadgeProps) {
  const label = fixedLabel[variant] ?? children

  return (
    <span
      className={cn(className)}
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--bp-radius-sm)',
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'var(--bp-font-ui)',
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
