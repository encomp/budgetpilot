# Task 3A — Debt Snowball Calculator View
**Phase:** 3 (Parallel with Tasks 3B and 3C)
**Requires:** All Phase 2 tasks complete
**Agent count:** 1

---

## Context

You are building the Debt Snowball Calculator view. This view has two signature
elements: the premium styled range slider (a key visual differentiator in the
product) and a live-updating payoff bar chart. Both must update in real time
as the extra payment slider moves.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Step 0 — Visual Reference (REQUIRED)

Fetch and study all three wireframes before writing any code:

```
Feature 5 — Debt Snowball:
https://github.com/encompp/budget-tracker/blob/main/images/feature_5_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_5_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_5_mobile.png
```

---

## Wireframe Spec — Debt Snowball (Feature 5, verbatim)

### Desktop (≥ 1024px)
High-fidelity debt forecaster with real-time payoff updates.
- **Header:** Toggle for "Snowball vs. Avalanche" and payoff metrics.
- **Top Area:** Summary metrics: total debt, interest saved, debt-free date.
- **Stack:** 40/60 split. Left: scrollable debt list. Right: large bar chart.
- **Navigation:** Horizontal "Extra Monthly Payment" slider under the chart
  with a teal glow. Bars re-animate as slider moves.

### Tablet (768–1023px)
Vertical-stack debt calculator.
- Payoff summary metrics centered.
- Full-width bar chart spanning the top.
- Large "Extra Monthly Payment" card with the premium slider.
- Below: 2-column grid of debt cards.
- 48px tall slider thumb.

### Mobile (< 768px)
Real-time payoff forecasting tool (390×844px).
- **Header:** Bold "Interest Saved" card at the top.
- **Top Area:** Simplified bar chart (years only).
- **Stack:** Scrollable debt cards followed by sticky "Extra Payment" slider
  at the bottom.
- **Interaction:** Moving the sticky slider updates the "Debt-Free Date" card
  instantly.
- 44×44px high-touch slider, high-contrast monospace dates.

---

## Implementation

### `src/components/DebtSlider.tsx`

This is the premium BpSlider variant extracted as a standalone named component
for clarity and Storybook visibility. It IS the `BpSlider` premium variant —
just re-exported with a descriptive name.

```typescript
interface DebtSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
  currencySymbol?: string
}
```

Display:
- Label above the slider (e.g. "Extra Monthly Payment")
- Current value displayed in large monospace below label
  (e.g. `$200 / month`)
- The slider itself uses `BpSlider` with `variant="premium"`

The premium slider spec (reminder from Task 1A):
- Thumb: 44×44px, `var(--bp-accent)` background
- Active: `transform: scale(1.15)` + `box-shadow: 0 0 0 8px var(--bp-accent-muted)`
- All transitions: `var(--bp-duration-fast) var(--bp-easing-spring)`

**Storybook story:** Show DebtSlider at $0, $200, $500, and in active/dragging
state (mocked with `:active` pseudo-class via Storybook's interaction addon).

### `src/views/Debts.tsx`

**State (all local to this view, no Zustand needed):**
```typescript
const [method, setMethod] = useState<'snowball' | 'avalanche'>('snowball')
const [extraPayment, setExtraPayment] = useState(0)
const [addingDebt, setAddingDebt] = useState(false)
const [editingDebtId, setEditingDebtId] = useState<string | null>(null)
```

**Debt list:**
Each debt renders as a `BpCard` with: name, balance (monospace), APR, min payment,
edit icon, delete icon (`BpConfirmDialog`). On mobile: 2-column grid. On desktop:
single scrollable column (left 40%).

**Add/Edit debt form:**
`BpModal` with React Hook Form + `DebtSchema`. Fields: name, balance (`BpInput`
mono), APR, min payment. On save: `db.debts.add/update(...)`.

**Snowball / Avalanche toggle:**
Two `BpButton` variants, active one becomes `primary`. Switching method
immediately recalculates.

**Calculation (runs on every change to debts, extraPayment, or method):**
```typescript
const debts = useDebtList()
const payoffSchedule = useMemo(() => {
  if (!debts.length) return []
  return method === 'snowball'
    ? calculateSnowball(debts, extraPayment)
    : calculateAvalanche(debts, extraPayment)
}, [debts, extraPayment, method])

const interestComparison = useMemo(() =>
  debts.length
    ? calculateInterestSaved(debts, extraPayment, method)
    : { totalInterestMethod: 0, totalInterestMinOnly: 0, saved: 0 }
, [debts, extraPayment, method])
```

**Summary metrics (top):**
- Total Debt: sum of all balances (monospace, large)
- Interest Saved: `interestComparison.saved` in `var(--bp-positive)`
- Debt-Free Date: `payoffSchedule[payoffSchedule.length - 1]?.payoffDate`

**Bar chart (`@nivo/bar`):**
- Data: one bar per debt, x = debt name, y = monthsToPayoff
- Theme via `useNivoTheme()`
- `animate={true}`, Nivo's `motionConfig="wobbly"` for spring entrance
- Chart re-renders automatically via `useMemo` recalculation

**DebtSlider:**
- `min={0}` `max={Math.max(500, totalDebt * 0.1)}` `step={25}`
- On desktop: below the chart
- On mobile: sticky at bottom (`position: sticky`, `bottom: 0`,
  `background: var(--bp-bg-base)`, padding above tab bar)

**Empty state:**
If `debts.length === 0`: `BpEmptyState` with heading "No debts tracked yet" and
action button "Add Your First Debt".

---

## Completion Gate

**Gate 1 — TypeScript:** `npx tsc --noEmit` → zero errors.

**Gate 2 — Storybook:** DebtSlider story shows all states. `npm run storybook:build` exits 0.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_3A.md`:

```markdown
# Peer Review — Task 3A

Visual verification:
- [ ] Desktop: 40/60 split (debt list / chart), summary metrics at top
- [ ] Mobile: "Interest Saved" card at top, sticky slider at bottom
- [ ] DebtSlider thumb is visibly large (44px), glow ring appears on active
- [ ] Storybook story shows premium slider in active state

Calculation verification:
- [ ] Switching snowball → avalanche reorders the bar chart immediately
- [ ] Adjusting slider updates both chart AND interest-saved callout
- [ ] Zero debts shows BpEmptyState
- [ ] useMemo correctly rebuilds on debts + extraPayment + method changes

Token verification:
- [ ] Zero hardcoded hex in DebtSlider or Debts.tsx
- [ ] DebtSlider active glow uses var(--bp-accent-muted), not inline rgba

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```

---
---

# Task 3B — Export / Import View
**Phase:** 3 (Parallel with Tasks 3A and 3C)
**Requires:** All Phase 2 tasks complete
**Agent count:** 1

---

## Context

You are building the JSON backup/restore system and the Export/Import view.
This is a safety-critical feature — getting it wrong means users can lose all
their data. The peer review for this task requires a full backup/restore cycle test.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Implementation

### `src/views/ExportImport.tsx`

**Auto-backup reminder (runs on mount, once per session):**
```typescript
useEffect(() => {
  const checkBackup = async () => {
    if (backupReminderShown) return
    const lastExport = await Settings.get<string>('lastExport')
    if (!lastExport) return
    const daysSince = differenceInDays(new Date(), parseISO(lastExport))
    if (daysSince > 7) {
      showToast('Your last backup was over a week ago. Consider exporting.', 'bell')
      setBackupReminderShown(true)
    }
  }
  checkBackup()
}, [])
```

**Export section:**
`BpCard` with heading "Export Data". Body text explaining what's included.
"Export Backup" `BpButton` primary.

```typescript
const handleExport = async () => {
  const blob = await db.export({ prettyJson: true })
  const filename = `budgetpilot-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  await Settings.set('lastExport', format(new Date(), 'yyyy-MM-dd'))
  showToast('Backup exported successfully.', 'success')
}
```

**Import section:**
`BpCard` with heading "Restore from Backup". Warning text: "Restoring a backup
will replace ALL current data."

File picker (`<input type="file" accept=".json">`). On file select:
1. Read file as text
2. Parse JSON
3. Validate with `BackupSchema` from `src/lib/schemas.ts`
4. If invalid: `showToast('Invalid backup file.', 'error')`. Stop.
5. If valid: show `BpModal` with preview:
   - Export date (from file metadata if present)
   - Table count and row counts
   - Warning: "This will permanently replace your current data."
6. Modal footer: "Restore" `BpButton` danger variant + "Cancel" ghost
7. On confirm: `await db.import(file, { overwriteEachTable: true })` → reload

**Last export status:**
Below the export button, show when data was last exported:
```typescript
const lastExport = await Settings.get<string>('lastExport')
// Display: "Last exported: April 28, 2026" or "Never exported"
```

### App-level backup reminder integration

In `App.tsx`, on mount (after onboarding check), call the same backup check logic.
Use `backupReminderShown` from Zustand to ensure it only fires once per session
and only after the user has exported at least once.

---

## Completion Gate

**Gate 1 — TypeScript:** `npx tsc --noEmit` → zero errors.

**Gate 2 — Full backup cycle:**
Manually execute:
1. Add 3 transactions via the entry form
2. Navigate to Export/Import → export → verify `.json` file downloads
3. Navigate to Settings → Clear All Data → confirm
4. Navigate to Export/Import → import the downloaded file
5. Navigate to Dashboard → verify the 3 transactions are restored

All 5 steps must pass.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_3B.md`:

```markdown
# Peer Review — Task 3B

Export verification:
- [ ] Filename format: budgetpilot-backup-YYYY-MM-DD.json
- [ ] File downloads without error
- [ ] Settings.lastExport is updated after export
- [ ] "Last exported" status shows correct date after export

Import verification:
- [ ] Invalid JSON shows error toast, does not crash or modify DB
- [ ] Valid file shows preview modal with table/row counts
- [ ] Restore requires confirmation (BpConfirmDialog)
- [ ] After restore: page reloads, all data is present

Backup reminder:
- [ ] Bell toast fires if lastExport > 7 days ago
- [ ] Bell toast uses AnimatedIcon BellRing
- [ ] Reminder shows maximum once per session (backupReminderShown flag)
- [ ] Reminder does NOT fire if user has never exported (no lastExport setting)

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```

---
---

# Task 3C — Polish + Integration Pass
**Phase:** 3 (Parallel with Tasks 3A and 3B)
**Requires:** All Phase 2 tasks complete
**Agent count:** 1
**Note:** This task is READ-MOSTLY. It adds missing polish across existing views.
Do not refactor working logic. Only add what's listed.

---

## Context

You are doing the integration pass — filling gaps left by the feature-focused tasks.
No new features. All changes are additive and isolated.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Step 0 — Visual Reference

Study all wireframes for all 7 features to identify any visual inconsistencies:

```
All features:
https://github.com/encompp/budget-tracker/blob/main/images/feature_1_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_1_mobile.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_mobile.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_3_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_3_mobile.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_4_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_4_mobile.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_5_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_5_mobile.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_6_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_6_mobile.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_7_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_7_mobile.png
```

File any visual discrepancies found as annotated `// POLISH:` comments in code,
then fix them.

---

## Checklist of Changes

**Empty states:**
Verify `BpEmptyState` is rendered when list is empty in each of these views.
If missing, add it.
- [ ] Dashboard: recent transactions list empty → "No transactions yet. Add your first one."
- [ ] Transactions: table empty → "No transactions found. Try adjusting your filters."
- [ ] Import: preview table empty after parsing → "No rows found in this CSV."
- [ ] Debts: debt list empty → "No debts tracked yet." (already done in 3A — verify)
- [ ] Budget: categories list empty → "Add categories to start tracking spending."

**Source badges:**
Verify `BpBadge` source labels ("CSV" or "Manual") are present on transaction
rows in ALL views where transactions appear:
- [ ] Dashboard recent transactions list
- [ ] Transactions table
- [ ] Import preview table (show "CSV" on all rows as they're about to be imported)

**Uncategorized badges:**
Verify amber `BpBadge` "Uncategorized" appears on `categoryId === null` rows:
- [ ] Transactions view table
- [ ] Import view preview table (before user assigns categories)
- [ ] Dashboard recent transactions list

**Loading spinners:**
Verify `AnimatedIcon LoaderCircle` shows during async operations:
- [ ] CSV import: during PapaParse processing + categorization
- [ ] Export: briefly during `db.export()` (if takes > 200ms)
- [ ] Import restore: during `db.import()`

**View transition:**
In `App.tsx`, verify the view container has a CSS opacity transition between
view switches. If not present, add:
```css
.view-container {
  transition: opacity var(--bp-duration-normal) var(--bp-easing-default);
}
```

**Mobile bottom tab bar:**
Verify all 4 tabs navigate correctly. Active tab icon color is `var(--bp-accent)`.
Inactive is `var(--bp-text-muted)`. No 5th tab overflow.

**PWA manifest verification:**
Open `vite.config.ts`. Confirm `icon-192.png` and `icon-512.png` are referenced
in the VitePWA manifest configuration. Do NOT generate these files — user will
supply them. Add a comment: `// PWA icons to be supplied by user before build`.

**Typography consistency:**
Audit all currency and percentage values across all views. Any value that is
a monetary amount or percentage should use `font-family: var(--bp-font-mono)`.
Add `className="bp-mono"` (defined in `index.css`) wherever missing.

**Border and radius consistency:**
Verify all `BpCard` instances use border-radius `var(--bp-radius-md)`.
Verify all modals use `var(--bp-radius-lg)`.
Verify all badges use `var(--bp-radius-sm)`.
Any hardcoded `border-radius` values found: replace with the appropriate variable.

---

## Completion Gate

**Gate 1 — TypeScript:** `npx tsc --noEmit` → zero errors.

**Gate 2 — Full visual walkthrough:**
Open the app and step through every view at:
- Desktop (1440px)
- Tablet (768px)
- Mobile (390px, using DevTools device emulation)

For each breakpoint, confirm: no empty states missing, no badges missing,
correct fonts on all numbers, no hardcoded colors found via DevTools computed
styles.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_3C.md`:

```markdown
# Peer Review — Task 3C

Empty states:
- [ ] Dashboard recent txns empty → BpEmptyState visible
- [ ] Transactions table empty → BpEmptyState visible
- [ ] Import preview empty → BpEmptyState visible
- [ ] Debts list empty → BpEmptyState visible
- [ ] Budget categories empty → BpEmptyState visible

Badges:
- [ ] Source badge (CSV/Manual) on every transaction row in Dashboard
- [ ] Source badge on every transaction row in Transactions view
- [ ] Amber "Uncategorized" on categoryId=null rows in Transactions
- [ ] Amber "Uncategorized" on uncategorized rows in Import preview

Loading states:
- [ ] LoaderCircle shows during CSV processing in Import view
- [ ] LoaderCircle shows during db.import() restore

Layout:
- [ ] View transition opacity animation plays between view switches
- [ ] Mobile bottom tab bar: active tab is teal, all 4 tabs work
- [ ] PWA icon references present in vite.config.ts

Typography:
- [ ] All currency values use var(--bp-font-mono) across all views
- [ ] All percentage values use var(--bp-font-mono)

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes: [list any POLISH: comments found and whether they were resolved]
```

---
---

# Task 4 — QA Gate + Final Build Verification
**Phase:** 4 (Sequential — runs after all Phase 3 tasks pass their completion gates)
**Requires:** Tasks 3A, 3B, 3C all have PASS peer reviews
**Agent count:** 1

---

## Context

You are the final QA agent. Your job is to run a complete end-to-end verification
of the BudgetPilot app and produce a `QA_REPORT.md` that either clears the build
for packaging or files specific failures back to the responsible task agents.

Do not fix bugs yourself. Document them precisely and clearly so the responsible
agent can action them.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md
Wireframes: https://github.com/encompp/budget-tracker/blob/main/budgetpilot-wireframes.md

---

## QA Protocol

Run each step in order. Mark PASS or FAIL. On FAIL: note the exact behavior,
expected behavior, and which task is responsible.

### Gate 1 — Static Analysis

```bash
npx tsc --noEmit
```
Expected: exit 0, zero errors.

```bash
npx vitest run
```
Expected: all tests green, exit 0.

```bash
npm run storybook:build
```
Expected: exit 0.

```bash
npm run build
```
Expected: exit 0, `dist/` folder generated.

---

### Gate 2 — Fresh App Boot

Open `dist/index.html` directly in Chrome (no dev server).

- [ ] App loads without console errors (open DevTools → Console)
- [ ] Midnight theme applies immediately (no flash of unstyled content)
- [ ] Onboarding modal appears (first boot, no IndexedDB data)
- [ ] Network tab shows zero external requests after initial load
- [ ] Service worker registers (DevTools → Application → Service Workers)

---

### Gate 3 — Onboarding Flow

- [ ] Step A: enter name "Test User", currency "$" → Next
- [ ] Step B: income $5,000, adjust sliders (verify always sum to 100%) → Next
- [ ] Step C: "Get Started" closes modal
- [ ] Dashboard loads as default view
- [ ] Reloading the app does NOT show onboarding again

---

### Gate 4 — Transaction Entry

- [ ] Click `+` FAB → entry modal opens
- [ ] Submit with amount = 0 → validation error shown, no save
- [ ] Submit with no category → validation error, no save
- [ ] Submit valid expense: $45.99, Groceries, today → saved, Dashboard updates
- [ ] Submit valid income: $3,500, any category, today → saved, Income card updates
- [ ] Transactions view shows both entries with correct source badge "Manual"
- [ ] Dashboard recent transactions list shows both entries

---

### Gate 5 — CSV Import (Chase)

Prepare this CSV content, save as `test-chase.csv`:
```
Transaction Date,Post Date,Description,Category,Type,Amount,Memo
04/15/2026,04/16/2026,STARBUCKS #12345,Food & Drink,Sale,-5.75,
04/14/2026,04/15/2026,WHOLE FOODS #890,Groceries,Sale,-87.43,
04/13/2026,04/13/2026,PAYCHECK DIRECT DEP,Income,Payment,3500.00,
04/12/2026,04/12/2026,NETFLIX.COM,Entertainment,Sale,-15.99,
04/10/2026,04/10/2026,UNKNOWN MERCHANT XYZ,Other,Sale,-23.50,
```

- [ ] Navigate to Import → upload `test-chase.csv`
- [ ] Toast: "Chase detected" fires automatically
- [ ] Stage 3 preview table shows 5 rows
- [ ] STARBUCKS, WHOLE FOODS, NETFLIX rows have category auto-assigned
- [ ] UNKNOWN MERCHANT XYZ shows amber "Uncategorized" badge
- [ ] PAYCHECK shows `type: income`
- [ ] "Import 5 Transactions" → success toast
- [ ] Redirect to Transactions view, filtered to this import batch
- [ ] All 5 rows show source badge "CSV"

---

### Gate 6 — CSV Import (Unknown Bank)

Prepare `test-unknown.csv`:
```
TXN_DATE,MERCHANT_NAME,DEBIT_AMT
2026-04-15,Coffee Shop,5.75
2026-04-14,Grocery Store,45.99
```

- [ ] Upload → no bank detected toast
- [ ] Manual mapping UI appears with header cards
- [ ] Assign: TXN_DATE → Date, MERCHANT_NAME → Description, DEBIT_AMT → Amount
- [ ] Preview table shows 2 rows
- [ ] Import completes successfully

---

### Gate 7 — Budget Planner

- [ ] Navigate to Budget
- [ ] Monthly income shows $5,000 from onboarding
- [ ] Three sliders sum to 100%
- [ ] Move "Needs" slider → Wants and Savings adjust proportionally → still 100%
- [ ] Add a category "Coffee" to Wants group → appears with $0/$0 progress bar
- [ ] Set limit $50 → progress bar shows $0 of $50
- [ ] Go back to Dashboard, add a $15 "Coffee" expense → return to Budget
- [ ] Coffee progress bar now shows $15 of $50 (30%)

---

### Gate 8 — Debt Snowball

- [ ] Navigate to Debts → BpEmptyState visible
- [ ] Add debt: "Visa", $3,000 balance, 19.99% APR, $60 min payment
- [ ] Add debt: "Car Loan", $8,500 balance, 6.5% APR, $200 min payment
- [ ] Bar chart renders with 2 bars
- [ ] Snowball toggle: Visa listed first (lower balance)
- [ ] Avalanche toggle: Visa listed first (higher APR)
- [ ] Move extra payment slider to $300 → chart updates, Debt-Free Date changes
- [ ] Interest Saved callout is positive number

---

### Gate 9 — Theme Upload

- [ ] Navigate to Settings → Appearance
- [ ] 5-color swatch strip visible
- [ ] Create a test theme JSON file:
```json
{
  "id": "test-rose",
  "name": "Test Rose",
  "description": "Test theme",
  "version": "1.0",
  "tokens": {
    "--bp-bg-base": "#1a0010",
    "--bp-bg-surface": "#2d0018",
    "--bp-bg-surface-alt": "#3d0020",
    "--bp-bg-overlay": "rgba(0,0,0,0.72)",
    "--bp-border": "#5c0030",
    "--bp-border-strong": "#800040",
    "--bp-accent": "#f472b6",
    "--bp-accent-muted": "rgba(244,114,182,0.12)",
    "--bp-accent-glow": "rgba(244,114,182,0.25)",
    "--bp-positive": "#14b8a6",
    "--bp-warning": "#f59e0b",
    "--bp-danger": "#ef4444",
    "--bp-positive-muted": "rgba(20,184,166,0.1)",
    "--bp-warning-muted": "rgba(245,158,11,0.1)",
    "--bp-danger-muted": "rgba(239,68,68,0.1)",
    "--bp-text-primary": "#fdf2f8",
    "--bp-text-secondary": "#fbcfe8",
    "--bp-text-muted": "#9d174d",
    "--bp-font-ui": "'DM Sans', system-ui, sans-serif",
    "--bp-font-mono": "'DM Mono', 'Courier New', monospace",
    "--bp-radius-sm": "6px",
    "--bp-radius-md": "10px",
    "--bp-radius-lg": "16px",
    "--bp-heat-none": "#3d0020",
    "--bp-heat-low": "#134e4a",
    "--bp-heat-mid": "#f59e0b",
    "--bp-heat-high": "#ef4444",
    "--bp-duration-fast": "150ms",
    "--bp-duration-normal": "300ms",
    "--bp-duration-slow": "600ms",
    "--bp-easing-default": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--bp-easing-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
    "--bp-easing-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    "--bp-motion-intensity": "1",
    "--bp-sidebar-width-full": "240px",
    "--bp-sidebar-width-rail": "64px"
  }
}
```
- [ ] Drop valid theme → Preview Panel slides in from right
- [ ] Preview panel shows pink/rose colors (not current Midnight)
- [ ] "Apply Theme" → app-wide color changes to rose
- [ ] Reload app → rose theme persists (loaded from Dexie settings)
- [ ] "Reset to Midnight" → Midnight theme restores

- [ ] Drop invalid theme (missing `--bp-danger`) → error toast fires, no crash
- [ ] Drop a non-JSON file (.txt) → error toast fires, no crash

---

### Gate 10 — Export / Import Cycle

- [ ] Export → `budgetpilot-backup-YYYY-MM-DD.json` downloads
- [ ] `Settings.lastExport` is today's date
- [ ] Navigate to Settings → Clear All Data → confirm
- [ ] Dashboard shows empty states
- [ ] Navigate to Export/Import → import the downloaded file → confirm
- [ ] Page reloads
- [ ] All transactions, budget, and debts are restored
- [ ] Dashboard shows correct data

---

### Gate 11 — Responsive Layout Verification

Using Chrome DevTools device emulation:

**Mobile (390×844px):**
- [ ] Bottom tab bar visible, no left sidebar
- [ ] FAB is above bottom tab bar by 16px
- [ ] Heatmap tooltip shows on tap, auto-dismisses in 3 seconds
- [ ] Entry modal opens as bottom sheet with numeric keypad
- [ ] Budget view: collapsible accordion groups
- [ ] Debt slider: sticky at bottom of screen

**Tablet (768px):**
- [ ] 64px icon rail visible
- [ ] Chevron expands sidebar to full width with Motion One animation
- [ ] Overlay backdrop appears behind expanded sidebar

**Desktop (1440px):**
- [ ] 240px full labeled sidebar
- [ ] Dashboard: 60/40 heatmap/donut split
- [ ] Debts: 40/60 debt-list/chart split

---

### Gate 12 — PWA Install Check

```bash
npx serve dist
```

Open `http://localhost:3000` in Chrome:
- [ ] PWA install prompt appears in address bar
- [ ] Note: icon files are placeholders until supplied by user — this is expected

---

## QA Report Output

Create `QA_REPORT.md` in the repo root:

```markdown
# BudgetPilot QA Report

Date: [date]
Agent: [agent ID]
Build: [git commit or "local"]

## Summary
- Gates passed: [N] / 12
- Total checks: [N] / [total]
- Status: READY FOR PACKAGING / REQUIRES FIXES

## Results

### Gate 1 — Static Analysis: PASS / FAIL
[notes]

### Gate 2 — Fresh App Boot: PASS / FAIL
[notes]

[... repeat for all 12 gates ...]

## Failures Requiring Fix

### [Gate N] — [Issue title]
- **Symptom:** [exact behavior observed]
- **Expected:** [what should happen per spec]
- **Responsible task:** Task [N]
- **Suggested fix:** [brief direction]

## Sign-off
Build is [ READY FOR PACKAGING / NOT READY — see failures above ]
```

If all gates pass: proceed to package `dist/` as described in Section 7 of the brief.
If any gate fails: do NOT package. File failures to responsible agents and await
fix confirmation before re-running QA.
