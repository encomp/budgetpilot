import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean
  error?: string
  label?: string
}

export function BpInput({ mono, error, label, className, id, ...props }: BpInputProps) {
  const inputId = id ?? (label ? `bp-input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--bp-font-ui)' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--bp-text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(className)}
        {...props}
        style={{
          height: 38,
          padding: '0 12px',
          background: 'var(--bp-bg-surface-alt)',
          border: `1px solid ${error ? 'var(--bp-danger)' : 'var(--bp-border)'}`,
          borderRadius: 'var(--bp-radius-md)',
          fontFamily: mono ? 'var(--bp-font-mono)' : 'var(--bp-font-ui)',
          fontSize: 14,
          color: 'var(--bp-text-primary)',
          outline: 'none',
          width: '100%',
          transition: `border-color var(--bp-duration-fast) var(--bp-easing-default), box-shadow var(--bp-duration-fast) var(--bp-easing-default)`,
          ...(props.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          ...props.style,
        }}
        onFocus={e => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--bp-accent)'
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--bp-accent-muted)'
          }
          props.onFocus?.(e)
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? 'var(--bp-danger)' : 'var(--bp-border)'
          e.currentTarget.style.boxShadow = ''
          props.onBlur?.(e)
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: 'var(--bp-danger)' }}>{error}</span>
      )}
    </div>
  )
}
