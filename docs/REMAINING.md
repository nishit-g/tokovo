# Tokovo - Remaining Work

> **Honest tracking of what's NOT done yet.**

---

## Critical Issues (Must Fix)

| Issue | Location | Impact |
|-------|----------|--------|
| WhatsApp plugin type error | `Root.tsx:26` | TypeScript error in IDE |
| Legacy episodes crash | `episodes/src/legacy/` | V1 files crash on import |

---

## Packages Not V2 Ready

| Package | Status | What's Needed |
|---------|--------|---------------|
| `@tokovo/apps-twitter` | ⚠️ Needs migration | V2 lowering, TrackBuilder |
| `@tokovo/apps-phone` | ⚠️ Incomplete | V2 lowering, full reducer |
| `@tokovo/device-keyboard` | ⚠️ Partial | Integration tests |
| `@tokovo/app-kit` | ⚠️ Scaffolding | Needs actual use |
| `@tokovo/devices` | ⚠️ Needs cleanup | Remove unused profiles |

---

## Code Cleanup Needed

| Location | Action |
|----------|--------|
| `packages/episodes/src/legacy/` | Delete (3 V1 episodes) |
| `docs-v2/` | Delete after docs-v3 complete |
| V1 DSL code | Remove from @tokovo/dsl |
| Legacy compiler | Remove from @tokovo/compiler |

---

## Missing Tests

| Package | Tests Needed |
|---------|-------------|
| `@tokovo/dsl` | Track builder tests |
| `@tokovo/compiler` | V2 lowering tests |
| `@tokovo/core` | Reducer composition tests |
| `@tokovo/renderer` | Component tests |

---

## Documentation Needed

| Doc | Status |
|-----|--------|
| packages/ir.md | In progress |
| packages/core.md | Pending |
| packages/dsl.md | Pending |
| packages/compiler.md | Pending |
| packages/renderer.md | Pending |
| packages/apps-whatsapp.md | Pending |
| packages/episodes.md | Pending |
| guides/*.md | Pending |
| ARCHITECTURE.md | Pending |

---

## Features Not Implemented

| Feature | Notes |
|---------|-------|
| Multi-device episodes | DSL supports, not tested |
| Video export CI | Manual only |
| Plugin hot-reload | Would be nice |
| Episode previews | Thumbnails |

---

## Quick Wins

1. `rm -rf packages/episodes/src/legacy/` - Delete crashy V1 episodes
2. Fix Root.tsx type by casting WhatsApp plugin
3. Add `// @ts-expect-error` for known issues temporarily
