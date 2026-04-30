import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BpSlider } from './BpSlider'

const meta: Meta<typeof BpSlider> = {
  title: 'Bp/BpSlider',
  component: BpSlider,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpSlider>

function SliderDemo({ variant, initialValue }: { variant?: 'standard' | 'premium'; initialValue: number }) {
  const [val, setVal] = React.useState(initialValue)
  return (
    <div style={{ padding: '24px 32px', maxWidth: 400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: 'var(--bp-text-secondary)', fontSize: 13 }}>
          {variant === 'premium' ? 'Extra Payment' : 'Allocation'}
        </span>
        <span style={{ color: 'var(--bp-accent)', fontSize: 13, fontFamily: 'var(--bp-font-mono)' }}>
          {val}%
        </span>
      </div>
      <BpSlider value={val} min={0} max={100} onChange={setVal} variant={variant} />
    </div>
  )
}

export const StandardAt30: Story = { render: () => <SliderDemo variant="standard" initialValue={30} /> }
export const StandardAt70: Story = { render: () => <SliderDemo variant="standard" initialValue={70} /> }
export const PremiumAt30: Story = { render: () => <SliderDemo variant="premium" initialValue={30} /> }
export const PremiumAt70: Story = { render: () => <SliderDemo variant="premium" initialValue={70} /> }
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <p style={{ color: 'var(--bp-text-muted)', fontSize: 12, padding: '16px 32px 0' }}>Standard</p>
      <SliderDemo variant="standard" initialValue={30} />
      <SliderDemo variant="standard" initialValue={70} />
      <p style={{ color: 'var(--bp-text-muted)', fontSize: 12, padding: '16px 32px 0' }}>Premium</p>
      <SliderDemo variant="premium" initialValue={30} />
      <SliderDemo variant="premium" initialValue={70} />
    </div>
  ),
}
