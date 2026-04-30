import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BpConfirmDialog } from './BpConfirmDialog'
import { BpButton } from './BpButton'

const meta: Meta<typeof BpConfirmDialog> = {
  title: 'Bp/BpConfirmDialog',
  component: BpConfirmDialog,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpConfirmDialog>

function Demo({ variant }: { variant?: 'default' | 'danger' }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ padding: 24 }}>
      <BpButton
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={() => setOpen(true)}
      >
        Open {variant === 'danger' ? 'Danger' : 'Default'} Confirm
      </BpButton>
      <BpConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={variant === 'danger' ? 'Delete Transaction?' : 'Confirm Action'}
        description={
          variant === 'danger'
            ? 'This action cannot be undone. The transaction will be permanently deleted.'
            : 'Are you sure you want to proceed with this action?'
        }
        confirmLabel={variant === 'danger' ? 'Delete' : 'Confirm'}
        variant={variant}
        onConfirm={() => console.log('confirmed')}
      />
    </div>
  )
}

export const Default: Story = { render: () => <Demo variant="default" /> }
export const Danger: Story = { render: () => <Demo variant="danger" /> }
