import { useAppStore } from './store/useAppStore'

export default function App() {
  const activeView = useAppStore((s) => s.activeView)
  return (
    <div style={{ padding: '2rem', color: 'var(--bp-text-primary)' }}>
      <h1>BudgetPilot</h1>
      <p>Active view: {activeView}</p>
    </div>
  )
}
