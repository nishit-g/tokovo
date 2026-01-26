# Issues & Gotchas: Camera V2 Cleanup

## Session Start: 2026-01-25T09:11:11.148Z

### Known Gotchas

1. **activeEffects in processors/index.ts:758** - This is a LOCAL VARIABLE (runtime filter), NOT the legacy type field. DO NOT CHANGE.

2. **dramatic preset** - Line 170 in presets.ts must be PRESERVED (actively used, 35+ refs). Delete only lines 171-173.

3. **PRESETS["documentary"] object** - Keep this (lines 109-117). Only the shot scale case statement is deprecated.

---

## Problems Encountered

(To be populated as issues arise)
