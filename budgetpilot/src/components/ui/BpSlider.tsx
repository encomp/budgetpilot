import * as React from 'react'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { cn } from '@/lib/utils'

export interface BpSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  variant?: 'standard' | 'premium'
  disabled?: boolean
  className?: string
}

const sliderCss = `
.bp-slider-thumb-premium {
  width: 44px !important;
  height: 44px !important;
  background: var(--bp-accent) !important;
  border: 2px solid var(--bp-bg-surface) !important;
  border-radius: 50% !important;
  cursor: pointer;
  transition: transform var(--bp-duration-fast) var(--bp-easing-spring),
              box-shadow var(--bp-duration-fast) var(--bp-easing-spring) !important;
}
.bp-slider-thumb-premium:hover,
.bp-slider-thumb-premium:active,
.bp-slider-thumb-premium[data-dragging] {
  transform: scale(1.15) !important;
  box-shadow: 0 0 0 8px var(--bp-accent-muted) !important;
}
.bp-slider-thumb-standard {
  width: 20px !important;
  height: 20px !important;
  background: var(--bp-accent) !important;
  border: 2px solid var(--bp-bg-surface) !important;
  border-radius: 50% !important;
  cursor: pointer;
  transition: box-shadow var(--bp-duration-fast) var(--bp-easing-default) !important;
}
.bp-slider-thumb-standard:hover,
.bp-slider-thumb-standard:active,
.bp-slider-thumb-standard[data-dragging] {
  box-shadow: 0 0 0 4px var(--bp-accent-muted) !important;
}
`

let sliderCssInjected = false
function injectSliderCss() {
  if (sliderCssInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = sliderCss
  document.head.appendChild(el)
  sliderCssInjected = true
}

export function BpSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  variant = 'standard',
  disabled = false,
  className,
}: BpSliderProps) {
  injectSliderCss()
  const isPremium = variant === 'premium'
  const trackHeight = isPremium ? 8 : 6

  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={vals => onChange(vals[0])}
      thumbAlignment="center"
      className={cn('data-horizontal:w-full', className)}
    >
      <SliderPrimitive.Control
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          userSelect: 'none',
          touchAction: 'none',
          opacity: disabled ? 0.5 : 1,
          paddingBlock: isPremium ? 8 : 4,
        }}
      >
        <SliderPrimitive.Track
          style={{
            position: 'relative',
            flexGrow: 1,
            background: 'var(--bp-bg-surface-alt)',
            borderRadius: 'var(--bp-radius-sm)',
            height: trackHeight,
          }}
        >
          <SliderPrimitive.Indicator
            style={{
              background: 'var(--bp-accent)',
              height: '100%',
              borderRadius: 'var(--bp-radius-sm)',
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={isPremium ? 'bp-slider-thumb-premium' : 'bp-slider-thumb-standard'}
          style={{
            position: 'absolute',
            display: 'block',
          }}
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
