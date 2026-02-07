# Recipes

## Add a New Camera Anchor
1. Prefer adding an `anchorProvider` in your plugin contract (layout-aware).
2. Return pixel-space `Rect` anchors in device viewport coordinates.
3. Add framing entries for any new anchor IDs.
4. Update any docs or sample episodes that reference the anchor.

## Add Audio Rules + Sound Assets
1. Add sound files under `assets/` in the plugin package.
2. Add `assets.sounds` in `src/plugin.ts`.
3. Add `audioRules` if needed for auto-sound behaviors.

## Add Keyboard Interaction
1. Ensure device keyboard plugin is registered in runtime.
2. Emit keyboard-related TrackEvents via DSL.
3. Validate runtime behavior in video runner smoke suite.

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
3. Confirm your anchors are pixel-space rects in viewport coordinates (not density-scaled).
4. Confirm renderer output scale in app runtime config.
