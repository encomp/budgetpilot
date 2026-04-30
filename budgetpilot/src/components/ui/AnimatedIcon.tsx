// Using lucide-react static imports as fallback (lucide-react-dynamic not available).
// CSS keyframe animations applied via className.

import { LoaderCircle, CheckCircle, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AnimatedIconType = 'LoaderCircle' | 'CheckCircle' | 'BellRing'

interface AnimatedIconProps {
  type: AnimatedIconType
  size?: number
  className?: string
}

const css = `
@keyframes bp-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes bp-check-draw {
  from { stroke-dashoffset: 100; opacity: 0; }
  to   { stroke-dashoffset: 0;   opacity: 1; }
}
@keyframes bp-bell-ring {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(15deg); }
  75%       { transform: rotate(-15deg); }
}
.bp-icon-loading {
  animation: bp-spin 1s linear infinite;
}
.bp-icon-check circle, .bp-icon-check path {
  stroke-dasharray: 100;
  animation: bp-check-draw 0.4s var(--bp-easing-default) forwards;
}
.bp-icon-bell {
  animation: bp-bell-ring 0.6s var(--bp-easing-bounce) infinite;
}
`

let injected = false
function injectStyles() {
  if (injected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = css
  document.head.appendChild(el)
  injected = true
}

export function AnimatedIcon({ type, size = 20, className }: AnimatedIconProps) {
  injectStyles()

  if (type === 'LoaderCircle') {
    return (
      <LoaderCircle
        size={size}
        className={cn('bp-icon-loading', className)}
        style={{ color: 'var(--bp-accent)' }}
      />
    )
  }

  if (type === 'CheckCircle') {
    return (
      <CheckCircle
        size={size}
        className={cn('bp-icon-check', className)}
        style={{ color: 'var(--bp-positive)' }}
      />
    )
  }

  return (
    <BellRing
      size={size}
      className={cn('bp-icon-bell', className)}
      style={{ color: 'var(--bp-warning)' }}
    />
  )
}
