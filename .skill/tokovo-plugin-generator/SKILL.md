---
name: tokovo-plugin-generator
description: Create or update Tokovo app plugins using the turbo generator templates. Use when scaffolding new app plugins, refreshing generator outputs, or aligning plugin code and docs with the current Tokovo architecture.
---

# Tokovo Plugin Generator

## Overview
Scaffold Tokovo app plugins with the turbo generator, then align the output with Tokovo's architecture, determinism rules, and type registries. Use this skill to build new plugins, keep generator output in sync, and maintain docs accuracy.

## Quick Start
1. Run `pnpm turbo gen plugin` and answer prompts.
2. Review generated package under `packages/apps-<name>`.
3. Register the plugin in `apps/video-runner/src/runtime.ts` and `packages/studio/src/runtime.ts`.
4. Run tests: `pnpm test --filter=@tokovo/apps-<name>`.

## Architecture Checkpoints (Always Enforce)
- **Determinism**: No `Date.now()`/`Math.random()` in DSL, lowering, reducers, or runtime.
- **Pipeline**: DSL → Track → Lowering → Runtime → Reducer → WorldState → UI → Anchors.
- **Plugin contract**: `id`, `displayName`, `reducer`, `views`, `createInitialState`, `v2Lowering`, `layouts`, `anchors`, `eventKinds`.
- **Type registries**: module augmentation for app state + track events + event kinds.

## Decision Tree
- Need a new plugin scaffold? Use the generator and follow Quick Start.
- Adding new events? Update types + module augmentation + eventKinds + lowering.
- Camera framing issue? Update anchors and verify normalized bounds.
- Scaling issue? Check camera scale, device pixel density, layout sizing, and renderer scale.

## References (Exhaustive Detail)
- `references/architecture.md`
- `references/generator-templates.md`
- `references/patterns-and-anti-patterns.md`
- `references/maintenance-checklist.md`
- `references/qa-and-testing.md`
- `references/recipes.md`
- `references/system-deep-dives.md`
