# Task 1B — Business Logic Layer + Data Hooks
**Phase:** 1 (Parallel with Tasks 1A and 1C)
**Requires:** Task 0 complete
**Agent count:** 1
**Estimated scope:** 8 pure logic files + 1 test suite + 7 hooks

---

## Context

You are building the entire non-UI brain of BudgetPilot. This task has two layers:

**Layer 1 — `src/lib/`**: Pure TypeScript functions. No React. No Dexie. No side
effects. These are the calculation and CSV-parsing engines.

**Layer 2 — `src/hooks/`**: Data access hooks. React + `useLiveQuery` only. These
wrap Dexie queries and return typed, ready-to-render data to view components.

Absolutely no JSX in any file this task produces.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Absolute Rules

1. `src/lib/` files: zero React imports, zero Dexie imports, zero side effects.
   Pure input → output functions only.
2. `src/hooks/` files: zero JSX, zero shadcn imports, zero business logic.
   `useLiveQuery` + data transformation only.
3. All monetary math uses `number`. Never format to string inside logic functions.
4. All date handling via `date-fns`. Never `new Date()` in stored values.
5. Vitest tests must cover every exported function in `calculations.ts`.

---

## Layer 1A — `src/lib/calculations.ts`

Pure financial math. No imports except `date-fns` for date arithmetic.

### `calculateAllocation`
```typescript
export function calculateAllocation(
  income: number,
  splits: { needs: number; wants: number; savings: number }
): { needs: number; wants: number; savings: number }
```
Validates splits sum to 100 (±0.01 tolerance for float drift). Returns currency
amounts by multiplying income × (split / 100). Throws if splits don't sum to 100.

### `calculateSnowball`
```typescript
export function calculateSnowball(
  debts: BpDebt[],
  extraPayment: number
): PayoffEntry[]
```
Sort debts by balance ascending (tiebreak: name alphabetically). Apply extra
payment to lowest balance first while making minimum payments on all others.
Returns array of `PayoffEntry` in payoff order. Each entry includes months to
payoff, total interest paid, and payoff date (from today using `addMonths`).

### `calculateAvalanche`
```typescript
export function calculateAvalanche(
  debts: BpDebt[],
  extraPayment: number
): PayoffEntry[]
```
Same as snowball but sort by APR descending (tiebreak: name alphabetically).

### `calculateMonthlyPayoff`
```typescript
export function calculateMonthlyPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number
): { months: number; totalInterest: number; schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] }
```
Standard amortization: monthly rate = APR / 12 / 100. Each period: interest =
balance × monthlyRate, principal = payment − interest, balance -= principal.
Stop when balance ≤ 0. Cap at 600 months (50 years) to prevent infinite loops.

### `calculateInterestSaved`
```typescript
export function calculateInterestSaved(
  debts: BpDebt[],
  extraPayment: number,
  method: 'snowball' | 'avalanche'
): InterestComparison
```
Run the chosen method with `extraPayment`. Run again with `extraPayment = 0`
(minimum-only). Sum total interest across all debts for each scenario.
Return `{ totalInterestMethod, totalInterestMinOnly, saved }`.

### `clampAllocationSliders`
```typescript
export function clampAllocationSliders(
  changed: 'needs' | 'wants' | 'savings',
  newValue: number,
  current: { needs: number; wants: number; savings: number }
): { needs: number; wants: number; savings: number }
```
When one slider is moved, the remaining two adjust proportionally to maintain
sum = 100. If one of the remaining two is at 0, the other absorbs the full change.
Returns the new three-value object, always summing to 100.

---

## Layer 1B — `src/lib/calculations.test.ts`

Full Vitest suite. Must pass `vitest run` with all tests green.

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateAllocation,
  calculateSnowball,
  calculateAvalanche,
  calculateMonthlyPayoff,
  calculateInterestSaved,
  clampAllocationSliders,
} from './calculations'

describe('calculateAllocation', () => {
  it('50/30/20 split on $5000', () => {
    const result = calculateAllocation(5000, { needs: 50, wants: 30, savings: 20 })
    expect(result.needs).toBe(2500)
    expect(result.wants).toBe(1500)
    expect(result.savings).toBe(1000)
  })
  it('custom split sums to 100', () => {
    const result = calculateAllocation(4000, { needs: 60, wants: 25, savings: 15 })
    expect(result.needs + result.wants + result.savings).toBeCloseTo(4000)
  })
  it('throws when splits do not sum to 100', () => {
    expect(() =>
      calculateAllocation(5000, { needs: 50, wants: 30, savings: 30 })
    ).toThrow()
  })
})

describe('calculateSnowball', () => {
  const debts = [
    { id: 'a', name: 'Card A', balance: 3000, apr: 15, minPayment: 60 },
    { id: 'b', name: 'Card B', balance: 1000, apr: 22, minPayment: 25 },
    { id: 'c', name: 'Card C', balance: 2000, apr: 18, minPayment: 40 },
  ]
  it('orders by lowest balance first', () => {
    const result = calculateSnowball(debts, 0)
    expect(result[0].debtId).toBe('b')
    expect(result[1].debtId).toBe('c')
    expect(result[2].debtId).toBe('a')
  })
  it('with extra payment reduces total months', () => {
    const withExtra = calculateSnowball(debts, 200)
    const withoutExtra = calculateSnowball(debts, 0)
    const maxWithExtra = Math.max(...withExtra.map(e => e.monthsToPayoff))
    const maxWithout = Math.max(...withoutExtra.map(e => e.monthsToPayoff))
    expect(maxWithExtra).toBeLessThan(maxWithout)
  })
  it('tiebreak by name alphabetically', () => {
    const tieDebts = [
      { id: 'x', name: 'Zebra', balance: 500, apr: 10, minPayment: 20 },
      { id: 'y', name: 'Alpha', balance: 500, apr: 20, minPayment: 20 },
    ]
    const result = calculateSnowball(tieDebts, 0)
    expect(result[0].debtId).toBe('y') // Alpha before Zebra
  })
})

describe('calculateAvalanche', () => {
  const debts = [
    { id: 'a', name: 'Card A', balance: 3000, apr: 15, minPayment: 60 },
    { id: 'b', name: 'Card B', balance: 1000, apr: 22, minPayment: 25 },
    { id: 'c', name: 'Card C', balance: 2000, apr: 18, minPayment: 40 },
  ]
  it('orders by highest APR first', () => {
    const result = calculateAvalanche(debts, 0)
    expect(result[0].debtId).toBe('b') // 22% first
    expect(result[1].debtId).toBe('c') // 18% second
    expect(result[2].debtId).toBe('a') // 15% last
  })
})

describe('calculateMonthlyPayoff', () => {
  it('known amortization result: $1000 at 12% APR with $100/month', () => {
    const result = calculateMonthlyPayoff(1000, 12, 100)
    // 10.75 months to pay off $1000 at 1%/mo with $100 payment
    expect(result.months).toBeGreaterThanOrEqual(10)
    expect(result.months).toBeLessThanOrEqual(12)
    expect(result.totalInterest).toBeGreaterThan(0)
    expect(result.totalInterest).toBeLessThan(100)
  })
  it('single month payoff when payment > balance', () => {
    const result = calculateMonthlyPayoff(500, 12, 600)
    expect(result.months).toBe(1)
  })
  it('caps at 600 months', () => {
    // $10000 at 24% APR with minimum $200/month (interest ≈ $200) — barely pays down
    const result = calculateMonthlyPayoff(10000, 24, 201)
    expect(result.months).toBeLessThanOrEqual(600)
  })
})

describe('calculateInterestSaved', () => {
  const debts = [
    { id: 'a', name: 'Card A', balance: 2000, apr: 20, minPayment: 50 },
    { id: 'b', name: 'Card B', balance: 3000, apr: 15, minPayment: 60 },
  ]
  it('extra payment reduces interest vs minimum-only', () => {
    const result = calculateInterestSaved(debts, 200, 'snowball')
    expect(result.saved).toBeGreaterThan(0)
    expect(result.totalInterestMethod).toBeLessThan(result.totalInterestMinOnly)
  })
  it('zero extra payment results in zero savings', () => {
    const result = calculateInterestSaved(debts, 0, 'avalanche')
    expect(result.saved).toBeCloseTo(0)
  })
})

describe('clampAllocationSliders', () => {
  it('changing needs adjusts wants and savings proportionally', () => {
    const result = clampAllocationSliders(
      'needs', 60, { needs: 50, wants: 30, savings: 20 }
    )
    expect(result.needs).toBe(60)
    expect(result.wants + result.savings).toBeCloseTo(40)
  })
  it('always sums to 100', () => {
    const result = clampAllocationSliders(
      'savings', 35, { needs: 50, wants: 30, savings: 20 }
    )
    expect(result.needs + result.wants + result.savings).toBeCloseTo(100)
  })
  it('when one other slider is 0, the remaining absorbs the full delta', () => {
    const result = clampAllocationSliders(
      'needs', 70, { needs: 50, wants: 50, savings: 0 }
    )
    expect(result.needs).toBe(70)
    expect(result.savings).toBe(0)
    expect(result.wants).toBeCloseTo(30)
  })
})
```

---

## Layer 1C — CSV Library

### `src/lib/csv/fingerprints.ts`

```typescript
import { BpTransaction } from '../../types'

export interface BankMapping {
  date: string
  amount: string
  description: string
  creditColumn?: string
}

export interface BankFingerprint {
  bank: string
  headers: string[]
  mapping: BankMapping
}

export const BANK_FINGERPRINTS: BankFingerprint[] = [
  {
    bank: 'Chase',
    headers: ['transaction date', 'post date', 'description', 'category', 'type', 'amount', 'memo'],
    mapping: { date: 'transaction date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Bank of America',
    headers: ['date', 'description', 'amount', 'running bal.'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Wells Fargo',
    headers: ['date', 'amount', 'asterisk', 'check number', 'description'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Citi',
    headers: ['date', 'description', 'debit', 'credit'],
    mapping: { date: 'date', amount: 'debit', description: 'description', creditColumn: 'credit' },
  },
  {
    bank: 'Capital One',
    headers: ['transaction date', 'posted date', 'card no.', 'description', 'category', 'debit', 'credit'],
    mapping: { date: 'transaction date', amount: 'debit', description: 'description', creditColumn: 'credit' },
  },
  {
    bank: 'American Express',
    headers: ['date', 'description', 'amount'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'Discover',
    headers: ['trans. date', 'post date', 'description', 'amount', 'category'],
    mapping: { date: 'trans. date', amount: 'amount', description: 'description' },
  },
  {
    bank: 'USAA',
    headers: ['date', 'description', 'original description', 'category', 'amount', 'status'],
    mapping: { date: 'date', amount: 'amount', description: 'description' },
  },
]

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim()
}

export function detectBank(rawHeaders: string[]): BankFingerprint | null {
  const normalized = rawHeaders.map(normalizeHeader)
  for (const fp of BANK_FINGERPRINTS) {
    const allMatch = fp.headers.every((h) => normalized.includes(h))
    if (allMatch) return fp
  }
  return null
}
```

### `src/lib/csv/heuristics.ts`

```typescript
export interface HeuristicMapping {
  date?: string
  amount?: string
  description?: string
  credit?: string
}

interface FieldHeuristic {
  headerPatterns: RegExp[]
  valuePattern: RegExp | null
}

const HEURISTICS: Record<string, FieldHeuristic> = {
  date: {
    headerPatterns: [/date/i, /time/i, /posted/i, /transaction/i],
    valuePattern: /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/,
  },
  amount: {
    headerPatterns: [/amount/i, /debit/i, /charge/i, /withdrawal/i, /sum/i],
    valuePattern: /^-?[\$£€]?\d+(\.\d{1,2})?$/,
  },
  credit: {
    headerPatterns: [/credit/i, /deposit/i, /payment/i],
    valuePattern: /^[\$£€]?\d+(\.\d{1,2})?$/,
  },
  description: {
    headerPatterns: [/desc/i, /memo/i, /merchant/i, /payee/i, /name/i, /narrative/i],
    valuePattern: null,
  },
}

function sampleMatches(
  header: string,
  rows: Record<string, string>[],
  pattern: RegExp
): boolean {
  const sample = rows.slice(0, 5)
  const matches = sample.filter((r) => pattern.test((r[header] ?? '').trim()))
  return matches.length >= 3
}

export function heuristicMap(
  headers: string[],
  sampleRows: Record<string, string>[]
): HeuristicMapping {
  const mapping: HeuristicMapping = {}
  const normalized = headers.map((h) => h.toLowerCase().trim())

  for (const [field, heuristic] of Object.entries(HEURISTICS)) {
    // Try header pattern match first
    const matchedIdx = normalized.findIndex((h) =>
      heuristic.headerPatterns.some((p) => p.test(h))
    )
    if (matchedIdx !== -1) {
      mapping[field as keyof HeuristicMapping] = headers[matchedIdx]
      continue
    }
    // Fall back to value sampling
    if (heuristic.valuePattern) {
      const sampledHeader = headers.find((h) =>
        sampleMatches(h, sampleRows, heuristic.valuePattern!)
      )
      if (sampledHeader) {
        mapping[field as keyof HeuristicMapping] = sampledHeader
      }
    }
  }

  return mapping
}

export function isMappingComplete(mapping: HeuristicMapping): boolean {
  return !!(mapping.date && mapping.amount && mapping.description)
}
```

### `src/lib/csv/categorize.ts`

```typescript
import { CSV_CATEGORY_SEED, SEED_INTENT_MAP } from '../defaults'
import { BpCategory } from '../../types'

export function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
}

export function lookupCategory(
  description: string,
  categoryMap: Record<string, string>
): string | null {
  const norm = normalize(description)
  const entry = Object.entries(categoryMap).find(
    ([key]) => norm.includes(key) || key.includes(norm)
  )
  return entry?.[1] ?? null
}

/**
 * Hydrates CSV_CATEGORY_SEED null values with actual categoryIds.
 * Called once during onboarding after categories are created.
 * Matching strategy: SEED_INTENT_MAP gives the intended category name,
 * we find the user category whose name contains that string (case-insensitive).
 */
export function hydrateCSVSeed(
  userCategories: BpCategory[]
): Record<string, string> {
  const hydrated: Record<string, string> = {}

  for (const [key] of Object.entries(CSV_CATEGORY_SEED)) {
    const intentName = SEED_INTENT_MAP[key]
    if (!intentName) continue

    const match = userCategories.find((c) =>
      c.name.toLowerCase().includes(intentName.toLowerCase()) ||
      intentName.toLowerCase().includes(c.name.toLowerCase())
    )

    if (match) {
      hydrated[key] = match.id
    }
  }

  return hydrated
}
```

---

## Layer 2 — Data Hooks (`src/hooks/`)

All hooks use `useLiveQuery` from `dexie-react-hooks`. Return typed data.
No JSX. No component imports. No shadcn imports.

### `src/hooks/useMonthlyTotals.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { MonthlyTotals } from '../types'

export function useMonthlyTotals(month: string): MonthlyTotals {
  return useLiveQuery(async () => {
    const txns = await db.transactions
      .where('date').startsWith(month)
      .toArray()

    const totalIncome = txns
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = txns
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const remaining = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0

    return { totalIncome, totalExpenses, remaining, savingsRate }
  }, [month], { totalIncome: 0, totalExpenses: 0, remaining: 0, savingsRate: 0 })!
}
```

### `src/hooks/useCategorySpend.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { CategorySpend } from '../types'

export function useCategorySpend(month: string, categoryId: string): CategorySpend {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    const limit = budget?.categoryLimits.find(cl => cl.categoryId === categoryId)?.limit ?? 0

    const txns = await db.transactions
      .where('date').startsWith(month)
      .filter(t => t.categoryId === categoryId && t.type === 'expense')
      .toArray()

    const spent = txns.reduce((sum, t) => sum + t.amount, 0)
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0

    return { spent, limit, pct }
  }, [month, categoryId], { spent: 0, limit: 0, pct: 0 })!
}
```

### `src/hooks/useMonthCategories.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { BpCategory } from '../types'
import { ONBOARDING_CATEGORIES } from '../lib/defaults'

export function useMonthCategories(month: string): BpCategory[] {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    if (!budget) return []
    return budget.categoryLimits.map(cl => ({
      id: cl.categoryId,
      name: '',  // to be joined — see note below
      group: 'needs' as const,
    }))
    // Note: category names are stored on the budget's categoryLimits embedded data.
    // The actual BpCategory objects with names come from the budget record itself.
    // Refactor: store categories with names in the budget record.
    // For MVP, return the categoryLimits array enriched with a name lookup from
    // a static map stored alongside the budget. See budget hook for full pattern.
  }, [month], [])!
}
```

> **Implementation note for `useMonthCategories`:** The schema stores `categoryLimits`
> as `{ categoryId, limit }[]` without names. To return full `BpCategory` objects,
> you need category names. Add a `categories: BpCategory[]` field to `BpBudget`
> in `src/types/index.ts` (coordinate with the Task 0 type definition — or handle
> by storing `BpCategory[]` on the budget record when it is created during onboarding
> and budget CRUD). This is the correct MVP pattern — do not create a separate
> categories Dexie table.

### `src/hooks/useDailySpend.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { DailySpendMap } from '../types'

export function useDailySpend(month: string): DailySpendMap {
  return useLiveQuery(async () => {
    const txns = await db.transactions
      .where('date').startsWith(month)
      .filter(t => t.type === 'expense')
      .toArray()

    return txns.reduce<DailySpendMap>((map, t) => {
      map[t.date] = (map[t.date] ?? 0) + t.amount
      return map
    }, {})
  }, [month], {})!
}
```

### `src/hooks/useRecentTransactions.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { BpTransaction } from '../types'

export function useRecentTransactions(month: string, limit = 8): BpTransaction[] {
  return useLiveQuery(async () => {
    return db.transactions
      .where('date').startsWith(month)
      .reverse()
      .sortBy('date')
      .then(txns => txns.slice(0, limit))
  }, [month, limit], [])!
}
```

### `src/hooks/useDebtList.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { BpDebt } from '../types'

export function useDebtList(): BpDebt[] {
  return useLiveQuery(() => db.debts.toArray(), [], [])!
}
```

### `src/hooks/useActiveBudget.ts`
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { BpBudget } from '../types'
import { ONBOARDING_CATEGORIES } from '../lib/defaults'

export function useActiveBudget(month: string): BpBudget | null {
  return useLiveQuery(async () => {
    const budget = await db.budgets.where('month').equals(month).first()
    if (budget) return budget

    // Fallback: if no budget exists for this month, return a default structure
    // (does NOT write to DB — that happens in Budget view on first edit)
    return {
      month,
      monthlyIncome: 0,
      allocation: { needs: 50, wants: 30, savings: 20 },
      categoryLimits: ONBOARDING_CATEGORIES.map(c => ({
        categoryId: crypto.randomUUID(),
        limit: 0,
      })),
    } as BpBudget
  }, [month], null)!
}
```

### Hooks barrel — `src/hooks/index.ts`
```typescript
export { useMonthlyTotals } from './useMonthlyTotals'
export { useCategorySpend } from './useCategorySpend'
export { useMonthCategories } from './useMonthCategories'
export { useDailySpend } from './useDailySpend'
export { useRecentTransactions } from './useRecentTransactions'
export { useDebtList } from './useDebtList'
export { useActiveBudget } from './useActiveBudget'
```

---

## Completion Gate

**Gate 1 — TypeScript**
```bash
npx tsc --noEmit
```
Zero errors.

**Gate 2 — Vitest**
```bash
npx vitest run
```
All tests green. Every `describe` block passes.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_1B.md`:

```markdown
# Peer Review — Task 1B

Logic verification:
- [ ] calculateSnowball test: lowest balance is ordered first
- [ ] calculateAvalanche test: highest APR is ordered first
- [ ] clampAllocationSliders: always sums to 100 in all test cases
- [ ] calculateMonthlyPayoff: capped at 600 months
- [ ] calculateInterestSaved: zero extra = zero saved

CSV library verification:
- [ ] detectBank: Chase fingerprint matches correctly
- [ ] heuristicMap: returns complete mapping for a standard CSV with date/amount/description columns
- [ ] normalize: lowercases, trims, removes special characters, collapses spaces
- [ ] hydrateCSVSeed: "starbucks" maps to a "Dining Out" category

Hooks verification:
- [ ] Zero JSX in any hook file
- [ ] Zero shadcn imports in any hook file
- [ ] Every hook provides a default value as third useLiveQuery argument
- [ ] useActiveBudget falls back to defaults without writing to DB

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```

---
---

# Task 1C — App Shell + Responsive Layout + Onboarding
**Phase:** 1 (Parallel with Tasks 1A and 1B)
**Requires:** Task 0 complete; Task 1A components must be available (coordinate timing)
**Agent count:** 1
**Estimated scope:** App.tsx, Sidebar, Onboarding, routing shell

---

## Context

You are building the structural frame the entire app lives inside: the responsive
three-breakpoint layout, the navigation sidebar, and the 3-step onboarding flow
that runs on first launch.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Step 0 — Visual Reference (REQUIRED)

Fetch and study these wireframe images before writing any code:

**Onboarding flow (Feature 7):**
```
https://github.com/encomp/budget-tracker/blob/main/images/feature_7_desktop.png
https://github.com/encomp/budget-tracker/blob/main/images/feature_7_tablet.png
https://github.com/encompm/budget-tracker/blob/main/images/feature_7_mobile.png
```

**Dashboard (Feature 1) — for sidebar and shell context:**
```
https://github.com/encomp/budget-tracker/blob/main/images/feature_1_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_1_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_1_mobile.png
```

Study carefully:
- Feature 7 desktop: centered 800×600px onboarding card, 3-dot stepper at top,
  income input + 50/30/20 sliders as the primary centerpiece
- Feature 7 tablet: 90% width card, oversized sliders, large "Next" button
- Feature 7 mobile: full-screen, single-column, large teal "Continue" button
  fixed to the bottom 16px margin
- Feature 1 desktop: 240px fixed sidebar on the left, 7 nav items labeled
- Feature 1 tablet: 64px icon rail on the left, chevron toggle at top
- Feature 1 mobile: bottom tab bar with 4 icons, no left sidebar

---

## Wireframe Spec — Onboarding (Feature 7, verbatim from wireframes doc)

### Desktop (≥ 1024px)
A cinematic, centered 800×600px setup card. Header: welcome title with a 3-dot
stepper. Top area: "Expected Income" input field. Stack: linked 50/30/20 sliders
as the primary centerpiece of the card. Motion One "Fade + Slide" transitions
between steps. Professional, clean aesthetic on a dark background.

### Tablet (768px – 1023px)
Onboarding card occupies 90% of the screen width. Centered progress indicator.
Income input field. Oversized sliders. 64px icon rail hidden during onboarding.
Large "Next" button.

### Mobile (< 768px)
Full-screen native onboarding experience (390×844px). 3-dot progress indicator
at the top center. Step-specific title (e.g., "Set Your Foundation"). Single-column
inputs followed by large stacked sliders for allocation. Large teal "Continue"
button fixed to the bottom of the screen with a 16px margin. Step 3 features
large tappable theme preview cards.

---

## Wireframe Spec — Navigation Shell (Feature 1, verbatim from wireframes doc)

### Desktop (≥ 1024px)
Fixed 240px sidebar on the left (`var(--bp-sidebar-width-full)`). Floating teal
`+` button in the bottom-right corner with a subtle outer glow.

### Tablet (768–1023px)
64px left rail (`var(--bp-sidebar-width-rail)`). Chevron icon at the top triggers
a Motion One slide-out menu.

### Mobile (< 768px)
Bottom tab bar. 4 distinct icons (Home, Transactions, Budget, Settings). No left
sidebar. Floating `+` Add button 16px above the bottom tab bar on the right side.

---

## Motion One Usage

This task uses exactly **two** of the four permitted Motion One interactions:

1. **Onboarding step transitions** — slide + fade between Step A → B → C
2. **Sidebar expand/collapse on tablet** — width animates from rail to full overlay

Both must call `getMotionConfig()` from `src/lib/animation.ts` to read duration
and easing from CSS variables at runtime. No hardcoded durations.

---

## Implementation

### `src/App.tsx`

Replace the placeholder created in Task 0.

```typescript
// App.tsx responsibilities:
// 1. Check onboardingCompleted on mount — show Onboarding if false
// 2. Render three-breakpoint layout based on window width (use useMediaQuery or CSS)
// 3. Render the active view from useAppStore.activeView
// 4. Render floating + Add Transaction FAB (visible on all views)
// 5. Render BpToast via useToast()
```

Three-breakpoint layout strategy: use CSS media queries via a `useBreakpoint()`
hook that returns `'desktop' | 'tablet' | 'mobile'`.

```typescript
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react'

type Breakpoint = 'desktop' | 'tablet' | 'mobile'

export function useBreakpoint(): Breakpoint {
  const getBreakpoint = (): Breakpoint => {
    if (window.innerWidth >= 1024) return 'desktop'
    if (window.innerWidth >= 768) return 'tablet'
    return 'mobile'
  }
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint)
  useEffect(() => {
    const handler = () => setBp(getBreakpoint())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return bp
}
```

View routing: use a simple record map — no React Router needed for MVP.

```typescript
const VIEW_MAP: Record<ViewName, React.ReactNode> = {
  dashboard: <Dashboard />,
  transactions: <Transactions />,
  import: <Import />,
  budget: <Budget />,
  debts: <Debts />,
  settings: <Settings />,
  'export-import': <ExportImport />,
}
```

All view components are stubs for now (placeholder `<div>View name</div>`). They
will be replaced by Tasks 2A–3B. Import them from `src/views/index.ts`.

View container CSS: `opacity` transition using `var(--bp-duration-normal)
var(--bp-easing-default)` between view switches.

### `src/components/Sidebar.tsx`

Three visual states: full (labeled, desktop), rail (icon-only, tablet), hidden (mobile).

Nav items (in order):
```
Dashboard    — Home icon
Transactions — ArrowLeftRight icon
Import       — Upload icon
Budget       — PieChart icon
Debts        — CreditCard icon
Settings     — Settings icon
Export/Import— Download icon
```

Active item styling: background `var(--bp-accent-muted)`, text + icon `var(--bp-accent)`,
left border `2px solid var(--bp-accent)`.
Inactive: text `var(--bp-text-secondary)`, icon same.

Rail mode (tablet): show only icons, no labels, 64px width.
Chevron button at top of rail triggers Motion One expand to full sidebar overlay.
The overlay has `z-index: 100`, backdrop `var(--bp-bg-overlay)`.

Mobile: return `null` — navigation is via the bottom tab bar.

### `src/components/BottomTabBar.tsx`

Mobile-only. 4 tabs: Dashboard, Transactions, Budget, Settings (Settings doubles
as the entry point for all secondary views on mobile).

Height: 64px. Background: `var(--bp-bg-surface)`. Border-top: `var(--bp-border)`.
Active icon: `var(--bp-accent)`. Inactive: `var(--bp-text-muted)`.

### `src/views/Onboarding.tsx`

3-step flow rendered as a `BpModal` with `size="lg"` (or full-screen on mobile
via a CSS override when `breakpoint === 'mobile'`).

**Step A — "Set Your Foundation"**
- Name input (`BpInput`)
- Currency symbol input (`BpInput`, default "$")
- On Next: validate with `ProfileSchema` → write `db.profile.add({ name, currency, createdAt: format(new Date(), 'yyyy-MM-dd') })`

**Step B — "Plan Your Month"**
- Monthly income input (`BpInput` mono variant)
- Three linked `BpSlider` (standard variant) for needs/wants/savings
- Sliders always sum to 100 via `clampAllocationSliders` from calculations.ts
- Show currency amounts below each slider (e.g. "Needs: $2,500")
- On Next:
  1. Create `BpCategory` entries with IDs for all `ONBOARDING_CATEGORIES`
  2. Write `db.budgets.add({ month: currentMonth, monthlyIncome, allocation, categoryLimits, categories })`
  3. Call `hydrateCSVSeed(createdCategories)` → bulk write results to `db.csvCategoryMap`

**Step C — "Choose Your Look"**
- Heading: "Your dashboard is ready."
- Subtext: "The default Midnight theme is applied. You can upload custom theme packs in Settings anytime."
- Large preview swatch strip showing Midnight accent colors
- Single "Get Started" button → `Settings.set('onboardingCompleted', true)` → close modal

Step transitions use Motion One (interaction #2): outgoing step slides left + fades
out, incoming step slides from right + fades in. Duration and easing from `getMotionConfig()`.

**Dot stepper**: 3 dots, active dot filled with `var(--bp-accent)`, inactive with
`var(--bp-border-strong)`. Clicking dots does not navigate (forward-only flow).

### View stubs — `src/views/`

Create stub files for all 7 views. Tasks 2A–3B will replace these.

```typescript
// src/views/Dashboard.tsx
export default function Dashboard() {
  return <div style={{ padding: '2rem', color: 'var(--bp-text-primary)' }}>Dashboard — coming in Task 2A</div>
}
// Repeat pattern for: Transactions, Import, Budget, Debts, Settings, ExportImport
```

`src/views/index.ts` barrel-exports all 7.

---

## Completion Gate

**Gate 1 — TypeScript**
```bash
npx tsc --noEmit
```
Zero errors.

**Gate 2 — Dev server**
```bash
npm run dev
```
- App loads without console errors
- Three breakpoints render correct layout (test by resizing browser)
- Onboarding modal appears on fresh load (no `onboardingCompleted` setting)
- Completing Step A → B → C dismisses the modal
- All 7 nav items navigate to their stub views
- Floating `+` FAB is visible on all views

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_1C.md`:

```markdown
# Peer Review — Task 1C

Layout verification:
- [ ] ≥1024px: 240px sidebar visible, labeled nav items
- [ ] 768–1023px: 64px icon rail, chevron expands to full sidebar with Motion One
- [ ] <768px: bottom tab bar visible, no sidebar, FAB above tab bar

Onboarding verification:
- [ ] Step A validates name + currency before proceeding
- [ ] Step B sliders always sum to 100%
- [ ] Step B writes to db.budgets and db.csvCategoryMap on Next
- [ ] Step C shows Midnight swatch, "Get Started" closes modal
- [ ] Step transitions use Motion One (not CSS transitions)
- [ ] After completion: Settings.onboardingCompleted = true, modal does not reappear on reload

Motion One verification:
- [ ] Exactly 2 Motion One usages: onboarding steps + sidebar expand
- [ ] Both read getMotionConfig() — no hardcoded durations

Token verification:
- [ ] No hardcoded colors or hex values in Sidebar, BottomTabBar, or Onboarding
- [ ] Active nav item uses --bp-accent tokens correctly

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```
