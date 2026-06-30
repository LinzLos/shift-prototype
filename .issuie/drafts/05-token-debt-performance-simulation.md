<!-- title: Replace hardcoded hex with Tiny Wire tokens in Performance + Simulation -->
<!-- labels: chore, ds:consumes, area:performance, P3, owner:Lindsay -->

## Description
Replace hardcoded hex in `src/screens/Performance.tsx` (insight-banner icon) and `src/screens/Simulation.tsx` (leftover chart-blue + check icon + banner border) with Tiny Wire tokens. (Performance's throughput chart is already token-pure via LedgerChart.)

## Why
Token-purity / design-system sync. `#5B9BD5` in Simulation is a leftover of the old chart-blue that LedgerChart retired elsewhere.

## Mapping
| Hex | → Token | File · Lines |
|-----|---------|--------------|
| `#1b4079` | `--info` | Performance 236, 237, 238 |
| `#afbcd0` | `--info-mid` | Performance 228 · Simulation 203 |
| `#629460` | `--brand` | Simulation 756 |
| `#5B9BD5` | `--chart-azure` | Simulation 846 |

## Recommended prerequisite
None.

## Scope
UI-only, two files (disjoint from all other debt issues). No chart code change.

## Touches
- src/screens/Performance.tsx
- src/screens/Simulation.tsx

## Source
phase4-brief.md → Item 3.

## Owner
Lindsay.

## Acceptance criteria
- [ ] Listed hex replaced with tokens.
- [ ] `npm run build` clean; both screens unchanged in light + dark.
