import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BpToast } from './BpToast'

const meta: Meta<typeof BpToast> = {
  title: 'Bp/BpToast',
  component: BpToast,
  parameters: { backgrounds: { default: 'midnight' } },
}
export default meta
type Story = StoryObj<typeof BpToast>

export const AllVariants: Story = {
  render: () => (
    <div style={{ position: 'relative', height: 320, padding: 24 }}>
      <p style={{ color: 'var(--bp-text-secondary)', fontSize: 13, marginBottom: 16 }}>
        All 4 toast variants shown simultaneously (static, no auto-dismiss):
      </p>
      {(
        [
          { variant: 'info'    as const, message: 'Data imported successfully',         bottom: 220 },
          { variant: 'success' as const, message: 'Transaction saved',                  bottom: 160 },
          { variant: 'error'   as const, message: 'Failed to load transactions',        bottom: 100 },
          { variant: 'bell'    as const, message: 'Monthly budget review is due',       bottom: 40  },
        ]
      ).map(({ variant, message, bottom }) => (
        <div
          key={variant}
          style={{ position: 'absolute', bottom, right: 0 }}
        >
          <BpToast
            variant={variant}
            message={message}
            visible
            onDismiss={() => {}}
            autoDismissMs={999999}
          />
        </div>
      ))}
    </div>
  ),
}

function ToastDemo({ variant }: { variant: 'info' | 'success' | 'error' | 'bell' }) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div style={{ padding: 24 }}>
      <button
        type="button"
        onClick={() => setVisible(true)}
        style={{
          background: 'var(--bp-accent-muted)',
          color: 'var(--bp-accent)',
          border: '1px solid var(--bp-accent)',
          borderRadius: 'var(--bp-radius-sm)',
          padding: '6px 14px',
          cursor: 'pointer',
          fontFamily: 'var(--bp-font-ui)',
        }}
      >
        Show {variant} toast
      </button>
      <BpToast
        variant={variant}
        message={`This is a ${variant} toast message`}
        visible={visible}
        onDismiss={() => setVisible(false)}
        autoDismissMs={3000}
      />
    </div>
  )
}

export const Info: Story = { render: () => <ToastDemo variant="info" /> }
export const Success: Story = { render: () => <ToastDemo variant="success" /> }
export const Error: Story = { render: () => <ToastDemo variant="error" /> }
export const Bell: Story = { render: () => <ToastDemo variant="bell" /> }
