# Episode Migration + Timeline Visualization

## Context

### Original Request

User wants to:

1. Migrate 11 episode files from old camera methods to new 6-effect system
2. Build a timeline visualization UI for viewing episodes like NLE editors (Premiere Pro, DaVinci Resolve)

### Interview Summary

**Key Discussions**:

- Old methods to replace: `.animate()`, `.punchZoom()`, `.reaction()`, `.reveal()`, `.emphasize()`, `.tension()`, `.breathe()`, `.track()`, `.conversation()`
- New 6 effects: `focus`, `shake`, `reset`, `cut`, `dutchTilt`, `flash`
- Timeline should use `TrackEpisodeIR` as data source
- Use `@dnd-kit`, `framer-motion`, `PlayerRef` for timeline UI

**Research Findings**:

- 11 episode files identified with old camera methods
- Remotion provides `PlayerRef.seekTo()`, `'frameupdate'` event for sync
- `TrackEpisodeIR` contains all timing data needed for timeline
- No existing timeline UI in codebase (on roadmap)

### Metis Review

**Identified Gaps** (addressed):

- `.conversation()` span method removed from new API → User chose: Convert to multiple focus() calls
- `.animate()` x/y offset support removed → User chose: Add new pan() method
- Duration handling unclear → Will use blendStyle presets (gentle/snappy/stiff)
- Migration strategy → User chose: Wait for full API compatibility before migrating

---

## Work Objectives

### Core Objective

Extend the camera API to support all legacy use cases, migrate all 11 episode files to the new 6-effect system, then build a read-only timeline visualization component.

### Concrete Deliverables

- `packages/dsl/src/core/tracks/camera.ts` - Extended with `pan()` method
- `packages/device-camera/src/types/effects-v2.ts` - Extended with PanPayload
- 11 episode files migrated to new API
- `packages/ui/src/timeline/` - New timeline visualization component
- Timeline integrated with Remotion Player

### Definition of Done

- [x] All 4 identified bugs have regression tests that pass
- [x] Camera API extended with `pan()` method for x/y offsets
- [x] All 11 episode files migrated (0 old method references)
- [x] Episodes build without TypeScript errors
- [x] Episodes render with equivalent visual behavior
- [x] Timeline component displays tracks from TrackEpisodeIR
- [x] Timeline syncs with Player (scrub, seek, playhead)
- [x] `pnpm turbo run build` passes for all packages

### Must Have

- `pan()` method supporting x, y offset parameters
- Complete migration of all `.animate()`, `.punchZoom()`, `.reaction()`, etc. calls
- Timeline showing: Camera track, Audio track, Device/App tracks
- Player-Timeline synchronization (playhead follows current frame)

### Must NOT Have (Guardrails)

- No backward compatibility aliases for old methods
- No `.conversation()` span method restoration (use multiple focus() instead)
- No timeline editing capabilities (read-only visualization only)
- No undo/redo in timeline
- No export-to-video from timeline

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (92 tests in device-camera)
- **User wants tests**: YES (TDD for API extension)
- **Framework**: bun test / vitest

### TDD for API Extension

Each API change follows RED-GREEN-REFACTOR:

1. Write failing test for `pan()` method
2. Implement minimum code to pass
3. Refactor while keeping green

### Manual Verification for Episodes

- Build each episode: `pnpm --filter @tokovo/episodes build`
- Render in Remotion Studio to verify visual behavior
- Compare before/after if needed

---

## Task Flow

```
Phase 1: API Extension
  Task 1 (pan type) → Task 2 (pan processor) → Task 3 (pan DSL method)
                                                        ↓
Phase 2: Episode Migration
  Task 4-14 (migrate 11 episodes) [can parallelize some]
                                                        ↓
Phase 3: Timeline Visualization
  Task 15 (types) → Task 16 (hooks) → Task 17 (components) → Task 18 (integration)
```

## Parallelization

| Group | Tasks                 | Reason                    |
| ----- | --------------------- | ------------------------- |
| A     | 4, 5, 6, 7, 8         | Independent episode files |
| B     | 9, 10, 11, 12, 13, 14 | Independent episode files |

| Task | Depends On | Reason                               |
| ---- | ---------- | ------------------------------------ |
| 2    | 1          | Processor needs type definition      |
| 3    | 2          | DSL method needs processor           |
| 4-14 | 3          | Episodes need pan() method available |
| 16   | 15         | Hooks need types                     |
| 17   | 16         | Components need hooks                |
| 18   | 17         | Integration needs components         |

---

## TODOs

### Phase 1: API Extension

- [x] 1. Add PanPayload type to effects-v2.ts

  **What to do**:
  - Add `PanPayload` type to `packages/device-camera/src/types/effects-v2.ts`
  - Include: `x: number`, `y: number`, `duration?: number`, `easing?: string`
  - Add to `CameraEffectPayload` union type
  - Write test for type existence

  **Must NOT do**:
  - Do not modify existing effect types
  - Do not add payload validation yet

  **Parallelizable**: NO (foundation for Task 2, 3)

  **References**:
  - `packages/device-camera/src/types/effects-v2.ts` - Existing effect types pattern
  - `packages/device-camera/MIGRATION.md` - Effect type documentation

  **Acceptance Criteria**:
  - [ ] `PanPayload` type exported from effects-v2.ts
  - [ ] Type includes x, y, duration, easing fields
  - [ ] `pnpm --filter @tokovo/device-camera build` passes

  **Commit**: YES
  - Message: `feat(device-camera): add PanPayload type for x/y offset support`
  - Files: `packages/device-camera/src/types/effects-v2.ts`

---

- [x] 2. Implement Pan effect processor

  **What to do**:
  - Create `packages/device-camera/src/brain/effects/pan.ts`
  - Implement `processPan(payload, state, viewport)` function
  - Apply x/y offsets to camera transform
  - Support optional duration and easing
  - Write unit tests

  **Must NOT do**:
  - Do not modify CameraBrain directly (use composition)
  - Do not break existing effects

  **Parallelizable**: NO (depends on Task 1)

  **References**:
  - `packages/device-camera/src/brain/effects/focus.ts` - Effect processor pattern
  - `packages/device-camera/src/brain/effects/index.ts` - Effect registration
  - `packages/device-camera/src/__tests__/effects/` - Test patterns

  **Acceptance Criteria**:
  - [ ] `processPan` function exported
  - [ ] Applies x offset to camera x position
  - [ ] Applies y offset to camera y position
  - [ ] Supports duration parameter
  - [ ] Unit tests pass: `pnpm --filter @tokovo/device-camera test`

  **Commit**: YES
  - Message: `feat(device-camera): implement pan effect processor`
  - Files: `packages/device-camera/src/brain/effects/pan.ts`, tests

---

- [x] 3. Add pan() method to CameraPointBuilder

  **What to do**:
  - Add `pan(x, y, options?)` method to `CameraPointBuilder`
  - Options: `{ duration?: string, easing?: string }`
  - Emit `CAMERA.PAN` event with PanPayload
  - Update reducer to handle PAN events

  **Must NOT do**:
  - Do not add span-based pan (point method only)
  - Do not add aliases

  **Parallelizable**: NO (depends on Task 2)

  **References**:
  - `packages/dsl/src/core/tracks/camera.ts` - CameraPointBuilder (lines 20-80)
  - `packages/device-camera/src/reducer.ts` - Event handling

  **Acceptance Criteria**:
  - [ ] `cam.at("1s").pan(50, -30)` compiles without error
  - [ ] `cam.at("1s").pan(50, -30, { duration: "0.5s" })` works
  - [ ] DSL build passes: `pnpm --filter @tokovo/dsl build`
  - [ ] Integration test: pan event flows through system

  **Commit**: YES
  - Message: `feat(dsl): add pan() method to camera API`
  - Files: `packages/dsl/src/core/tracks/camera.ts`, reducer

---

### Phase 2: Episode Migration

- [x] 4. Migrate smart-camera-demo.episode.ts

  **What to do**:
  - Replace `.reaction(anchor)` → `.focus(anchor, { blendStyle: "snappy" })`
  - Replace `.reveal(anchor)` → `.focus(anchor, { blendStyle: "gentle" })`
  - Replace `.emphasize(anchor)` → `.focus(anchor, { targetFill: 1.05 })`
  - Replace `.tension()` → `.dutchTilt() + .shake()`
  - Replace `.breathe()` → `.reset({ blendStyle: "gentle" })`
  - Replace `.conversation([anchors])` → Multiple timed `.focus()` calls

  **Must NOT do**:
  - Do not restore .conversation() method
  - Do not add new features

  **Parallelizable**: YES (with 5-8)

  **References**:
  - `packages/device-camera/MIGRATION.md` - Full mapping guide
  - Current file: `packages/episodes/src/production/smart-camera-demo.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.reaction`, `.reveal`, `.emphasize`, `.tension`, `.breathe`, `.conversation` calls remain
  - [ ] File builds: `pnpm --filter @tokovo/episodes build`
  - [ ] Renders in Remotion Studio without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate smart-camera-demo to new camera API`
  - Files: `packages/episodes/src/production/smart-camera-demo.episode.ts`

---

- [x] 5. Migrate camera-showcase.episode.ts

  **What to do**:
  - Replace `.punchZoom()` → `.focus(anchor, { blendStyle: "snappy" })`
  - Replace `.animate({ scale })` → `.focus("viewport", { targetFill: scale })`

  **Must NOT do**:
  - Do not modify non-camera code

  **Parallelizable**: YES (with 4, 6-8)

  **References**:
  - `packages/device-camera/MIGRATION.md`
  - Current file: `packages/episodes/src/production/camera-showcase.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.punchZoom`, `.animate` calls remain
  - [ ] File builds without errors
  - [ ] Visual behavior preserved

  **Commit**: YES
  - Message: `refactor(episodes): migrate camera-showcase to new camera API`
  - Files: `packages/episodes/src/production/camera-showcase.episode.ts`

---

- [x] 6. Migrate track-demo.episode.ts

  **What to do**:
  - Replace `.animate()` → `.focus()` with appropriate options
  - Replace `.track(anchor)` → `.focus(anchor)` (continuous focus)
  - Replace `.set()` → `.cut()` if present

  **Parallelizable**: YES (with 4, 5, 7, 8)

  **References**:
  - `packages/device-camera/MIGRATION.md`
  - Current file: `packages/episodes/src/production/track-demo.episode.ts`

  **Acceptance Criteria**:
  - [ ] No old camera methods remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate track-demo to new camera API`
  - Files: `packages/episodes/src/production/track-demo.episode.ts`

---

- [x] 7. Migrate feature-showcase.episode.ts

  **What to do**:
  - Replace 5 `.animate()` calls → `.focus()` or `.pan()` as appropriate
  - If `.animate()` has x/y → use new `.pan()` method
  - If `.animate()` has only scale → use `.focus()`

  **Parallelizable**: YES (with 4-6, 8)

  **References**:
  - `packages/device-camera/MIGRATION.md`
  - Current file: `packages/episodes/src/production/feature-showcase.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate feature-showcase to new camera API`
  - Files: `packages/episodes/src/production/feature-showcase.episode.ts`

---

- [x] 8. Migrate bakchodi-bros.episode.ts

  **What to do**:
  - Replace 8 `.animate()` calls
  - Use `.pan(x, y)` for calls with x/y offsets
  - Use `.focus()` for scale-only calls

  **Parallelizable**: YES (with 4-7)

  **References**:
  - `packages/device-camera/MIGRATION.md`
  - Current file: `packages/episodes/src/production/bakchodi-bros.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate bakchodi-bros to new camera API`
  - Files: `packages/episodes/src/production/bakchodi-bros.episode.ts`

---

- [x] 9. Migrate ghibli-showcase.episode.ts

  **What to do**:
  - Replace 2 `.animate()` calls → `.focus()` or `.pan()`

  **Parallelizable**: YES (with 10-14)

  **References**:
  - `packages/device-camera/MIGRATION.md`
  - Current file: `packages/episodes/src/production/ghibli-showcase.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate ghibli-showcase to new camera API`
  - Files: `packages/episodes/src/production/ghibli-showcase.episode.ts`

---

- [x] 10. Migrate notification-demo.episode.ts

  **What to do**:
  - Replace 4 `.animate()` calls → `.focus()` or `.pan()`

  **Parallelizable**: YES (with 9, 11-14)

  **References**:
  - Current file: `packages/episodes/src/production/notification-demo.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate notification-demo to new camera API`
  - Files: `packages/episodes/src/production/notification-demo.episode.ts`

---

- [x] 11. Migrate cyberpunk-showcase.episode.ts

  **What to do**:
  - Replace 2 `.animate()` calls → `.focus()` or `.pan()`

  **Parallelizable**: YES (with 9, 10, 12-14)

  **References**:
  - Current file: `packages/episodes/src/production/cyberpunk-showcase.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate cyberpunk-showcase to new camera API`
  - Files: `packages/episodes/src/production/cyberpunk-showcase.episode.ts`

---

- [x] 12. Migrate cheating-exposed.episode.ts

  **What to do**:
  - Replace 4 `.animate()` calls → `.focus()` or `.pan()`

  **Parallelizable**: YES (with 9-11, 13-14)

  **References**:
  - Current file: `packages/episodes/src/production/cheating-exposed.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate cheating-exposed to new camera API`
  - Files: `packages/episodes/src/production/cheating-exposed.episode.ts`

---

- [x] 13. Migrate test.episode.ts

  **What to do**:
  - Replace 2 `.animate()` calls → `.focus()` or `.pan()`

  **Parallelizable**: YES (with 9-12, 14)

  **References**:
  - Current file: `packages/episodes/src/tests/test.episode.ts`

  **Acceptance Criteria**:
  - [ ] No `.animate()` calls remain
  - [ ] File builds without errors

  **Commit**: YES
  - Message: `refactor(episodes): migrate test.episode to new camera API`
  - Files: `packages/episodes/src/tests/test.episode.ts`

---

- [x] 14. Verify all episode migrations complete

  **What to do**:
  - Run grep to confirm no old methods remain across all episodes
  - Build entire episodes package
  - Render-test at least 3 episodes in Remotion Studio

  **Parallelizable**: NO (final verification)

  **References**:
  - All migrated episode files

  **Acceptance Criteria**:
  - [ ] `grep -r "\.animate\|\.punchZoom\|\.reaction\|\.reveal\|\.emphasize\|\.tension\|\.breathe\|\.conversation\|\.track" packages/episodes/src/ --include="*.ts"` returns 0 results
  - [ ] `pnpm --filter @tokovo/episodes build` passes
  - [ ] 3+ episodes render correctly in Remotion Studio

  **Commit**: NO (verification only)

---

### Phase 3: Timeline Visualization

- [x] 15. Create timeline types and data structures

  **What to do**:
  - Create `packages/ui/src/timeline/types.ts`
  - Define `TimelineTrack`, `TimelineItem`, `TimelineState` types
  - Create utility to transform `TrackEpisodeIR` → timeline data

  **Must NOT do**:
  - Do not add editing capabilities
  - Do not couple tightly to specific episode format

  **Parallelizable**: NO (foundation for 16-18)

  **References**:
  - `packages/ir/src/v2/episode-ir.ts` - TrackEpisodeIR structure
  - `packages/ir/src/v2/track-event.ts` - Event types

  **Acceptance Criteria**:
  - [ ] Types exported from `packages/ui/src/timeline/types.ts`
  - [ ] Transform function: `episodeToTimeline(ir: TrackEpisodeIR): TimelineState`
  - [ ] Types cover: Camera, Audio, Device, App tracks

  **Commit**: YES
  - Message: `feat(ui): add timeline types and data structures`
  - Files: `packages/ui/src/timeline/types.ts`

---

- [x] 16. Create useTimeline hooks

  **What to do**:
  - Create `packages/ui/src/timeline/hooks/useCurrentPlayerFrame.ts`
  - Create `packages/ui/src/timeline/hooks/useTimelineZoom.ts`
  - Use `useSyncExternalStore` pattern for frame sync

  **Parallelizable**: NO (depends on Task 15)

  **References**:
  - Remotion docs: `useSyncExternalStore` pattern for Player sync
  - `@remotion/player` PlayerRef API

  **Acceptance Criteria**:
  - [ ] `useCurrentPlayerFrame(playerRef)` returns current frame
  - [ ] `useTimelineZoom()` returns zoom level and setZoom
  - [ ] No re-renders on parent component when frame updates

  **Commit**: YES
  - Message: `feat(ui): add timeline synchronization hooks`
  - Files: `packages/ui/src/timeline/hooks/*.ts`

---

- [x] 17. Build timeline components

  **What to do**:
  - Create `Timeline.tsx` - main container
  - Create `TimelineTrack.tsx` - single track row
  - Create `TimelineItem.tsx` - event/span on track
  - Create `Playhead.tsx` - current frame indicator
  - Create `ZoomControls.tsx` - zoom slider
  - Style with Tailwind CSS

  **Must NOT do**:
  - No drag-drop editing (read-only)
  - No item selection/modification

  **Parallelizable**: NO (depends on Task 16)

  **References**:
  - Remotion building-a-timeline guide
  - `@dnd-kit` patterns (for future editing)
  - Tailwind CSS

  **Acceptance Criteria**:
  - [ ] Components render without errors
  - [ ] Tracks display horizontally stacked
  - [ ] Items positioned by `at` frame, sized by `duration`
  - [ ] Playhead moves with current frame
  - [ ] Zoom controls scale timeline view

  **Commit**: YES
  - Message: `feat(ui): build timeline visualization components`
  - Files: `packages/ui/src/timeline/*.tsx`

---

- [x] 18. Integrate timeline with Player

  **What to do**:
  - Create `EpisodeEditor.tsx` wrapper component
  - Integrate `Player` with `Timeline`
  - Click-to-seek on timeline
  - Sync playhead with Player frame

  **Parallelizable**: NO (final integration)

  **References**:
  - `@remotion/player` documentation
  - Existing `packages/renderer/src/EpisodeRenderer.tsx`

  **Acceptance Criteria**:
  - [ ] Timeline + Player render side by side
  - [ ] Clicking timeline seeks Player to that frame
  - [ ] Playhead follows Player current frame
  - [ ] Zoom affects timeline scale
  - [ ] Tracks show episode events correctly

  **Commit**: YES
  - Message: `feat(ui): integrate timeline with Remotion Player`
  - Files: `packages/ui/src/timeline/EpisodeEditor.tsx`

---

## Commit Strategy

| After Task | Message                                        | Files              | Verification |
| ---------- | ---------------------------------------------- | ------------------ | ------------ |
| 1          | `feat(device-camera): add PanPayload type`     | effects-v2.ts      | build        |
| 2          | `feat(device-camera): implement pan processor` | pan.ts, tests      | test         |
| 3          | `feat(dsl): add pan() method`                  | camera.ts, reducer | build        |
| 4-13       | `refactor(episodes): migrate X to new API`     | episode files      | build        |
| 15-18      | `feat(ui): timeline components`                | timeline/\*.ts(x)  | build        |

---

## Success Criteria

### Verification Commands

```bash
# Verify no old camera methods remain
grep -r "\.animate\|\.punchZoom\|\.reaction" packages/episodes/src/ --include="*.ts"
# Expected: no results

# Build all packages
pnpm turbo run build
# Expected: all pass

# Run device-camera tests
pnpm --filter @tokovo/device-camera test
# Expected: all pass

# Type check
pnpm turbo run typecheck
# Expected: no errors
```

### Final Checklist

- [x] pan() method available in camera API
- [x] 0 old camera method references in episodes
- [x] All 11 episodes build successfully
- [x] Timeline component renders tracks
- [x] Timeline syncs with Player
- [x] All builds pass
- [x] All tests pass
