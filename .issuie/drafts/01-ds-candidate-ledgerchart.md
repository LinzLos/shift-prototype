<!-- title: Register LedgerChart as a Tiny Wire promotion candidate (ds:candidate) -->
<!-- labels: chore, ds:candidate, area:design-system, P2, owner:Lindsay -->

## Description
Register the token-pure `LedgerChart` component (built this session in `src/components/LedgerChart.tsx`) as a **Lane B promotion candidate** for Tiny Wire. Add a row to the vendor's Promotion-candidates table (`tiny-wire/DESIGN-SYSTEM-HUB.md`) and capture the candidate assessment here. No component code change — this is the upstream-tracking record.

## Why
The Ledger-style area/line chart is reinvented per screen — already 2× in shift (Queue Monitor inflow/outflow, Performance throughput), and charts likely recur in `dialing-prototype`. Tiny Wire ships `--chart-*` tokens but **no chart component**. Per `lib/CONSUMING.md` rule #3, bespoke UI is built locally and raised as a candidate; this issue is that record and seeds the Layer 3 React-component build order.

## Candidate assessment
- **Generalizes beyond one prototype?** Yes — strong. Meets the hub's "reinvented in N consumers" heuristic.
- **Token / a11y debt:** token-pure (zero hex). a11y gaps to resolve before promotion: mouse-only tooltip (no keyboard scrubber), SVG missing `role="img"` / `aria-label`, no text alternative for the trend.
- **API shape:** stable. `series[] {label, values, color(token), variant, axis?, format?}` + optional `right` axis for dual-axis. Variants: `area`/`line`/`dashed`/`reference`.
- **Decision:** PROMOTE-candidate. Keep local in each consumer until the React package ships; this entry tracks the duplication.

## Recommended prerequisite
None.

## Scope
Documentation / tracking only. Updates the cross-repo hub table and this candidate record. Does NOT modify `LedgerChart.tsx` or any screen.

## Touches
- src/components/LedgerChart.tsx (provenance — not modified)
- tiny-wire/DESIGN-SYSTEM-HUB.md (shared, cross-repo — Promotion-candidates table)

## Source
phase4-brief.md → Item 1 (Lane B promotion candidate). Governance: `tiny-wire/DESIGN-SYSTEM-HUB.md`, `lib/CONSUMING.md` rule #3.

## Owner
Lindsay (sole maintainer across vendor + consumers).

## Acceptance criteria
- [ ] Row added to `tiny-wire/DESIGN-SYSTEM-HUB.md` Promotion-candidates table: "Ledger area/line chart (incl. dual-axis) — reinvented 2× in shift".
- [ ] Candidate assessment (above) recorded on this issue, labeled `ds:candidate`.
- [ ] a11y debt items captured as the pre-promotion checklist.
