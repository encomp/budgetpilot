import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BpModal } from './BpModal'
import { BpButton } from './BpButton'

const meta: Meta<typeof BpModal> = {
  title: 'Bp/BpModal',
  component: BpModal,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpModal>

function ModalDemo({ size }: { size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <BpButton onClick={() => setOpen(true)}>Open {size ?? 'md'} Modal</BpButton>
      <BpModal
        open={open}
        onOpenChange={setOpen}
        title="Example Modal"
        description="This demonstrates the BpModal component with entrance animation."
        size={size}
        footer={
          <>
            <BpButton variant="ghost" onClick={() => setOpen(false)}>Cancel</BpButton>
            <BpButton onClick={() => setOpen(false)}>Confirm</BpButton>
          </>
        }
      >
        <p style={{ color: 'var(--bp-text-secondary)', fontSize: 14, lineHeight: '1.6' }}>
          Modal body content goes here. This area is scrollable when content overflows.
        </p>
      </BpModal>
    </>
  )
}

export const Small: Story = { render: () => <div style={{ padding: 24 }}><ModalDemo size="sm" /></div> }
export const Medium: Story = { render: () => <div style={{ padding: 24 }}><ModalDemo size="md" /></div> }
export const Large: Story = { render: () => <div style={{ padding: 24 }}><ModalDemo size="lg" /></div> }
export const WithoutFooter: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div style={{ padding: 24 }}>
        <BpButton onClick={() => setOpen(true)}>Open (no footer)</BpButton>
        <BpModal open={open} onOpenChange={setOpen} title="No Footer Modal">
          <p style={{ color: 'var(--bp-text-secondary)', fontSize: 14 }}>
            This modal has no footer actions.
          </p>
        </BpModal>
      </div>
    )
  },
}
