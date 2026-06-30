<!-- title: Replace hardcoded hex with Tiny Wire tokens in Roster -->
<!-- labels: chore, ds:consumes, area:roster, P3, owner:Lindsay -->

## Description
Replace hardcoded hex in `src/screens/Roster.tsx` — progress-bar track/gradient and banner border — with Tiny Wire tokens.

## Why
Token-purity / design-system sync.

## Mapping
| Hex | → Token | Lines |
|-----|---------|-------|
| `#d9d9d9` | `--border` | 182 |
| `#bfc7d4` → `#8195b5` | progress gradient — nearest cobalt ramp; see #07 | 188 |
| `#afbcd0` | `--info-mid` | 323 |

## Recommended prerequisite
#07 (only for the progress-gradient token decision). Remap to nearest cobalt steps now if #07 is deferred.

## Scope
UI-only, single file.

## Touches
- src/screens/Roster.tsx

## Source
phase4-brief.md → Item 3.

## Owner
Lindsay.

## Acceptance criteria
- [ ] Listed hex replaced with tokens.
- [ ] `npm run build` clean; roster unchanged in light + dark.
