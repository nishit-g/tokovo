# Camera System Documentation

## Context

### Original Request

Complete comprehensive documentation for the camera system after the enterprise refactor.

### Current State

- **README.md**: Outdated (36 lines) - references old API (`animate()`)
- **MIGRATION.md**: Exists (695 lines) - migration-focused, not learning-focused
- **Architecture docs**: None exist for the new Cinemachine-inspired system
- **Source code**: 41 files with good inline comments but no external docs

### Documentation Gap Analysis

| Document           | Status                    | Action             |
| ------------------ | ------------------------- | ------------------ |
| README.md          | Outdated                  | Rewrite completely |
| Architecture guide | Missing                   | Create new         |
| API Reference      | Missing                   | Create new         |
| Examples           | Scattered in MIGRATION.md | Consolidate        |

---

## Work Objectives

### Core Objective

Create comprehensive documentation that enables developers to understand, use, and extend the camera system without reading source code.

### Concrete Deliverables

1. Updated `packages/device-camera/README.md` (~200 lines)
2. New `packages/device-camera/docs/ARCHITECTURE.md` (~300 lines)
3. New `packages/device-camera/docs/API.md` (~250 lines)

### Definition of Done

- [ ] README covers quick start, installation, basic usage
- [ ] ARCHITECTURE explains CameraBrain, VirtualCamera, BlendManager, StateMachine
- [ ] API documents all 6 effects with options and examples
- [ ] All code examples are copy-paste ready
- [ ] No references to removed features (DirectorLite, old effects)

### Must Have

- Quick start guide in README
- Architecture diagram (ASCII)
- All 6 effects documented with options
- Spring physics presets explained
- Priority system documented

### Must NOT Have

- References to DirectorLite (removed)
- References to old effects (zoom, pan, track, etc.)
- Implementation details (keep high-level)
- Duplicate content from MIGRATION.md

---

## TODOs

- [ ] 1. Rewrite README.md

  **What to do**:
  - Remove outdated content (old API references)
  - Add package description and features
  - Add installation instructions
  - Add quick start example (focus, shake, reset)
  - Add link to architecture docs
  - Add link to migration guide
  - Keep concise (~150-200 lines)

  **Must NOT do**:
  - Include full API reference (goes in API.md)
  - Include architecture details (goes in ARCHITECTURE.md)
  - Reference DirectorLite or old effects

  **Parallelizable**: YES (with 2, 3)

  **References**:
  - Current README: `packages/device-camera/README.md`
  - New type system: `packages/device-camera/src/types/brain.ts`
  - Effect processors: `packages/device-camera/src/effects/`

  **Acceptance Criteria**:
  - [ ] File updated: `packages/device-camera/README.md`
  - [ ] Contains: Installation, Quick Start, Features, Links sections
  - [ ] No references to: `animate()`, `zoom()`, `pan()`, `track()`, `director()`
  - [ ] Code examples use new API: `focus()`, `shake()`, `reset()`, `cut()`, `dutchTilt()`, `flash()`

  **Commit**: YES
  - Message: `docs(device-camera): rewrite README for new architecture`
  - Files: `packages/device-camera/README.md`

---

- [ ] 2. Create ARCHITECTURE.md

  **What to do**:
  - Create `packages/device-camera/docs/ARCHITECTURE.md`
  - Document Cinemachine-inspired design
  - Explain core components:
    - CameraBrain (orchestrator, processFrame)
    - VirtualCamera (focus target snapshots)
    - BlendManager (spring physics)
    - StateMachine (idle/live/blending)
  - Include ASCII architecture diagram
  - Explain data flow: DSL → Reducer → Brain → Transform
  - Document scrub-safety guarantee
  - Explain priority-based camera selection

  **Must NOT do**:
  - Include API usage examples (goes in API.md)
  - Copy implementation code
  - Reference DirectorLite

  **Parallelizable**: YES (with 1, 3)

  **References**:
  - CameraBrain: `packages/device-camera/src/brain/CameraBrain.ts`
  - VirtualCamera: `packages/device-camera/src/brain/VirtualCamera.ts`
  - BlendManager: `packages/device-camera/src/brain/BlendManager.ts`
  - StateMachine: `packages/device-camera/src/brain/StateMachine.ts`
  - Type definitions: `packages/device-camera/src/types/brain.ts`
  - Plan architecture notes: `.sisyphus/plans/camera-enterprise-refactor.md` (sections on data flow, state model)

  **Acceptance Criteria**:
  - [ ] File created: `packages/device-camera/docs/ARCHITECTURE.md`
  - [ ] Contains sections: Overview, Core Components, Data Flow, Scrub Safety, Priority System
  - [ ] ASCII diagram showing component relationships
  - [ ] Explains pure function model
  - [ ] ~250-350 lines

  **Commit**: YES
  - Message: `docs(device-camera): add architecture documentation`
  - Files: `packages/device-camera/docs/ARCHITECTURE.md`

---

- [ ] 3. Create API.md

  **What to do**:
  - Create `packages/device-camera/docs/API.md`
  - Document all 6 effects:
    - `focus(anchor, options?)` - anchor-based positioning
    - `shake(options)` - Perlin noise camera shake
    - `reset(options?)` - return to neutral
    - `cut()` - instant transition boundary
    - `dutchTilt(angle, options?)` - Z-axis rotation
    - `flash(options?)` - visual overlay
  - Include options interface for each effect
  - Include usage examples for each effect
  - Document spring presets (gentle, snappy, stiff, none)
  - Document common patterns (combining effects)

  **Must NOT do**:
  - Document removed effects
  - Include implementation details
  - Duplicate migration content

  **Parallelizable**: YES (with 1, 2)

  **References**:
  - Effect types: `packages/device-camera/src/types/effects-v2.ts`
  - Focus processor: `packages/device-camera/src/effects/focus.ts`
  - Shake processor: `packages/device-camera/src/effects/shake.ts`
  - Other effects: `packages/device-camera/src/effects/`
  - Migration patterns: `packages/device-camera/MIGRATION.md` (lines 500-556)

  **Acceptance Criteria**:
  - [ ] File created: `packages/device-camera/docs/API.md`
  - [ ] All 6 effects documented with: description, options table, example
  - [ ] Spring presets table included
  - [ ] Common patterns section
  - [ ] ~200-300 lines

  **Commit**: YES
  - Message: `docs(device-camera): add API reference documentation`
  - Files: `packages/device-camera/docs/API.md`

---

- [ ] 4. Update index exports (if needed)

  **What to do**:
  - Verify `packages/device-camera/src/index.ts` exports all public APIs
  - Ensure type exports are available for external consumers
  - Add any missing re-exports

  **Parallelizable**: NO (depends on reviewing 1-3)

  **References**:
  - Current index: `packages/device-camera/src/index.ts`
  - Brain types: `packages/device-camera/src/types/brain.ts`

  **Acceptance Criteria**:
  - [ ] All public types exported from package root
  - [ ] Build passes: `pnpm turbo run build --filter=@tokovo/device-camera`

  **Commit**: YES (if changes needed)
  - Message: `feat(device-camera): export public types from package root`
  - Files: `packages/device-camera/src/index.ts`

---

- [ ] 5. Mark documentation complete

  **What to do**:
  - Verify all documentation is complete
  - Update learnings.md with documentation patterns
  - Close the todo

  **Parallelizable**: NO (final step)

  **Acceptance Criteria**:
  - [ ] README.md updated
  - [ ] docs/ARCHITECTURE.md created
  - [ ] docs/API.md created
  - [ ] Build passes
  - [ ] No broken links

  **Commit**: NO

---

## Commit Strategy

| After Task | Message                                                      | Files                |
| ---------- | ------------------------------------------------------------ | -------------------- |
| 1          | `docs(device-camera): rewrite README for new architecture`   | README.md            |
| 2          | `docs(device-camera): add architecture documentation`        | docs/ARCHITECTURE.md |
| 3          | `docs(device-camera): add API reference documentation`       | docs/API.md          |
| 4          | `feat(device-camera): export public types from package root` | src/index.ts         |

---

## Success Criteria

### Final Checklist

- [ ] README is concise and up-to-date
- [ ] Architecture is documented with diagrams
- [ ] All 6 effects have API documentation
- [ ] No references to removed features
- [ ] All code examples are valid
- [ ] Build passes
