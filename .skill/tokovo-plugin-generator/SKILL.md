---
name: tokovo-plugin-generator
description: Create or update Tokovo app plugins using the turbo generator templates. Use when scaffolding new app plugins, refreshing generator outputs, or aligning plugin code and docs with the current Tokovo architecture.
---

# Tokovo Plugin Generator

## Overview
Scaffold Tokovo app plugins with the turbo generator, then align the output with Tokovo's architecture, determinism rules, and type registries. Use this skill to build new plugins, keep generator output in sync, and maintain docs accuracy.

Also use this skill for **feature plugins** (system-level reducers like `OVERLAY`) when you need global behavior that is not app-scoped.

## Always Read First
- Tokovo invariants: `../tokovo-core-architecture/references/v1-invariants.md`

## Quick Start
1. Run `pnpm turbo gen plugin` and answer prompts.
2. Review generated package under `packages/apps-<name>`.
3. Register the plugin in `apps/video-runner/src/runtime.ts`.
4. Run tests: `pnpm test --filter=@tokovo/apps-<name>`.
5. If episodes import the plugin, add `@tokovo/apps-<name>` to `packages/episodes/package.json` dependencies.
6. After UI/state changes, rebuild: `pnpm run build --filter=@tokovo/apps-<name>` and `pnpm run build --filter=@tokovo/episodes`.

## Architecture Checkpoints (Always Enforce)
- **Determinism**: No `Date.now()`/`Math.random()` in DSL, lowering, reducers, or runtime.
- **Pipeline**: DSL → Track → Lowering → Runtime → Reducer → WorldState → UI → Anchors.
- **Plugin contract**: `id`, `displayName`, `reducer`, `views`, `createInitialState`, `v2Lowering`, `layouts`, `anchors`, `eventKinds`.
- **Type registries**: module augmentation for app state + track events + event kinds.
- **Feature plugins**: if behavior is global (not app-scoped), prefer `registries.reducers.registerFeatureReducer("<KIND>", ...)` and register in runtime.

## UI + State Gotchas (Common Failures)
- **AppSurface sizing**: Render inside a full-height wrapper (`height: 100%`) instead of `100vh`, or the app surface may collapse and appear black.
- **Safe areas**: Apply `safeAreaInsets` padding (top/bottom) so content doesn’t hide under status bar or home indicator.
- **State guards**: Reducers should defensively initialize arrays (`users`, `tweets`, `timeline`, etc.) to avoid `undefined.find` crashes at frame 0.
- **Status bar theme**: Set `statusBarTheme: "dark"` in app state for dark UIs so status bar icons are visible.

## Decision Tree
- Need a new plugin scaffold? Use the generator and follow Quick Start.
- Need global behavior (not an app)? Build a feature plugin (example: `@tokovo/overlay`) and register it in runtime.
- Adding new events? Update types + module augmentation + eventKinds + lowering.
- Camera framing issue? Prefer `anchorProvider` (pixel-space `Rect` anchors) and verify rects against device viewport.
- Scaling issue? Check camera scale, device pixel density, layout sizing, and renderer scale.

## References (Exhaustive Detail)
- `references/architecture.md`
- `references/generator-templates.md`
- `references/patterns-and-anti-patterns.md`
- `references/maintenance-checklist.md`
- `references/qa-and-testing.md`
- `references/recipes.md`
- `references/system-deep-dives.md`
