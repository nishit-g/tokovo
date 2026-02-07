# System Deep Dives

This reference provides exhaustive guidance for the core systems that app plugins interact with.

## 1) Camera System
- **DSL**: Use camera track builders (see `packages/dsl/src/v2/camera-track.ts`).
- **Scale/Zoom**: Use `scale` fields in camera events or DSL helpers. Keep values consistent with layout and device scale.
- **Anchors**: Prefer `AnchorProvider` (pixel-space `Rect` anchors). Device-owned anchors are merged into every snapshot.
- **Transforms**: Camera state lives in `WorldState.camera` (see `packages/core/src/types/camera.ts`).

## 2) Tokens and Theme System
- **Tokens**: `src/components/tokens.ts` defines colors, typography, spacing.
- **Theme**: `src/config/theme.ts` composes theme from tokens.
- **Usage**: UI components should consume tokens/theme rather than hard-coded values.

## 3) Audio System
- **Assets**: Register sounds in `plugin.assets.sounds`.
- **Rules**: Use `audioRules` in plugin contract when auto-sounds are needed.
- **State**: Audio state is in `WorldState.audio` (`packages/core/src/types/audio.ts`).

## 4) Notifications System
- **Adapter**: Provide `notificationAdapter` in the plugin contract when custom formatting is required.
- **Registration**: Registered through plugin manager and notification registries.

## 5) Keyboard System
- **Device plugin**: Ensure keyboard plugin is registered in runtime.
- **DSL**: Use keyboard device DSL builders if needed.
- **Runtime**: Events flow through device registries and handlers.

## 6) Device System
- **Registries**: Device registries handle device state and profiles.
- **Profiles**: Device dimensions and pixel density live in device profiles.
- **State**: Device state stored in `WorldState.devices`.

## 7) Scaling (All Topics)
- **Camera scale**: Camera DSL and events control visual zoom.
- **Layout scale**: Layout strategies should use logical units and avoid mixing pixel density.
- **Device scale**: Pixel density and screen dimensions are device properties.
- **Renderer scale**: Output scale lives in runtime renderer config (see `apps/video-runner` render scale logic).

## 8) Static Things (Assets + Config + Caching)
- **Assets**: Register icons/sounds/images in plugin assets.
- **Config defaults**: TokovoConfig contains default FPS and renderer settings.
- **Caching**: Ensure determinism to benefit from caching and reproducible renders.
