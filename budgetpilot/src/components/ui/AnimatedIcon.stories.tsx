import type { Meta, StoryObj } from '@storybook/react'
import { AnimatedIcon } from './AnimatedIcon'

const meta: Meta<typeof AnimatedIcon> = {
  title: 'Bp/AnimatedIcon',
  component: AnimatedIcon,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof AnimatedIcon>

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: 32 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AnimatedIcon type="LoaderCircle" size={32} />
        <span style={{ color: 'var(--bp-text-secondary)', fontSize: 12 }}>LoaderCircle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AnimatedIcon type="CheckCircle" size={32} />
        <span style={{ color: 'var(--bp-text-secondary)', fontSize: 12 }}>CheckCircle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <AnimatedIcon type="BellRing" size={32} />
        <span style={{ color: 'var(--bp-text-secondary)', fontSize: 12 }}>BellRing</span>
      </div>
    </div>
  ),
}
