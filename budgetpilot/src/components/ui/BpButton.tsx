import * as React from 'react'
import { cn } from '@/lib/utils'
import { AnimatedIcon } from './AnimatedIcon'

export type BpButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type BpButtonSize = 'sm' | 'md' | 'lg'

export interface BpButtonProps {
  variant?: BpButtonVariant
  size?: BpButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const variantStyles: Record<BpButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--bp-accent)',
    color: 'var(--bp-bg-base)',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--bp-bg-surface-alt)',
    border: '1px solid var(--bp-border)',
    color: 'var(--bp-text-primary)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--bp-text-secondary)',
  },
  danger: {
    background: 'var(--bp-danger-muted)',
    border: '1px solid var(--bp-danger)',
    color: 'var(--bp-danger)',
  },
}

const sizeStyles: Record<BpButtonSize, React.CSSProperties> = {
  sm: { height: 32, padding: '0 12px', fontSize: 13, borderRadius: 'var(--bp-radius-sm)' },
  md: { height: 38, padding: '0 16px', fontSize: 14, borderRadius: 'var(--bp-radius-md)' },
  lg: { height: 44, padding: '0 20px', fontSize: 15, borderRadius: 'var(--bp-radius-md)' },
}

export function BpButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  onClick,
  disabled,
  className,
}: BpButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn('bp-button', className)}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--bp-font-ui)',
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !loading ? 0.5 : 1,
        transition: `all var(--bp-duration-fast) var(--bp-easing-default)`,
        outline: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (isDisabled) return
        const el = e.currentTarget
        if (variant === 'primary') el.style.filter = 'brightness(0.88)'
        if (variant === 'ghost') el.style.background = 'var(--bp-accent-muted)'
        if (variant === 'secondary') el.style.borderColor = 'var(--bp-border-strong)'
      }}
      onMouseLeave={e => {
        if (isDisabled) return
        const el = e.currentTarget
        el.style.filter = ''
        if (variant === 'ghost') el.style.background = 'transparent'
        if (variant === 'secondary') el.style.borderColor = 'var(--bp-border)'
      }}
    >
      {loading ? (
        <AnimatedIcon type="LoaderCircle" size={size === 'sm' ? 14 : 16} />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
