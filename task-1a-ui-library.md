# Task 1A — Bp UI Component Library + Storybook
**Phase:** 1 (Parallel with Tasks 1B and 1C)
**Requires:** Task 0 complete
**Agent count:** 1
**Estimated scope:** 13 components + 13 Storybook stories

---

## Context

You are building the complete visual vocabulary of BudgetPilot — every reusable
UI primitive that feature views will consume. This is a **UI-only task**: zero
Dexie imports, zero business logic, zero `useLiveQuery` calls.

All components are thin wrappers over shadcn/ui primitives. They exist to:
1. Enforce the `var(--bp-*)` token system across the entire app
2. Give feature agents a typed, consistent API to work from
3. Provide Storybook stories as a visual contract for peer review

Full product spec: https://github.com/encomp/budget-tracker/blob/main/budgetpilot-mvp-brief.md

---

## Absolute Rules

1. Zero hardcoded colors, durations, radii, or font values. Every visual property
   via `var(--bp-*)`.
2. Zero Dexie imports. Zero `useLiveQuery`. Zero business logic.
3. Every component exported from `src/components/ui/index.ts` (barrel export).
4. Every component has a co-located `.stories.tsx` file.
5. No `<form>` tags anywhere.
6. All interactive elements respect `--bp-duration-fast` and `--bp-easing-default`
   for hover/focus transitions unless a spring is explicitly specified.

---

## Step 0 — Visual Reference

Before writing any component, study the wireframe images to understand how these
primitives appear in context. Fetch each image:

```
Feature 1 (Dashboard):
https://github.com/encomp/budget-tracker/blob/main/images/feature_1_desktop.png
https://github.com/encomp/budget-tracker/blob/main/images/feature_1_tablet.png
https://github.com/encompm/budget-tracker/blob/main/images/feature_1_mobile.png

Feature 2 (Transactions):
https://github.com/encomp/budget-tracker/blob/main/images/feature_2_desktop.png
https://github.com/encompm/budget-tracker/blob/main/images/feature_2_mobile.png

Feature 3 (Budget):
https://github.com/encomp/budget-tracker/blob/main/images/feature_3_desktop.png

Feature 5 (Debts):
https://github.com/encomp/budget-tracker/blob/main/images/feature_5_desktop.png
```

Pay particular attention to:
- Card surface color and border treatment in Feature 1 desktop
- Badge variants (category pills, CSV/Manual source, Uncategorized amber) in Feature 2
- Progress bar color states (teal healthy, amber warning, red over) in Feature 3
- The premium slider thumb (glow ring, large touch target) in Feature 5
- Modal/sheet pattern in Feature 2 mobile (full-screen bottom sheet)

---

## Components to Build

### 1. BpButton — `src/components/ui/BpButton.tsx`

Wraps shadcn `Button`. Enforces token-driven styling.

```typescript
type BpButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BpButtonSize = 'sm' | 'md' | 'lg'

interface BpButtonProps {
  variant?: BpButtonVariant
  size?: BpButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}
```

Token mapping:
- `primary`: background `var(--bp-accent)`, text `var(--bp-bg-base)`, hover darken 10%
- `secondary`: background `var(--bp-bg-surface-alt)`, border `var(--bp-border)`, text `var(--bp-text-primary)`
- `ghost`: transparent background, text `var(--bp-text-secondary)`, hover background `var(--bp-accent-muted)`
- `danger`: background `var(--bp-danger-muted)`, border `var(--bp-danger)`, text `var(--bp-danger)`
- `loading`: renders `AnimatedIcon` spinner in place of children, `disabled` forced true
- All transitions: `var(--bp-duration-fast) var(--bp-easing-default)`

Storybook stories: all 4 variants × default, hover, loading, disabled states.

---

### 2. BpCard — `src/components/ui/BpCard.tsx`

```typescript
interface BpCardProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  className?: string
}
```

Styling:
- background: `var(--bp-bg-surface)`
- border: `1px solid var(--bp-border)`
- border-radius: `var(--bp-radius-md)`
- `hoverable` adds: `transform: translateY(-1px)` on hover,
  `border-color: var(--bp-border-strong)` on hover,
  transition: `var(--bp-duration-fast) var(--bp-easing-default)`

Padding scale: sm=12px, md=20px, lg=28px

Storybook stories: padding variants, hoverable vs static.

---

### 3. BpBadge — `src/components/ui/BpBadge.tsx`

```typescript
type BpBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'csv' | 'manual'

interface BpBadgeProps {
  variant?: BpBadgeVariant
  children: React.ReactNode
  className?: string
}
```

Token mapping:
- `default`: background `var(--bp-accent-muted)`, text `var(--bp-accent)`
- `success`: background `var(--bp-positive-muted)`, text `var(--bp-positive)`
- `warning`: background `var(--bp-warning-muted)`, text `var(--bp-warning)` ← used for "Uncategorized"
- `danger`: background `var(--bp-danger-muted)`, text `var(--bp-danger)`
- `muted`: background `var(--bp-bg-surface-alt)`, text `var(--bp-text-muted)`
- `csv`: background `var(--bp-warning-muted)`, text `var(--bp-warning)`, label always "CSV"
- `manual`: background `var(--bp-accent-muted)`, text `var(--bp-accent)`, label always "Manual"

All badges: border-radius `var(--bp-radius-sm)`, font-size 11px, padding 2px 8px, font-weight 500.

Storybook stories: all 7 variants.

---

### 4. BpProgressBar — `src/components/ui/BpProgressBar.tsx`

```typescript
interface BpProgressBarProps {
  value: number          // 0–100+. Values > 100 are clamped visually but shown in label.
  label?: string
  showValue?: boolean
  className?: string
}
```

Color logic (automatic, no prop needed):
- `value < 85`: fill color `var(--bp-positive)`
- `85 <= value < 100`: fill color `var(--bp-warning)`
- `value >= 100`: fill color `var(--bp-danger)`

Track: background `var(--bp-bg-surface-alt)`, border-radius `var(--bp-radius-sm)`, height 8px.
Fill: width `min(value, 100)%`, transition `width var(--bp-duration-normal) var(--bp-easing-default)`.

Storybook stories: 0%, 45%, 72%, 88%, 100%, 120% — all showing correct color states.

---

### 5. BpModal — `src/components/ui/BpModal.tsx`

Wraps Radix `Dialog`. This is **Motion One interaction #1** (modal entrance/exit).

```typescript
interface BpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}
```

Motion One entrance: scale from 0.95 → 1.0, opacity 0 → 1, using `getMotionConfig()`
from `src/lib/animation.ts` for duration and easing.
Motion One exit: reverse — scale 1.0 → 0.95, opacity 1 → 0.

Overlay: `var(--bp-bg-overlay)`.
Surface: `var(--bp-bg-surface)`, border `var(--bp-border)`, radius `var(--bp-radius-lg)`.
Sizes: sm=400px, md=560px, lg=720px max-width.

Storybook stories: open state (all 3 sizes), with and without footer.

---

### 6. BpConfirmDialog — `src/components/ui/BpConfirmDialog.tsx`

Extends BpModal. Replaces all native `confirm()` calls.

```typescript
interface BpConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
}
```

Footer renders two BpButtons: cancel (ghost) + confirm (primary or danger based on variant).

Storybook stories: default variant, danger variant.

---

### 7. BpToast — `src/components/ui/BpToast.tsx`

```typescript
type BpToastVariant = 'info' | 'success' | 'error' | 'bell'

interface BpToastProps {
  variant: BpToastVariant
  message: string
  visible: boolean
  onDismiss: () => void
  autoDismissMs?: number   // default 4000
}
```

Positioning: fixed, bottom-right, 16px margin, z-index 9999.
Entrance: CSS `transform: translateY(0)` + `opacity: 1` from `translateY(16px)` + `opacity: 0`.
Exit: reverse, triggered after `autoDismissMs` ms.
All transitions use `var(--bp-duration-normal) var(--bp-easing-spring)`.

Variant styling (left border accent color):
- `info`: `var(--bp-accent)`
- `success`: `var(--bp-positive)`
- `error`: `var(--bp-danger)`
- `bell`: `var(--bp-warning)` + renders `AnimatedIcon BellRing` before message text

Background: `var(--bp-bg-surface)`, border `var(--bp-border)`, radius `var(--bp-radius-md)`.

Also export a `useToast()` hook that manages a single toast state (message, variant,
visible) with a `showToast(message, variant)` function. Components import this hook
rather than managing toast state themselves.

Storybook stories: all 4 variants shown simultaneously.

---

### 8. BpEmptyState — `src/components/ui/BpEmptyState.tsx`

```typescript
interface BpEmptyStateProps {
  icon?: React.ReactNode
  heading: string
  subtext: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

Centered layout, icon at top (48px, `var(--bp-text-muted)` color), heading in
`var(--bp-text-primary)`, subtext in `var(--bp-text-secondary)`, optional BpButton primary.

Storybook stories: with and without action button.

---

### 9. BpSelect — `src/components/ui/BpSelect.tsx`

Thin wrapper over shadcn `Select` that enforces token styling.

```typescript
interface BpSelectOption {
  value: string
  label: string
}

interface BpSelectProps {
  options: BpSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}
```

Dropdown surface: `var(--bp-bg-surface)`, border `var(--bp-border)`.
Option hover: background `var(--bp-accent-muted)`.
Selected: text `var(--bp-accent)`.

Storybook stories: default, with value selected, disabled.

---

### 10. BpSlider — `src/components/ui/BpSlider.tsx`

Two visual variants sharing one component.

```typescript
interface BpSliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  variant?: 'standard' | 'premium'
  disabled?: boolean
  className?: string
}
```

**Standard variant** (used in Budget allocation sliders):
- Track: `var(--bp-bg-surface-alt)`, 6px height
- Range fill: `var(--bp-accent)`
- Thumb: 20px circle, `var(--bp-accent)`, border `var(--bp-bg-surface)` 2px
- Transitions: `var(--bp-duration-fast) var(--bp-easing-default)`

**Premium variant** (used in Debt extra-payment slider — this is the signature widget):
- Track: `var(--bp-bg-surface-alt)`, 8px height
- Range fill: `var(--bp-accent)`
- Thumb: 44×44px (mandatory touch target), `var(--bp-accent)` background
- Active thumb state: `transform: scale(1.15)`, box-shadow `0 0 0 8px var(--bp-accent-muted)`
- Transitions: `var(--bp-duration-fast) var(--bp-easing-spring)` ← spring for premium feel
- Glow ring uses `var(--bp-accent-glow)` at full opacity on active

Implement using Radix `Slider` primitive with custom CSS on pseudo-elements.

Storybook stories: standard at 30%, 70%; premium at 30%, 70%, active state.

---

### 11. BpInput — `src/components/ui/BpInput.tsx`

```typescript
interface BpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean          // applies --bp-font-mono — used for all currency fields
  error?: string          // inline error message below input
  label?: string
}
```

Styling:
- Border: `var(--bp-border)`, focus `var(--bp-accent)` with `box-shadow: 0 0 0 2px var(--bp-accent-muted)`
- Background: `var(--bp-bg-surface-alt)`
- Error state: border `var(--bp-danger)`, error text in `var(--bp-danger)` below

Storybook stories: default, with label, mono variant, error state, disabled.

---

### 12. NivoTheme — `src/components/ui/NivoTheme.ts`

NOT a React component. A utility hook that maps current CSS variable values to
a Nivo chart `theme` object. Must re-compute when `activeTheme` changes in Zustand.

```typescript
import { useAppStore } from '../../store/useAppStore'

export function useNivoTheme() {
  const activeTheme = useAppStore((s) => s.activeTheme)

  // Re-read CSS vars from DOM after theme is applied
  const style = getComputedStyle(document.documentElement)
  const get = (v: string) => style.getPropertyValue(v).trim()

  return {
    background: 'transparent',
    textColor: get('--bp-text-secondary'),
    fontSize: 12,
    axis: {
      ticks: { text: { fill: get('--bp-text-muted') } },
      legend: { text: { fill: get('--bp-text-secondary') } },
    },
    grid: { line: { stroke: get('--bp-border'), strokeWidth: 1 } },
    legends: { text: { fill: get('--bp-text-secondary') } },
    tooltip: {
      container: {
        background: get('--bp-bg-surface'),
        border: `1px solid ${get('--bp-border')}`,
        borderRadius: get('--bp-radius-sm'),
        color: get('--bp-text-primary'),
        fontFamily: get('--bp-font-ui'),
      },
    },
  }
}
```

No Storybook story needed (it's a hook, not a visual component). Include a comment
explaining its purpose and usage.

---

### 13. AnimatedIcon — `src/components/ui/AnimatedIcon.tsx`

```typescript
type AnimatedIconType = 'LoaderCircle' | 'CheckCircle' | 'BellRing'

interface AnimatedIconProps {
  type: AnimatedIconType
  size?: number
  className?: string
}
```

**If `lucide-react-dynamic` was successfully installed in Task 0:**
Import and render the dynamic variant directly.

**If `lucide-react-dynamic` was NOT installed (fallback):**
Import static icons from `lucide-react`. Apply CSS animations:

```css
/* LoaderCircle — continuous spin */
@keyframes bp-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.bp-icon-loading { animation: bp-spin 1s linear infinite; }

/* CheckCircle — stroke draw-on */
@keyframes bp-check-draw {
  from { stroke-dashoffset: 100; opacity: 0; }
  to   { stroke-dashoffset: 0;   opacity: 1; }
}
.bp-icon-check circle, .bp-icon-check path {
  stroke-dasharray: 100;
  animation: bp-check-draw 0.4s var(--bp-easing-default) forwards;
}

/* BellRing — rotate back-and-forth */
@keyframes bp-bell-ring {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(15deg); }
  75%       { transform: rotate(-15deg); }
}
.bp-icon-bell { animation: bp-bell-ring 0.6s var(--bp-easing-bounce) infinite; }
```

Add a comment at the top of the file recording which implementation is active
(based on the outcome noted in Task 0).

Storybook stories: all 3 icon types rendered side by side.

---

## Step 14 — Barrel Export

`src/components/ui/index.ts`:

```typescript
export { BpButton } from './BpButton'
export { BpCard } from './BpCard'
export { BpBadge } from './BpBadge'
export { BpProgressBar } from './BpProgressBar'
export { BpModal } from './BpModal'
export { BpConfirmDialog } from './BpConfirmDialog'
export { BpToast, useToast } from './BpToast'
export { BpEmptyState } from './BpEmptyState'
export { BpSelect } from './BpSelect'
export { BpSlider } from './BpSlider'
export { BpInput } from './BpInput'
export { useNivoTheme } from './NivoTheme'
export { AnimatedIcon } from './AnimatedIcon'
```

---

## Completion Gate

**Gate 1 — TypeScript**
```bash
npx tsc --noEmit
```
Zero errors.

**Gate 2 — Storybook build**
```bash
npm run storybook:build
```
Must exit 0. Open built Storybook and verify each story renders without errors.

**Gate 3 — Peer Review Checklist**

Output `REVIEW_TASK_1A.md`:

```markdown
# Peer Review — Task 1A

Visual verification (open Storybook for each):
- [ ] BpButton — all 4 variants render, loading state shows spinner, disabled is non-interactive
- [ ] BpCard — hoverable lifts on hover, padding variants are visually distinct
- [ ] BpBadge — warning variant is amber (not teal), csv/manual variants distinct
- [ ] BpProgressBar — color changes at 85% and 100% thresholds automatically
- [ ] BpModal — entrance animation plays, overlay dims background
- [ ] BpConfirmDialog — danger variant has red confirm button
- [ ] BpToast — bell variant shows animated icon, auto-dismisses
- [ ] BpEmptyState — centered, icon + heading + subtext layout correct
- [ ] BpSelect — dropdown opens, options highlight on hover
- [ ] BpSlider premium — thumb is 44px, glow ring appears on active
- [ ] BpInput — mono variant uses monospace font, error state shows red border + message
- [ ] AnimatedIcon — all 3 types animate correctly

Code verification:
- [ ] Zero hardcoded hex color values in any component file
- [ ] Zero Dexie imports in any component file
- [ ] All components exported from index.ts barrel
- [ ] NivoTheme re-reads CSS vars from DOM (not from JS constants)

Reviewer: [agent ID or name]
Date: [date]
Result: PASS / FAIL
Notes:
```
