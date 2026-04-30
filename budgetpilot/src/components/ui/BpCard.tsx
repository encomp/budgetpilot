import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BpCardProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
}

const paddingMap = { sm: '12px', md: '20px', lg: '28px' }

export function BpCard({ children, padding = 'md', hoverable = false, className }: BpCardProps) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      className={cn(className)}
      style={{
        background: 'var(--bp-bg-surface)',
        border: `1px solid ${hovered && hoverable ? 'var(--bp-border-strong)' : 'var(--bp-border)'}`,
        borderRadius: 'var(--bp-radius-md)',
        padding: paddingMap[padding],
        transform: hovered && hoverable ? 'translateY(-1px)' : 'translateY(0)',
        transition: hoverable
          ? `transform var(--bp-duration-fast) var(--bp-easing-default), border-color var(--bp-duration-fast) var(--bp-easing-default)`
          : undefined,
        cursor: hoverable ? 'pointer' : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}
