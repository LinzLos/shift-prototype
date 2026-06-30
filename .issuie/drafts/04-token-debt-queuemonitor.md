<!-- title: Replace hardcoded hex with Tiny Wire tokens in QueueMonitor (banner/toast icons) -->
<!-- labels: chore, ds:consumes, area:queue-monitor, P3, owner:Lindsay -->

## Description
Replace remaining hardcoded hex in `src/screens/QueueMonitor.tsx` — banner/toast/check icon strokes and the progress-bar track/gradient — with Tiny Wire tokens. (The inflow/outflow chart is already token-pure via LedgerChart.)

## Why
Token-purity / design-system sync. These are the leftover icon and progress-bar colors not touched by the chart migration.

## Mapping
| Hex | → Token | Lines |
|-----|---------|-------|
| `#1B4079` | `--info` | 269, 270 |
| `#629460` | `--brand` | 573, 932, 1035 |
| `#afbcd0` | `--info-mid` | 261 |
| `#d9d9d9` | `--border` | 691 |
| `#bfc7d4` → `#8195b5` | progress gradient — nearest cobalt ramp; see #07 | 702 |

## Recommended prerequisite
#07 (only for the progress-gradient token decision). Remap to nearest cobalt steps now if #07 is deferred.

## Scope
UI-only, single file. Chart code untouched (already tokenized).

## Touches
- src/screens/QueueMonitor.tsx

## Source
phase4-brief.md → Item 3.

## Owner
Lindsay.

## Acceptance criteria
- [ ] Listed hex replaced with tokens.
- [ ] `npm run build` clean; banners/toast/progress unchanged in light + dark.
