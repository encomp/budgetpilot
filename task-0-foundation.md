# Task 0 — Foundation & Scaffold
**Phase:** 0 (Sequential — must complete before any other task starts)
**Agent count:** 1
**Estimated scope:** ~20 files created from scratch

---

## Context

You are bootstrapping BudgetPilot — a privacy-first personal budget tracker PWA
built with React 18 + Vite + TypeScript. This task creates every foundational file
that all subsequent agents depend on. Nothing else starts until this task passes its
completion gate.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md
Read the entire brief before writing any file.

---

## Absolute Rules (apply to every file you create)

1. TypeScript strict mode. No `any`. All types in `src/types/index.ts`.
2. All colors, durations, easings, radii via `var(--bp-*)` CSS variables. Zero
   hardcoded values anywhere in the component tree.
3. No `localStorage`, no `sessionStorage`, no cookies. Dexie only.
4. No `<form>` tags. Use `<div>` + `onClick` handlers.
5. No `alert()` or `confirm()`. All confirmations via `BpConfirmDialog`.
6. All monetary values stored as `number`. All dates as `"YYYY-MM-DD"` strings.
7. IDs via `crypto.randomUUID()` except Dexie `++id` tables (profile, budgets).

---

## Step 1 — Project Scaffold

Run exactly:

```bash
npm create vite@latest budgetpilot -- --template react-ts
cd budgetpilot
```

Install runtime dependencies:

```bash
npm install dexie dexie-react-hooks zustand \
  @nivo/pie @nivo/bar @nivo/line @nivo/heatmap \
  @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-slider \
  @radix-ui/react-switch @radix-ui/react-tooltip \
  react-hook-form zod @hookform/resolvers \
  date-fns papaparse motion \
  lucide-react \
  @types/papaparse
```

Attempt to install `lucide-react-dynamic`. If the package resolves and installs
successfully, add it to the dependency list. If it fails with a 404 or not-found
error, do NOT install it — the fallback is handled in Step 7. Record the outcome
in a comment at the top of `src/components/ui/AnimatedIcon.tsx`.

Install dev dependencies:

```bash
npm install -D vite-plugin-pwa vitest @vitest/ui jsdom \
  @testing-library/react @storybook/react-vite @storybook/addon-essentials \
  @storybook/addon-interactions storybook
```

Init shadcn/ui:

```bash
npx shadcn@latest init
```

When prompted:
- TypeScript: Yes
- Base color: Neutral
- CSS variables: Yes
- Components location: `src/components/ui`

Add shadcn components:

```bash
npx shadcn@latest add button input select dialog card badge slider switch tooltip
```

---

## Step 2 — vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'BudgetPilot',
        short_name: 'BudgetPilot',
        description: 'Privacy-first personal budget tracker',
        theme_color: '#14b8a6',
        background_color: '#040810',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

---

## Step 3 — src/types/index.ts

Create this file exactly. Do not add or remove fields.

```typescript
export type TransactionType = 'expense' | 'income'
export type AllocationGroup = 'needs' | 'wants' | 'savings'
export type ImportSource = 'manual' | 'csv'
export type ViewName =
  | 'dashboard'
  | 'transactions'
  | 'import'
  | 'budget'
  | 'debts'
  | 'settings'
  | 'export-import'

export interface BpProfile {
  id?: number
  name: string
  currency: string
  createdAt: string
}

export interface BpCategory {
  id: string
  name: string
  group: AllocationGroup
}

export interface BpBudget {
  id?: number
  month: string
  monthlyIncome: number
  allocation: {
    needs: number
    wants: number
    savings: number
  }
  categoryLimits: {
    categoryId: string
    limit: number
  }[]
}

export interface BpTransaction {
  id: string
  date: string
  amount: number
  type: TransactionType
  categoryId: string | null
  note: string
  importSource: ImportSource
}

export interface BpDebt {
  id: string
  name: string
  balance: number
  apr: number
  minPayment: number
}

export interface BpSetting {
  key: string
  value: unknown
}

export interface BpTheme {
  id: string
  name: string
  description: string
  version: string
  tokens: Record<string, string>
}

export interface BpCsvCategoryMap {
  normalizedDescription: string
  categoryId: string
}

// Derived / computed types used by hooks
export interface MonthlyTotals {
  totalIncome: number
  totalExpenses: number
  remaining: number
  savingsRate: number
}

export interface CategorySpend {
  spent: number
  limit: number
  pct: number
}

export interface DailySpendMap {
  [date: string]: number
}

export interface PayoffEntry {
  debtId: string
  debtName: string
  monthsToPayoff: number
  totalInterest: number
  payoffDate: string
}

export interface InterestComparison {
  totalInterestMethod: number
  totalInterestMinOnly: number
  saved: number
}
```

---

## Step 4 — src/lib/db.ts

```typescript
import Dexie, { type EntityTable } from 'dexie'
import type {
  BpProfile,
  BpBudget,
  BpTransaction,
  BpDebt,
  BpSetting,
  BpCsvCategoryMap,
} from '../types'

export class BudgetPilotDB extends Dexie {
  profile!: EntityTable<BpProfile, 'id'>
  budgets!: EntityTable<BpBudget, 'id'>
  transactions!: EntityTable<BpTransaction, 'id'>
  debts!: EntityTable<BpDebt, 'id'>
  settings!: EntityTable<BpSetting, 'key'>
  csvCategoryMap!: EntityTable<BpCsvCategoryMap, 'normalizedDescription'>

  constructor() {
    super('BudgetPilotDB')
    this.version(1).stores({
      profile: '++id',
      budgets: '++id, month',
      transactions: 'id, date, categoryId, importSource',
      debts: 'id',
      settings: 'key',
      csvCategoryMap: 'normalizedDescription',
    })
  }
}

export const db = new BudgetPilotDB()
```

---

## Step 5 — src/lib/settings.ts

```typescript
import { db } from './db'

export const Settings = {
  get: <T>(key: string): Promise<T | undefined> =>
    db.settings.get(key).then((r) => r?.value as T | undefined),
  set: (key: string, value: unknown): Promise<string> =>
    db.settings.put({ key, value }),
  delete: (key: string): Promise<void> =>
    db.settings.delete(key),
}
```

---

## Step 6 — src/lib/theme.ts

```typescript
import { BpTheme } from '../types'
import { Settings } from './settings'
import { z } from 'zod'

export const THEME_MIDNIGHT: BpTheme = {
  id: 'midnight',
  name: 'Midnight',
  description: 'Sleek dark dashboard. Elegant. Finance-grade.',
  version: '1.0',
  tokens: {
    '--bp-bg-base': '#040810',
    '--bp-bg-surface': '#070d1a',
    '--bp-bg-surface-alt': '#0a1220',
    '--bp-bg-overlay': 'rgba(0,0,0,0.72)',
    '--bp-border': '#1e293b',
    '--bp-border-strong': '#334155',
    '--bp-accent': '#14b8a6',
    '--bp-accent-muted': 'rgba(20,184,166,0.12)',
    '--bp-accent-glow': 'rgba(20,184,166,0.25)',
    '--bp-positive': '#14b8a6',
    '--bp-warning': '#f59e0b',
    '--bp-danger': '#ef4444',
    '--bp-positive-muted': 'rgba(20,184,166,0.1)',
    '--bp-warning-muted': 'rgba(245,158,11,0.1)',
    '--bp-danger-muted': 'rgba(239,68,68,0.1)',
    '--bp-text-primary': '#f1f5f9',
    '--bp-text-secondary': '#94a3b8',
    '--bp-text-muted': '#475569',
    '--bp-font-ui': "'DM Sans', system-ui, sans-serif",
    '--bp-font-mono': "'DM Mono', 'Courier New', monospace",
    '--bp-radius-sm': '6px',
    '--bp-radius-md': '10px',
    '--bp-radius-lg': '16px',
    '--bp-heat-none': '#0f172a',
    '--bp-heat-low': '#134e4a',
    '--bp-heat-mid': '#f59e0b',
    '--bp-heat-high': '#ef4444',
    '--bp-duration-fast': '150ms',
    '--bp-duration-normal': '300ms',
    '--bp-duration-slow': '600ms',
    '--bp-easing-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--bp-easing-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    '--bp-easing-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    '--bp-motion-intensity': '1',
    '--bp-sidebar-width-full': '240px',
    '--bp-sidebar-width-rail': '64px',
  },
}

const REQUIRED_TOKENS = [
  '--bp-bg-base',
  '--bp-accent',
  '--bp-text-primary',
  '--bp-border',
  '--bp-positive',
  '--bp-danger',
]

const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  tokens: z.record(z.string()).refine(
    (tokens) => REQUIRED_TOKENS.every((t) => t in tokens),
    { message: `Theme must include: ${REQUIRED_TOKENS.join(', ')}` }
  ),
})

export function applyTheme(theme: BpTheme): void {
  const root = document.documentElement
  Object.entries(theme.tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
  Settings.set('activeTheme', theme)
}

export function validateTheme(json: unknown): BpTheme | null {
  const result = ThemeSchema.safeParse(json)
  return result.success ? (result.data as BpTheme) : null
}
```

---

## Step 7 — src/lib/animation.ts

```typescript
export function getMotionConfig() {
  const style = getComputedStyle(document.documentElement)
  return {
    duration:
      parseFloat(style.getPropertyValue('--bp-duration-normal').trim()) / 1000,
    easing: style.getPropertyValue('--bp-easing-spring').trim(),
  }
}
```

---

## Step 8 — src/lib/schemas.ts

All Zod schemas used across the app. All forms and CSV validation import from here.

```typescript
import { z } from 'zod'
import { isValid, parseISO } from 'date-fns'

export const DateSchema = z.string().refine(
  (val) => isValid(parseISO(val)),
  { message: 'Invalid date. Expected YYYY-MM-DD.' }
)

export const TransactionSchema = z.object({
  date: DateSchema,
  amount: z.number({ invalid_type_error: 'Amount must be a number' })
    .positive({ message: 'Amount must be greater than 0' }),
  type: z.enum(['expense', 'income']),
  categoryId: z.string().min(1, 'Category is required'),
  note: z.string().optional().default(''),
})

export const DebtSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  balance: z.number().positive('Balance must be greater than 0'),
  apr: z.number().min(0, 'APR cannot be negative').max(100, 'APR seems too high'),
  minPayment: z.number().positive('Minimum payment must be greater than 0'),
})

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  currency: z.string().min(1, 'Currency symbol is required').max(3),
})

export const BackupSchema = z.object({
  formatVersion: z.string().optional(),
  tables: z.array(
    z.object({
      name: z.string(),
      rowCount: z.number(),
    })
  ).optional(),
  data: z.record(z.array(z.unknown())).optional(),
}).passthrough()

export const ThemeFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  tokens: z.record(z.string()),
})

export type TransactionFormValues = z.infer<typeof TransactionSchema>
export type DebtFormValues = z.infer<typeof DebtSchema>
export type ProfileFormValues = z.infer<typeof ProfileSchema>
```

---

## Step 9 — src/lib/defaults.ts

Single source of truth for default categories and CSV seed hydration.

```typescript
import { BpCategory, AllocationGroup } from '../types'

export const ONBOARDING_CATEGORIES: Omit<BpCategory, 'id'>[] = [
  // Needs
  { name: 'Housing',        group: 'needs' },
  { name: 'Groceries',      group: 'needs' },
  { name: 'Utilities',      group: 'needs' },
  { name: 'Transport',      group: 'needs' },
  { name: 'Health',         group: 'needs' },
  // Wants
  { name: 'Dining Out',     group: 'wants' },
  { name: 'Entertainment',  group: 'wants' },
  { name: 'Shopping',       group: 'wants' },
  { name: 'Personal Care',  group: 'wants' },
  // Savings
  { name: 'Emergency Fund', group: 'savings' },
  { name: 'Investments',    group: 'savings' },
  { name: 'Vacation Fund',  group: 'savings' },
]

// CSV seed: merchant keyword → intended category name (substring match at hydration)
// null values are replaced with real categoryIds during onboarding hydration
export const CSV_CATEGORY_SEED: Record<string, string | null> = {
  // Coffee → Dining Out
  starbucks: null, stbks: null, 'dunkin': null,
  'peets coffee': null, 'dutch bros': null,
  // Groceries
  'whole foods': null, wholefds: null, 'trader joes': null,
  kroger: null, safeway: null, 'walmart grocery': null,
  'target grocery': null, costco: null, aldi: null, publix: null,
  // Dining & Delivery → Dining Out
  doordash: null, 'uber eats': null, grubhub: null,
  instacart: null, chipotle: null, mcdonalds: null, 'chick-fil-a': null,
  // Transport
  uber: null, lyft: null, metro: null, transit: null,
  // Fuel → Transport
  shell: null, chevron: null, exxon: null, 'circle k': null,
  // Shopping
  amazon: null, amzn: null, ebay: null, etsy: null,
  // Entertainment (Subscriptions)
  netflix: null, spotify: null, 'apple com bill': null,
  'google storage': null, hulu: null, disney: null, 'youtube premium': null,
  // Health
  cvs: null, walgreens: null, 'rite aid': null,
  // Utilities & Telecom
  'at&t': null, verizon: null, 't-mobile': null,
  comcast: null, xfinity: null,
  // Transfers → (no default category — leave null after hydration)
  zelle: null, venmo: null, paypal: null,
}

// Mapping: seed keyword intent → which default category name to match against
// Used by hydrateCSVSeed() in categorize.ts
export const SEED_INTENT_MAP: Record<string, string> = {
  starbucks: 'Dining Out', stbks: 'Dining Out', dunkin: 'Dining Out',
  'peets coffee': 'Dining Out', 'dutch bros': 'Dining Out',
  'whole foods': 'Groceries', wholefds: 'Groceries', 'trader joes': 'Groceries',
  kroger: 'Groceries', safeway: 'Groceries', 'walmart grocery': 'Groceries',
  'target grocery': 'Groceries', costco: 'Groceries', aldi: 'Groceries', publix: 'Groceries',
  doordash: 'Dining Out', 'uber eats': 'Dining Out', grubhub: 'Dining Out',
  instacart: 'Groceries', chipotle: 'Dining Out', mcdonalds: 'Dining Out', 'chick-fil-a': 'Dining Out',
  uber: 'Transport', lyft: 'Transport', metro: 'Transport', transit: 'Transport',
  shell: 'Transport', chevron: 'Transport', exxon: 'Transport', 'circle k': 'Transport',
  amazon: 'Shopping', amzn: 'Shopping', ebay: 'Shopping', etsy: 'Shopping',
  netflix: 'Entertainment', spotify: 'Entertainment', 'apple com bill': 'Entertainment',
  'google storage': 'Entertainment', hulu: 'Entertainment', disney: 'Entertainment',
  'youtube premium': 'Entertainment',
  cvs: 'Health', walgreens: 'Health', 'rite aid': 'Health',
  'at&t': 'Utilities', verizon: 'Utilities', 't-mobile': 'Utilities',
  comcast: 'Utilities', xfinity: 'Utilities',
}
```

---

## Step 10 — src/store/useAppStore.ts

```typescript
import { create } from 'zustand'
import { format } from 'date-fns'
import { BpTheme } from '../types'
import { ViewName } from '../types'
import { THEME_MIDNIGHT } from '../lib/theme'

interface AppState {
  activeMonth: string
  activeView: ViewName
  activeTheme: BpTheme
  sidebarExpanded: boolean
  backupReminderShown: boolean
  setActiveMonth: (month: string) => void
  setActiveView: (view: ViewName) => void
  setActiveTheme: (theme: BpTheme) => void
  setSidebarExpanded: (expanded: boolean) => void
  setBackupReminderShown: (shown: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  activeMonth: format(new Date(), 'yyyy-MM'),
  activeView: 'dashboard',
  activeTheme: THEME_MIDNIGHT,
  sidebarExpanded: false,
  backupReminderShown: false,
  setActiveMonth: (month) => set({ activeMonth: month }),
  setActiveView: (view) => set({ activeView: view }),
  setActiveTheme: (theme) => set({ activeTheme: theme }),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  setBackupReminderShown: (shown) => set({ backupReminderShown: shown }),
}))
```

---

## Step 11 — src/main.tsx (Boot Sequence)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Settings } from './lib/settings'
import { applyTheme, THEME_MIDNIGHT } from './lib/theme'
import { BpTheme } from './types'

async function boot() {
  const storedTheme = await Settings.get<BpTheme>('activeTheme')
  applyTheme(storedTheme ?? THEME_MIDNIGHT)

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

boot()
```

---

## Step 12 — src/index.css (CSS Custom Properties)

Replace the default Vite CSS entirely. Define all `--bp-*` tokens on `:root` with
Midnight defaults as fallbacks (the JS boot sequence will override them):

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bp-bg-base: #040810;
  --bp-bg-surface: #070d1a;
  --bp-bg-surface-alt: #0a1220;
  --bp-bg-overlay: rgba(0,0,0,0.72);
  --bp-border: #1e293b;
  --bp-border-strong: #334155;
  --bp-accent: #14b8a6;
  --bp-accent-muted: rgba(20,184,166,0.12);
  --bp-accent-glow: rgba(20,184,166,0.25);
  --bp-positive: #14b8a6;
  --bp-warning: #f59e0b;
  --bp-danger: #ef4444;
  --bp-positive-muted: rgba(20,184,166,0.1);
  --bp-warning-muted: rgba(245,158,11,0.1);
  --bp-danger-muted: rgba(239,68,68,0.1);
  --bp-text-primary: #f1f5f9;
  --bp-text-secondary: #94a3b8;
  --bp-text-muted: #475569;
  --bp-font-ui: 'DM Sans', system-ui, sans-serif;
  --bp-font-mono: 'DM Mono', 'Courier New', monospace;
  --bp-radius-sm: 6px;
  --bp-radius-md: 10px;
  --bp-radius-lg: 16px;
  --bp-heat-none: #0f172a;
  --bp-heat-low: #134e4a;
  --bp-heat-mid: #f59e0b;
  --bp-heat-high: #ef4444;
  --bp-duration-fast: 150ms;
  --bp-duration-normal: 300ms;
  --bp-duration-slow: 600ms;
  --bp-easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --bp-easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --bp-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --bp-motion-intensity: 1;
  --bp-sidebar-width-full: 240px;
  --bp-sidebar-width-rail: 64px;
}

html, body, #root {
  height: 100%;
  background-color: var(--bp-bg-base);
  color: var(--bp-text-primary);
  font-family: var(--bp-font-ui);
  -webkit-font-smoothing: antialiased;
}

/* Monospace utility class */
.bp-mono {
  font-family: var(--bp-font-mono);
}
```

---

## Step 13 — Storybook Configuration

Create `.storybook/main.ts`:

```typescript
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: { name: '@storybook/react-vite', options: {} },
}

export default config
```

Create `.storybook/preview.ts`:

```typescript
import type { Preview } from '@storybook/react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'midnight',
      values: [{ name: 'midnight', value: '#040810' }],
    },
  },
}

export default preview
```

Add to `package.json` scripts:

```json
"storybook": "storybook dev -p 6006",
"storybook:build": "storybook build"
```

---

## Step 14 — Placeholder App.tsx

Create a minimal `src/App.tsx` that satisfies `tsc --noEmit`. Subsequent tasks
will replace this entirely in Task 1C.

```typescript
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
```

---

## Completion Gate

Run each check in order. Do not mark this task complete until all pass.

**Gate 1 — TypeScript**
```bash
npx tsc --noEmit
```
Must exit 0 with zero errors or warnings.

**Gate 2 — Vitest**
```bash
npx vitest run
```
No test files exist yet. Must exit 0 (not exit 1 "no test files found" — configure
`test.passWithNoTests: true` in vite.config.ts if needed).

**Gate 3 — Dev server**
```bash
npm run dev
```
Browser opens. Page renders "BudgetPilot" heading. No console errors.

**Gate 4 — Storybook**
```bash
npm run storybook
```
Storybook opens. No build errors.

**Gate 5 — Peer Review Checklist**

A second agent (or human reviewer) reads every file created in this task and
confirms the following. Output must be a written `REVIEW_TASK_0.md` file:

```markdown
# Peer Review — Task 0

- [ ] src/types/index.ts — all interfaces match Section 3 of the brief exactly
- [ ] src/lib/db.ts — Dexie indexes match brief schema rules (++id only for profile/budgets)
- [ ] src/lib/schemas.ts — TransactionSchema requires categoryId (not null)
- [ ] src/lib/theme.ts — all 34 CSS tokens present in THEME_MIDNIGHT
- [ ] src/lib/defaults.ts — ONBOARDING_CATEGORIES covers needs/wants/savings groups
- [ ] src/store/useAppStore.ts — no Dexie imports present
- [ ] src/main.tsx — theme applied before ReactDOM.createRoot
- [ ] src/index.css — all --bp-* tokens defined on :root
- [ ] No hardcoded hex color values in any .ts or .tsx file
- [ ] No localStorage or sessionStorage calls anywhere
- [ ] vite.config.ts has base: "./"

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes: [any issues found]
```
