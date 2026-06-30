<!-- title: Replace hardcoded hex with Tiny Wire tokens in RosterModal -->
<!-- labels: chore, ds:consumes, area:roster, P3, owner:Lindsay -->

## Description
Replace hardcoded hex colors in `src/components/RosterModal.tsx` (heaviest debt — 22 occurrences) with their Tiny Wire semantic tokens, so this consumer stays in sync with the design system.

## Why
Tiny Wire's contract is "components read tokens, never hardcode values." Hardcoded hex doesn't re-theme or dark-mode and drifts from the vendor palette.

## Mapping
| Hex | → Token | Lines |
|-----|---------|-------|
| `#1b4079` | `--info` | 163 |
| `#629460` | `--brand` | 99, 108, 109 |
| `#CE430A` | `--danger` | 117, 118, 119, 415, 457 |
| `#afbcd0` | `--info-mid` | 184, 401, 438 |
| `#d9d9d9` | `--border` | 793 |
| `#8a7e7d` | `--text-tertiary` | 127, 128, 129 |
| `#AD9B9A` | `--border-dashed` | 245 |
| `#8a5c00` | `--warning` (nearest; see #07) | 199, 415, 418, 457 |

## Recommended prerequisite
None (uses nearest existing tokens). Soft-related to #07 for the `#8a5c00` decision — remap to `--warning` now regardless.

## Scope
UI-only, single file. No logic/schema/API change. Visual parity expected (tokens are near-exact matches).

## Touches
- src/components/RosterModal.tsx

## Source
phase4-brief.md → Item 3 (token-debt audit).

## Owner
Lindsay.

## Acceptance criteria
- [ ] All hex in the mapping replaced with the token.
- [ ] `grep -E '#[0-9A-Fa-f]{3,6}' src/components/RosterModal.tsx` returns nothing (or only justified exceptions, documented).
- [ ] `npm run build` clean; modal looks unchanged in light + dark.
