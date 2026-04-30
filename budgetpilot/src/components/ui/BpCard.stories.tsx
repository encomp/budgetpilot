import type { Meta, StoryObj } from '@storybook/react'
import { BpCard } from './BpCard'

const meta: Meta<typeof BpCard> = {
  title: 'Bp/BpCard',
  component: BpCard,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpCard>

const Content = () => (
  <div>
    <p style={{ color: 'var(--bp-text-primary)', marginBottom: 4 }}>Card Title</p>
    <p style={{ color: 'var(--bp-text-secondary)', fontSize: 13 }}>
      This is some card content to demonstrate the card component.
    </p>
  </div>
)

export const PaddingVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 24 }}>
      <BpCard padding="sm"><Content /></BpCard>
      <BpCard padding="md"><Content /></BpCard>
      <BpCard padding="lg"><Content /></BpCard>
    </div>
  ),
}

export const Hoverable: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 24 }}>
      <BpCard hoverable><Content /></BpCard>
      <BpCard><Content /></BpCard>
    </div>
  ),
}

export const Small: Story = { args: { padding: 'sm', children: <Content /> } }
export const Medium: Story = { args: { padding: 'md', children: <Content /> } }
export const Large: Story = { args: { padding: 'lg', children: <Content /> } }
