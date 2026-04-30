import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BpProgressBarProps {
  value: number
  label?: string
  showValue?: boolean
  className?: string
}

function getFillColor(value: number): string {
  if (value >= 100) return 'var(--bp-danger)'
  if (value >= 85)  return 'var(--bp-warning)'
  return 'var(--bp-positive)'
}

export function BpProgressBar({ value, label, showValue = false, className }: BpProgressBarProps) {
  const clampedWidth = Math.min(value, 100)
  const fillColor = getFillColor(value)

  return (
    <div className={cn(className)} style={{ width: '100%' }}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontFamily: 'var(--bp-font-ui)',
          }}
        >
          {label && (
            <span style={{ fontSize: 13, color: 'var(--bp-text-secondary)' }}>{label}</span>
          )}
          {showValue && (
            <span style={{ fontSize: 12, color: getFillColor(value), fontWeight: 500 }}>
              {value}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          background: 'var(--bp-bg-surface-alt)',
          borderRadius: 'var(--bp-radius-sm)',
          height: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clampedWidth}%`,
            height: '100%',
            background: fillColor,
            borderRadius: 'var(--bp-radius-sm)',
            transition: `width var(--bp-duration-normal) var(--bp-easing-default)`,
          }}
        />
      </div>
    </div>
  )
}
