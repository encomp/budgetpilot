import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BpSelect } from './BpSelect'

const meta: Meta<typeof BpSelect> = {
  title: 'Bp/BpSelect',
  component: BpSelect,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpSelect>

const MONTHS = [
  { value: '2026-01', label: 'January 2026' },
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' },
]

function Demo({ initialValue = '', disabled = false }: { initialValue?: string; disabled?: boolean }) {
  const [value, setValue] = React.useState(initialValue)
  return (
    <div style={{ padding: 24 }}>
      <BpSelect
        options={MONTHS}
        value={value}
        onValueChange={setValue}
        placeholder="Select month…"
        disabled={disabled}
      />
    </div>
  )
}

export const Default: Story = { render: () => <Demo /> }
export const WithValue: Story = { render: () => <Demo initialValue="2026-03" /> }
export const Disabled: Story = { render: () => <Demo initialValue="2026-02" disabled /> }
