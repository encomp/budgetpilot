# BudgetPilot — Agent Prompt Index

## Files in this directory

| File | Tasks | Phase |
|---|---|---|
| `task-0-foundation.md` | Task 0 — Project Scaffold & Foundation | 0 (sequential) |
| `task-1a-ui-library.md` | Task 1A — Bp UI Component Library + Storybook | 1 (parallel) |
| `task-1b-1c-logic-shell.md` | Task 1B — Business Logic + Hooks / Task 1C — App Shell + Onboarding | 1 (parallel) |
| `task-2abc-feature-views.md` | Task 2A — Dashboard + Txn Form / Task 2B — Budget + Settings / Task 2C — Import + Txn List | 2 (parallel) |
| `task-3abc-4-final.md` | Task 3A — Debts / Task 3B — Export-Import / Task 3C — Polish / Task 4 — QA Gate | 3 (parallel) + 4 (sequential) |

---

## Execution Order

```
Phase 0 ──► Task 0 (1 agent, sequential)
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
Phase 1   Task 1A     Task 1B     Task 1C
          UI Library  Logic+Hooks Shell+Onboarding
    └──────────┼──────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
Phase 2   Task 2A     Task 2B     Task 2C
          Dashboard   Budget+     Import+
          +Txn Form   Settings    Txn List
    └──────────┼──────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
Phase 3   Task 3A     Task 3B     Task 3C
          Debts       Export/     Polish
                      Import
    └──────────┼──────────┘
               │
Phase 4 ──► Task 4 — QA Gate (1 agent, sequential)
```

---

## How to run a task in Claude Code

```bash
# Start a Claude Code session and pass the task prompt:
claude < task-0-foundation.md

# Or for interactive use:
claude
# Then paste the task prompt content
```

---

## Key references (every agent should have these open)

- MVP Brief: https://github.com/encompp/budget-tracker/blob/main/budgetpilot-mvp-brief.md
- Wireframes: https://github.com/encompp/budget-tracker/blob/main/budgetpilot-wireframes.md
- Wireframe images: https://github.com/encompp/budget-tracker/tree/main/images

---

## Completion gate summary

Every task is only done when ALL of these pass:

1. `npx tsc --noEmit` → exit 0
2. `npx vitest run` → all tests green (Tasks 1B+ only)
3. `npm run storybook:build` → exit 0 (UI tasks only)
4. Peer review checklist output as `REVIEW_TASK_[N].md` → PASS

Phase 4 (QA) additionally requires `npm run build` and manual end-to-end testing.

---

## Three-layer architecture (all agents must enforce)

```
src/lib/          Pure TS functions — no React, no Dexie, no side effects
src/hooks/        Data hooks — useLiveQuery + aggregation, no JSX
src/components/   UI components — no Dexie calls, no business logic
src/views/        View composition — assembles components + hooks
```

**No layer may import from a layer above it.**
`lib` knows nothing about hooks, components, or views.
`hooks` may import from `lib` only.
`components` may import from `lib` and `hooks`.
`views` may import from anywhere.
