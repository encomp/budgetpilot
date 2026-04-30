import type { Meta, StoryObj } from '@storybook/react'
import { BpBadge } from './BpBadge'

const meta: Meta<typeof BpBadge> = {
  title: 'Bp/BpBadge',
  component: BpBadge,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpBadge>

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 24, alignItems: 'center' }}>
      <BpBadge variant="default">Default</BpBadge>
      <BpBadge variant="success">Success</BpBadge>
      <BpBadge variant="warning">Uncategorized</BpBadge>
      <BpBadge variant="danger">Danger</BpBadge>
      <BpBadge variant="muted">Muted</BpBadge>
      <BpBadge variant="csv" />
      <BpBadge variant="manual" />
    </div>
  ),
}

export const Default: Story = { args: { variant: 'default', children: 'Default' } }
export const Success: Story = { args: { variant: 'success', children: 'Success' } }
export const Warning: Story = { args: { variant: 'warning', children: 'Uncategorized' } }
export const Danger: Story = { args: { variant: 'danger', children: 'Over Budget' } }
export const Muted: Story = { args: { variant: 'muted', children: 'Archived' } }
export const Csv: Story = { args: { variant: 'csv' } }
export const Manual: Story = { args: { variant: 'manual' } }
