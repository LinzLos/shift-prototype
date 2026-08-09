<!-- title: Register QueueSelector as a Tiny Wire promotion candidate (ds:candidate) -->
<!-- labels: chore, ds:candidate, area:design-system, P2, owner:Lindsay -->

## Description
Register the token-pure `QueueSelector` component (built this session in `src/components/QueueSelector.tsx`) as a **Lane B promotion candidate** for Tiny Wire. Same pattern as the LedgerChart candidate: add a row to the vendor's Promotion-candidates table (`tiny-wire/DESIGN-SYSTEM-HUB.md`) and capture the candidate assessment here. No component code change — this is the upstream-tracking record.

## Why
The header-level scope-switcher (label + chevron trigger, categorized popover menu, selected-state highlight) is a repeatable pattern: any consumer with a global "current context" (queue, tenant, workspace, project, environment) needs the same UI. Tiny Wire ships tokens for the popover style (`--surface`, `--border`, `--brand-light`, `--text-*`) but **no scope-switcher component**. Per `lib/CONSUMING.md` rule #3, bespoke UI is built locally and raised as a candidate; this issue is that record.

## Candidate assessment
- **Generalizes beyond one prototype?** Yes — strong. Header scope-switching is a horizontal pattern (any multi-tenant / multi-context app). Meets the hub's "reinvented in N consumers" heuristic even at N=1 because the API is stable and the visual language is token-pure.
- **Token / a11y debt:** token-pure (zero hex; uses `--surface`, `--surface-muted`, `--border`, `--text-tertiary`, `--text-primary`, `--brand`, `--brand-dark`, `--brand-light`). a11y already covered: `aria-haspopup="listbox"`, `aria-expanded`, `aria-selected`, `role="option"`, keyboard `Escape` close. **Gaps to resolve before promotion:** arrow-key navigation between items (currently mouse + Escape only), first-item focus on open, focus-return to trigger on close, and a search input for lists longer than ~30 items.
- **API shape:** stable but consumer-coupled. Currently reads `selectedQueue` / `setSelectedQueue` directly from `useQueueContext()`. For upstream promotion this needs to become a props-driven API — proposed shape:
  ```
  <ScopeSwitcher
    value={string}
    onChange={(v: string) => void}
    options={{ label: string; group?: string }[]}
    groupOrder?: string[]
    ariaLabel?: string
  />
  ```
  Existing structural pieces (categorized rendering, current-item checkmark + brand-tinted highlight, popover positioning) all lift as-is.
- **Decision:** PROMOTE-candidate. Keep local in each consumer until the React package ships; this entry tracks the pattern.

## Recommended prerequisite
None. QueueSelector uses only existing Tiny Wire tokens.

## Scope
Documentation / tracking only. Updates the cross-repo hub table and this candidate record. Does NOT modify `QueueSelector.tsx` or any screen.

## Touches
- src/components/QueueSelector.tsx (provenance — not modified)
- tiny-wire/DESIGN-SYSTEM-HUB.md (shared, cross-repo — Promotion-candidates table)

## Source
Session build (2026-08). Governance: `tiny-wire/DESIGN-SYSTEM-HUB.md`, `lib/CONSUMING.md` rule #3. Sibling of the LedgerChart candidate (issue #2).

## Owner
Lindsay (sole maintainer across vendor + consumers).

## Acceptance criteria
- [ ] Row added to `tiny-wire/DESIGN-SYSTEM-HUB.md` Promotion-candidates table: "Header scope-switcher (label + chevron + categorized popover)".
- [ ] Candidate assessment (above) recorded on this issue, labeled `ds:candidate`.
- [ ] a11y debt items (arrow-key nav, focus management, search-at-N) captured as the pre-promotion checklist.
- [ ] Proposed props API captured so the eventual upstream `<ScopeSwitcher>` can port `QueueSelector`'s internals unchanged.
