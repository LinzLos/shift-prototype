<!-- title: Update ds:consumes coupling map with new --chart-* bindings + retired chart-hex drift -->
<!-- labels: chore, ds:consumes, area:design-system, P2, owner:Lindsay -->

## Description
Update shift's **Lane A `ds:consumes` coupling map** (issue #1) to record the Tiny Wire token bindings `LedgerChart` introduces, and to note the chart-hex drift that was retired when Queue Monitor + Performance adopted it.

## Why
The coupling map is the downstream contract: it lists which vendor tokens/classes this consumer binds to, so a Tiny Wire release knows what it affects. New bindings must be recorded for the next release reconciliation.

## New token bindings (add to coupling map)
| Token | Role |
|-------|------|
| `--chart-blue` | primary series line + area |
| `--chart-azure` | comparison series (Queue Monitor inflow) |
| `--border` | gridlines |
| `--border-strong` | reference / target line |
| `--surface` | tooltip bg, open-dot fill |
| `--text-primary` / `--text-secondary` / `--text-tertiary` | tooltip + axis / legend labels |
| `--elevation-md` | tooltip shadow |

## Drift retired
`#5B9BD5`, `#1b4079`, `#1E1918`, `#aaa` removed from the Queue Monitor + Performance charts and replaced with the tokens above.

## Recommended prerequisite
None. (Soft-related to #01 — same component — but independent.)

## Scope
Tracking / metadata only — updates issue #1's coupling-map body. No repo file changes.

## Touches
- (none — updates the `ds:consumes` tracking issue body)

## Source
phase4-brief.md → Item 2 (Lane A coupling-map update).

## Owner
Lindsay.

## Acceptance criteria
- [ ] Coupling map (#1) lists all bindings above.
- [ ] Retired-drift note recorded.
- [ ] Flagged for the next Tiny Wire release reconciliation.
