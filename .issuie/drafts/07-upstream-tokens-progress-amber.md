<!-- title: [Tiny Wire] Decide tokens for progress-bar gradient + dark-amber text -->
<!-- labels: chore, ds:candidate, area:design-system, P3, owner:Lindsay -->
<!-- repo: LinzLos/tiny-wire (cross-repo / vendor) -->

## Description
Two consumer hex values have **no exact Tiny Wire token**. Decide upstream (in the vendor) whether to add tokens or bless a nearest-existing mapping, so the consumer debt issues (#04, #06, #03) can bind to a real token instead of a remap-by-eye.

1. **Progress-bar gradient** `#bfc7d4 → #8195b5` (cobalt-tinted) — reinvented in shift `QueueMonitor` + `Roster`. Candidate: add `--progress-from` / `--progress-to`, or map to `--cobalt-200` / `--cobalt-400`.
2. **Dark-amber text** `#8a5c00` — used in `RosterModal`. Candidate: confirm `--warning` (`--clay-600` #9A6B33) is close enough, or add a dedicated darker-amber text token.

## Why
Per CONTRIBUTING, a value that doesn't exist yet must be added as a **token** in the vendor (both light + dark), never inlined into the vendored `tokens.css` in a consumer. This keeps every consumer in sync.

## Recommended prerequisite
None. Blocks the gradient/amber lines of #03, #04, #06 only if we choose "add token" over "remap to nearest."

## Scope
Vendor-side token decision (cross-repo). If "add token": edit `tiny-wire/lib/tokens.css` light + dark, bump VERSION, changelog, then re-sync consumers. If "remap": just bless the nearest token and close.

## Touches
- tiny-wire/lib/tokens.css (shared, cross-repo — vendor source of truth)
- tiny-wire/CHANGELOG.md (cross-repo)

## Source
phase4-brief.md → Item 3 (two no-exact-token values).

## Owner
Lindsay.

## Acceptance criteria
- [ ] Decision recorded: add-token vs remap-to-nearest, for each of the two values.
- [ ] If add-token: tokens defined in both themes, VERSION + CHANGELOG updated, consumers re-synced.
- [ ] #03 / #04 / #06 unblocked with a definitive token to use.
