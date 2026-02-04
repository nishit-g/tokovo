---
name: tokovo-device-plugins
description: Device plugin wiring for Tokovo, including device registries, camera/keyboard/notifications/audio plugins, device profiles, pixel density, and scaling. Use when integrating device systems or debugging device-level behaviors.
---

# Tokovo Device Plugins

## Overview
Wire and validate device-level plugins and registries (camera, keyboard, notifications, audio). Use this skill to ensure device systems are registered, scaled correctly, and aligned with WorldState.

## Quick Start
1. Register device plugins in app runtime (`apps/video-runner/src/runtime.ts`, `packages/studio/src/runtime.ts`).
2. Confirm device registries exist and devices are created in episodes.
3. Validate pixel density and screen dimensions for scaling.

## Device Checkpoints
- **Registries**: devices + engine registries must be initialized.
- **Plugins**: camera/keyboard/notifications/audio must be registered.
- **Scaling**: respect pixel density and layout units.

## Decision Tree
- Need registry wiring? See `references/device-registries.md`.
- Need camera plugin guidance? See `references/camera-plugin.md`.
- Need keyboard guidance? See `references/keyboard-plugin.md`.
- Need notification guidance? See `references/notifications-plugin.md`.
- Need audio routing? See `references/audio-plugin.md`.
- Need scaling details? See `references/device-profiles-and-scaling.md`.

## References
- `references/device-registries.md`
- `references/camera-plugin.md`
- `references/keyboard-plugin.md`
- `references/notifications-plugin.md`
- `references/audio-plugin.md`
- `references/device-profiles-and-scaling.md`
- `references/assets-and-config.md`
- `references/maintenance-checklist.md`
