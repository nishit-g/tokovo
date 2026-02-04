# Recipes

## Add a New Camera Anchor
1. Add provider in `src/runtime/adapters/anchors.ts`.
2. Return normalized (0–1) bounds.
3. Update any docs or sample episodes that reference the anchor.

## Add Audio Rules + Sound Assets
1. Add sound files under `assets/` in the plugin package.
2. Add `assets.sounds` in `src/plugin.ts`.
3. Add `audioRules` if needed for auto-sound behaviors.

## Add Keyboard Interaction
1. Ensure device keyboard plugin is registered in runtime.
2. Emit keyboard-related TrackEvents via DSL.
3. Validate runtime behavior in studio.

## Add Notification Adapter Hooks
1. Implement `notificationAdapter` in plugin contract.
2. Register with plugin manager.
3. Validate notification formatting in runtime.

## Add Device-Dependent Layout Rule
1. Create or extend layout strategy in `src/layout/index.ts`.
2. Read device dimensions from layout context.
3. Keep logic deterministic.

## Scaling Across Camera/Layout/Renderer
1. Adjust camera scale using camera DSL or runtime events.
2. Verify layout sizes are in logical units (not pixel density).
3. Confirm renderer output scale in app runtime config.
