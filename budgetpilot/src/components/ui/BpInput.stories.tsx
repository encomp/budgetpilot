import type { Meta, StoryObj } from '@storybook/react'
import { BpInput } from './BpInput'

const meta: Meta<typeof BpInput> = {
  title: 'Bp/BpInput',
  component: BpInput,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpInput>

export const Default: Story = {
  args: { placeholder: 'Enter text…' },
  decorators: [Story => <div style={{ padding: 24, maxWidth: 300 }}><Story /></div>],
}

export const WithLabel: Story = {
  args: { label: 'Transaction Name', placeholder: 'e.g. Starbucks' },
  decorators: [Story => <div style={{ padding: 24, maxWidth: 300 }}><Story /></div>],
}

export const Mono: Story = {
  args: { label: 'Amount', placeholder: '0.00', mono: true, defaultValue: '125.50' },
  decorators: [Story => <div style={{ padding: 24, maxWidth: 300 }}><Story /></div>],
}

export const ErrorState: Story = {
  args: {
    label: 'Amount',
    defaultValue: 'abc',
    error: 'Please enter a valid number',
    mono: true,
  },
  decorators: [Story => <div style={{ padding: 24, maxWidth: 300 }}><Story /></div>],
}

export const Disabled: Story = {
  args: { label: 'Account Number', defaultValue: '****1234', disabled: true },
  decorators: [Story => <div style={{ padding: 24, maxWidth: 300 }}><Story /></div>],
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, maxWidth: 320 }}>
      <BpInput placeholder="Default input" />
      <BpInput label="With Label" placeholder="e.g. Coffee" />
      <BpInput label="Mono (currency)" mono defaultValue="1,250.00" />
      <BpInput label="Error" defaultValue="invalid" error="This field is required" />
      <BpInput label="Disabled" defaultValue="Read only" disabled />
    </div>
  ),
}
