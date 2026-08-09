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

## Spec update — line weights & area wash

Adjusted in `src/components/LedgerChart.tsx` to establish clearer visual hierarchy across variants. **API unchanged** — same `series[] {label, values, color, variant, axis?, format?}` shape, same four variants (`area` / `line` / `dashed` / `reference`). Only the rendered weight/opacity defaults changed. Applied at the shared component level so every chart on the site (Queue Monitor flow, Performance throughput) picks the change up automatically — no per-consumer divergence.

### Rationale
Under the previous defaults the actual/story line (`area`, `line`) and the guide lines (`dashed`, `reference`) rendered at similar weights, so all series competed for attention. The tuned defaults put the story line first — the reader's eye lands on the actual data — and let guide lines recede to secondary context. The area fill becomes a subtle wash beneath the line rather than a shadow that reads as its own shape.

### Changes
| Element | Before | After | Role |
|---|---|---|---|
| `area` / `line` stroke width | 2 | **1.5** | Story line — thinner but still the visual hero via color contrast |
| `dashed` stroke width | 1.5 | **1** | Secondary series (e.g. handle-time avg) recedes |
| `dashed` dash pattern | `6 4` | **`3 3`** | Tighter dashes read quieter |
| `reference` stroke width | 1.5 | **1** | Target / guide line barely visible until the actual line meets it |
| `reference` dash pattern | `4 3` | **`2 3`** | Fine-dashed whisper |
| `area` gradient top-stop opacity | 0.22 | **0.10** | Wash, not shadow |
| Legend swatches | mirrored old weights | mirror the new weights and use `3 3` uniformly | Swatches stay truthful to what the chart draws |

### Coverage
- `src/components/LedgerChart.tsx` — component defaults (single source).
- Queue Monitor `PeriodData['chart']` renders (inflow/outflow/target) — inherits.
- Performance throughput chart (loans / handle time / target pace) — inherits.
- No new tokens introduced; existing `--chart-*` and `--border-strong` still cover the palette.

### Promotion note
When this component graduates to Tiny Wire (Layer 3 React package), these tuned defaults are the intended upstream defaults. Consumers should be able to override via props if a future case needs heavier weights, but the shipping defaults are the ones documented here.
