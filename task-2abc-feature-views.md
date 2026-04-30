# Task 2A — Dashboard View + Transaction Entry Form
**Phase:** 2 (Parallel with Tasks 2B and 2C)
**Requires:** All Phase 1 tasks complete
**Agent count:** 1
**Estimated scope:** Dashboard.tsx, HeatmapCalendar.tsx, transaction modal

---

## Context

You are building the default landing view of BudgetPilot. This view must make the
app's value obvious at a glance: financial health summary, the signature heatmap
calendar, and a donut chart — all updating in real time as transactions are added.

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Step 0 — Visual Reference (REQUIRED)

Fetch and study all six wireframes before writing any code:

```
Feature 1 — Dashboard:
https://github.com/encomp/budget-tracker/blob/main/images/feature_1_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_1_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_1_mobile.png

Feature 2 — Transaction Entry Form:
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_mobile.png
```

---

## Wireframe Spec — Dashboard (Feature 1, verbatim)

### Desktop (≥ 1024px)
1440×900px, dark "Midnight" theme, maximum data density, professional multi-column.
- **Header:** "Dashboard" title in `--bp-text-primary` with a month-picker dropdown
  ("April 2026") and a "Last Export" status badge.
- **Top Area:** Four equal cards using `--bp-bg-surface` showing "Income,"
  "Expenses," "Remaining Balance" ($1,800.00), and "Savings Rate" (36%) in
  monospace font.
- **Middle row:** 60/40 split. Left: "Spending Heatmap" month-grid (7×5 rounded
  squares) with a hovered cell showing a detailed tooltip. Right: interactive
  Donut Chart.
- **Bottom area:** Full-width "Recent Transactions" table.
- **Navigation:** Fixed 240px sidebar. Floating teal `+` button bottom-right.

### Tablet (768px – 1023px)
Portrait mode, balanced layout, high-efficiency navigation rail.
- **Header:** Centered title "Dashboard" with month-picker (`< April 2026 >`).
- **Top Area:** 2×2 grid of metric cards (Income/Expenses top, Balance/Savings bottom).
- **Stack:** Full-width Heatmap center. Below it, Donut Chart and simplified list
  of 4 transactions (Date, Category, Amount) stack vertically.
- **Navigation:** 64px left rail. Tapping a heatmap cell reveals tooltip for 3 seconds.

### Mobile (< 768px)
390×844px portrait, single integrated screen, dark Midnight theme, continuous
vertical scroll, native PWA feel.
- **Header:** Centered month-navigation widget (`< APRIL 2026 >`). Below: "Last
  Export: 2d ago" in muted smaller font.
- **Remaining Balance Card:** Top of stack, 120px tall. Large `$1,800.00` in
  monospace with glowing teal trend sparkline on the right.
- **Three metric cards:** Income, Expenses, Savings Rate below the balance card.
- **Spending Heatmap:** Full-width centerpiece. 7 columns (Sun–Sat), 5 rows.
  Rounded squares (`--bp-radius-sm`). One red cell active with dark teal tooltip
  anchored directly above it.
- **Recent Activity List:** Section header + three transaction cards. Each card:
  Merchant Name + Amount (top line), Category Badge + Date (bottom line).
- **FAB:** Circular teal `+ Add` button (44×44px), 16px above bottom tab bar.
- **Token callouts visible:** base screen, card container, display typography,
  active component color, interactive heatmap cell.

---

## Wireframe Spec — Transaction Entry Form (Feature 2, verbatim)

### Desktop (≥ 1024px)
Data-management screen with high-density table and a centered `Dialog` modal for
"Add Transaction" with a segmented Expense/Income toggle. Left sidebar navigation.
Monospaced numbers, teal badges, deep surface color for table rows.

### Tablet (768–1023px)
"Add Transaction" dialog widened to 80% viewport width with 48px tall input targets.

### Mobile (< 768px)
Full-screen surface-colored sheet (`--bp-bg-surface`) slid up from the bottom.
- **Upper Half:** Massive 48pt currency input (`$0.00`) centered at top in monospace.
  Below it: sleek segmented toggle for "Expense" vs "Income" with active state
  in `--bp-accent-active` (Teal).
- **Lower Half:** Oversized integrated numeric keypad (0–9, dot, backspace). Large
  keys with 16px corner radiuses.
- **Persistent bottom tab bar** visible at very bottom, entry sheet sits above it.
- **"Add" button** prominent primary action in top-right corner of the sheet.

---

## Implementation

### `src/components/HeatmapCalendar.tsx`

This is the signature widget of BudgetPilot. Implement with precision.

```typescript
interface HeatmapCalendarProps {
  month: string  // "YYYY-MM"
}
```

**Grid construction:**
- Use `date-fns`: `startOfMonth`, `endOfMonth`, `eachDayOfInterval`, `getDay`
  to build the 7×5 or 7×6 grid
- Empty cells before the first day and after the last day render as transparent spacers

**Cell coloring (use ONLY CSS variables — no hex values):**
- No spend on day: background `var(--bp-heat-none)`
- Spend < daily budget: `var(--bp-heat-low)`
- Spend = daily budget (within 5%): `var(--bp-heat-mid)`
- Spend > daily budget: `var(--bp-heat-high)`
- Daily budget = `monthlyBudget / daysInMonth` from `useActiveBudget`

**Cell transitions:**
- `background-color: var(--bp-duration-normal) var(--bp-easing-default)`

**Tooltip behavior:**
- Desktop: hover → show tooltip
- Mobile/touch: `onTouchStart` → show tooltip, `setTimeout(dismiss, 3000)`, CSS
  `opacity` fade on dismiss. Tooltip anchors above cell by default; if cell is
  in the top 2 rows, flip to below.
- Tooltip content: `"Apr 16"`, `"$125.00 Total"`, category breakdown (top 3
  categories by spend that day)
- Tooltip styling: `var(--bp-bg-surface)`, `var(--bp-border)`, `var(--bp-radius-md)`

**Data:** Consumes `useDailySpend(month)` and `useActiveBudget(month)`.

**Storybook story:** Render with mock data covering all four heat states. Show
a month where some days are none/low/mid/high.

### `src/views/Dashboard.tsx`

**Summary cards (top row):**
Each is a `BpCard` with a number that count-up animates on mount.
Count-up implementation:
```typescript
function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}
```

Cards: Income (var(--bp-positive)), Expenses (var(--bp-danger)), Remaining
(var(--bp-text-primary)), Savings Rate (var(--bp-accent)). All currency values
use `BpInput` mono class (or inline `font-family: var(--bp-font-mono)`).

**Donut chart:**
`@nivo/pie` with `animate={true}`, spring entrance via Nivo's built-in `motionConfig="wobbly"`.
Theme via `useNivoTheme()`. Data: per-category expense totals from `useDailySpend`
+ `useMonthCategories`. Clicking a slice sets a local `filteredCategoryId` state
that filters the recent transactions list below.

**Recent transactions list:**
Last 8 from `useRecentTransactions(month, 8)`. Per row: date, category name
`BpBadge` (default variant), description (truncated 30 chars), amount (monospace,
red for expense / teal for income), source `BpBadge` (csv or manual). Edit and
delete icons per row. Delete uses `BpConfirmDialog`.

**Month-picker:** A `<` / `>` navigation that updates `activeMonth` in Zustand.
Format display as "April 2026".

**Last Export badge:** Reads `Settings.get('lastExport')` and shows relative
time (e.g. "Last Export: 2d ago") in a `BpBadge muted` variant.

### Transaction entry modal

The floating `+ Add Transaction` FAB is rendered in `App.tsx` (already done in
Task 1C). It toggles a `transactionModalOpen` boolean in Zustand (add this field).

The modal itself: `BpModal` size="md" (full-screen override on mobile).
Mobile: render as a bottom sheet — fixed, bottom 0, width 100%, border-radius
`var(--bp-radius-lg) var(--bp-radius-lg) 0 0`, with the numeric keypad as
described in the wireframe.

Form: React Hook Form + `TransactionSchema`.
- Date: `BpInput` type="date", default `format(new Date(), 'yyyy-MM-dd')`
- Amount: `BpInput` mono variant, numeric
- Type toggle: two `BpButton` ghost variants, active one becomes primary
- Category: `BpSelect` options from `useMonthCategories(activeMonth)`
- Note: `BpInput` optional

On save: `db.transactions.add({ id: crypto.randomUUID(), ...values, importSource: 'manual' })`
Show `AnimatedIcon CheckCircle` success toast via `useToast()`.

---

## Completion Gate

**Gate 1 — TypeScript:** `npx tsc --noEmit` → zero errors.

**Gate 2 — Storybook:** `HeatmapCalendar.stories.tsx` renders all four heat
states with mock data. `npm run storybook:build` exits 0.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_2A.md`:

```markdown
# Peer Review — Task 2A

Visual verification against wireframes:
- [ ] Desktop: 4 metric cards in equal-width top row, 60/40 heatmap/donut split
- [ ] Tablet: 2×2 metric card grid, full-width heatmap
- [ ] Mobile: Remaining Balance card is 120px tall with sparkline, FAB 16px above tab bar
- [ ] Mobile entry sheet: slides up from bottom, 48pt currency input, numeric keypad visible

Heatmap verification:
- [ ] All 4 heat states use only var(--bp-heat-*) — zero hardcoded colors
- [ ] Tooltip appears on hover (desktop) and touch (mobile, auto-dismisses 3s)
- [ ] Tooltip flips below cell when in top 2 rows
- [ ] Cell colors change in real time when a transaction is added

Transaction form verification:
- [ ] Form rejects: amount ≤ 0, invalid date, missing category
- [ ] On save: transaction appears in recent list without page reload
- [ ] AnimatedIcon CheckCircle toast fires on success
- [ ] Mobile: numeric keypad renders, sheet slides up from bottom

Token verification:
- [ ] Zero hardcoded hex in Dashboard.tsx or HeatmapCalendar.tsx
- [ ] Count-up uses requestAnimationFrame (not setTimeout)

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```

---
---

# Task 2B — Budget Planner View + Settings View
**Phase:** 2 (Parallel with Tasks 2A and 2C)
**Requires:** All Phase 1 tasks complete
**Agent count:** 1

---

## Step 0 — Visual Reference (REQUIRED)

Fetch and study these wireframes before writing any code:

```
Feature 3 — Budget Planner:
https://github.com/encompp/budget-tracker/blob/main/images/feature_3_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_3_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_3_mobile.png

Feature 6 — Theme Engine / Settings:
https://github.com/encompp/budget-tracker/blob/main/images/feature_6_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_6_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_6_mobile.png
```

---

## Wireframe Spec — Budget Planner (Feature 3, verbatim)

### Desktop (≥ 1024px)
Budget planning screen focusing on strategic income allocation and comparison.
- **Header:** Month-picker next to a large "Expected Monthly Income" input field.
- **Top Area:** Three linked horizontal range sliders: "Needs (50%)", "Wants (30%)",
  "Savings (20%)".
- **Stack:** Three vertical columns, one per group, each containing categories
  with progress bars showing "Spent vs. Limit". Adjusting sliders dynamically
  updates group currency values. "Add Category" buttons at bottom of each column.
  Teal progress bars for healthy; amber/red for over-limit.

### Tablet (768–1023px)
- Centered income input. 2×2 grid: income input and three allocation sliders.
- "Needs" and "Wants" groups side-by-side; "Savings" spans full width below.
- Large block-style "Add Category" buttons for touch accuracy.

### Mobile (< 768px)
Sequential, thumb-friendly budget setup (390×844px).
- Sticky top card showing "Income Left to Assign" in teal.
- Three large stacked sliders with 44×44px hit areas and teal thumbs.
- Budget groups (Needs, Wants, Savings) are collapsible accordions.
- Tapping a category opens inline edit mode where the keypad appears.

---

## Wireframe Spec — Theme Engine / Settings (Feature 6, verbatim)

### Desktop (≥ 1024px)
Theme engine dashboard showing swatches and live mockup previews.
- **Header:** "Appearance" settings title.
- **Top Area:** Active theme card with its 5-color swatch strip.
- **Stack:** Dashed-border "Upload Zone" next to a "Theme Preview Panel" showing
  a mini dashboard mockup. Drag-and-drop file upload. "Apply" and "Reset" buttons.

### Tablet (768–1023px)
Card-based appearance settings. Full-width active theme card with swatches.
Large dashed upload area followed by theme mockup preview below it.

### Mobile (< 768px)
List-to-detail settings interface. "Settings" title. Appearance sub-menu item.
Tapping "Appearance" slides in a full-screen manager with large "Apply" and
"Reset" buttons (44px height). Large "Upload Theme" button.

---

## Implementation

### `src/views/Budget.tsx`

**Month selector:** `< / >` navigation, same as Dashboard. Updates `activeMonth`.

**Income input:** `BpInput` mono variant. On blur/enter → `db.budgets.update()`.

**Allocation sliders (3 linked sliders):**
- Use `BpSlider` standard variant for each of needs/wants/savings
- Local state for all three values
- On any slider change: call `clampAllocationSliders` from calculations.ts, update
  all three slider values simultaneously
- Display currency amount below each slider:
  `${currency}${Math.round(income × pct / 100).toLocaleString()}`
- On change settled (onMouseUp / onTouchEnd): persist to DB

**Category CRUD per group:**
Each group (needs/wants/savings) is a column (desktop) or collapsible accordion
(mobile). Per category:
- `BpProgressBar` with `useCategorySpend(month, categoryId)` data
- Category name (inline editable on click — `BpInput` auto-focuses)
- Limit input (monospace, right-aligned)
- Delete button (icon, triggers `BpConfirmDialog`)
- "Add Category" `BpButton` ghost variant at the bottom of each group

**Creating a new month:**
When user navigates to a month with no existing budget:
1. Look for the most recent prior month's budget
2. If found: copy its `categories` and `categoryLimits` as defaults (with limits
   reset to 0)
3. If not found: use `ONBOARDING_CATEGORIES`
4. Show a toast: "New month created. Customize your budget below."

### `src/views/Settings.tsx`

Three sections, each in a `BpCard`:

**Section 1 — Profile**
React Hook Form + `ProfileSchema`. Fields: name, currency symbol. On save:
`db.profile.put(...)`. Show success toast.

**Section 2 — Appearance**

This is the theme engine UI. This is **Motion One interaction #3** (theme
preview panel slides in from right).

Layout:
- Active theme name as heading
- 5-color swatch strip: render 5 small circles using current CSS var values:
  `--bp-accent`, `--bp-positive`, `--bp-warning`, `--bp-danger`, `--bp-bg-surface-alt`
- Drag-and-drop zone: dashed border `var(--bp-border)`, background `var(--bp-bg-surface-alt)`,
  label "Drop a Theme Pack (.json)"
- On drop or file select:
  1. Parse JSON
  2. Call `validateTheme()` from `src/lib/theme.ts`
  3. If invalid: `useToast().showToast('Invalid theme file. Missing required tokens.', 'error')`
  4. If valid: reveal Theme Preview Panel via Motion One slide-in from right

**Theme Preview Panel:**
A mini mockup showing — rendered with the new theme's tokens applied to a
temporary `<div>` with inline CSS variable overrides (NOT applied globally yet):
- A small `BpCard` with a dummy heading + amount
- A `BpButton` primary variant
- A `BpProgressBar` at 65%

Two buttons: "Apply Theme" and "Cancel".
- Apply: call `applyTheme(validatedTheme)` → `useAppStore.setActiveTheme(theme)`
  → success toast
- Cancel: hide preview panel

"Reset to Midnight" button (always visible): `applyTheme(THEME_MIDNIGHT)` +
`Settings.delete('activeTheme')` + `useAppStore.setActiveTheme(THEME_MIDNIGHT)`.

**Section 3 — Danger Zone**

"Clear All Data" `BpButton` danger variant.
`BpConfirmDialog` with title "Delete everything?" and description "This will
permanently erase all transactions, budgets, and settings. This cannot be undone."
On confirm: `db.delete()` → `window.location.reload()`.

**Category Manager** (bonus section if time allows):
Quick view of all categories across all months. Read-only list — category
management is done per-month in the Budget view.

---

## Completion Gate

**Gate 1 — TypeScript:** `npx tsc --noEmit` → zero errors.

**Gate 2 — Storybook:** Theme Preview Panel has a story in both valid-theme and
error states. `npm run storybook:build` exits 0.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_2B.md`:

```markdown
# Peer Review — Task 2B

Budget Planner:
- [ ] Desktop: three vertical category columns, each with progress bars
- [ ] Mobile: collapsible accordions, sticky "Income Left" card
- [ ] Three sliders always sum to 100% — tested by moving each slider to its extreme
- [ ] clampAllocationSliders imported from calculations.ts (not reimplemented inline)
- [ ] Currency amounts update in real time below each slider
- [ ] Add / rename / delete category works
- [ ] New month creation: copies prior month or falls back to ONBOARDING_CATEGORIES

Settings / Appearance:
- [ ] 5-color swatch strip reflects current theme tokens (not hardcoded)
- [ ] Invalid JSON shows error toast, does not crash
- [ ] Theme Preview Panel slides in from right using Motion One
- [ ] Preview panel renders with NEW theme tokens (not current theme)
- [ ] "Apply" calls applyTheme() and updates Zustand store
- [ ] "Reset to Midnight" restores default and deletes activeTheme from Settings
- [ ] "Clear All Data" requires confirmation before deleting

Motion One:
- [ ] Theme preview panel is Motion One interaction #3 (not CSS transition)
- [ ] Reads getMotionConfig() — no hardcoded durations

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```

---
---

# Task 2C — Smart CSV Import + Transactions List
**Phase:** 2 (Parallel with Tasks 2A and 2B)
**Requires:** All Phase 1 tasks complete
**Agent count:** 1

---

## Step 0 — Visual Reference (REQUIRED)

Fetch and study all six wireframes before writing any code:

```
Feature 4 — CSV Import:
https://github.com/encompp/budget-tracker/blob/main/images/feature_4_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_4_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_4_mobile.png

Feature 2 — Transactions List:
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_desktop.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_tablet.png
https://github.com/encompp/budget-tracker/blob/main/images/feature_2_mobile.png
```

---

## Wireframe Spec — CSV Import (Feature 4, verbatim)

### Desktop (≥ 1024px)
Professional desktop UI (1920×1080px) for "Smart CSV Import" flow.
- **Header:** Clean horizontal stepper (1. Upload → 2. Map → 3. Review). Step 2
  active with teal glow (`--bp-accent-active`).
- **Top Area:** Full-width success toast inside content area with `--bp-bg-surface`
  background: "Chase Bank detected. Mapping applied automatically." with teal checkmark.
- **Main Stack (Mapping Grid):** Two-column high-density grid.
  - Left column: CSV header names in muted text
  - Right column: Dropdown selectors pre-filled with mapping matches. Each row
    has a small teal "MAPPED" badge.
- **Token callouts:** screen background, content container, interactive elements,
  data/numbers font.

### Tablet (768–1023px)
Centered progress indicator. Success toast anchored top center. Vertically stacked
mapping cards. Below them: swipeable carousel preview of first 5 rows.

### Mobile (< 768px)
(390×844px) CSV Mapping stage in Dark "Midnight" Theme.
- **Header:** Condensed vertical stepper top-right. Success toast "Chase Bank
  detected" as slim banner.
- **Stack (Vertical Mapping Cards):** List of cards, one per CSV column.
  - Card top: raw CSV header name (e.g. "TXN_DT_STMT")
  - Card bottom: large 44px-tall dropdown for app field selection (e.g. "Date")
- **Navigation:** Sticky bottom area with full-width teal "Confirm Mapping" button.
- **Drop Zone** replaced by "Select File from Device" button block (80% width).
- **Token callouts:** mobile surface, 44px touch targets, primary action, numeric data.

---

## Wireframe Spec — Transactions List (Feature 2, verbatim)

### Desktop (≥ 1024px)
High-density table for auditing. Header: "Transactions" title with global search
bar and "Filter" button toolbar. Summary metrics for filtered view ("Filtered Total").
Table columns: Date, Category (pill-badge), Description, Note (truncated), Amount
(right-aligned). Left sidebar navigation. Centered Dialog modal for entry.

### Tablet (768–1023px)
Wide search bar centered above data list. Cards showing total monthly expenses vs
income. Simplified table removing "Note" column. "Add" is floating FAB.
64px Icon Rail. Dialog widened to 80% viewport.

### Mobile (< 768px)
High-speed one-handed entry focus.
- Background layer: list of transaction cards, blurred/dimmed behind 40% black
  backdrop. One card partially swiped left revealing high-contrast red "Trash" icon.
- Foreground layer: full-screen surface sheet from bottom.

---

## Implementation

### `src/views/Import.tsx`

**Horizontal stepper component:**
```typescript
// Inline or extracted to src/components/ImportStepper.tsx
// Steps: 1. Upload, 2. Map, 3. Review
// Active step has --bp-accent glow treatment
// Completed steps have checkmark
```

**Stage 1 — File Upload:**
- Desktop/tablet: drag-and-drop zone (dashed border, `var(--bp-border)`)
- Mobile: "Select File from Device" button (80% width, `BpButton` primary)
- On file selected: parse with PapaParse (`header: true, skipEmptyLines: true`)
- Call `detectBank(headers)` from fingerprints.ts
- If match: show `BpToast` success with bank name. Advance to Stage 3.
- If no match: advance to Stage 2.

**Stage 2 — Column Mapping (only when Stage 1 finds no bank match):**
- Show mapping grid (desktop) or vertical card list (mobile)
- Pre-populate detected fields from `heuristicMap(headers, sampleRows)`
- For any unmapped field: show dropdown of all CSV headers
- "Confirm Mapping" button only enables when `isMappingComplete(mapping)` is true

**Stage 3 — Categorization + Preview:**
- Read `db.csvCategoryMap.toArray()` for the live category map
- Run `lookupCategory(description, categoryMap)` on each row
- Build preview table: Date / Description / Amount / Category
- Uncategorized rows: amber `BpBadge` "Uncategorized"
- User can assign categories inline using `BpSelect` before confirming
- Show `AnimatedIcon LoaderCircle` while categorization runs
- Add comment: `// TODO: offload to Worker if parsing exceeds 100ms`

**"Import N Transactions" button:**
```typescript
const mapped: BpTransaction[] = rows.map(row => ({
  id: crypto.randomUUID(),
  date: normalizeDate(row[mapping.date]),  // convert to YYYY-MM-DD via date-fns
  amount: Math.abs(parseFloat(row[mapping.amount])),
  type: parseFloat(row[mapping.amount]) < 0 ? 'expense' : 'income',
  categoryId: categorizedMap[row[mapping.description]] ?? null,
  note: '',
  importSource: 'csv',
}))
await db.transactions.bulkAdd(mapped)
```

After import: toast "47 transactions imported. 12 need categorization." → navigate
to Transactions view → apply filter for `importSource === 'csv'` + today's date.

### `src/views/Transactions.tsx`

**Table view (desktop/tablet):**
Columns: Date, Category `BpBadge`, Description (truncated 30 chars), Note
(truncated 20 chars, hidden on tablet), Amount (monospace, right-aligned, color
by type), Source `BpBadge` (csv/manual).

**Transaction cards (mobile):**
Each card: Merchant + Amount top line, Category badge + Date bottom line.
Swipe left reveals delete action (red trash icon). Tap to edit.

**Search bar:** Filters by description (case-insensitive substring). Instant
filter on `useLiveQuery` result.

**Filter button:** Popover with date range (start/end date inputs) and category
multi-select.

**Edit flow:** Clicking a row opens the transaction entry modal (same `BpModal`
from Task 2A) pre-populated with the transaction's values. On save: `db.transactions.update()`.

**Uncategorized categorization:** When a user assigns a category to a transaction
where `categoryId === null`, also persist:
```typescript
await db.csvCategoryMap.put({
  normalizedDescription: normalize(transaction.note || ''),
  categoryId: selectedCategoryId,
})
```

---

## Completion Gate

**Gate 1 — TypeScript:** `npx tsc --noEmit` → zero errors.

**Gate 2 — Manual import test:** Agent runs a manual end-to-end test using two
mock CSV strings:

```
Mock Chase CSV (should auto-detect):
Transaction Date,Post Date,Description,Category,Type,Amount,Memo
04/15/2026,04/16/2026,STARBUCKS #12345,Food & Drink,Sale,-5.75,
04/14/2026,04/15/2026,AMAZON.COM,Shopping,Sale,-45.99,
04/14/2026,04/15/2026,PAYCHECK,Income,Payment,3500.00,

Mock unknown CSV (should trigger manual mapping):
TXN_DATE,MERCHANT_NAME,DEBIT_AMT,CREDIT_AMT
2026-04-15,Coffee Shop,5.75,
2026-04-14,Online Store,45.99,
```

Verify: Chase fingerprint triggers auto-detect toast. Unknown CSV reaches mapping UI.
Both paths produce correct preview table. Import writes correct records to Dexie.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_2C.md`:

```markdown
# Peer Review — Task 2C

CSV Import:
- [ ] Desktop: horizontal stepper, two-column mapping grid, "MAPPED" badges
- [ ] Mobile: vertical mapping cards with 44px dropdowns, full-width confirm button
- [ ] Chase CSV auto-detects and skips manual mapping
- [ ] Unknown CSV shows manual mapping UI pre-populated with heuristic guesses
- [ ] Uncategorized rows show amber badge in preview
- [ ] LoaderCircle AnimatedIcon shows during processing
- [ ] Import writes correct importSource: 'csv' on all rows
- [ ] Post-import toast shows count of imported + uncategorized

Transactions List:
- [ ] Desktop: all 6 columns rendered, search filters correctly
- [ ] Mobile: card layout with swipe-left delete
- [ ] Source badges (CSV/Manual) visible on all rows
- [ ] Amber "Uncategorized" badge on categoryId === null rows
- [ ] Assigning category to uncategorized row also writes to db.csvCategoryMap
- [ ] Edit flow opens pre-populated modal

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```
