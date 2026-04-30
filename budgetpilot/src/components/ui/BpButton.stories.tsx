import type { Meta, StoryObj } from '@storybook/react'
import { BpButton } from './BpButton'

const meta: Meta<typeof BpButton> = {
  title: 'Bp/BpButton',
  component: BpButton,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpButton>

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: 16 }}>
    {children}
  </div>
)

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Row>
        <BpButton variant="primary">Primary</BpButton>
        <BpButton variant="secondary">Secondary</BpButton>
        <BpButton variant="ghost">Ghost</BpButton>
        <BpButton variant="danger">Danger</BpButton>
      </Row>
      <Row>
        <BpButton variant="primary" loading>Loading</BpButton>
        <BpButton variant="secondary" loading>Loading</BpButton>
        <BpButton variant="ghost" loading>Loading</BpButton>
        <BpButton variant="danger" loading>Loading</BpButton>
      </Row>
      <Row>
        <BpButton variant="primary" disabled>Disabled</BpButton>
        <BpButton variant="secondary" disabled>Disabled</BpButton>
        <BpButton variant="ghost" disabled>Disabled</BpButton>
        <BpButton variant="danger" disabled>Disabled</BpButton>
      </Row>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Row>
      <BpButton size="sm">Small</BpButton>
      <BpButton size="md">Medium</BpButton>
      <BpButton size="lg">Large</BpButton>
    </Row>
  ),
}

export const Primary: Story = { args: { children: 'Primary Button', variant: 'primary' } }
export const Secondary: Story = { args: { children: 'Secondary Button', variant: 'secondary' } }
export const Ghost: Story = { args: { children: 'Ghost Button', variant: 'ghost' } }
export const Danger: Story = { args: { children: 'Danger Button', variant: 'danger' } }
export const Loading: Story = { args: { children: 'Loading...', loading: true } }
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } }
