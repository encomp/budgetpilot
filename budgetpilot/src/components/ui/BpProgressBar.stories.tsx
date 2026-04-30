import type { Meta, StoryObj } from '@storybook/react'
import { BpProgressBar } from './BpProgressBar'

const meta: Meta<typeof BpProgressBar> = {
  title: 'Bp/BpProgressBar',
  component: BpProgressBar,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpProgressBar>

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, maxWidth: 400 }}>
      <BpProgressBar value={0}   label="Empty (0%)"      showValue />
      <BpProgressBar value={45}  label="Healthy (45%)"   showValue />
      <BpProgressBar value={72}  label="Healthy (72%)"   showValue />
      <BpProgressBar value={88}  label="Warning (88%)"   showValue />
      <BpProgressBar value={100} label="At Limit (100%)" showValue />
      <BpProgressBar value={120} label="Over Budget (120%)" showValue />
    </div>
  ),
}

export const Empty: Story = { args: { value: 0, label: 'Rent', showValue: true } }
export const Healthy: Story = { args: { value: 45, label: 'Groceries', showValue: true } }
export const Warning: Story = { args: { value: 88, label: 'Dining Out', showValue: true } }
export const AtLimit: Story = { args: { value: 100, label: 'Entertainment', showValue: true } }
export const OverBudget: Story = { args: { value: 120, label: 'Shopping', showValue: true } }
