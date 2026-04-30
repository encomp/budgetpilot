import type { Meta, StoryObj } from '@storybook/react'
import { Inbox } from 'lucide-react'
import { BpEmptyState } from './BpEmptyState'

const meta: Meta<typeof BpEmptyState> = {
  title: 'Bp/BpEmptyState',
  component: BpEmptyState,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpEmptyState>

export const WithAction: Story = {
  args: {
    icon: <Inbox size={48} />,
    heading: 'No transactions yet',
    subtext: 'Import a CSV file or add your first transaction to get started.',
    action: { label: 'Add Transaction', onClick: () => {} },
  },
}

export const WithoutAction: Story = {
  args: {
    icon: <Inbox size={48} />,
    heading: 'Nothing to show',
    subtext: 'There are no items matching your current filters.',
  },
}

export const NoIcon: Story = {
  args: {
    heading: 'No budget categories',
    subtext: 'Create budget categories to start tracking your spending.',
    action: { label: 'Create Category', onClick: () => {} },
  },
}
