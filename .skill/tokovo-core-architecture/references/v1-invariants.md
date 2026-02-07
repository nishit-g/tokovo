# Tokovo v1 Invariants (Non-Negotiable)

This file is intentionally short. If you break any item here, you get:
- flaky previews/renders
- camera fallback bugs
- “works on my machine” builds
- episode authors rage-quitting

## 1) Determinism
- No `Date.now()` / `Math.random()` in:
  - DSL authoring
  - lowering
  - reducers (app or feature)
  - renderer logic
- IDs must be derived from frame + declaration order when auto-generated.

## 2) The Only Source Of Truth Is WorldState
- UI renders only from `WorldState` (no hidden registries as state).
- Camera/anchors are resolved from provider snapshots built from `WorldState` + `layout`.

## 3) Anchors (Coordinate System + Ownership)
- Preferred anchor system: `AnchorProvider` returns **pixel-space `Rect`** in device viewport coordinates.
- Anchor IDs used by creators are **plain strings** (`"lastMessage"`, `"tweet_card"`, `"keyboard"`).
- Device-owned anchors are official and must work across apps:
  - `device`, `app`, `keyboard`, `dynamicIsland`, `notification_banner`
- Device-owned anchors are provided by `app_device` and merged into all app snapshots.

Repo paths:
- Types: `packages/core/src/types/anchor.ts`
- Device provider: `packages/core/src/anchors/device-provider.ts`
- Merge behavior: `packages/core/src/anchors/registry.ts`

## 4) Event Routing
- App events route by `eventKinds` (unique per plugin).
- System kinds are not routed via `eventKinds` (built-ins / feature reducers), including:
  - `DEVICE`, `CAMERA`, `AUDIO`, `VOICE`, `OS`, `CALL`, `KEYBOARD`, `OVERLAY`

Repo path:
- Engine dispatch: `packages/core/src/engine.ts`

## 5) Feature Plugins vs App Plugins
- If the behavior is global (not app-scoped), it is a **feature reducer**:
  - `registries.reducers.registerFeatureReducer("<KIND>", ...)`
- Example: overlays are `OVERLAY` feature reducer (`@tokovo/overlay`), not an app.

## 6) Creator DX (Blessed Import)
- Prefer `import { episode } from "@tokovo/creator"`.
- Avoid exposing `getOrder` / track factory boilerplate in docs/examples.

## 7) Release Gate
- `pnpm --filter video-runner test` is your canary:
  - includes smoke suite
  - catches anchor fallbacks and missing plugin wiring early

