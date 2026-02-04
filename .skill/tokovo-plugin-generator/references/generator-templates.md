# Generator Templates Reference

This file maps each generated file to its architectural role and the systems it affects.

## Generated Structure Map
- `src/plugin.ts`
  - Plugin contract: id, views, reducer, eventKinds, lowering, layouts, anchors
- `src/index.ts`
  - Barrel exports for plugin, types, runtime, DSL
- `src/dsl/index.ts`
  - Track builder (authoring layer)
- `src/lowering/index.ts`
  - Track → Runtime event transformation
- `src/runtime/state.ts`
  - State types + initial state
- `src/runtime/reducer.ts`
  - Immer reducer for runtime events
- `src/runtime/selectors.ts`
  - Typed state selectors
- `src/runtime/adapters/anchors.ts`
  - Anchor providers + framing defaults
- `src/layout/index.ts`
  - Layout strategy implementations (strategy pattern)
- `src/components/tokens.ts`
  - Design tokens (colors/typography/spacing)
- `src/config/theme.ts`
  - Theme wiring from tokens
- `src/ui/*`
  - UI views and components
- `src/types/events.ts`
  - Track event and payload typings
- `src/types/module-augmentation.ts`
  - `@tokovo/ir` + `@tokovo/core` registries
- `src/types/index.ts`
  - Types barrel + augmentation side effect
- `src/__tests__/*`
  - Reducer and selector tests

## Determinism Checklist
- No `Date.now()` or `Math.random()` in DSL/lowering/reducer/runtime/tests.
- IDs default to `(frame, _declarationOrder)`.
- Timestamps derive from `event.at` or explicit payload values.

## System Coverage Checklist
- Anchors exist at `src/runtime/adapters/anchors.ts`.
- Layout strategy exists at `src/layout/index.ts`.
- Tokens + theme exist at `src/components/tokens.ts` and `src/config/theme.ts`.
- Module augmentation exists at `src/types/module-augmentation.ts`.
- `eventKinds` are defined in `src/plugin.ts`.

## Generator Sync Notes
If any of these systems change in core (camera, layout, audio, notifications, keyboard, devices, scaling), update:
- Templates under `turbo/generators/templates/plugin`.
- The docs in `apps/docs` that describe plugin architecture.
