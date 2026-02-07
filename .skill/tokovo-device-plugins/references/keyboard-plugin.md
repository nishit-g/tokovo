# Keyboard Plugin

## Responsibilities
- Keyboard show/hide and typing behavior.
- Deterministic typing patterns.

## Repo Paths
- Keyboard plugin: `packages/device-keyboard/src`
- Keyboard authoring (recommended): `packages/dsl/src/v2/device-track.ts` (`keyboardShow/Type/Hide`)

## Camera + Keyboard
Keyboard anchor is device-owned and always available while the keyboard is visible:
- Anchor ID: `keyboard`
- Provided by: `packages/core/src/anchors/device-provider.ts`
