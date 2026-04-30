import * as React from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BpSelectOption {
  value: string
  label: string
}

export interface BpSelectProps {
  options: BpSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function BpSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  disabled = false,
  className,
}: BpSelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(className)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          height: 38,
          padding: '0 10px',
          background: 'var(--bp-bg-surface-alt)',
          border: '1px solid var(--bp-border)',
          borderRadius: 'var(--bp-radius-md)',
          fontFamily: 'var(--bp-font-ui)',
          fontSize: 14,
          color: value ? 'var(--bp-text-primary)' : 'var(--bp-text-muted)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: `border-color var(--bp-duration-fast) var(--bp-easing-default)`,
          outline: 'none',
          minWidth: 160,
        }}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon render={<ChevronDownIcon size={14} style={{ color: 'var(--bp-text-muted)', flexShrink: 0 }} />} />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={4}>
          <SelectPrimitive.Popup
            style={{
              background: 'var(--bp-bg-surface)',
              border: '1px solid var(--bp-border)',
              borderRadius: 'var(--bp-radius-md)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              minWidth: 160,
              overflow: 'hidden',
              zIndex: 9998,
              fontFamily: 'var(--bp-font-ui)',
            }}
          >
            <SelectPrimitive.List style={{ padding: 4 }}>
              {options.map(opt => (
                <BpSelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </BpSelectItem>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

function BpSelectItem({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) {
  return (
    <SelectPrimitive.Item
      value={value}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 8px',
        fontSize: 14,
        borderRadius: 'var(--bp-radius-sm)',
        cursor: 'pointer',
        outline: 'none',
        color: 'var(--bp-text-primary)',
        transition: `background var(--bp-duration-fast) var(--bp-easing-default)`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bp-accent-muted)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
    >
      <SelectPrimitive.ItemText style={{ color: 'inherit' }}>
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <CheckIcon size={14} style={{ color: 'var(--bp-accent)' }} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
